'use strict';

const assert =
    require('node:assert/strict');

const fs =
    require('node:fs');

const vm =
    require('node:vm');

const clientSource =
    fs.readFileSync(
        'shared/atlas-subject-build-worker-client.js',
        'utf8'
    );

function clone(value) {
    return JSON.parse(
        JSON.stringify(value)
    );
}

function flush() {
    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                0
            )
    );
}

class FakePort {
    constructor() {
        this.messages = [];
        this.onmessage = null;
        this.onmessageerror = null;
        this.closed = false;
    }

    postMessage(message) {
        this.messages.push(
            clone(message)
        );
    }

    start() {}

    close() {
        this.closed = true;
    }

    send(message) {
        this.onmessage?.({
            data: message
        });
    }
}

async function testWorkerReconnectAndAccountSwitch() {
    const windowListeners =
        new Map();

    const documentListeners =
        new Map();

    const workers = [];
    const timers = [];

    let accountState = {
        ready: true,
        authenticated: true,
        userId: 'user-one',
        planCode: 'free',
        entitlementReady: true
    };

    function FakeSharedWorker(
        url,
        options
    ) {
        this.url = url;
        this.options = options;
        this.port = new FakePort();
        this.onerror = null;
        workers.push(this);
    }

    const windowObject = {
        location: {
            pathname: '/arcade/',
            hash: ''
        },

        crypto: {
            randomUUID() {
                return 'client-page-id';
            }
        },

        SharedWorker:
            FakeSharedWorker,

        AtlasAccount: {
            async initialize() {},

            getState() {
                return clone(
                    accountState
                );
            }
        },

        AtlasCloud: {
            async getSession() {
                return {
                    user: {
                        id:
                            accountState.userId
                    },
                    access_token:
                        `token-${accountState.userId}`,
                    refresh_token:
                        'must-never-cross-the-port',
                    expires_at:
                        Math.floor(
                            Date.now() /
                            1000
                        ) + 3600
                };
            }
        },

        setInterval() {
            return 1;
        },

        clearInterval() {},

        setTimeout(
            callback,
            delay
        ) {
            timers.push({
                callback,
                delay,
                cancelled:
                    false
            });

            return timers.length;
        },

        clearTimeout(id) {
            const timer =
                timers[id - 1];

            if (timer) {
                timer.cancelled =
                    true;
            }
        },

        addEventListener(
            type,
            listener
        ) {
            if (
                !windowListeners
                    .has(type)
            ) {
                windowListeners.set(
                    type,
                    new Set()
                );
            }

            windowListeners
                .get(type)
                .add(listener);
        },

        removeEventListener(
            type,
            listener
        ) {
            windowListeners
                .get(type)
                ?.delete(listener);
        },

        dispatchEvent() {
            return true;
        }
    };

    const documentObject = {
        hidden: false,
        body: {
            dataset: {}
        },

        addEventListener(
            type,
            listener
        ) {
            if (
                !documentListeners
                    .has(type)
            ) {
                documentListeners.set(
                    type,
                    new Set()
                );
            }

            documentListeners
                .get(type)
                .add(listener);
        },

        removeEventListener(
            type,
            listener
        ) {
            documentListeners
                .get(type)
                ?.delete(listener);
        }
    };

    const context = {
        window:
            windowObject,
        document:
            documentObject,
        localStorage: {
            getItem() {
                return null;
            }
        },
        CustomEvent:
            class CustomEvent {
                constructor(
                    type,
                    options = {}
                ) {
                    this.type = type;
                    this.detail =
                        options.detail;
                }
            },
        URLSearchParams,
        console,
        Date,
        Math,
        JSON,
        Promise,
        Map,
        Set,
        Object,
        Array,
        String,
        Number,
        Boolean,
        Error
    };

    vm.runInNewContext(
        clientSource,
        context,
        {
            filename:
                'atlas-subject-build-worker-client.js'
        }
    );

    await flush();
    await flush();

    const Client =
        windowObject
            .AtlasSubjectBuildWorkerClient;

    assert.equal(
        workers.length,
        1
    );

    assert.match(
        workers[0].url,
        /buildworker6/
    );

    Client.enqueueSubject(
        'subject-crash',
        {
            generationContext: {
                premise:
                    'Keep this build'
            },
            autoSaveOnComplete:
                true,
            revision:
                4
        }
    );

    workers[0].port.send({
        type:
            'worker-heartbeat',
        at:
            Date.now(),
        workerVersion:
            '20260924-buildworker6'
    });

    workers[0].onerror?.({
        type:
            'error'
    });

    const reconnectTimer =
        timers.find(
            timer =>
                timer.delay ===
                    750 &&
                timer.cancelled !==
                    true
        );

    assert.ok(
        reconnectTimer,
        'Worker crash should schedule a bounded reconnect.'
    );

    await reconnectTimer
        .callback();

    await flush();
    await flush();

    assert.equal(
        workers.length,
        2,
        'Worker crash should create a replacement SharedWorker.'
    );

    assert.equal(
        workers[0].port.closed,
        true,
        'Reconnect should close the stale MessagePort.'
    );

    assert.ok(
        Client.getState()
            .lastWorkerHeartbeat,
        'Replacement worker should start with a fresh heartbeat epoch.'
    );

    const replacementMessages =
        workers[1]
            .port
            .messages;

    assert.ok(
        replacementMessages.some(
            message =>
                message.type ===
                    'auth' &&
                message.userId ===
                    'user-one'
        ),
        'Replacement worker must be re-authenticated by the page.'
    );

    assert.ok(
        replacementMessages.some(
            message =>
                message.type ===
                    'enqueue-subject' &&
                message.subjectId ===
                    'subject-crash' &&
                message.build
                    ?.generationContext
                    ?.premise ===
                    'Keep this build'
        ),
        'Registered unfinished work must be replayed after worker loss.'
    );

    assert.ok(
        !JSON.stringify(
            replacementMessages
        ).includes(
            'must-never-cross-the-port'
        ),
        'Refresh tokens must remain page/session-owned during reconnect.'
    );

    accountState = {
        ...accountState,
        userId:
            'user-two'
    };

    windowListeners
        .get(
            'atlas:account-change'
        )
        ?.forEach(listener =>
            listener({
                detail:
                    clone(
                        accountState
                    )
            })
        );

    await flush();
    await flush();

    assert.ok(
        replacementMessages.some(
            message =>
                message.type ===
                    'auth-clear' &&
                message.userId ===
                    'user-one'
        ),
        'Account switch must clear the old worker user scope.'
    );

    assert.ok(
        replacementMessages.some(
            message =>
                message.type ===
                    'auth' &&
                message.userId ===
                    'user-two'
        ),
        'Account switch must authorize the replacement worker for the new account.'
    );

    const enqueueCountBeforeReady =
        replacementMessages.filter(
            message =>
                message.type ===
                    'enqueue-subject'
        ).length;

    workers[1].port.send({
        type:
            'worker-ready',
        queue: [],
        workerVersion:
            '20260924-buildworker6'
    });

    const enqueueCountAfterReady =
        replacementMessages.filter(
            message =>
                message.type ===
                    'enqueue-subject'
        ).length;

    assert.equal(
        enqueueCountAfterReady,
        enqueueCountBeforeReady,
        'Old-account registered builds must not replay after an account switch.'
    );

    Client.destroy();
}

(async () => {
    await testWorkerReconnectAndAccountSwitch();

    console.log(
        'Atlas SharedWorker reconnect passed: crash recovery recreates the worker, resets heartbeat age, re-authenticates with access-token-only state, replays registered unfinished work, and clears registrations across account switches.'
    );
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});