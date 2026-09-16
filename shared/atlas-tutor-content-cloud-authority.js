/* ============================================================
   ATLAS TUTOR CONTENT — CLOUD AUTHORITY LOADER

   Keeps the proven cloud authority implementation stable while layering
   cross-browser My Version projection on top.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasTutorContentCloudAuthority) return;

    const current =
        document.currentScript?.src ||
        '/shared/atlas-tutor-content-cloud-authority.js';

    const coreSrc = new URL(
        './atlas-tutor-content-cloud-authority-core.js?v=20260916-myversion2',
        current
    ).href;

    const syncSrc = new URL(
        './atlas-tutor-content-cloud-sync.js?v=20260916-myversion2',
        current
    ).href;

    function load(src, marker) {
        return new Promise((resolve, reject) => {
            const existing = marker
                ? document.querySelector(`script[${marker}]`)
                : null;

            if (existing) {
                if (existing.dataset.atlasLoaded === 'true') {
                    resolve();
                    return;
                }

                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', reject, { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = false;
            if (marker) script.setAttribute(marker, 'true');
            script.addEventListener('load', () => {
                script.dataset.atlasLoaded = 'true';
                resolve();
            }, { once: true });
            script.addEventListener('error', reject, { once: true });
            document.head.appendChild(script);
        });
    }

    if (document.readyState === 'loading') {
        document.write(
            `<script data-atlas-tutor-content-cloud-core="true" src="${coreSrc}"><\/script>` +
            `<script data-atlas-tutor-content-cloud-sync="true" src="${syncSrc}"><\/script>`
        );
        return;
    }

    load(coreSrc, 'data-atlas-tutor-content-cloud-core')
        .then(() =>
            load(syncSrc, 'data-atlas-tutor-content-cloud-sync')
        )
        .catch(error => {
            console.error(
                '[AtlasTutorContentCloudAuthorityLoader] bootstrap failed:',
                error
            );
        });
})();
