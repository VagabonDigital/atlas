/* ============================================================
   ATLAS SHARED SESSION SUBJECTS — CLOUD AUTHORITY

   Durable account persistence for Shared/default Session Subjects.

   Named learner Session Subjects are owned by learner_sessions.subject_refs.
   Shared has no learner row, so its subject refs live on the account-level
   shared_continuity_state row introduced in 010 and extended in 011.

   Rules:
   - signed-in Shared Session Subjects are cloud-authoritative
   - signed-out Shared remains browser-local
   - signed-in cloud refs always win over browser cache
   - browser-local Shared refs are only a signed-out/cache concern
   - active learner/session selection remains tab-local
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasSharedSessionSubjectsCloudAuthority) return;

    const TABLE = 'shared_continuity_state';
    const SHARED_SESSION_ID = 'default';
    const SESSION_SUBJECTS_PREFIX =
        'atlas::tutorSubjects::sessionSubjects::';
    const SESSION_SUBJECTS_KEY =
        SESSION_SUBJECTS_PREFIX +
        encodeURIComponent(SHARED_SESSION_ID);
    const CACHE_OWNER_KEY =
        'atlas::sharedSessionSubjectsCloudOwner::v1';
    const AUTH_STORAGE_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';

    let initialized = false;
    let authenticated = false;
    let currentUserId = '';
    let remoteRecord = null;
    let initializePromise = null;
    let queuedInitializePromise = null;
    let forceInitializeQueued = false;
    let initializeGeneration = 0;
    let mutationChain = Promise.resolve();
    let refreshPromise = null;
    let lastRefreshAt = 0;
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

    function normalizeSubjectRef(value) {
        if (
            !value ||
            typeof value !== 'object' ||
            Array.isArray(value)
        ) {
            return null;
        }

        const kind = String(value.kind || '').trim();
        const id = String(value.id || '').trim();

        if (
            !id ||
            (
                kind !== 'my-subject' &&
                kind !== 'atlas-subject'
            )
        ) {
            return null;
        }

        return { kind, id };
    }

    function normalizeSubjectRefs(value) {
        const seen = new Set();

        return (Array.isArray(value) ? value : [])
            .map(normalizeSubjectRef)
            .filter(ref => {
                if (!ref) return false;

                const key = `${ref.kind}:${ref.id}`;
                if (seen.has(key)) return false;

                seen.add(key);
                return true;
            });
    }

    function sameRefs(left, right) {
        return JSON.stringify(normalizeSubjectRefs(left)) ===
            JSON.stringify(normalizeSubjectRefs(right));
    }

    function readLocalRefs() {
        try {
            return normalizeSubjectRefs(
                JSON.parse(
                    localStorage.getItem(
                        SESSION_SUBJECTS_KEY
                    ) || '[]'
                )
            );
        } catch {
            return [];
        }
    }

    function writeLocalRefs(refs) {
        const normalized = normalizeSubjectRefs(refs);
        suspendLocalSync = true;

        try {
            if (normalized.length) {
                localStorage.setItem(
                    SESSION_SUBJECTS_KEY,
                    JSON.stringify(normalized)
                );
            } else {
                localStorage.removeItem(
                    SESSION_SUBJECTS_KEY
                );
            }
        } catch { }
        finally {
            suspendLocalSync = false;
        }

        return normalized;
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

    function clearLocalAccountRefs() {
        writeLocalRefs([]);
        writeCacheOwner('');
    }

    async function getCloudAndUser() {
        if (!window.AtlasCloud) {
            throw new Error(
                'Shared Session Subjects require AtlasCloud.'
            );
        }

        const [client, session] = await Promise.all([
            window.AtlasCloud.getClient(),
            window.AtlasCloud.getSession()
        ]);

        return {
            client,
            user: session?.user || null
        };
    }

    function rowToRecord(row) {
        if (!row || typeof row !== 'object') return null;

        return {
            refs: normalizeSubjectRefs(row.subject_refs),
            updatedAt: Date.parse(row.updated_at) || 0
        };
    }

    async function fetchRemote() {
        const { client, user } = await getCloudAndUser();
        if (!user) return null;

        const { data, error } = await client
            .from(TABLE)
            .select(
                'owner_user_id, subject_refs, updated_at'
            )
            .eq('owner_user_id', user.id)
            .maybeSingle();

        if (error) throw error;
        return rowToRecord(data);
    }

    async function createRemote(refs) {
        const { client, user } = await getCloudAndUser();

        if (!user) {
            throw new Error(
                'Shared Session Subjects require a signed-in Atlas account.'
            );
        }

        const normalized = normalizeSubjectRefs(refs);

        const { data, error } = await client
            .from(TABLE)
            .insert({
                owner_user_id: user.id,
                subject_refs: normalized,
                subject_refs_migrated: true
            })
            .select(
                'owner_user_id, subject_refs, updated_at'
            )
            .single();

        if (error) throw error;
        return rowToRecord(data);
    }

    async function updateRemote(refs) {
        const { client, user } = await getCloudAndUser();

        if (!user) {
            throw new Error(
                'Shared Session Subjects require a signed-in Atlas account.'
            );
        }

        const normalized = normalizeSubjectRefs(refs);

        const { data, error } = await client
            .from(TABLE)
            .update({
                subject_refs: normalized,
                subject_refs_migrated: true
            })
            .eq('owner_user_id', user.id)
            .select(
                'owner_user_id, subject_refs, updated_at'
            )
            .maybeSingle();

        if (error) throw error;
        return rowToRecord(data);
    }

    function refreshSurface() {
        window.requestAnimationFrame(() => {
            try {
                window.AtlasSessionPanel?.refresh?.();
                window.renderHome?.();

                window.dispatchEvent(
                    new CustomEvent(
                        'atlas:compass-hub-refresh-request',
                        { detail: { source: 'shared-session-subjects' } }
                    )
                );
            } catch { }
        });
    }

    function dispatchReady() {
        window.dispatchEvent(
            new CustomEvent(
                'atlas:shared-session-subjects-cloud-ready',
                { detail: getState() }
            )
        );

        refreshSurface();
    }

    function dispatchError(error, action) {
        window.dispatchEvent(
            new CustomEvent(
                'atlas:shared-session-subjects-cloud-error',
                {
                    detail: {
                        action,
                        code: error?.code || '',
                        message:
                            error?.message ||
                            String(
                                error ||
                                'Shared Session Subjects save failed.'
                            )
                    }
                }
            )
        );

        console.error(
            '[AtlasSharedSessionSubjectsCloudAuthority]',
            action,
            error
        );

        try {
            window.showToast?.(
                'Couldn’t save Shared Session Subjects to Atlas.'
            );
        } catch { }
    }

    async function persistRefs(refs) {
        if (!authenticated || !currentUserId) return null;

        const normalized = normalizeSubjectRefs(refs);

        try {
            let saved = null;

            if (!remoteRecord) {
                try {
                    saved = await createRemote(normalized);
                } catch (error) {
                    if (error?.code !== '23505') throw error;

                    remoteRecord = await fetchRemote();
                    saved = remoteRecord
                        ? await updateRemote(normalized)
                        : null;
                }
            } else {
                saved = await updateRemote(normalized);
            }

            if (!saved) {
                throw new Error(
                    'Shared Session Subjects cloud row could not be saved.'
                );
            }

            remoteRecord = saved;
            writeCacheOwner(currentUserId);
            return saved;
        } catch (error) {
            dispatchError(error, 'save');

            try {
                const latest = await fetchRemote();
                remoteRecord = latest;

                if (latest) {
                    writeLocalRefs(latest.refs);
                    writeCacheOwner(currentUserId);
                    refreshSurface();
                }
            } catch (recoveryError) {
                dispatchError(recoveryError, 'recover');
            }

            return null;
        }
    }

    function queueLocalMutation() {
        if (suspendLocalSync) return;

        const task = async () => {
            try {
                await initialize();

                if (!authenticated) return null;

                return persistRefs(
                    readLocalRefs()
                );
            } catch (error) {
                dispatchError(error, 'local-change');
                return null;
            }
        };

        mutationChain = mutationChain
            .catch(() => undefined)
            .then(task);

        return mutationChain;
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
                    key === SESSION_SUBJECTS_KEY &&
                    !suspendLocalSync
                ) {
                    void queueLocalMutation();
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
                    key === SESSION_SUBJECTS_KEY &&
                    !suspendLocalSync
                ) {
                    void queueLocalMutation();
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
            const { user } = await getCloudAndUser();
            const userId = String(user?.id || '').trim();

            if (generation !== initializeGeneration) {
                return getState();
            }

            if (!userId) {
                authenticated = false;
                currentUserId = '';
                remoteRecord = null;
                initialized = true;

                if (previousUserId || readCacheOwner()) {
                    clearLocalAccountRefs();
                    refreshSurface();
                }

                dispatchReady();
                return getState();
            }

            authenticated = true;

            const cacheOwner = readCacheOwner();
            const differentAccount = Boolean(
                cacheOwner && cacheOwner !== userId
            );

            if (
                differentAccount ||
                (
                    previousUserId &&
                    previousUserId !== userId
                )
            ) {
                clearLocalAccountRefs();
            }

            currentUserId = userId;

            const remote = await fetchRemote();

            if (generation !== initializeGeneration) {
                return getState();
            }

            remoteRecord = remote;
            writeLocalRefs(remote?.refs || []);

            writeCacheOwner(userId);
            initialized = true;
            dispatchReady();

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

    async function refreshFromCloud({ force = false } = {}) {
        if (refreshPromise) {
            return refreshPromise;
        }

        const now = Date.now();

        if (!force && now - lastRefreshAt < 750) {
            return getState();
        }

        lastRefreshAt = now;

        refreshPromise = (async () => {
            await initialize();
            await mutationChain.catch(() => undefined);

            if (!authenticated || !currentUserId) {
                return getState();
            }

            const refreshUserId = currentUserId;
            const localBefore = readLocalRefs();
            const latest = await fetchRemote();

            if (
                refreshUserId !== currentUserId ||
                storedAccountUserId() !== refreshUserId
            ) {
                return getState();
            }

            remoteRecord = latest;
            const cloudRefs = latest?.refs || [];

            if (!sameRefs(localBefore, cloudRefs)) {
                writeLocalRefs(cloudRefs);
                refreshSurface();
            }

            writeCacheOwner(currentUserId);
            return getState();
        })()
            .catch(error => {
                dispatchError(error, 'refresh');
                return getState();
            })
            .finally(() => {
                refreshPromise = null;
            });

        return refreshPromise;
    }

    let hasBlurred = false;
    let hasBeenHidden = document.hidden;

    function refreshAfterFocusReturn() {
        if (!hasBlurred || document.hidden) return;
        hasBlurred = false;
        void refreshFromCloud();
    }

    function refreshAfterPageRestore(event) {
        if (event?.persisted === true) {
            void refreshFromCloud();
        }
    }

    function refreshAfterVisibilityReturn() {
        if (document.hidden) {
            hasBeenHidden = true;
            return;
        }

        if (!hasBeenHidden) return;

        hasBeenHidden = false;
        void refreshFromCloud();
    }

    function getState() {
        return {
            initialized,
            authenticated,
            active: initialized && authenticated,
            userId: currentUserId || null,
            cloudExists: Boolean(remoteRecord),
            count: authenticated
                ? (remoteRecord?.refs?.length || 0)
                : readLocalRefs().length
        };
    }

    window.addEventListener('blur', () => {
        hasBlurred = true;
    });
    window.addEventListener(
        'focus',
        refreshAfterFocusReturn
    );
    window.addEventListener(
        'pageshow',
        refreshAfterPageRestore
    );
    document.addEventListener(
        'visibilitychange',
        refreshAfterVisibilityReturn
    );
    window.addEventListener(
        'atlas:account-change',
        event => {
            const detail = event?.detail || {};
            const nextAuthenticated =
                detail.authenticated === true;
            const nextUserId = String(
                detail.userId || ''
            ).trim();

            if (
                nextAuthenticated === authenticated &&
                nextUserId === currentUserId
            ) {
                return;
            }

            void initialize({ force: true })
                .catch(() => undefined);
        }
    );

    window.AtlasSharedSessionSubjectsCloudAuthority =
        Object.freeze({
            initialize,
            refresh: refreshFromCloud,
            getState,
            readLocalRefs
        });

    void initialize().catch(() => undefined);
})();
