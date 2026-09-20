/* ============================================================
   ATLAS CAPABILITY GATE
   Shared feature-facing access enforcement boundary.

   AtlasAccess owns semantic access truth.
   AtlasAccountGate owns authentication UI.
   AtlasReturnIntent owns interrupted-action records.
   This module turns those contracts into one reusable action boundary.

   This module owns:
   - capability checks at action time
   - contextual auth interruption through return intents
   - normalized allowed / auth-required / limited / blocked / resolving /
     unavailable outcomes
   - reliable same-page and cross-page resume publication

   This module does NOT own:
   - first-paint visibility or layout
   - feature-specific action execution
   - persistence authority
   - billing or server-side quota enforcement
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasCapabilityGate) return;

    const OUTCOMES = Object.freeze({
        ALLOWED: 'allowed',
        AUTH_REQUIRED: 'auth-required',
        LIMITED: 'limited',
        BLOCKED: 'blocked',
        RESOLVING: 'resolving',
        UNAVAILABLE: 'unavailable'
    });

    const RETURN_INTENT_SRC =
        '/shared/atlas-return-intent.js?v=20260917-capability1';
    const ACCOUNT_GATE_SRC =
        '/shared/atlas-account-gate.js?v=20260920-googleauth1';
    const ACCESS_WAIT_MS = 8000;

    let returnIntentPromise = null;
    let accountGatePromise = null;
    let latestResume = null;
    let crossPageResumeHydrated = false;
    let emittingResumeEvent = false;

    const resumeSubscribers = new Set();

    function existingScriptFor(src) {
        const pathname = String(src || '').split('?')[0];

        return Array.from(document.scripts || []).find(script => {
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

    function loadScript(src, marker, globalName) {
        if (globalName && window[globalName]) {
            return Promise.resolve(window[globalName]);
        }

        return new Promise((resolve, reject) => {
            const existing = existingScriptFor(src);

            const complete = () => {
                if (!globalName || window[globalName]) {
                    resolve(
                        globalName
                            ? window[globalName]
                            : true
                    );
                    return;
                }

                reject(new Error(
                    `${globalName} did not initialize.`
                ));
            };

            const fail = () => reject(new Error(
                `Atlas runtime failed to load: ${src}`
            ));

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

            if (marker) {
                script.setAttribute(marker, 'true');
            }

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

    function ensureReturnIntent() {
        if (window.AtlasReturnIntent) {
            return Promise.resolve(window.AtlasReturnIntent);
        }

        if (returnIntentPromise) return returnIntentPromise;

        returnIntentPromise = loadScript(
            RETURN_INTENT_SRC,
            'data-atlas-return-intent-runtime',
            'AtlasReturnIntent'
        ).catch(error => {
            returnIntentPromise = null;
            throw error;
        });

        return returnIntentPromise;
    }

    function ensureAccountGate() {
        if (window.AtlasAccountGate) {
            return Promise.resolve(window.AtlasAccountGate);
        }

        if (accountGatePromise) return accountGatePromise;

        accountGatePromise = loadScript(
            ACCOUNT_GATE_SRC,
            'data-atlas-account-gate-runtime',
            'AtlasAccountGate'
        ).catch(error => {
            accountGatePromise = null;
            throw error;
        });

        return accountGatePromise;
    }

    function knownCapability(name) {
        const value = String(name || '').trim();
        const names = window.AtlasAccess?.CAPABILITY_NAMES;

        if (
            !value ||
            !Array.isArray(names) ||
            !names.includes(value)
        ) {
            throw new Error(
                'Atlas capability gate requires a supported capability.'
            );
        }

        return value;
    }

    function snapshotAccess() {
        return window.AtlasAccess?.getState?.() || null;
    }

    function waitForAccessResolution(timeoutMs = ACCESS_WAIT_MS) {
        const Access = window.AtlasAccess;

        if (
            !Access ||
            typeof Access.subscribe !== 'function'
        ) {
            return Promise.resolve(snapshotAccess());
        }

        return new Promise(resolve => {
            let settled = false;
            let unsubscribe = null;
            let timer = null;

            const finish = value => {
                if (settled) return;
                settled = true;

                if (timer !== null) {
                    window.clearTimeout(timer);
                }

                unsubscribe?.();
                resolve(value || snapshotAccess());
            };

            timer = window.setTimeout(
                () => finish(snapshotAccess()),
                timeoutMs
            );

            unsubscribe = Access.subscribe(
                next => {
                    if (
                        next?.ready ||
                        next?.status === 'error'
                    ) {
                        finish(next);
                    }
                },
                { immediate: false }
            );
        });
    }

    async function resolveAccessState() {
        let error = null;

        try {
            if (
                window.AtlasAccessBootstrap &&
                typeof window.AtlasAccessBootstrap.initialize === 'function'
            ) {
                await window.AtlasAccessBootstrap.initialize();
            } else if (
                window.AtlasAccess &&
                typeof window.AtlasAccess.initialize === 'function'
            ) {
                await window.AtlasAccess.initialize();
            }
        } catch (caught) {
            error = caught;
        }

        let state = snapshotAccess();

        if (
            state &&
            !state.ready &&
            state.status !== 'error'
        ) {
            state = await waitForAccessResolution();
        }

        return {
            state,
            error
        };
    }

    function outcome(
        name,
        capability,
        access,
        extra = {}
    ) {
        return Object.freeze({
            outcome: name,
            capability,
            access: access || null,
            ...extra
        });
    }

    async function interruptForAuthentication({
        action,
        destination,
        context,
        trigger,
        mode
    }) {
        let intent = null;

        try {
            const ReturnIntent = await ensureReturnIntent();
            const suppliedContext =
                context &&
                typeof context === 'object' &&
                !Array.isArray(context)
                    ? context
                    : {};

            intent = ReturnIntent.create({
                action,
                destination,
                context: suppliedContext
            });

            const Gate = await ensureAccountGate();

            await Gate.open({
                mode,
                trigger,
                returnIntentId: intent.id
            });

            return {
                intent,
                error: null
            };
        } catch (error) {
            if (intent?.id) {
                try {
                    window.AtlasReturnIntent?.discard?.(
                        intent.id
                    );
                } catch { }
            }

            return {
                intent: null,
                error
            };
        }
    }

    async function requireAuthentication({
        action = 'open-gated-content',
        destination = window.location.href,
        context = {},
        trigger = null,
        mode = 'sign-in'
    } = {}) {
        const resolved = await resolveAccessState();
        const access = resolved.state;

        if (!access) {
            return outcome(
                OUTCOMES.UNAVAILABLE,
                null,
                null,
                {
                    error:
                        resolved.error?.message ||
                        'Atlas access state is unavailable.'
                }
            );
        }

        if (access.status === 'error') {
            return outcome(
                OUTCOMES.UNAVAILABLE,
                null,
                access,
                {
                    error:
                        access.error ||
                        resolved.error?.message ||
                        'Atlas access state is unavailable.'
                }
            );
        }

        if (!access.ready) {
            return outcome(
                OUTCOMES.RESOLVING,
                null,
                access
            );
        }

        if (access.authenticated) {
            return outcome(
                OUTCOMES.ALLOWED,
                null,
                access
            );
        }

        const interruption =
            await interruptForAuthentication({
                action,
                destination,
                context,
                trigger,
                mode
            });

        if (interruption.error) {
            return outcome(
                OUTCOMES.UNAVAILABLE,
                null,
                access,
                {
                    error:
                        interruption.error?.message ||
                        String(interruption.error)
                }
            );
        }

        return outcome(
            OUTCOMES.AUTH_REQUIRED,
            null,
            access,
            {
                returnIntentId:
                    interruption.intent.id
            }
        );
    }

    async function requireCapability(
        name,
        {
            action = 'capability',
            destination = window.location.href,
            context = {},
            trigger = null,
            mode = 'sign-in'
        } = {}
    ) {
        const capability = knownCapability(name);
        const resolved = await resolveAccessState();
        const access = resolved.state;

        if (!access) {
            const result = outcome(
                OUTCOMES.UNAVAILABLE,
                capability,
                null,
                {
                    error:
                        resolved.error?.message ||
                        'Atlas access state is unavailable.'
                }
            );

            window.AtlasAnalytics?.capabilityFailure({
                action,
                capability,
                outcome: result.outcome,
                reason: 'access_state'
            });

            return result;
        }

        if (access.status === 'error') {
            const result = outcome(
                OUTCOMES.UNAVAILABLE,
                capability,
                access,
                {
                    error:
                        access.error ||
                        resolved.error?.message ||
                        'Atlas access state is unavailable.'
                }
            );

            window.AtlasAnalytics?.capabilityFailure({
                action,
                capability,
                outcome: result.outcome,
                reason: 'access_error'
            });

            return result;
        }

        if (!access.ready) {
            return outcome(
                OUTCOMES.RESOLVING,
                capability,
                access
            );
        }

        const capabilityAllowed =
            window.AtlasAccess.can(capability);

        if (
            capabilityAllowed &&
            capability !== 'canCreateWithAI'
        ) {
            return outcome(
                OUTCOMES.ALLOWED,
                capability,
                access
            );
        }

        if (!access.authenticated) {
            const suppliedContext =
                context &&
                typeof context === 'object' &&
                !Array.isArray(context)
                    ? context
                    : {};

            const interruption =
                await interruptForAuthentication({
                    action,
                    destination,
                    context: {
                        ...suppliedContext,
                        capability
                    },
                    trigger,
                    mode
                });

            if (interruption.error) {
                const result = outcome(
                    OUTCOMES.UNAVAILABLE,
                    capability,
                    access,
                    {
                        error:
                            interruption.error?.message ||
                            String(interruption.error)
                    }
                );

                window.AtlasAnalytics?.capabilityFailure({
                    action,
                    capability,
                    outcome: result.outcome,
                    reason: 'auth_interruption'
                });

                return result;
            }

            return outcome(
                OUTCOMES.AUTH_REQUIRED,
                capability,
                access,
                {
                    returnIntentId:
                        interruption.intent.id
                }
            );
        }

        const allowance =
            capability === 'canCreateWithAI'
                ? window.AtlasAccess.getCreationAllowance?.() || null
                : null;

        if (
            allowance &&
            allowance.status === 'exhausted'
        ) {
            const result = outcome(
                OUTCOMES.LIMITED,
                capability,
                access,
                {
                    reason: allowance.status,
                    allowance
                }
            );

            window.AtlasAnalytics?.capabilityFailure({
                action,
                capability,
                outcome: result.outcome,
                reason: allowance.status
            });

            return result;
        }

        if (
            capabilityAllowed &&
            (!allowance || allowance.allowed !== false)
        ) {
            return outcome(
                OUTCOMES.ALLOWED,
                capability,
                access,
                allowance ? { allowance } : {}
            );
        }

        const result = outcome(
            OUTCOMES.BLOCKED,
            capability,
            access,
            {
                reason:
                    allowance?.status ||
                    'blocked',
                allowance
            }
        );

        window.AtlasAnalytics?.capabilityFailure({
            action,
            capability,
            outcome: result.outcome,
            reason:
                allowance?.status ||
                'blocked'
        });

        return result;
    }

    function publishResume(intent, source) {
        if (!intent) return null;

        latestResume = Object.freeze({
            intent,
            source: String(source || 'unknown')
        });

        resumeSubscribers.forEach(record => {
            if (
                record.action &&
                record.action !== intent.action
            ) {
                return;
            }

            try {
                record.listener(latestResume);
            } catch (error) {
                console.error(
                    '[AtlasCapabilityGate] resume subscriber failed:',
                    error
                );
            }
        });

        return latestResume;
    }

    function emitResume(intent, source) {
        const published = publishResume(intent, source);
        if (!published) return null;

        emittingResumeEvent = true;

        try {
            window.dispatchEvent(new CustomEvent(
                'atlas:return-intent-resume',
                {
                    detail: {
                        intent,
                        source
                    }
                }
            ));
        } catch { }

        emittingResumeEvent = false;
        return published;
    }

    function subscribeResume(
        listener,
        {
            action = null,
            replay = true
        } = {}
    ) {
        if (typeof listener !== 'function') {
            return () => {};
        }

        const record = {
            action:
                action === null
                    ? null
                    : String(action || '').trim(),
            listener
        };

        resumeSubscribers.add(record);

        if (
            replay &&
            latestResume &&
            (
                !record.action ||
                record.action === latestResume.intent.action
            )
        ) {
            window.setTimeout(() => {
                if (!resumeSubscribers.has(record)) return;

                try {
                    listener(latestResume);
                } catch (error) {
                    console.error(
                        '[AtlasCapabilityGate] resume subscriber failed:',
                        error
                    );
                }
            }, 0);
        }

        return () => resumeSubscribers.delete(record);
    }

    async function hydrateQueuedResume() {
        if (crossPageResumeHydrated) {
            return latestResume;
        }

        crossPageResumeHydrated = true;

        try {
            const ReturnIntent = await ensureReturnIntent();
            const intent = ReturnIntent.consumeQueuedResume?.(
                window.location.href
            );

            if (!intent) return latestResume;

            return emitResume(
                intent,
                'account-confirmation'
            );
        } catch (error) {
            console.error(
                '[AtlasCapabilityGate] queued resume failed:',
                error
            );
            return null;
        }
    }

    function scheduleQueuedResumeHydration() {
        if (document.readyState === 'complete') {
            window.setTimeout(
                () => void hydrateQueuedResume(),
                0
            );
            return;
        }

        window.addEventListener(
            'load',
            () => void hydrateQueuedResume(),
            { once: true }
        );
    }

    window.addEventListener(
        'atlas:return-intent-resume',
        event => {
            if (emittingResumeEvent) return;

            publishResume(
                event?.detail?.intent || null,
                event?.detail?.source || 'account-gate'
            );
        }
    );

    window.AtlasCapabilityGate = Object.freeze({
        OUTCOMES,
        requireAuthentication,
        requireCapability,
        subscribeResume,
        hydrateQueuedResume,
        getLastResume() {
            return latestResume;
        }
    });

    scheduleQueuedResumeHydration();
})();
