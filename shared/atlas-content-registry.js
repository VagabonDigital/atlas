/* ============================================================
   ATLAS CONTENT REGISTRY — LIVE CLOUD REFRESH WRAPPER

   Keeps the existing registry runtime intact while ensuring that a
   background Compass cloud-cache refresh actually repaints the visible hub.
   ============================================================ */

(function () {
    'use strict';

    const CORE_SRC =
        '/shared/atlas-content-registry-core.js?v=20260915-live-sync1';

    function requestCompassHubRefresh() {
        try {
            window.dispatchEvent(
                new CustomEvent(
                    'atlas:compass-hub-refresh-request',
                    { detail: { source: 'cloud-cache' } }
                )
            );
        } catch { }
    }

    window.addEventListener(
        'atlas:compass-hub-cache-refreshed',
        requestCompassHubRefresh
    );

    if (window.AtlasContentRegistry) return;

    if (document.readyState === 'loading') {
        document.write(
            '<script src="' + CORE_SRC + '"><\/script>'
        );
        return;
    }

    const script = document.createElement('script');
    script.src = CORE_SRC;
    script.async = false;
    document.head.appendChild(script);
})();
