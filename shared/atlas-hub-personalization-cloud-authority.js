/* ============================================================
   ATLAS HUB PERSONALIZATION — CLOUD AUTHORITY

   Durable account persistence for Atlas Hub welcome imagery.

   Signed-in behavior:
   - per-session welcome / atmosphere images follow the tutor
   - saved image favourites follow the tutor
   - existing localStorage keys remain the synchronous rendering cache
   - a legacy browser may claim pre-account local state once when the
     account has no cloud row yet
   - cached state is explicitly scoped to its owning account

   Browser-local active-session selection remains unchanged. This module
   persists only the image preferences keyed by stable session ids.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasHubPersonalizationCloudAuthority) return;

    if (!window.AtlasCloud) {
        console.error(
            '[AtlasHubPersonalizationCloudAuthority] AtlasCloud is unavailable.'
        );
        return;
    }

    const SESSION_IMAGES_KEY =
        'atlas::sessionAtmosphereImages';
    const FAVORITES_KEY =
        'atlas::welcomeImageFavorites';
    const CACHE_OWNER_KEY =
        'atlas::hubPersonalizationCloudOwner::v1';
    const AUTH_STORAGE_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';

    const TABLE = 'hub_personalization_state';
    const SCHEMA_VERSION = 1;
    const MAX_FAVORITES = 12;
    const MAX_URL_LENGTH = 4096;

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

    function cleanUrl(value) {
        return String(value || '')
            .trim()
            .slice(0, MAX_URL_LENGTH);
    }

    function normalizeSessionImages(value) {
        const candidate =
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
                ? value
                : {};

        const result = {};

        Object.entries(candidate).forEach(([rawId, rawUrl]) => {
            const id = String(rawId || '').trim();
            const url = cleanUrl(rawUrl);

            if (id && url) {
                result[id] = url;
            }
        });

        return result;
    }

    function normalizeFavorites(value) {
        const seen = new Set();
        const result = [];

        (Array.isArray(value) ? value : []).forEach(raw => {
            const url = cleanUrl(raw);

            if (!url || seen.has(url)) return;

            seen.add(url);
            result.push(url);
        });

        return result.slice(0, MAX_FAVORITES);
    }

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

    function normalizeState(value) {
        const candidate =
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
                ? value
                : {};

        return {
            schemaVersion: SCHEMA_VERSION,
            sessionImages: normalizeSessionImages(
                candidate.sessionImages
            ),
            favoriteImages: normalizeFavorites(
                candidate.favoriteImages
            )
        };
    }

    function emptyState() {
        return normalizeState(null);
    }

    function hasMeaningfulState(value) {
        const state = normalizeState(value);

        return (
            Object.keys(state.sessionImages).length > 0 ||
            state.favoriteImages.length > 0
        );
    }

    function readCacheOwner() {
        try {
            return String(
                localStorage.getItem(CACHE_OWNER_KEY) || ''
            ).trim();
        } catch {
            return '';
        }
    }

    function writeCacheOwner(userId) {
        try {
            const id = String(userId || '').trim();

            if (id) {
                localStorage.setItem(CACHE_OWNER_KEY, id);
            } else {
                localStorage.removeItem(CACHE_OWNER_KEY);
            }

            return true;
        } catch {
            return false;
        }
    }

    function readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }

    function readLocalState() {
        return normalizeState({
            sessionImages: readJson(
                SESSION_IMAGES_KEY,
                {}
            ),
            favoriteImages: readJson(
                FAVORITES_KEY,
                []
            )
        });
    }

    function writeLocalState(value) {
        const state = normalizeState(value);

        suspendLocalSync = true;

        try {
            if (Object.keys(state.sessionImages).length) {
                localStorage.setItem(
                    SESSION_IMAGES_KEY,
                    JSON.stringify(state.sessionImages)
                );
            } else {
                localStorage.removeItem(SESSION_IMAGES_KEY);
            }

            if (state.favoriteImages.length) {
                localStorage.setItem(
                    FAVORITES_KEY,
                    JSON.stringify(state.favoriteImages)
                );
            } else {
                localStorage.removeItem(FAVORITES_KEY);
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
                Math.floor(Number(row.schema_version) || 1)
            ),
            revision: Math.max(
                1,
                Math.floor(Number(row.revision) || 1)
            ),
            state: normalizeState(row.state),
            createdAt: Date.parse(row.created_at) || 0,
            updatedAt: Date.parse(row.updated_at) || 0
        };
    }

    async function getSession() {
        return AtlasCloud.getSession();
    }

    async function fetchRemote(userId) {
        const client = await AtlasCloud.getClient();

        const { data, error } = await client
            .from(TABLE)
            .select('*')
            .eq('owner_user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return rowToRecord(data);
    }

    async function createRemote(userId, state) {
        const client = await AtlasCloud.getClient();

        const { data, error } = await client
            .from(TABLE)
            .insert({
                owner_user_id: userId,
                schema_version: SCHEMA_VERSION,
                revision: 1,
                state: normalizeState(state)
            })
            .select('*')
            .single();

        if (error) throw error;
        return rowToRecord(data);
    }

    async function updateRemote(
        userId,
        state,
        expectedRevision
    ) {
        const client = await AtlasCloud.getClient();
        const revision = Math.max(
            1,
            Math.floor(Number(expectedRevision) || 0)
        );

        if (!revision) {
            throw new Error(
                'Atlas Hub personalization update requires the previous revision.'
            );
        }

        const { data, error } = await client
            .from(TABLE)
            .update({
                schema_version: SCHEMA_VERSION,
                revision: revision + 1,
                state: normalizeState(state),
                updated_at: new Date().toISOString()
            })
            .eq('owner_user_id', userId)
            .eq('revision', revision)
            .select('*')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const conflict = new Error(
                'Atlas Hub personalization changed elsewhere before this save completed.'
            );
            conflict.code = 'ATLAS_REVISION_CONFLICT';
            throw conflict;
        }

        return rowToRecord(data);
    }

    function dispatchReady() {
        window.dispatchEvent(
            new CustomEvent(
                'atlas:hub-personalization-cloud-ready',
                { detail: getState() }
            )
        );
    }

    function dispatchError(error, action) {
        window.dispatchEvent(
            new CustomEvent(
                'atlas:hub-personalization-cloud-error',
                {
                    detail: {
                        action,
                        code: error?.code || '',
                        message:
                            error?.message ||
                            String(
                                error ||
                                'Atlas Hub personalization save failed.'
                            )
                    }
                }
            )
        );

        console.error(
            '[AtlasHubPersonalizationCloudAuthority]',
            action,
            error
        );
    }

    function refreshRoot() {
        window.requestAnimationFrame(() => {
            try {
                window.applyEffectiveAtmosphereImage?.();
                window.renderAtmosphereFavorites?.();
            } catch { }
        });
    }

    function showSaveFailure() {
        try {
            window.showToast?.(
                'Couldn’t save these Atlas image settings.'
            );
        } catch { }
    }

    async function persistSnapshot(snapshot) {
        if (!authenticated || !currentUserId) return null;

        const session = await getSession();
        const liveUserId = String(
            session?.user?.id || ''
        ).trim();

        if (!liveUserId || liveUserId !== currentUserId) {
            await initialize({ force: true });
            return null;
        }

        const state = normalizeState(snapshot);

        try {
            if (!remoteRecord) {
                try {
                    remoteRecord = await createRemote(
                        currentUserId,
                        state
                    );
                } catch (error) {
                    if (error?.code !== '23505') throw error;

                    const existing = await fetchRemote(
                        currentUserId
                    );

                    if (!existing) throw error;

                    remoteRecord = existing;
                    writeLocalState(existing.state);
                    writeCacheOwner(currentUserId);
                    refreshRoot();
                    return existing;
                }
            } else {
                remoteRecord = await updateRemote(
                    currentUserId,
                    state,
                    remoteRecord.revision
                );
            }

            writeCacheOwner(currentUserId);
            return remoteRecord;
        } catch (error) {
            dispatchError(error, 'save');

            try {
                const latest = await fetchRemote(
                    currentUserId
                );

                remoteRecord = latest;
                writeLocalState(
                    latest?.state || emptyState()
                );
                writeCacheOwner(currentUserId);
                refreshRoot();
            } catch (recoveryError) {
                dispatchError(recoveryError, 'recover');
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

        if (syncTimer) clearTimeout(syncTimer);

        syncTimer = setTimeout(() => {
            syncTimer = null;
            const snapshot = readLocalState();

            syncChain = syncChain
                .catch(() => undefined)
                .then(() => persistSnapshot(snapshot));
        }, 0);
    }

    async function flush() {
        if (syncTimer) {
            clearTimeout(syncTimer);
            syncTimer = null;

            const snapshot = readLocalState();
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

        const originalSetItem = Storage.prototype.setItem;
        const originalRemoveItem = Storage.prototype.removeItem;

        Storage.prototype.setItem = function (key, value) {
            const isLocal = this === window.localStorage;
            const result = originalSetItem.call(
                this,
                key,
                value
            );

            if (isLocal) {
                if (
                    (
                        key === SESSION_IMAGES_KEY ||
                        key === FAVORITES_KEY
                    ) &&
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
            const isLocal = this === window.localStorage;
            const result = originalRemoveItem.call(
                this,
                key
            );

            if (isLocal) {
                if (
                    (
                        key === SESSION_IMAGES_KEY ||
                        key === FAVORITES_KEY
                    ) &&
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
            const session = await getSession();
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

                if (previousUserId) {
                    // Never expose Account A personalization after sign-out.
                    writeLocalState(emptyState());
                    writeCacheOwner('');
                    refreshRoot();
                }

                dispatchReady();
                return getState();
            }

            authenticated = true;

            const cacheOwner = readCacheOwner();
            const belongsToDifferentAccount = Boolean(
                cacheOwner && cacheOwner !== userId
            );

            if (
                belongsToDifferentAccount ||
                (
                    previousUserId &&
                    previousUserId !== userId
                )
            ) {
                // Never expose or migrate Account A state into Account B.
                writeLocalState(emptyState());
            }

            currentUserId = userId;

            const localBefore = readLocalState();
            const remote = await fetchRemote(userId);

            if (generation !== initializeGeneration) {
                return getState();
            }

            if (remote) {
                remoteRecord = remote;
                writeLocalState(remote.state);
                writeCacheOwner(userId);
            } else if (
                !belongsToDifferentAccount &&
                !previousUserId &&
                hasMeaningfulState(localBefore)
            ) {
                // Legacy claim: only unscoped pre-account state can seed the
                // first row. A fresh browser, or another account's cache,
                // never seals or contaminates this account.
                try {
                    remoteRecord = await createRemote(
                        userId,
                        localBefore
                    );
                    writeLocalState(remoteRecord.state);
                    writeCacheOwner(userId);
                } catch (error) {
                    if (error?.code === '23505') {
                        remoteRecord = await fetchRemote(
                            userId
                        );
                        writeLocalState(
                            remoteRecord?.state || emptyState()
                        );
                        writeCacheOwner(userId);
                    } else {
                        throw error;
                    }
                }
            } else {
                remoteRecord = null;
                writeCacheOwner(userId);
            }

            initialized = true;
            dispatchReady();
            refreshRoot();

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

    window.AtlasHubPersonalizationCloudAuthority =
        Object.freeze({
            initialize,
            flush,
            getState,
            readLocalState
        });

    void initialize().catch(() => undefined);
})();
