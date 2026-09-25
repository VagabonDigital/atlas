// ============================================================
// ATLAS CONTENT REGISTRY
// Seeds searchable/catalog metadata into AtlasBridge.
//
// Reads:
// - window.CompassCatalogData
//
// Owns:
// - world/item registry seeding
// - stale Compass subject cleanup
// - Tutor Layer → Compass create handoff
//
// Does NOT own:
// - Compass hub rendering
// - sessions/progress
// - lesson content
// - search modal behavior
// ============================================================

(function () {
    'use strict';

    if (window.AtlasContentRegistry) return;

    let registered = false;

    const TUTOR_CREATE_HANDOFF_KEY =
        'atlas::tutorCreateHandoff::v1';

    const TUTOR_CREATE_SOURCE_KIND =
        'tutor-layer-handoff';

    const SUPABASE_SESSION_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';

    const COMPASS_WORLD = {
        registryId: 'compass',
        id: 'compass',
        world: 'compass',
        type: 'world',
        title: 'Compass',
        description: 'Conversation subjects for thoughtful English, cultural reflection, and human communication.',
        status: 'available',
        launchUrl: 'compass/index.html'
    };

    function getBridge() {
        return window.AtlasBridge || null;
    }

    function getCompassCatalogData() {
        const Catalog = window.CompassCatalogData;

        if (!Catalog || typeof Catalog.getCompassSubjects !== 'function') {
            return {
                categories: [],
                subjects: []
            };
        }

        return {
            categories: typeof Catalog.getCompassCategories === 'function'
                ? Catalog.getCompassCategories()
                : [],
            subjects: Catalog.getCompassSubjects()
        };
    }

    function getCategoryTitleMap(categories) {
        return (Array.isArray(categories) ? categories : []).reduce((map, category) => {
            if (category && category.id) {
                map[category.id] = category.title || 'Compass';
            }

            return map;
        }, {});
    }


    function registryProjectionMatches(existing, next) {
        if (!existing || !next) return false;

        return Object.keys(next).every(key =>
            JSON.stringify(existing[key]) === JSON.stringify(next[key])
        );
    }

    function normalizeSubjectForRegistry(subject, categoryTitles) {
        if (!subject || typeof subject !== 'object') return null;

        const id = String(
            subject.id ||
            String(subject.registryId || '').replace(/^compass:/, '')
        ).trim();

        if (!id) return null;

        const registryId = subject.registryId || `compass:${id}`;
        const title = subject.title || subject.navTitle || id;
        const status = subject.status === 'available' ? 'available' : 'soon';
        const categoryId = subject.categoryId || '';
        const categoryTitle = subject.categoryTitle || categoryTitles[categoryId] || 'Compass';
        const publicAccess =
            subject.publicAccess === 'full'
                ? 'full'
                : 'preview';

        const launchUrl = status === 'available'
            ? (subject.launchUrl || `compass/${id}/index.html`)
            : '';

        const keywords = Array.isArray(subject.keywords)
            ? subject.keywords
            : [
                title,
                categoryTitle,
                status === 'available' ? 'available' : 'coming soon'
            ];

        return {
            registryId,
            world: 'compass',
            type: 'subject',
            id,
            title,
            navTitle: subject.navTitle || title,
            status,
            publicAccess,
            launchUrl,
            categoryId,
            categoryTitle,
            keywords
        };
    }

    function pruneStaleCompassSubjects(Bridge, validIds) {
        if (
            !Bridge ||
            typeof Bridge.readRegistry !== 'function' ||
            typeof Bridge.writeRegistry !== 'function'
        ) {
            return;
        }

        try {
            const registry = Bridge.readRegistry();
            let changed = false;

            Object.keys(registry.items || {}).forEach(registryId => {
                const item = registry.items[registryId];

                const isOwnedSubject =
                    item &&
                    item.world === 'compass' &&
                    item.type === 'subject' &&
                    item.ownershipKind === 'my-subject';

                if (
                    item &&
                    item.world === 'compass' &&
                    item.type === 'subject' &&
                    !validIds.has(registryId) &&
                    !isOwnedSubject
                ) {
                    delete registry.items[registryId];
                    changed = true;
                }
            });

            if (Array.isArray(registry.recentActivity)) {
                const nextRecent = registry.recentActivity.filter(activity => {
                    const id =
                        activity && activity.registryId
                            ? activity.registryId
                            : '';

                    if (
                        !id.startsWith('compass:') ||
                        validIds.has(id)
                    ) {
                        return true;
                    }

                    const item =
                        registry.items?.[id] || null;

                    return (
                        activity?.ownershipKind === 'my-subject' ||
                        item?.ownershipKind === 'my-subject'
                    );
                });

                if (
                    nextRecent.length !==
                    registry.recentActivity.length
                ) {
                    registry.recentActivity = nextRecent;
                    changed = true;
                }
            }

            if (changed) {
                Bridge.writeRegistry(registry);
            }
        } catch (e) { }
    }

    function registerCompass() {
        const Bridge = getBridge();

        if (
            !Bridge ||
            typeof Bridge.upsertWorld !== 'function' ||
            typeof Bridge.upsertItem !== 'function'
        ) {
            return false;
        }

        const existingRegistry =
            typeof Bridge.readRegistry === 'function'
                ? Bridge.readRegistry()
                : { worlds: {}, items: {} };

        if (
            !registryProjectionMatches(
                existingRegistry.worlds?.[COMPASS_WORLD.registryId],
                COMPASS_WORLD
            )
        ) {
            Bridge.upsertWorld(COMPASS_WORLD);
        }

        const { categories, subjects } = getCompassCatalogData();

        if (!Array.isArray(subjects) || !subjects.length) {
            return false;
        }

        const categoryTitles = getCategoryTitleMap(categories);
        const validIds = new Set();

        subjects.forEach(subject => {
            const item = normalizeSubjectForRegistry(subject, categoryTitles);

            if (!item) return;

            validIds.add(item.registryId);

            if (
                !registryProjectionMatches(
                    existingRegistry.items?.[item.registryId],
                    item
                )
            ) {
                Bridge.upsertItem(item);
            }
        });

        pruneStaleCompassSubjects(Bridge, validIds);

        return true;
    }

    function getTutorCreateIntroductionFromContext(context) {
        const candidate =
            context &&
            typeof context === 'object' &&
            !Array.isArray(context)
                ? context
                : {};

        const source =
            candidate.source &&
            typeof candidate.source === 'object' &&
            !Array.isArray(candidate.source)
                ? candidate.source
                : null;

        if (
            !source ||
            source.kind !== TUTOR_CREATE_SOURCE_KIND
        ) {
            return '';
        }

        return String(
            source.introduction ||
            candidate.premise ||
            ''
        ).trim();
    }

    function getTutorCreateSeedIntroduction() {
        return getTutorCreateIntroductionFromContext(
            window.AtlasGenerationContext
        );
    }

    function cloneWithTutorCreateIntroduction(
        document,
        introduction
    ) {
        const exactIntroduction =
            String(introduction || '').trim();

        if (
            !exactIntroduction ||
            !document ||
            typeof document !== 'object' ||
            Array.isArray(document)
        ) {
            return document;
        }

        let next = null;

        try {
            next = JSON.parse(
                JSON.stringify(document)
            );
        } catch {
            return document;
        }

        next.subjectCopy =
            next.subjectCopy &&
            typeof next.subjectCopy === 'object' &&
            !Array.isArray(next.subjectCopy)
                ? next.subjectCopy
                : {};

        next.subjectCopy.overview =
            next.subjectCopy.overview &&
            typeof next.subjectCopy.overview === 'object' &&
            !Array.isArray(next.subjectCopy.overview)
                ? next.subjectCopy.overview
                : {};

        next.subjectCopy.overview.intro = [
            exactIntroduction
        ];

        return next;
    }

    function patchTutorCreateGeneration() {
        const AI = window.AtlasAI;

        if (
            !AI ||
            AI.__atlasTutorCreateHandoffPatched ||
            typeof AI.generateOverview !== 'function'
        ) {
            return;
        }

        const originalGenerateOverview =
            AI.generateOverview;

        AI.generateOverview = async function (...args) {
            const introduction =
                getTutorCreateSeedIntroduction();

            const generated =
                await originalGenerateOverview.apply(
                    this,
                    args
                );

            if (
                !introduction ||
                !generated ||
                typeof generated !== 'object' ||
                Array.isArray(generated)
            ) {
                return generated;
            }

            return {
                ...generated,
                intro: introduction
            };
        };

        AI.__atlasTutorCreateHandoffPatched = true;
    }

    function patchTutorCreatePersistence() {
        const Subjects = window.AtlasTutorSubjects;

        if (
            !Subjects ||
            Subjects.__atlasTutorCreateHandoffPatched
        ) {
            return;
        }

        const originalCreateSubject =
            Subjects.createSubject;

        const originalSaveWorkingDraft =
            Subjects.saveWorkingDraft;

        const originalUpdateSubject =
            Subjects.updateSubject;

        if (typeof originalCreateSubject === 'function') {
            Subjects.createSubject = async function (input = {}) {
                const candidate =
                    input &&
                    typeof input === 'object' &&
                    !Array.isArray(input)
                        ? input
                        : {};

                const introduction =
                    getTutorCreateIntroductionFromContext(
                        candidate.metadata?.generationContext
                    );

                if (!introduction || !candidate.document) {
                    return originalCreateSubject.call(
                        this,
                        input
                    );
                }

                return originalCreateSubject.call(
                    this,
                    {
                        ...candidate,
                        document:
                            cloneWithTutorCreateIntroduction(
                                candidate.document,
                                introduction
                            )
                    }
                );
            };
        }

        if (
            typeof originalSaveWorkingDraft === 'function' &&
            typeof Subjects.getSubject === 'function'
        ) {
            Subjects.saveWorkingDraft = async function (
                subjectId,
                patch = {}
            ) {
                const candidate =
                    patch &&
                    typeof patch === 'object' &&
                    !Array.isArray(patch)
                        ? patch
                        : {};

                let introduction = '';

                try {
                    const subject =
                        await Subjects.getSubject(subjectId);

                    introduction =
                        getTutorCreateIntroductionFromContext(
                            subject?.metadata?.generationContext
                        );
                } catch { }

                if (!introduction || !candidate.document) {
                    return originalSaveWorkingDraft.call(
                        this,
                        subjectId,
                        patch
                    );
                }

                return originalSaveWorkingDraft.call(
                    this,
                    subjectId,
                    {
                        ...candidate,
                        document:
                            cloneWithTutorCreateIntroduction(
                                candidate.document,
                                introduction
                            )
                    }
                );
            };
        }

        if (
            typeof originalUpdateSubject === 'function' &&
            typeof Subjects.getSubject === 'function'
        ) {
            Subjects.updateSubject = async function (
                subjectId,
                patch = {}
            ) {
                const candidate =
                    patch &&
                    typeof patch === 'object' &&
                    !Array.isArray(patch)
                        ? patch
                        : {};

                let context =
                    candidate.metadata?.generationContext ||
                    null;

                if (!context) {
                    try {
                        const subject =
                            await Subjects.getSubject(subjectId);

                        context =
                            subject?.metadata?.generationContext ||
                            null;
                    } catch { }
                }

                const introduction =
                    getTutorCreateIntroductionFromContext(
                        context
                    );

                if (!introduction || !candidate.document) {
                    return originalUpdateSubject.call(
                        this,
                        subjectId,
                        patch
                    );
                }

                return originalUpdateSubject.call(
                    this,
                    subjectId,
                    {
                        ...candidate,
                        document:
                            cloneWithTutorCreateIntroduction(
                                candidate.document,
                                introduction
                            )
                    }
                );
            };
        }

        Subjects.__atlasTutorCreateHandoffPatched = true;
    }

    function cleanTutorCreateHandoffUrl() {
        try {
            const url = new URL(window.location.href);

            if (
                url.searchParams.get('create') !== 'tutor'
            ) {
                return false;
            }

            url.searchParams.delete('create');

            window.history.replaceState(
                window.history.state,
                '',
                url.href
            );

            return true;
        } catch {
            return false;
        }
    }

    function readTutorCreateHandoff() {
        let raw = null;

        try {
            raw = sessionStorage.getItem(
                TUTOR_CREATE_HANDOFF_KEY
            );

            sessionStorage.removeItem(
                TUTOR_CREATE_HANDOFF_KEY
            );
        } catch {
            return null;
        }

        if (!raw) return null;

        let candidate = null;

        try {
            candidate = JSON.parse(raw);
        } catch {
            return null;
        }

        if (
            !candidate ||
            typeof candidate !== 'object' ||
            Array.isArray(candidate) ||
            Number(candidate.version) !== 1
        ) {
            return null;
        }

        const title =
            String(candidate.title || '').trim();

        if (!title) return null;

        return {
            version: 1,
            title,
            introduction:
                String(
                    candidate.introduction || ''
                ).trim()
        };
    }

    function openTutorCreateHandoff() {
        let isTutorCreate = false;

        try {
            isTutorCreate =
                new URL(window.location.href)
                    .searchParams
                    .get('create') === 'tutor';
        } catch { }

        if (!isTutorCreate) return;

        const handoff = readTutorCreateHandoff();
        cleanTutorCreateHandoffUrl();

        if (
            !handoff ||
            typeof window.openCreateSubjectDialog !== 'function'
        ) {
            return;
        }

        window.scrollTo(0, 0);

        window.openCreateSubjectDialog(
            null,
            '',
            null,
            ''
        );

        const dialog = document.getElementById(
            'owned-subject-dialog'
        );

        const input = dialog?.querySelector(
            '#owned-subject-dialog-input'
        );

        if (!dialog || !input) return;

        input.value = handoff.title;

        if (
            handoff.introduction &&
            typeof ownedSubjectDialogState !== 'undefined' &&
            ownedSubjectDialogState?.mode === 'create'
        ) {
            ownedSubjectDialogState.suggestion = {
                title: handoff.title,
                premise: handoff.introduction,
                source: {
                    kind: TUTOR_CREATE_SOURCE_KIND,
                    title: handoff.title,
                    introduction: handoff.introduction
                }
            };

            const releaseHandoffIntroduction = () => {
                if (
                    String(input.value || '').trim() ===
                    handoff.title
                ) {
                    return;
                }

                if (
                    typeof ownedSubjectDialogState !== 'undefined' &&
                    ownedSubjectDialogState?.mode === 'create' &&
                    ownedSubjectDialogState.suggestion?.source?.kind ===
                    TUTOR_CREATE_SOURCE_KIND
                ) {
                    ownedSubjectDialogState.suggestion = null;
                }

                input.removeEventListener(
                    'input',
                    releaseHandoffIntroduction
                );
            };

            input.addEventListener(
                'input',
                releaseHandoffIntroduction
            );
        }

        requestAnimationFrame(() => {
            window.scrollTo(0, 0);
            input.focus();
            input.setSelectionRange(
                input.value.length,
                input.value.length
            );
        });
    }

    function installTutorCreateHandoff() {
        patchTutorCreateGeneration();
        patchTutorCreatePersistence();

        window.addEventListener(
            'load',
            openTutorCreateHandoff,
            { once: true }
        );
    }

    function registerAll() {
        if (registered) return true;

        const ok = registerCompass();

        if (ok) {
            registered = true;
        }

        return ok;
    }

    function hasStoredAtlasAccountSession() {
        try {
            return Boolean(
                localStorage.getItem(
                    SUPABASE_SESSION_KEY
                )
            );
        } catch {
            return false;
        }
    }

    function ensurePreconnect(href) {
        if (!href || document.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    const COMPASS_COVER_PREWARM_CONCURRENCY = 3;
    const compassCoverPrewarmQueued = new Set();
    const compassCoverPrewarmPending = new Map();
    const compassCoverPrewarmQueue = [];
    let compassCoverPrewarmActive = 0;
    let compassCoverPrewarmScheduled = false;

    function resolveCompassCoverPrewarmUrl(source) {
        if (!source) return '';

        const candidate =
            typeof source === 'string'
                ? source
                : (
                    source.document?.module?.bgImage ||
                    source.module?.bgImage ||
                    source.metadata?.coverImage ||
                    source.coverImage ||
                    source.src ||
                    ''
                );

        const value = String(candidate || '').trim();
        if (!value) return '';

        try {
            const url = new URL(
                value,
                window.location.href
            );

            if (
                url.protocol !== 'http:' &&
                url.protocol !== 'https:'
            ) {
                return '';
            }

            return url.href;
        } catch {
            return '';
        }
    }

    function getCompassCatalogCoverSources() {
        const Catalog =
            window.CompassCatalogData;

        if (
            !Catalog ||
            typeof Catalog.getCompassSubjects !==
                'function'
        ) {
            return [];
        }

        try {
            return Catalog.getCompassSubjects();
        } catch {
            return [];
        }
    }

    function finishCompassCoverPrewarm(url) {
        if (!compassCoverPrewarmPending.has(url)) {
            return;
        }

        compassCoverPrewarmPending.delete(url);
        compassCoverPrewarmActive =
            Math.max(
                0,
                compassCoverPrewarmActive - 1
            );

        pumpCompassCoverPrewarm();
    }

    function pumpCompassCoverPrewarm() {
        while (
            compassCoverPrewarmActive <
                COMPASS_COVER_PREWARM_CONCURRENCY &&
            compassCoverPrewarmQueue.length
        ) {
            const url =
                compassCoverPrewarmQueue.shift();

            if (
                !url ||
                compassCoverPrewarmPending.has(url)
            ) {
                continue;
            }

            const image = new Image();
            let settled = false;

            const finish = () => {
                if (settled) return;
                settled = true;
                finishCompassCoverPrewarm(url);
            };

            image.decoding = 'async';
            image.loading = 'eager';

            if ('fetchPriority' in image) {
                image.fetchPriority = 'low';
            }

            image.onerror = finish;

            compassCoverPrewarmPending.set(
                url,
                image
            );
            compassCoverPrewarmActive += 1;

            image.src = url;

            if (typeof image.decode === 'function') {
                image.decode()
                    .catch(() => {})
                    .finally(finish);
            } else {
                image.onload = finish;
            }
        }
    }

    function prewarmCompassCoverImages(
        sources = []
    ) {
        if (
            navigator.connection?.saveData === true
        ) {
            return 0;
        }

        const extras =
            Array.isArray(sources)
                ? sources
                : [sources];

        const urls = [
            ...getCompassCatalogCoverSources(),
            ...extras
        ]
            .map(resolveCompassCoverPrewarmUrl)
            .filter(Boolean);

        let added = 0;

        urls.forEach(url => {
            if (
                compassCoverPrewarmQueued.has(url) ||
                compassCoverPrewarmPending.has(url)
            ) {
                return;
            }

            compassCoverPrewarmQueued.add(url);
            compassCoverPrewarmQueue.push(url);
            added += 1;
        });

        pumpCompassCoverPrewarm();
        return added;
    }

    function scheduleCompassCoverPrewarm() {
        if (compassCoverPrewarmScheduled) {
            return;
        }

        compassCoverPrewarmScheduled = true;

        const startAfterPaint = () => {
            window.requestAnimationFrame(() => {
                window.setTimeout(() => {
                    compassCoverPrewarmScheduled = false;
                    prewarmCompassCoverImages();
                }, 0);
            });
        };

        if (document.readyState === 'loading') {
            document.addEventListener(
                'DOMContentLoaded',
                startAfterPaint,
                { once: true }
            );
            return;
        }

        startAfterPaint();
    }

    function writeAtlasRootRuntimeScript() {
        const path = String(
            window.location.pathname || '/'
        );

        if (
            path !== '/' &&
            path !== '/index.html'
        ) {
            return;
        }

        if (
            window.AtlasRootRuntime ||
            document.querySelector(
                'script[data-atlas-root-runtime]'
            )
        ) {
            return;
        }

        if (document.readyState === 'loading') {
            document.write(
                '<script data-atlas-root-runtime="true" src="/shared/atlas-root-runtime.js?v=20260923-coverprewarm2"><\/script>'
            );
            return;
        }

        const script = document.createElement('script');
        script.src =
            '/shared/atlas-root-runtime.js?v=20260923-coverprewarm2';
        script.async = false;
        script.setAttribute(
            'data-atlas-root-runtime',
            'true'
        );
        document.head.appendChild(script);
    }

    function writeAtlasAccessBootstrapScript() {
        if (
            window.AtlasAccessBootstrap ||
            document.querySelector(
                'script[data-atlas-access-bootstrap]'
            )
        ) {
            return;
        }

        const src =
            '/shared/atlas-access-bootstrap.js?v=20260920-accountstable6';

        if (document.readyState === 'loading') {
            document.write(
                `<script data-atlas-access-bootstrap="true" src="${src}"><\/script>`
            );
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.setAttribute(
            'data-atlas-access-bootstrap',
            'true'
        );
        document.head.appendChild(script);
    }

    function shouldLoadAtlasAccountChrome() {
        const surface = String(
            document.body?.dataset?.atlasSurface || ''
        );

        if (surface === 'hub') return true;

        const path = String(
            window.location.pathname || '/'
        ).replace(/index\.html$/, '');

        return (
            path === '/' ||
            path === '/compass/' ||
            path === '/arcade/'
        );
    }

    function writeAtlasAccountChromeScript() {
        if (
            !shouldLoadAtlasAccountChrome() ||
            window.AtlasAccountChrome ||
            document.querySelector(
                'script[data-atlas-account-chrome]'
            )
        ) {
            return;
        }

        const src =
            '/shared/atlas-account-chrome.js?v=20260925-paddleintro2';

        if (document.readyState === 'loading') {
            document.write(
                `<script data-atlas-account-chrome="true" src="${src}"><\/script>`
            );
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.setAttribute(
            'data-atlas-account-chrome',
            'true'
        );
        document.head.appendChild(script);
    }

    let compassCloudAuthorityPromise = null;

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

    async function loadCompassCloudAuthorityScripts() {
        if (compassCloudAuthorityPromise) {
            return compassCloudAuthorityPromise;
        }

        compassCloudAuthorityPromise = (async () => {
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
                    '/shared/atlas-cloud-cache.js?v=20260922-order1',
                    'AtlasCloudCache'
                );
            }

            if (
                needsSubjects &&
                !window.AtlasTutorSubjectsCloudAuthority
            ) {
                await loadRuntimeScript(
                    '/shared/atlas-tutor-subjects-cloud-authority.js?v=20260922-delete1',
                    'AtlasTutorSubjectsCloudAuthority'
                );
            }

            if (
                needsTutorContent &&
                !window.AtlasTutorContentCloudAuthority
            ) {
                await loadRuntimeScript(
                    '/shared/atlas-tutor-content-cloud-authority.js?v=20260922-storage2',
                    'AtlasTutorContentCloudAuthority'
                );
            }

            signalCompassCloudAuthorityReady();
            return true;
        })().catch(error => {
            compassCloudAuthorityPromise = null;
            console.error(
                '[AtlasContentRegistry] Compass cloud authority failed:',
                error
            );
            return false;
        });

        return compassCloudAuthorityPromise;
    }

    function scheduleCompassHubCloudAuthorityScripts() {
        let scheduled = false;

        const startAfterPaint = () => {
            if (scheduled) return;
            scheduled = true;

            window.requestAnimationFrame(() => {
                window.setTimeout(() => {
                    void loadCompassCloudAuthorityScripts();
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

    let observedCompassAccountAuthenticated =
        hasStoredAtlasAccountSession();
    let observedCompassAccountUserId = '';

    function installCompassLiveAccountBootstrap() {
        if (
            !String(
                window.location.pathname || ''
            ).startsWith('/compass/')
        ) {
            return;
        }

        window.addEventListener(
            'atlas:account-change',
            event => {
                const detail = event?.detail || {};
                const nextAuthenticated =
                    detail.authenticated === true;
                const nextUserId =
                    String(detail.userId || '').trim();

                const identityChanged =
                    observedCompassAccountAuthenticated !==
                        nextAuthenticated ||
                    (
                        nextAuthenticated &&
                        observedCompassAccountUserId &&
                        nextUserId &&
                        observedCompassAccountUserId !==
                            nextUserId
                    );

                observedCompassAccountAuthenticated =
                    nextAuthenticated;
                observedCompassAccountUserId =
                    nextAuthenticated ? nextUserId : '';

                if (
                    !identityChanged ||
                    !nextAuthenticated
                ) {
                    return;
                }

                /*
                 * Anonymous Compass startup intentionally skips account-owned
                 * cloud authorities. A successful live sign-in must install
                 * those same authorities in the current document. Hub pages
                 * keep their post-paint scheduling; subject pages begin the
                 * upgrade immediately so resumed authorship cannot write
                 * signed-in work through the anonymous local projection.
                 */
                if (isCompassHubPath()) {
                    scheduleCompassHubCloudAuthorityScripts();
                    return;
                }

                void loadCompassCloudAuthorityScripts();
            }
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
                '<script src="/shared/atlas-cloud.js?v=20260916-runtime3"><\/script>'
            );
        }

        if (!window.AtlasAccount) {
            scripts.push(
                '<script src="/shared/atlas-account.js?v=20260916-stage1close1"><\/script>'
            );
        }

        if (needsSubjects && !window.AtlasCloudCache) {
            scripts.push(
                '<script src="/shared/atlas-cloud-cache.js?v=20260922-order1"><\/script>'
            );
        }

        if (needsSubjects) {
            scripts.push(
                '<script src="/shared/atlas-tutor-subjects-cloud-authority.js?v=20260922-delete1"><\/script>'
            );
        }

        if (needsTutorContent) {
            scripts.push(
                '<script src="/shared/atlas-tutor-content-cloud-authority.js?v=20260922-storage2"><\/script>'
            );
        }

        if (
            document.readyState === 'loading' &&
            scripts.length
        ) {
            document.write(scripts.join(''));
        }
    }

    function requestCompassHubRefresh(source = 'content-registry') {
        try {
            window.dispatchEvent(
                new CustomEvent(
                    'atlas:compass-hub-refresh-request',
                    { detail: { source } }
                )
            );
        } catch { }
    }

    window.addEventListener(
        'atlas:compass-hub-cache-refreshed',
        () => requestCompassHubRefresh('cloud-cache')
    );

    window.AtlasContentRegistry = {
        registerAll,
        registerCompass,
        requestCompassHubRefresh,
        ensureCompassCloudAuthority:
            loadCompassCloudAuthorityScripts,
        prewarmCompassCoverImages
    };

    scheduleCompassCoverPrewarm();
    writeAtlasRootRuntimeScript();
    installCompassLiveAccountBootstrap();
    writeCloudAuthorityScripts();
    writeAtlasAccessBootstrapScript();
    writeAtlasAccountChromeScript();
    installTutorCreateHandoff();
    registerAll();
})();
