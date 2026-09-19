/* ============================================================
   ATLAS ACCOUNT
   Product-level authenticated account state.

   AtlasCloud owns the shared Supabase client. AtlasAccount is the stable
   product contract consumed by Atlas surfaces and persistence owners.
   Account-specific cloud operations are isolated behind AtlasAccountCloud.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasAccount) return;

    const ACCOUNT_CLOUD_SRC =
        '/shared/atlas-account-cloud.js?v=20260919-emailchange4';
    const PERSISTENCE_TRUST_SRC =
        '/shared/atlas-persistence-trust.js?v=20260916-trust2';
    const RECOVERY_SESSION_KEY = 'atlas::accountPasswordRecovery';
    const listeners = new Set();

    let state = Object.freeze({
        ready: false,
        authenticated: false,
        userId: null,
        email: null,
        recovery: readRecoveryHint(),
        entitlementReady: false,
        planCode: null,
        capabilities: Object.freeze({}),
        entitlementError: null
    });

    let initPromise = null;
    let unsubscribeAuth = null;
    let accountCloudPromise = null;
    let persistenceTrustPromise = null;
    let sessionReconcilePromise = null;
    let entitlementRequestId = 0;
    let entitlementPromise = null;
    let entitlementPromiseUserId = '';

    function readRecoveryHint() {
        try {
            if (sessionStorage.getItem(RECOVERY_SESSION_KEY) === '1') {
                return true;
            }
        } catch {
            // Recovery can still be inferred from the URL below.
        }

        return /(?:^|[&#])type=recovery(?:&|$)/.test(
            String(window.location.hash || '')
        );
    }

    function writeRecoveryHint(active) {
        try {
            if (active) {
                sessionStorage.setItem(RECOVERY_SESSION_KEY, '1');
            } else {
                sessionStorage.removeItem(RECOVERY_SESSION_KEY);
            }
        } catch {
            // Recovery state also lives in memory for the current page.
        }
    }

    function copyCapabilities(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return {};
        }

        return JSON.parse(JSON.stringify(value));
    }

    function freezeState(nextState) {
        return Object.freeze({
            ...nextState,
            capabilities: Object.freeze(
                copyCapabilities(nextState.capabilities)
            )
        });
    }

    function snapshot() {
        return {
            ...state,
            capabilities: copyCapabilities(state.capabilities)
        };
    }

    function stateForSession(session, { recovery = state.recovery } = {}) {
        const user = session?.user || null;
        const sameUser = Boolean(
            user &&
            state.authenticated &&
            state.userId === user.id
        );

        if (!user) {
            return freezeState({
                ready: true,
                authenticated: false,
                userId: null,
                email: null,
                recovery: false,
                entitlementReady: true,
                planCode: null,
                capabilities: {},
                entitlementError: null
            });
        }

        return freezeState({
            ready: true,
            authenticated: true,
            userId: user.id,
            email: user.email || null,
            recovery: Boolean(recovery),
            entitlementReady: sameUser
                ? state.entitlementReady
                : false,
            planCode: sameUser
                ? state.planCode
                : null,
            capabilities: sameUser
                ? state.capabilities
                : {},
            entitlementError: sameUser
                ? state.entitlementError
                : null
        });
    }

    function publish(nextState) {
        const normalized = freezeState(nextState);
        const changed =
            normalized.ready !== state.ready ||
            normalized.authenticated !== state.authenticated ||
            normalized.userId !== state.userId ||
            normalized.email !== state.email ||
            normalized.recovery !== state.recovery ||
            normalized.entitlementReady !== state.entitlementReady ||
            normalized.planCode !== state.planCode ||
            normalized.entitlementError !== state.entitlementError ||
            JSON.stringify(normalized.capabilities) !==
                JSON.stringify(state.capabilities);

        state = normalized;

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

    function ensurePersistenceTrust() {
        if (window.AtlasPersistenceTrust) {
            return Promise.resolve(window.AtlasPersistenceTrust);
        }

        if (persistenceTrustPromise) return persistenceTrustPromise;

        persistenceTrustPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector(
                'script[data-atlas-persistence-trust]'
            );

            function complete() {
                if (window.AtlasPersistenceTrust) {
                    resolve(window.AtlasPersistenceTrust);
                } else {
                    persistenceTrustPromise = null;
                    reject(new Error(
                        'Atlas persistence trust support did not initialize.'
                    ));
                }
            }

            if (existing) {
                existing.addEventListener('load', complete, { once: true });
                existing.addEventListener(
                    'error',
                    () => {
                        persistenceTrustPromise = null;
                        reject(new Error(
                            'Atlas could not load persistence trust support.'
                        ));
                    },
                    { once: true }
                );
                return;
            }

            const script = document.createElement('script');
            script.src = PERSISTENCE_TRUST_SRC;
            script.async = false;
            script.dataset.atlasPersistenceTrust = 'true';
            script.addEventListener('load', complete, { once: true });
            script.addEventListener(
                'error',
                () => {
                    persistenceTrustPromise = null;
                    reject(new Error(
                        'Atlas could not load persistence trust support.'
                    ));
                },
                { once: true }
            );
            document.head.appendChild(script);
        });

        return persistenceTrustPromise;
    }

    function ensureAccountCloud() {
        if (window.AtlasAccountCloud) {
            return Promise.resolve(window.AtlasAccountCloud);
        }

        if (accountCloudPromise) return accountCloudPromise;

        accountCloudPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector(
                'script[data-atlas-account-cloud]'
            );

            function complete() {
                if (window.AtlasAccountCloud) {
                    resolve(window.AtlasAccountCloud);
                } else {
                    accountCloudPromise = null;
                    reject(new Error(
                        'Atlas account cloud support did not initialize.'
                    ));
                }
            }

            if (existing) {
                existing.addEventListener('load', complete, { once: true });
                existing.addEventListener(
                    'error',
                    () => {
                        accountCloudPromise = null;
                        reject(new Error(
                            'Atlas could not load account cloud support.'
                        ));
                    },
                    { once: true }
                );
                return;
            }

            const script = document.createElement('script');
            script.src = ACCOUNT_CLOUD_SRC;
            script.async = false;
            script.dataset.atlasAccountCloud = 'true';
            script.addEventListener('load', complete, { once: true });
            script.addEventListener(
                'error',
                () => {
                    accountCloudPromise = null;
                    reject(new Error(
                        'Atlas could not load account cloud support.'
                    ));
                },
                { once: true }
            );
            document.head.appendChild(script);
        });

        return accountCloudPromise;
    }

    async function refreshEntitlement(expectedUserId = state.userId) {
        const userId = String(expectedUserId || '').trim();

        if (!state.authenticated || !userId || state.userId !== userId) {
            return snapshot();
        }

        if (
            entitlementPromise &&
            entitlementPromiseUserId === userId
        ) {
            return entitlementPromise;
        }

        const requestId = ++entitlementRequestId;

        publish({
            ...state,
            entitlementReady: false,
            entitlementError: null
        });

        entitlementPromiseUserId = userId;

        const request = (async () => {
            try {
                const AccountCloud = await ensureAccountCloud();
                const entitlement =
                    await AccountCloud.getAccountEntitlement();

                if (
                    requestId !== entitlementRequestId ||
                    !state.authenticated ||
                    state.userId !== userId
                ) {
                    return snapshot();
                }

                publish({
                    ...state,
                    entitlementReady: true,
                    planCode: entitlement?.planCode || 'free',
                    capabilities: entitlement?.capabilities || {},
                    entitlementError: null
                });
            } catch (error) {
                if (
                    requestId !== entitlementRequestId ||
                    !state.authenticated ||
                    state.userId !== userId
                ) {
                    return snapshot();
                }

                console.error(
                    '[AtlasAccount] entitlement read failed:',
                    error
                );

                publish({
                    ...state,
                    entitlementReady: true,
                    planCode: null,
                    capabilities: {},
                    entitlementError:
                        error?.message || String(error)
                });
            }

            return snapshot();
        })();

        let trackedPromise = null;

        trackedPromise = request.finally(() => {
            if (entitlementPromise === trackedPromise) {
                entitlementPromise = null;
                entitlementPromiseUserId = '';
            }
        });

        entitlementPromise = trackedPromise;
        return trackedPromise;
    }

    function scheduleEntitlementRefresh(userId) {
        const expectedUserId = String(userId || '').trim();
        if (!expectedUserId) return;

        window.setTimeout(() => {
            refreshEntitlement(expectedUserId).catch(error => {
                console.error(
                    '[AtlasAccount] entitlement refresh failed:',
                    error
                );
            });
        }, 0);
    }

    function syncPersistenceScopeForSession(session) {
        try {
            window.AtlasPersistenceTrust?.syncScopeForUser?.(
                session?.user?.id || null
            );
        } catch (error) {
            console.error(
                '[AtlasAccount] persistence scope sync failed:',
                error
            );
        }
    }

    function handleAuthStateChange(event, nextSession) {
        const previousUserId = state.userId;
        let recovery = state.recovery;

        if (event === 'PASSWORD_RECOVERY') {
            recovery = true;
            writeRecoveryHint(true);
        } else if (event === 'SIGNED_OUT') {
            recovery = false;
            writeRecoveryHint(false);
            entitlementRequestId += 1;
        }

        // Swap browser projections before publishing the new account state so
        // no downstream renderer can observe the previous tutor's local cache.
        syncPersistenceScopeForSession(nextSession);

        const nextState = stateForSession(nextSession, { recovery });
        publish(nextState);

        if (
            nextState.authenticated &&
            (
                nextState.userId !== previousUserId ||
                event === 'SIGNED_IN' ||
                event === 'INITIAL_SESSION' ||
                event === 'PASSWORD_RECOVERY'
            )
        ) {
            scheduleEntitlementRefresh(nextState.userId);
        }
    }

    async function initialize() {
        if (initPromise) return initPromise;

        initPromise = (async () => {
            if (!window.AtlasCloud) {
                throw new Error('AtlasAccount requires AtlasCloud.');
            }

            await ensurePersistenceTrust();

            const client = await AtlasCloud.getClient();

            const { data } = client.auth.onAuthStateChange(
                (event, nextSession) => {
                    handleAuthStateChange(event, nextSession);
                }
            );

            if (data?.subscription) {
                unsubscribeAuth = () => data.subscription.unsubscribe();
            }

            const session = await AtlasCloud.getSession();
            const recovery = Boolean(session?.user) && readRecoveryHint();

            syncPersistenceScopeForSession(session);
            publish(stateForSession(session, { recovery }));

            if (session?.user?.id) {
                await refreshEntitlement(session.user.id);
            }

            return snapshot();
        })().catch(error => {
            initPromise = null;
            entitlementRequestId += 1;
            publish(freezeState({
                ready: true,
                authenticated: false,
                userId: null,
                email: null,
                recovery: false,
                entitlementReady: true,
                planCode: null,
                capabilities: {},
                entitlementError: null
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

    function normalizeReturnIntentId(value) {
        const id = String(value || '').trim();
        if (!id) return null;

        if (!/^ri_[A-Za-z0-9_-]{20,80}$/.test(id)) {
            throw new Error('Atlas return intent ID is invalid.');
        }

        return id;
    }

    function accountReturnUrl({ returnIntentId = null } = {}) {
        const url = new URL('/account/', window.location.origin);
        const intentId = normalizeReturnIntentId(returnIntentId);

        if (intentId) {
            url.searchParams.set('ri', intentId);
        }

        return url.href;
    }

    async function signIn(email, password) {
        await initialize();
        writeRecoveryHint(false);
        await AtlasCloud.signInWithPassword(email, password);
        const session = await AtlasCloud.getSession();

        syncPersistenceScopeForSession(session);
        publish(stateForSession(session, { recovery: false }));

        if (session?.user?.id) {
            await refreshEntitlement(session.user.id);
        }

        return snapshot();
    }

    async function createAccount(
        email,
        password,
        { returnIntentId = null } = {}
    ) {
        await initialize();
        const AccountCloud = await ensureAccountCloud();
        const data = await AccountCloud.signUpWithPassword(
            email,
            password,
            accountReturnUrl({ returnIntentId })
        );
        const session = data?.session || null;

        if (session?.user) {
            syncPersistenceScopeForSession(session);
            publish(stateForSession(session, { recovery: false }));
            await refreshEntitlement(session.user.id);
        }

        return {
            state: snapshot(),
            confirmationRequired: !session,
            email: data?.user?.email || String(email || '').trim()
        };
    }

    async function requestPasswordReset(
        email,
        { returnIntentId = null } = {}
    ) {
        await initialize();
        const AccountCloud = await ensureAccountCloud();
        await AccountCloud.requestPasswordReset(
            email,
            accountReturnUrl({ returnIntentId })
        );
        return true;
    }

    async function changeEmail(
        currentPassword,
        email
    ) {
        await initialize();

        if (
            !state.authenticated ||
            !state.userId ||
            !state.email
        ) {
            const error = new Error(
                'Sign in before changing your Atlas account email.'
            );
            error.code = 'ATLAS_AUTH_REQUIRED';
            throw error;
        }

        const current =
            String(currentPassword || '');

        if (!current) {
            throw new Error(
                'Enter your current password.'
            );
        }

        const nextEmail =
            String(email || '').trim();

        if (!nextEmail) {
            throw new Error(
                'Enter a new email address.'
            );
        }

        if (
            state.email &&
            nextEmail.toLowerCase() ===
                state.email.toLowerCase()
        ) {
            throw new Error(
                'That is already your Atlas account email.'
            );
        }

        const AccountCloud =
            await ensureAccountCloud();

        const data =
            await AccountCloud
                .updateEmailWithCurrentCredentials(
                    state.email,
                    current,
                    nextEmail,
                    accountReturnUrl()
                );

        return {
            state: snapshot(),
            pendingEmail:
                String(
                    data?.user?.new_email ||
                    nextEmail
                ).trim()
        };
    }

    async function refreshIdentitySession() {
        await initialize();

        if (!state.authenticated || !state.userId) {
            const error = new Error(
                'Sign in before refreshing your Atlas account.'
            );
            error.code = 'ATLAS_AUTH_REQUIRED';
            throw error;
        }

        const AccountCloud =
            await ensureAccountCloud();

        const data =
            await AccountCloud.refreshCurrentSession();

        const session =
            data?.session ||
            await AtlasCloud.getSession();

        if (!session?.user) {
            const error = new Error(
                'Atlas could not refresh your account session.'
            );
            error.code = 'ATLAS_SESSION_REFRESH_FAILED';
            throw error;
        }

        syncPersistenceScopeForSession(session);
        publish(
            stateForSession(
                session,
                { recovery: state.recovery }
            )
        );

        return snapshot();
    }

    async function changePassword(
        currentPassword,
        password
    ) {
        await initialize();

        if (
            !state.authenticated ||
            !state.userId ||
            !state.email
        ) {
            const error = new Error(
                'Sign in before changing your Atlas account password.'
            );
            error.code = 'ATLAS_AUTH_REQUIRED';
            throw error;
        }

        const current =
            String(currentPassword || '');
        const nextPassword =
            String(password || '');

        if (!current) {
            throw new Error(
                'Enter your current password.'
            );
        }

        if (nextPassword.length < 8) {
            throw new Error(
                'Use a password with at least 8 characters.'
            );
        }

        if (current === nextPassword) {
            throw new Error(
                'Choose a different password.'
            );
        }

        const AccountCloud =
            await ensureAccountCloud();

        await AccountCloud
            .updatePasswordWithCurrentCredentials(
                state.email,
                current,
                nextPassword
            );

        const session =
            await AtlasCloud.getSession();

        syncPersistenceScopeForSession(session);
        publish(
            stateForSession(
                session,
                { recovery: false }
            )
        );

        return snapshot();
    }

    async function completePasswordRecovery(password) {
        await initialize();

        if (!state.authenticated || !state.recovery) {
            const error = new Error(
                'Open the password reset link from your email before choosing a new password.'
            );
            error.code = 'ATLAS_RECOVERY_REQUIRED';
            throw error;
        }

        const AccountCloud = await ensureAccountCloud();
        await AccountCloud.updatePassword(password);
        writeRecoveryHint(false);
        publish({
            ...state,
            recovery: false
        });
        return snapshot();
    }

    async function signOut() {
        await initialize();
        entitlementRequestId += 1;
        writeRecoveryHint(false);
        const AccountCloud = await ensureAccountCloud();
        await AccountCloud.signOutCurrentSession();
        syncPersistenceScopeForSession(null);
        publish(stateForSession(null, { recovery: false }));
        return snapshot();
    }

    async function reconcileSessionAfterCloudError(error) {
        await initialize();

        if (state.ready && !state.authenticated) {
            return true;
        }

        const AccountCloud = await ensureAccountCloud();

        if (
            typeof AccountCloud.isAuthSessionError !== 'function' ||
            !AccountCloud.isAuthSessionError(error)
        ) {
            return false;
        }

        if (sessionReconcilePromise) {
            return sessionReconcilePromise;
        }

        sessionReconcilePromise = (async () => {
            let result;

            try {
                result = await AccountCloud.reconcileCurrentSession();
            } catch (verifyError) {
                if (!AccountCloud.isAuthSessionError(verifyError)) {
                    console.warn(
                        '[AtlasAccount] session verification failed without proving auth loss:',
                        verifyError
                    );
                    return false;
                }

                result = {
                    valid: false,
                    user: null
                };
            }

            if (result?.valid) {
                return false;
            }

            entitlementRequestId += 1;
            writeRecoveryHint(false);
            syncPersistenceScopeForSession(null);
            publish(stateForSession(null, { recovery: false }));

            try {
                window.dispatchEvent(
                    new CustomEvent('atlas:account-session-ended', {
                        detail: {
                            code: String(error?.code || ''),
                            message: String(error?.message || '')
                        }
                    })
                );
            } catch { }

            return true;
        })().finally(() => {
            sessionReconcilePromise = null;
        });

        return sessionReconcilePromise;
    }

    async function requireUser() {
        await initialize();

        if (!state.authenticated || !state.userId) {
            const error = new Error(
                'Atlas requires a signed-in account for this action.'
            );
            error.code = 'ATLAS_AUTH_REQUIRED';
            throw error;
        }

        return {
            id: state.userId,
            email: state.email
        };
    }

    function getCapability(name, fallback = null) {
        const key = String(name || '').trim();

        if (
            !key ||
            !state.authenticated ||
            !state.entitlementReady ||
            state.entitlementError
        ) {
            return fallback;
        }

        if (!Object.prototype.hasOwnProperty.call(state.capabilities, key)) {
            return fallback;
        }

        return state.capabilities[key];
    }

    function hasCapability(name) {
        return Boolean(getCapability(name, false));
    }

    function destroy() {
        entitlementRequestId += 1;
        sessionReconcilePromise = null;

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

    function loadSharedSessionSubjectsCloudAuthority() {
        if (
            !window.AtlasCloud ||
            window.AtlasSharedSessionSubjectsCloudAuthority ||
            document.querySelector(
                'script[data-atlas-shared-session-subjects-cloud-authority]'
            )
        ) {
            return;
        }

        const script = document.createElement('script');
        script.src =
            '/shared/atlas-shared-session-subjects-cloud-authority.js?v=20260915-shared-session-subjects1';
        script.async = false;
        script.setAttribute(
            'data-atlas-shared-session-subjects-cloud-authority',
            'true'
        );
        document.head.appendChild(script);
    }

    window.AtlasAccount = Object.freeze({
        initialize,
        getState,
        subscribe,
        signIn,
        createAccount,
        requestPasswordReset,
        changeEmail,
        refreshIdentitySession,
        changePassword,
        completePasswordRecovery,
        signOut,
        reconcileSessionAfterCloudError,
        requireUser,
        refreshEntitlement,
        getCapability,
        hasCapability,
        destroy
    });

    // Account-scoped authorities that AtlasAccount loads dynamically should
    // never initialize before the browser projection boundary is ready.
    ensurePersistenceTrust()
        .then(Trust => {
            Trust.syncScope();
            loadCompassOriginalCurationCloudAuthority();
            loadSharedSessionSubjectsCloudAuthority();
        })
        .catch(error => {
            console.error(
                '[AtlasAccount] persistence trust bootstrap failed:',
                error
            );
        });
})();
