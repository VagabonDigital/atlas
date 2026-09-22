/* ============================================================
   ATLAS TUTOR CONTENT — CLOUD AUTHORITY

   Authenticated authority for committed Tutor Authorship / My Versions.

   Cloud authoritative when signed in:
   - committed My Version records

   Browser-local by design:
   - working drafts
   - Live Manipulation session drafts

   Local working drafts may resume only when they are newer than the
   committed cloud version. A stale browser draft must never mask a newer
   account-owned My Version from another browser/device.

   Signed-out behavior remains on the existing AtlasTutorContent boundary.
   No authenticated cloud write silently falls back to localStorage.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasTutorContentCloudAuthority) return;

    const Local = window.AtlasTutorContent;

    if (!Local) {
        console.error(
            '[AtlasTutorContentCloudAuthority] AtlasTutorContent is unavailable.'
        );
        return;
    }

    const SCHEMA_VERSION = 2;
    const PORTABLE_SCHEMA_VERSION = 1;
    const LOCAL_OWNER_ID = 'local-tutor';

    const original = Object.fromEntries(
        Object.entries(Local).map(([key, value]) => [
            key,
            typeof value === 'function' ? value.bind(Local) : value
        ])
    );

    const cloudVersionReads = new Map();

    const WORKING_DRAFT_DB_NAME =
        'atlas-tutor-content';
    const WORKING_DRAFT_DB_VERSION = 1;
    const WORKING_DRAFT_STORE =
        'working-drafts';
    const LEGACY_WORKING_DRAFT_PREFIX =
        'atlas::tutorContent::workingDraft::';

    let workingDraftDbPromise = null;
    let workingDraftMigrationPromise = null;

    function openWorkingDraftDb() {
        if (workingDraftDbPromise) {
            return workingDraftDbPromise;
        }

        if (!window.indexedDB) {
            return Promise.resolve(null);
        }

        workingDraftDbPromise =
            new Promise((resolve, reject) => {
                let request = null;

                try {
                    request =
                        window.indexedDB.open(
                            WORKING_DRAFT_DB_NAME,
                            WORKING_DRAFT_DB_VERSION
                        );
                } catch (error) {
                    reject(error);
                    return;
                }

                request.onupgradeneeded = () => {
                    const db = request.result;

                    if (
                        !db.objectStoreNames.contains(
                            WORKING_DRAFT_STORE
                        )
                    ) {
                        db.createObjectStore(
                            WORKING_DRAFT_STORE
                        );
                    }
                };

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    reject(
                        request.error ||
                        new Error(
                            'Atlas tutor draft storage could not open.'
                        )
                    );
                };

                request.onblocked = () => {
                    reject(
                        new Error(
                            'Atlas tutor draft storage upgrade is blocked.'
                        )
                    );
                };
            })
            .catch(error => {
                workingDraftDbPromise = null;

                console.warn(
                    '[AtlasTutorContentCloudAuthority] IndexedDB working-draft storage is unavailable:',
                    error
                );

                return null;
            });

        return workingDraftDbPromise;
    }

    async function readIndexedWorkingDraft(
        contentId
    ) {
        const db =
            await openWorkingDraftDb();

        if (!db) return null;

        return new Promise((resolve, reject) => {
            const transaction =
                db.transaction(
                    WORKING_DRAFT_STORE,
                    'readonly'
                );

            const request =
                transaction
                    .objectStore(
                        WORKING_DRAFT_STORE
                    )
                    .get(
                        String(
                            contentId || ''
                        ).trim()
                    );

            request.onsuccess = () => {
                resolve(
                    request.result === undefined
                        ? null
                        : cloneJson(
                            request.result
                        )
                );
            };

            request.onerror = () => {
                reject(
                    request.error ||
                    new Error(
                        'Atlas tutor draft could not be read.'
                    )
                );
            };
        });
    }

    async function writeIndexedWorkingDraft(
        contentId,
        value
    ) {
        const db =
            await openWorkingDraftDb();

        if (!db) return false;

        return new Promise((resolve, reject) => {
            const transaction =
                db.transaction(
                    WORKING_DRAFT_STORE,
                    'readwrite'
                );

            transaction.oncomplete = () => {
                resolve(true);
            };

            transaction.onerror = () => {
                reject(
                    transaction.error ||
                    new Error(
                        'Atlas tutor draft could not be saved.'
                    )
                );
            };

            transaction.onabort = () => {
                reject(
                    transaction.error ||
                    new Error(
                        'Atlas tutor draft save was aborted.'
                    )
                );
            };

            transaction
                .objectStore(
                    WORKING_DRAFT_STORE
                )
                .put(
                    cloneJson(value),
                    String(
                        contentId || ''
                    ).trim()
                );
        });
    }

    async function deleteIndexedWorkingDraft(
        contentId
    ) {
        const db =
            await openWorkingDraftDb();

        if (!db) return true;

        return new Promise((resolve, reject) => {
            const transaction =
                db.transaction(
                    WORKING_DRAFT_STORE,
                    'readwrite'
                );

            transaction.oncomplete = () => {
                resolve(true);
            };

            transaction.onerror = () => {
                reject(
                    transaction.error ||
                    new Error(
                        'Atlas tutor draft could not be cleared.'
                    )
                );
            };

            transaction.onabort = () => {
                reject(
                    transaction.error ||
                    new Error(
                        'Atlas tutor draft clear was aborted.'
                    )
                );
            };

            transaction
                .objectStore(
                    WORKING_DRAFT_STORE
                )
                .delete(
                    String(
                        contentId || ''
                    ).trim()
                );
        });
    }

    async function listIndexedWorkingDrafts() {
        const db =
            await openWorkingDraftDb();

        if (!db) return [];

        return new Promise((resolve, reject) => {
            const transaction =
                db.transaction(
                    WORKING_DRAFT_STORE,
                    'readonly'
                );

            const request =
                transaction
                    .objectStore(
                        WORKING_DRAFT_STORE
                    )
                    .getAll();

            request.onsuccess = () => {
                resolve(
                    Array.isArray(
                        request.result
                    )
                        ? cloneJson(
                            request.result
                        )
                        : []
                );
            };

            request.onerror = () => {
                reject(
                    request.error ||
                    new Error(
                        'Atlas tutor drafts could not be listed.'
                    )
                );
            };
        });
    }

    function listLegacyWorkingDraftKeys() {
        const keys = [];

        try {
            for (
                let index = 0;
                index < localStorage.length;
                index += 1
            ) {
                const key =
                    localStorage.key(index);

                if (
                    key &&
                    key.startsWith(
                        LEGACY_WORKING_DRAFT_PREFIX
                    )
                ) {
                    keys.push(key);
                }
            }
        } catch { }

        return keys;
    }

    async function migrateLegacyWorkingDrafts() {
        if (workingDraftMigrationPromise) {
            return workingDraftMigrationPromise;
        }

        workingDraftMigrationPromise =
            (async () => {
                let migrated = 0;

                for (
                    const key of
                    listLegacyWorkingDraftKeys()
                ) {
                    let contentId = '';
                    let record = null;

                    try {
                        contentId =
                            decodeURIComponent(
                                key.slice(
                                    LEGACY_WORKING_DRAFT_PREFIX.length
                                )
                            );

                        const raw =
                            localStorage.getItem(
                                key
                            );

                        record =
                            raw
                                ? JSON.parse(raw)
                                : null;
                    } catch {
                        continue;
                    }

                    const normalized =
                        normalizeWorkingDraft(
                            record,
                            contentId
                        );

                    if (!normalized) {
                        continue;
                    }

                    try {
                        const saved =
                            await writeIndexedWorkingDraft(
                                contentId,
                                normalized
                            );

                        if (saved) {
                            try {
                                localStorage.removeItem(
                                    key
                                );
                            } catch { }

                            migrated += 1;
                        }
                    } catch (error) {
                        console.warn(
                            '[AtlasTutorContentCloudAuthority] Legacy tutor draft migration paused:',
                            error
                        );

                        return migrated;
                    }
                }

                return migrated;
            })();

        return workingDraftMigrationPromise;
    }

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function normalizeOverrides(overrides) {
        if (
            !overrides ||
            typeof overrides !== 'object' ||
            Array.isArray(overrides)
        ) {
            return {};
        }

        return Object.entries(overrides).reduce(
            (result, [fieldKey, value]) => {
                if (
                    typeof fieldKey === 'string' &&
                    fieldKey.trim() &&
                    typeof value === 'string'
                ) {
                    result[fieldKey] = value;
                }

                return result;
            },
            {}
        );
    }

    function normalizeDocument(document) {
        if (
            !document ||
            typeof document !== 'object' ||
            Array.isArray(document)
        ) {
            return null;
        }

        try {
            return JSON.parse(JSON.stringify(document));
        } catch {
            return null;
        }
    }

    function normalizeRecord(record, contentId) {
        if (
            !record ||
            typeof record !== 'object' ||
            Array.isArray(record)
        ) {
            return null;
        }

        const id = String(contentId || record.contentId || '').trim();
        if (!id) return null;

        return {
            schemaVersion: SCHEMA_VERSION,
            ownerId: LOCAL_OWNER_ID,
            contentId: id,
            baseContentVersion:
                typeof record.baseContentVersion === 'string'
                    ? record.baseContentVersion
                    : '',
            revision: Math.max(
                0,
                Math.floor(Number(record.revision) || 0)
            ),
            updatedAt: Math.max(
                0,
                Number(record.updatedAt) || 0
            ),
            overrides: normalizeOverrides(record.overrides),
            document: normalizeDocument(record.document)
        };
    }

    function normalizeWorkingDraft(
        record,
        contentId
    ) {
        const normalized =
            normalizeRecord(
                record,
                contentId
            );

        if (!normalized) {
            return null;
        }

        return {
            ...normalized,

            includedLiveSessionId:
                typeof record
                    ?.includedLiveSessionId ===
                    'string' &&
                record
                    .includedLiveSessionId
                    .trim()
                    ? record
                        .includedLiveSessionId
                        .trim()
                    : null,

            activeViewId:
                typeof record
                    ?.activeViewId ===
                    'string' &&
                record
                    .activeViewId
                    .trim()
                    ? record
                        .activeViewId
                        .trim()
                    : 'view-cover',

            startedAt:
                Math.max(
                    0,
                    Number(
                        record?.startedAt
                    ) ||
                    Number(
                        normalized.updatedAt
                    ) ||
                    Date.now()
                )
        };
    }

    function mergeRecord(current, patch, contentId) {
        const base = normalizeRecord(current, contentId) || {
            schemaVersion: SCHEMA_VERSION,
            ownerId: LOCAL_OWNER_ID,
            contentId,
            baseContentVersion: '',
            revision: 0,
            updatedAt: 0,
            overrides: {},
            document: null
        };

        const nextPatch =
            patch &&
            typeof patch === 'object' &&
            !Array.isArray(patch)
                ? patch
                : {};

        const overrides = nextPatch.replaceOverrides === true
            ? normalizeOverrides(nextPatch.overrides)
            : {
                ...base.overrides,
                ...normalizeOverrides(nextPatch.overrides)
            };

        const removeOverrideKeys = Array.isArray(
            nextPatch.removeOverrideKeys
        )
            ? nextPatch.removeOverrideKeys
            : [];

        removeOverrideKeys.forEach(fieldKey => {
            if (typeof fieldKey === 'string') {
                delete overrides[fieldKey];
            }
        });

        const document = Object.prototype.hasOwnProperty.call(
            nextPatch,
            'document'
        )
            ? normalizeDocument(nextPatch.document)
            : base.document;

        return {
            ...base,
            baseContentVersion:
                typeof nextPatch.baseContentVersion === 'string'
                    ? nextPatch.baseContentVersion
                    : base.baseContentVersion,
            revision: base.revision + 1,
            updatedAt: Date.now(),
            overrides,
            document
        };
    }

    async function getAccountState() {
        if (!window.AtlasAccount || !window.AtlasCloud) {
            return {
                ready: true,
                authenticated: false,
                userId: null,
                email: null
            };
        }

        await AtlasAccount.initialize();
        return AtlasAccount.getState();
    }

    async function useCloud() {
        return Boolean((await getAccountState()).authenticated);
    }

    function readCloudVersion(contentId) {
        const id = String(contentId || '').trim();
        if (!id) return Promise.resolve(null);

        const existing = cloudVersionReads.get(id);
        if (existing) return existing;

        const pending = AtlasCloud.getTutorContentVersion(id);
        cloudVersionReads.set(id, pending);

        const release = () => {
            if (cloudVersionReads.get(id) === pending) {
                cloudVersionReads.delete(id);
            }
        };

        pending.then(release, release);
        return pending;
    }

    async function getVersion(contentId) {
        const id = String(contentId || '').trim();
        if (!id) return null;

        if (!(await useCloud())) {
            return original.getVersion(id);
        }

        return readCloudVersion(id);
    }

    async function getWorkingDraft(contentId) {
        const id = String(contentId || '').trim();
        if (!id) return null;

        if (!(await useCloud())) {
            return original.getWorkingDraft(id);
        }

        await migrateLegacyWorkingDrafts();

        const draft =
            normalizeWorkingDraft(
                await readIndexedWorkingDraft(
                    id
                ),
                id
            );

        if (!draft) {
            return null;
        }

        const committed =
            await readCloudVersion(id);

        if (!committed) {
            return draft;
        }

        const draftUpdatedAt = Math.max(
            0,
            Number(draft.updatedAt) || 0
        );

        const committedUpdatedAt = Math.max(
            0,
            Number(committed.updatedAt) || 0
        );

        if (
            committedUpdatedAt >=
            draftUpdatedAt
        ) {
            await deleteIndexedWorkingDraft(
                id
            ).catch(() => undefined);

            return null;
        }

        return draft;
    }

    async function saveWorkingDraft(
        contentId,
        patch = {}
    ) {
        const id =
            String(
                contentId || ''
            ).trim();

        if (!id) return null;

        if (!(await useCloud())) {
            return original.saveWorkingDraft(
                id,
                patch
            );
        }

        await migrateLegacyWorkingDrafts();

        const current =
            normalizeWorkingDraft(
                await readIndexedWorkingDraft(
                    id
                ),
                id
            );

        const nextPatch =
            patch &&
            typeof patch === 'object' &&
            !Array.isArray(patch)
                ? patch
                : {};

        const merged =
            mergeRecord(
                current,
                nextPatch,
                id
            );

        const next =
            normalizeWorkingDraft(
                {
                    ...merged,

                    includedLiveSessionId:
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                nextPatch,
                                'includedLiveSessionId'
                            )
                            ? (
                                typeof nextPatch
                                    .includedLiveSessionId ===
                                    'string' &&
                                nextPatch
                                    .includedLiveSessionId
                                    .trim()
                                    ? nextPatch
                                        .includedLiveSessionId
                                        .trim()
                                    : null
                            )
                            : current
                                ?.includedLiveSessionId ||
                                null,

                    activeViewId:
                        typeof nextPatch
                            .activeViewId ===
                            'string' &&
                        nextPatch
                            .activeViewId
                            .trim()
                            ? nextPatch
                                .activeViewId
                                .trim()
                            : current
                                ?.activeViewId ||
                                'view-cover',

                    startedAt:
                        current?.startedAt ||
                        Date.now()
                },
                id
            );

        if (
            !next ||
            !next.document
        ) {
            return null;
        }

        const saved =
            await writeIndexedWorkingDraft(
                id,
                next
            );

        return saved
            ? next
            : null;
    }

    async function clearWorkingDraft(
        contentId
    ) {
        const id =
            String(
                contentId || ''
            ).trim();

        if (!id) {
            return false;
        }

        if (!(await useCloud())) {
            return original.clearWorkingDraft(
                id
            );
        }

        const indexedRemoved =
            await deleteIndexedWorkingDraft(
                id
            ).catch(
                () => false
            );

        const legacyRemoved =
            await original.clearWorkingDraft(
                id
            );

        return (
            indexedRemoved &&
            legacyRemoved
        );
    }

    async function saveVersion(contentId, patch = {}) {
        const id = String(contentId || '').trim();
        if (!id) return null;

        if (!(await useCloud())) {
            return original.saveVersion(id, patch);
        }

        let lastConflict = null;

        for (let attempt = 0; attempt < 3; attempt += 1) {
            const current = await AtlasCloud.getTutorContentVersion(id);
            const next = mergeRecord(current, patch, id);

            if (!next.document) {
                return null;
            }

            try {
                if (!current) {
                    return await AtlasCloud.createTutorContentVersion(next);
                }

                return await AtlasCloud.updateTutorContentVersion(
                    next,
                    current.revision
                );
            } catch (error) {
                if (
                    error?.code !== '23505' &&
                    error?.code !== 'ATLAS_REVISION_CONFLICT'
                ) {
                    throw error;
                }

                lastConflict = error;
            }
        }

        throw lastConflict || new Error(
            'Atlas could not save this My Version because it changed elsewhere.'
        );
    }

    async function deleteVersion(contentId) {
        const id = String(contentId || '').trim();
        if (!id) return false;

        if (!(await useCloud())) {
            return original.deleteVersion(id);
        }

        const current = await AtlasCloud.getTutorContentVersion(id);
        if (!current) return true;

        const deleted = await AtlasCloud.deleteTutorContentVersion(
            id,
            current.revision
        );

        if (!deleted) {
            const conflict = new Error(
                'This My Version changed elsewhere before deletion completed.'
            );
            conflict.code = 'ATLAS_REVISION_CONFLICT';
            throw conflict;
        }

        return true;
    }

    async function exportPortableData() {
        if (!(await useCloud())) {
            return original.exportPortableData();
        }

        await migrateLegacyWorkingDrafts();

        const [versions, drafts] =
            await Promise.all([
                AtlasCloud
                    .listTutorContentVersions(),
                listIndexedWorkingDrafts()
            ]);

        const payload = {
            schemaVersion: PORTABLE_SCHEMA_VERSION,
            versions: (versions || [])
                .map(version => normalizeRecord(
                    version,
                    version?.contentId
                ))
                .filter(Boolean),
            workingDrafts: (drafts || [])
                .map(draft =>
                    normalizeWorkingDraft(
                        draft,
                        draft?.contentId
                    )
                )
                .filter(Boolean)
        };

        payload.versions.sort((left, right) =>
            left.contentId.localeCompare(right.contentId)
        );

        payload.workingDrafts.sort((left, right) =>
            left.contentId.localeCompare(right.contentId)
        );

        const validation = original.validatePortableData(payload);

        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        return validation.data;
    }

    async function restorePortableData(payload) {
        if (!(await useCloud())) {
            return original.restorePortableData(payload);
        }

        const validation = original.validatePortableData(payload);

        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        const error = new Error(
            'Signed-in cloud restore for Tutor Content is not available yet. Atlas did not change your cloud or local data.'
        );
        error.code = 'ATLAS_CLOUD_RESTORE_UNAVAILABLE';
        throw error;
    }

    Local.getVersion = getVersion;
    Local.getWorkingDraft = getWorkingDraft;
    Local.saveWorkingDraft =
        saveWorkingDraft;
    Local.clearWorkingDraft =
        clearWorkingDraft;
    Local.saveVersion = saveVersion;
    Local.deleteVersion = deleteVersion;
    Local.exportPortableData = exportPortableData;
    Local.restorePortableData = restorePortableData;
    Local.__atlasCloudAuthority = true;

    window.AtlasTutorContentCloudAuthority = Object.freeze({
        active: true,
        local: original,
        useCloud
    });

    void (async () => {
        try {
            if (await useCloud()) {
                await migrateLegacyWorkingDrafts();
            }
        } catch (error) {
            console.warn(
                '[AtlasTutorContentCloudAuthority] Tutor draft migration failed:',
                error
            );
        }
    })();
})();

/* ============================================================
   ATLAS TUTOR CONTENT — CLOUD PROJECTION

   Keeps committed cloud My Versions projected into AtlasBridge so Compass
   reflects the same titles and My Version state across browsers.

   Signed-in cloud data is authoritative. This layer does not import or claim
   legacy browser-local committed versions. Working drafts and live
   manipulation remain browser/session-local by design.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasTutorContentCloudSync) return;

    const Store = window.AtlasTutorContent;
    const Authority = window.AtlasTutorContentCloudAuthority;
    const Cloud = window.AtlasCloud;

    if (!Store || !Authority || !Cloud || !Authority.local) {
        console.error(
            '[AtlasTutorContentCloudSync] Tutor Content cloud dependencies are unavailable.'
        );
        return;
    }

    const cloudApi = {
        getVersion:
            typeof Store.getVersion === 'function'
                ? Store.getVersion.bind(Store)
                : null,
        getWorkingDraft:
            typeof Store.getWorkingDraft === 'function'
                ? Store.getWorkingDraft.bind(Store)
                : null,
        saveVersion:
            typeof Store.saveVersion === 'function'
                ? Store.saveVersion.bind(Store)
                : null,
        deleteVersion:
            typeof Store.deleteVersion === 'function'
                ? Store.deleteVersion.bind(Store)
                : null,
        exportPortableData:
            typeof Store.exportPortableData === 'function'
                ? Store.exportPortableData.bind(Store)
                : null
    };

    let projectionPromise = null;

    function isPlainObject(value) {
        return Boolean(
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
        );
    }

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function cleanId(value) {
        return String(value || '').trim();
    }

    async function useCloud() {
        try {
            return Boolean(await Authority.useCloud());
        } catch {
            return false;
        }
    }

    function getCatalogSubjects() {
        const Catalog = window.CompassCatalogData;

        if (!Catalog) return [];

        if (typeof Catalog.getCompassSubjects === 'function') {
            const subjects = Catalog.getCompassSubjects();
            return Array.isArray(subjects) ? subjects : [];
        }

        if (typeof Catalog.getCompassCatalogMap === 'function') {
            return Object.values(
                Catalog.getCompassCatalogMap() || {}
            );
        }

        return [];
    }

    function canonicalRegistryId(subject) {
        const explicit = cleanId(subject?.registryId);
        if (explicit) return explicit;

        const id = cleanId(subject?.id);
        return id ? `compass:${id}` : '';
    }

    function projectCloudVersions(versions) {
        const Bridge = window.AtlasBridge;

        if (
            !Bridge ||
            typeof Bridge.readRegistry !== 'function' ||
            typeof Bridge.writeRegistry !== 'function'
        ) {
            return false;
        }

        try {
            window.AtlasContentRegistry?.registerCompass?.();
        } catch { }

        const registry = Bridge.readRegistry();
        registry.items = isPlainObject(registry.items)
            ? registry.items
            : {};

        const versionById = new Map(
            (Array.isArray(versions) ? versions : [])
                .filter(version =>
                    cleanId(version?.contentId).startsWith('compass:')
                )
                .map(version => [
                    cleanId(version.contentId),
                    version
                ])
        );

        getCatalogSubjects().forEach(subject => {
            const registryId = canonicalRegistryId(subject);
            if (!registryId) return;

            const existing = registry.items[registryId];
            if (!existing || existing.ownershipKind === 'my-subject') {
                return;
            }

            const canonicalTitle = String(
                subject?.title ||
                subject?.navTitle ||
                existing.title ||
                registryId
            ).trim();

            const canonicalNavTitle = String(
                subject?.navTitle ||
                canonicalTitle
            ).trim();

            const version = versionById.get(registryId) || null;

            if (!version) {
                const next = {
                    ...existing,
                    title: canonicalTitle,
                    navTitle: canonicalNavTitle,
                    hasMyVersion: false
                };

                delete next.myVersionRevision;
                delete next.myVersionUpdatedAt;

                registry.items[registryId] = next;
                return;
            }

            const overrides = isPlainObject(version.overrides)
                ? version.overrides
                : {};

            const document = isPlainObject(version.document)
                ? version.document
                : {};

            const title = String(
                overrides['module.title'] ??
                document?.module?.title ??
                canonicalTitle
            ).trim() || canonicalTitle;

            const navTitle = String(
                document?.module?.navTitle ||
                title ||
                canonicalNavTitle
            ).trim() || title;

            const description = String(
                overrides['module.catalogDescription'] ??
                document?.module?.catalogDescription ??
                overrides['cover.hook'] ??
                subject?.hook ??
                existing.description ??
                ''
            ).trim();

            registry.items[registryId] = {
                ...existing,
                title,
                navTitle,
                ...(description ? { description } : {}),
                hasMyVersion: true,
                myVersionRevision: Math.max(
                    0,
                    Math.floor(Number(version.revision) || 0)
                ),
                myVersionUpdatedAt: Math.max(
                    0,
                    Number(version.updatedAt) || 0
                )
            };
        });

        Bridge.writeRegistry(registry);
        return true;
    }

    function refreshVisibleSurfaces() {
        window.requestAnimationFrame(() => {
            try {
                window.renderHome?.();
            } catch { }

            try {
                window.dispatchEvent(
                    new CustomEvent(
                        'atlas:compass-hub-refresh-request',
                        { detail: { source: 'tutor-content' } }
                    )
                );
            } catch { }
        });
    }

    async function refreshProjection() {
        if (!(await useCloud())) return [];

        if (projectionPromise) return projectionPromise;

        projectionPromise = Cloud.listTutorContentVersions()
            .then(versions => {
                projectCloudVersions(versions);
                refreshVisibleSurfaces();
                return versions || [];
            })
            .finally(() => {
                projectionPromise = null;
            });

        return projectionPromise;
    }

    async function getVersion(contentId) {
        const id = cleanId(contentId);
        if (!id) return null;

        if (!(await useCloud())) {
            return cloudApi.getVersion
                ? cloudApi.getVersion(id)
                : null;
        }

        return Cloud.getTutorContentVersion(id);
    }

    async function getWorkingDraft(contentId) {
        const id = cleanId(contentId);
        if (!id || !cloudApi.getWorkingDraft) return null;


        return cloudApi.getWorkingDraft(id);
    }

    async function saveVersion(contentId, patch = {}) {
        const id = cleanId(contentId);
        if (!id || !cloudApi.saveVersion) return null;

        if (!(await useCloud())) {
            return cloudApi.saveVersion(id, patch);
        }

        const current = await Cloud.getTutorContentVersion(id);
        const candidatePatch =
            !current &&
            !Object.prototype.hasOwnProperty.call(
                patch && typeof patch === 'object' ? patch : {},
                'document'
            )
                ? {
                    ...(patch && typeof patch === 'object' ? patch : {}),
                    document: {}
                }
                : patch;

        const saved = await cloudApi.saveVersion(
            id,
            candidatePatch
        );

        if (saved) {
            await refreshProjection();
        }

        return saved;
    }

    async function deleteVersion(contentId) {
        const id = cleanId(contentId);
        if (!id || !cloudApi.deleteVersion) return false;


        const deleted = await cloudApi.deleteVersion(id);

        if (deleted && await useCloud()) {
            await refreshProjection();
        }

        return deleted;
    }

    async function exportPortableData() {

        return cloudApi.exportPortableData
            ? cloudApi.exportPortableData()
            : null;
    }

    Store.getVersion = getVersion;
    Store.getWorkingDraft = getWorkingDraft;
    Store.saveVersion = saveVersion;
    Store.deleteVersion = deleteVersion;
    Store.exportPortableData = exportPortableData;
    Store.__atlasCloudSync = true;

    window.AtlasTutorContentCloudSync = Object.freeze({
        refreshProjection,
        getState() {
            return { active: true };
        }
    });

    void refreshProjection().catch(() => undefined);
})();
