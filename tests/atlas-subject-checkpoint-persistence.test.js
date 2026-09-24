'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const authoritySource = fs.readFileSync(
    'shared/atlas-tutor-subjects-cloud-authority.js',
    'utf8'
);

const engineSource = fs.readFileSync(
    'compass/shared/compass-engine.js',
    'utf8'
);

const recoverySource = fs.readFileSync(
    'compass/shared/compass-generation-recovery.js',
    'utf8'
);

const subjectPage = fs.readFileSync(
    'compass/subject/index.html',
    'utf8'
);

class FullLocalStorage {
    constructor(initial = {}) {
        this.map =
            new Map(
                Object.entries(initial)
            );
    }

    get length() {
        return this.map.size;
    }

    key(index) {
        return Array.from(
            this.map.keys()
        )[index] ?? null;
    }

    getItem(key) {
        const normalized =
            String(key);

        return this.map.has(normalized)
            ? this.map.get(normalized)
            : null;
    }

    setItem(key) {
        const error =
            new Error(
                `Setting ${key} exceeded browser storage quota.`
            );

        error.name =
            'QuotaExceededError';

        error.code = 22;
        throw error;
    }

    removeItem(key) {
        this.map.delete(
            String(key)
        );
    }
}

function createFakeIndexedDB() {
    const records =
        new Map();

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

        transaction() {
            const transaction = {
                error: null,
                oncomplete: null,
                onerror: null,
                onabort: null
            };

            transaction.objectStore =
                () => ({
                    get(key) {
                        const request = {
                            result: null,
                            error: null,
                            onsuccess: null,
                            onerror: null
                        };

                        Promise.resolve()
                            .then(() => {
                                request.result =
                                    records.get(
                                        String(key)
                                    );

                                request.onsuccess?.();
                            });

                        return request;
                    },

                    put(value, key) {
                        records.set(
                            String(key),
                            JSON.parse(
                                JSON.stringify(
                                    value
                                )
                            )
                        );

                        setTimeout(
                            () =>
                                transaction
                                    .oncomplete?.(),
                            0
                        );
                    },

                    delete(key) {
                        records.delete(
                            String(key)
                        );

                        setTimeout(
                            () =>
                                transaction
                                    .oncomplete?.(),
                            0
                        );
                    }
                });

            return transaction;
        }
    };

    return {
        records,

        open() {
            const request = {
                result: db,
                error: null,
                onupgradeneeded: null,
                onsuccess: null,
                onerror: null,
                onblocked: null
            };

            setTimeout(
                () => request.onsuccess?.(),
                0
            );

            return request;
        }
    };
}

function buildCheckpoint(
    subjectId,
    title,
    completedStep,
    updatedAt
) {
    return {
        schemaVersion: 1,
        subjectId,

        workingDraft: {
            schemaVersion: 1,
            subjectId,
            ownerId: 'local-tutor',
            format: 'structured',
            baseRevision: 1,

            document: {
                schemaVersion: 1,

                module: {
                    title
                }
            },

            includedLiveSessionId:
                null,

            activeViewId:
                'view-cover',

            startedAt:
                updatedAt,

            updatedAt
        },

        buildState: {
            schemaVersion: 1,
            subjectId,
            kind: 'full-subject',
            completedStep,
            autoSaveOnComplete:
                true,
            generationContext: {
                version:
                    1,
                premise:
                    'Legacy context'
            },
            startedAt:
                updatedAt,
            updatedAt
        },

        updatedAt
    };
}

async function loadAuthority({
    storage,
    indexedDB
}) {
    const subject = {
        schemaVersion: 1,
        id: 'subject-active',
        revision: 3,

        metadata: {
            title: 'Test Subject'
        },

        document: {
            schemaVersion: 1,

            module: {
                title: 'Test Subject'
            }
        }
    };

    const account = {
        async initialize() {},

        getState() {
            return {
                authenticated: true,
                userId: 'user-test'
            };
        }
    };

    const updateCalls = [];

    const cloud = {
        async getOwnedSubject(id) {
            return id === subject.id
                ? JSON.parse(
                    JSON.stringify(
                        subject
                    )
                )
                : null;
        },

        async listOwnedSubjects() {
            return [
                JSON.parse(
                    JSON.stringify(
                        subject
                    )
                )
            ];
        },

        async updateOwnedSubject(
            record,
            expectedRevision
        ) {
            if (
                subject.revision !==
                    expectedRevision
            ) {
                const error =
                    new Error(
                        'Revision conflict'
                    );

                error.code =
                    'ATLAS_REVISION_CONFLICT';

                throw error;
            }

            updateCalls.push({
                record:
                    JSON.parse(
                        JSON.stringify(
                            record
                        )
                    ),
                expectedRevision
            });

            subject.metadata =
                JSON.parse(
                    JSON.stringify(
                        record.metadata ||
                        {}
                    )
                );

            subject.document =
                JSON.parse(
                    JSON.stringify(
                        record.document
                    )
                );

            subject.provenance =
                record.provenance
                    ? JSON.parse(
                        JSON.stringify(
                            record.provenance
                        )
                    )
                    : null;

            subject.revision =
                expectedRevision + 1;

            return JSON.parse(
                JSON.stringify(
                    subject
                )
            );
        }
    };

    const window = {
        indexedDB,
        AtlasTutorSubjects: {},

        AtlasStructuredSubject: {
            validateDocument() {
                return {
                    valid: true,
                    errors: []
                };
            }
        },

        AtlasAccount:
            account,

        AtlasCloud:
            cloud,

        setTimeout,
        clearTimeout
    };

    const context = {
        window,
        localStorage:
            storage,
        AtlasAccount:
            account,
        AtlasCloud:
            cloud,
        console,
        setTimeout,
        clearTimeout
    };

    vm.runInNewContext(
        authoritySource,
        context,
        {
            filename:
                'shared/atlas-tutor-subjects-cloud-authority.js'
        }
    );

    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                10
            )
    );

    return {
        Subjects:
            window.AtlasTutorSubjects,
        subject,
        updateCalls
    };
}

async function verifyFullLocalStorageDoesNotBlockGeneration() {
    const legacy =
        buildCheckpoint(
            'subject-active',
            'Legacy Subject',
            2,
            10
        );

    const storage =
        new FullLocalStorage({
            'atlas::tutorSubjects::buildCheckpoint::subject-active':
                JSON.stringify(
                    legacy
                ),

            'atlas::tutorSubjects::workingDraft::subject-active':
                JSON.stringify(
                    legacy
                        .workingDraft
                ),

            'atlas::tutorSubjects::buildState::subject-active':
                JSON.stringify(
                    legacy
                        .buildState
                ),

            'atlas::tutorSubjects::subject::subject-active':
                JSON.stringify({
                    id:
                        'subject-active',

                    document: {
                        legacy:
                            true
                    }
                })
        });

    const indexedDB =
        createFakeIndexedDB();

    const {
        Subjects
    } =
        await loadAuthority({
            storage,
            indexedDB
        });

    const migrated =
        await Subjects
            .getBuildState(
                'subject-active'
            );

    assert.equal(
        migrated?.completedStep,
        2,
        'Legacy generation checkpoint should survive migration out of localStorage.'
    );

    const saved =
        await Subjects
            .saveBuildCheckpoint(
                'subject-active',
                {
                    workingDraft: {
                        baseRevision: 3,

                        document: {
                            schemaVersion: 1,

                            module: {
                                title:
                                    'Current Subject'
                            }
                        },

                        activeViewId:
                            'view-discussion'
                    },

                    buildState: {
                        kind:
                            'full-subject',
                        completedStep: 3,
                        autoSaveOnComplete:
                            true,
                        generationContext: {
                            version:
                                1,
                            premise:
                                'Current Affairs context',
                            source: {
                                readMore:
                                    'Persist this across all pages closing.'
                            }
                        }
                    }
                }
            );

    assert.equal(
        saved?.buildState
            ?.completedStep,
        3,
        'Generation checkpoint must save even when every localStorage write is rejected.'
    );

    assert.equal(
        saved?.buildState
            ?.generationContext
            ?.source
            ?.readMore,
        'Persist this across all pages closing.',
        'Generation context must remain inside the canonical build checkpoint.'
    );

    const persistedBuildState =
        await Subjects
            .getBuildState(
                'subject-active'
            );

    assert.equal(
        persistedBuildState
            ?.generationContext
            ?.premise,
        'Current Affairs context',
        'Checkpoint reads must restore the latest generation context after browser resurrection.'
    );

    const draft =
        await Subjects
            .getWorkingDraft(
                'subject-active'
            );

    assert.equal(
        draft?.document
            ?.module
            ?.title,
        'Current Subject'
    );

    assert.equal(
        storage.getItem(
            'atlas::tutorSubjects::buildCheckpoint::subject-active'
        ),
        null,
        'Migrated checkpoint must be removed from quota-constrained localStorage.'
    );

    assert.equal(
        storage.getItem(
            'atlas::tutorSubjects::workingDraft::subject-active'
        ),
        null,
        'Migrated working draft must be removed from quota-constrained localStorage.'
    );

    assert.equal(
        storage.getItem(
            'atlas::tutorSubjects::buildState::subject-active'
        ),
        null,
        'Migrated build state must be removed from quota-constrained localStorage.'
    );

    assert.equal(
        storage.getItem(
            'atlas::tutorSubjects::subject::subject-active'
        ),
        null,
        'Cloud-backed legacy full subject copies must be reclaimed from localStorage.'
    );

    assert.ok(
        indexedDB.records.has(
            'build-checkpoint::subject-active'
        ),
        'Atomic generation checkpoint must live in IndexedDB.'
    );
}

async function verifyExactRevisionBoundary() {
    const storage =
        new FullLocalStorage();

    const indexedDB =
        createFakeIndexedDB();

    const {
        Subjects,
        subject,
        updateCalls
    } =
        await loadAuthority({
            storage,
            indexedDB
        });

    const saved =
        await Subjects
            .updateSubjectAtRevision(
                'subject-active',
                {
                    metadata: {
                        aiBuildStatus:
                            'complete'
                    }
                },
                3
            );

    assert.equal(
        saved?.revision,
        4
    );

    assert.equal(
        updateCalls[0]
            ?.expectedRevision,
        3,
        'Automatic completion must send the checkpoint revision to the server-owned optimistic lock.'
    );

    await assert.rejects(
        () =>
            Subjects
                .updateSubjectAtRevision(
                    'subject-active',
                    {
                        metadata: {
                            aiBuildStatus:
                                'paused'
                        }
                    },
                    3
                ),
        error =>
            error?.code ===
                'ATLAS_REVISION_CONFLICT',
        'A stale checkpoint revision must fail closed instead of overwriting newer cloud state.'
    );

    assert.equal(
        subject.revision,
        4
    );
}

assert.match(
    authoritySource,
    /BROWSER_STATE_DB_NAME = 'atlas-tutor-subjects'/
);

assert.match(
    authoritySource,
    /writeIndexedBrowserState[\s\S]*?BROWSER_STATE_STORE/
);

assert.match(
    authoritySource,
    /migrateLegacyGenerationStorage[\s\S]*?WORKING_DRAFT_PREFIX[\s\S]*?BUILD_CHECKPOINT_PREFIX/
);

assert.match(
    authoritySource,
    /pruneCloudBackedLegacySubjects[\s\S]*?SUBJECT_PREFIX/
);

assert.match(
    authoritySource,
    /saveBuildCheckpoint[\s\S]*?writeBrowserSubjectState\([\s\S]*?'build-checkpoint'/
);

assert.doesNotMatch(
    subjectPage,
    /atlas-tutor-subjects-cloud-read\.js/,
    'Deleted cloud-read canary must not remain in the subject page.'
);

assert.match(
    engineSource,
    /checkpointError = error;[\s\S]*?if \(checkpointError\) \{\s*throw checkpointError;/
);

assert.match(
    recoverySource,
    /isCheckpointStorageFailure[\s\S]*?showRetryButton\(true\)[\s\S]*?return;/
);

Promise.all([
    verifyFullLocalStorageDoesNotBlockGeneration(),
    verifyExactRevisionBoundary()
])
    .then(() => {
        console.log(
            'Atlas subject persistence contract passed: full localStorage no longer blocks signed-in subject generation, generation context survives the canonical IndexedDB checkpoint, exact-revision completion fails closed on stale cloud state, legacy full-document state migrates safely, and cloud-backed legacy subject copies are reclaimed.'
        );
    })
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
