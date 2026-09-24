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
    static messages = [];

    constructor(name) {
        this.name = name;
        this.listeners =
            new Set();
    }

    postMessage(message) {
        FakeBroadcastChannel
            .messages
            .push(
                clone(message)
            );
    }

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

    close() {}
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

function makeFakeAI(callLog) {
    let runtime = {};
    let setNumber = 0;
    let cardNumber = 0;

    function note(name) {
        callLog.push({
            name,
            subjectId:
                runtime
                    .getSubjectId?.() ||
                '',
            token:
                runtime
                    .getAccessToken?.() ||
                ''
        });
    }

    return {
        configureRuntime(next = {}) {
            runtime = {
                ...runtime,
                ...next
            };

            return this;
        },

        async generateSubjectFraming() {
            note(
                'subject-framing'
            );

            return {
                catalogDescription:
                    'Worker description',
                hook:
                    'Worker hook'
            };
        },

        async generateOverview() {
            note('overview');

            return {
                heading:
                    'Open Door',
                intro:
                    'Start here.',
                question:
                    'What comes to mind?'
            };
        },

        async generateDiscussionFraming() {
            note(
                'discussion-framing'
            );

            return {
                heading:
                    'Talk It Through',
                intro:
                    'Move into the idea.',
                pathDescription:
                    'Questions that deepen the conversation.'
            };
        },

        async generateDiscussionSet() {
            note(
                'discussion-set'
            );

            setNumber += 1;

            return {
                title:
                    'Set ' +
                    setNumber,
                stage:
                    [
                        'First Look',
                        'Look Closer',
                        'Wider View'
                    ][
                        (
                            setNumber -
                            1
                        ) % 3
                    ],
                description:
                    'Discussion set',
                moments: [
                    {
                        preview:
                            'Moment',
                        question:
                            'Question?'
                    }
                ]
            };
        },

        async generateCulturalLensFraming() {
            note(
                'lens-framing'
            );

            return {
                heading:
                    'Across Contexts',
                intro:
                    'Compare perspectives.',
                pathDescription:
                    'Different contexts.'
            };
        },

        async generateCulturalLensCard() {
            note(
                'lens-card'
            );

            cardNumber += 1;

            return {
                title:
                    'Lens ' +
                    cardNumber,
                contextLine:
                    'Context',
                teaser:
                    'Teaser',
                context:
                    'Background',
                questions: [
                    'Question?'
                ],
                followTheThread:
                    []
            };
        },

        async generateReflection() {
            note('reflection');

            return {
                title:
                    'Look Back',
                summary:
                    'Pull it together.',
                questions: [
                    'What stayed with you?'
                ],
                pathDescription:
                    'Bring it together.'
            };
        },

        async generateMomentUpgrade() {
            note(
                'moment-upgrade'
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
            note(
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
            note(
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
            note(
                'key-selection'
            );

            return candidates
                .slice(
                    0,
                    limit
                )
                .map(item =>
                    item.id
                );
        },

        async generateCurrentAffairsReading() {
            note(
                'current-affairs'
            );

            return {
                readMore:
                    'Reading',
                readMoreQuestions: [
                    'One?',
                    'Two?'
                ],
                imageUrl: ''
            };
        }
    };
}

async function createStepThreeCheckpoint() {
    const seedRoot = {
        crypto: {
            randomUUID() {
                seedRoot.__id =
                    (
                        seedRoot.__id ||
                        0
                    ) + 1;

                return (
                    'seed-' +
                    seedRoot.__id
                );
            }
        },
        setTimeout,
        clearTimeout,
        console
    };

    vm.createContext(seedRoot);

    vm.runInContext(
        structuredSource,
        seedRoot
    );

    vm.runInContext(
        operationsSource,
        seedRoot
    );

    let document =
        seedRoot
            .AtlasStructuredSubject
            .createBlankDocument({
                title:
                    'Worker Resume'
            });

    const FakeAI =
        makeFakeAI([]);

    const Operations =
        seedRoot
            .AtlasSubjectBuildDocumentOperations
            .create({
                ai: FakeAI,
                structured:
                    seedRoot
                        .AtlasStructuredSubject,

                getDocument() {
                    return document;
                },

                commit(mutator) {
                    const next =
                        clone(document);

                    const result =
                        mutator(
                            next,
                            {}
                        );

                    if (result) {
                        document =
                            next;
                    }

                    return result;
                }
            });

    await Operations
        .generateSubjectFraming();

    await Operations
        .generateOverview();

    await Operations
        .generateDiscussionFraming();

    const timestamp =
        Date.now();

    return {
        schemaVersion: 1,
        subjectId:
            'subject-worker-resume',

        workingDraft: {
            schemaVersion: 1,
            subjectId:
                'subject-worker-resume',
            ownerId:
                'local-tutor',
            format:
                'structured',
            baseRevision: 4,
            document,
            includedLiveSessionId:
                null,
            activeViewId:
                'view-cover',
            startedAt:
                timestamp,
            updatedAt:
                timestamp
        },

        buildState: {
            schemaVersion: 1,
            subjectId:
                'subject-worker-resume',
            kind:
                'full-subject',
            completedStep: 3,
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

async function testRealWorkerGeneration() {
    const initialCheckpoint =
        await createStepThreeCheckpoint();

    const records =
        new Map([
            [
                'build-checkpoint::subject-worker-resume',
                initialCheckpoint
            ]
        ]);

    let foregroundOwnsLock =
        true;

    const workerHeldLockNames =
        new Set();

    let concurrentWorkerBuilds = 0;
    let maxWorkerHeldLocks = 0;

    const Locks = {
        async query() {
            const held =
                Array.from(
                    workerHeldLockNames
                ).map(name => ({
                    name
                }));

            if (
                foregroundOwnsLock
            ) {
                held.push({
                    name:
                        'atlas-subject-build:subject-worker-resume'
                });
            }

            return {
                held,
                pending: []
            };
        },

        async request(
            name,
            options,
            callback
        ) {
            assert.equal(
                options
                    .ifAvailable,
                true
            );

            const pageOwnsThisLock =
                foregroundOwnsLock &&
                name ===
                    'atlas-subject-build:subject-worker-resume';

            if (
                pageOwnsThisLock ||
                workerHeldLockNames
                    .has(name)
            ) {
                return callback(
                    null
                );
            }

            workerHeldLockNames
                .add(name);

            concurrentWorkerBuilds += 1;
            maxWorkerHeldLocks =
                Math.max(
                    maxWorkerHeldLocks,
                    concurrentWorkerBuilds
                );

            try {
                return await callback({
                    name
                });
            } finally {
                concurrentWorkerBuilds -= 1;
                workerHeldLockNames
                    .delete(name);
            }
        }
    };

    const callLog = [];
    const FakeAI =
        makeFakeAI(callLog);

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
                workerContext.__id =
                    (
                        workerContext.__id ||
                        0
                    ) + 1;

                return (
                    'worker-' +
                    workerContext.__id
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

    vm.createContext(
        workerContext
    );

    workerContext.importScripts =
        (...urls) => {
            urls.forEach(url => {
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
            });
        };

    vm.runInContext(
        workerSource,
        workerContext,
        {
            filename:
                'atlas-subject-build-shared-worker.js'
        }
    );

    const subjectPage =
        new FakePort(
            'subject'
        );

    const arcadePage =
        new FakePort(
            'arcade'
        );

    workerContext.onconnect({
        ports: [
            subjectPage
        ]
    });

    workerContext.onconnect({
        ports: [
            arcadePage
        ]
    });

    subjectPage.send({
        type:
            'connect',
        pageId:
            'subject-page',
        surface:
            'compass-subject'
    });

    arcadePage.send({
        type:
            'connect',
        pageId:
            'arcade-page',
        surface:
            'arcade'
    });

    subjectPage.send({
        type:
            'auth',
        userId:
            'user-one',
        accessToken:
            'subject-token'
    });

    arcadePage.send({
        type:
            'auth',
        userId:
            'user-one',
        accessToken:
            'arcade-token'
    });

    subjectPage.send({
        type:
            'enqueue-subject',
        subjectId:
            'subject-worker-resume',
        build: {
            generationContext: {
                version: 1,
                languageLevel:
                    'b2',
                subjectSize:
                    'standard',
                languageSupport:
                    'key',
                style:
                    'balanced',
                premise:
                    'Resume safely.',
                brief:
                    ''
            },
            autoSaveOnComplete:
                true,
            revision: 4
        }
    });

    arcadePage.send({
        type:
            'enqueue-subject',
        subjectId:
            'subject-worker-resume',
        build: {
            generationContext: {
                version: 1,
                languageLevel:
                    'b2',
                subjectSize:
                    'standard',
                languageSupport:
                    'key',
                style:
                    'balanced',
                premise:
                    'Resume safely.',
                brief:
                    ''
            },
            autoSaveOnComplete:
                true,
            revision: 4
        }
    });

    const blocked =
        await waitUntil(
            () =>
                subjectPage
                    .latest(
                        'queue-state'
                    )
                    ?.queue
                    ?.some(
                        job =>
                            job.subjectId ===
                                'subject-worker-resume' &&
                            job.status ===
                                'blocked-by-owner'
                    )
        );

    assert.equal(
        blocked,
        true,
        'Worker must wait while the foreground subject page owns the build lock.'
    );

    const duplicateQueue =
        arcadePage
            .latest(
                'queue-state'
            )
            ?.queue
            ?.filter(
                item =>
                    item.subjectId ===
                    'subject-worker-resume'
            ) || [];

    assert.equal(
        duplicateQueue.length,
        1,
        'Two authenticated Atlas pages may rediscover the same unfinished subject, but the SharedWorker must keep one user/subject queue job.'
    );

    assert.equal(
        callLog.length,
        0,
        'Worker must not execute AI while the foreground page owns the subject.'
    );

    /*
     * Simulate the tutor leaving the subject while another Atlas surface
     * remains open. The browser releases the page Web Lock; the worker then
     * owns the exact same lock and resumes the checkpoint.
     */
    foregroundOwnsLock = false;

    subjectPage.send({
        type:
            'disconnect',
        reason:
            'page-hidden'
    });

    const completed =
        await waitUntil(
            () => {
                const checkpointComplete =
                    records
                        .get(
                            'build-checkpoint::subject-worker-resume'
                        )
                        ?.buildState
                        ?.completedStep ===
                    18;

                const projectedJob =
                    arcadePage
                        .latest(
                            'queue-state'
                        )
                        ?.queue
                        ?.find(
                            item =>
                                item.subjectId ===
                                'subject-worker-resume'
                        );

                return (
                    checkpointComplete &&
                    projectedJob?.status ===
                        'ready-to-commit' &&
                    projectedJob?.lockState ===
                        'available'
                );
            },
            {
                timeoutMs: 5000,
                stepMs: 10
            }
        );

    assert.equal(
        completed,
        true,
        'SharedWorker should resume the foreground checkpoint and reach step 18.'
    );

    const finalCheckpoint =
        records.get(
            'build-checkpoint::subject-worker-resume'
        );

    assert.equal(
        finalCheckpoint
            .buildState
            .completedStep,
        18
    );

    assert.equal(
        finalCheckpoint
            .workingDraft
            .baseRevision,
        4,
        'Worker checkpointing must preserve the foreground draft revision boundary.'
    );

    assert.equal(
        finalCheckpoint
            .buildState
            .autoSaveOnComplete,
        true
    );

    assert.equal(
        finalCheckpoint
            .buildState
            .generationContext
            .premise,
        'Resume safely.',
        'Worker-owned generation context must remain inside the canonical checkpoint so all-pages-close recovery cannot lose it.'
    );

    const finalDocument =
        finalCheckpoint
            .workingDraft
            .document;

    assert.equal(
        finalDocument
            .discussionSets
            .length,
        3
    );

    assert.equal(
        finalDocument
            .culturalLensCards
            .length,
        6
    );

    assert.ok(
        finalDocument
            .subjectCopy
            .reflection
            .title
    );

    assert.equal(
        callLog.some(
            call =>
                call.name ===
                    'subject-framing'
        ),
        false,
        'Resume from step 3 must not regenerate already checkpointed framing.'
    );

    assert.equal(
        callLog.some(
            call =>
                call.name ===
                    'overview'
        ),
        false,
        'Resume from step 3 must not regenerate the checkpointed overview.'
    );

    assert.equal(
        callLog.some(
            call =>
                call.name ===
                    'discussion-framing'
        ),
        false,
        'Resume from step 3 must not regenerate Discussion framing.'
    );

    assert.ok(
        callLog.every(
            call =>
                call.subjectId ===
                    'subject-worker-resume' &&
                call.token ===
                    'arcade-token'
        ),
        'Worker AI must use the current page-supplied access token and subject ID.'
    );

    assert.equal(
        maxWorkerHeldLocks,
        1,
        'SharedWorker must never execute more than one background build at a time.'
    );

    assert.ok(
        arcadePage
            .messages
            .some(
                message =>
                    message.type ===
                    'build-started'
            )
    );

    assert.ok(
        arcadePage
            .messages
            .some(
                message =>
                    message.type ===
                    'build-ready' &&
                message.completedStep ===
                    18
            )
    );

    assert.ok(
        FakeBroadcastChannel
            .messages
            .some(
                message =>
                    message.type ===
                        'build-heartbeat' &&
                    message.subjectId ===
                        'subject-worker-resume'
            ),
        'SharedWorker must publish build liveness through the existing runtime channel protocol.'
    );

    assert.ok(
        FakeBroadcastChannel
            .messages
            .some(
                message =>
                    message.type ===
                        'subject-changed' &&
                    message.detail
                        ?.change ===
                        'build-checkpoint'
            ),
        'Worker checkpoints must publish the existing subject-change signal.'
    );

    const queue =
        arcadePage
            .latest(
                'queue-state'
            )
            ?.queue ||
        [];

    const job =
        queue.find(
            item =>
                item.subjectId ===
                'subject-worker-resume'
        );

    assert.equal(
        job?.status,
        'ready-to-commit',
        'Batch 3 must stop at ready-to-commit rather than becoming a Supabase completion authority.'
    );

    /*
     * Queue two additional unfinished subjects while the same SharedWorker
     * remains alive. The fake Web Locks implementation permits different
     * subject lock names concurrently, so maxWorkerHeldLocks > 1 would prove
     * the worker itself had parallelized full builds.
     */
    function checkpointFor(subjectId) {
        const next =
            clone(
                initialCheckpoint
            );

        next.subjectId =
            subjectId;
        next.workingDraft.subjectId =
            subjectId;
        next.buildState.subjectId =
            subjectId;

        return next;
    }

    records.set(
        'build-checkpoint::subject-serial-a',
        checkpointFor(
            'subject-serial-a'
        )
    );

    records.set(
        'build-checkpoint::subject-serial-b',
        checkpointFor(
            'subject-serial-b'
        )
    );

    const descriptor = {
        generationContext: {
            version: 1,
            languageLevel:
                'b2',
            subjectSize:
                'standard',
            languageSupport:
                'key',
            style:
                'balanced',
            premise:
                'Serial queue safety.',
            brief:
                ''
        },
        autoSaveOnComplete:
            true,
        revision: 4
    };

    arcadePage.send({
        type:
            'enqueue-subject',
        subjectId:
            'subject-serial-a',
        build:
            descriptor
    });

    arcadePage.send({
        type:
            'enqueue-subject',
        subjectId:
            'subject-serial-b',
        build:
            descriptor
    });

    const bothCompleted =
        await waitUntil(
            () => {
                const queue =
                    arcadePage
                        .latest(
                            'queue-state'
                        )
                        ?.queue ||
                    [];

                const first =
                    queue.find(
                        item =>
                            item.subjectId ===
                            'subject-serial-a'
                    );

                const second =
                    queue.find(
                        item =>
                            item.subjectId ===
                            'subject-serial-b'
                    );

                return (
                    first?.status ===
                        'ready-to-commit' &&
                    first?.lockState ===
                        'available' &&
                    second?.status ===
                        'ready-to-commit' &&
                    second?.lockState ===
                        'available'
                );
            },
            {
                timeoutMs: 7000,
                stepMs: 10
            }
        );

    assert.equal(
        bothCompleted,
        true,
        'Multiple unfinished subjects should drain from the worker queue.'
    );

    assert.equal(
        maxWorkerHeldLocks,
        1,
        'SharedWorker must serialize full subject builds even when different Web Locks could be acquired concurrently.'
    );

    const starts =
        arcadePage
            .messages
            .filter(
                message =>
                    message.type ===
                    'build-started' &&
                    [
                        'subject-serial-a',
                        'subject-serial-b'
                    ].includes(
                        message.subjectId
                    )
            )
            .map(
                message =>
                    message.subjectId
            );

    assert.deepEqual(
        starts,
        [
            'subject-serial-a',
            'subject-serial-b'
        ],
        'Background subjects should run in queue order.'
    );
}

function testBatchThreeStaticContracts() {
    assert.match(
        workerSource,
        /AtlasSubjectBuildRunner[\s\S]*?\.run\(/
    );

    assert.match(
        workerSource,
        /AtlasSubjectBuildDocumentOperations[\s\S]*?\.create\(/
    );

    assert.match(
        workerSource,
        /AtlasAI[\s\S]*?configureRuntime/
    );

    assert.match(
        workerSource,
        /importScripts\([\s\S]*?atlas-structured-subject\.js[\s\S]*?atlas-ai\.js[\s\S]*?atlas-subject-build-document-operations\.js[\s\S]*?atlas-subject-build-runner\.js/
    );

    assert.match(
        workerSource,
        /build-checkpoint::/
    );

    assert.match(
        workerSource,
        /atlas-subject-build:/
    );

    assert.doesNotMatch(
        workerSource,
        /supabase\.co|AtlasCloud|AtlasTutorSubjects|refresh_token/
    );

    assert.match(
        clientSource,
        /enqueueSubject\([\s\S]*?generationContext/
    );

    assert.match(
        clientSource,
        /cancelSubject/
    );

    assert.doesNotMatch(
        clientSource,
        /refreshToken:/
    );

    assert.match(
        engineSource,
        /registerMyVersionFullSubjectWithWorker/
    );

    assert.match(
        engineSource,
        /myVersionFullSubjectPageExiting[\s\S]*?myVersionFullSubjectWorkerRegistered/
    );

    assert.match(
        engineSource,
        /cancelMyVersionFullSubjectWorkerRegistration/
    );

    assert.match(
        engineSource,
        /!handingOffToWorker[\s\S]*?setMyVersionAiBuildStatus\([\s\S]*?'paused'/
    );
}

(async () => {
    testBatchThreeStaticContracts();

    await testRealWorkerGeneration();

    console.log(
        'Atlas SharedWorker Batch 3 passed: a foreground-owned subject blocks worker execution; after the page releases the canonical Web Lock while another Atlas surface remains connected, the SharedWorker resumes the existing checkpoint with the canonical runner and document operations, uses only the page-supplied access token, checkpoints through step 18, publishes existing runtime liveness/change signals, executes only one background build at a time, and stops at ready-to-commit without becoming a Supabase completion authority.'
    );
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
