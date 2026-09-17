/* ============================================================
   ATLAS RETURN HANDOFF
   Account-surface bridge for cross-page authentication return.

   The URL may carry only an opaque return-intent ID (`ri`). The destination
   always comes from a validated AtlasReturnIntent record in browser storage.

   Owns:
   - resolving /account/?ri=<opaque-id>
   - removing invalid/stale return references from the account URL
   - queue-once destination handoff after authentication is established

   Does NOT own:
   - protected-action interception
   - same-page account-gate resume
   - arbitrary redirect URLs
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasReturnHandoff) return;

    const PARAM = 'ri';
    let initialized = false;
    let pendingId = null;
    let navigating = false;

    function accountUrlWithoutIntent() {
        const url = new URL(window.location.href);
        url.searchParams.delete(PARAM);
        return url.pathname + url.search + url.hash;
    }

    function scrubIntentParameter() {
        try {
            window.history.replaceState(
                null,
                document.title,
                accountUrlWithoutIntent()
            );
        } catch {
            // Failure to cosmetically scrub the account URL is non-fatal.
        }
    }

    function initialize() {
        if (initialized) return getPendingIntent();
        initialized = true;

        const ReturnIntent = window.AtlasReturnIntent;
        if (!ReturnIntent) {
            throw new Error('AtlasReturnHandoff requires AtlasReturnIntent.');
        }

        let id = '';

        try {
            id = String(
                new URL(window.location.href).searchParams.get(PARAM) || ''
            ).trim();
        } catch {
            id = '';
        }

        if (!id) return null;

        if (!ReturnIntent.isValidId(id)) {
            scrubIntentParameter();
            return null;
        }

        const intent = ReturnIntent.get(id);

        if (!intent) {
            scrubIntentParameter();
            return null;
        }

        pendingId = intent.id;
        return intent;
    }

    function getPendingId() {
        if (!initialized) initialize();
        return pendingId;
    }

    function getPendingIntent() {
        if (!pendingId) return null;
        return window.AtlasReturnIntent?.get?.(pendingId) || null;
    }

    function resumeIfAuthenticated(accountState) {
        if (!initialized) initialize();

        if (
            navigating ||
            !pendingId ||
            !accountState?.ready ||
            !accountState?.authenticated ||
            accountState?.recovery
        ) {
            return null;
        }

        const id = pendingId;
        const intent = window.AtlasReturnIntent.get(id);

        if (!intent) {
            pendingId = null;
            scrubIntentParameter();
            return null;
        }

        const queued =
            window.AtlasReturnIntent.queueResume?.(id);

        if (!queued) {
            return null;
        }

        pendingId = null;
        scrubIntentParameter();
        navigating = true;
        window.location.replace(intent.destination);
        return intent;
    }

    window.AtlasReturnHandoff = Object.freeze({
        initialize,
        getPendingId,
        getPendingIntent,
        resumeIfAuthenticated
    });
})();
