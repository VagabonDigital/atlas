// ============================================================
// ATLAS ORIGINAL RESTORE WORKER
// Lightweight bridge for restoring a saved My Version to the canonical
// Atlas Original. Runs after subject-data.js inside the hidden action frame.
// Persistence is executed through the parent Compass Hub context.
// ============================================================

(function () {
    'use strict';

    function getHostWindow() {
        try {
            if (window.parent && window.parent !== window) {
                void window.parent.location.href;
                return window.parent;
            }
        } catch { }

        return window;
    }

    function postResult(requestId, ok, message = '') {
        window.parent.postMessage(
            {
                type: 'atlas:hub-subject-action-complete',
                requestId,
                action: 'restore-version',
                ok,
                ...(message ? { message } : {})
            },
            window.location.origin
        );
    }

    async function run() {
        let url;

        try {
            url = new URL(window.location.href);
        } catch {
            return;
        }

        const action = String(
            url.searchParams.get('atlasHubAction') || ''
        ).trim();

        const requestId = String(
            url.searchParams.get('atlasHubRequest') || ''
        ).trim();

        if (action !== 'restore-version' || !requestId) {
            return;
        }

        try {
            const Host = getHostWindow();
            const Content = Host.AtlasTutorContent;

            if (
                !Content ||
                typeof Content.getVersion !== 'function' ||
                typeof Content.deleteVersion !== 'function' ||
                typeof Content.clearWorkingDraft !== 'function'
            ) {
                throw new Error(
                    'Atlas Tutor Content persistence is unavailable.'
                );
            }

            if (
                typeof MODULE !== 'object' ||
                !String(MODULE.id || '').trim()
            ) {
                throw new Error(
                    'Atlas source identity is unavailable.'
                );
            }

            const sourceContentId =
                `compass:${String(MODULE.id).trim()}`;

            const version = await Content.getVersion(
                sourceContentId
            );

            if (!version) {
                throw new Error(
                    'There is no canonical My Version to restore.'
                );
            }

            const [versionDeleted] = await Promise.all([
                Content.deleteVersion(sourceContentId),
                Content.clearWorkingDraft(sourceContentId)
            ]);

            if (!versionDeleted) {
                throw new Error(
                    'Atlas Original restore persistence failed.'
                );
            }

            postResult(requestId, true);
        } catch (error) {
            console.error(
                '[Compass] Fast Atlas restore action failed:',
                error
            );

            postResult(
                requestId,
                false,
                'Couldn’t restore the Atlas Original.'
            );
        }
    }

    run();
})();
