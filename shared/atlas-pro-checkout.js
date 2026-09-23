/* ============================================================
   ATLAS PRO CHECKOUT
   Shared contextual Atlas Pro checkout launcher.

   Pricing explains Pro.
   This module handles purchase intent without routing through Pricing.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasProCheckout) return;

    const PADDLE_SRC =
        'https://cdn.paddle.com/paddle/v2/paddle.js';
    const CONFIG_SRC =
        '/shared/atlas-paddle-config.js?v=20260921-sandbox1';
    const STYLE_ID =
        'atlas-pro-checkout-success-style';

    let paddlePromise = null;
    let configPromise = null;
    let paddleReady = false;
    let activeCheckout = null;
    let activationPromise = null;
    let successLayer = null;

    function clean(value) {
        return String(value || '').trim();
    }

    function loadScript(src, marker, ready) {
        if (typeof ready === 'function' && ready()) {
            return Promise.resolve(true);
        }

        const existing =
            marker
                ? document.querySelector(
                    `script[${marker}]`
                  )
                : Array.from(document.scripts || [])
                    .find(script => {
                        try {
                            return new URL(
                                script.src,
                                window.location.href
                            ).href ===
                                new URL(
                                    src,
                                    window.location.href
                                ).href;
                        } catch {
                            return false;
                        }
                    });

        if (existing) {
            return new Promise(
                (resolve, reject) => {
                    if (
                        typeof ready === 'function' &&
                        ready()
                    ) {
                        resolve(true);
                        return;
                    }

                    existing.addEventListener(
                        'load',
                        () => resolve(true),
                        { once: true }
                    );
                    existing.addEventListener(
                        'error',
                        reject,
                        { once: true }
                    );
                }
            );
        }

        return new Promise(
            (resolve, reject) => {
                const script =
                    document.createElement('script');

                script.src = src;
                script.async = false;

                if (marker) {
                    script.setAttribute(
                        marker,
                        'true'
                    );
                }

                script.addEventListener(
                    'load',
                    () => resolve(true),
                    { once: true }
                );
                script.addEventListener(
                    'error',
                    reject,
                    { once: true }
                );

                document.head.appendChild(
                    script
                );
            }
        );
    }

    function ensureConfig() {
        if (window.AtlasPaddleConfig) {
            return Promise.resolve(
                window.AtlasPaddleConfig
            );
        }

        if (configPromise) {
            return configPromise;
        }

        configPromise =
            loadScript(
                CONFIG_SRC,
                'data-atlas-paddle-config',
                () => Boolean(
                    window.AtlasPaddleConfig
                )
            )
                .then(() => {
                    if (!window.AtlasPaddleConfig) {
                        throw new Error(
                            'Atlas checkout configuration is unavailable.'
                        );
                    }

                    return window.AtlasPaddleConfig;
                })
                .catch(error => {
                    configPromise = null;
                    throw error;
                });

        return configPromise;
    }

    function ensurePaddle() {
        if (window.Paddle) {
            return Promise.resolve(
                window.Paddle
            );
        }

        if (paddlePromise) {
            return paddlePromise;
        }

        paddlePromise =
            loadScript(
                PADDLE_SRC,
                'data-atlas-paddle-runtime',
                () => Boolean(
                    window.Paddle
                )
            )
                .then(() => {
                    if (!window.Paddle) {
                        throw new Error(
                            'Secure checkout could not load.'
                        );
                    }

                    return window.Paddle;
                })
                .catch(error => {
                    paddlePromise = null;
                    throw error;
                });

        return paddlePromise;
    }

    function ensureSuccessStyles() {
        if (
            document.getElementById(
                STYLE_ID
            )
        ) {
            return;
        }

        const style =
            document.createElement('style');

        style.id = STYLE_ID;
        style.textContent = `
            .atlas-pro-checkout-success[hidden] {
                display: none;
            }

            .atlas-pro-checkout-success {
                position: fixed;
                inset: 0;
                z-index: 2147483646;
                display: grid;
                place-items: center;
                padding: 24px;
                background: rgba(24, 23, 20, .38);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
            }

            .atlas-pro-checkout-success-card {
                width: min(430px, 100%);
                padding: 34px 30px 28px;
                border: 1px solid rgba(49,45,38,.14);
                border-radius: 22px;
                background: #fffdf9;
                box-shadow: 0 28px 80px rgba(31,28,23,.22);
                color: #2b2926;
                text-align: center;
                font-family: "DM Sans", system-ui, sans-serif;
            }

            html[data-theme="night"]
                .atlas-pro-checkout-success-card {
                border-color: rgba(235,233,228,.14);
                background: #252826;
                color: #ebe9e4;
            }

            .atlas-pro-checkout-success-mark {
                width: 58px;
                height: 58px;
                display: grid;
                place-items: center;
                margin: 0 auto 18px;
                border-radius: 50%;
                background: rgba(79,118,100,.12);
                color: #4f7664;
                font-size: 1.8rem;
                font-weight: 700;
            }

            html[data-theme="night"]
                .atlas-pro-checkout-success-mark {
                background: rgba(155,196,173,.14);
                color: #9bc4ad;
            }

            .atlas-pro-checkout-success-title {
                margin: 0;
                font-family: "DM Serif Display", Georgia, serif;
                font-size: 1.8rem;
                font-weight: 400;
                line-height: 1.15;
            }

            .atlas-pro-checkout-success-copy {
                margin: 12px 0 0;
                color: #625c53;
                font-size: .98rem;
                line-height: 1.55;
            }

            html[data-theme="night"]
                .atlas-pro-checkout-success-copy {
                color: #c7c2b8;
            }

            .atlas-pro-checkout-success-action {
                width: 100%;
                min-height: 46px;
                margin-top: 24px;
                border: 0;
                border-radius: 11px;
                background: #4d7184;
                color: #fff;
                font: 600 .95rem "DM Sans", system-ui, sans-serif;
                cursor: pointer;
            }

            .atlas-pro-checkout-success-action[hidden] {
                display: none;
            }
        `;

        document.head.appendChild(style);
    }

    function ensureSuccessLayer() {
        if (successLayer) {
            return successLayer;
        }

        ensureSuccessStyles();

        successLayer =
            document.createElement('div');

        successLayer.className =
            'atlas-pro-checkout-success';
        successLayer.hidden = true;
        successLayer.innerHTML = `
            <section
                class="atlas-pro-checkout-success-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="atlas-pro-checkout-success-title"
            >
                <div
                    class="atlas-pro-checkout-success-mark"
                    aria-hidden="true"
                >✓</div>
                <h2
                    id="atlas-pro-checkout-success-title"
                    class="atlas-pro-checkout-success-title"
                ></h2>
                <p
                    class="atlas-pro-checkout-success-copy"
                    data-atlas-pro-checkout-success-copy
                ></p>
                <button
                    class="atlas-pro-checkout-success-action"
                    type="button"
                    data-atlas-pro-checkout-success-action
                    hidden
                >
                    Continue
                </button>
            </section>
        `;

        successLayer
            .querySelector(
                '[data-atlas-pro-checkout-success-action]'
            )
            ?.addEventListener(
                'click',
                () => {
                    successLayer.hidden = true;
                    activeCheckout?.trigger
                        ?.focus?.();
                    activeCheckout = null;
                }
            );

        document.body.appendChild(
            successLayer
        );

        return successLayer;
    }

    function showSuccessState({
        title,
        copy,
        action = false
    }) {
        const layer =
            ensureSuccessLayer();

        layer.querySelector(
            '.atlas-pro-checkout-success-title'
        ).textContent = title;

        layer.querySelector(
            '[data-atlas-pro-checkout-success-copy]'
        ).textContent = copy;

        const button =
            layer.querySelector(
                '[data-atlas-pro-checkout-success-action]'
            );

        button.hidden = !action;
        layer.hidden = false;

        if (action) {
            window.setTimeout(
                () => button.focus(),
                0
            );
        }
    }

    function notifyStatus(
        message,
        kind = 'info'
    ) {
        activeCheckout?.onStatus?.(
            message,
            kind
        );
    }

    function delay(ms) {
        return new Promise(resolve =>
            window.setTimeout(
                resolve,
                ms
            )
        );
    }

    async function waitForActivation() {
        if (activationPromise) {
            return activationPromise;
        }

        activationPromise =
            (async () => {
                const account =
                    window.AtlasAccount
                        ?.getState?.() ||
                    null;

                if (
                    !account?.authenticated ||
                    !account?.userId
                ) {
                    showSuccessState({
                        title:
                            'Payment received',
                        copy:
                            'Your payment was completed. Sign in again if Atlas Pro does not appear on your account.',
                        action: true
                    });
                    return false;
                }

                const startedAt = Date.now();
                const deadline =
                    startedAt +
                    2 * 60 * 1000;

                showSuccessState({
                    title:
                        'Payment received',
                    copy:
                        'Activating Atlas Pro…'
                });

                while (
                    Date.now() < deadline
                ) {
                    try {
                        await window.AtlasAccount
                            ?.refreshEntitlement?.(
                                account.userId
                            );

                        const access =
                            window.AtlasAccess
                                ?.getState?.();

                        if (
                            access?.ready &&
                            access.tier === 'pro'
                        ) {
                            notifyStatus(
                                'Atlas Pro is active.',
                                'success'
                            );

                            showSuccessState({
                                title:
                                    'Welcome to Atlas Pro',
                                copy:
                                    'You now have 100 fresh subject creations each billing month.',
                                action: true
                            });

                            window.dispatchEvent(
                                new CustomEvent(
                                    'atlas:pro-checkout-activated',
                                    {
                                        detail: {
                                            source:
                                                activeCheckout?.source ||
                                                'contextual-upgrade'
                                        }
                                    }
                                )
                            );

                            activeCheckout
                                ?.onActivated?.(
                                    access
                                );

                            return true;
                        }
                    } catch (error) {
                        console.warn(
                            '[AtlasProCheckout] Pro activation check failed',
                            error
                        );
                    }

                    if (
                        Date.now() -
                            startedAt >=
                        15000
                    ) {
                        showSuccessState({
                            title:
                                'Payment received',
                            copy:
                                'Atlas Pro is still activating. This can take a moment.'
                        });
                    }

                    await delay(
                        Date.now() -
                            startedAt <
                            15000
                            ? 1200
                            : 3000
                    );
                }

                showSuccessState({
                    title:
                        'Payment received',
                    copy:
                        'Atlas Pro is still activating. Refresh Atlas in a moment if your plan has not updated yet.',
                    action: true
                });

                return false;
            })()
                .finally(() => {
                    activationPromise = null;
                });

        return activationPromise;
    }

    async function handlePaddleEvent(event) {
        const name =
            clean(event?.name);

        if (
            name ===
            'checkout.completed'
        ) {
            if (activeCheckout) {
                activeCheckout.completed = true;
            }

            try {
                window.Paddle
                    ?.Checkout
                    ?.close?.();
            } catch { }

            void waitForActivation();
            return;
        }

        if (
            name === 'checkout.closed'
        ) {
            if (
                activeCheckout &&
                !activeCheckout.completed
            ) {
                const trigger =
                    activeCheckout.trigger;

                activeCheckout = null;

                window.setTimeout(
                    () => trigger?.focus?.(),
                    0
                );
            }

            return;
        }

        if (
            name === 'checkout.error'
        ) {
            notifyStatus(
                'Checkout could not be completed. Please try again.',
                'error'
            );
        }
    }

    async function initializePaddle() {
        if (paddleReady) {
            return true;
        }

        const [Paddle, config] =
            await Promise.all([
                ensurePaddle(),
                ensureConfig()
            ]);

        if (
            !Paddle ||
            !config?.clientToken ||
            !config?.prices
                ?.proMonthly
        ) {
            throw new Error(
                'Atlas checkout configuration is unavailable.'
            );
        }

        if (
            config.environment ===
            'sandbox'
        ) {
            Paddle.Environment.set(
                'sandbox'
            );
        }

        Paddle.Initialize({
            token: config.clientToken,
            eventCallback:
                handlePaddleEvent
        });

        paddleReady = true;
        return true;
    }

    async function open({
        source =
            'contextual-upgrade',
        trigger = null,
        onStatus = null,
        onActivated = null
    } = {}) {
        activeCheckout = {
            source:
                clean(source) ||
                'contextual-upgrade',
            trigger,
            onStatus,
            onActivated,
            completed: false
        };

        notifyStatus(
            'Opening secure checkout…'
        );

        let access = null;

        try {
            access =
                await window
                    .AtlasAccessBootstrap
                    ?.initialize?.();
        } catch (error) {
            console.error(
                '[AtlasProCheckout] Atlas access bootstrap failed',
                error
            );
        }

        const account =
            window.AtlasAccount
                ?.getState?.() ||
            null;

        if (
            !account?.authenticated ||
            !account?.userId
        ) {
            notifyStatus(
                'Sign in before upgrading to Atlas Pro.',
                'error'
            );
            return false;
        }

        try {
            await window.AtlasAccount
                ?.refreshEntitlement?.(
                    account.userId
                );

            access =
                window.AtlasAccess
                    ?.getState?.() ||
                access;
        } catch (error) {
            console.error(
                '[AtlasProCheckout] Current plan check failed',
                error
            );

            notifyStatus(
                'Atlas could not confirm your current plan. Please try again.',
                'error'
            );
            return false;
        }

        if (
            !access?.ready ||
            !access?.authenticated
        ) {
            notifyStatus(
                'Atlas could not confirm your current plan. Please try again.',
                'error'
            );
            return false;
        }

        if (
            access.tier === 'pro'
        ) {
            window.location.assign(
                '/account/subscription/'
            );
            return true;
        }

        try {
            await initializePaddle();

            const config =
                window.AtlasPaddleConfig;

            notifyStatus('');

            window.Paddle
                .Checkout
                .open({
                    settings: {
                        displayMode:
                            'overlay',
                        variant:
                            'one-page',
                        theme:
                            document
                                .documentElement
                                .dataset
                                .theme ===
                            'night'
                                ? 'dark'
                                : 'light'
                    },
                    items: [
                        {
                            priceId:
                                config
                                    .prices
                                    .proMonthly,
                            quantity: 1
                        }
                    ],
                    customer: {
                        email:
                            account.email
                    },
                    customData: {
                        atlas_user_id:
                            account.userId,
                        atlas_plan_code:
                            'pro',
                        atlas_checkout_environment:
                            config.environment,
                        atlas_checkout_source:
                            activeCheckout.source
                    }
                });

            return true;
        } catch (error) {
            console.error(
                '[AtlasProCheckout] Checkout failed',
                error
            );

            notifyStatus(
                'Checkout could not open. Please try again.',
                'error'
            );

            return false;
        }
    }

    window.AtlasProCheckout =
        Object.freeze({
            open
        });
})();
