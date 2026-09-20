/* ============================================================
   ATLAS ACCESS BOOTSTRAP
   Lightweight cross-world loader for canonical AtlasAccess state.

   Anonymous visitors should not pay the Supabase/auth startup cost merely so
   Atlas can answer "anonymous". A stored account session upgrades the bootstrap
   into the existing AtlasCloud -> AtlasAccount -> AtlasAccess stack.

   This module owns loading only. AtlasAccess owns product access semantics.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasAccessBootstrap) return;

    const AUTH_STORAGE_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';

    const SOURCES = Object.freeze({
        access: '/shared/atlas-access.js?v=20260916-access1',
        cloud: '/shared/atlas-cloud.js?v=20260916-access1',
        account: '/shared/atlas-account.js?v=20260920-accountstable2',
        capabilityGate: '/shared/atlas-capability-gate.js?v=20260920-accountstable2'
    });

    let initPromise = null;
    let accountStackPromise = null;
    let hubStartupGatePromise = null;

    function hasStoredAccountSession() {
        try {
            return Boolean(localStorage.getItem(AUTH_STORAGE_KEY));
        } catch {
            return false;
        }
    }

    function hasOAuthSessionInUrl() {
        try {
            const hash = String(
                window.location.hash || ''
            ).replace(/^#/, '');

            if (!hash) return false;

            const params =
                new URLSearchParams(hash);

            return Boolean(
                params.get('access_token') &&
                params.get('refresh_token')
            );
        } catch {
            return false;
        }
    }

    function isHubSurface() {
        const surface = String(
            document.body?.dataset?.atlasSurface || ''
        ).trim();

        if (surface === 'hub') {
            return true;
        }

        const path = String(
            window.location.pathname || '/'
        );

        return (
            path === '/' ||
            path === '/index.html' ||
            path === '/compass/' ||
            path === '/compass/index.html' ||
            path === '/arcade/' ||
            path === '/arcade/index.html'
        );
    }

    function waitForHubPresentationPaint() {
        if (
            !isHubSurface() ||
            document.documentElement.dataset
                .atlasLocalPresentationReady === 'true'
        ) {
            return Promise.resolve();
        }

        if (hubStartupGatePromise) {
            return hubStartupGatePromise;
        }

        hubStartupGatePromise = new Promise(resolve => {
            let released = false;

            const releaseAfterPaint = () => {
                if (released) return;
                released = true;

                window.removeEventListener(
                    'atlas:local-presentation-ready',
                    releaseAfterPaint
                );

                window.requestAnimationFrame(() => {
                    window.setTimeout(resolve, 0);
                });
            };

            window.addEventListener(
                'atlas:local-presentation-ready',
                releaseAfterPaint,
                { once: true }
            );

            if (
                document.documentElement.dataset
                    .atlasLocalPresentationReady === 'true'
            ) {
                releaseAfterPaint();
            }
        }).finally(() => {
            hubStartupGatePromise = null;
        });

        return hubStartupGatePromise;
    }

    function ensurePreconnect(href) {
        if (
            !href ||
            document.querySelector(`link[rel="preconnect"][href="${href}"]`)
        ) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    function existingScriptFor(src) {
        const pathname = String(src || '').split('?')[0];

        return Array.from(document.scripts || []).find(script => {
            try {
                return new URL(script.src, window.location.href)
                    .pathname === pathname;
            } catch {
                return false;
            }
        }) || null;
    }

    function loadScript(src, marker) {
        const existing = existingScriptFor(src);

        if (existing) {
            return new Promise((resolve, reject) => {
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', reject, { once: true });
            });
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = false;

            if (marker) {
                script.setAttribute(marker, 'true');
            }

            script.addEventListener('load', resolve, { once: true });
            script.addEventListener('error', reject, { once: true });
            document.head.appendChild(script);
        });
    }

    async function ensureAccess() {
        if (!window.AtlasAccess) {
            await loadScript(
                SOURCES.access,
                'data-atlas-access-runtime'
            );
        }

        if (!window.AtlasAccess) {
            throw new Error('Atlas access state could not initialize.');
        }

        return window.AtlasAccess;
    }

    async function ensureAccountStack() {
        if (window.AtlasAccount && window.AtlasCloud) {
            return window.AtlasAccount;
        }

        if (accountStackPromise) {
            return accountStackPromise;
        }

        accountStackPromise = (async () => {
            ensurePreconnect(
                'https://jnhjfpagectprceswvqn.supabase.co'
            );
            ensurePreconnect('https://cdn.jsdelivr.net');

            if (!window.AtlasCloud) {
                await loadScript(
                    SOURCES.cloud,
                    'data-atlas-access-cloud'
                );
            }

            if (!window.AtlasAccount) {
                await loadScript(
                    SOURCES.account,
                    'data-atlas-access-account'
                );
            }

            if (!window.AtlasAccount) {
                throw new Error(
                    'Atlas account state could not initialize.'
                );
            }

            return window.AtlasAccount;
        })().catch(error => {
            accountStackPromise = null;
            throw error;
        });

        return accountStackPromise;
    }

    async function prepareAccountRuntime() {
        return ensureAccountStack();
    }

    async function prepareAccount() {
        const Access = await ensureAccess();
        const Account = await ensureAccountStack();

        await Account.initialize();
        await Access.initialize();

        return {
            account: Account.getState?.() || null,
            access: Access.getState?.() || null
        };
    }

    async function prepareCapabilityGate() {
        if (!window.AtlasCapabilityGate) {
            await loadScript(
                SOURCES.capabilityGate,
                'data-atlas-capability-gate-runtime'
            );
        }

        if (!window.AtlasCapabilityGate) {
            throw new Error(
                'Atlas capability enforcement could not initialize.'
            );
        }

        return window.AtlasCapabilityGate;
    }

    async function initialize() {
        if (initPromise) return initPromise;

        initPromise = (async () => {
            await waitForHubPresentationPaint();

            const Access = await ensureAccess();

            if (window.AtlasAccount) {
                await Access.initialize();
                return Access.getState();
            }

            if (
                !hasStoredAccountSession() &&
                !hasOAuthSessionInUrl()
            ) {
                return Access.bootstrapAnonymous();
            }

            await ensureAccountStack();
            await Access.initialize();
            return Access.getState();
        })().catch(error => {
            initPromise = null;
            throw error;
        });

        return initPromise;
    }

    function getState() {
        return window.AtlasAccess?.getState?.() || null;
    }

    function refresh() {
        initPromise = null;
        return initialize();
    }

    window.AtlasAccessBootstrap = Object.freeze({
        initialize,
        prepareAccount,
        prepareAccountRuntime,
        prepareCapabilityGate,
        getState,
        refresh
    });

    window.addEventListener('storage', event => {
        if (event.key !== AUTH_STORAGE_KEY) return;

        if (event.newValue && !window.AtlasAccount) {
            refresh().catch(error => {
                console.error(
                    '[AtlasAccessBootstrap] account upgrade failed:',
                    error
                );
            });
            return;
        }

        if (!event.newValue && !window.AtlasAccount) {
            window.AtlasAccess?.bootstrapAnonymous?.();
        }
    });

    prepareCapabilityGate().catch(error => {
        console.error(
            '[AtlasAccessBootstrap] capability gate failed:',
            error
        );
    });

    initialize().catch(error => {
        console.error('[AtlasAccessBootstrap] initialization failed:', error);
    });
})();
