'use strict';

const assert =
    require('node:assert/strict');

const fs =
    require('node:fs');

const vm =
    require('node:vm');

const workerSource =
    fs.readFileSync(
        'shared/atlas-subject-build-shared-worker.js',
        'utf8'
    );

const clientSource =
    fs.readFileSync(
        'shared/atlas-subject-build-worker-client.js',
        'utf8'
    );

const registrySource =
    fs.readFileSync(
        'shared/atlas-content-registry.js',
        'utf8'
    );

const runtimeChannelSource =
    fs.readFileSync(
        'shared/atlas-subject-runtime-channel.js',
        'utf8'
    );

const cloudAuthoritySource =
    fs.readFileSync(
        'shared/atlas-tutor-subjects-cloud-authority.js',
        'utf8'
    );

const requiredSurfaces = [
    'index.html',
    'compass/index.html',
    'arcade/index.html',
    'compass/subject/index.html'
];

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

    latest(type) {
        return [
            ...this.messages
        ]
            .reverse()
            .find(
                message =>
                    message.type ===
                    type
            ) || null;
    }
}

function createFakeIndexedDB(
    initial = {}
) {
    const records =
        new Map(
            Object.entries(initial)
        );

    const db = {
        objectStoreNames: {
            contains(name) {
                return (
                    name ===
                    'browser-state'
                );
            }
        },

        createObjectStore() {},

        close() {},

        transaction(
            storeName
        ) {
            assert.equal(
                storeName,
                'browser-state'
            );

            return {
                error: null,

                objectStore() {
                    return {
                        get(key) {
                            const request = {
                                result:
                                    undefined,
                                error:
                                    null,
                                onsuccess:
                                    null,
                                onerror:
                                    null
                            };

                            setTimeout(
                                () => {
                                    request.result =
                                        records.get(
                                            String(
                                                key
                                            )
                                        );

                                    request
                                        .onsuccess
                                        ?.();
                                },
                                0
                            );

                            return request;
                        }
                    };
                }
            };
        }
    };

    return {
        records,

        open(name) {
            assert.equal(
                name,
                'atlas-tutor-subjects'
            );

            const request = {
                result: db,
                error: null,
                onupgradeneeded:
                    null,
                onerror: null,
                onblocked: null,
                onsuccess: null
            };

            setTimeout(
                () =>
                    request
                        .onsuccess
                        ?.(),
                0
            );

            return request;
        }
    };
}

async function testSharedWorkerRuntime() {
    const checkpoint = {
        schemaVersion: 1,
        subjectId:
            'subject-step-nine',

        workingDraft: {
            schemaVersion: 1,
            subjectId:
                'subject-step-nine',
            document: {
                schemaVersion: 1,
                module: {
                    title:
                        'Step Nine'
                }
            }
        },

        buildState: {
            schemaVersion: 1,
            subjectId:
                'subject-step-nine',
            kind:
                'full-subject',
            completedStep:
                9
        }
    };

    const heldCheckpoint = {
        ...clone(checkpoint),
        subjectId:
            'subject-held',
        buildState: {
            ...checkpoint.buildState,
            subjectId:
                'subject-held',
            completedStep:
                6
        }
    };

    const indexedDB =
        createFakeIndexedDB({
            'build-checkpoint::subject-step-nine':
                checkpoint,
            'build-checkpoint::subject-held':
                heldCheckpoint,
            'build-checkpoint::subject-no-lock':
                {
                    ...clone(checkpoint),
                    subjectId:
                        'subject-no-lock',
                    workingDraft: {
                        ...clone(
                            checkpoint
                                .workingDraft
                        ),
                        subjectId:
                            'subject-no-lock'
                    },
                    buildState: {
                        ...clone(
                            checkpoint
                                .buildState
                        ),
                        subjectId:
                            'subject-no-lock'
                    }
                }
        });

    const heldLocks =
        new Set([
            'atlas-subject-build:subject-held'
        ]);

    const intervals = [];

    const sharedSelf = {
        indexedDB,

        navigator: {
            locks: {
                async query() {
                    return {
                        held:
                            Array.from(
                                heldLocks
                            ).map(
                                name => ({
                                    name
                                })
                            ),
                        pending: []
                    };
                }
            }
        },

        setInterval(
            callback,
            delay
        ) {
            intervals.push({
                callback,
                delay
            });

            return intervals.length;
        },

        clearInterval() {},

        setTimeout(
            callback,
            delay = 0
        ) {
            return setTimeout(
                callback,
                Math.min(
                    Number(delay) || 0,
                    5
                )
            );
        },

        clearTimeout
    };

    const context = {
        self:
            sharedSelf,
        console,
        Date,
        Promise,
        JSON,
        Map,
        Set,
        Array,
        Object,
        Number,
        String,
        Boolean,
        Math,
        Error
    };

    vm.runInNewContext(
        workerSource,
        context,
        {
            filename:
                'atlas-subject-build-shared-worker.js'
        }
    );

    assert.equal(
        typeof sharedSelf.onconnect,
        'function'
    );

    const first =
        new FakePort();

    sharedSelf.onconnect({
        ports: [first]
    });

    first.send({
        type:
            'connect',
        pageId:
            'page-one',
        surface:
            'compass'
    });

    const firstWorkerInstanceId =
        first
            .latest(
                'worker-ready'
            )
            ?.workerInstanceId;

    assert.match(
        firstWorkerInstanceId,
        /^shared-worker-/,
        'SharedWorker ready state must expose a stable runtime instance identity for navigation QA.'
    );

    first.send({
        type:
            'auth',
        userId:
            'user-one',
        accessToken:
            'short-lived-access-token',
        expiresAt:
            Math.floor(
                Date.now() /
                1000
            ) + 30
    });

    assert.equal(
        first
            .latest(
                'auth-accepted'
            )
            ?.workerInstanceId,
        firstWorkerInstanceId,
        'Every worker message must carry the runtime instance identity so a trace remains diagnostic even if its earliest worker-ready entry rolls out.'
    );

    first.send({
        type:
            'request-checkpoint',
        requestId:
            'checkpoint-1',
        subjectId:
            'subject-step-nine'
    });

    await flush();
    await flush();

    const checkpointResult =
        first.latest(
            'checkpoint-result'
        );

    assert.ok(
        checkpointResult
    );

    assert.equal(
        checkpointResult
            .checkpoint
            ?.buildState
            ?.completedStep,
        9,
        'SharedWorker must read the existing IndexedDB build checkpoint rather than inventing progress.'
    );

    first.send({
        type:
            'enqueue-subject',
        subjectId:
            'subject-step-nine'
    });

    await flush();
    await flush();

    const queued =
        first
            .latest(
                'queue-state'
            )
            .queue
            .find(
                job =>
                    job.subjectId ===
                    'subject-step-nine'
            );

    assert.equal(
        queued.status,
        'queued'
    );

    assert.equal(
        queued.completedStep,
        9
    );

    assert.equal(
        queued.lockState,
        'available'
    );

    first.send({
        type:
            'enqueue-subject',
        subjectId:
            'subject-held'
    });

    await flush();
    await flush();

    const held =
        first
            .latest(
                'queue-state'
            )
            .queue
            .find(
                job =>
                    job.subjectId ===
                    'subject-held'
            );

    assert.equal(
        held.status,
        'blocked-by-owner',
        'A page-held atlas-subject-build:<subjectId> lock must prevent worker queue ownership.'
    );

    assert.equal(
        held.lockState,
        'held'
    );

    sharedSelf.navigator.locks =
        null;

    first.send({
        type:
            'enqueue-subject',
        subjectId:
            'subject-no-lock'
    });

    await flush();
    await flush();

    const noLock =
        first
            .latest(
                'queue-state'
            )
            .queue
            .find(
                job =>
                    job.subjectId ===
                    'subject-no-lock'
            );

    assert.equal(
        noLock.status,
        'lock-unavailable',
        'SharedWorker support without a usable build lock must fail safe instead of becoming a second writer.'
    );

    const second =
        new FakePort();

    sharedSelf.onconnect({
        ports: [second]
    });

    second.send({
        type:
            'connect',
        pageId:
            'page-two',
        surface:
            'arcade'
    });

    assert.equal(
        second
            .latest(
                'worker-ready'
            )
            ?.workerInstanceId,
        firstWorkerInstanceId,
        'Two pages connected to one live SharedWorker must observe the same runtime instance identity.'
    );

    second.send({
        type:
            'auth',
        userId:
            'user-one',
        accessToken:
            'another-short-lived-token',
        expiresAt:
            Math.floor(
                Date.now() /
                1000
            ) + 30
    });

    second.send({
        type:
            'get-worker-state',
        requestId:
            'state-1'
    });

    const workerState =
        second.latest(
            'worker-state'
        );

    assert.equal(
        workerState.pageCount,
        2,
        'Two Atlas tabs must reach the same SharedWorker runtime.'
    );

    assert.equal(
        workerState.authenticated,
        true
    );

    assert.ok(
        !JSON.stringify(
            workerState
        ).includes(
            'another-short-lived-token'
        ),
        'Access tokens must remain worker-memory details and never be projected back through worker state.'
    );

    assert.equal(
        intervals[0]?.delay,
        15000
    );

    intervals[0].callback();

    assert.ok(
        first.messages.some(
            message =>
                message.type ===
                    'auth-required' &&
                message.reason ===
                    'token-expiring'
        ),
        'Expiring worker auth must request a fresh short-lived token from a connected Atlas page.'
    );

    first.send({
        type:
            'auth-clear',
        userId:
            'user-one'
    });

    assert.equal(
        second
            .latest(
                'queue-state'
            )
            .queue
            .length,
        0,
        'Explicit sign-out/account switch must clear that user\'s in-memory worker queue.'
    );

    assert.match(
        workerSource,
        /ensureGenerationDependencies\(\)/
    );

    assert.match(
        workerSource,
        /AtlasSubjectBuildRunner/
    );

    assert.match(
        workerSource,
        /BUILD_CHECKPOINT_KEY_PREFIX[\s\S]*?'build-checkpoint::'/
    );

    assert.match(
        workerSource,
        /BUILD_LOCK_PREFIX[\s\S]*?'atlas-subject-build:'/
    );
}

function createClientSandbox({
    sharedWorker = true
} = {}) {
    const windowListeners =
        new Map();

    const documentListeners =
        new Map();

    const posted = [];

    class ClientPort extends FakePort {
        postMessage(message) {
            super.postMessage(
                message
            );

            posted.push(
                clone(message)
            );
        }
    }

    const clientPort =
        new ClientPort();

    const workerCalls = [];

    function FakeSharedWorker(
        url,
        options
    ) {
        workerCalls.push({
            url,
            options
        });

        this.port =
            clientPort;
    }

    const windowObject = {
        location: {
            pathname:
                '/arcade/',
            hash: ''
        },

        crypto: {
            randomUUID() {
                return (
                    'client-page-id'
                );
            }
        },

        setInterval() {
            return 1;
        },

        clearInterval() {},

        setTimeout(
            callback
        ) {
            return setTimeout(
                callback,
                0
            );
        },

        clearTimeout,

        addEventListener(
            type,
            listener
        ) {
            if (
                !windowListeners
                    .has(type)
            ) {
                windowListeners
                    .set(
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
                ?.delete(
                    listener
                );
        },

        dispatchEvent() {
            return true;
        }
    };

    if (sharedWorker) {
        windowObject.SharedWorker =
            FakeSharedWorker;

        windowObject.AtlasAccount = {
            async initialize() {},

            getState() {
                return {
                    ready: true,
                    authenticated:
                        true,
                    userId:
                        'user-one',
                    planCode:
                        'free',
                    entitlementReady:
                        true
                };
            }
        };

        windowObject.AtlasCloud = {
            async getSession() {
                return {
                    user: {
                        id:
                            'user-one'
                    },
                    access_token:
                        'page-access-token',
                    refresh_token:
                        'must-never-cross-the-port',
                    expires_at:
                        Math.floor(
                            Date.now() /
                            1000
                        ) + 3600
                };
            }
        };
    }

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
                documentListeners
                    .set(
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
                ?.delete(
                    listener
                );
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
        sessionStorage: (() => {
            const values =
                new Map();

            return {
                getItem(key) {
                    return values.has(key)
                        ? values.get(key)
                        : null;
                },

                setItem(key, value) {
                    values.set(
                        key,
                        String(value)
                    );
                },

                removeItem(key) {
                    values.delete(key);
                }
            };
        })(),
        URLSearchParams,
        CustomEvent:
            class CustomEvent {
                constructor(
                    type,
                    options = {}
                ) {
                    this.type =
                        type;
                    this.detail =
                        options.detail;
                }
            },
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

    return {
        context,
        windowObject,
        clientPort,
        workerCalls,
        posted
    };
}

async function testWorkerClient() {
    const supported =
        createClientSandbox({
            sharedWorker: true
        });

    vm.runInNewContext(
        clientSource,
        supported.context,
        {
            filename:
                'atlas-subject-build-worker-client.js'
        }
    );

    await flush();
    await flush();

    const Client =
        supported
            .windowObject
            .AtlasSubjectBuildWorkerClient;

    assert.ok(Client);

    assert.equal(
        Client.getState()
            .authenticated,
        true
    );

    assert.equal(
        supported
            .workerCalls
            .length,
        1
    );

    assert.equal(
        supported
            .workerCalls[0]
            .url,
        '/shared/atlas-subject-build-shared-worker.js?v=20260925-buildworker15'
    );

    assert.equal(
        supported
            .workerCalls[0]
            .options
            .name,
        'atlas-subject-builds'
    );

    assert.equal(
        supported
            .workerCalls[0]
            .options
            .extendedLifetime,
        true,
        'Atlas must request extended SharedWorker lifetime so normal same-origin page navigation does not needlessly restart an in-flight subject build.'
    );

    supported.clientPort
        .onmessage({
            data: {
                type:
                    'worker-ready',
                workerVersion:
                    '20260925-buildworker15',
                workerInstanceId:
                    'shared-worker-test-instance',
                activeBuild:
                    null,
                queue: []
            }
        });

    assert.ok(
        Client
            .getDebugTrace()
            .some(
                entry =>
                    entry.stage ===
                        'worker:worker-ready' &&
                    entry.detail
                        ?.workerInstanceId ===
                        'shared-worker-test-instance'
            ),
        'Debug trace must preserve the SharedWorker runtime instance identity so same-worker navigation can be proven rather than inferred.'
    );

    const firstAuth =
        supported
            .posted
            .find(
                message =>
                    message.type ===
                    'auth'
            );

    assert.equal(
        firstAuth.accessToken,
        'page-access-token'
    );

    assert.ok(
        !Object.prototype
            .hasOwnProperty
            .call(
                firstAuth,
                'refreshToken'
            )
    );

    assert.ok(
        !JSON.stringify(
            supported.posted
        ).includes(
            'must-never-cross-the-port'
        ),
        'The page must never send a Supabase refresh token to the SharedWorker.'
    );

    supported.clientPort
        .onmessage({
            data: {
                type:
                    'auth-required',
                userId:
                    'user-one',
                reason:
                    'token-expiring',
                workerVersion:
                    '20260925-buildworker15'
            }
        });

    await flush();
    await flush();

    assert.ok(
        supported
            .posted
            .filter(
                message =>
                    message.type ===
                    'auth'
            )
            .length >= 2,
        'A worker auth-refresh request must obtain a fresh page-owned session token.'
    );

    Client.destroy();

    const unsupported =
        createClientSandbox({
            sharedWorker:
                false
        });

    vm.runInNewContext(
        clientSource,
        unsupported.context,
        {
            filename:
                'atlas-subject-build-worker-client-unsupported.js'
        }
    );

    await flush();

    const Fallback =
        unsupported
            .windowObject
            .AtlasSubjectBuildWorkerClient;

    assert.equal(
        Fallback.getState()
            .supported,
        false
    );

    assert.equal(
        Fallback.enqueueSubject(
            'subject-fallback'
        ),
        false,
        'Unsupported browsers must retain the existing page/recovery path instead of throwing.'
    );

    Fallback.destroy();
}

function testBootstrapContract() {
    assert.match(
        registrySource,
        /writeAtlasAccessBootstrapScript\(\);[\s\S]*?writeAtlasSubjectBuildWorkerClientScript\(\);/
    );

    assert.match(
        registrySource,
        /atlas-subject-build-worker-client\.js\?v=20260925-workerinstance2/
    );

    assert.match(
        registrySource,
        /ensureSubjectBuildWorkerClient:[\s\S]*?writeAtlasSubjectBuildWorkerClientScript/
    );

    assert.match(
        registrySource,
        /writeAtlasSubjectBuildWorkerClientScript\(\);[\s\S]*?writeAtlasSubjectBuildResurrectionScript\(\);/
    );

    assert.match(
        registrySource,
        /atlas-subject-build-resurrection\.js\?v=20260924-resurrection4/
    );

    requiredSurfaces.forEach(
        path => {
            const source =
                fs.readFileSync(
                    path,
                    'utf8'
                );

            assert.match(
                source,
                /atlas-content-registry\.js\?v=20260925-workerinstance2/,
                `${path} must load the shared SharedWorker bootstrap.`
            );
        }
    );

    assert.match(
        runtimeChannelSource,
        /navigator\.locks\.request[\s\S]*?`atlas-subject-build:\${id}`/
    );

    assert.match(
        cloudAuthoritySource,
        /BROWSER_STATE_DB_NAME = 'atlas-tutor-subjects'/
    );

    assert.match(
        cloudAuthoritySource,
        /BROWSER_STATE_STORE = 'browser-state'/
    );

    assert.match(
        cloudAuthoritySource,
        /writeBrowserSubjectState\([\s\S]*?'build-checkpoint'/
    );
}

(async () => {
    testBootstrapContract();

    await testSharedWorkerRuntime();
    await testWorkerClient();

    console.log(
        'Atlas SharedWorker Batch 2 foundation passed: root/Compass/Arcade/subject share one client bootstrap, two tabs reach one worker, page-owned auth supplies only short-lived access tokens, worker checkpoint reads use the existing IndexedDB journal, page-held build locks block worker queue ownership, token refresh requests return to connected pages, and unsupported browsers preserve the existing page-owned recovery path.'
    );
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
