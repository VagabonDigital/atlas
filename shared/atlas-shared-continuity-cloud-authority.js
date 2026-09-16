/* ============================================================
   ATLAS SHARED CONTINUITY — CLOUD AUTHORITY

   Durable account persistence for the signed-in Shared teaching context.

   Persists the same AtlasBridge teaching contract as named learner
   continuity: Compass/Arcade progress, game answers, saved language,
   Wrap Up handoffs, recent activity, and language-review completion.

   Signed-out Shared remains browser-local. Active learner selection and
   transient Wrap Up drafts remain browser/tab-local.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasSharedContinuityCloudAuthority) return;

    if (!window.AtlasCloud || !window.AtlasBridge) {
        console.error(
            '[AtlasSharedContinuityCloudAuthority] AtlasCloud and AtlasBridge are required.'
        );
        return;
    }

    const TABLE = 'shared_continuity_state';
    const SCHEMA_VERSION = 1;
    const AUTH_STORAGE_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';
    const CACHE_OWNER_KEY =
        'atlas::sharedContinuityCloudOwner::v1';
    const REVIEW_COMPLETED_PREFIX =
        'atlas::languageReviewCompletedThrough::v1::';

    const Bridge = window.AtlasBridge;
    const SHARED_SESSION_ID = Bridge.defaultSessionId || 'default';

    let initialized = false;
    let authenticated = false;
    let currentUserId = '';
    let remoteRecord = null;
    let initializePromise = null;
    let syncTimer = null;
    let syncChain = Promise.resolve();
    let suspendLocalSync = false;
    let storageHooksInstalled = false;
    let lastSnapshotJson = '';

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function isPlainObject(value) {
        return Boolean(
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
        );
    }

    function normalizeObject(value) {
        return isPlainObject(value)
            ? cloneJson(value)
            : {};
    }

    function normalizeRecentActivity(value) {
        return (Array.isArray(value) ? value : [])
            .filter(item =>
                isPlainObject(item) &&
                String(item.sessionId || '').trim() === SHARED_SESSION_ID &&
                String(item.registryId || '').trim()
            )
            .map(item => cloneJson(item))
            .sort((a, b) =>
                (Number(b.timestamp) || 0) -
                (Number(a.timestamp) || 0)
            )
            .slice(0, 50);
    }

    function normalizeReviewedThrough(value) {
        const number = Number(value);
        return Number.isFinite(number)
            ? Math.max(-1, Math.floor(number))
            : -1;
    }

    function normalizeState(value) {
        const candidate = isPlainObject(value)
            ? value
            : {};

        return {
            schemaVersion: SCHEMA_VERSION,
            sessionStates: normalizeObject(candidate.sessionStates),
            ledgerEntries: normalizeObject(candidate.ledgerEntries),
            handoffs: normalizeObject(candidate.handoffs),
            recentActivity: normalizeRecentActivity(
                candidate.recentActivity
            ),
            languageReviewCompletedThrough:
                normalizeReviewedThrough(
                    candidate.languageReviewCompletedThrough
                )
        };
    }

    function emptyState() {
        return normalizeState(null);
    }

    function hasMeaningfulState(state) {
        return Boolean(
            Object.keys(state.sessionStates || {}).length ||
            Object.keys(state.ledgerEntries || {}).length ||
            Object.keys(state.handoffs || {}).length ||
            (state.recentActivity || []).length ||
            state.languageReviewCompletedThrough >= 0
        );
    }

    function reviewCompletionKey(userId) {
        return (
            REVIEW_COMPLETED_PREFIX +
            `user:${userId}` +
            '::' +
            encodeURIComponent(SHARED_SESSION_ID)
        );
    }

    function readStoredNumber(key) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null) return -1;
            const value = Number(raw);
            return Number.isFinite(value)
                ? Math.max(-1, Math.floor(value))
                : -1;
        } catch {
            return -1;
        }
    }

    function readReviewedThrough(userId) {
        return readStoredNumber(
            reviewCompletionKey(userId)
        );
    }

    function writeReviewedThrough(userId, value) {
        const normalized = normalizeReviewedThrough(value);
        const key = reviewCompletionKey(userId);

        try {
            if (normalized < 0) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, String(normalized));
            }
        } catch { }
    }

    function removeSharedReviewCache() {
        const suffix =
            '::' + encodeURIComponent(SHARED_SESSION_ID);

        try {
            const removals = [];

            for (let index = 0; index < localStorage.length; index += 1) {
                const key = localStorage.key(index) || '';

                if (
                    key.startsWith(REVIEW_COMPLETED_PREFIX) &&
                    key.endsWith(suffix)
                ) {
                    removals.push(key);
                }
            }

            removals.forEach(key => localStorage.removeItem(key));
        } catch { }
    }

    function readLocalSnapshot(userId) {
        const registry = Bridge.readRegistry();
        const ledger = Bridge.readLedger();
        const handoffStore = Bridge.readJson(
            Bridge.keys.handoffs,
            {}
        );

        const sessionStates = normalizeObject(
            registry?.sessionStates?.[SHARED_SESSION_ID]
        );

        const ledgerEntries = Object.entries(
            isPlainObject(ledger?.entries)
                ? ledger.entries
                : {}
        ).reduce((result, [entryId, entry]) => {
            if (
                isPlainObject(entry) &&
                String(entry.sessionId || '').trim() === SHARED_SESSION_ID
            ) {
                result[entryId] = cloneJson(entry);
            }
            return result;
        }, {});

        const handoffs = Object.entries(
            isPlainObject(handoffStore)
                ? handoffStore
                : {}
        ).reduce((result, [storageId, handoff]) => {
            if (
                isPlainObject(handoff) &&
                String(handoff.sessionId || '').trim() === SHARED_SESSION_ID
            ) {
                result[storageId] = cloneJson(handoff);
            }
            return result;
        }, {});

        return normalizeState({
            sessionStates,
            ledgerEntries,
            handoffs,
            recentActivity: registry?.recentActivity || [],
            languageReviewCompletedThrough:
                readReviewedThrough(userId)
        });
    }

    function writeLocalSnapshot(userId, state) {
        const normalized = normalizeState(state);
        suspendLocalSync = true;

        try {
            const registry = Bridge.readRegistry();

            registry.sessionStates =
                isPlainObject(registry.sessionStates)
                    ? registry.sessionStates
                    : {};

            if (Object.keys(normalized.sessionStates).length) {
                registry.sessionStates[SHARED_SESSION_ID] =
                    cloneJson(normalized.sessionStates);
            } else {
                delete registry.sessionStates[SHARED_SESSION_ID];
            }

            const otherRecent = (
                Array.isArray(registry.recentActivity)
                    ? registry.recentActivity
                    : []
            ).filter(item =>
                String(item?.sessionId || '').trim() !== SHARED_SESSION_ID
            );

            registry.recentActivity = [
                ...cloneJson(normalized.recentActivity),
                ...otherRecent
            ]
                .sort((a, b) =>
                    (Number(b?.timestamp) || 0) -
                    (Number(a?.timestamp) || 0)
                )
                .slice(0, 50);

            Bridge.writeRegistry(registry);

            const ledger = Bridge.readLedger();
            const nextEntries = Object.entries(
                isPlainObject(ledger?.entries)
                    ? ledger.entries
                    : {}
            ).reduce((result, [entryId, entry]) => {
                if (
                    String(entry?.sessionId || '').trim() !== SHARED_SESSION_ID
                ) {
                    result[entryId] = entry;
                }
                return result;
            }, {});

            Object.assign(
                nextEntries,
                cloneJson(normalized.ledgerEntries)
            );

            Bridge.writeLedger({
                ...ledger,
                entries: nextEntries
            });

            const handoffStore = Bridge.readJson(
                Bridge.keys.handoffs,
                {}
            );
            const nextHandoffs = Object.entries(
                isPlainObject(handoffStore)
                    ? handoffStore
                    : {}
            ).reduce((result, [storageId, handoff]) => {
                if (
                    String(handoff?.sessionId || '').trim() !== SHARED_SESSION_ID
                ) {
                    result[storageId] = handoff;
                }
                return result;
            }, {});

            Object.assign(
                nextHandoffs,
                cloneJson(normalized.handoffs)
            );

            Bridge.writeJson(
                Bridge.keys.handoffs,
                nextHandoffs
            );

            writeReviewedThrough(
                userId,
                normalized.languageReviewCompletedThrough
            );
        } finally {
            suspendLocalSync = false;
        }
    }

    function clearLocalSharedContinuity() {
        suspendLocalSync = true;

        try {
            const registry = Bridge.readRegistry();

            if (isPlainObject(registry.sessionStates)) {
                delete registry.sessionStates[SHARED_SESSION_ID];
            }

            registry.recentActivity = (
                Array.isArray(registry.recentActivity)
                    ? registry.recentActivity
                    : []
            ).filter(item =>
                String(item?.sessionId || '').trim() !== SHARED_SESSION_ID
            );

            Bridge.writeRegistry(registry);

            const ledger = Bridge.readLedger();
            const entries = Object.entries(
                isPlainObject(ledger?.entries)
                    ? ledger.entries
                    : {}
            ).reduce((result, [entryId, entry]) => {
                if (
                    String(entry?.sessionId || '').trim() !== SHARED_SESSION_ID
                ) {
                    result[entryId] = entry;
                }
                return result;
            }, {});

            Bridge.writeLedger({
                ...ledger,
                entries
            });

            const handoffStore = Bridge.readJson(
                Bridge.keys.handoffs,
                {}
            );
            const handoffs = Object.entries(
                isPlainObject(handoffStore)
                    ? handoffStore
                    : {}
            ).reduce((result, [storageId, handoff]) => {
                if (
                    String(handoff?.sessionId || '').trim() !== SHARED_SESSION_ID
                ) {
                    result[storageId] = handoff;
                }
                return result;
            }, {});

            Bridge.writeJson(Bridge.keys.handoffs, handoffs);
            removeSharedReviewCache();
        } finally {
            suspendLocalSync = false;
        }
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
            if (userId) {
                localStorage.setItem(CACHE_OWNER_KEY, userId);
            } else {
                localStorage.removeItem(CACHE_OWNER_KEY);
            }
        } catch { }
    }

    async function getSession() {
        return window.AtlasCloud.getSession();
    }

    async function getClientAndUser() {
        const [client, session] = await Promise.all([
            window.AtlasCloud.getClient(),
            getSession()
        ]);
        const user = session?.user || null;

        if (!user) {
            throw new Error(
                'Shared continuity cloud access requires a signed-in Atlas account.'
            );
        }

        return { client, user };
    }

    function rowToRecord(row) {
        if (!row || typeof row !== 'object') return null;

        return {
            revision: Math.max(
                1,
                Math.floor(Number(row.revision) || 1)
            ),
            state: normalizeState(row.state),
            updatedAt: Date.parse(row.updated_at) || 0
        };
    }

    async function fetchRemote() {
        const { client, user } = await getClientAndUser();
        const { data, error } = await client
            .from(TABLE)
            .select('*')
            .eq('owner_user_id', user.id)
            .maybeSingle();

        if (error) throw error;
        return rowToRecord(data);
    }

    async function createRemote(state) {
        const { client, user } = await getClientAndUser();
        const { data, error } = await client
            .from(TABLE)
            .insert({
                owner_user_id: user.id,
                schema_version: SCHEMA_VERSION,
                revision: 1,
                state: normalizeState(state)
            })
            .select('*')
            .single();

        if (error) throw error;
        return rowToRecord(data);
    }

    async function updateRemote(state, expectedRevision) {
        const previousRevision = Math.max(
            1,
            Math.floor(Number(expectedRevision) || 1)
        );
        const { client, user } = await getClientAndUser();
        const { data, error } = await client
            .from(TABLE)
            .update({
                schema_version: SCHEMA_VERSION,
                revision: previousRevision + 1,
                state: normalizeState(state)
            })
            .eq('owner_user_id', user.id)
            .eq('revision', previousRevision)
            .select('*')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const conflict = new Error(
                'Shared continuity changed elsewhere before this save completed.'
            );
            conflict.code = 'ATLAS_REVISION_CONFLICT';
            throw conflict;
        }

        return rowToRecord(data);
    }

    function dispatchError(error, action) {
        window.dispatchEvent(
            new CustomEvent(
                'atlas:shared-continuity-cloud-error',
                {
                    detail: {
                        action,
                        code: error?.code || '',
                        message:
                            error?.message ||
                            String(error || 'Shared continuity save failed.')
                    }
                }
            )
        );

        console.error(
            '[AtlasSharedContinuityCloudAuthority]',
            action,
            error
        );

        try {
            window.showToast?.(
                'Couldn’t save Shared progress to Atlas.'
            );
        } catch { }
    }

    function refreshSurface() {
        window.requestAnimationFrame(() => {
            try {
                window.renderHome?.();
                window.dispatchEvent(
                    new CustomEvent(
                        'atlas:compass-hub-refresh-request',
                        { detail: { source: 'shared-continuity' } }
                    )
                );
            } catch { }

            const active = Bridge.readActiveSession();

            if (active?.id === SHARED_SESSION_ID) {
                window.dispatchEvent(
                    new CustomEvent(
                        'atlas:session-change',
                        { detail: { session: active } }
                    )
                );
            }
        });
    }

    function dispatchReady() {
        window.dispatchEvent(
            new CustomEvent(
                'atlas:shared-continuity-cloud-ready',
                { detail: getState() }
            )
        );
        refreshSurface();
    }

    async function persistSnapshot(snapshot) {
        if (!authenticated || !currentUserId) return null;

        const normalized = normalizeState(snapshot);
        const serialized = JSON.stringify(normalized);

        if (serialized === lastSnapshotJson) {
            return remoteRecord;
        }

        try {
            if (!remoteRecord) {
                if (!hasMeaningfulState(normalized)) {
                    lastSnapshotJson = serialized;
                    return null;
                }

                try {
                    remoteRecord = await createRemote(normalized);
                } catch (error) {
                    if (error?.code !== '23505') throw error;

                    remoteRecord = await fetchRemote();
                    if (!remoteRecord) throw error;

                    writeLocalSnapshot(
                        currentUserId,
                        remoteRecord.state
                    );
                    refreshSurface();
                }
            } else {
                remoteRecord = await updateRemote(
                    normalized,
                    remoteRecord.revision
                );
            }

            lastSnapshotJson = JSON.stringify(remoteRecord.state);
            writeCacheOwner(currentUserId);
            return remoteRecord;
        } catch (error) {
            dispatchError(error, 'save');

            try {
                const latest = await fetchRemote();
                remoteRecord = latest;

                if (latest) {
                    lastSnapshotJson = JSON.stringify(latest.state);
                    writeLocalSnapshot(currentUserId, latest.state);
                    refreshSurface();
                }
            } catch (recoveryError) {
                dispatchError(recoveryError, 'recover');
            }

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
            const snapshot = readLocalSnapshot(currentUserId);
            syncChain = syncChain
                .catch(() => undefined)
                .then(() => persistSnapshot(snapshot));
        }, 40);
    }

    async function flush() {
        if (syncTimer) {
            clearTimeout(syncTimer);
            syncTimer = null;
            const snapshot = readLocalSnapshot(currentUserId);
            syncChain = syncChain
                .catch(() => undefined)
                .then(() => persistSnapshot(snapshot));
        }

        await syncChain.catch(() => undefined);
        return getState();
    }

    function isTrackedStorageKey(key) {
        const value = String(key || '');

        return (
            value === Bridge.keys.registry ||
            value === Bridge.keys.ledger ||
            value === Bridge.keys.handoffs ||
            value.startsWith(REVIEW_COMPLETED_PREFIX)
        );
    }

    function installStorageHooks() {
        if (storageHooksInstalled) return;
        storageHooksInstalled = true;

        const originalSetItem = Storage.prototype.setItem;
        const originalRemoveItem = Storage.prototype.removeItem;

        Storage.prototype.setItem = function (key, value) {
            const isLocal = this === window.localStorage;
            const result = originalSetItem.call(this, key, value);

            if (isLocal) {
                if (
                    isTrackedStorageKey(key) &&
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
            const result = originalRemoveItem.call(this, key);

            if (isLocal) {
                if (
                    isTrackedStorageKey(key) &&
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

        if (initializePromise && !force) {
            return initializePromise;
        }

        initializePromise = (async () => {
            const previousUserId = currentUserId;
            const session = await getSession();
            const userId = String(session?.user?.id || '').trim();

            if (!userId) {
                authenticated = false;
                currentUserId = '';
                remoteRecord = null;
                lastSnapshotJson = '';
                initialized = true;

                if (previousUserId) {
                    clearLocalSharedContinuity();
                    writeCacheOwner('');
                    refreshSurface();
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
                clearLocalSharedContinuity();
            }

            currentUserId = userId;

            const remote = await fetchRemote();

            if (remote) {
                remoteRecord = remote;
                lastSnapshotJson = JSON.stringify(remote.state);
                writeLocalSnapshot(userId, remote.state);
            } else {
                clearLocalSharedContinuity();
                remoteRecord = null;
                lastSnapshotJson = JSON.stringify(emptyState());
            }

            writeCacheOwner(userId);
            initialized = true;
            dispatchReady();

            return getState();
        })().catch(error => {
            initializePromise = null;
            dispatchError(error, 'initialize');
            throw error;
        });

        return initializePromise;
    }

    function getState() {
        return {
            initialized,
            authenticated,
            active: initialized && authenticated,
            userId: currentUserId || null,
            cloudExists: Boolean(remoteRecord),
            cloudRevision: remoteRecord?.revision || null
        };
    }

    window.AtlasSharedContinuityCloudAuthority =
        Object.freeze({
            initialize,
            flush,
            getState,
            readLocalSnapshot
        });

    void initialize().catch(() => undefined);
})();
