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

class TestStorage {
    constructor({
        failCheckpointWrites = 0
    } = {}) {
        this.map = new Map();
        this.failCheckpointWrites =
            failCheckpointWrites;
    }

    get length() {
        return this.map.size;
    }

    key(index) {
        return Array.from(this.map.keys())[
            index
        ] ?? null;
    }

    getItem(key) {
        return this.map.has(key)
            ? this.map.get(key)
            : null;
    }

    setItem(key, value) {
        if (
            String(key).startsWith(
                'atlas::tutorSubjects::buildCheckpoint::subject-active'
            ) &&
            this.failCheckpointWrites > 0
        ) {
            this.failCheckpointWrites -= 1;

            const error =
                new Error(
                    'Storage quota exceeded.'
                );

            error.name =
                'QuotaExceededError';

            error.code = 22;
            throw error;
        }

        this.map.set(
            String(key),
            String(value)
        );
    }

    removeItem(key) {
        this.map.delete(
            String(key)
        );
    }
}

function checkpointRecord(
    subjectId,
    updatedAt = 10
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
                schemaVersion: 1
            },
            includedLiveSessionId: null,
            activeViewId: 'view-cover',
            startedAt: updatedAt,
            updatedAt
        },

        buildState: {
            schemaVersion: 1,
            subjectId,
            kind: 'full-subject',
            completedStep: 4,
            autoSaveOnComplete: true,
            startedAt: updatedAt,
            updatedAt
        },

        updatedAt
    };
}

function loadAuthority(storage) {
    const subject = {
        schemaVersion: 1,
        id: 'subject-active',
        revision: 1,
        metadata: {
            title: 'Test Subject'
        },
        document: {
            schemaVersion: 1
        }
    };

    const window = {
        AtlasTutorSubjects: {},
        AtlasStructuredSubject: {
            validateDocument() {
                return {
                    valid: true,
                    errors: []
                };
            }
        },
        AtlasAccount: {
            async initialize() {},
            getState() {
                return {
                    authenticated: true,
                    userId: 'user-test'
                };
            }
        },
        AtlasCloud: {
            async getOwnedSubject(id) {
                return id === subject.id
                    ? JSON.parse(
                        JSON.stringify(
                            subject
                        )
                    )
                    : null;
            }
        },
        setTimeout,
        clearTimeout
    };

    const context = {
        window,
        localStorage: storage,
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

    return window.AtlasTutorSubjects;
}

async function verifyQuotaCleanupAndRetry() {
    const storage =
        new TestStorage({
            failCheckpointWrites: 1
        });

    const oldId =
        'subject-old';

    const oldCheckpointKey =
        `atlas::tutorSubjects::buildCheckpoint::${oldId}`;

    const oldDraftKey =
        `atlas::tutorSubjects::workingDraft::${oldId}`;

    const oldStateKey =
        `atlas::tutorSubjects::buildState::${oldId}`;

    const oldCheckpoint =
        checkpointRecord(
            oldId,
            10
        );

    storage.map.set(
        oldCheckpointKey,
        JSON.stringify(
            oldCheckpoint
        )
    );

    storage.map.set(
        oldDraftKey,
        JSON.stringify(
            oldCheckpoint
                .workingDraft
        )
    );

    storage.map.set(
        oldStateKey,
        JSON.stringify(
            oldCheckpoint
                .buildState
        )
    );

    const Subjects =
        loadAuthority(storage);

    const saved =
        await Subjects
            .saveBuildCheckpoint(
                'subject-active',
                {
                    workingDraft: {
                        baseRevision: 1,
                        document: {
                            schemaVersion: 1
                        },
                        activeViewId:
                            'view-cover'
                    },

                    buildState: {
                        kind:
                            'full-subject',
                        completedStep: 0,
                        autoSaveOnComplete:
                            true
                    }
                }
            );

    assert.equal(
        saved?.buildState
            ?.completedStep,
        0
    );

    assert.ok(
        storage.getItem(
            'atlas::tutorSubjects::buildCheckpoint::subject-active'
        ),
        'Atomic checkpoint should succeed after safe cleanup.'
    );

    assert.equal(
        storage.getItem(
            'atlas::tutorSubjects::workingDraft::subject-active'
        ),
        null,
        'Full working document must not be duplicated beside the checkpoint.'
    );

    assert.equal(
        storage.getItem(
            'atlas::tutorSubjects::buildState::subject-active'
        ),
        null,
        'Build-state mirror must not be duplicated beside the checkpoint.'
    );

    assert.ok(
        storage.getItem(
            oldCheckpointKey
        ),
        'Existing authoritative checkpoint must be preserved.'
    );

    assert.equal(
        storage.getItem(oldDraftKey),
        null,
        'Reconstructable working-draft mirror should be reclaimed.'
    );

    assert.equal(
        storage.getItem(oldStateKey),
        null,
        'Reconstructable build-state mirror should be reclaimed.'
    );
}

async function verifyPersistentQuotaIsObservable() {
    const storage =
        new TestStorage({
            failCheckpointWrites: 2
        });

    const Subjects =
        loadAuthority(storage);

    await assert.rejects(
        () =>
            Subjects.saveBuildCheckpoint(
                'subject-active',
                {
                    workingDraft: {
                        baseRevision: 1,
                        document: {
                            schemaVersion: 1
                        }
                    },

                    buildState: {
                        kind:
                            'full-subject',
                        completedStep: 0,
                        autoSaveOnComplete:
                            true
                    }
                }
            ),
        error =>
            error?.code ===
                'ATLAS_CHECKPOINT_STORAGE_QUOTA' &&
            error?.name ===
                'AtlasCheckpointStorageError'
    );
}

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
    engineSource,
    /releaseCompassSubjectBuildHandoff\(\);[\s\S]*?await freshBuildCloudAuthorityPromise[\s\S]*?await requestMyVersionEditing/
);

assert.match(
    recoverySource,
    /isCheckpointStorageFailure[\s\S]*?showRetryButton\(true\)[\s\S]*?return;/
);

assert.match(
    recoverySource,
    /manual &&[\s\S]*?lastCheckpointFailure[\s\S]*?originalCheckpointFullSubject/
);

Promise.resolve()
    .then(
        verifyQuotaCleanupAndRetry
    )
    .then(
        verifyPersistentQuotaIsObservable
    )
    .then(() => {
        console.log(
            'Atlas checkpoint persistence contract passed: the atomic journal is single-copy, quota cleanup only removes reconstructable mirrors, persistent storage failure remains observable, recovery does not auto-loop, cloud authority precedes authoring, and the stale 404 runtime is gone.'
        );
    })
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
