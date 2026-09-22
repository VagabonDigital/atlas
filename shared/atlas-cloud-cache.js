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
    const HUB_CACHE_VERSION = 3;
    const HUB_CACHE_KIND = 'compass-hub-presentation';
    const HUB_CACHE_PREFIX = 'atlas::compassHubCache::v1::';
    const WORKING_DRAFT_PREFIX = 'atlas::tutorSubjects::workingDraft::';
    const BUILD_CHECKPOINT_PREFIX = 'atlas::tutorSubjects::buildCheckpoint::';

    const SUBJECT_BROWSER_STATE_DB_NAME =
        'atlas-tutor-subjects';
    const SUBJECT_BROWSER_STATE_DB_VERSION = 1;
    const SUBJECT_BROWSER_STATE_STORE =
        'browser-state';

    let subjectBrowserStateDbPromise = null;

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
    let hubMutationRevision = 0;

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function orderSubjectSummaries(
        summaries,
        library = null
    ) {
        const list =
            Array.isArray(summaries)
                ? summaries.filter(Boolean)
                : [];

        const state =
            library?.state &&
            typeof library.state === 'object' &&
            !Array.isArray(library.state)
                ? library.state
                : library;

        const order =
            Array.isArray(state?.order)
                ? state.order
                    .map(id =>
                        String(id || '').trim()
                    )
                    .filter(Boolean)
                : [];

        if (!order.length || list.length < 2) {
            return list.map(cloneJson);
        }

        const byId = new Map(
            list
                .map(subject => [
                    String(
                        subject?.id || ''
                    ).trim(),
                    subject
                ])
                .filter(([id]) => id)
        );

        const seen = new Set();
        const ordered = [];

        order.forEach(id => {
            const subject = byId.get(id);

            if (!subject || seen.has(id)) {
                return;
            }

            seen.add(id);
            ordered.push(subject);
        });

        const unlisted = list
            .filter(subject => {
                const id = String(
                    subject?.id || ''
                ).trim();

                return (
                    id &&
                    !seen.has(id)
                );
            })
            .sort(
                (left, right) =>
                    Number(
                        right?.updatedAt || 0
                    ) -
                    Number(
                        left?.updatedAt || 0
                    )
            );

        return [
            ...unlisted,
            ...ordered
        ].map(cloneJson);
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
        hubMutationRevision += 1;
    }

    function markHubMutation() {
        hubMutationRevision += 1;
        return hubMutationRevision;
    }

    function removePersistentHubCache(
        userId = activeUserId
    ) {
        const key =
            hubCacheKey(userId);

        if (!key) return false;

        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }

    function setUserScope(userId) {
        const next = String(userId || '').trim() || null;

        if (next !== activeUserId) {
            clearCaches();
            activeUserId = next;
        }

        return activeUserId;
    }

    function normalizePersistentSnapshot(
        value,
        expectedUserId = activeUserId
    ) {
        const userId = String(
            expectedUserId || ''
        ).trim();

        if (
            !userId ||
            !value ||
            typeof value !== 'object' ||
            Array.isArray(value) ||
            value.version !== HUB_CACHE_VERSION ||
            value.kind !== HUB_CACHE_KIND ||
            value.ready !== true ||
            String(value.userId || '').trim() !== userId ||
            !Array.isArray(value.summaries) ||
            !Object.prototype.hasOwnProperty.call(
                value,
                'library'
            ) ||
            (
                value.library !== null &&
                (
                    typeof value.library !== 'object' ||
                    Array.isArray(value.library)
                )
            )
        ) {
            return null;
        }

        return {
            version: HUB_CACHE_VERSION,
            kind: HUB_CACHE_KIND,
            ready: true,
            userId,
            cachedAt: Math.max(
                0,
                Number(value.cachedAt) || 0
            ),
            summaries:
                orderSubjectSummaries(
                    value.summaries,
                    value.library
                ),
            library: cloneJson(value.library)
        };
    }

    function persistentSnapshot() {
        if (
            !activeUserId ||
            !summariesLoaded ||
            !libraryLoaded
        ) {
            return null;
        }

        return {
            version: HUB_CACHE_VERSION,
            kind: HUB_CACHE_KIND,
            ready: true,
            userId: activeUserId,
            cachedAt: Date.now(),
            summaries: cachedSummaryList(),
            library: cloneJson(libraryValue)
        };
    }

    function persistHubCache() {
        const snapshot = persistentSnapshot();
        if (!snapshot) return false;

        const key = hubCacheKey(activeUserId);
        if (!key) return false;

        const written =
            writeJson(
                localStorage,
                key,
                snapshot
            );

        if (!written) {
            /*
             * A stale first-paint snapshot is worse than no snapshot.
             * If browser storage cannot accept the authoritative mutation,
             * remove the previous cache so Compass falls back to fresh data.
             */
            removePersistentHubCache(
                activeUserId
            );
        }

        return written;
    }

    function hydratePersistentHubCache(userId) {
        const id = String(userId || '').trim();
        if (!id || hydratedPersistentUserId === id) return false;

        hydratedPersistentUserId = id;

        const key =
            hubCacheKey(id);

        const raw =
            readJson(
                localStorage,
                key
            );

        const cached =
            normalizePersistentSnapshot(
                raw,
                id
            );

        if (!cached) {
            if (raw) {
                removePersistentHubCache(id);
            }

            return false;
        }

        subjectSummaryById.clear();
        cached.summaries.forEach(summary => {
            const subjectId = String(
                summary?.id || ''
            ).trim();

            if (subjectId) {
                subjectSummaryById.set(
                    subjectId,
                    cloneJson(summary)
                );
            }
        });

        summariesLoaded = true;
        libraryValue = cloneJson(cached.library);
        libraryLoaded = true;

        return true;
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
                ? cloneJson(metadata) || {}
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
        return orderSubjectSummaries(
            Array.from(
                subjectSummaryById.values()
            ),
            libraryValue
        );
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

        const mutationRevisionAtStart =
            hubMutationRevision;

        revalidationPromise = Promise.all([
            fetchFreshSummaries(userId),
            Base.getSubjectLibraryState()
        ])
            .then(([summaries, library]) => {
                if (
                    activeUserId !== userId ||
                    hubMutationRevision !==
                        mutationRevisionAtStart
                ) {
                    return false;
                }

                const previousSummaries = JSON.stringify(
                    cachedSummaryList()
                );
                const previousLibrary = JSON.stringify(
                    libraryLoaded ? libraryValue : null
                );
                const nextSummaries = JSON.stringify(
                    Array.isArray(summaries) ? summaries : []
                );
                const nextLibrary = JSON.stringify(
                    library ?? null
                );
                const changed =
                    previousSummaries !== nextSummaries ||
                    previousLibrary !== nextLibrary;

                storeSummaryList(summaries, { persist: false });
                storeLibrary(library, { persist: false });
                persistHubCache();

                if (changed) {
                    try {
                        window.dispatchEvent(
                            new CustomEvent('atlas:compass-hub-cache-refreshed', {
                                detail: { userId }
                            })
                        );
                    } catch { }
                }

                return changed;
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
            markHubMutation();
            storeSubject(created);
            if (summariesLoaded) {
                storeSummary(created);
            }
        }
        return cloneJson(created);
    }

    async function updateOwnedSubject(record, expectedRevision) {
        await syncUserScope();

        try {
            const updated = await Base.updateOwnedSubject(record, expectedRevision);
            if (updated) {
                markHubMutation();
                storeSubject(updated);
                if (summariesLoaded) {
                    storeSummary(updated);
                }
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
            markHubMutation();
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

        if (created) {
            markHubMutation();
        }

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

            if (updated) {
                markHubMutation();
            }

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

    function openSubjectBrowserStateDb() {
        if (subjectBrowserStateDbPromise) {
            return subjectBrowserStateDbPromise;
        }

        if (!window.indexedDB) {
            return Promise.resolve(null);
        }

        subjectBrowserStateDbPromise =
            new Promise((resolve, reject) => {
                let request = null;

                try {
                    request =
                        window.indexedDB.open(
                            SUBJECT_BROWSER_STATE_DB_NAME,
                            SUBJECT_BROWSER_STATE_DB_VERSION
                        );
                } catch (error) {
                    reject(error);
                    return;
                }

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    reject(
                        request.error ||
                        new Error(
                            'Atlas subject browser state could not open.'
                        )
                    );
                };

                request.onblocked = () => {
                    reject(
                        new Error(
                            'Atlas subject browser state is blocked.'
                        )
                    );
                };
            })
            .catch(() => {
                subjectBrowserStateDbPromise = null;
                return null;
            });

        return subjectBrowserStateDbPromise;
    }

    async function readSubjectBrowserState(
        kind,
        subjectId
    ) {
        const db =
            await openSubjectBrowserStateDb();

        if (
            !db ||
            !db.objectStoreNames.contains(
                SUBJECT_BROWSER_STATE_STORE
            )
        ) {
            return null;
        }

        return new Promise(resolve => {
            const transaction =
                db.transaction(
                    SUBJECT_BROWSER_STATE_STORE,
                    'readonly'
                );

            const request =
                transaction
                    .objectStore(
                        SUBJECT_BROWSER_STATE_STORE
                    )
                    .get(
                        [
                            String(kind || '').trim(),
                            String(subjectId || '').trim()
                        ].join('::')
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
                resolve(null);
            };
        });
    }

    async function readHubWorkingDraft(subjectId) {
        const id = String(subjectId || '').trim();
        if (!id) return null;

        const [
            indexedDraft,
            indexedCheckpoint
        ] = await Promise.all([
            readSubjectBrowserState(
                'working-draft',
                id
            ),
            readSubjectBrowserState(
                'build-checkpoint',
                id
            )
        ]);

        const indexedCheckpointDraft =
            indexedCheckpoint
                ?.workingDraft ||
            null;

        if (
            indexedCheckpointDraft &&
            (
                !indexedDraft ||
                Number(
                    indexedCheckpointDraft
                        .updatedAt || 0
                ) >
                Number(
                    indexedDraft
                        .updatedAt || 0
                )
            )
        ) {
            return cloneJson(
                indexedCheckpointDraft
            );
        }

        if (indexedDraft) {
            return cloneJson(
                indexedDraft
            );
        }

        /*
         * Legacy fallback only. The signed-in subject authority migrates
         * these records to IndexedDB and removes them from localStorage.
         */
        const encoded =
            encodeURIComponent(id);

        const stored =
            readJson(
                localStorage,
                `${WORKING_DRAFT_PREFIX}${encoded}`
            );

        const checkpoint =
            readJson(
                localStorage,
                `${BUILD_CHECKPOINT_PREFIX}${encoded}`
            );

        const checkpointDraft =
            checkpoint?.workingDraft ||
            null;

        if (
            checkpointDraft &&
            (
                !stored ||
                Number(
                    checkpointDraft
                        .updatedAt || 0
                ) >
                Number(
                    stored
                        .updatedAt || 0
                )
            )
        ) {
            return cloneJson(
                checkpointDraft
            );
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
        const fallbackListPendingDeletes = Subjects.listPendingDeletes?.bind(Subjects);
        const fallbackGetLibraryState = Subjects.getLibraryState?.bind(Subjects);
        const fallbackGetSubjectLibraryState = Subjects.getSubjectLibraryState?.bind(Subjects);
        const fallbackGetWorkingDraft = Subjects.getWorkingDraft?.bind(Subjects);

        const projected = {
            ...Subjects,
            async listSubjects() {
                if (!hubUsesCloud()) {
                    return fallbackListSubjects ? fallbackListSubjects() : [];
                }

                const [
                    summaries,
                    pendingDeletes,
                    libraryRow
                ] = await Promise.all([
                    listOwnedSubjectSummaries(),
                    fallbackListPendingDeletes
                        ? fallbackListPendingDeletes()
                        : [],
                    getSubjectLibraryState()
                ]);

                const pendingIds = new Set(
                    (Array.isArray(pendingDeletes) ? pendingDeletes : [])
                        .map(record => String(record?.subjectId || '').trim())
                        .filter(Boolean)
                );

                return orderSubjectSummaries(
                    summaries,
                    libraryRow
                ).filter(subject =>
                    !pendingIds.has(String(subject?.id || '').trim())
                );
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

    function getCompassPresentationSnapshot() {
        const userId =
            activeUserId ||
            fastStoredUserScope();

        if (!userId) return null;

        const memorySnapshot = persistentSnapshot();

        if (memorySnapshot) {
            return cloneJson(memorySnapshot);
        }

        return normalizePersistentSnapshot(
            readJson(localStorage, hubCacheKey(userId)),
            userId
        );
    }

    async function prepareCompassPresentation() {
        const userId = await syncUserScope();

        if (!userId) return null;

        await revalidateHubInBackground();

        if (activeUserId !== userId) {
            return null;
        }

        return getCompassPresentationSnapshot();
    }

    window.AtlasCloudCache = Object.freeze({
        active: true,
        clear: clearCaches,
        getCompassPresentationSnapshot,
        prepareCompassPresentation,
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
