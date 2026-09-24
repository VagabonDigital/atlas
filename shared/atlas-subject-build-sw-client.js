/* ============================================================
   ATLAS SUBJECT BUILD SERVICE WORKER CLIENT — EXPERIMENTAL

   Registration only in Batch 1. No build ownership is transferred yet.
   ============================================================ */

(function () {
    'use strict';

    if (
        window.AtlasSubjectBuildServiceWorker
    ) {
        return;
    }

    let registrationPromise = null;

    async function ensureRegistration() {
        if (
            !('serviceWorker' in navigator)
        ) {
            return null;
        }

        if (!registrationPromise) {
            registrationPromise =
                navigator.serviceWorker
                    .register(
                        '/atlas-subject-build-sw.js',
                        {
                            scope: '/'
                        }
                    )
                    .then(() =>
                        navigator.serviceWorker.ready
                    )
                    .catch(error => {
                        console.warn(
                            '[AtlasSubjectBuildServiceWorker] registration failed:',
                            error
                        );
                        return null;
                    });
        }

        return registrationPromise;
    }

    window.AtlasSubjectBuildServiceWorker =
        Object.freeze({
            supported:
                'serviceWorker' in navigator,
            ensureRegistration
        });

    void ensureRegistration();
})();
