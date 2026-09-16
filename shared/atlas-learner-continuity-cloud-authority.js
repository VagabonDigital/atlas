/* ============================================================
   ATLAS LEARNER CONTINUITY — CLOUD AUTHORITY

   Durable account persistence for named-learner teaching continuity.

   Persists the existing AtlasBridge durability contract:
   - Compass and Arcade session state / progress
   - game-specific answers already stored inside session state
   - saved language ledger entries
   - Wrap Up handoffs
   - recent activity
   - Saved Language review-completion watermark

   Shared/default remains browser-local. Active learner selection and
   transient Wrap Up drafts remain browser/tab-local.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasLearnerContinuityCloudAuthority) return;

    if (!window.AtlasCloud || !window.AtlasBridge) {
        console.error(
            '[AtlasLearnerContinuityCloudAuthority] AtlasCloud and AtlasBridge are required.'
        );
        return;
    }

    const TABLE = 'learner_continuity_state';
    const SCHEMA_VERSION = 1;
    const AUTH_STORAGE_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';
    const CACHE_OWNER_KEY =
        'atlas::learnerContinuityCloudOwner::v1';
    const REVIEW_COMPLETED_PREFIX =
        'atlas::languageReviewCompletedThrough::v1::';

    const Bridge = window.AtlasBridge;

    let initialized = false;
    let authenticated = false;
    let currentUserId = '';
    let initializePromise = null;
    let syncTimer = null;
    let syncChain = Promise.resolve();
    let suspendLocalSync = false;
    let storageHooksInstalled = false;

    const recordsBySessionId = new Map();
    const lastSnapshotJsonBySessionId = new Map();

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

    function cleanSessionId(value) {
        return String(value || '').trim();
    }

    function isNamedSessionId(sessionId) {
        const id = cleanSessionId(sessionId);
        return Boolean(id && id !== Bridge.defaultSessionId);
    }

    function normalizeObject(value) {
        return isPlainObject(value)
            ? cloneJson(value)
            : {};
    }

    function normalizeRecentActivity(value, sessionId) {
        const id = cleanSessionId(sessionId);

        return (Array.isArray(value) ? value : [])
            .filter(item =>
                isPlainObject(item) &&
                cleanSessionId(item.sessionId) === id &&
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

    function normalizeState(value, sessionId) {
        const candidate = isPlainObject(value)
            ? value
            : {};

        return {
            schemaVersion: SCHEMA_VERSION,
            sessionStates: normalizeObject(
                candidate.sessionStates
            ),
            ledgerEntries: normalizeObject(
                candidate.ledgerEntries
            ),
            handoffs: normalizeObject(
                candidate.handoffs
            ),
            recentActivity: normalizeRecentActivity(
                candidate.recentActivity,
                sessionId
            ),
            languageReviewCompletedThrough:
                normalizeReviewedThrough(
                    candidate.languageReviewCompletedThrough
                )
        };
    }

    function emptyState(sessionId) {
        return normalizeState(null, sessionId);
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

    function reviewCompletionKey(userId, sessionId) {
        return (
            REVIEW_COMPLETED_PREFIX +
            `user:${userId}` +
            '::' +
            encodeURIComponent(
                cleanSessionId(sessionId)
            )
        );
    }

    function legacyLocalReviewCompletionKey(sessionId) {
        return (
            REVIEW_COMPLETED_PREFIX +
            'local::' +
            encodeURIComponent(
                cleanSessionId(sessionId)
            )
        );
    }

    function readNumberFromStorage(key) {
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

    function readReviewedThrough(sessionId, userId) {
        const accountValue = readNumberFromStorage(
            reviewCompletionKey(userId, sessionId)
        );
        const legacyValue = readNumberFromStorage(
            legacyLocalReviewCompletionKey(sessionId)
        );

        return Math.max(accountValue, legacyValue);
    }

    function readLocalSnapshot(sessionId, userId) {
        const id = cleanSessionId(sessionId);
        const registry = Bridge.readRegistry();
        const ledger = Bridge.readLedger();
        const handoffStore = Bridge.readJson(
            Bridge.keys.handoffs,
            {}
        );

        const sessionStates = normalizeObject(
            registry?.sessionStates?.[id]
        );

        const ledgerEntries = Object.entries(
            isPlainObject(ledger?.entries)
                ? ledger.entries
                : {}
        ).reduce((result, [entryId, entry]) => {
            if (
                isPlainObject(entry) &&
                cleanSessionId(entry.sessionId) === id
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
                cleanSessionId(handoff.sessionId) === id
            ) {
                result[storageId] = cloneJson(handoff);
            }
            return result;
        }, {});

        return normalizeState(
            {
                sessionStates,
                ledgerEntries,
                handoffs,
                recentActivity:
                    registry?.recentActivity || [],
                languageReviewCompletedThrough:
                    readReviewedThrough(id, userId)
            },
            id
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
            if (userId) {
                localStorage.setItem(
                    CACHE_OWNER_KEY,
                    userId
                );
            } else {
                localStorage.removeItem(
                    CACHE_OWNER_KEY
                );
            }
        } catch { }
    }

    function writeReviewedThrough(sessionId, userId, value) {
        const key = reviewCompletionKey(
            userId,
            sessionId
        );
        const normalized = normalizeReviewedThrough(value);

        try {
            if (normalized < 0) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(
                    key,
                    String(normalized)
                );
            }
        } catch { }
    }

    function writeLocalSnapshot(sessionId, userId, state) {
        const id = cleanSessionId(sessionId);
        const normalized = normalizeState(state, id);

        suspendLocalSync = true;

        try {
            const registry = Bridge.readRegistry();

            registry.sessionStates =
                isPlainObject(registry.sessionStates)
                    ? registry.sessionStates
                    : {};

            if (
                Object.keys(normalized.sessionStates).length
            ) {
                registry.sessionStates[id] =
                    cloneJson(normalized.sessionStates);
            } else {
                delete registry.sessionStates[id];
            }

            const otherRecent = (
                Array.isArray(registry.recentActivity)
                    ? registry.recentActivity
                    : []
            ).filter(item =>
                cleanSessionId(item?.sessionId) !== id
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
                isPlainObject(ledger.entries)
                    ? ledger.entries
                    : {}
            ).reduce((result, [entryId, entry]) => {
                if (
                    cleanSessionId(entry?.sessionId) !== id
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
                    cleanSessionId(handoff?.sessionId) !== id
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
                id,
                userId,
                normalized.languageReviewCompletedThrough
            );
        } finally {
            suspendLocalSync = false;
        }
    }

    function clearNamedLocalContinuity() {
        suspendLocalSync = true;

        try {
            const registry = Bridge.readRegistry();
            const defaultId = Bridge.defaultSessionId;

            registry.sessionStates =
                isPlainObject(registry.sessionStates) &&
                registry.sessionStates[defaultId]
                    ? {
                        [defaultId]:
                            registry.sessionStates[defaultId]
                    }
                    : {};

            registry.recentActivity = (
                Array.isArray(registry.recentActivity)
                    ? registry.recentActivity
                    : []
            ).filter(item =>
                cleanSessionId(item?.sessionId) === defaultId
            );

            Bridge.writeRegistry(registry);

            const ledger = Bridge.readLedger();
            const entries = Object.entries(
                isPlainObject(ledger.entries)
                    ? ledger.entries
                    : {}
            ).reduce((result, [entryId, entry]) => {
                if (
                    cleanSessionId(entry?.sessionId) === defaultId
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
                    cleanSessionId(handoff?.sessionId) === defaultId
                ) {
                    result[storageId] = handoff;
                }
                return result;
            }, {});

            Bridge.writeJson(
                Bridge.keys.handoffs,
                handoffs
            );
        } finally {
            suspendLocalSync = false;
        }
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
                'Learner continuity cloud access requires a signed-in Atlas account.'
            );
        }

        return { client, user };
    }

    function rowToRecord(row) {
        if (!row || typeof row !== 'object') return null;

        const sessionId = cleanSessionId(row.session_id);
        if (!sessionId) return null;

        return {
            sessionId,
            revision: Math.max(
                1,
                Math.floor(Number(row.revision) || 1)
            ),
            state: normalizeState(
                row.state,
                sessionId
            ),
            updatedAt:
                Date.parse(row.updated_at) || 0
        };
    }

    async function listRemote() {
        const { client, user } =
            await getClientAndUser();

        const { data, error } = await client
            .from(TABLE)
            .select('*')
            .eq('owner_user_id', user.id);

        if (error) throw error;

        return (data || [])
            .map(rowToRecord)
            .filter(Boolean);
    }

    async function fetchRemote(sessionId) {
        const id = cleanSessionId(sessionId);
        if (!id) return null;

        const { client, user } =
            await getClientAndUser();

        const { data, error } = await client
            .from(TABLE)
            .select('*')
            .eq('owner_user_id', user.id)
            .eq('session_id', id)
            .maybeSingle();

        if (error) throw error;
        return rowToRecord(data);
    }

    async function createRemote(sessionId, state) {
        const id = cleanSessionId(sessionId);
        const { client, user } =
            await getClientAndUser();

        const { data, error } = await client
            .from(TABLE)
            .insert({
                owner_user_id: user.id,
                session_id: id,
                schema_version: SCHEMA_VERSION,
                revision: 1,
                state: normalizeState(state, id)
            })
            .select('*')
            .single();

        if (error) throw error;
        return rowToRecord(data);
    }

    async function updateRemote(
        sessionId,
        state,
        expectedRevision
    ) {
        const id = cleanSessionId(sessionId);
        const previousRevision = Math.max(
            1,
            Math.floor(Number(expectedRevision) || 1)
        );
        const { client, user } =
            await getClientAndUser();

        const { data, error } = await client
            .from(TABLE)
            .update({
                schema_version: SCHEMA_VERSION,
                revision: previousRevision + 1,
                state: normalizeState(state, id)
            })
            .eq('owner_user_id', user.id)
            .eq('session_id', id)
            .eq('revision', previousRevision)
            .select('*')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const conflict = new Error(
                'This learner continuity changed elsewhere before the save completed.'
            );
            conflict.code = 'ATLAS_REVISION_CONFLICT';
            throw conflict;
        }

        return rowToRecord(data);
    }

    function dispatchError(error, action, sessionId = '') {
        window.dispatchEvent(
            new CustomEvent(
                'atlas:learner-continuity-cloud-error',
                {
                    detail: {
                        action,
                        sessionId,
                        code: error?.code || '',
                        message:
                            error?.message ||
                            String(
                                error ||
                                'Learner continuity save failed.'
                            )
                    }
                }
            )
        );

        console.error(
            '[AtlasLearnerContinuityCloudAuthority]',
            action,
            sessionId,
            error
        );

        try {
            window.showToast?.(
                'Couldn’t save this learner’s progress to Atlas.'
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
                        { detail: { source: 'learner-continuity' } }
                    )
                );
            } catch { }

            const active = Bridge.readActiveSession();

            if (
                active &&
                isNamedSessionId(active.id)
            ) {
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
                'atlas:learner-continuity-cloud-ready',
                { detail: getState() }
            )
        );

        refreshSurface();
    }

    function getLocalNamedSessionIds() {
        const ids = new Set();

        Bridge.readSessions().forEach(session => {
            if (isNamedSessionId(session?.id)) {
                ids.add(session.id);
            }
        });

        const registry = Bridge.readRegistry();

        Object.keys(
            isPlainObject(registry.sessionStates)
                ? registry.sessionStates
                : {}
        ).forEach(id => {
            if (isNamedSessionId(id)) ids.add(id);
        });

        Object.values(
            isPlainObject(Bridge.readLedger()?.entries)
                ? Bridge.readLedger().entries
                : {}
        ).forEach(entry => {
            const id = cleanSessionId(entry?.sessionId);
            if (isNamedSessionId(id)) ids.add(id);
        });

        Object.values(
            Bridge.readJson(Bridge.keys.handoffs, {}) || {}
        ).forEach(handoff => {
            const id = cleanSessionId(handoff?.sessionId);
            if (isNamedSessionId(id)) ids.add(id);
        });

        (
            Array.isArray(registry.recentActivity)
                ? registry.recentActivity
                : []
        ).forEach(activity => {
            const id = cleanSessionId(activity?.sessionId);
            if (isNamedSessionId(id)) ids.add(id);
        });

        return ids;
    }

    async function persistSessionSnapshot(
        sessionId,
        snapshot
    ) {
        const id = cleanSessionId(sessionId);
        if (!isNamedSessionId(id)) return null;

        const normalized = normalizeState(snapshot, id);
        const serialized = JSON.stringify(normalized);

        if (
            lastSnapshotJsonBySessionId.get(id) === serialized
        ) {
            return recordsBySessionId.get(id) || null;
        }

        let remote = recordsBySessionId.get(id) || null;

        try {
            if (!remote) {
                if (!hasMeaningfulState(normalized)) {
                    lastSnapshotJsonBySessionId.set(
                        id,
                        serialized
                    );
                    return null;
                }

                try {
                    remote = await createRemote(
                        id,
                        normalized
                    );
                } catch (error) {
                    if (error?.code !== '23505') throw error;

                    remote = await fetchRemote(id);
                    if (!remote) throw error;

                    writeLocalSnapshot(
                        id,
                        currentUserId,
                        remote.state
                    );
                }
            } else {
                remote = await updateRemote(
                    id,
                    normalized,
                    remote.revision
                );
            }

            recordsBySessionId.set(id, remote);
            lastSnapshotJsonBySessionId.set(
                id,
                JSON.stringify(remote.state)
            );
            return remote;
        } catch (error) {
            dispatchError(error, 'save', id);

            try {
                const latest = await fetchRemote(id);

                if (latest) {
                    recordsBySessionId.set(id, latest);
                    lastSnapshotJsonBySessionId.set(
                        id,
                        JSON.stringify(latest.state)
                    );
                    writeLocalSnapshot(
                        id,
                        currentUserId,
                        latest.state
                    );
                    refreshSurface();
                }
            } catch (recoveryError) {
                dispatchError(
                    recoveryError,
                    'recover',
                    id
                );
            }

            return null;
        }
    }

    async function syncAllNamedSessions() {
        if (
            !initialized ||
            !authenticated ||
            !currentUserId
        ) {
            return getState();
        }

        const sessionIds = new Set([
            ...getLocalNamedSessionIds(),
            ...recordsBySessionId.keys()
        ]);

        for (const sessionId of sessionIds) {
            const snapshot = readLocalSnapshot(
                sessionId,
                currentUserId
            );

            await persistSessionSnapshot(
                sessionId,
                snapshot
            );
        }

        return getState();
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
            syncChain = syncChain
                .catch(() => undefined)
                .then(syncAllNamedSessions);
        }, 40);
    }

    async function flush() {
        if (syncTimer) {
            clearTimeout(syncTimer);
            syncTimer = null;
            syncChain = syncChain
                .catch(() => undefined)
                .then(syncAllNamedSessions);
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
            const result = originalSetItem.call(
                this,
                key,
                value
            );

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
            const result = originalRemoveItem.call(
                this,
                key
            );

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
            const userId = cleanSessionId(
                session?.user?.id
            );

            if (!userId) {
                authenticated = false;
                currentUserId = '';
                recordsBySessionId.clear();
                lastSnapshotJsonBySessionId.clear();
                initialized = true;

                if (previousUserId) {
                    clearNamedLocalContinuity();
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
                clearNamedLocalContinuity();
            }

            currentUserId = userId;

            const localIdsBefore =
                getLocalNamedSessionIds();
            const localBefore = new Map();

            if (!belongsToDifferentAccount) {
                localIdsBefore.forEach(sessionId => {
                    localBefore.set(
                        sessionId,
                        readLocalSnapshot(
                            sessionId,
                            userId
                        )
                    );
                });
            }

            const remoteRecords = await listRemote();

            recordsBySessionId.clear();
            lastSnapshotJsonBySessionId.clear();

            remoteRecords.forEach(record => {
                recordsBySessionId.set(
                    record.sessionId,
                    record
                );
                lastSnapshotJsonBySessionId.set(
                    record.sessionId,
                    JSON.stringify(record.state)
                );
                writeLocalSnapshot(
                    record.sessionId,
                    userId,
                    record.state
                );
            });

            if (!belongsToDifferentAccount) {
                for (const [sessionId, state] of localBefore) {
                    if (
                        recordsBySessionId.has(sessionId) ||
                        !hasMeaningfulState(state)
                    ) {
                        continue;
                    }

                    try {
                        const created = await createRemote(
                            sessionId,
                            state
                        );

                        recordsBySessionId.set(
                            sessionId,
                            created
                        );
                        lastSnapshotJsonBySessionId.set(
                            sessionId,
                            JSON.stringify(created.state)
                        );
                        writeLocalSnapshot(
                            sessionId,
                            userId,
                            created.state
                        );
                    } catch (error) {
                        if (error?.code === '23505') {
                            const existing =
                                await fetchRemote(sessionId);

                            if (existing) {
                                recordsBySessionId.set(
                                    sessionId,
                                    existing
                                );
                                lastSnapshotJsonBySessionId.set(
                                    sessionId,
                                    JSON.stringify(existing.state)
                                );
                                writeLocalSnapshot(
                                    sessionId,
                                    userId,
                                    existing.state
                                );
                                continue;
                            }
                        }

                        dispatchError(
                            error,
                            'legacy-claim',
                            sessionId
                        );
                    }
                }
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
            cloudCount: recordsBySessionId.size
        };
    }

    window.AtlasLearnerContinuityCloudAuthority =
        Object.freeze({
            initialize,
            flush,
            getState,
            readLocalSnapshot
        });

    window.addEventListener(
        'atlas:learner-cloud-ready',
        () => {
            if (authenticated) {
                void initialize({ force: true })
                    .catch(() => undefined);
            }
        }
    );

    void initialize().catch(() => undefined);
})();
