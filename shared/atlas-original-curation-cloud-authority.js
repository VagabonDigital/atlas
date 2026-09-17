/* ============================================================
   ATLAS ORIGINAL CURATION — CLOUD AUTHORITY

   Account persistence for canonical Atlas Original curation.

   Permanent signed-in behavior:
   - archive / delete suppression follows the tutor across devices
   - Atlas Original ordering follows the tutor across devices
   - cloud state hydrates the existing synchronous local curation cache
   - existing pre-account local curation is claimed once when no cloud row
     exists yet

   The existing AtlasOriginalCuration API remains the product/runtime
   boundary. This authority observes its single local cache key and makes
   the signed-in cloud row authoritative without forcing Compass rendering
   to become asynchronous.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasOriginalCurationCloudAuthority) return;

    const Curation = window.AtlasOriginalCuration;

    if (!Curation || !window.AtlasCloud) {
        console.error(
            '[AtlasOriginalCurationCloudAuthority] Dependencies are unavailable.'
        );
        return;
    }

    const STORAGE_KEY = 'atlas::originalCuration';
    const AUTH_STORAGE_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';
    const SCHEMA_VERSION = 2;
    const TABLE = 'original_curation_state';

    const STATE_ARCHIVED = 'archived';
    const STATE_DELETED = 'deleted';

    let initialized = false;
    let authenticated = false;
    let currentUserId = '';
    let remoteRecord = null;
    let initializePromise = null;
    let queuedInitializePromise = null;
    let forceInitializeQueued = false;
    let initializeGeneration = 0;
    let syncChain = Promise.resolve();
    let syncTimer = null;
    let suspendLocalSync = false;
    let storageHooksInstalled = false;

    function storedAccountUserId() {
        try {
            const raw = localStorage.getItem(
                AUTH_STORAGE_KEY
            );

            if (!raw) return '';

            const parsed = JSON.parse(raw);
            const candidates = [
                parsed,
                parsed?.session,
                parsed?.currentSession,
                parsed?.data?.session
            ];

            for (const candidate of candidates) {
                const id = String(
                    candidate?.user?.id || ''
                ).trim();

                if (id) return id;
            }
        } catch { }

        return '';
    }

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function normalizeRegistryId(value) {
        const id = String(value || '').trim();
        return id.startsWith('compass:') ? id : '';
    }

    function normalizeOrder(value) {
        const seen = new Set();

        return (Array.isArray(value) ? value : [])
            .map(normalizeRegistryId)
            .filter(id => {
                if (!id || seen.has(id)) return false;
                seen.add(id);
                return true;
            });
    }

    function normalizeRecord(value) {
        if (
            !value ||
            typeof value !== 'object' ||
            Array.isArray(value)
        ) {
            return null;
        }

        const state =
            value.state === STATE_ARCHIVED
                ? STATE_ARCHIVED
                : value.state === STATE_DELETED
                    ? STATE_DELETED
                    : '';

        if (!state) return null;

        return {
            state,
            updatedAt: Number.isFinite(Number(value.updatedAt))
                ? Number(value.updatedAt)
                : Date.now()
        };
    }

    function normalizeStore(value) {
        const candidate =
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
                ? value
                : {};

        const rawItems =
            candidate.items &&
            typeof candidate.items === 'object' &&
            !Array.isArray(candidate.items)
                ? candidate.items
                : {};

        const items = {};

        Object.entries(rawItems).forEach(
            ([registryId, rawRecord]) => {
                const id = normalizeRegistryId(registryId);
                const record = normalizeRecord(rawRecord);

                if (id && record) {
                    items[id] = record;
                }
            }
        );

        return {
            schemaVersion: SCHEMA_VERSION,
            items,
            order: normalizeOrder(candidate.order)
        };
    }

    function emptyStore() {
        return {
            schemaVersion: SCHEMA_VERSION,
            items: {},
            order: []
        };
    }

    function hasMeaningfulState(store) {
        const normalized = normalizeStore(store);

        return (
            Object.keys(normalized.items).length > 0 ||
            normalized.order.length > 0
        );
    }

    function readLocalStore() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return normalizeStore(
                raw ? JSON.parse(raw) : null
            );
        } catch {
            return emptyStore();
        }
    }

    function writeLocalStore(store) {
        const normalized = normalizeStore(store);

        suspendLocalSync = true;

        try {
            if (
                Object.keys(normalized.items).length === 0 &&
                normalized.order.length === 0
            ) {
                localStorage.removeItem(STORAGE_KEY);
            } else {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(normalized)
                );
            }

            return true;
        } catch {
            return false;
        } finally {
            suspendLocalSync = false;
        }
    }

    function rowToRecord(row) {
        if (!row || typeof row !== 'object') return null;

        return {
            schemaVersion: Math.max(
                1,
                Math.floor(Number(row.schema_version) || SCHEMA_VERSION)
            ),
            revision: Math.max(
                1,
                Math.floor(Number(row.revision) || 1)
            ),
            state: normalizeStore(row.state),
            createdAt: Date.parse(row.created_at) || 0,
            updatedAt: Date.parse(row.updated_at) || 0
        };
    }

    async function getCurrentSession() {
        return AtlasCloud.getSession();
    }

    async function fetchRemoteRecord(userId) {
        const client = await AtlasCloud.getClient();

        const { data, error } = await client
            .from(TABLE)
            .select('*')
            .eq('owner_user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return rowToRecord(data);
    }

    async function createRemoteRecord(userId, state) {
        const client = await AtlasCloud.getClient();

        const { data, error } = await client
            .from(TABLE)
            .insert({
                owner_user_id: userId,
                schema_version: SCHEMA_VERSION,
                revision: 1,
                state: normalizeStore(state)
            })
            .select('*')
            .single();

        if (error) throw error;
        return rowToRecord(data);
    }

    async function updateRemoteRecord(
        userId,
        state,
        expectedRevision
    ) {
        const client = await AtlasCloud.getClient();
        const previousRevision = Math.max(
            1,
            Math.floor(Number(expectedRevision) || 0)
        );

        if (!previousRevision) {
            throw new Error(
                'Atlas Original curation update requires the previous revision.'
            );
        }

        const { data, error } = await client
            .from(TABLE)
            .update({
                schema_version: SCHEMA_VERSION,
                revision: previousRevision + 1,
                state: normalizeStore(state),
                updated_at: new Date().toISOString()
            })
            .eq('owner_user_id', userId)
            .eq('revision', previousRevision)
            .select('*')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const conflict = new Error(
                'Atlas Original curation changed elsewhere before this save completed.'
            );
            conflict.code = 'ATLAS_REVISION_CONFLICT';
            throw conflict;
        }

        return rowToRecord(data);
    }

    function dispatchReady() {
        window.dispatchEvent(
            new CustomEvent(
                'atlas:original-curation-cloud-ready',
                { detail: getState() }
            )
        );
    }

    function dispatchError(error, action) {
        window.dispatchEvent(
            new CustomEvent(
                'atlas:original-curation-cloud-error',
                {
                    detail: {
                        action,
                        code: error?.code || '',
                        message:
                            error?.message ||
                            String(error || 'Atlas Original curation save failed.')
                    }
                }
            )
        );

        console.error(
            '[AtlasOriginalCurationCloudAuthority]',
            action,
            error
        );
    }

    function refreshCompass() {
        window.requestAnimationFrame(() => {
            try {
                window.dispatchEvent(
                    new CustomEvent(
                        'atlas:compass-hub-refresh-request',
                        { detail: { source: 'original-curation-cloud' } }
                    )
                );
            } catch { }
        });
    }

    function showSaveFailure() {
        try {
            window.showToast?.(
                'Couldn’t save this Atlas preference.'
            );
        } catch { }
    }

    async function persistSnapshot(snapshot) {
        if (!authenticated || !currentUserId) return null;

        const session = await getCurrentSession();
        const liveUserId = String(
            session?.user?.id || ''
        ).trim();

        if (!liveUserId || liveUserId !== currentUserId) {
            await initialize({ force: true });
            return null;
        }

        const state = normalizeStore(snapshot);

        try {
            if (!remoteRecord) {
                try {
                    remoteRecord =
                        await createRemoteRecord(
                            currentUserId,
                            state
                        );
                } catch (error) {
                    if (error?.code !== '23505') throw error;

                    const existing =
                        await fetchRemoteRecord(
                            currentUserId
                        );

                    if (!existing) throw error;

                    remoteRecord = existing;
                    writeLocalStore(existing.state);
                    refreshCompass();
                    return existing;
                }
            } else {
                remoteRecord =
                    await updateRemoteRecord(
                        currentUserId,
                        state,
                        remoteRecord.revision
                    );
            }

            return remoteRecord;
        } catch (error) {
            dispatchError(error, 'save');

            try {
                const latest =
                    await fetchRemoteRecord(
                        currentUserId
                    );

                remoteRecord = latest;
                writeLocalStore(
                    latest?.state || emptyStore()
                );
                refreshCompass();
            } catch (recoveryError) {
                dispatchError(
                    recoveryError,
                    'recover'
                );
            }

            showSaveFailure();
            return null;
        }
    }

    function scheduleSync() {
        if (
            suspendLocalSync ||
            !initialized ||
            !authenticated
        ) {
            return;
        }

        if (syncTimer) {
            clearTimeout(syncTimer);
        }

        syncTimer = setTimeout(() => {
            syncTimer = null;
            const snapshot = readLocalStore();

            syncChain = syncChain
                .catch(() => undefined)
                .then(() => persistSnapshot(snapshot));
        }, 0);
    }

    async function flush() {
        if (syncTimer) {
            clearTimeout(syncTimer);
            syncTimer = null;

            const snapshot = readLocalStore();
            syncChain = syncChain
                .catch(() => undefined)
                .then(() => persistSnapshot(snapshot));
        }

        await syncChain.catch(() => undefined);
        return getState();
    }

    function installStorageHooks() {
        if (storageHooksInstalled) return;
        storageHooksInstalled = true;

        const originalSetItem =
            Storage.prototype.setItem;
        const originalRemoveItem =
            Storage.prototype.removeItem;

        Storage.prototype.setItem = function (
            key,
            value
        ) {
            const isAtlasLocal =
                this === window.localStorage;

            const result =
                originalSetItem.call(
                    this,
                    key,
                    value
                );

            if (isAtlasLocal) {
                if (
                    key === STORAGE_KEY &&
                    !suspendLocalSync
                ) {
                    scheduleSync();
                }

                if (key === AUTH_STORAGE_KEY) {
                    setTimeout(
                        () => initialize({ force: true }),
                        0
                    );
                }
            }

            return result;
        };

        Storage.prototype.removeItem = function (key) {
            const isAtlasLocal =
                this === window.localStorage;

            const result =
                originalRemoveItem.call(
                    this,
                    key
                );

            if (isAtlasLocal) {
                if (
                    key === STORAGE_KEY &&
                    !suspendLocalSync
                ) {
                    scheduleSync();
                }

                if (key === AUTH_STORAGE_KEY) {
                    setTimeout(
                        () => initialize({ force: true }),
                        0
                    );
                }
            }

            return result;
        };
    }

    async function initialize({ force = false } = {}) {
        installStorageHooks();

        const storedUserId = storedAccountUserId();
        const identityChanged = Boolean(
            initialized || currentUserId
        ) && storedUserId !== currentUserId;

        if (initializePromise) {
            if (!force || !identityChanged) {
                return initializePromise;
            }

            initializeGeneration += 1;
            forceInitializeQueued = true;

            if (!queuedInitializePromise) {
                const activePromise = initializePromise;

                queuedInitializePromise =
                    Promise.resolve(activePromise)
                        .catch(() => undefined)
                        .then(() => {
                            queuedInitializePromise = null;

                            if (!forceInitializeQueued) {
                                return getState();
                            }

                            forceInitializeQueued = false;
                            return initialize({ force: true });
                        });
            }

            return queuedInitializePromise;
        }

        if (
            initialized &&
            !force &&
            storedUserId === currentUserId
        ) {
            return getState();
        }

        const generation = ++initializeGeneration;

        const request = (async () => {
            const previousUserId = currentUserId;
            const session = await getCurrentSession();
            const userId = String(
                session?.user?.id || ''
            ).trim();

            if (generation !== initializeGeneration) {
                return getState();
            }

            if (!userId) {
                authenticated = false;
                currentUserId = '';
                remoteRecord = null;
                initialized = true;
                writeLocalStore(emptyStore());
                dispatchReady();
                refreshCompass();
                return getState();
            }

            authenticated = true;

            if (
                previousUserId &&
                previousUserId !== userId
            ) {
                // Never expose Account A curation while Account B hydrates.
                writeLocalStore(emptyStore());
            }

            currentUserId = userId;

            const localBefore = readLocalStore();
            const remote =
                await fetchRemoteRecord(userId);

            if (generation !== initializeGeneration) {
                return getState();
            }

            if (remote) {
                remoteRecord = remote;
                writeLocalStore(remote.state);
            } else if (
                !previousUserId &&
                hasMeaningfulState(localBefore)
            ) {
                // Legacy claim: only an initial browser carrying actual local
                // curation can create the first cloud row. A fresh browser with
                // an empty cache cannot seal the account empty.
                try {
                    remoteRecord =
                        await createRemoteRecord(
                            userId,
                            localBefore
                        );
                    writeLocalStore(remoteRecord.state);
                } catch (error) {
                    if (error?.code === '23505') {
                        remoteRecord =
                            await fetchRemoteRecord(userId);
                        writeLocalStore(
                            remoteRecord?.state || emptyStore()
                        );
                    } else {
                        throw error;
                    }
                }
            } else {
                remoteRecord = null;
                writeLocalStore(emptyStore());
            }

            initialized = true;
            dispatchReady();
            refreshCompass();

            return getState();
        })().catch(error => {
            dispatchError(error, 'initialize');
            throw error;
        });

        let trackedPromise = null;

        trackedPromise = request.finally(() => {
            if (initializePromise === trackedPromise) {
                initializePromise = null;
            }
        });

        initializePromise = trackedPromise;
        return trackedPromise;
    }

    function getState() {
        return {
            initialized,
            authenticated,
            active: initialized && authenticated,
            userId: currentUserId || null,
            cloudRevision: remoteRecord?.revision || null,
            cloudExists: Boolean(remoteRecord)
        };
    }

    window.AtlasOriginalCurationCloudAuthority =
        Object.freeze({
            initialize,
            flush,
            getState
        });

    void initialize().catch(() => undefined);
})();
