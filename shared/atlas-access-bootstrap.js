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
        account: '/shared/atlas-account.js?v=20260916-access1'
    });

    let initPromise = null;

    function hasStoredAccountSession() {
        try {
            return Boolean(localStorage.getItem(AUTH_STORAGE_KEY));
        } catch {
            return false;
        }
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
        ensurePreconnect('https://jnhjfpagectprceswvqn.supabase.co');
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
            throw new Error('Atlas account state could not initialize.');
        }

        return window.AtlasAccount;
    }

    async function initialize() {
        if (initPromise) return initPromise;

        initPromise = (async () => {
            const Access = await ensureAccess();

            if (window.AtlasAccount) {
                await Access.initialize();
                return Access.getState();
            }

            if (!hasStoredAccountSession()) {
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

    initialize().catch(error => {
        console.error('[AtlasAccessBootstrap] initialization failed:', error);
    });
})();
