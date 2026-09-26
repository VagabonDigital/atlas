/* ============================================================
   ATLAS COMPASS SUGGESTION HISTORY — CLOUD AUTHORITY

   Durable account-owned discovery memory for Compass suggestions.
   - one rolling title history per discovery mode
   - maximum 36 titles per mode
   - cloud authoritative for signed-in tutors
   - account-scoped localStorage cache for fast, resilient reads
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasCompassSuggestionHistory) return;
    if (!window.AtlasCloud) {
        console.error('[AtlasCompassSuggestionHistory] AtlasCloud is unavailable.');
        return;
    }

    const TABLE = 'compass_suggestion_state';
    const AUTH_STORAGE_KEY = 'sb-jnhjfpagectprceswvqn-auth-token';
    const CACHE_KEY = 'atlas::compassSuggestionHistory::v1';
    const CACHE_OWNER_KEY = 'atlas::compassSuggestionHistoryOwner::v1';
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
        return String(value || '').trim().slice(0, MAX_TITLE_LENGTH);
    }

    function normalizeTitles(value) {
        const seen = new Set();
        const result = [];
        (Array.isArray(value) ? value : []).forEach(raw => {
            const title = cleanTitle(raw);
            const key = title.toLocaleLowerCase();
            if (!title || seen.has(key)) return;
            seen.add(key);
            result.push(title);
        });
        return result.slice(-MAX_TITLES);
    }

    function normalizeState(value) {
        const candidate =
            value && typeof value === 'object' && !Array.isArray(value)
                ? value
                : {};
        const source =
            candidate.historyByMode &&
            typeof candidate.historyByMode === 'object' &&
            !Array.isArray(candidate.historyByMode)
                ? candidate.historyByMode
                : {};
        const historyByMode = {};
        Object.entries(source).forEach(([rawMode, titles]) => {
            const mode = cleanMode(rawMode);
            if (!mode) return;
            const normalized = normalizeTitles(titles);
            if (normalized.length) historyByMode[mode] = normalized;
        });
        return { schemaVersion: SCHEMA_VERSION, historyByMode };
    }

    function emptyState() {
        return normalizeState(null);
    }

    function readCacheOwner() {
        try {
            return String(localStorage.getItem(CACHE_OWNER_KEY) || '').trim();
        } catch {
            return '';
        }
    }

    function writeCacheOwner(userId) {
        try {
            const id = String(userId || '').trim();
            if (id) localStorage.setItem(CACHE_OWNER_KEY, id);
            else localStorage.removeItem(CACHE_OWNER_KEY);
        } catch { }
    }

    function readLocalState() {
        try {
            return normalizeState(
                JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
            );
        } catch {
            return emptyState();
        }
    }

    function writeLocalState(value) {
        const state = normalizeState(value);
        try {
            if (Object.keys(state.historyByMode).length) {
                localStorage.setItem(CACHE_KEY, JSON.stringify(state));
            } else {
                localStorage.removeItem(CACHE_KEY);
            }
            return true;
        } catch {
            return false;
        }
    }

    function rowToRecord(row) {
        if (!row || typeof row !== 'object') return null;
        return {
            revision: Math.max(1, Math.floor(Number(row.revision) || 1)),
            state: normalizeState(row.state)
        };
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

    async function updateRemote(userId, state, revision) {
        const client = await AtlasCloud.getClient();
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
            const conflict = new Error('Compass suggestion history changed elsewhere.');
            conflict.code = 'ATLAS_REVISION_CONFLICT';
            throw conflict;
        }
        return rowToRecord(data);
    }

    async function persist(state) {
        if (!authenticated || !currentUserId) return;
        const snapshot = normalizeState(state);
        try {
            if (!remoteRecord) {
                try {
                    remoteRecord = await createRemote(currentUserId, snapshot);
                } catch (error) {
                    if (error?.code !== '23505') throw error;
                    remoteRecord = await fetchRemote(currentUserId);
                    if (!remoteRecord) throw error;
                }
            } else {
                remoteRecord = await updateRemote(
                    currentUserId,
                    snapshot,
                    remoteRecord.revision
                );
            }
            writeLocalState(remoteRecord.state);
            writeCacheOwner(currentUserId);
        } catch (error) {
            console.error('[AtlasCompassSuggestionHistory] Save failed.', error);
            try {
                remoteRecord = await fetchRemote(currentUserId);
                writeLocalState(remoteRecord?.state || emptyState());
                writeCacheOwner(currentUserId);
            } catch { }
        }
    }

    async function initialize({ force = false } = {}) {
        const storedUserId = storedAccountUserId();

        if (
            initialized &&
            !force &&
            storedUserId === currentUserId
        ) {
            return getState();
        }

        if (initializePromise) return initializePromise;
        initializePromise = (async () => {
            const session = await AtlasCloud.getSession();
            const userId = String(session?.user?.id || '').trim();
            const previousUserId = currentUserId;

            if (!userId) {
                authenticated = false;
                currentUserId = '';
                remoteRecord = null;
                if (previousUserId || readCacheOwner()) {
                    writeLocalState(emptyState());
                    writeCacheOwner('');
                }
                initialized = true;
                return getState();
            }

            authenticated = true;
            currentUserId = userId;

            if (
                (previousUserId && previousUserId !== userId) ||
                (readCacheOwner() && readCacheOwner() !== userId)
            ) {
                writeLocalState(emptyState());
            }

            remoteRecord = await fetchRemote(userId);
            writeLocalState(remoteRecord?.state || emptyState());
            writeCacheOwner(userId);
            initialized = true;
            return getState();
        })().catch(error => {
            console.error('[AtlasCompassSuggestionHistory] Initialize failed.', error);
            initialized = true;
            return getState();
        }).finally(() => {
            initializePromise = null;
        });
        return initializePromise;
    }

    function getTitles(modeId) {
        const mode = cleanMode(modeId);
        if (!mode) return [];

        if (!authenticated) {
            return normalizeTitles(
                anonymousHistory.get(mode) || []
            );
        }

        return normalizeTitles(
            readLocalState().historyByMode[mode]
        );
    }

    function remember(modeId, titles) {
        const mode = cleanMode(modeId);
        if (!mode) return Promise.resolve(false);

        if (!authenticated) {
            anonymousHistory.set(
                mode,
                normalizeTitles([
                    ...(anonymousHistory.get(mode) || []),
                    ...(Array.isArray(titles) ? titles : [])
                ])
            );
            return Promise.resolve(true);
        }

        const state = readLocalState();
        state.historyByMode[mode] = normalizeTitles([
            ...(state.historyByMode[mode] || []),
            ...(Array.isArray(titles) ? titles : [])
        ]);
        writeLocalState(state);

        syncChain = syncChain
            .catch(() => undefined)
            .then(() => persist(state));
        return syncChain.then(() => true);
    }

    async function flush() {
        await syncChain.catch(() => undefined);
        return getState();
    }

    function getState() {
        return {
            initialized,
            authenticated,
            active: initialized && authenticated,
            userId: currentUserId || null,
            cloudRevision: remoteRecord?.revision || null
        };
    }

    window.AtlasCompassSuggestionHistory = Object.freeze({
        initialize,
        flush,
        getState,
        getTitles,
        remember,
        readLocalState
    });

    void initialize();
})();
