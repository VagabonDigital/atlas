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

const resurrectionSource =
    fs.readFileSync(
        'shared/atlas-subject-build-resurrection.js',
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

const runnerSource =
    fs.readFileSync(
        'shared/atlas-subject-build-runner.js',
        'utf8'
    );

function clone(value) {
    return value === null ||
        value === undefined
        ? value
        : JSON.parse(
            JSON.stringify(value)
        );
}

function wait(ms) {
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
        timeoutMs = 9000,
        stepMs = 8
    } = {}
) {
    const startedAt =
        Date.now();

    while (
        Date.now() -
            startedAt <
        timeoutMs
    ) {
        if (await predicate()) {
            return true;
        }

        await wait(stepMs);
    }

    return false;
}

function makeFakeAI(
    callLog,
    {
        hangFirstDiscussionSet =
            false
    } = {}
) {
    let runtime = {};
    let setNumber = 0;
    let cardNumber = 0;
    let hung = false;

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
            note('subject-framing');

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

            if (
                hangFirstDiscussionSet &&
                !hung
            ) {
                hung = true;

                /*
                 * Simulate the browser terminating a SharedWorker during an
                 * in-flight AI operation. This promise intentionally never
                 * resolves, so the last completed checkpoint must remain the
                 * only recovery authority.
                 */
                return new Promise(
                    () => {}
                );
            }

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
            note(
                'reflection'
            );

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
                imageUrl:
                    ''
            };
        }
    };
}

function createFakeIndexedDB(
    records
) {
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
                error:
                    null,

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
                result:
                    db,
                error:
                    null,
                onupgradeneeded:
                    null,
                onerror:
                    null,
                onblocked:
                    null,
                onsuccess:
                    null
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

class SharedLockManager {
    constructor() {
        this.held =
            new Map();
    }

    view(owner) {
        return {
            query:
                async () => ({
                    held:
                        Array.from(
                            this.held
                                .entries()
                        ).map(
                            ([name, clientId]) => ({
                                name,
                                clientId
                            })
                        ),
                    pending:
                        []
                }),

            request:
                async (
                    name,
                    options,
                    callback
                ) => {
                    if (
                        options
                            ?.ifAvailable ===
                        true
                    ) {
                        if (
                            this.held
                                .has(name)
                        ) {
                            return callback(
                                null
                            );
                        }

                        this.held.set(
                            name,
                            owner
                        );

                        try {
                            return await callback({
                                name
                            });
                        } finally {
                            if (
                                this.held
                                    .get(name) ===
                                owner
                            ) {
                                this.held
                                    .delete(name);
                            }
                        }
                    }

                    while (
                        this.held.has(
                            name
                        )
                    ) {
                        await wait(1);
                    }

                    this.held.set(
                        name,
                        owner
                    );

                    try {
                        return await callback({
                            name
                        });
                    } finally {
                        if (
                            this.held
                                .get(name) ===
                            owner
                        ) {
                            this.held
                                .delete(name);
                        }
                    }
                }
        };
    }

    releaseOwner(owner) {
        Array.from(
            this.held
                .entries()
        ).forEach(
            ([name, currentOwner]) => {
                if (
                    currentOwner ===
                    owner
                ) {
                    this.held
                        .delete(name);
                }
            }
        );
    }
}

function createPortPair() {
    let pagePort;
    let workerPort;

    pagePort = {
        onmessage:
            null,
        onmessageerror:
            null,
        closed:
            false,

        start() {},

        close() {
            this.closed =
                true;
        },

        postMessage(message) {
            if (this.closed) {
                return;
            }

            const payload =
                clone(message);

            setTimeout(
                () => {
                    if (
                        !workerPort
                            .closed
                    ) {
                        workerPort
                            .onmessage
                            ?.({
                                data:
                                    payload
                            });
                    }
                },
                0
            );
        }
    };

    workerPort = {
        onmessage:
            null,
        onmessageerror:
            null,
        closed:
            false,

        start() {},

        close() {
            this.closed =
                true;
        },

        postMessage(message) {
            if (this.closed) {
                return;
            }

            const payload =
                clone(message);

            setTimeout(
                () => {
                    if (
                        !pagePort
                            .closed
                    ) {
                        pagePort
                            .onmessage
                            ?.({
                                data:
                                    payload
                            });
                    }
                },
                0
            );
        }
    };

    return [
        pagePort,
        workerPort
    ];
}

function createEventTarget() {
    const listeners =
        new Map();

    return {
        addEventListener(
            type,
            listener
        ) {
            if (
                !listeners.has(
                    type
                )
            ) {
                listeners.set(
                    type,
                    new Set()
                );
            }

            listeners
                .get(type)
                .add(listener);
        },

        removeEventListener(
            type,
            listener
        ) {
            listeners
                .get(type)
                ?.delete(listener);
        },

        dispatchEvent(event) {
            for (
                const listener of
                listeners.get(
                    event.type
                ) || []
            ) {
                listener(event);
            }

            return true;
        },

        listeners
    };
}

class WorkerHub {
    constructor(
        records,
        locks
    ) {
        this.records =
            records;

        this.locks =
            locks;

        this.runs = [];
        this.current =
            null;

        this.sequence = 0;
    }

    createWorker() {
        const id =
            'worker-' +
            (
                ++this.sequence
            );

        const callLog = [];

        let idSequence = 0;

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
                    idSequence += 1;

                    return (
                        id +
                        '-id-' +
                        idSequence
                    );
                }
            },

            navigator: {
                locks:
                    this.locks
                        .view(id)
            },

            indexedDB:
                createFakeIndexedDB(
                    this.records
                ),

            BroadcastChannel:
                undefined,

            fetch:
                async () => {
                    throw new Error(
                        'Fake AI should intercept network calls.'
                    );
                },

            setTimeout,
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
                                makeFakeAI(
                                    callLog,
                                    {
                                        hangFirstDiscussionSet:
                                            id ===
                                            'worker-1'
                                    }
                                );

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

        const runtime = {
            id,
            context:
                workerContext,
            callLog,
            dead:
                false
        };

        this.runs.push(
            runtime
        );

        this.current =
            runtime;

        return runtime;
    }

    connect() {
        const runtime =
            this.current &&
            this.current.dead !==
                true
                ? this.current
                : this
                    .createWorker();

        const [
            pagePort,
            workerPort
        ] =
            createPortPair();

        runtime
            .context
            .onconnect({
                ports: [
                    workerPort
                ]
            });

        return pagePort;
    }

    killCurrentWorker() {
        if (!this.current) {
            return;
        }

        this.current.dead =
            true;

        this.locks
            .releaseOwner(
                this.current.id
            );

        this.current =
            null;
    }
}

async function createJourneyCheckpoint() {
    const seedContext = {
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

        setTimeout,
        clearTimeout,

        crypto: {
            randomUUID:
                (() => {
                    let sequence = 0;

                    return () => {
                        sequence += 1;

                        return (
                            'seed-' +
                            sequence
                        );
                    };
                })()
        }
    };

    seedContext.self =
        seedContext;

    vm.createContext(
        seedContext
    );

    vm.runInContext(
        structuredSource,
        seedContext
    );

    vm.runInContext(
        operationsSource,
        seedContext
    );

    let document =
        seedContext
            .AtlasStructuredSubject
            .createBlankDocument({
                title:
                    'Batch 5D'
            });

    const Operations =
        seedContext
            .AtlasSubjectBuildDocumentOperations
            .create({
                ai:
                    makeFakeAI([]),
                structured:
                    seedContext
                        .AtlasStructuredSubject,

                getDocument() {
                    return document;
                },

                commit(mutator) {
                    const next =
                        clone(document);

                    const accepted =
                        mutator(
                            next,
                            {}
                        );

                    if (accepted) {
                        document =
                            next;
                    }

                    return accepted;
                }
            });

    await Operations
        .generateSubjectFraming();

    await Operations
        .generateOverview();

    await Operations
        .generateDiscussionFraming();

    document
        .subjectCopy
        .cover
        .hook =
        'Tutor edit survives resurrection';

    const generationContext = {
        version:
            1,
        languageLevel:
            'b2',
        subjectSize:
            'standard',
        languageSupport:
            'key',
        style:
            'balanced',
        ideaMode:
            'current-affairs',
        premise:
            'Batch 5D full journey',
        brief:
            '',

        source: {
            publisher:
                'Example',
            title:
                'Development',
            url:
                'https://example.com/story',
            readMore:
                'Preserve this read-more context',
            readMoreQuestions: [
                'Why?'
            ]
        }
    };

    const timestamp =
        Date.now();

    return {
        generationContext,
        document,

        checkpoint: {
            schemaVersion:
                1,
            subjectId:
                'journey',

            workingDraft: {
                schemaVersion:
                    1,
                subjectId:
                    'journey',
                ownerId:
                    'user-one',
                format:
                    'structured',
                baseRevision:
                    4,
                document:
                    clone(document),
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
                schemaVersion:
                    1,
                subjectId:
                    'journey',
                kind:
                    'full-subject',
                completedStep:
                    3,
                autoSaveOnComplete:
                    true,
                generationContext:
                    clone(
                        generationContext
                    ),
                startedAt:
                    timestamp,
                updatedAt:
                    timestamp
            },

            updatedAt:
                timestamp
        }
    };
}

async function testFullResurrectionJourney() {
    const records =
        new Map();

    const locks =
        new SharedLockManager();

    const hub =
        new WorkerHub(
            records,
            locks
        );

    const seeded =
        await createJourneyCheckpoint();

    records.set(
        'build-checkpoint::journey',
        clone(
            seeded.checkpoint
        )
    );

    let subject = {
        id:
            'journey',
        revision:
            4,
        format:
            'structured',

        metadata: {
            title:
                'Batch 5D',
            navTitle:
                'Batch 5D',
            aiBuildStatus:
                'building',
            generationContext:
                clone(
                    seeded
                        .generationContext
                )
        },

        provenance: {
            kind:
                'ai-subject-build'
        },

        document:
            clone(
                seeded.document
            )
    };

    let entitlementRefreshes =
        0;

    const Account = {
        async initialize() {},

        getState() {
            return {
                ready:
                    true,
                authenticated:
                    true,
                userId:
                    'user-one',
                planCode:
                    'free',
                entitlementReady:
                    true
            };
        },

        async refreshEntitlement() {
            entitlementRefreshes +=
                1;
        }
    };

    const Subjects = {
        cloudReadAuthority:
            true,
        cloudWriteAuthority:
            true,

        async listSubjects() {
            return [
                clone(subject)
            ];
        },

        async getSubject(id) {
            return id ===
                'journey'
                ? clone(subject)
                : null;
        },

        async getBuildState(id) {
            return clone(
                records
                    .get(
                        'build-checkpoint::' +
                        id
                    )
                    ?.buildState ||
                null
            );
        },

        async getWorkingDraft(id) {
            return clone(
                records
                    .get(
                        'build-checkpoint::' +
                        id
                    )
                    ?.workingDraft ||
                null
            );
        },

        async updateSubjectAtRevision(
            id,
            patch,
            expectedRevision
        ) {
            assert.equal(
                id,
                'journey'
            );

            if (
                subject.revision !==
                expectedRevision
            ) {
                const error =
                    new Error(
                        'conflict'
                    );

                error.code =
                    'ATLAS_REVISION_CONFLICT';

                throw error;
            }

            subject = {
                ...subject,

                revision:
                    expectedRevision +
                    1,

                metadata: {
                    ...subject
                        .metadata,
                    ...clone(
                        patch
                            .metadata ||
                        {}
                    )
                },

                document:
                    patch.document
                        ? clone(
                            patch
                                .document
                        )
                        : subject
                            .document
            };

            return clone(
                subject
            );
        },

        async clearWorkingDraft(id) {
            records.delete(
                'build-checkpoint::' +
                id
            );

            return true;
        }
    };

    const Lifecycle = {
        classify(record) {
            const status =
                String(
                    record
                        ?.metadata
                        ?.aiBuildStatus ||
                    ''
                );

            return {
                status,
                incomplete:
                    status !==
                        'complete' &&
                    record
                        ?.provenance
                        ?.kind ===
                        'ai-subject-build'
            };
        }
    };

    const authStorage =
        new Map([
            [
                'sb-jnhjfpagectprceswvqn-auth-token',
                '{}'
            ]
        ]);

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
    }

    function createPage(path) {
        const windowTarget =
            createEventTarget();

        const documentTarget =
            createEventTarget();

        const pageOwner =
            'page-' +
            Math.random()
                .toString(36)
                .slice(2);

        const pathname =
            path
                .split('?')[0];

        const windowObject = {
            ...windowTarget,

            location: {
                pathname,
                hash:
                    '',
                href:
                    'https://atlas.test' +
                    path
            },

            crypto: {
                randomUUID() {
                    return pageOwner;
                }
            },

            setTimeout,
            clearTimeout,

            setInterval() {
                return 1;
            },

            clearInterval() {},

            SharedWorker:
                function FakeSharedWorker() {
                    this.port =
                        hub.connect();

                    this.onerror =
                        null;
                },

            AtlasAccount:
                Account,

            AtlasCloud: {
                async getSession() {
                    return {
                        user: {
                            id:
                                'user-one'
                        },
                        access_token:
                            'token-user-one',
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

            AtlasAccessBootstrap: {
                async prepareAccountRuntime() {
                    return Account;
                }
            },

            AtlasStructuredSubject:
                null,

            AtlasTutorSubjects:
                Subjects,

            AtlasTutorSubjectsCloudAuthority: {
                active:
                    true
            },

            AtlasAiSubjectBuildLifecycle:
                Lifecycle,

            AtlasSubjectRuntimeChannel: {
                ingestExternalMessage() {}
            }
        };

        /*
         * The real structured runtime is already loaded on Compass and can
         * be loaded by the shared registry elsewhere. Giving the coordinator
         * the canonical object here keeps the test focused on cross-surface
         * ownership/resurrection rather than script tag mechanics.
         */
        const structuredContext = {
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
            crypto: {
                randomUUID() {
                    return (
                        pageOwner +
                        '-structured'
                    );
                }
            }
        };

        structuredContext.self =
            structuredContext;

        vm.createContext(
            structuredContext
        );

        vm.runInContext(
            structuredSource,
            structuredContext
        );

        windowObject
            .AtlasStructuredSubject =
            structuredContext
                .AtlasStructuredSubject;

        const documentObject = {
            ...documentTarget,

            hidden:
                false,

            body: {
                dataset: {}
            },

            scripts:
                [],

            head: {
                appendChild() {}
            },

            createElement() {
                return {
                    src:
                        '',
                    async:
                        false,
                    setAttribute() {},
                    addEventListener() {}
                };
            }
        };

        const localStorage = {
            getItem(key) {
                return authStorage
                    .get(key) ||
                    null;
            },

            setItem(
                key,
                value
            ) {
                authStorage.set(
                    key,
                    String(value)
                );
            },

            removeItem(key) {
                authStorage.delete(
                    key
                );
            }
        };

        const context = {
            window:
                windowObject,
            document:
                documentObject,
            navigator: {
                onLine:
                    true,
                locks:
                    locks.view(
                        pageOwner
                    )
            },
            localStorage,
            CustomEvent,
            URL,
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
            Error,
            setTimeout,
            clearTimeout,
            setInterval,
            clearInterval
        };

        vm.createContext(
            context
        );

        vm.runInContext(
            clientSource,
            context,
            {
                filename:
                    'atlas-subject-build-worker-client.js'
            }
        );

        vm.runInContext(
            resurrectionSource,
            context,
            {
                filename:
                    'atlas-subject-build-resurrection.js'
            }
        );

        return {
            windowObject,

            close(
                persisted =
                    false
            ) {
                windowTarget
                    .listeners
                    .get(
                        'pagehide'
                    )
                    ?.forEach(
                        listener =>
                            listener({
                                persisted
                            })
                    );
            }
        };
    }

    /*
     * 1. The canonical creation/foreground boundary already exists:
     *    cloud subject is building, checkpoint is step 3, and the tutor has
     *    changed reusable content after generation began.
     */
    const subjectPage =
        createPage(
            '/compass/subject/?id=journey'
        );

    assert.equal(
        await waitUntil(
            () =>
                hub.runs[0]
                    ?.callLog
                    .some(
                        item =>
                            item.name ===
                            'discussion-set'
                    ),
            {
                timeoutMs:
                    3500
            }
        ),
        true,
        'The first SharedWorker should resume the canonical foreground checkpoint.'
    );

    assert.equal(
        records
            .get(
                'build-checkpoint::journey'
            )
            .buildState
            .completedStep,
        3,
        'An in-flight worker AI operation must not advance the durable checkpoint.'
    );

    /*
     * 2. Tutor leaves the subject while another Atlas surface is open.
     *    Both surfaces must attach to the same SharedWorker.
     */
    const rootPage =
        createPage('/');

    await wait(80);

    assert.equal(
        hub.runs.length,
        1,
        'Cross-surface navigation must keep one SharedWorker while an Atlas page remains open.'
    );

    subjectPage.close();

    await wait(30);

    assert.equal(
        hub.current
            ?.dead,
        false,
        'The SharedWorker must remain available while another Atlas page is open.'
    );

    /*
     * 3. Every Atlas page closes. The browser may terminate the SharedWorker.
     *    Only the last completed IndexedDB checkpoint may survive.
     */
    rootPage.close();

    await wait(20);

    hub.killCurrentWorker();

    assert.equal(
        records
            .get(
                'build-checkpoint::journey'
            )
            ?.buildState
            ?.completedStep,
        3,
        'Worker death must leave the last completed checkpoint intact.'
    );

    /*
     * 4. Later, Arcade opens cold. Account-side resurrection must discover
     *    the unfinished cloud subject, enqueue it in a replacement worker,
     *    resume the checkpoint, and commit through page/cloud authority.
     */
    const arcadePage =
        createPage(
            '/arcade/'
        );

    assert.equal(
        await waitUntil(
            () =>
                subject
                    .metadata
                    .aiBuildStatus ===
                'complete'
        ),
        true,
        'Cold Arcade reopen should auto-resurrect and durably complete the unfinished subject.'
    );

    assert.equal(
        hub.runs.length,
        2,
        'Cold reopen must create a replacement SharedWorker after the previous worker died.'
    );

    assert.ok(
        hub.runs[1]
            .callLog
            .some(
                item =>
                    item.name ===
                        'discussion-set'
            ),
        'The replacement SharedWorker must resume real generation work from the checkpoint.'
    );

    assert.ok(
        hub.runs[1]
            .callLog
            .filter(
                item =>
                    item.token
            )
            .every(
                item =>
                    item.token ===
                        'token-user-one'
            ),
        'Replacement generation must use only the page-supplied short-lived access token.'
    );

    assert.equal(
        subject.revision,
        5,
        'Automatic completion must perform one exact-revision durable write.'
    );

    assert.equal(
        subject
            .document
            .subjectCopy
            .cover
            .hook,
        'Tutor edit survives resurrection',
        'Reusable tutor edits must survive worker death, resurrection, and final completion.'
    );

    assert.equal(
        subject
            .metadata
            .generationContext
            .source
            .readMore,
        'Preserve this read-more context',
        'Current Affairs generation context must survive the full close/reopen journey.'
    );

    assert.equal(
        records.has(
            'build-checkpoint::journey'
        ),
        false,
        'The browser journal must clear only after durable completion succeeds.'
    );

    assert.equal(
        entitlementRefreshes,
        1,
        'Durable completion should refresh entitlement once.'
    );

    /*
     * 5. Reopening the subject now sees a normal completed subject. No
     *    Continue-building recovery state remains.
     */
    const reopened =
        await Subjects
            .getSubject(
                'journey'
            );

    assert.equal(
        Lifecycle
            .classify(
                reopened
            )
            .incomplete,
        false
    );

    assert.equal(
        reopened
            .document
            .subjectCopy
            .cover
            .hook,
        'Tutor edit survives resurrection'
    );

    arcadePage.close();
}

(async () => {
    await testFullResurrectionJourney();

    console.log(
        'Atlas Batch 5D full journey passed: a building subject with tutor edits survives cross-surface navigation, all Atlas pages closing, SharedWorker death, and a later cold Arcade reopen; authenticated resurrection creates a replacement worker, resumes the canonical IndexedDB checkpoint with page-owned auth, preserves generation context and tutor edits, completes through exact-revision page/cloud authority, clears the journal only after durable completion, and reopens as a normal finished subject.'
    );
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
