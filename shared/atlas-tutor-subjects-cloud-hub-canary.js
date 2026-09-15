/* ============================================================
   ATLAS TUTOR SUBJECTS — CLOUD HUB READ CANARY

   Read-only Stage 1 canary for the real Compass Hub.
   When an Atlas account is authenticated, committed My Subjects and their
   library organisation are reconstructed from Supabase. All mutations remain
   on the existing local implementation and are not exercised by this canary.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasTutorSubjectsCloudHubCanary) return;

    const Local = window.AtlasTutorSubjects;

    if (!Local) {
        console.error(
            '[AtlasTutorSubjectsCloudHubCanary] AtlasTutorSubjects is unavailable.'
        );
        return;
    }

    const original = {
        getSubject: typeof Local.getSubject === 'function'
            ? Local.getSubject.bind(Local)
            : null,
        listSubjects: typeof Local.listSubjects === 'function'
            ? Local.listSubjects.bind(Local)
            : null,
        getLibraryState: typeof Local.getLibraryState === 'function'
            ? Local.getLibraryState.bind(Local)
            : null,
        getSubjectLibraryState:
            typeof Local.getSubjectLibraryState === 'function'
                ? Local.getSubjectLibraryState.bind(Local)
                : null
    };

    let snapshotPromise = null;

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    async function getAccountState() {
        if (!window.AtlasAccount || !window.AtlasCloud) {
            return {
                ready: true,
                authenticated: false,
                userId: null,
                email: null
            };
        }

        await AtlasAccount.initialize();
        return AtlasAccount.getState();
    }

    async function loadCloudSnapshot() {
        const [subjects, libraryRow] = await Promise.all([
            AtlasCloud.listOwnedSubjects(),
            AtlasCloud.getSubjectLibraryState()
        ]);

        const state = libraryRow?.state;
        const library = state?.library;
        const order = state?.order;

        if (
            !library ||
            typeof library !== 'object' ||
            Array.isArray(library) ||
            !Array.isArray(order)
        ) {
            const error = new Error(
                'Atlas cloud library state is missing or invalid for this account.'
            );
            error.code = 'ATLAS_CLOUD_LIBRARY_INVALID';
            throw error;
        }

        const byId = new Map(
            (Array.isArray(subjects) ? subjects : [])
                .map(subject => [subject.id, subject])
        );

        const ordered = [];
        const seen = new Set();

        order.forEach(id => {
            const subject = byId.get(id);
            if (!subject || seen.has(id)) return;
            seen.add(id);
            ordered.push(subject);
        });

        (Array.isArray(subjects) ? subjects : [])
            .filter(subject => !seen.has(subject.id))
            .sort(
                (left, right) =>
                    Number(right.updatedAt || 0) -
                    Number(left.updatedAt || 0)
            )
            .forEach(subject => ordered.push(subject));

        return {
            subjects: cloneJson(ordered),
            library: cloneJson(library),
            revision: libraryRow.revision
        };
    }

    async function getCloudSnapshot() {
        if (!snapshotPromise) {
            snapshotPromise = loadCloudSnapshot().catch(error => {
                snapshotPromise = null;
                throw error;
            });
        }

        return snapshotPromise;
    }

    async function useCloud() {
        const account = await getAccountState();
        return account.authenticated;
    }

    async function getSubject(subjectId) {
        const id = String(subjectId || '').trim();
        if (!id) return null;

        if (!(await useCloud())) {
            return original.getSubject
                ? original.getSubject(id)
                : null;
        }

        return AtlasCloud.getOwnedSubject(id);
    }

    async function listSubjects() {
        if (!(await useCloud())) {
            return original.listSubjects
                ? original.listSubjects()
                : [];
        }

        const snapshot = await getCloudSnapshot();
        return cloneJson(snapshot.subjects);
    }

    async function getLibraryState() {
        if (!(await useCloud())) {
            return original.getLibraryState
                ? original.getLibraryState()
                : null;
        }

        const snapshot = await getCloudSnapshot();
        return cloneJson(snapshot.library);
    }

    async function getSubjectLibraryState(subjectId) {
        const id = String(subjectId || '').trim();
        if (!id) return null;

        if (!(await useCloud())) {
            return original.getSubjectLibraryState
                ? original.getSubjectLibraryState(id)
                : null;
        }

        const snapshot = await getCloudSnapshot();
        return cloneJson(snapshot.library?.subjects?.[id] || null);
    }

    window.AtlasTutorSubjects = {
        ...Local,
        getSubject,
        listSubjects,
        getLibraryState,
        getSubjectLibraryState,
        cloudReadAuthority: true,
        cloudHubCanary: true
    };

    window.AtlasTutorSubjectsCloudHubCanary = Object.freeze({
        active: true,
        refresh() {
            snapshotPromise = null;
        }
    });
})();
