/* ============================================================
   ATLAS COMPASS SUGGESTION HISTORY — CLOUD AUTHORITY

   Durable account-owned discovery memory for Compass suggestions.
   - one rolling title history per discovery mode
   - maximum 36 titles per mode
   - cloud authoritative for signed-in tutors
   - account-scoped localStorage cache for fast, resilient reads
   - anonymous history stays page-lifecycle only
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasCompassSuggestionHistory) return;

    const TABLE = 'compass_suggestion_state';
    const AUTH_STORAGE_KEY = 'sb-jnhjfpagectprceswvqn-auth-token';
    const CACHE_KEY = 'atlas::compassSuggestionHistory::v1';
    const CACHE_OWNER_KEY = 'atlas::compassSuggestionHistoryOwner::v1';
    const DIRTY_OWNER_KEY = 'atlas::compassSuggestionHistoryDirtyOwner::v1';
    const CLOUD_SCRIPT_PATH = '/shared/atlas-cloud.js';
    const CLOUD_SCRIPT_VERSION = '20260916-runtime3';
    const SCHEMA_VERSION = 1;
    const MAX_TITLES = 36;
    const MAX_TITLE_LENGTH = 120;
    const VALID_MODES = new Set([
        'learner',
        'surprise',
        'current-affairs',
        'science-nature',
        'technology-future',
        'culture-society',
        'history-civilization',
        'business-politics',
        'travel-experiences'
    ]);

    let initialized = false;
    let authenticated = false;
    let currentUserId = '';
    let remoteRecord = null;
    let initializePromise = null;
    let initializePromiseUserId = '';
    let cloudPromise = null;
    let syncChain = Promise.resolve();
    const anonymousHistory = new Map();

    function storedAccountUserId() {
        try {
            const raw = localStorage.getItem(AUTH_STORAGE_KEY);
            if (!raw) return '';

            const parsed = JSON.parse(raw);
            const candidates = [
                parsed,
                parsed?.session,
                parsed?.currentSession,
                parsed?.data?.session
            ];

            for (const candidate of candidates) {
                const id = String(candidate?.user?.id || '').trim();
                if (id) return id;
            }
        } catch { }

        return '';
    }

    function cleanMode(value) {
        const mode = String(value || '').trim();
        return VALID_MODES.has(mode) ? mode : '';
    }

    function cleanTitle(value) {
        return String(value || '')
            .trim()
            .slice(0, MAX_TITLE_LENGTH);
    }

    function normalizeTitles(value) {
        const source = Array.isArray(value) ? value : [];
        const seen = new Set();
        const newestFirst = [];

        for (
            let index = source.length - 1;
            index >= 0;
            index -= 1
        ) {
            const title = cleanTitle(source[index]);
            const key = title.toLocaleLowerCase();

            if (!title || seen.has(key)) continue;

            seen.add(key);
            newestFirst.push(title);

            if (newestFirst.length >= MAX_TITLES) {
                break;
            }
        }

        return newestFirst.reverse();
    }

    function normalizeState(value) {
        const candidate =
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
                ? value
                : {};

        const source =
            candidate.historyByMode &&
            typeof candidate.historyByMode === 'object' &&
            !Array.isArray(candidate.historyByMode)
                ? candidate.historyByMode
                : {};

        const historyByMode = {};

        Object.entries(source).forEach(
            ([rawMode, titles]) => {
                const mode = cleanMode(rawMode);
                if (!mode) return;

                const normalized =
                    normalizeTitles(titles);

                if (normalized.length) {
                    historyByMode[mode] =
                        normalized;
                }
            }
        );

        return {
            schemaVersion: SCHEMA_VERSION,
            historyByMode
        };
    }

    function mergeStates(base, incoming) {
        const left = normalizeState(base);
        const right = normalizeState(incoming);
        const historyByMode = {};

        VALID_MODES.forEach(mode => {
            const merged = normalizeTitles([
                ...(left.historyByMode[mode] || []),
                ...(right.historyByMode[mode] || [])
            ]);

            if (merged.length) {
                historyByMode[mode] = merged;
            }
        });

        return {
            schemaVersion: SCHEMA_VERSION,
            historyByMode
        };
    }

    function emptyState() {
        return normalizeState(null);
    }

    function hasMeaningfulState(value) {
        const state = normalizeState(value);

        return Object.values(
            state.historyByMode
        ).some(titles =>
            Array.isArray(titles) &&
            titles.length > 0
        );
    }

    function statesEqual(left, right) {
        return JSON.stringify(
            normalizeState(left)
        ) === JSON.stringify(
            normalizeState(right)
        );
    }

    function readCacheOwner() {
        try {
            return String(
                localStorage.getItem(
                    CACHE_OWNER_KEY
                ) || ''
            ).trim();
        } catch {
            return '';
        }
    }

    function writeCacheOwner(userId) {
        try {
            const id =
                String(userId || '').trim();

            if (id) {
                localStorage.setItem(
                    CACHE_OWNER_KEY,
                    id
                );
            } else {
                localStorage.removeItem(
                    CACHE_OWNER_KEY
                );
            }
        } catch { }
    }

    function readDirtyOwner() {
        try {
            return String(
                localStorage.getItem(
                    DIRTY_OWNER_KEY
                ) || ''
            ).trim();
        } catch {
            return '';
        }
    }

    function writeDirtyOwner(userId) {
        try {
            const id =
                String(userId || '').trim();

            if (id) {
                localStorage.setItem(
                    DIRTY_OWNER_KEY,
                    id
                );
            } else {
                localStorage.removeItem(
                    DIRTY_OWNER_KEY
                );
            }
        } catch { }
    }

    function readLocalState() {
        try {
            return normalizeState(
                JSON.parse(
                    localStorage.getItem(
                        CACHE_KEY
                    ) || '{}'
                )
            );
        } catch {
            return emptyState();
        }
    }

    function writeLocalState(value) {
        const state = normalizeState(value);

        try {
            if (
                Object.keys(
                    state.historyByMode
                ).length
            ) {
                localStorage.setItem(
                    CACHE_KEY,
                    JSON.stringify(state)
                );
            } else {
                localStorage.removeItem(
                    CACHE_KEY
                );
            }

            return true;
        } catch {
            return false;
        }
    }

    function loadCloudScript() {
        if (window.AtlasCloud) {
            return Promise.resolve(
                window.AtlasCloud
            );
        }

        if (cloudPromise) {
            return cloudPromise;
        }

        cloudPromise =
            new Promise((resolve, reject) => {
                const resolveCloud = () => {
                    if (window.AtlasCloud) {
                        resolve(window.AtlasCloud);
                        return true;
                    }

                    return false;
                };

                if (resolveCloud()) {
                    return;
                }

                const existing =
                    Array.from(
                        document.scripts || []
                    ).find(script => {
                        try {
                            return new URL(
                                script.src,
                                window.location.href
                            ).pathname ===
                                CLOUD_SCRIPT_PATH;
                        } catch {
                            return false;
                        }
                    });

                const script =
                    existing ||
                    document.createElement(
                        'script'
                    );

                let timeout = null;

                const cleanup = () => {
                    script.removeEventListener(
                        'load',
                        onLoad
                    );
                    script.removeEventListener(
                        'error',
                        onError
                    );

                    if (timeout) {
                        window.clearTimeout(
                            timeout
                        );
                    }
                };

                const onLoad = () => {
                    cleanup();

                    if (!resolveCloud()) {
                        reject(
                            new Error(
                                'Atlas Cloud loaded without a usable runtime.'
                            )
                        );
                    }
                };

                const onError = () => {
                    cleanup();
                    reject(
                        new Error(
                            'Atlas could not load its cloud runtime.'
                        )
                    );
                };

                script.addEventListener(
                    'load',
                    onLoad,
                    { once: true }
                );

                script.addEventListener(
                    'error',
                    onError,
                    { once: true }
                );

                timeout =
                    window.setTimeout(() => {
                        cleanup();

                        if (!resolveCloud()) {
                            reject(
                                new Error(
                                    'Atlas Cloud did not become ready.'
                                )
                            );
                        }
                    }, 8000);

                if (!existing) {
                    script.src =
                        CLOUD_SCRIPT_PATH +
                        '?v=' +
                        CLOUD_SCRIPT_VERSION;

                    script.async = true;
                    script.dataset
                        .atlasCompassSuggestionCloud =
                            'true';

                    document.head.appendChild(
                        script
                    );
                }
            })
                .finally(() => {
                    if (!window.AtlasCloud) {
                        cloudPromise = null;
                    }
                });

        return cloudPromise;
    }

    async function getCloud() {
        return window.AtlasCloud ||
            loadCloudScript();
    }

    function rowToRecord(row) {
        if (
            !row ||
            typeof row !== 'object'
        ) {
            return null;
        }

        return {
            revision:
                Math.max(
                    1,
                    Math.floor(
                        Number(row.revision) || 1
                    )
                ),
            state:
                normalizeState(row.state)
        };
    }

    async function fetchRemote(userId) {
        const Cloud = await getCloud();
        const client = await Cloud.getClient();

        const { data, error } =
            await client
                .from(TABLE)
                .select('*')
                .eq(
                    'owner_user_id',
                    userId
                )
                .maybeSingle();

        if (error) throw error;
        return rowToRecord(data);
    }

    async function createRemote(
        userId,
        state
    ) {
        const Cloud = await getCloud();
        const client = await Cloud.getClient();

        const { data, error } =
            await client
                .from(TABLE)
                .insert({
                    owner_user_id: userId,
                    schema_version:
                        SCHEMA_VERSION,
                    revision: 1,
                    state:
                        normalizeState(state)
                })
                .select('*')
                .single();

        if (error) throw error;
        return rowToRecord(data);
    }

    async function updateRemote(
        userId,
        state,
        revision
    ) {
        const Cloud = await getCloud();
        const client = await Cloud.getClient();

        const expectedRevision =
            Math.max(
                1,
                Math.floor(
                    Number(revision) || 1
                )
            );

        const { data, error } =
            await client
                .from(TABLE)
                .update({
                    schema_version:
                        SCHEMA_VERSION,
                    revision:
                        expectedRevision + 1,
                    state:
                        normalizeState(state),
                    updated_at:
                        new Date()
                            .toISOString()
                })
                .eq(
                    'owner_user_id',
                    userId
                )
                .eq(
                    'revision',
                    expectedRevision
                )
                .select('*')
                .maybeSingle();

        if (error) throw error;

        if (!data) {
            const conflict =
                new Error(
                    'Compass suggestion history changed elsewhere.'
                );

            conflict.code =
                'ATLAS_REVISION_CONFLICT';

            throw conflict;
        }

        return rowToRecord(data);
    }

    async function mergeAndRetry(
        userId,
        snapshot
    ) {
        const latest =
            await fetchRemote(userId);

        if (!latest) {
            return null;
        }

        const merged =
            mergeStates(
                latest.state,
                snapshot
            );

        remoteRecord =
            await updateRemote(
                userId,
                merged,
                latest.revision
            );

        writeCacheOwner(userId);

        return remoteRecord;
    }

    async function persist(state) {
        if (
            !authenticated ||
            !currentUserId
        ) {
            return null;
        }

        const userId = currentUserId;
        const snapshot =
            normalizeState(state);

        try {
            if (!remoteRecord) {
                try {
                    remoteRecord =
                        await createRemote(
                            userId,
                            snapshot
                        );
                } catch (error) {
                    if (
                        error?.code !==
                        '23505'
                    ) {
                        throw error;
                    }

                    remoteRecord =
                        await mergeAndRetry(
                            userId,
                            snapshot
                        );
                }
            } else {
                const desired =
                    mergeStates(
                        remoteRecord.state,
                        snapshot
                    );

                try {
                    remoteRecord =
                        await updateRemote(
                            userId,
                            desired,
                            remoteRecord.revision
                        );
                } catch (error) {
                    if (
                        error?.code !==
                        'ATLAS_REVISION_CONFLICT'
                    ) {
                        throw error;
                    }

                    remoteRecord =
                        await mergeAndRetry(
                            userId,
                            desired
                        );
                }
            }

            writeCacheOwner(userId);

            if (
                remoteRecord &&
                statesEqual(
                    readLocalState(),
                    snapshot
                )
            ) {
                writeLocalState(
                    remoteRecord.state
                );

                if (
                    readDirtyOwner() ===
                    userId
                ) {
                    writeDirtyOwner('');
                }
            }

            return remoteRecord;
        } catch (error) {
            console.error(
                '[AtlasCompassSuggestionHistory] Save failed.',
                error
            );

            // Keep the account-owned local cache intact on transient
            // failure. It remains useful for this browser and can be
            // merged into cloud state on a later successful write.
            return null;
        }
    }

    async function initialize({
        force = false
    } = {}) {
        const storedUserId =
            storedAccountUserId();

        if (!storedUserId) {
            const previousUserId =
                currentUserId;

            authenticated = false;
            currentUserId = '';
            remoteRecord = null;
            initialized = true;

            if (
                previousUserId ||
                readCacheOwner()
            ) {
                writeLocalState(
                    emptyState()
                );

                writeCacheOwner('');
                writeDirtyOwner('');
            }

            return getState();
        }

        if (
            initialized &&
            !force &&
            storedUserId ===
                currentUserId
        ) {
            return getState();
        }

        if (initializePromise) {
            if (
                initializePromiseUserId ===
                storedUserId
            ) {
                return initializePromise;
            }

            await initializePromise
                .catch(() => undefined);

            return initialize({
                force: true
            });
        }

        initializePromiseUserId =
            storedUserId;

        initializePromise = (async () => {
            const previousUserId =
                currentUserId;

            const cacheOwner =
                readCacheOwner();

            const belongsToDifferentAccount =
                Boolean(
                    cacheOwner &&
                    cacheOwner !==
                        storedUserId
                );

            if (
                belongsToDifferentAccount ||
                (
                    previousUserId &&
                    previousUserId !==
                        storedUserId
                )
            ) {
                writeLocalState(
                    emptyState()
                );
                writeDirtyOwner('');
            }

            authenticated = true;
            currentUserId =
                storedUserId;

            try {
                const Cloud =
                    await getCloud();

                const session =
                    await Cloud.getSession();

                const liveUserId =
                    String(
                        session?.user?.id ||
                        ''
                    ).trim();

                if (!liveUserId) {
                    authenticated = false;
                    currentUserId = '';
                    remoteRecord = null;
                    initialized = true;

                    writeLocalState(
                        emptyState()
                    );

                    writeCacheOwner('');
                    writeDirtyOwner('');

                    return getState();
                }

                if (
                    liveUserId !==
                    storedUserId
                ) {
                    writeLocalState(
                        emptyState()
                    );
                    writeDirtyOwner('');
                }

                authenticated = true;
                currentUserId =
                    liveUserId;

                const localIsDirty =
                    readCacheOwner() ===
                        liveUserId &&
                    readDirtyOwner() ===
                        liveUserId;

                const localBefore =
                    localIsDirty
                        ? readLocalState()
                        : emptyState();

                remoteRecord =
                    await fetchRemote(
                        liveUserId
                    );

                if (remoteRecord) {
                    const merged =
                        mergeStates(
                            remoteRecord.state,
                            localBefore
                        );

                    if (
                        localIsDirty &&
                        hasMeaningfulState(
                            localBefore
                        ) &&
                        !statesEqual(
                            merged,
                            remoteRecord.state
                        )
                    ) {
                        try {
                            remoteRecord =
                                await updateRemote(
                                    liveUserId,
                                    merged,
                                    remoteRecord.revision
                                );
                        } catch (error) {
                            if (
                                error?.code !==
                                'ATLAS_REVISION_CONFLICT'
                            ) {
                                throw error;
                            }

                            remoteRecord =
                                await mergeAndRetry(
                                    liveUserId,
                                    merged
                                );
                        }
                    }

                    writeLocalState(
                        remoteRecord?.state ||
                        merged
                    );
                } else if (
                    localIsDirty &&
                    hasMeaningfulState(
                        localBefore
                    )
                ) {
                    try {
                        remoteRecord =
                            await createRemote(
                                liveUserId,
                                localBefore
                            );
                    } catch (error) {
                        if (
                            error?.code !==
                            '23505'
                        ) {
                            throw error;
                        }

                        remoteRecord =
                            await mergeAndRetry(
                                liveUserId,
                                localBefore
                            );
                    }

                    writeLocalState(
                        remoteRecord?.state ||
                        localBefore
                    );
                } else {
                    writeLocalState(
                        emptyState()
                    );
                }

                writeCacheOwner(
                    liveUserId
                );

                if (
                    remoteRecord &&
                    readDirtyOwner() ===
                        liveUserId
                ) {
                    writeDirtyOwner('');
                }

                initialized = true;
                return getState();
            } catch (error) {
                console.error(
                    '[AtlasCompassSuggestionHistory] Initialize failed.',
                    error
                );

                // If the browser cache demonstrably belongs to this
                // signed-in account, keep using it as a local fallback.
                if (
                    readCacheOwner() !==
                    storedUserId
                ) {
                    writeLocalState(
                        emptyState()
                    );
                    writeCacheOwner(
                        storedUserId
                    );
                    writeDirtyOwner('');
                }

                initialized = true;
                return getState();
            }
        })().finally(() => {
            initializePromise = null;
            initializePromiseUserId = '';
        });

        return initializePromise;
    }

    function getTitles(modeId) {
        const mode =
            cleanMode(modeId);

        if (!mode) return [];

        if (!authenticated) {
            return normalizeTitles(
                anonymousHistory.get(
                    mode
                ) || []
            );
        }

        return normalizeTitles(
            readLocalState()
                .historyByMode[mode]
        );
    }

    function remember(
        modeId,
        titles
    ) {
        const mode =
            cleanMode(modeId);

        if (!mode) {
            return Promise.resolve(
                false
            );
        }

        if (!authenticated) {
            anonymousHistory.set(
                mode,
                normalizeTitles([
                    ...(
                        anonymousHistory.get(
                            mode
                        ) || []
                    ),
                    ...(
                        Array.isArray(titles)
                            ? titles
                            : []
                    )
                ])
            );

            return Promise.resolve(
                true
            );
        }

        const state =
            readLocalState();

        state.historyByMode[mode] =
            normalizeTitles([
                ...(
                    state.historyByMode[
                        mode
                    ] || []
                ),
                ...(
                    Array.isArray(titles)
                        ? titles
                        : []
                )
            ]);

        writeLocalState(state);
        writeCacheOwner(
            currentUserId
        );
        writeDirtyOwner(
            currentUserId
        );

        syncChain =
            syncChain
                .catch(() => undefined)
                .then(() =>
                    persist(state)
                );

        return syncChain.then(
            () => true
        );
    }

    async function flush() {
        await syncChain
            .catch(() => undefined);

        return getState();
    }

    function getState() {
        return {
            initialized,
            authenticated,
            active:
                initialized &&
                authenticated,
            userId:
                currentUserId || null,
            cloudRevision:
                remoteRecord
                    ?.revision || null
        };
    }

    window.AtlasCompassSuggestionHistory =
        Object.freeze({
            initialize,
            flush,
            getState,
            getTitles,
            remember,
            readLocalState
        });

    void initialize();
})();
