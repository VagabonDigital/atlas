/* ============================================================
   ATLAS ROOT RUNTIME
   Small account-aware behavior layer for the Atlas gateway.

   Owns:
   - returning authenticated entry behavior on the Atlas root
   - saved-language review completion watermark
   - root refresh after learner-cloud hydration
   - account-owned subject/archive authorities needed by root settings
   - account-owned Atlas Hub image personalization hydration

   Does NOT own:
   - learner/session persistence
   - the root gateway renderer
   - future new-user Tutor Layer onboarding
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasRootRuntime) return;

    const AUTH_STORAGE_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';

    const REVIEW_COMPLETED_PREFIX =
        'atlas::languageReviewCompletedThrough::v1::';

    let reviewCompletionInstalled = false;
    let liveAuthorityHydrationPromise = null;
    let liveAuthorityHydrationUserId = '';
    let compassPresentationPrewarmPromise = null;
    let compassPresentationPrewarmUserId = '';
    let initialRootCloudBootstrapPromise = null;
    let initialRootCloudBootstrapUserId = '';
    let initialRootCloudBootstrapScheduled = false;

    function isAtlasRoot() {
        const path = String(
            window.location.pathname || '/'
        );

        return (
            path === '/' ||
            path === '/index.html'
        );
    }

    function readJson(storage, key) {
        try {
            const raw = storage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function storedSessionUserId() {
        const parsed = readJson(
            localStorage,
            AUTH_STORAGE_KEY
        );

        if (
            !parsed ||
            typeof parsed !== 'object'
        ) {
            return null;
        }

        const candidates = [
            parsed,
            parsed.session,
            parsed.currentSession,
            parsed.data?.session
        ];

        for (const candidate of candidates) {
            const id = String(
                candidate?.user?.id || ''
            ).trim();

            if (id) return id;
        }

        return null;
    }

    function hasStoredAccountSession() {
        return Boolean(storedSessionUserId());
    }

    function markWelcomeSeenForAuthenticatedUser() {
        if (!hasStoredAccountSession()) {
            return false;
        }

        try {
            localStorage.setItem(
                'atlas::welcomeSeen:v1',
                '1'
            );
        } catch { }

        document.documentElement.dataset.atlasWelcome =
            'seen';

        return true;
    }

    function releaseRootEntryGate() {
        window.requestAnimationFrame(() => {
            document.documentElement.dataset
                .atlasRootEntryReady = 'true';
        });
    }

    function ensurePreconnect(href) {
        if (
            !href ||
            document.querySelector(
                `link[rel="preconnect"][href="${href}"]`
            )
        ) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    function loadScriptSequentially(src) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(
                `script[src^="${src.split('?')[0]}"]`
            );

            if (existing) {
                if (
                    existing.dataset.atlasLoaded === 'true' ||
                    !existing.hasAttribute('async')
                ) {
                    resolve();
                    return;
                }

                existing.addEventListener('load', resolve, {
                    once: true
                });
                existing.addEventListener('error', reject, {
                    once: true
                });
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = false;
            script.addEventListener(
                'load',
                () => {
                    script.dataset.atlasLoaded = 'true';
                    resolve();
                },
                { once: true }
            );
            script.addEventListener('error', reject, {
                once: true
            });
            document.head.appendChild(script);
        });
    }

    async function writeRootCloudAuthorityScripts() {
        if (
            !isAtlasRoot() ||
            !hasStoredAccountSession()
        ) {
            return;
        }

        ensurePreconnect(
            'https://jnhjfpagectprceswvqn.supabase.co'
        );
        ensurePreconnect('https://cdn.jsdelivr.net');

        const Bootstrap =
            window.AtlasAccessBootstrap;

        if (
            Bootstrap &&
            typeof Bootstrap.prepareAccountRuntime ===
                'function'
        ) {
            await Bootstrap.prepareAccountRuntime();
        } else {
            if (!window.AtlasCloud) {
                await loadScriptSequentially(
                    '/shared/atlas-cloud.js?v=20260915-production2'
                );
            }

            if (!window.AtlasAccount) {
                await loadScriptSequentially(
                    '/shared/atlas-account.js?v=20260916-returnintent2'
                );
            }
        }

        const scripts = [];

        if (
            window.AtlasTutorSubjects &&
            !window.AtlasCloudCache
        ) {
            scripts.push(
                '/shared/atlas-cloud-cache.js?v=20260917-presentation2'
            );
        }

        if (
            window.AtlasTutorSubjects &&
            !window.AtlasTutorSubjectsCloudAuthority
        ) {
            scripts.push(
                '/shared/atlas-tutor-subjects-cloud-authority.js?v=20260915-archive1'
            );
        }

        if (
            window.AtlasOriginalCuration &&
            !window.AtlasOriginalCurationCloudAuthority
        ) {
            scripts.push(
                '/shared/atlas-original-curation-cloud-authority.js?v=20260915-archive1'
            );
        }

        if (!window.AtlasHubPersonalizationCloudAuthority) {
            scripts.push(
                '/shared/atlas-hub-personalization-cloud-authority.js?v=20260915-personalization1'
            );
        }

        await scripts.reduce(
            (chain, src) =>
                chain.then(() =>
                    loadScriptSequentially(src)
                ),
            Promise.resolve()
        );
    }

    function startInitialRootCloudBootstrap(userId) {
        const id = String(userId || '').trim();

        if (
            !id ||
            !isAtlasRoot() ||
            storedSessionUserId() !== id
        ) {
            return Promise.resolve(null);
        }

        if (
            initialRootCloudBootstrapPromise &&
            initialRootCloudBootstrapUserId === id
        ) {
            return initialRootCloudBootstrapPromise;
        }

        initialRootCloudBootstrapUserId = id;

        const request = Promise.resolve()
            .then(() =>
                writeRootCloudAuthorityScripts()
            )
            .then(() => {
                if (storedSessionUserId() !== id) {
                    return null;
                }

                return prewarmCompassPresentation(id);
            })
            .catch(error => {
                console.warn(
                    '[AtlasRootRuntime] Initial post-paint account bootstrap failed:',
                    error
                );
                return null;
            });

        let trackedPromise = null;

        trackedPromise = request.finally(() => {
            if (
                initialRootCloudBootstrapPromise ===
                trackedPromise
            ) {
                initialRootCloudBootstrapPromise = null;
                initialRootCloudBootstrapUserId = '';
            }
        });

        initialRootCloudBootstrapPromise =
            trackedPromise;

        return trackedPromise;
    }

    function scheduleInitialRootCloudBootstrap(userId) {
        const id = String(userId || '').trim();

        if (
            !id ||
            initialRootCloudBootstrapScheduled
        ) {
            return;
        }

        initialRootCloudBootstrapScheduled = true;

        const startAfterPaint = () => {
            window.removeEventListener(
                'atlas:local-presentation-ready',
                startAfterPaint
            );

            window.requestAnimationFrame(() => {
                window.setTimeout(() => {
                    void startInitialRootCloudBootstrap(
                        id
                    );
                }, 0);
            });
        };

        if (
            document.documentElement.dataset
                .atlasLocalPresentationReady === 'true'
        ) {
            startAfterPaint();
            return;
        }

        window.addEventListener(
            'atlas:local-presentation-ready',
            startAfterPaint,
            { once: true }
        );
    }

    function prewarmCompassPresentation(userId) {
        const id = String(userId || '').trim();

        if (
            !id ||
            !isAtlasRoot() ||
            storedSessionUserId() !== id
        ) {
            return Promise.resolve(null);
        }

        if (
            compassPresentationPrewarmPromise &&
            compassPresentationPrewarmUserId === id
        ) {
            return compassPresentationPrewarmPromise;
        }

        const Cache = window.AtlasCloudCache;

        if (
            !Cache ||
            typeof Cache.prepareCompassPresentation !==
                'function'
        ) {
            return Promise.resolve(null);
        }

        compassPresentationPrewarmUserId = id;

        const request = Promise.resolve(
            Cache.prepareCompassPresentation()
        )
            .then(snapshot => {
                if (storedSessionUserId() !== id) {
                    return null;
                }

                if (
                    snapshot &&
                    String(snapshot.userId || '').trim() !== id
                ) {
                    return null;
                }

                return snapshot || null;
            })
            .catch(error => {
                console.warn(
                    '[AtlasRootRuntime] Compass presentation prewarm failed:',
                    error
                );
                return null;
            });

        let trackedPromise = null;

        trackedPromise = request.finally(() => {
            if (
                compassPresentationPrewarmPromise ===
                trackedPromise
            ) {
                compassPresentationPrewarmPromise = null;
                compassPresentationPrewarmUserId = '';
            }
        });

        compassPresentationPrewarmPromise =
            trackedPromise;

        return trackedPromise;
    }

    function hydrateRootAuthoritiesAfterLiveSignIn(userId) {
        const id = String(userId || '').trim();

        if (!id || !isAtlasRoot()) {
            return Promise.resolve();
        }

        if (
            liveAuthorityHydrationPromise &&
            liveAuthorityHydrationUserId === id
        ) {
            return liveAuthorityHydrationPromise;
        }

        liveAuthorityHydrationUserId = id;

        const request = Promise.resolve(
            writeRootCloudAuthorityScripts()
        )
            .then(async () => {
                if (storedSessionUserId() !== id) return;

                const compassPresentationPromise =
                    prewarmCompassPresentation(id);

                const authorities = [
                    window.AtlasOriginalCurationCloudAuthority,
                    window.AtlasHubPersonalizationCloudAuthority
                ]
                    .filter(authority =>
                        authority &&
                        typeof authority.initialize === 'function'
                    );

                await Promise.all(
                    authorities.map(authority =>
                        authority.initialize()
                    )
                );

                if (storedSessionUserId() !== id) return;

                const modal =
                    document.getElementById('settings-modal');

                if (modal?.classList.contains('open')) {
                    if (
                        typeof window.renderArchivedSubjectsSettings ===
                        'function'
                    ) {
                        await window.renderArchivedSubjectsSettings();
                    }

                    if (
                        typeof window.renderRestoreAllAtlasOriginalsSetting ===
                        'function'
                    ) {
                        window.renderRestoreAllAtlasOriginalsSetting();
                    }

                    if (
                        typeof window.renderAtmosphereFavorites ===
                        'function'
                    ) {
                        window.renderAtmosphereFavorites();
                    }
                }

                await compassPresentationPromise;
            });

        let trackedPromise = null;

        trackedPromise = request.finally(() => {
            if (
                liveAuthorityHydrationPromise ===
                trackedPromise
            ) {
                liveAuthorityHydrationPromise = null;
                liveAuthorityHydrationUserId = '';
            }
        });

        liveAuthorityHydrationPromise = trackedPromise;
        return trackedPromise;
    }

    function reviewScope() {
        const userId = storedSessionUserId();

        return userId
            ? `user:${userId}`
            : 'local';
    }

    function reviewCompletionKey(sessionId) {
        return (
            REVIEW_COMPLETED_PREFIX +
            reviewScope() +
            '::' +
            encodeURIComponent(
                String(sessionId || 'default')
            )
        );
    }

    function entryTimestamp(entry) {
        if (!entry || typeof entry !== 'object') {
            return 0;
        }

        return Math.max(
            0,
            Number(entry.savedAt) || 0,
            Number(entry.lastTouchedAt) || 0,
            Number(entry.updatedAt) || 0,
            Number(entry.createdAt) || 0
        );
    }

    function readReviewedThrough(sessionId) {
        try {
            const raw = localStorage.getItem(
                reviewCompletionKey(sessionId)
            );

            if (raw === null) return -1;

            const value = Number(raw);
            return Number.isFinite(value)
                ? value
                : -1;
        } catch {
            return -1;
        }
    }

    function writeReviewedThrough(
        sessionId,
        timestamp
    ) {
        const value = Math.max(
            0,
            Number(timestamp) || 0
        );

        try {
            localStorage.setItem(
                reviewCompletionKey(sessionId),
                String(value)
            );
            return true;
        } catch {
            return false;
        }
    }

    function getSavedLanguageEntriesForSession(
        sessionId
    ) {
        const Bridge = window.AtlasBridge;

        if (
            !Bridge ||
            typeof Bridge.readLedger !== 'function'
        ) {
            return [];
        }

        let ledger = null;

        try {
            ledger = Bridge.readLedger();
        } catch {
            return [];
        }

        return Object.values(
            ledger?.entries || {}
        ).filter(entry =>
            entry &&
            entry.sessionId === sessionId &&
            entry.kind === 'language' &&
            entry.status === 'saved'
        );
    }

    function markCurrentLanguageReviewComplete() {
        const Bridge = window.AtlasBridge;

        if (
            !Bridge ||
            typeof Bridge.readActiveSession !== 'function'
        ) {
            return false;
        }

        const session = Bridge.readActiveSession();
        const sessionId =
            session?.id ||
            Bridge.defaultSessionId ||
            'default';

        const entries =
            getSavedLanguageEntriesForSession(
                sessionId
            );

        if (!entries.length) {
            return false;
        }

        const completedThrough = entries.reduce(
            (latest, entry) =>
                Math.max(
                    latest,
                    entryTimestamp(entry)
                ),
            0
        );

        return writeReviewedThrough(
            sessionId,
            completedThrough
        );
    }

    function patchReviewSet() {
        const original = window.getReviewSet;

        if (
            typeof original !== 'function' ||
            original.__atlasReviewCompletionPatched
        ) {
            return false;
        }

        function patchedGetReviewSet(
            ledger,
            sessionId
        ) {
            const reviewedThrough =
                readReviewedThrough(sessionId);

            return original(
                ledger,
                sessionId
            ).filter(entry =>
                entryTimestamp(entry) >
                reviewedThrough
            );
        }

        patchedGetReviewSet
            .__atlasReviewCompletionPatched = true;

        window.getReviewSet = patchedGetReviewSet;
        return true;
    }

    function patchGatewayCopy() {
        const original = window.renderGateway;

        if (
            typeof original !== 'function' ||
            original.__atlasGatewayCopyPatched
        ) {
            return false;
        }

        function patchedRenderGateway(...args) {
            const html = original.apply(this, args);

            return String(html || '').replace(
                '<p class="welcome-sub">Choose a direction for today\u2019s lesson.</p>',
                ''
            );
        }

        patchedRenderGateway
            .__atlasGatewayCopyPatched = true;

        window.renderGateway = patchedRenderGateway;
        return true;
    }

    function installReviewCompletion() {
        if (reviewCompletionInstalled) {
            return;
        }

        reviewCompletionInstalled = true;

        document.addEventListener(
            'click',
            event => {
                const button =
                    event.target instanceof Element
                        ? event.target.closest('button')
                        : null;

                if (
                    !button ||
                    !button.closest('.review-view') ||
                    !button.classList.contains(
                        'review-nav-btn'
                    ) ||
                    !button.classList.contains(
                        'primary'
                    ) ||
                    String(
                        button.textContent || ''
                    ).trim() !== 'Done'
                ) {
                    return;
                }

                markCurrentLanguageReviewComplete();
            },
            true
        );
    }

    function refreshRootAfterLearnerHydration() {
        if (
            !isAtlasRoot() ||
            typeof window.renderHome !== 'function'
        ) {
            return;
        }

        window.renderHome();
    }

    function refreshRootSettingsAfterCurationHydration() {
        if (!isAtlasRoot()) return;

        if (
            typeof window.renderArchivedSubjectsSettings ===
            'function'
        ) {
            void window.renderArchivedSubjectsSettings();
        }

        if (
            typeof window.renderRestoreAllAtlasOriginalsSetting ===
            'function'
        ) {
            window.renderRestoreAllAtlasOriginalsSetting();
        }
    }

    function refreshRootAfterPersonalizationHydration() {
        if (!isAtlasRoot()) return;

        if (
            typeof window.applyEffectiveAtmosphereImage ===
            'function'
        ) {
            window.applyEffectiveAtmosphereImage();
        }

        if (
            typeof window.renderAtmosphereFavorites ===
            'function'
        ) {
            window.renderAtmosphereFavorites();
        }

        const modal = document.getElementById('settings-modal');

        if (!modal?.classList.contains('open')) {
            return;
        }

        try {
            const session =
                typeof window.getActiveSession === 'function'
                    ? window.getActiveSession()
                    : null;

            const url =
                session &&
                typeof window.readSessionAtmosphereImage === 'function'
                    ? window.readSessionAtmosphereImage(session.id)
                    : '';

            const input = document.getElementById(
                'atmosphere-input'
            );

            if (input) input.value = url;

            if (
                typeof window.updateAtmospherePreview ===
                'function'
            ) {
                window.updateAtmospherePreview(url);
            }
        } catch { }
    }

    function install() {
        if (!isAtlasRoot()) return;

        patchReviewSet();
        patchGatewayCopy();
        installReviewCompletion();

        if (hasStoredAccountSession()) {
            markWelcomeSeenForAuthenticatedUser();
        }

        /*
         * The main Atlas init listener runs in the same DOMContentLoaded
         * turn after this listener. Reveal on the next frame so the first
         * visible root frame is already the resolved authenticated or
         * anonymous state, never the wrong state underneath it.
         */
        releaseRootEntryGate();
    }

    if (isAtlasRoot()) {
        /*
         * Parser-time root work is presentation-only. Authenticated cloud,
         * account, subject, curation, personalization, and Compass prewarm
         * startup begin only after the first validated local Hub frame has
         * actually crossed a browser paint boundary.
         */
        if (hasStoredAccountSession()) {
            markWelcomeSeenForAuthenticatedUser();

            scheduleInitialRootCloudBootstrap(
                storedSessionUserId()
            );
        }

        /*
         * Register this before the root gateway registers its own
         * DOMContentLoaded init. By the time this runs, the root inline
         * functions exist, but its first render has not happened yet.
         */
        if (document.readyState === 'loading') {
            document.addEventListener(
                'DOMContentLoaded',
                install,
                { once: true }
            );
        } else {
            install();
        }

        window.addEventListener(
            'atlas:learner-cloud-ready',
            refreshRootAfterLearnerHydration
        );

        window.addEventListener(
            'atlas:original-curation-cloud-ready',
            refreshRootSettingsAfterCurationHydration
        );

        window.addEventListener(
            'atlas:hub-personalization-cloud-ready',
            refreshRootAfterPersonalizationHydration
        );

        window.addEventListener(
            'atlas:account-change',
            event => {
                const detail = event?.detail || {};
                const userId = String(
                    detail.userId || ''
                ).trim();

                if (
                    detail.authenticated !== true ||
                    !userId
                ) {
                    return;
                }

                markWelcomeSeenForAuthenticatedUser();

                void hydrateRootAuthoritiesAfterLiveSignIn(
                    userId
                ).catch(error => {
                    console.error(
                        '[AtlasRootRuntime] Live account hydration failed:',
                        error
                    );
                });
            }
        );
    }

    window.AtlasRootRuntime = Object.freeze({
        active: isAtlasRoot(),
        storedSessionUserId,
        markCurrentLanguageReviewComplete,
        readReviewedThrough
    });
})();
