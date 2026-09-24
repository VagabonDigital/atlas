'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const cacheSource = fs.readFileSync(
    'shared/atlas-cloud-cache.js',
    'utf8'
);

const authoritySource = fs.readFileSync(
    'shared/atlas-tutor-subjects-cloud-authority.js',
    'utf8'
);

const registrySource = fs.readFileSync(
    'shared/atlas-content-registry.js',
    'utf8'
);

const AUTH_KEY =
    'sb-jnhjfpagectprceswvqn-auth-token';

const HUB_KEY =
    'atlas::compassHubCache::v1::user-test';

class StorageMock {
    constructor(initial = {}) {
        this.map =
            new Map(
                Object.entries(initial)
            );

        this.failHubWrites = false;
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

    setItem(key, value) {
        const normalized =
            String(key);

        if (
            this.failHubWrites &&
            normalized.startsWith(
                'atlas::compassHubCache::'
            )
        ) {
            const error =
                new Error(
                    'Quota exceeded.'
                );

            error.name =
                'QuotaExceededError';

            throw error;
        }

        this.map.set(
            normalized,
            String(value)
        );
    }

    removeItem(key) {
        this.map.delete(
            String(key)
        );
    }
}

function deferred() {
    let resolve;
    let reject;

    const promise =
        new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });

    return {
        promise,
        resolve,
        reject
    };
}

function createQueryPromise(
    sourcePromise
) {
    const query = {
        select() {
            return query;
        },

        eq() {
            return query;
        },

        order() {
            return sourcePromise;
        }
    };

    return query;
}

function cachedSubject({
    description = '',
    revision = 1
} = {}) {
    return {
        schemaVersion: 1,
        id: 'subject-1',
        ownerId: 'local-tutor',
        format: 'structured',

        metadata: {
            title: 'Test Subject',
            navTitle: 'Test Subject',
            description,
            coverImage: ''
        },

        document: {
            module: {
                title: 'Test Subject',
                navTitle: 'Test Subject',
                catalogDescription:
                    description,
                bgImage: ''
            }
        },

        revision,
        createdAt: 1,
        updatedAt: revision,
        provenance: null,
        __atlasSummary: true
    };
}

function cachedHubSnapshot(
    subject
) {
    return {
        version: 3,
        kind:
            'compass-hub-presentation',
        ready: true,
        userId: 'user-test',
        cachedAt: 1,
        summaries: subject
            ? [subject]
            : [],

        library: {
            schemaVersion: 1,
            subjects: subject
                ? {
                    [subject.id]: {
                        libraryIncluded:
                            true,
                        categoryId:
                            'default',
                        archived: false
                    }
                }
                : {}
        }
    };
}

function makeContext({
    staleRowsPromise,
    storage
}) {
    const oldSubject =
        cachedSubject({
            description: '',
            revision: 1
        });

    const Base = {
        async getSession() {
            return {
                user: {
                    id: 'user-test'
                }
            };
        },

        async getClient() {
            return {
                from() {
                    return createQueryPromise(
                        staleRowsPromise
                    );
                },

                auth: {
                    onAuthStateChange() {}
                }
            };
        },

        async getSubjectLibraryState() {
            return cachedHubSnapshot(
                oldSubject
            ).library;
        },

        async getOwnedSubject(id) {
            return id === oldSubject.id
                ? oldSubject
                : null;
        },

        async listOwnedSubjects() {
            return [oldSubject];
        },

        async createOwnedSubject(record) {
            return record;
        },

        async updateOwnedSubject(record) {
            return {
                ...record,
                revision:
                    Math.max(
                        1,
                        Number(
                            record.revision
                        ) || 1
                    ) + 1,
                updatedAt:
                    Date.now()
            };
        },

        async deleteOwnedSubject() {
            return true;
        },

        async createSubjectLibraryState(state) {
            return {
                schemaVersion: 1,
                revision: 1,
                state
            };
        },

        async updateSubjectLibraryState(state) {
            return {
                schemaVersion: 1,
                revision: 2,
                state
            };
        },

        async signInWithPassword() {},
        async signOut() {}
    };

    const window = {
        AtlasCloud: Base,

        location: {
            pathname:
                '/account/'
        },

        dispatchEvent() {},
        setTimeout,
        clearTimeout
    };

    const context = {
        window,
        localStorage:
            storage,
        console,
        setTimeout,
        clearTimeout,
        CustomEvent:
            function CustomEvent() {}
    };

    vm.runInNewContext(
        cacheSource,
        context,
        {
            filename:
                'shared/atlas-cloud-cache.js'
        }
    );

    return {
        window,
        oldSubject
    };
}

async function verifyDeleteBeatsOlderRevalidation() {
    const staleRows =
        deferred();

    const oldSubject =
        cachedSubject();

    const storage =
        new StorageMock({
            [AUTH_KEY]:
                JSON.stringify({
                    user: {
                        id:
                            'user-test'
                    }
                }),

            [HUB_KEY]:
                JSON.stringify(
                    cachedHubSnapshot(
                        oldSubject
                    )
                )
        });

    const {
        window
    } =
        makeContext({
            staleRowsPromise:
                staleRows.promise,
            storage
        });

    const Cloud =
        window.AtlasCloud;

    const initial =
        await Cloud
            .listOwnedSubjectSummaries();

    assert.equal(
        initial.length,
        1
    );

    storage.failHubWrites = true;

    const deleted =
        await Cloud
            .deleteOwnedSubject(
                'subject-1',
                1
            );

    assert.equal(
        deleted,
        true
    );

    assert.equal(
        storage.getItem(HUB_KEY),
        null,
        'Failed cache persistence after deletion must remove the stale snapshot.'
    );

    staleRows.resolve({
        data: [
            {
                id:
                    'subject-1',
                schema_version: 1,
                format:
                    'structured',

                metadata: {
                    title:
                        'Test Subject',
                    navTitle:
                        'Test Subject',
                    description: '',
                    coverImage: ''
                },

                revision: 1,
                provenance: null,
                created_at:
                    new Date(1)
                        .toISOString(),
                updated_at:
                    new Date(1)
                        .toISOString()
            }
        ],

        error: null
    });

    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                10
            )
    );

    const snapshot =
        Cloud
            .getCompassPresentationSnapshot?.() ||
        window.AtlasCloudCache
            .getCompassPresentationSnapshot();

    assert.equal(
        snapshot
            ?.summaries
            ?.some(
                subject =>
                    subject.id ===
                    'subject-1'
            ),
        false,
        'An older background revalidation must never resurrect a deleted subject.'
    );
}

async function verifyUpdateBeatsOlderRevalidation() {
    const staleRows =
        deferred();

    const oldSubject =
        cachedSubject({
            description: '',
            revision: 1
        });

    const storage =
        new StorageMock({
            [AUTH_KEY]:
                JSON.stringify({
                    user: {
                        id:
                            'user-test'
                    }
                }),

            [HUB_KEY]:
                JSON.stringify(
                    cachedHubSnapshot(
                        oldSubject
                    )
                )
        });

    const {
        window
    } =
        makeContext({
            staleRowsPromise:
                staleRows.promise,
            storage
        });

    const Cloud =
        window.AtlasCloud;

    await Cloud
        .listOwnedSubjectSummaries();

    const updated =
        await Cloud
            .updateOwnedSubject(
                {
                    ...oldSubject,

                    metadata: {
                        ...oldSubject
                            .metadata,
                        description:
                            'Fresh introduction'
                    },

                    document: {
                        module: {
                            ...oldSubject
                                .document
                                .module,

                            catalogDescription:
                                'Fresh introduction'
                        }
                    }
                },
                1
            );

    assert.equal(
        updated
            ?.metadata
            ?.description,
        'Fresh introduction'
    );

    staleRows.resolve({
        data: [
            {
                id:
                    'subject-1',
                schema_version: 1,
                format:
                    'structured',

                metadata: {
                    title:
                        'Test Subject',
                    navTitle:
                        'Test Subject',
                    description: '',
                    coverImage: ''
                },

                revision: 1,
                provenance: null,
                created_at:
                    new Date(1)
                        .toISOString(),
                updated_at:
                    new Date(1)
                        .toISOString()
            }
        ],

        error: null
    });

    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                10
            )
    );

    const snapshot =
        window.AtlasCloudCache
            .getCompassPresentationSnapshot();

    const summary =
        snapshot?.summaries
            ?.find(
                subject =>
                    subject.id ===
                    'subject-1'
            );

    assert.equal(
        summary
            ?.metadata
            ?.description,
        'Fresh introduction',
        'An older revalidation must not erase a newly saved card introduction.'
    );
}

async function verifyLibraryOrderBeatsMetadataRecency() {
    const staleRows =
        deferred();

    const first = {
        ...cachedSubject({
            revision: 7
        }),
        id: 'subject-first',
        updatedAt: 700
    };

    const second = {
        ...cachedSubject({
            revision: 8
        }),
        id: 'subject-second',
        updatedAt: 800
    };

    const storage =
        new StorageMock({
            [AUTH_KEY]:
                JSON.stringify({
                    user: {
                        id:
                            'user-test'
                    }
                }),

            [HUB_KEY]:
                JSON.stringify({
                    version: 3,
                    kind:
                        'compass-hub-presentation',
                    ready: true,
                    userId:
                        'user-test',
                    cachedAt: 1,

                    // Simulate the server summary query after subject-second
                    // received a cover/metadata update.
                    summaries: [
                        second,
                        first
                    ],

                    library: {
                        schemaVersion: 1,
                        revision: 4,

                        state: {
                            order: [
                                'subject-first',
                                'subject-second'
                            ],

                            library: {
                                schemaVersion: 1,
                                defaultCategoryId:
                                    'default',

                                categories: [
                                    {
                                        id:
                                            'default',
                                        name:
                                            'My Subjects'
                                    }
                                ],

                                categoryOrder: [
                                    'default'
                                ],

                                subjects: {
                                    'subject-first': {
                                        libraryIncluded:
                                            true,
                                        categoryId:
                                            'default',
                                        archived:
                                            false
                                    },

                                    'subject-second': {
                                        libraryIncluded:
                                            true,
                                        categoryId:
                                            'default',
                                        archived:
                                            false
                                    }
                                }
                            }
                        }
                    }
                })
        });

    const {
        window
    } =
        makeContext({
            staleRowsPromise:
                staleRows.promise,
            storage
        });

    const summaries =
        await window.AtlasCloud
            .listOwnedSubjectSummaries();

    assert.deepEqual(
        Array.from(
            summaries,
            subject => subject.id
        ),
        [
            'subject-first',
            'subject-second'
        ],
        'Metadata recency must not move an existing My Subject ahead of its stored library position.'
    );

    const snapshot =
        window.AtlasCloudCache
            .getCompassPresentationSnapshot();

    assert.deepEqual(
        Array.from(
            snapshot.summaries,
            subject => subject.id
        ),
        [
            'subject-first',
            'subject-second'
        ],
        'The persisted first-paint Compass snapshot must preserve canonical My Subjects ordering.'
    );
}

assert.match(
    cacheSource,
    /const HUB_CACHE_VERSION = 3;/
);

assert.match(
    cacheSource,
    /hubMutationRevision/
);

assert.match(
    cacheSource,
    /mutationRevisionAtStart[\s\S]*?hubMutationRevision !==/
);

assert.match(
    cacheSource,
    /if \(!written\)[\s\S]*?removePersistentHubCache/
);

assert.match(
    authoritySource,
    /Deletion is idempotent[\s\S]*?AtlasCloud\.getOwnedSubject\(id\)/
);

assert.match(
    registrySource,
    /atlas-cloud-cache\.js\?v=20260922-order1/
);

assert.match(
    registrySource,
    /atlas-tutor-subjects-cloud-authority\\.js\\?v=20260924-resurrection1/
);

Promise.resolve()
    .then(
        verifyDeleteBeatsOlderRevalidation
    )
    .then(
        verifyUpdateBeatsOlderRevalidation
    )
    .then(
        verifyLibraryOrderBeatsMetadataRecency
    )
    .then(() => {
        console.log(
            'Compass hub cache authority contract passed: stale revalidation cannot resurrect deleted subjects or erase freshly saved introductions, failed cache writes invalidate stale snapshots, and owned-subject deletion is idempotent.'
        );
    })
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
