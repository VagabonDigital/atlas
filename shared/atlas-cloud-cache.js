/* ============================================================
   ATLAS CLOUD CACHE
   Page-scoped read-through cache for authenticated subject data.

   Goals:
   - remove repeat Supabase reads during ordinary Compass actions;
   - preserve AtlasCloud as the only network/vendor boundary;
   - keep writes server-authoritative with existing revision checks;
   - never share cached account data across auth changes.

   This cache is deliberately memory-only. Reloading the page always
   re-establishes truth from Supabase.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasCloudCache) return;

    const Base = window.AtlasCloud;

    if (!Base) {
        console.error('[AtlasCloudCache] AtlasCloud is unavailable.');
        return;
    }

    const subjectById = new Map();
    let subjectsLoaded = false;
    let subjectListPromise = null;

    let libraryLoaded = false;
    let libraryValue = null;
    let libraryPromise = null;

    let activeUserId = null;
    let scopePromise = null;

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function clearSubjectCache() {
        subjectById.clear();
        subjectsLoaded = false;
        subjectListPromise = null;
    }

    function clearLibraryCache() {
        libraryLoaded = false;
        libraryValue = null;
        libraryPromise = null;
    }

    function clearCaches() {
        clearSubjectCache();
        clearLibraryCache();
    }

    function setUserScope(userId) {
        const next = String(userId || '').trim() || null;

        if (next !== activeUserId) {
            clearCaches();
            activeUserId = next;
        }

        return activeUserId;
    }

    async function syncUserScope() {
        if (!scopePromise) {
            scopePromise = Promise.resolve()
                .then(() => Base.getSession())
                .then(session => setUserScope(session?.user?.id || null))
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

        (Array.isArray(subjects) ? subjects : [])
            .forEach(storeSubject);

        subjectsLoaded = true;

        return Array.from(subjectById.values())
            .map(cloneJson);
    }

    function cachedSubjectList() {
        return Array.from(subjectById.values())
            .map(cloneJson);
    }

    async function listOwnedSubjects() {
        await syncUserScope();

        if (subjectsLoaded) {
            return cachedSubjectList();
        }

        if (!subjectListPromise) {
            subjectListPromise = Base.listOwnedSubjects()
                .then(storeSubjectList)
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

    async function getOwnedSubject(subjectId) {
        await syncUserScope();

        const id = String(subjectId || '').trim();
        if (!id) return null;

        if (subjectById.has(id)) {
            return cloneJson(subjectById.get(id));
        }

        if (subjectsLoaded) {
            return null;
        }

        const subject = await Base.getOwnedSubject(id);
        if (subject) storeSubject(subject);
        return cloneJson(subject);
    }

    async function createOwnedSubject(record) {
        await syncUserScope();

        const created = await Base.createOwnedSubject(record);
        if (created) storeSubject(created);
        return cloneJson(created);
    }

    async function updateOwnedSubject(record, expectedRevision) {
        await syncUserScope();

        try {
            const updated = await Base.updateOwnedSubject(
                record,
                expectedRevision
            );

            if (updated) storeSubject(updated);
            return cloneJson(updated);
        } catch (error) {
            if (error?.code === 'ATLAS_REVISION_CONFLICT') {
                clearSubjectCache();
            }
            throw error;
        }
    }

    async function deleteOwnedSubject(subjectId, expectedRevision = null) {
        await syncUserScope();

        const id = String(subjectId || '').trim();
        if (!id) return false;

        const deleted = await Base.deleteOwnedSubject(
            id,
            expectedRevision
        );

        if (deleted) {
            subjectById.delete(id);
        } else {
            clearSubjectCache();
        }

        return deleted;
    }

    function storeLibrary(value) {
        libraryLoaded = true;
        libraryValue = cloneJson(value);
        return cloneJson(libraryValue);
    }

    async function getSubjectLibraryState() {
        await syncUserScope();

        if (libraryLoaded) {
            return cloneJson(libraryValue);
        }

        if (!libraryPromise) {
            libraryPromise = Base.getSubjectLibraryState()
                .then(storeLibrary)
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

        const created = await Base.createSubjectLibraryState(
            state,
            schemaVersion
        );

        return storeLibrary(created);
    }

    async function updateSubjectLibraryState(
        state,
        expectedRevision,
        schemaVersion = 1
    ) {
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

    window.AtlasCloudCache = Object.freeze({
        active: true,
        clear: clearCaches,
        stats() {
            return {
                userId: activeUserId,
                subjectsLoaded,
                subjectCount: subjectById.size,
                libraryLoaded
            };
        }
    });

    // Keep cache ownership aligned even if auth changes outside AtlasAccount.
    Promise.resolve()
        .then(() => Base.getClient())
        .then(client => {
            client?.auth?.onAuthStateChange?.((_event, session) => {
                setUserScope(session?.user?.id || null);
            });
        })
        .catch(() => { });
})();
