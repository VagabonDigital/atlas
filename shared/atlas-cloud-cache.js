/* ============================================================
   ATLAS CLOUD CACHE
   Fast authenticated read layer for Compass subject data.

   Compass hub strategy:
   - persist lightweight subject summaries + library state per account;
   - paint the last-known hub immediately without waiting for Supabase JS;
   - revalidate quietly against Supabase in the background;
   - fetch full lesson documents only when a subject is opened/edited.

   Full subject writes remain server-authoritative and revision checked.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasCloudCache) return;

    const Base = window.AtlasCloud;

    if (!Base) {
        console.error('[AtlasCloudCache] AtlasCloud is unavailable.');
        return;
    }

    const LOCAL_OWNER_ID = 'local-tutor';
    const AUTH_STORAGE_KEY = 'sb-jnhjfpagectprceswvqn-auth-token';
    const HUB_CACHE_VERSION = 1;
    const HUB_CACHE_PREFIX = 'atlas::compassHubCache::v1::';
    const WORKING_DRAFT_PREFIX = 'atlas::tutorSubjects::workingDraft::';
    const BUILD_CHECKPOINT_PREFIX = 'atlas::tutorSubjects::buildCheckpoint::';

    const subjectById = new Map();
    let subjectsLoaded = false;
    let subjectListPromise = null;

    const subjectSummaryById = new Map();
    let summariesLoaded = false;
    let summaryListPromise = null;

    let libraryLoaded = false;
    let libraryValue = null;
    let libraryPromise = null;

    let activeUserId = null;
    let scopePromise = null;
    let revalidationPromise = null;
    let hydratedPersistentUserId = null;

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function readJson(storage, key) {
        try {
            const raw = storage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function writeJson(storage, key, value) {
        try {
            storage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }

    function storedSessionUserId() {
        const parsed = readJson(localStorage, AUTH_STORAGE_KEY);
        if (!parsed || typeof parsed !== 'object') return null;

        const candidates = [
            parsed,
            parsed.session,
            parsed.currentSession,
            parsed.data?.session
        ];

        for (const candidate of candidates) {
            const id = String(candidate?.user?.id || '').trim();
            if (id) return id;
        }

        return null;
    }

    function hubCacheKey(userId) {
        const id = String(userId || '').trim();
        return id ? `${HUB_CACHE_PREFIX}${id}` : '';
    }

    function clearSubjectCache() {
        subjectById.clear();
        subjectsLoaded = false;
        subjectListPromise = null;
    }

    function clearSummaryCache() {
        subjectSummaryById.clear();
        summariesLoaded = false;
        summaryListPromise = null;
    }

    function clearLibraryCache() {
        libraryLoaded = false;
        libraryValue = null;
        libraryPromise = null;
    }

    function clearCaches() {
        clearSubjectCache();
        clearSummaryCache();
        clearLibraryCache();
        revalidationPromise = null;
        hydratedPersistentUserId = null;
    }

    function setUserScope(userId) {
        const next = String(userId || '').trim() || null;

        if (next !== activeUserId) {
            clearCaches();
            activeUserId = next;
        }

        return activeUserId;
    }

    function persistentSnapshot() {
        if (!activeUserId) return null;

        return {
            version: HUB_CACHE_VERSION,
            userId: activeUserId,
            cachedAt: Date.now(),
            summaries: cachedSummaryList(),
            library: libraryLoaded ? cloneJson(libraryValue) : null
        };
    }

    function persistHubCache() {
        const snapshot = persistentSnapshot();
        if (!snapshot) return false;

        const key = hubCacheKey(activeUserId);
        if (!key) return false;

        return writeJson(localStorage, key, snapshot);
    }

    function hydratePersistentHubCache(userId) {
        const id = String(userId || '').trim();
        if (!id || hydratedPersistentUserId === id) return false;

        hydratedPersistentUserId = id;
        const cached = readJson(localStorage, hubCacheKey(id));

        if (
            !cached ||
            cached.version !== HUB_CACHE_VERSION ||
            String(cached.userId || '') !== id
        ) {
            return false;
        }

        if (Array.isArray(cached.summaries)) {
            subjectSummaryById.clear();
            cached.summaries.forEach(summary => {
                const subjectId = String(summary?.id || '').trim();
                if (subjectId) {
                    subjectSummaryById.set(subjectId, cloneJson(summary));
                }
            });
            summariesLoaded = true;
        }

        if (
            cached.library &&
            typeof cached.library === 'object' &&
            !Array.isArray(cached.library)
        ) {
            libraryValue = cloneJson(cached.library);
            libraryLoaded = true;
        }

        return summariesLoaded || libraryLoaded;
    }

    function fastStoredUserScope() {
        const userId = storedSessionUserId();
        if (!userId) return null;

        setUserScope(userId);
        hydratePersistentHubCache(userId);
        return userId;
    }

    async function syncUserScope() {
        const fastUserId = fastStoredUserScope();

        if (fastUserId && activeUserId === fastUserId) {
            return fastUserId;
        }

        if (!scopePromise) {
            scopePromise = Promise.resolve()
                .then(() => Base.getSession())
                .then(session => {
                    const userId = setUserScope(session?.user?.id || null);
                    if (userId) hydratePersistentHubCache(userId);
                    return userId;
                })
                .finally(() => {
                    scopePromise = null;
                });
        }

        return scopePromise;
    }

    function storeSubject(subject) {
        const id = String(subject?.id || '').trim();
        if (!id) return null;

        const stored = cloneJson(subject);
        subjectById.set(id, stored);
        return stored;
    }

    function storeSubjectList(subjects) {
        subjectById.clear();
        (Array.isArray(subjects) ? subjects : []).forEach(storeSubject);
        subjectsLoaded = true;
        return Array.from(subjectById.values()).map(cloneJson);
    }

    function cachedSubjectList() {
        return Array.from(subjectById.values()).map(cloneJson);
    }

    function summaryFromMetadata({
        id,
        schemaVersion,
        format,
        metadata,
        revision,
        provenance,
        createdAt,
        updatedAt
    }) {
        const safeMetadata =
            metadata && typeof metadata === 'object' && !Array.isArray(metadata)
                ? cloneJson(metadata)
                : {};
        const title = String(safeMetadata.title || 'Untitled Subject').trim() || 'Untitled Subject';
        const navTitle = String(safeMetadata.navTitle || title).trim() || title;
        const description = String(safeMetadata.description || '').trim();
        const coverImage = String(safeMetadata.coverImage || '').trim();

        return {
            schemaVersion: Math.max(1, Math.floor(Number(schemaVersion) || 1)),
            id: String(id || ''),
            ownerId: LOCAL_OWNER_ID,
            format: format === 'structured' ? 'structured' : String(format || ''),
            metadata: safeMetadata,
            document: {
                module: {
                    title,
                    navTitle,
                    catalogDescription: description,
                    bgImage: coverImage
                }
            },
            revision: Math.max(1, Math.floor(Number(revision) || 1)),
            createdAt: Math.max(0, Number(createdAt) || 0),
            updatedAt: Math.max(0, Number(updatedAt) || 0),
            provenance:
                provenance && typeof provenance === 'object' && !Array.isArray(provenance)
                    ? cloneJson(provenance)
                    : null,
            __atlasSummary: true
        };
    }

    function summaryFromSubject(subject) {
        if (!subject || typeof subject !== 'object') return null;
        return summaryFromMetadata({
            id: subject.id,
            schemaVersion: subject.schemaVersion,
            format: subject.format,
            metadata: subject.metadata,
            revision: subject.revision,
            provenance: subject.provenance,
            createdAt: subject.createdAt,
            updatedAt: subject.updatedAt
        });
    }

    function summaryFromRow(row) {
        if (!row || typeof row !== 'object') return null;
        return summaryFromMetadata({
            id: row.id,
            schemaVersion: row.schema_version,
            format: row.format,
            metadata: row.metadata,
            revision: row.revision,
            provenance: row.provenance,
            createdAt: Date.parse(row.created_at) || 0,
            updatedAt: Date.parse(row.updated_at) || 0
        });
    }

    function storeSummary(subject, { persist = true } = {}) {
        const summary = subject?.__atlasSummary === true
            ? cloneJson(subject)
            : summaryFromSubject(subject);
        const id = String(summary?.id || '').trim();
        if (!id) return null;

        subjectSummaryById.set(id, summary);
        if (persist) persistHubCache();
        return summary;
    }

    function storeSummaryList(subjects, { persist = true } = {}) {
        subjectSummaryById.clear();
        (Array.isArray(subjects) ? subjects : []).forEach(subject => {
            storeSummary(subject, { persist: false });
        });
        summariesLoaded = true;
        if (persist) persistHubCache();
        return cachedSummaryList();
    }

    function cachedSummaryList() {
        return Array.from(subjectSummaryById.values()).map(cloneJson);
    }

    async function fetchFreshSummaries(userId) {
        const client = await Base.getClient();
        const { data, error } = await client
            .from('owned_subjects')
            .select('id,schema_version,format,metadata,revision,provenance,created_at,updated_at')
            .eq('owner_user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return (data || [])
            .map(summaryFromRow)
            .filter(Boolean);
    }

    function revalidateHubInBackground() {
        const userId = activeUserId || fastStoredUserScope();
        if (!userId || revalidationPromise) return revalidationPromise;

        revalidationPromise = Promise.all([
            fetchFreshSummaries(userId),
            Base.getSubjectLibraryState()
        ])
            .then(([summaries, library]) => {
                if (activeUserId !== userId) return false;

                storeSummaryList(summaries, { persist: false });
                storeLibrary(library, { persist: false });
                persistHubCache();

                try {
                    window.dispatchEvent(
                        new CustomEvent('atlas:compass-hub-cache-refreshed', {
                            detail: { userId }
                        })
                    );
                } catch { }

                return true;
            })
            .catch(error => {
                console.warn('[AtlasCloudCache] background hub refresh failed:', error);
                return false;
            })
            .finally(() => {
                revalidationPromise = null;
            });

        return revalidationPromise;
    }

    async function listOwnedSubjects() {
        await syncUserScope();

        if (subjectsLoaded) return cachedSubjectList();

        if (!subjectListPromise) {
            subjectListPromise = Base.listOwnedSubjects()
                .then(subjects => {
                    const stored = storeSubjectList(subjects);
                    if (summariesLoaded) {
                        subjects.forEach(subject => storeSummary(subject, { persist: false }));
                        persistHubCache();
                    }
                    return stored;
                })
                .catch(error => {
                    clearSubjectCache();
                    throw error;
                })
                .finally(() => {
                    subjectListPromise = null;
                });
        }

        return cloneJson(await subjectListPromise);
    }

    async function listOwnedSubjectSummaries() {
        const fastUserId = fastStoredUserScope();

        if (fastUserId && summariesLoaded) {
            void revalidateHubInBackground();
            return cachedSummaryList();
        }

        const userId = await syncUserScope();
        if (!userId) return [];

        if (summariesLoaded) {
            void revalidateHubInBackground();
            return cachedSummaryList();
        }

        if (!summaryListPromise) {
            summaryListPromise = fetchFreshSummaries(userId)
                .then(summaries => storeSummaryList(summaries))
                .catch(error => {
                    clearSummaryCache();
                    throw error;
                })
                .finally(() => {
                    summaryListPromise = null;
                });
        }

        return cloneJson(await summaryListPromise);
    }

    async function getOwnedSubject(subjectId) {
        await syncUserScope();

        const id = String(subjectId || '').trim();
        if (!id) return null;

        if (subjectById.has(id)) {
            return cloneJson(subjectById.get(id));
        }

        if (subjectsLoaded) return null;

        const subject = await Base.getOwnedSubject(id);
        if (subject) {
            storeSubject(subject);
            if (summariesLoaded) storeSummary(subject);
        }
        return cloneJson(subject);
    }

    async function createOwnedSubject(record) {
        await syncUserScope();
        const created = await Base.createOwnedSubject(record);
        if (created) {
            storeSubject(created);
            if (summariesLoaded) storeSummary(created);
        }
        return cloneJson(created);
    }

    async function updateOwnedSubject(record, expectedRevision) {
        await syncUserScope();

        try {
            const updated = await Base.updateOwnedSubject(record, expectedRevision);
            if (updated) {
                storeSubject(updated);
                if (summariesLoaded) storeSummary(updated);
            }
            return cloneJson(updated);
        } catch (error) {
            if (error?.code === 'ATLAS_REVISION_CONFLICT') {
                clearSubjectCache();
                clearSummaryCache();
            }
            throw error;
        }
    }

    async function deleteOwnedSubject(subjectId, expectedRevision = null) {
        await syncUserScope();

        const id = String(subjectId || '').trim();
        if (!id) return false;

        const deleted = await Base.deleteOwnedSubject(id, expectedRevision);

        if (deleted) {
            subjectById.delete(id);
            subjectSummaryById.delete(id);
            persistHubCache();
        } else {
            clearSubjectCache();
            clearSummaryCache();
        }

        return deleted;
    }

    function storeLibrary(value, { persist = true } = {}) {
        libraryLoaded = true;
        libraryValue = cloneJson(value);
        if (persist) persistHubCache();
        return cloneJson(libraryValue);
    }

    async function getSubjectLibraryState() {
        const fastUserId = fastStoredUserScope();

        if (fastUserId && libraryLoaded) {
            void revalidateHubInBackground();
            return cloneJson(libraryValue);
        }

        await syncUserScope();

        if (libraryLoaded) {
            void revalidateHubInBackground();
            return cloneJson(libraryValue);
        }

        if (!libraryPromise) {
            libraryPromise = Base.getSubjectLibraryState()
                .then(value => storeLibrary(value))
                .catch(error => {
                    clearLibraryCache();
                    throw error;
                })
                .finally(() => {
                    libraryPromise = null;
                });
        }

        return cloneJson(await libraryPromise);
    }

    async function createSubjectLibraryState(state, schemaVersion = 1) {
        await syncUserScope();
        const created = await Base.createSubjectLibraryState(state, schemaVersion);
        return storeLibrary(created);
    }

    async function updateSubjectLibraryState(state, expectedRevision, schemaVersion = 1) {
        await syncUserScope();

        try {
            const updated = await Base.updateSubjectLibraryState(
                state,
                expectedRevision,
                schemaVersion
            );
            return storeLibrary(updated);
        } catch (error) {
            if (error?.code === 'ATLAS_REVISION_CONFLICT') {
                clearLibraryCache();
            }
            throw error;
        }
    }

    async function signInWithPassword(email, password) {
        clearCaches();
        activeUserId = null;
        const result = await Base.signInWithPassword(email, password);
        await syncUserScope();
        return result;
    }

    async function signOut() {
        try {
            return await Base.signOut();
        } finally {
            activeUserId = null;
            clearCaches();
        }
    }

    const api = Object.freeze({
        ...Base,
        listOwnedSubjects,
        listOwnedSubjectSummaries,
        getOwnedSubject,
        createOwnedSubject,
        updateOwnedSubject,
        deleteOwnedSubject,
        getSubjectLibraryState,
        createSubjectLibraryState,
        updateSubjectLibraryState,
        signInWithPassword,
        signOut
    });

    window.AtlasCloud = api;

    function hubUsesCloud() {
        return Boolean(fastStoredUserScope());
    }

    function readHubWorkingDraft(subjectId) {
        const id = String(subjectId || '').trim();
        if (!id) return null;

        const encoded = encodeURIComponent(id);
        const stored = readJson(localStorage, `${WORKING_DRAFT_PREFIX}${encoded}`);
        const checkpoint = readJson(localStorage, `${BUILD_CHECKPOINT_PREFIX}${encoded}`);
        const checkpointDraft = checkpoint?.workingDraft || null;

        if (
            checkpointDraft &&
            (!stored || Number(checkpointDraft.updatedAt || 0) > Number(stored.updatedAt || 0))
        ) {
            return cloneJson(checkpointDraft);
        }

        return cloneJson(stored);
    }

    function patchCompassHubSubjects(Subjects) {
        if (
            !Subjects ||
            Subjects.__atlasCompassHubLightweight ||
            Subjects.cloudReadAuthority !== true
        ) {
            return Subjects;
        }

        const fallbackListSubjects = Subjects.listSubjects?.bind(Subjects);
        const fallbackGetLibraryState = Subjects.getLibraryState?.bind(Subjects);
        const fallbackGetSubjectLibraryState = Subjects.getSubjectLibraryState?.bind(Subjects);
        const fallbackGetWorkingDraft = Subjects.getWorkingDraft?.bind(Subjects);

        const projected = {
            ...Subjects,
            async listSubjects() {
                if (!hubUsesCloud()) {
                    return fallbackListSubjects ? fallbackListSubjects() : [];
                }
                return listOwnedSubjectSummaries();
            },
            async getLibraryState() {
                if (!hubUsesCloud()) {
                    return fallbackGetLibraryState ? fallbackGetLibraryState() : null;
                }

                const row = await getSubjectLibraryState();
                const library = row?.state?.library;

                if (
                    library &&
                    typeof library === 'object' &&
                    !Array.isArray(library)
                ) {
                    return cloneJson(library);
                }

                return fallbackGetLibraryState ? fallbackGetLibraryState() : null;
            },
            async getSubjectLibraryState(subjectId) {
                if (!hubUsesCloud()) {
                    return fallbackGetSubjectLibraryState
                        ? fallbackGetSubjectLibraryState(subjectId)
                        : null;
                }

                const library = await projected.getLibraryState();
                return cloneJson(library?.subjects?.[String(subjectId || '').trim()] || null);
            },
            async getWorkingDraft(subjectId) {
                if (!hubUsesCloud()) {
                    return fallbackGetWorkingDraft
                        ? fallbackGetWorkingDraft(subjectId)
                        : null;
                }
                return readHubWorkingDraft(subjectId);
            },
            __atlasCompassHubLightweight: true
        };

        return projected;
    }

    function installCompassHubProjection() {
        const path = window.location.pathname;
        if (path !== '/compass/' && path !== '/compass/index.html') return;

        fastStoredUserScope();

        const existing = window.AtlasTutorSubjects;

        if (existing?.cloudReadAuthority === true) {
            window.AtlasTutorSubjects = patchCompassHubSubjects(existing);
            return;
        }

        let current = existing;

        try {
            Object.defineProperty(window, 'AtlasTutorSubjects', {
                configurable: true,
                enumerable: true,
                get() {
                    return current;
                },
                set(value) {
                    current = patchCompassHubSubjects(value);
                    Object.defineProperty(window, 'AtlasTutorSubjects', {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: current
                    });
                }
            });
        } catch {
            // Existing behavior remains safe if the global cannot be trapped.
        }
    }

    window.AtlasCloudCache = Object.freeze({
        active: true,
        clear: clearCaches,
        stats() {
            return {
                userId: activeUserId,
                persistentHubCache: Boolean(
                    activeUserId &&
                    readJson(localStorage, hubCacheKey(activeUserId))
                ),
                subjectsLoaded,
                subjectCount: subjectById.size,
                summariesLoaded,
                summaryCount: subjectSummaryById.size,
                libraryLoaded,
                revalidating: Boolean(revalidationPromise)
            };
        }
    });

    installCompassHubProjection();

    // Revalidation is intentionally non-blocking. Cached hub state may paint
    // before the Supabase client has even finished loading.
    if (activeUserId && (summariesLoaded || libraryLoaded)) {
        setTimeout(() => {
            void revalidateHubInBackground();
        }, 0);
    }

    Promise.resolve()
        .then(() => Base.getClient())
        .then(client => {
            client?.auth?.onAuthStateChange?.((_event, session) => {
                const userId = setUserScope(session?.user?.id || null);
                if (userId) hydratePersistentHubCache(userId);
            });
        })
        .catch(() => { });
})();
