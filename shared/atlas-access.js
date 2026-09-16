/* ============================================================
   ATLAS ACCESS
   Canonical product-level access state.

   AtlasAccount owns identity and raw server entitlement state.
   AtlasAccess resolves that into the semantic access contract used by
   product surfaces: anonymous / Free / Pro, capabilities, and creation
   allowance state.

   This module does NOT own:
   - authentication UI or account gates
   - return-to-intent routing
   - feature interception / enforcement wiring
   - billing, quota accounting or server-side AI enforcement
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasAccess) return;

    const CAPABILITY_NAMES = Object.freeze([
        'canSaveDurableWork',
        'canCreateLearner',
        'canCreateSubject',
        'canEditSubject',
        'canCreateWithAI',
        'canAccessAccountLibrary'
    ]);

    const ANONYMOUS_CAPABILITIES = Object.freeze({
        canSaveDurableWork: false,
        canCreateLearner: false,
        canCreateSubject: false,
        canEditSubject: false,
        canCreateWithAI: false,
        canAccessAccountLibrary: false
    });

    const SIGNED_IN_BASELINE = Object.freeze({
        canSaveDurableWork: true,
        canCreateLearner: true,
        canCreateSubject: true,
        canEditSubject: true,
        canCreateWithAI: true,
        canAccessAccountLibrary: true
    });

    const UNKNOWN_ALLOWANCE = Object.freeze({
        status: 'unknown',
        allowed: false,
        remaining: null,
        limit: null,
        resetAt: null
    });

    const ANONYMOUS_ALLOWANCE = Object.freeze({
        status: 'blocked',
        allowed: false,
        remaining: 0,
        limit: null,
        resetAt: null
    });

    const listeners = new Set();

    let state = freezeState({
        ready: false,
        status: 'resolving',
        authenticated: false,
        tier: null,
        capabilities: blockedCapabilities(),
        creationAllowance: UNKNOWN_ALLOWANCE,
        error: null
    });

    let initPromise = null;
    let unsubscribeAccount = null;

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function copyCapabilities(value) {
        const source =
            value && typeof value === 'object' && !Array.isArray(value)
                ? value
                : {};

        return CAPABILITY_NAMES.reduce((next, name) => {
            next[name] = Boolean(source[name]);
            return next;
        }, {});
    }

    function blockedCapabilities() {
        return copyCapabilities(ANONYMOUS_CAPABILITIES);
    }

    function freezeState(nextState) {
        return Object.freeze({
            ...nextState,
            capabilities: Object.freeze(
                copyCapabilities(nextState.capabilities)
            ),
            creationAllowance: Object.freeze({
                ...UNKNOWN_ALLOWANCE,
                ...(nextState.creationAllowance || {})
            })
        });
    }

    function snapshot() {
        return {
            ...state,
            capabilities: copyCapabilities(state.capabilities),
            creationAllowance: {
                ...state.creationAllowance
            }
        };
    }

    function hasOwn(object, key) {
        return Object.prototype.hasOwnProperty.call(object || {}, key);
    }

    function normalizeTier(planCode) {
        return String(planCode || '').trim().toLowerCase() === 'pro'
            ? 'pro'
            : 'free';
    }

    function normalizeNonNegativeInteger(value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const numeric = Number(value);

        if (!Number.isFinite(numeric) || numeric < 0) {
            return null;
        }

        return Math.floor(numeric);
    }

    function normalizeResetAt(value) {
        const text = String(value || '').trim();
        if (!text) return null;

        const timestamp = Date.parse(text);
        if (!Number.isFinite(timestamp)) return null;

        return new Date(timestamp).toISOString();
    }

    function resolveCapabilities(accountCapabilities) {
        const source =
            accountCapabilities &&
            typeof accountCapabilities === 'object' &&
            !Array.isArray(accountCapabilities)
                ? accountCapabilities
                : {};

        const next = copyCapabilities(SIGNED_IN_BASELINE);

        CAPABILITY_NAMES.forEach(name => {
            if (hasOwn(source, name) && typeof source[name] === 'boolean') {
                next[name] = source[name];
            }
        });

        return next;
    }

    function resolveCreationAllowance(
        accountCapabilities,
        capabilities
    ) {
        const source =
            accountCapabilities &&
            typeof accountCapabilities === 'object' &&
            !Array.isArray(accountCapabilities)
                ? accountCapabilities.creationAllowance
                : null;

        const candidate =
            source && typeof source === 'object' && !Array.isArray(source)
                ? source
                : {};

        let allowed = Boolean(capabilities.canCreateWithAI);
        const remaining = normalizeNonNegativeInteger(candidate.remaining);
        const limit = normalizeNonNegativeInteger(candidate.limit);
        const resetAt = normalizeResetAt(candidate.resetAt);

        if (typeof candidate.allowed === 'boolean') {
            allowed = allowed && candidate.allowed;
        }

        if (remaining === 0) {
            allowed = false;
        }

        let status = allowed ? 'available' : 'blocked';

        if (!allowed && remaining === 0) {
            status = 'exhausted';
        } else if (allowed && remaining !== null) {
            status = 'limited';
        }

        return {
            status,
            allowed,
            remaining,
            limit,
            resetAt
        };
    }

    function stateFromAccount(accountState) {
        const account =
            accountState && typeof accountState === 'object'
                ? accountState
                : {};

        if (!account.ready) {
            return freezeState({
                ready: false,
                status: 'resolving',
                authenticated: Boolean(account.authenticated),
                tier: null,
                capabilities: blockedCapabilities(),
                creationAllowance: UNKNOWN_ALLOWANCE,
                error: null
            });
        }

        if (!account.authenticated) {
            return freezeState({
                ready: true,
                status: 'ready',
                authenticated: false,
                tier: 'anonymous',
                capabilities: ANONYMOUS_CAPABILITIES,
                creationAllowance: ANONYMOUS_ALLOWANCE,
                error: null
            });
        }

        if (!account.entitlementReady) {
            return freezeState({
                ready: false,
                status: 'resolving',
                authenticated: true,
                tier: null,
                capabilities: blockedCapabilities(),
                creationAllowance: UNKNOWN_ALLOWANCE,
                error: null
            });
        }

        if (account.entitlementError) {
            return freezeState({
                ready: false,
                status: 'error',
                authenticated: true,
                tier: null,
                capabilities: blockedCapabilities(),
                creationAllowance: UNKNOWN_ALLOWANCE,
                error: String(account.entitlementError)
            });
        }

        const tier = normalizeTier(account.planCode);
        const capabilities = resolveCapabilities(account.capabilities);
        const creationAllowance = resolveCreationAllowance(
            account.capabilities,
            capabilities
        );

        capabilities.canCreateWithAI = Boolean(
            capabilities.canCreateWithAI && creationAllowance.allowed
        );

        return freezeState({
            ready: true,
            status: 'ready',
            authenticated: true,
            tier,
            capabilities,
            creationAllowance,
            error: null
        });
    }

    function statesMatch(left, right) {
        return (
            left.ready === right.ready &&
            left.status === right.status &&
            left.authenticated === right.authenticated &&
            left.tier === right.tier &&
            left.error === right.error &&
            JSON.stringify(left.capabilities) ===
                JSON.stringify(right.capabilities) &&
            JSON.stringify(left.creationAllowance) ===
                JSON.stringify(right.creationAllowance)
        );
    }

    function publish(nextState) {
        const normalized = freezeState(nextState);
        const changed = !statesMatch(state, normalized);

        state = normalized;

        if (!changed) return;

        const detail = snapshot();

        listeners.forEach(listener => {
            try {
                listener(detail);
            } catch (error) {
                console.error('[AtlasAccess] listener failed:', error);
            }
        });

        try {
            window.dispatchEvent(
                new CustomEvent('atlas:access-change', {
                    detail
                })
            );
        } catch {
            // subscribe() remains the non-DOM fallback.
        }
    }

    function syncFromAccount(accountState) {
        publish(stateFromAccount(accountState));
    }

    function bootstrapAnonymous() {
        if (window.AtlasAccount) {
            return snapshot();
        }

        publish(stateFromAccount({
            ready: true,
            authenticated: false
        }));

        return snapshot();
    }

    async function initialize() {
        if (initPromise) return initPromise;

        initPromise = (async () => {
            const Account = window.AtlasAccount;

            if (
                !Account ||
                typeof Account.initialize !== 'function' ||
                typeof Account.subscribe !== 'function'
            ) {
                throw new Error(
                    'AtlasAccess requires AtlasAccount.'
                );
            }

            await Account.initialize();

            if (unsubscribeAccount) {
                unsubscribeAccount();
                unsubscribeAccount = null;
            }

            unsubscribeAccount = Account.subscribe(
                syncFromAccount,
                { immediate: true }
            );

            return snapshot();
        })().catch(error => {
            initPromise = null;
            publish(freezeState({
                ready: false,
                status: 'error',
                authenticated: Boolean(
                    window.AtlasAccount?.getState?.().authenticated
                ),
                tier: null,
                capabilities: blockedCapabilities(),
                creationAllowance: UNKNOWN_ALLOWANCE,
                error: error?.message || String(error)
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
                console.error('[AtlasAccess] listener failed:', error);
            }
        }

        return () => listeners.delete(listener);
    }

    function getCapability(name, fallback = false) {
        const key = String(name || '').trim();

        if (
            !key ||
            !state.ready ||
            !hasOwn(state.capabilities, key)
        ) {
            return fallback;
        }

        return state.capabilities[key];
    }

    function can(name) {
        return Boolean(getCapability(name, false));
    }

    function getCreationAllowance() {
        return clone(state.creationAllowance);
    }

    function destroy() {
        if (unsubscribeAccount) {
            unsubscribeAccount();
            unsubscribeAccount = null;
        }

        listeners.clear();
        initPromise = null;
        state = freezeState({
            ready: false,
            status: 'resolving',
            authenticated: false,
            tier: null,
            capabilities: blockedCapabilities(),
            creationAllowance: UNKNOWN_ALLOWANCE,
            error: null
        });
    }

    window.AtlasAccess = Object.freeze({
        CAPABILITY_NAMES,
        bootstrapAnonymous,
        initialize,
        getState,
        subscribe,
        getCapability,
        can,
        getCreationAllowance,
        destroy
    });

    if (window.AtlasAccount) {
        initialize().catch(error => {
            console.error('[AtlasAccess] initialization failed:', error);
        });
    }
})();
