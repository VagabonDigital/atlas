/* ============================================================
   ATLAS ACCOUNT
   Product-level authenticated account state.

   AtlasCloud owns the Supabase-specific client. AtlasAccount is the stable
   product contract consumed by Atlas surfaces and persistence owners.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasAccount) return;

    const listeners = new Set();

    let state = Object.freeze({
        ready: false,
        authenticated: false,
        userId: null,
        email: null
    });

    let initPromise = null;
    let unsubscribeAuth = null;

    function snapshot() {
        return { ...state };
    }

    function normalizeSession(session) {
        const user = session?.user || null;

        return Object.freeze({
            ready: true,
            authenticated: Boolean(user),
            userId: user?.id || null,
            email: user?.email || null
        });
    }

    function publish(nextState) {
        const changed =
            nextState.ready !== state.ready ||
            nextState.authenticated !== state.authenticated ||
            nextState.userId !== state.userId ||
            nextState.email !== state.email;

        state = nextState;

        if (!changed) return;

        const detail = snapshot();

        listeners.forEach(listener => {
            try {
                listener(detail);
            } catch (error) {
                console.error('[AtlasAccount] listener failed:', error);
            }
        });

        try {
            window.dispatchEvent(
                new CustomEvent('atlas:account-change', {
                    detail
                })
            );
        } catch {
            // Older browsers can still use subscribe().
        }
    }

    async function initialize() {
        if (initPromise) return initPromise;

        initPromise = (async () => {
            if (!window.AtlasCloud) {
                throw new Error('AtlasAccount requires AtlasCloud.');
            }

            const client = await AtlasCloud.getClient();
            const session = await AtlasCloud.getSession();

            publish(normalizeSession(session));

            const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
                publish(normalizeSession(nextSession));
            });

            if (data?.subscription) {
                unsubscribeAuth = () => data.subscription.unsubscribe();
            }

            return snapshot();
        })().catch(error => {
            initPromise = null;
            publish(Object.freeze({
                ready: true,
                authenticated: false,
                userId: null,
                email: null
            }));
            throw error;
        });

        return initPromise;
    }

    function getState() {
        return snapshot();
    }

    function subscribe(listener, { immediate = true } = {}) {
        if (typeof listener !== 'function') {
            return () => {};
        }

        listeners.add(listener);

        if (immediate) {
            try {
                listener(snapshot());
            } catch (error) {
                console.error('[AtlasAccount] listener failed:', error);
            }
        }

        return () => listeners.delete(listener);
    }

    async function signIn(email, password) {
        await initialize();
        await AtlasCloud.signInWithPassword(email, password);
        const session = await AtlasCloud.getSession();
        publish(normalizeSession(session));
        return snapshot();
    }

    async function signOut() {
        await initialize();
        await AtlasCloud.signOut();
        publish(normalizeSession(null));
        return snapshot();
    }

    async function requireUser() {
        await initialize();

        if (!state.authenticated || !state.userId) {
            const error = new Error('Atlas requires a signed-in account for this action.');
            error.code = 'ATLAS_AUTH_REQUIRED';
            throw error;
        }

        return {
            id: state.userId,
            email: state.email
        };
    }

    function destroy() {
        if (unsubscribeAuth) {
            unsubscribeAuth();
            unsubscribeAuth = null;
        }
        listeners.clear();
        initPromise = null;
    }

    function loadCompassOriginalCurationCloudAuthority() {
        if (
            !window.location.pathname.startsWith('/compass/') ||
            !window.AtlasOriginalCuration ||
            window.AtlasOriginalCurationCloudAuthority ||
            document.querySelector(
                'script[data-atlas-original-curation-cloud-authority]'
            )
        ) {
            return;
        }

        const script = document.createElement('script');
        script.src =
            '/shared/atlas-original-curation-cloud-authority.js?v=20260915-curation1';
        script.async = false;
        script.setAttribute(
            'data-atlas-original-curation-cloud-authority',
            'true'
        );
        document.head.appendChild(script);
    }

    window.AtlasAccount = Object.freeze({
        initialize,
        getState,
        subscribe,
        signIn,
        signOut,
        requireUser,
        destroy
    });

    loadCompassOriginalCurationCloudAuthority();
})();
