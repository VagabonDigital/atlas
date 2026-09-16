/* ============================================================
   ATLAS CONTENT REGISTRY — LIVE CLOUD REFRESH WRAPPER

   Keeps the existing registry runtime intact while ensuring that a
   background Compass cloud-cache refresh actually repaints the visible hub.
   ============================================================ */

(function () {
    'use strict';

    const CORE_SRC =
        '/shared/atlas-content-registry-core.js?v=20260915-live-sync1';

    let renderQueued = false;

    function repaintCompassHub() {
        if (renderQueued) return;

        renderQueued = true;

        window.requestAnimationFrame(() => {
            renderQueued = false;

            if (typeof window.renderHub === 'function') {
                void window.renderHub();
            }
        });
    }

    window.addEventListener(
        'atlas:compass-hub-cache-refreshed',
        repaintCompassHub
    );

    if (window.AtlasContentRegistry) return;

    if (document.readyState === 'loading') {
        document.write(
            '<script src="' + CORE_SRC + '"><\\/script>'
        );
        return;
    }

    const script = document.createElement('script');
    script.src = CORE_SRC;
    script.async = false;
    document.head.appendChild(script);
})();
