/* ============================================================
   ATLAS TUTOR SUBJECTS — CLOUD READ AUTHORITY

   Stage 1 cutover canary for the real My Subject runtime.
   When an Atlas account is authenticated, committed My Subject reads come
   from Supabase. Signed-out behavior remains on the existing local boundary.

   This file deliberately overrides reads only. Cloud writes are enabled only
   after fresh-browser restore has been proven in the real Compass runtime.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasTutorSubjectsCloudRead) return;

    const Local = window.AtlasTutorSubjects;

    if (!Local) {
        console.error(
            '[AtlasTutorSubjectsCloudRead] AtlasTutorSubjects is unavailable.'
        );
        return;
    }

    const originalGetSubject =
        typeof Local.getSubject === 'function'
            ? Local.getSubject.bind(Local)
            : null;

    if (!originalGetSubject) {
        console.error(
            '[AtlasTutorSubjectsCloudRead] getSubject() is unavailable.'
        );
        return;
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

    async function getSubject(subjectId) {
        const id = String(subjectId || '').trim();
        if (!id) return null;

        const account = await getAccountState();

        if (!account.authenticated) {
            return originalGetSubject(id);
        }

        if (typeof Local.getPendingDelete === 'function') {
            const pending = await Local.getPendingDelete(id);
            if (pending) return null;
        }

        return AtlasCloud.getOwnedSubject(id);
    }

    window.AtlasTutorSubjects = {
        ...Local,
        getSubject,
        cloudReadAuthority: true
    };

    window.AtlasTutorSubjectsCloudRead = Object.freeze({
        active: true
    });
})();
