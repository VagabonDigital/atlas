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

const runnerSource =
    fs.readFileSync(
        'shared/atlas-subject-build-runner.js',
        'utf8'
    );

const structuredSource =
    fs.readFileSync(
        'shared/atlas-structured-subject.js',
        'utf8'
    );

const operationsSource =
    fs.readFileSync(
        'shared/atlas-subject-build-document-operations.js',
        'utf8'
    );

const clientSource =
    fs.readFileSync(
        'shared/atlas-subject-build-worker-client.js',
        'utf8'
    );

const loaderSource =
    fs.readFileSync(
        'compass/shared/compass-subject-loader.js',
        'utf8'
    );

const engineSource =
    fs.readFileSync(
        'compass/shared/compass-engine.js',
        'utf8'
    );

function clone(value) {
    return JSON.parse(
        JSON.stringify(value)
    );
}

function wait(ms = 0) {
    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}

async function waitUntil(
    predicate,
    {
        timeoutMs = 3000,
        stepMs = 10
    } = {}
) {
    const startedAt =
        Date.now();

    while (
        Date.now() -
            startedAt <
        timeoutMs
    ) {
        if (predicate()) {
            return true;
        }

        await wait(stepMs);
    }

    return false;
}

class FakePort {
    constructor(name) {
        this.name = name;
        this.messages = [];
        this.onmessage = null;
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

class FakeBroadcastChannel {
    constructor(name) {
        this.name = name;
        this.listeners =
            new Set();
    }

    postMessage() {}

    addEventListener(
        type,
        listener
    ) {
        if (type === 'message') {
            this.listeners.add(
                listener
            );
        }
    }
}

function createFakeIndexedDB(records) {
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
            storeName,
            mode
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
                                        clone(
                                            records
                                                .get(
                                                    String(
                                                        key
                                                    )
                                                ) ??
                                            null
                                        );

                                    request
                                        .onsuccess
                                        ?.();
                                },
                                0
                            );

                            return request;
                        },

                        put(
                            value,
                            key
                        ) {
                            assert.equal(
                                mode,
                                'readwrite'
                            );

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
                                    records.set(
                                        String(
                                            key
                                        ),
                                        clone(
                                            value
                                        )
                                    );

                                    request.result =
                                        key;

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

async function createStepSixteenCheckpoint() {
    const root = {
        crypto: {
            randomUUID() {
                root.__id =
                    (
                        root.__id ||
                        0
                    ) + 1;

                return (
                    'seed-' +
                    root.__id
                );
            }
        },
        console,
        setTimeout,
        clearTimeout
    };

    root.globalThis =
        root;

    vm.createContext(root);

    vm.runInContext(
        structuredSource,
        root
    );

    const Structured =
        root.AtlasStructuredSubject;

    const document =
        Structured
            .createBlankDocument({
                title:
                    'Foreground Handoff'
            });

    document.discussionSets = [
        Structured.createDiscussionSet({
            id:
                'set-one',
            title:
                'Set One',
            stage:
                'First Look',
            description:
                'Discussion',
            moments: [
                Structured.createMoment({
                    id:
                        'moment-one',
                    preview:
                        'A useful thought',
                    question:
                        'What do you think?'
                })
            ]
        })
    ];

    const validation =
        Structured
            .validateDocument(
                document
            );

    assert.equal(
        validation.valid,
        true,
        validation.errors?.join(
            '\n'
        )
    );

    const timestamp =
        Date.now();

    return {
        schemaVersion: 1,
        subjectId:
            'subject-handoff',

        workingDraft: {
            schemaVersion: 1,
            subjectId:
                'subject-handoff',
            ownerId:
                'local-tutor',
            format:
                'structured',
            baseRevision: 7,
            document,
            includedLiveSessionId:
                null,
            activeViewId:
                'view-discussion',
            startedAt:
                timestamp,
            updatedAt:
                timestamp
        },

        buildState: {
            schemaVersion: 1,
            subjectId:
                'subject-handoff',
            kind:
                'full-subject',
            completedStep: 16,
            autoSaveOnComplete:
                true,
            startedAt:
                timestamp,
            updatedAt:
                timestamp
        },

        updatedAt:
            timestamp
    };
}

async function testAtomicForegroundYield() {
    const checkpoint =
        await createStepSixteenCheckpoint();

    const records =
        new Map([
            [
                'build-checkpoint::subject-handoff',
                checkpoint
            ]
        ]);

    const heldLocks =
        new Set();

    const Locks = {
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
        },

        async request(
            name,
            options,
            callback
        ) {
            assert.equal(
                options.ifAvailable,
                true
            );

            if (
                heldLocks.has(name)
            ) {
                return callback(
                    null
                );
            }

            heldLocks.add(name);

            try {
                return await callback({
                    name
                });
            } finally {
                heldLocks.delete(name);
            }
        }
    };

    let releaseUpgrade = null;
    let upgradeStarted =
        false;

    const callLog = [];

    const FakeAI = {
        runtime: {},

        configureRuntime(
            next = {}
        ) {
            this.runtime = {
                ...this.runtime,
                ...next
            };

            return this;
        },

        async generateMomentUpgrade() {
            callLog.push(
                'moment-upgrade'
            );

            upgradeStarted =
                true;

            await new Promise(
                resolve => {
                    releaseUpgrade =
                        resolve;
                }
            );

            return {
                term:
                    'pinpoint',
                type:
                    'verb',
                definition:
                    'identify exactly',
                ordinary:
                    'identify it',
                upgraded:
                    'pinpoint it',
                priority:
                    'standard',
                atlasPrompt:
                    'What can you pinpoint?'
            };
        },

        async generateMakeItReal() {
            callLog.push(
                'make-it-real'
            );

            return {
                title:
                    'Try It',
                prompt:
                    'Use the idea.'
            };
        },

        async generateCulturalLensUpgrade() {
            callLog.push(
                'lens-upgrade'
            );

            return {
                term:
                    'contrast',
                type:
                    'verb',
                definition:
                    'show a difference',
                ordinary:
                    'different',
                upgraded:
                    'contrast sharply',
                priority:
                    'standard',
                atlasPrompt:
                    'What can you contrast?'
            };
        },

        async selectKeyLanguageOpportunities({
            candidates,
            limit
        }) {
            return candidates
                .slice(
                    0,
                    limit
                )
                .map(
                    item =>
                        item.id
                );
        }
    };

    const workerContext = {
        console,
        Date,
        Math,
        JSON,
        Promise,
        Map,
        Set,
        Array,
        Object,
        Number,
        String,
        Boolean,
        Error,
        AbortController,

        crypto: {
            randomUUID() {
                return (
                    'worker-' +
                    Math.random()
                        .toString(36)
                        .slice(2)
                );
            }
        },

        navigator: {
            locks: Locks
        },

        indexedDB:
            createFakeIndexedDB(
                records
            ),

        BroadcastChannel:
            FakeBroadcastChannel,

        fetch:
            async () => {
                throw new Error(
                    'Fake AI should intercept network calls.'
                );
            },

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

        clearTimeout,

        setInterval() {
            return 1;
        },

        clearInterval() {}
    };

    workerContext.self =
        workerContext;
    workerContext.globalThis =
        workerContext;

    vm.createContext(
        workerContext
    );

    workerContext.importScripts =
        (...urls) => {
            urls.forEach(
                url => {
                    if (
                        url.includes(
                            'atlas-structured-subject.js'
                        )
                    ) {
                        vm.runInContext(
                            structuredSource,
                            workerContext
                        );
                        return;
                    }

                    if (
                        url.includes(
                            'atlas-ai.js'
                        )
                    ) {
                        workerContext
                            .AtlasAI =
                            FakeAI;
                        return;
                    }

                    if (
                        url.includes(
                            'atlas-subject-build-document-operations.js'
                        )
                    ) {
                        vm.runInContext(
                            operationsSource,
                            workerContext
                        );
                        return;
                    }

                    if (
                        url.includes(
                            'atlas-subject-build-runner.js'
                        )
                    ) {
                        vm.runInContext(
                            runnerSource,
                            workerContext
                        );
                        return;
                    }

                    throw new Error(
                        'Unexpected worker dependency: ' +
                        url
                    );
                }
            );
        };

    vm.runInContext(
        workerSource,
        workerContext,
        {
            filename:
                'atlas-subject-build-shared-worker.js'
        }
    );

    const arcade =
        new FakePort(
            'arcade'
        );

    const subject =
        new FakePort(
            'subject'
        );

    workerContext.onconnect({
        ports: [arcade]
    });

    arcade.send({
        type:
            'connect',
        pageId:
            'arcade-page',
        surface:
            'arcade'
    });

    arcade.send({
        type:
            'auth',
        userId:
            'user-one',
        accessToken:
            'arcade-token'
    });

    arcade.send({
        type:
            'enqueue-subject',
        subjectId:
            'subject-handoff',
        build: {
            generationContext: {
                version: 1,
                languageLevel:
                    'b2',
                subjectSize:
                    'standard',
                languageSupport:
                    'all',
                style:
                    'balanced',
                premise:
                    'Foreground handoff'
            },
            autoSaveOnComplete:
                true,
            revision: 7
        }
    });

    assert.equal(
        await waitUntil(
            () =>
                upgradeStarted ===
                true
        ),
        true,
        'Worker did not enter the atomic enrichment AI operation.'
    );

    assert.equal(
        heldLocks.has(
            'atlas-subject-build:subject-handoff'
        ),
        true
    );

    workerContext.onconnect({
        ports: [subject]
    });

    subject.send({
        type:
            'connect',
        pageId:
            'subject-page',
        surface:
            'compass-subject'
    });

    subject.send({
        type:
            'auth',
        userId:
            'user-one',
        accessToken:
            'subject-token'
    });

    subject.send({
        type:
            'request-foreground-ownership',
        requestId:
            'foreground-1',
        subjectId:
            'subject-handoff',
        reason:
            'subject-open'
    });

    assert.ok(
        subject.latest(
            'foreground-yield-pending'
        ),
        'Foreground request should be acknowledged while an atomic AI operation is in flight.'
    );

    await wait(20);

    assert.equal(
        subject.latest(
            'foreground-granted'
        ),
        null,
        'Worker must not grant foreground ownership before the current atomic AI operation finishes.'
    );

    releaseUpgrade();

    assert.equal(
        await waitUntil(
            () =>
                Boolean(
                    subject.latest(
                        'foreground-granted'
                    )
                )
        ),
        true,
        'Worker did not yield to the foreground page.'
    );

    assert.equal(
        heldLocks.has(
            'atlas-subject-build:subject-handoff'
        ),
        false,
        'Foreground grant must be sent only after the worker releases the canonical subject lock.'
    );

    const yieldedCheckpoint =
        records.get(
            'build-checkpoint::subject-handoff'
        );

    assert.equal(
        yieldedCheckpoint
            .buildState
            .completedStep,
        16,
        'Partial enrichment must checkpoint at the same completed runner step.'
    );

    assert.ok(
        yieldedCheckpoint
            .workingDraft
            .document
            .discussionSets[0]
            .moments[0]
            .upgrade,
        'The completed atomic AI mutation must survive the foreground handoff.'
    );

    assert.equal(
        callLog.includes(
            'make-it-real'
        ),
        false,
        'Worker must stop before beginning the next atomic enrichment operation.'
    );

    assert.equal(
        subject
            .latest(
                'foreground-granted'
            )
            .completedStep,
        16
    );

    assert.equal(
        subject
            .latest(
                'foreground-granted'
            )
            .generationContext
            .premise,
        'Foreground handoff'
    );

    /*
     * The page now owns the subject. Simulate leaving it again. Releasing the
     * foreground port must make the worker resumable; it should continue from
     * the same step without regenerating the already-checkpointed upgrade.
     */
    subject.send({
        type:
            'disconnect',
        reason:
            'page-hidden'
    });

    assert.equal(
        await waitUntil(
            () =>
                records
                    .get(
                        'build-checkpoint::subject-handoff'
                    )
                    ?.buildState
                    ?.completedStep ===
                18,
            {
                timeoutMs: 4000,
                stepMs: 10
            }
        ),
        true,
        'Leaving the foreground subject should return the unfinished build to the worker.'
    );

    assert.equal(
        callLog.filter(
            name =>
                name ===
                'moment-upgrade'
        ).length,
        1,
        'Worker resume must preserve the already-checkpointed AI upgrade.'
    );

    assert.equal(
        callLog.includes(
            'make-it-real'
        ),
        true,
        'Worker should continue the remaining enrichment after the page leaves.'
    );
}

function testBatchFourStaticContracts() {
    assert.match(
        operationsSource,
        /enrichDiscussion\(\{[\s\S]*?shouldStop = null/
    );

    assert.match(
        operationsSource,
        /enrichCulturalLens\(\{[\s\S]*?shouldStop = null/
    );

    assert.match(
        operationsSource,
        /selection-complete[\s\S]*?shouldStop\(\) === true[\s\S]*?stopped: true/
    );

    assert.match(
        workerSource,
        /requestForegroundOwnership/
    );

    assert.match(
        workerSource,
        /ATLAS_WORKER_FOREGROUND_YIELD/
    );

    assert.match(
        workerSource,
        /finalizeForegroundGrant/
    );

    assert.match(
        clientSource,
        /requestForegroundOwnership/
    );

    assert.match(
        clientSource,
        /releaseForegroundOwnership/
    );

    assert.match(
        clientSource,
        /foreground-granted/
    );

    assert.match(
        loaderSource,
        /requestForegroundBuildOwnership\([\s\S]*?installRuntimeSubject\(subject\)/
    );

    assert.match(
        loaderSource,
        /AtlasForegroundSubjectBuildHandoff/
    );

    assert.match(
        engineSource,
        /acquireMyVersionForegroundBuildHandoffLease\(\)[\s\S]*?await loadTutorContentState\(\)/
    );

    assert.match(
        engineSource,
        /myVersionFullSubjectLeasePreacquired[\s\S]*?acquireBuildLease/
    );

    assert.match(
        engineSource,
        /releaseMyVersionForegroundBuildHandoff\([\s\S]*?'runtime-layers-unavailable'/
    );

    assert.match(
        engineSource,
        /saveMyVersionWorkingDraftNow\([\s\S]*?getBuildState\([\s\S]*?saveBuildCheckpoint\(/
    );

    assert.match(
        engineSource,
        /completesAiSubjectBuild[\s\S]*?aiBuildStatus:[\s\S]*?'complete'[\s\S]*?generationContext:/
    );

    assert.doesNotMatch(
        workerSource,
        /AtlasCloud|AtlasTutorSubjects|supabase\.co|refresh_token/
    );
}

(async () => {
    testBatchFourStaticContracts();

    await testAtomicForegroundYield();

    console.log(
        'Atlas SharedWorker Batch 4 passed: a foreground subject request waits for the worker\'s current atomic AI operation, checkpoints that completed mutation without advancing the runner step, receives ownership only after the canonical Web Lock is released, carries current generation context back to the page, preserves real foreground edits through active build checkpoints, returns unfinished work to the SharedWorker when the page leaves, and keeps final durable completion page/cloud-owned.'
    );
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
