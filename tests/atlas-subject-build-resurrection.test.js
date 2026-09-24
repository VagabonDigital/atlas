'use strict';

const assert =
    require('node:assert/strict');

const fs =
    require('node:fs');

const vm =
    require('node:vm');

const resurrectionSource =
    fs.readFileSync(
        'shared/atlas-subject-build-resurrection.js',
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

function createEventTarget() {
    const listeners = new Map();

    return {
        addEventListener(type, listener) {
            if (!listeners.has(type)) {
                listeners.set(
                    type,
                    new Set()
                );
            }

            listeners
                .get(type)
                .add(listener);
        },

        removeEventListener(type, listener) {
            listeners
                .get(type)
                ?.delete(listener);
        },

        dispatchEvent(event) {
            for (
                const listener of
                listeners.get(event.type) || []
            ) {
                listener(event);
            }

            return true;
        }
    };
}

function makeSubject(
    id,
    status = 'building',
    revision = 4
) {
    return {
        id,
        revision,
        format:
            'structured',
        metadata: {
            aiBuildStatus:
                status,
            generationContext: {
                version: 1,
                premise:
                    `cloud-${id}`,
                languageSupport:
                    'key',
                subjectSize:
                    'standard'
            }
        },
        provenance: {
            kind:
                'ai-subject-build'
        },
        document: {
            module: {
                title:
                    id
            }
        }
    };
}

function createSandbox({
    supported = true,
    webLocks = true
} = {}) {
    const target =
        createEventTarget();

    const enqueued = [];
    const cancelled = [];
    const updates = [];
    const cleared = [];

    let entitlementRefreshes = 0;

    const subjects = [
        makeSubject(
            'subject-resume',
            'building',
            4
        ),
        makeSubject(
            'subject-paused',
            'paused',
            7
        )
    ];

    const buildStates =
        new Map([
            [
                'subject-resume',
                {
                    kind:
                        'full-subject',
                    completedStep:
                        9,
                    autoSaveOnComplete:
                        true,
                    generationContext: {
                        version: 1,
                        premise:
                            'checkpoint-context',
                        source: {
                            readMore:
                                'preserved worker context'
                        }
                    }
                }
            ],
            [
                'subject-paused',
                {
                    kind:
                        'full-subject',
                    completedStep:
                        6,
                    autoSaveOnComplete:
                        true,
                    generationContext: {
                        version: 1,
                        premise:
                            'paused'
                    }
                }
            ]
        ]);

    const drafts =
        new Map([
            [
                'subject-resume',
                {
                    baseRevision:
                        4,
                    document: {
                        schemaVersion:
                            1,
                        module: {
                            title:
                                'Finished title',
                            navTitle:
                                'Finished',
                            catalogDescription:
                                'Finished description',
                            bgImage:
                                'https://example.com/cover.jpg'
                        }
                    }
                }
            ]
        ]);

    const Account = {
        async initialize() {},

        getState() {
            return {
                ready:
                    true,
                authenticated:
                    true,
                userId:
                    'user-one'
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
            return clone(
                subjects
            );
        },

        async getSubject(id) {
            return clone(
                subjects.find(
                    item =>
                        item.id === id
                ) || null
            );
        },

        async getBuildState(id) {
            return clone(
                buildStates.get(id) ||
                null
            );
        },

        async getWorkingDraft(id) {
            return clone(
                drafts.get(id) ||
                null
            );
        },

        async updateSubjectAtRevision(
            id,
            patch,
            expectedRevision
        ) {
            const subject =
                subjects.find(
                    item =>
                        item.id === id
                );

            if (
                !subject ||
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

            updates.push({
                id,
                patch:
                    clone(patch),
                expectedRevision
            });

            subject.metadata = {
                ...subject.metadata,
                ...(
                    patch.metadata ||
                    {}
                )
            };

            if (patch.document) {
                subject.document =
                    clone(
                        patch.document
                    );
            }

            subject.revision += 1;

            return clone(subject);
        },

        async clearWorkingDraft(id) {
            cleared.push(id);
            buildStates.delete(id);
            drafts.delete(id);
            return true;
        }
    };

    const Client = {
        async initialize() {},

        getState() {
            return {
                supported,
                authenticated:
                    true,
                userId:
                    'user-one'
            };
        },

        async sendCurrentAuth() {
            return true;
        },

        enqueueSubject(
            subjectId,
            build
        ) {
            enqueued.push({
                subjectId,
                build:
                    clone(build)
            });

            return supported;
        },

        cancelSubject(
            subjectId,
            reason
        ) {
            cancelled.push({
                subjectId,
                reason
            });

            return true;
        }
    };

    class CustomEvent {
        constructor(
            type,
            options = {}
        ) {
            this.type = type;
            this.detail =
                options.detail;
        }
    }

    const windowObject = {
        ...target,
        location: {
            href:
                'https://atlas.test/arcade/',
            pathname:
                '/arcade/'
        },
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        AtlasAccessBootstrap: {
            async prepareAccountRuntime() {
                return Account;
            }
        },
        AtlasAccount:
            Account,
        AtlasCloud: {},
        AtlasStructuredSubject: {},
        AtlasTutorSubjects:
            Subjects,
        AtlasTutorSubjectsCloudAuthority: {
            active:
                true
        },
        AtlasAiSubjectBuildLifecycle: {
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
        },
        AtlasSubjectBuildWorkerClient:
            Client
    };

    windowObject.window =
        windowObject;

    const storage =
        new Map([
            [
                'sb-jnhjfpagectprceswvqn-auth-token',
                '{}'
            ]
        ]);

    const localStorage = {
        getItem(key) {
            return storage.has(key)
                ? storage.get(key)
                : null;
        },

        setItem(key, value) {
            storage.set(
                key,
                String(value)
            );
        },

        removeItem(key) {
            storage.delete(key);
        }
    };

    const navigatorObject = {
        onLine:
            true,
        locks:
            webLocks
                ? {
                    async request(
                        name,
                        options,
                        operation
                    ) {
                        assert.match(
                            name,
                            /^atlas-subject-build:/
                        );

                        assert.equal(
                            options.mode,
                            'exclusive'
                        );

                        return operation({
                            name
                        });
                    }
                }
                : null
    };

    const document = {
        scripts: [],
        head: {
            appendChild() {}
        },
        createElement() {
            return {
                src: '',
                async:
                    false,
                setAttribute() {},
                addEventListener() {}
            };
        }
    };

    const context = {
        window:
            windowObject,
        document,
        navigator:
            navigatorObject,
        localStorage,
        CustomEvent,
        URL,
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

    return {
        context,
        windowObject,
        navigatorObject,
        enqueued,
        cancelled,
        updates,
        cleared,
        subjects,
        buildStates,
        drafts,

        entitlementRefreshes() {
            return entitlementRefreshes;
        }
    };
}

async function testAutomaticWakeAndCompletion() {
    const box =
        createSandbox();

    vm.runInNewContext(
        resurrectionSource,
        box.context,
        {
            filename:
                'atlas-subject-build-resurrection.js'
        }
    );

    await flush();
    await flush();
    await flush();

    assert.deepEqual(
        box.enqueued.map(
            item =>
                item.subjectId
        ),
        [
            'subject-resume'
        ],
        'Authenticated entry should wake building subjects but preserve paused subjects as manual recovery.'
    );

    assert.equal(
        box.enqueued[0]
            .build
            .generationContext
            .source
            .readMore,
        'preserved worker context'
    );

    assert.equal(
        box.windowObject
            .AtlasSubjectBuildResurrection
            .isBootstrapping(),
        false
    );

    box.buildStates
        .get('subject-resume')
        .completedStep =
        18;

    const completed =
        await box.windowObject
            .AtlasSubjectBuildResurrection
            .completeReadyBuild(
                'subject-resume'
            );

    assert.equal(
        completed,
        true
    );

    assert.equal(
        box.updates.length,
        1
    );

    assert.equal(
        box.updates[0]
            .expectedRevision,
        4
    );

    assert.equal(
        box.updates[0]
            .patch
            .metadata
            .aiBuildStatus,
        'complete'
    );

    assert.equal(
        box.updates[0]
            .patch
            .metadata
            .generationContext
            .source
            .readMore,
        'preserved worker context'
    );

    assert.deepEqual(
        box.cleared,
        [
            'subject-resume'
        ]
    );

    assert.deepEqual(
        box.cancelled,
        [
            {
                subjectId:
                    'subject-resume',
                reason:
                    'background-complete'
            }
        ]
    );

    assert.equal(
        box.entitlementRefreshes(),
        1
    );
}

async function testRevisionConflictFailsClosed() {
    const box =
        createSandbox();

    vm.runInNewContext(
        resurrectionSource,
        box.context
    );

    await flush();
    await flush();

    box.buildStates
        .get('subject-resume')
        .completedStep =
        18;

    box.subjects
        .find(
            item =>
                item.id ===
                'subject-resume'
        )
        .revision =
        5;

    const completed =
        await box.windowObject
            .AtlasSubjectBuildResurrection
            .completeReadyBuild(
                'subject-resume'
            );

    assert.equal(
        completed,
        false
    );

    assert.equal(
        box.updates.length,
        0
    );

    assert.equal(
        box.cleared.length,
        0
    );

    assert.equal(
        box.windowObject
            .AtlasSubjectBuildResurrection
            .getState()
            .blocked
            .find(
                item =>
                    item.subjectId ===
                    'subject-resume'
            )
            ?.reason,
        'revision-conflict'
    );
}

async function testOfflineFailureRetriesOnReconnect() {
    const box =
        createSandbox();

    vm.runInNewContext(
        resurrectionSource,
        box.context
    );

    await flush();
    await flush();

    const before =
        box.enqueued.length;

    box.navigatorObject
        .onLine =
        false;

    box.windowObject
        .dispatchEvent(
            new box.context
                .CustomEvent(
                    'atlas:subject-build-worker-message',
                    {
                        detail: {
                            type:
                                'build-failed',
                            subjectId:
                                'subject-resume'
                        }
                    }
                )
        );

    assert.equal(
        box.windowObject
            .AtlasSubjectBuildResurrection
            .getState()
            .blocked
            .find(
                item =>
                    item.subjectId ===
                    'subject-resume'
            )
            ?.reason,
        'offline'
    );

    box.navigatorObject
        .onLine =
        true;

    box.windowObject
        .dispatchEvent(
            new box.context
                .CustomEvent(
                    'online'
                )
        );

    await flush();
    await flush();

    assert.ok(
        box.enqueued.length >
            before,
        'Reconnect should rediscover and re-enqueue the unfinished build.'
    );
}

async function testUnsupportedWorkerPreservesFallback() {
    const box =
        createSandbox({
            supported:
                false
        });

    vm.runInNewContext(
        resurrectionSource,
        box.context
    );

    await flush();
    await flush();

    assert.equal(
        box.enqueued.length,
        0,
        'Unsupported SharedWorker browsers must not attempt background resurrection.'
    );

    assert.equal(
        box.windowObject
            .AtlasSubjectBuildResurrection
            .isBootstrapping(),
        false
    );
}

async function testNoWebLocksFailsCompletionClosed() {
    const box =
        createSandbox({
            webLocks:
                false
        });

    vm.runInNewContext(
        resurrectionSource,
        box.context
    );

    await flush();
    await flush();

    box.buildStates
        .get('subject-resume')
        .completedStep =
        18;

    const completed =
        await box.windowObject
            .AtlasSubjectBuildResurrection
            .completeReadyBuild(
                'subject-resume'
            );

    assert.equal(
        completed,
        false
    );

    assert.equal(
        box.updates.length,
        0
    );

    assert.equal(
        box.cleared.length,
        0,
        'Without canonical Web Locks Atlas must preserve the checkpoint rather than guess at completion ownership.'
    );
}

async function testSignOutClearsResurrectionProjection() {
    const box =
        createSandbox();

    vm.runInNewContext(
        resurrectionSource,
        box.context
    );

    await flush();
    await flush();

    assert.ok(
        box.windowObject
            .AtlasSubjectBuildResurrection
            .getState()
            .userId
    );

    box.windowObject
        .dispatchEvent(
            new box.context
                .CustomEvent(
                    'atlas:account-change',
                    {
                        detail: {
                            ready:
                                true,
                            authenticated:
                                false,
                            userId:
                                null
                        }
                    }
                )
        );

    const state =
        box.windowObject
            .AtlasSubjectBuildResurrection
            .getState();

    assert.equal(
        state.userId,
        null
    );

    assert.deepEqual(
        state.establishing,
        []
    );

    assert.deepEqual(
        state.blocked,
        []
    );
}

(async () => {
    assert.match(
        resurrectionSource,
        /listSubjects\(\)/
    );

    assert.match(
        resurrectionSource,
        /AtlasAiSubjectBuildLifecycle/
    );

    assert.match(
        resurrectionSource,
        /atlas-subject-build:/
    );

    assert.match(
        resurrectionSource,
        /updateSubjectAtRevision/
    );

    assert.doesNotMatch(
        resurrectionSource,
        /refresh_token|refreshToken/
    );

    await testAutomaticWakeAndCompletion();
    await testRevisionConflictFailsClosed();
    await testOfflineFailureRetriesOnReconnect();
    await testUnsupportedWorkerPreservesFallback();
    await testNoWebLocksFailsCompletionClosed();
    await testSignOutClearsResurrectionProjection();

    console.log(
        'Atlas Batch 5 resurrection passed: authenticated shared discovery wakes unfinished building subjects, paused recovery remains manual, worker generation context survives through checkpoint completion, exact cloud revisions guard automatic completion, and offline failure retries after reconnect.'
    );
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});