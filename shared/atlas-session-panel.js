/* ============================================================
   ATLAS SESSION PANEL — LIVE LEARNER CLOUD REFRESH WRAPPER

   Keeps the existing session-panel implementation intact while refreshing
   account-owned learner sessions when a browser/tab becomes active again.
   This closes the stale second-browser gap without making active-session
   selection itself cross-device state.
   ============================================================ */

(function () {
    'use strict';

    const CORE_SRC =
        '/shared/atlas-session-panel-core.js?v=20260915-live-sync1';

    let learnerRefreshPromise = null;
    let lastRefreshAt = 0;

    function refreshLearnersFromCloud() {
        const Authority =
            window.AtlasLearnerSessionsCloudAuthority || null;

        if (
            !Authority ||
            typeof Authority.initialize !== 'function'
        ) {
            return Promise.resolve(null);
        }

        const now = Date.now();

        if (learnerRefreshPromise) {
            return learnerRefreshPromise;
        }

        if (now - lastRefreshAt < 750) {
            return Promise.resolve(null);
        }

        lastRefreshAt = now;

        learnerRefreshPromise = Promise.resolve()
            .then(() => Authority.initialize({ force: true }))
            .then(result => {
                window.AtlasSessionPanel?.refresh?.();

                if (typeof window.renderHome === 'function') {
                    window.renderHome();
                }

                if (typeof window.renderHub === 'function') {
                    void window.renderHub();
                }

                return result;
            })
            .catch(error => {
                console.warn(
                    '[AtlasSessionPanel] Learner cloud refresh failed:',
                    error
                );
                return null;
            })
            .finally(() => {
                learnerRefreshPromise = null;
            });

        return learnerRefreshPromise;
    }

    function refreshWhenVisible() {
        if (!document.hidden) {
            void refreshLearnersFromCloud();
        }
    }

    window.addEventListener('focus', refreshWhenVisible);
    window.addEventListener('pageshow', refreshWhenVisible);
    document.addEventListener(
        'visibilitychange',
        refreshWhenVisible
    );

    function patchOpenWhenReady() {
        const Panel = window.AtlasSessionPanel;

        if (!Panel || Panel.__atlasLearnerLiveRefreshPatched) {
            return false;
        }

        const originalOpen = Panel.open;

        if (typeof originalOpen === 'function') {
            Panel.open = function (...args) {
                void refreshLearnersFromCloud();
                return originalOpen.apply(this, args);
            };
        }

        Panel.__atlasLearnerLiveRefreshPatched = true;
        return true;
    }

    if (!window.AtlasSessionPanel) {
        if (document.readyState === 'loading') {
            document.write(
                '<script src="' + CORE_SRC + '"><\\/script>'
            );
        } else {
            const script = document.createElement('script');
            script.src = CORE_SRC;
            script.async = false;
            script.addEventListener(
                'load',
                patchOpenWhenReady,
                { once: true }
            );
            document.head.appendChild(script);
        }
    }

    window.setTimeout(() => {
        patchOpenWhenReady();
    }, 0);
})();
