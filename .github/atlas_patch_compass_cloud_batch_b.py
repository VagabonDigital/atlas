from pathlib import Path

compass_path = Path('compass/index.html')
registry_path = Path('shared/atlas-content-registry.js')

compass = compass_path.read_text(encoding='utf-8')
registry = registry_path.read_text(encoding='utf-8')

old_release = '''      function release() {
        if (released) return;
        released = true;
        window.clearTimeout(safetyTimer);
        window.requestAnimationFrame(function () {
          root.classList.remove('atlas-session-fonts-pending');
        });
      }'''

new_release = '''      function release() {
        if (released) return;
        released = true;
        window.clearTimeout(safetyTimer);
        root.classList.remove('atlas-session-fonts-pending');
        root.dataset.atlasCompassFirstPaintReady = 'true';

        try {
          window.dispatchEvent(
            new Event('atlas:compass-first-paint-ready')
          );
        } catch (e) { }
      }'''

old_registry_src = '''  <script src="../shared/atlas-content-registry.js?v=20260916-accountchrome5"></script>'''
new_registry_src = '''  <script src="../shared/atlas-content-registry.js?v=20260916-compassperf1"></script>'''

for old, new, label in [
    (old_release, new_release, 'Compass first-paint release'),
    (old_registry_src, new_registry_src, 'Compass content-registry cache key'),
]:
    count = compass.count(old)
    if count != 1:
        raise SystemExit(f'Expected exactly one {label}, found {count}')
    compass = compass.replace(old, new, 1)

old_cloud = '''    function writeCloudAuthorityScripts() {
        if (
            !window.location.pathname.startsWith('/compass/') ||
            !hasStoredAtlasAccountSession()
        ) {
            return;
        }

        ensurePreconnect('https://jnhjfpagectprceswvqn.supabase.co');
        ensurePreconnect('https://cdn.jsdelivr.net');

        const needsSubjects = Boolean(
            window.AtlasTutorSubjects &&
            !window.AtlasTutorSubjectsCloudAuthority
        );

        const needsTutorContent = Boolean(
            window.AtlasTutorContent &&
            !window.AtlasTutorContentCloudAuthority
        );

        if (!needsSubjects && !needsTutorContent) {
            return;
        }

        const scripts = [];

        if (!window.AtlasCloud) {
            scripts.push(
                '<script src="/shared/atlas-cloud.js?v=20260916-runtime3"><\\/script>'
            );
        }

        if (!window.AtlasAccount) {
            scripts.push(
                '<script src="/shared/atlas-account.js?v=20260916-stage1close1"><\\/script>'
            );
        }

        if (needsSubjects && !window.AtlasCloudCache) {
            scripts.push(
                '<script src="/shared/atlas-cloud-cache.js?v=20260916-runtime3"><\\/script>'
            );
        }

        if (needsSubjects) {
            scripts.push(
                '<script src="/shared/atlas-tutor-subjects-cloud-authority.js?v=20260916-runtime3"><\\/script>'
            );
        }

        if (needsTutorContent) {
            scripts.push(
                '<script src="/shared/atlas-tutor-content-cloud-authority.js?v=20260916-runtime3"><\\/script>'
            );
        }

        if (
            document.readyState === 'loading' &&
            scripts.length
        ) {
            document.write(scripts.join(''));
        }
    }'''

new_cloud = '''    let compassHubCloudAuthorityPromise = null;

    function isCompassHubPath() {
        const path = String(
            window.location.pathname || ''
        );

        return (
            path === '/compass/' ||
            path === '/compass/index.html'
        );
    }

    function existingRuntimeScript(src) {
        const pathname = new URL(
            src,
            window.location.href
        ).pathname;

        return Array.from(document.scripts || []).find(script => {
            if (!script.src) return false;

            try {
                return new URL(
                    script.src,
                    window.location.href
                ).pathname === pathname;
            } catch {
                return false;
            }
        }) || null;
    }

    function loadRuntimeScript(src, globalName) {
        if (globalName && window[globalName]) {
            return Promise.resolve(window[globalName]);
        }

        return new Promise((resolve, reject) => {
            const existing = existingRuntimeScript(src);

            const complete = () => {
                if (!globalName || window[globalName]) {
                    resolve(
                        globalName ? window[globalName] : true
                    );
                    return;
                }

                reject(
                    new Error(
                        `${globalName} did not initialize.`
                    )
                );
            };

            const fail = () => reject(
                new Error(`Atlas runtime failed to load: ${src}`)
            );

            if (existing) {
                existing.addEventListener(
                    'load',
                    complete,
                    { once: true }
                );
                existing.addEventListener(
                    'error',
                    fail,
                    { once: true }
                );
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = false;
            script.addEventListener(
                'load',
                complete,
                { once: true }
            );
            script.addEventListener(
                'error',
                fail,
                { once: true }
            );
            document.head.appendChild(script);
        });
    }

    function signalCompassCloudAuthorityReady() {
        document.documentElement.dataset
            .atlasCompassCloudAuthority = 'ready';

        try {
            window.dispatchEvent(
                new Event(
                    'atlas:compass-cloud-authority-ready'
                )
            );
        } catch { }

        requestCompassHubRefresh('cloud-authority');
    }

    async function loadCompassHubCloudAuthorityScripts() {
        if (compassHubCloudAuthorityPromise) {
            return compassHubCloudAuthorityPromise;
        }

        compassHubCloudAuthorityPromise = (async () => {
            const needsSubjects = Boolean(
                window.AtlasTutorSubjects &&
                !window.AtlasTutorSubjectsCloudAuthority
            );

            const needsTutorContent = Boolean(
                window.AtlasTutorContent &&
                !window.AtlasTutorContentCloudAuthority
            );

            if (!needsSubjects && !needsTutorContent) {
                signalCompassCloudAuthorityReady();
                return true;
            }

            ensurePreconnect(
                'https://jnhjfpagectprceswvqn.supabase.co'
            );
            ensurePreconnect('https://cdn.jsdelivr.net');

            if (!window.AtlasCloud) {
                await loadRuntimeScript(
                    '/shared/atlas-cloud.js?v=20260916-runtime3',
                    'AtlasCloud'
                );
            }

            if (!window.AtlasAccount) {
                await loadRuntimeScript(
                    '/shared/atlas-account.js?v=20260916-stage1close1',
                    'AtlasAccount'
                );
            }

            if (needsSubjects && !window.AtlasCloudCache) {
                await loadRuntimeScript(
                    '/shared/atlas-cloud-cache.js?v=20260916-runtime3',
                    'AtlasCloudCache'
                );
            }

            if (
                needsSubjects &&
                !window.AtlasTutorSubjectsCloudAuthority
            ) {
                await loadRuntimeScript(
                    '/shared/atlas-tutor-subjects-cloud-authority.js?v=20260916-runtime3',
                    'AtlasTutorSubjectsCloudAuthority'
                );
            }

            if (
                needsTutorContent &&
                !window.AtlasTutorContentCloudAuthority
            ) {
                await loadRuntimeScript(
                    '/shared/atlas-tutor-content-cloud-authority.js?v=20260916-runtime3',
                    'AtlasTutorContentCloudAuthority'
                );
            }

            signalCompassCloudAuthorityReady();
            return true;
        })().catch(error => {
            compassHubCloudAuthorityPromise = null;
            console.error(
                '[AtlasContentRegistry] Compass cloud authority failed:',
                error
            );
            return false;
        });

        return compassHubCloudAuthorityPromise;
    }

    function scheduleCompassHubCloudAuthorityScripts() {
        let scheduled = false;

        const startAfterPaint = () => {
            if (scheduled) return;
            scheduled = true;

            window.requestAnimationFrame(() => {
                window.setTimeout(() => {
                    void loadCompassHubCloudAuthorityScripts();
                }, 0);
            });
        };

        if (
            document.documentElement.dataset
                .atlasCompassFirstPaintReady === 'true'
        ) {
            startAfterPaint();
            return;
        }

        window.addEventListener(
            'atlas:compass-first-paint-ready',
            startAfterPaint,
            { once: true }
        );
    }

    function writeCloudAuthorityScripts() {
        if (
            !window.location.pathname.startsWith('/compass/') ||
            !hasStoredAtlasAccountSession()
        ) {
            return;
        }

        if (isCompassHubPath()) {
            scheduleCompassHubCloudAuthorityScripts();
            return;
        }

        ensurePreconnect('https://jnhjfpagectprceswvqn.supabase.co');
        ensurePreconnect('https://cdn.jsdelivr.net');

        const needsSubjects = Boolean(
            window.AtlasTutorSubjects &&
            !window.AtlasTutorSubjectsCloudAuthority
        );

        const needsTutorContent = Boolean(
            window.AtlasTutorContent &&
            !window.AtlasTutorContentCloudAuthority
        );

        if (!needsSubjects && !needsTutorContent) {
            return;
        }

        const scripts = [];

        if (!window.AtlasCloud) {
            scripts.push(
                '<script src="/shared/atlas-cloud.js?v=20260916-runtime3"><\\/script>'
            );
        }

        if (!window.AtlasAccount) {
            scripts.push(
                '<script src="/shared/atlas-account.js?v=20260916-stage1close1"><\\/script>'
            );
        }

        if (needsSubjects && !window.AtlasCloudCache) {
            scripts.push(
                '<script src="/shared/atlas-cloud-cache.js?v=20260916-runtime3"><\\/script>'
            );
        }

        if (needsSubjects) {
            scripts.push(
                '<script src="/shared/atlas-tutor-subjects-cloud-authority.js?v=20260916-runtime3"><\\/script>'
            );
        }

        if (needsTutorContent) {
            scripts.push(
                '<script src="/shared/atlas-tutor-content-cloud-authority.js?v=20260916-runtime3"><\\/script>'
            );
        }

        if (
            document.readyState === 'loading' &&
            scripts.length
        ) {
            document.write(scripts.join(''));
        }
    }'''

count = registry.count(old_cloud)
if count != 1:
    raise SystemExit(
        f'Expected exactly one cloud authority bootstrap block, found {count}'
    )
registry = registry.replace(old_cloud, new_cloud, 1)

compass_required = [
    "root.classList.remove('atlas-session-fonts-pending');",
    "root.dataset.atlasCompassFirstPaintReady = 'true';",
    "'atlas:compass-first-paint-ready'",
    "atlas-content-registry.js?v=20260916-compassperf1",
]
for needle in compass_required:
    if needle not in compass:
        raise SystemExit(f'Missing Compass Batch B contract: {needle}')

if "window.requestAnimationFrame(function () {\n          root.classList.remove('atlas-session-fonts-pending');" in compass:
    raise SystemExit('Compass visibility release still waits on requestAnimationFrame')

registry_required = [
    'function isCompassHubPath()',
    'function loadRuntimeScript(src, globalName)',
    'async function loadCompassHubCloudAuthorityScripts()',
    'function scheduleCompassHubCloudAuthorityScripts()',
    "scheduleCompassHubCloudAuthorityScripts();",
    "'atlas:compass-cloud-authority-ready'",
    "requestCompassHubRefresh('cloud-authority')",
    "document.write(scripts.join(''))",
]
for needle in registry_required:
    if needle not in registry:
        raise SystemExit(f'Missing registry Batch B contract: {needle}')

if registry.count('scheduleCompassHubCloudAuthorityScripts();') != 1:
    raise SystemExit('Compass Hub cloud scheduler should have exactly one call site')

compass_path.write_text(compass, encoding='utf-8')
registry_path.write_text(registry, encoding='utf-8')
