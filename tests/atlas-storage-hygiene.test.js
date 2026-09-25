'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const baseSource = fs.readFileSync(
    'shared/atlas-tutor-content.js',
    'utf8'
);

const cloudAuthoritySource = fs.readFileSync(
    'shared/atlas-tutor-content-cloud-authority.js',
    'utf8'
);

const cloudCacheSource = fs.readFileSync(
    'shared/atlas-cloud-cache.js',
    'utf8'
);

const registrySource = fs.readFileSync(
    'shared/atlas-content-registry.js',
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
    const databases =
        new Map();

    function ensureDb(name) {
        if (!databases.has(name)) {
            const stores =
                new Map();

            const db = {
                objectStoreNames: {
                    contains(storeName) {
                        return stores.has(
                            storeName
                        );
                    }
                },

                createObjectStore(storeName) {
                    if (!stores.has(storeName)) {
                        stores.set(
                            storeName,
                            new Map()
                        );
                    }
                },

                transaction(storeName) {
                    const store =
                        stores.get(storeName);

                    if (!store) {
                        throw new Error(
                            `Missing store ${storeName}`
                        );
                    }

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
                                            store.get(
                                                String(key)
                                            );

                                        request.onsuccess?.();
                                    });

                                return request;
                            },

                            getAll() {
                                const request = {
                                    result: null,
                                    error: null,
                                    onsuccess: null,
                                    onerror: null
                                };

                                Promise.resolve()
                                    .then(() => {
                                        request.result =
                                            Array.from(
                                                store.values()
                                            );

                                        request.onsuccess?.();
                                    });

                                return request;
                            },

                            put(value, key) {
                                store.set(
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

                                return {};
                            },

                            delete(key) {
                                store.delete(
                                    String(key)
                                );

                                setTimeout(
                                    () =>
                                        transaction
                                            .oncomplete?.(),
                                    0
                                );

                                return {};
                            }
                        });

                    return transaction;
                },

                __stores: stores
            };

            databases.set(
                name,
                db
            );
        }

        return databases.get(name);
    }

    return {
        databases,

        open(name) {
            const exists =
                databases.has(name);

            const db =
                ensureDb(name);

            const request = {
                result: db,
                error: null,
                onupgradeneeded: null,
                onsuccess: null,
                onerror: null,
                onblocked: null
            };

            setTimeout(() => {
                if (!exists) {
                    request.onupgradeneeded?.();
                }

                setTimeout(
                    () =>
                        request.onsuccess?.(),
                    0
                );
            }, 0);

            return request;
        }
    };
}

async function verifyTutorDraftSurvivesFullLocalStorage() {
    const contentId =
        'compass:travel-exploration';

    const legacyDraft = {
        schemaVersion: 2,
        ownerId: 'local-tutor',
        contentId,
        baseContentVersion: '1.0.0',
        revision: 2,
        updatedAt: 10,
        overrides: {
            'cover.hook':
                'Legacy draft'
        },
        document: {
            schemaVersion: 1,

            module: {
                title:
                    'Legacy Title'
            }
        },
        includedLiveSessionId:
            null,
        activeViewId:
            'view-cover',
        startedAt: 1
    };

    const legacyKey =
        'atlas::tutorContent::workingDraft::' +
        encodeURIComponent(
            contentId
        );

    const duplicateVersionId =
        'compass:food-table';

    const duplicateVersionKey =
        'atlas::tutorContent::version::' +
        encodeURIComponent(
            duplicateVersionId
        );

    const duplicateVersion = {
        schemaVersion: 2,
        ownerId: 'local-tutor',
        contentId:
            duplicateVersionId,
        baseContentVersion:
            '1.0.0',
        revision: 2,
        updatedAt: 5,
        overrides: {
            'cover.hook':
                'Same content'
        },
        document: {
            schemaVersion: 1,

            module: {
                title:
                    'Same Cloud Version'
            }
        }
    };

    const storage =
        new FullLocalStorage({
            [legacyKey]:
                JSON.stringify(
                    legacyDraft
                ),

            [duplicateVersionKey]:
                JSON.stringify(
                    duplicateVersion
                )
        });

    const sessionStorage = {
        map: new Map(),

        get length() {
            return this.map.size;
        },

        key(index) {
            return Array.from(
                this.map.keys()
            )[index] ?? null;
        },

        getItem(key) {
            return this.map.get(
                String(key)
            ) ?? null;
        },

        setItem(key, value) {
            this.map.set(
                String(key),
                String(value)
            );
        },

        removeItem(key) {
            this.map.delete(
                String(key)
            );
        }
    };

    const indexedDB =
        createFakeIndexedDB();

    const account = {
        async initialize() {},

        getState() {
            return {
                authenticated: true,
                userId: 'user-test'
            };
        }
    };

    const cloud = {
        async getTutorContentVersion(id) {
            if (id === duplicateVersionId) {
                return {
                    ...duplicateVersion,
                    revision: 7,
                    updatedAt: 50
                };
            }

            return null;
        },

        async listTutorContentVersions() {
            return [];
        },

        async createTutorContentVersion(value) {
            return value;
        },

        async updateTutorContentVersion(value) {
            return value;
        },

        async deleteTutorContentVersion() {
            return true;
        }
    };

    const window = {
        indexedDB,
        AtlasAccount: account,
        AtlasCloud: cloud,
        setTimeout,
        clearTimeout
    };

    const context = {
        window,
        localStorage: storage,
        sessionStorage,
        AtlasAccount: account,
        AtlasCloud: cloud,
        console,
        setTimeout,
        clearTimeout
    };

    vm.runInNewContext(
        baseSource,
        context,
        {
            filename:
                'shared/atlas-tutor-content.js'
        }
    );

    vm.runInNewContext(
        cloudAuthoritySource,
        context,
        {
            filename:
                'shared/atlas-tutor-content-cloud-authority.js'
        }
    );

    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                20
            )
    );

    const Store =
        window.AtlasTutorContent;

    const migrated =
        await Store.getWorkingDraft(
            contentId
        );

    assert.equal(
        migrated?.document
            ?.module
            ?.title,
        'Legacy Title',
        'Legacy localStorage tutor draft should migrate without data loss.'
    );

    assert.equal(
        storage.getItem(
            legacyKey
        ),
        null,
        'Migrated tutor draft must be removed from quota-constrained localStorage.'
    );

    assert.equal(
        storage.getItem(
            duplicateVersionKey
        ),
        null,
        'Exact cloud-backed committed My Version duplicate should be reclaimed from localStorage.'
    );


    const saved =
        await Store.saveWorkingDraft(
            contentId,
            {
                document: {
                    schemaVersion: 1,

                    module: {
                        title:
                            'Current Title'
                    }
                },

                overrides: {
                    'cover.hook':
                        'Current draft'
                },

                activeViewId:
                    'view-overview'
            }
        );

    assert.equal(
        saved?.document
            ?.module
            ?.title,
        'Current Title',
        'Signed-in tutor working draft must save with localStorage completely full.'
    );

    const reread =
        await Store.getWorkingDraft(
            contentId
        );

    assert.equal(
        reread?.document
            ?.module
            ?.title,
        'Current Title'
    );

    const db =
        indexedDB.databases.get(
            'atlas-tutor-content'
        );

    assert.ok(
        db?.__stores
            ?.get('working-drafts')
            ?.has(contentId),
        'Signed-in Tutor Content draft must live in IndexedDB.'
    );

    assert.equal(
        await Store.clearWorkingDraft(
            contentId
        ),
        true
    );

    assert.equal(
        await Store.getWorkingDraft(
            contentId
        ),
        null
    );
}

assert.match(
    cloudAuthoritySource,
    /WORKING_DRAFT_DB_NAME =\s*'atlas-tutor-content'/
);

assert.match(
    cloudAuthoritySource,
    /Local\.saveWorkingDraft\s*=\s*saveWorkingDraft/
);

assert.match(
    cloudAuthoritySource,
    /Local\.clearWorkingDraft\s*=\s*clearWorkingDraft/
);

assert.match(
    cloudCacheSource,
    /SUBJECT_BROWSER_STATE_DB_NAME =\s*'atlas-tutor-subjects'/
);

assert.match(
    cloudCacheSource,
    /reclaimBrowserProjectionStorage/
);

assert.match(
    cloudCacheSource,
    /reconcileOwnedSubjectRegistryProjection/
);

assert.match(
    cloudCacheSource,
    /readSubjectBrowserState\([\s\S]*?'build-checkpoint'/
);

assert.match(
    registrySource,
    /atlas-cloud-cache\\.js\\?v=20260925-storagehygiene1/
);

assert.match(
    registrySource,
    /atlas-tutor-content-cloud-authority\.js\?v=20260922-storage2/
);

verifyTutorDraftSurvivesFullLocalStorage()
    .then(() => {
        console.log(
            'Atlas storage hygiene contract passed: signed-in Tutor Content working drafts migrate to IndexedDB and remain writable when localStorage is completely full; exact cloud-backed committed duplicates are reclaimed; the Compass hub reads the IndexedDB subject journal.'
        );
    })
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
