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
        '/shared/atlas-paddle-config.js?v=20260924-live1';
    const STYLE_ID =
        'atlas-pro-checkout-success-style';
    const SCROLL_STYLE_ID =
        'atlas-pro-checkout-scroll-lock-style';
    const LOADING_STYLE_ID =
        'atlas-pro-checkout-loading-style';
    const CHECKOUT_SHELL_STYLE_ID =
        'atlas-pro-checkout-shell-style';
    const PRODUCT_ICON_URL =
        'https://pub-13d93423376c4822820635b75cfbea29.r2.dev/images/Atlas%20Logo.png';

    let paddlePromise = null;
    let configPromise = null;
    let paddleReady = false;
    let activeCheckout = null;
    let activationPromise = null;
    let successLayer = null;
    let checkoutLoadingLayer = null;
    let checkoutLoadingTimer = null;
    let checkoutRevealTimer = null;
    let checkoutShell = null;

    function setCanonicalCheckoutTitle() {
        if (!activeCheckout) {
            return;
        }

        if (
            typeof activeCheckout
                .previousDocumentTitle !==
                'string'
        ) {
            activeCheckout
                .previousDocumentTitle =
                    document.title;
        }

        document.title = 'Atlas';
    }

    function restoreCheckoutTitle() {
        if (
            !activeCheckout ||
            typeof activeCheckout
                .previousDocumentTitle !==
                'string'
        ) {
            return;
        }

        document.title =
            activeCheckout
                .previousDocumentTitle;

        activeCheckout
            .previousDocumentTitle = null;
    }

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

    function ensureCheckoutScrollStyles() {
        if (
            document.getElementById(
                SCROLL_STYLE_ID
            )
        ) {
            return;
        }

        const style =
            document.createElement('style');

        style.id = SCROLL_STYLE_ID;
        style.textContent = `
            html[data-atlas-pro-checkout-open="true"] {
                overflow: hidden !important;
                overscroll-behavior: none;
                scrollbar-gutter: auto !important;
            }

            html[data-atlas-pro-checkout-open="true"] body {
                overflow: hidden !important;
                overscroll-behavior: none;
            }
        `;

        document.head.appendChild(style);
    }

    function setCheckoutScrollLocked(
        locked
    ) {
        if (locked) {
            ensureCheckoutScrollStyles();
            document.documentElement.dataset
                .atlasProCheckoutOpen =
                    'true';
            return;
        }

        delete document.documentElement
            .dataset.atlasProCheckoutOpen;
    }

    function ensureCheckoutLoadingStyles() {
        if (
            document.getElementById(
                LOADING_STYLE_ID
            )
        ) {
            return;
        }

        const style =
            document.createElement('style');

        style.id = LOADING_STYLE_ID;
        style.textContent = `
            .atlas-pro-checkout-loading {
                position: fixed;
                inset: 0;
                width: 100vw;
                max-width: none;
                height: 100dvh;
                max-height: none;
                margin: 0;
                padding: 0;
                border: 0;
                background:
                    var(--atlas-modal-surface, var(--surface, #fffdf9));
                color:
                    var(--atlas-modal-heading, var(--text-heading, #211f1b));
            }

            .atlas-pro-checkout-loading[open] {
                display: grid;
                place-items: center;
            }

            .atlas-pro-checkout-loading::backdrop {
                background:
                    var(--atlas-modal-surface, var(--surface, #fffdf9));
            }

            .atlas-pro-checkout-loading-content {
                display: grid;
                justify-items: center;
                gap: 18px;
                padding: 32px 24px;
                text-align: center;
                font-family: "DM Sans", system-ui, sans-serif;
            }

            .atlas-pro-checkout-loading-brand {
                margin: 0;
                font-family: "DM Serif Display", Georgia, serif;
                font-size: 2rem;
                font-weight: 400;
                color:
                    var(--atlas-modal-heading, var(--text-heading, #211f1b));
            }

            .atlas-pro-checkout-loading-brand span {
                color:
                    var(--atlas-modal-accent, var(--accent, #59617d));
            }

            .atlas-pro-checkout-loading-spinner {
                width: 42px;
                height: 42px;
                border: 3px solid
                    var(--atlas-modal-border, var(--border-subtle, rgba(49, 45, 38, .16)));
                border-top-color:
                    var(--atlas-modal-accent, var(--accent, #59617d));
                border-radius: 50%;
                animation:
                    atlas-pro-checkout-loading-spin
                    800ms linear infinite;
            }

            .atlas-pro-checkout-loading-copy {
                margin: 0;
                color:
                    var(--atlas-modal-muted, var(--text-muted, #7b7469));
                font-size: .9rem;
            }

            @keyframes atlas-pro-checkout-loading-spin {
                to {
                    transform: rotate(360deg);
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .atlas-pro-checkout-loading-spinner {
                    animation: none;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function ensureCheckoutLoadingLayer() {
        if (checkoutLoadingLayer) {
            return checkoutLoadingLayer;
        }

        ensureCheckoutLoadingStyles();

        checkoutLoadingLayer =
            document.createElement('dialog');

        checkoutLoadingLayer.className =
            'atlas-pro-checkout-loading';
        checkoutLoadingLayer.setAttribute(
            'aria-label',
            'Preparing secure checkout'
        );
        checkoutLoadingLayer.innerHTML = `
            <div class="atlas-pro-checkout-loading-content">
                <p class="atlas-pro-checkout-loading-brand">
                    Atlas<span>.</span>
                </p>
                <div
                    class="atlas-pro-checkout-loading-spinner"
                    aria-hidden="true"
                ></div>
                <p class="atlas-pro-checkout-loading-copy">
                    Preparing secure checkout…
                </p>
            </div>
        `;

        checkoutLoadingLayer.addEventListener(
            'cancel',
            event => {
                event.preventDefault();
            }
        );

        document.body.appendChild(
            checkoutLoadingLayer
        );

        return checkoutLoadingLayer;
    }

    function clearCheckoutLoadingTimers() {
        if (checkoutLoadingTimer) {
            window.clearTimeout(
                checkoutLoadingTimer
            );
            checkoutLoadingTimer = null;
        }

        if (checkoutRevealTimer) {
            window.clearTimeout(
                checkoutRevealTimer
            );
            checkoutRevealTimer = null;
        }

    }

    function hideCheckoutLoading() {
        clearCheckoutLoadingTimers();

        if (!checkoutLoadingLayer) {
            return;
        }

        if (
            typeof checkoutLoadingLayer.close ===
                'function' &&
            checkoutLoadingLayer.open
        ) {
            checkoutLoadingLayer.close();
            return;
        }

        checkoutLoadingLayer.removeAttribute(
            'open'
        );
    }

    function isMobileCheckoutPresentation() {
        return Boolean(
            window.matchMedia?.(
                '(max-width: 760px)'
            ).matches ||
            window.matchMedia?.(
                '(hover: none) and (pointer: coarse)'
            ).matches
        );
    }

    function checkoutFrameHeight() {
        return isMobileCheckoutPresentation()
            ? '620'
            : '700';
    }

    function ensureCheckoutShellStyles() {
        if (
            document.getElementById(
                CHECKOUT_SHELL_STYLE_ID
            )
        ) {
            return;
        }

        const style =
            document.createElement('style');

        style.id = CHECKOUT_SHELL_STYLE_ID;
        style.textContent = `
            .atlas-pro-checkout-shell[hidden] {
                display: none !important;
            }

            .atlas-pro-checkout-shell {
                position: fixed;
                inset: 0;
                z-index: 2147483645;
                display: flex;
                min-width: 0;
                flex-direction: column;
                overflow: hidden;
                background:
                    var(--atlas-modal-surface, var(--surface, #fffdf9));
                color:
                    var(--atlas-modal-heading, var(--text-heading, #211f1b));
                font-family:
                    "DM Sans", system-ui, sans-serif;
            }

            .atlas-pro-checkout-head {
                min-height: 72px;
                display: flex;
                flex: 0 0 auto;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                padding: 14px 28px;
                border-bottom: 1px solid
                    var(--atlas-modal-border, var(--border-subtle, rgba(49, 45, 38, .16)));
                background:
                    var(--atlas-modal-surface, var(--surface, #fffdf9));
            }

            .atlas-pro-checkout-identity {
                min-width: 0;
                display: flex;
                align-items: baseline;
                gap: 10px;
            }

            .atlas-pro-checkout-brand {
                margin: 0;
                font-family:
                    "DM Serif Display", Georgia, serif;
                font-size: 1.65rem;
                line-height: 1;
                font-weight: 400;
                color:
                    var(--atlas-modal-heading, var(--text-heading, #211f1b));
            }

            .atlas-pro-checkout-brand span {
                color:
                    var(--atlas-modal-accent, var(--accent, #59617d));
            }

            .atlas-pro-checkout-context {
                color:
                    var(--atlas-modal-muted, var(--text-muted, #7b7469));
                font-size: .82rem;
                font-weight: 600;
                white-space: nowrap;
            }

            .atlas-pro-checkout-close {
                min-height: 42px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                flex: 0 0 auto;
                padding: 0 14px;
                border: 1px solid
                    var(--atlas-modal-border, var(--border-subtle, rgba(49, 45, 38, .16)));
                border-radius: 12px;
                background:
                    var(--atlas-modal-control-surface, transparent);
                color:
                    var(--atlas-modal-heading, var(--text-heading, #211f1b));
                cursor: pointer;
                font: 600 .82rem/1 "DM Sans", system-ui, sans-serif;
            }

            .atlas-pro-checkout-close:hover,
            .atlas-pro-checkout-close:focus-visible {
                border-color:
                    var(--atlas-modal-border-strong, rgba(49, 45, 38, .26));
                background:
                    var(--atlas-modal-control-hover, rgba(49, 45, 38, .05));
            }

            .atlas-pro-checkout-body {
                min-height: 0;
                flex: 1 1 auto;
                overflow-y: auto;
                overscroll-behavior: contain;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: thin;
                scrollbar-color:
                    rgba(var(--accent-rgb), .46) transparent;
                background:
                    var(--atlas-modal-surface-low, var(--surface-muted, #f5f1e9));
            }

            .atlas-pro-checkout-body::-webkit-scrollbar {
                width: 10px;
            }

            .atlas-pro-checkout-body::-webkit-scrollbar-track {
                background: transparent;
            }

            .atlas-pro-checkout-body::-webkit-scrollbar-thumb {
                border: 2px solid transparent;
                border-radius: 999px;
                background:
                    rgba(var(--accent-rgb), .46);
                background-clip: padding-box;
            }

            .atlas-pro-checkout-layout {
                width: min(calc(100% - 56px), 1120px);
                margin: 0 auto;
                padding: 44px 0 56px;
                display: grid;
                grid-template-columns:
                    minmax(300px, 1fr)
                    minmax(0, 520px);
                gap: clamp(40px, 5vw, 64px);
                align-items: start;
            }

            .atlas-pro-checkout-summary {
                position: sticky;
                top: 32px;
                padding: 10px 0;
            }

            .atlas-pro-checkout-product {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .atlas-pro-checkout-product-icon {
                width: 68px;
                height: 68px;
                flex: 0 0 auto;
                border-radius: 18px;
                object-fit: cover;
                box-shadow:
                    0 10px 24px rgba(31, 28, 23, .12);
            }

            .atlas-pro-checkout-product-label {
                margin: 0 0 3px;
                color:
                    var(--atlas-modal-muted, var(--text-muted, #7b7469));
                font-size: .72rem;
                font-weight: 800;
                letter-spacing: .12em;
                text-transform: uppercase;
            }

            .atlas-pro-checkout-product-name {
                margin: 0;
                font-family:
                    "DM Serif Display", Georgia, serif;
                font-size: clamp(2rem, 3vw, 2.7rem);
                line-height: 1.04;
                font-weight: 400;
                color:
                    var(--atlas-modal-heading, var(--text-heading, #211f1b));
            }

            .atlas-pro-checkout-price {
                margin: 30px 0 0;
                font-size: 1.05rem;
                font-weight: 700;
                color:
                    var(--atlas-modal-heading, var(--text-heading, #211f1b));
            }

            .atlas-pro-checkout-price strong {
                font-family:
                    "DM Serif Display", Georgia, serif;
                font-size: 2rem;
                font-weight: 400;
            }

            .atlas-pro-checkout-allowance {
                max-width: 340px;
                margin: 10px 0 0;
                color:
                    var(--atlas-modal-muted, var(--text-muted, #7b7469));
                font-size: .94rem;
                line-height: 1.55;
            }

            .atlas-pro-checkout-value {
                max-width: 360px;
                margin: 32px 0 0;
                padding-top: 26px;
                border-top: 1px solid
                    var(--atlas-modal-border, var(--border-subtle, rgba(49, 45, 38, .16)));
            }

            .atlas-pro-checkout-value strong {
                display: block;
                margin-bottom: 8px;
                font-family:
                    "DM Serif Display", Georgia, serif;
                font-size: 1.45rem;
                font-weight: 400;
                line-height: 1.15;
            }

            .atlas-pro-checkout-value span {
                color:
                    var(--atlas-modal-muted, var(--text-muted, #7b7469));
                font-size: .9rem;
                line-height: 1.55;
            }

            .atlas-pro-checkout-stage {
                width: min(100%, 520px);
                min-width: 0;
                justify-self: end;
                overflow: hidden;
                border: 1px solid
                    var(--atlas-modal-border, var(--border-subtle, rgba(49, 45, 38, .14)));
                border-radius: 20px;
                background:
                    var(--atlas-modal-surface, var(--surface, #fffdf9));
                box-shadow:
                    0 18px 48px rgba(31, 28, 23, .09);
            }

            .atlas-pro-checkout-inline-frame {
                width: 100%;
                min-height: 0;
                background:
                    var(--atlas-modal-surface, var(--surface, #fffdf9));
            }

            .atlas-pro-checkout-legal {
                width: min(calc(100% - 56px), 1120px);
                margin: -18px auto 0;
                padding: 0 0 28px;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 14px;
                color:
                    var(--atlas-modal-muted, var(--text-muted, #7b7469));
                font-size: .74rem;
            }

            .atlas-pro-checkout-legal a {
                color: inherit;
                text-decoration: none;
            }

            .atlas-pro-checkout-legal a:hover,
            .atlas-pro-checkout-legal a:focus-visible {
                color:
                    var(--atlas-modal-heading, var(--text-heading, #211f1b));
            }

            @media (max-width: 920px) {
                .atlas-pro-checkout-layout {
                    width: min(calc(100% - 32px), 620px);
                    padding: 30px 0 42px;
                    display: block;
                }

                .atlas-pro-checkout-summary {
                    display: none;
                }

                .atlas-pro-checkout-stage {
                    width: min(100%, 520px);
                    margin: 0 auto;
                    justify-self: auto;
                }

                .atlas-pro-checkout-legal {
                    width: min(calc(100% - 32px), 520px);
                    margin-top: -10px;
                    justify-content: center;
                }
            }

            @media (max-width: 760px) {
                .atlas-pro-checkout-head {
                    min-height: 64px;
                    padding:
                        max(10px, env(safe-area-inset-top))
                        14px
                        10px;
                    gap: 16px;
                }

                .atlas-pro-checkout-brand {
                    font-size: 1.45rem;
                }

                .atlas-pro-checkout-context {
                    font-size: .78rem;
                }

                .atlas-pro-checkout-close {
                    min-height: 40px;
                    padding: 0 12px;
                    font-size: .78rem;
                }

                .atlas-pro-checkout-layout {
                    width: 100%;
                    padding: 12px 10px 28px;
                    display: block;
                }

                .atlas-pro-checkout-summary {
                    display: none;
                }

                .atlas-pro-checkout-stage {
                    width: min(100%, 520px);
                    margin: 0 auto;
                    border-radius: 18px;
                    box-shadow:
                        0 10px 34px rgba(31, 28, 23, .08);
                }
            }
        `;

        document.head.appendChild(style);
    }

    function ensureCheckoutShell() {
        if (checkoutShell) {
            return checkoutShell;
        }

        ensureCheckoutShellStyles();

        checkoutShell =
            document.createElement('section');

        checkoutShell.className =
            'atlas-pro-checkout-shell';
        checkoutShell.hidden = true;
        checkoutShell.setAttribute(
            'aria-label',
            'Atlas Pro checkout'
        );
        checkoutShell.innerHTML = `
            <header class="atlas-pro-checkout-head">
                <div class="atlas-pro-checkout-identity">
                    <p class="atlas-pro-checkout-brand">
                        Atlas<span>.</span>
                    </p>
                    <span class="atlas-pro-checkout-context">
                        Secure checkout
                    </span>
                </div>
                <button
                    class="atlas-pro-checkout-close"
                    type="button"
                    aria-label="Close checkout"
                    data-atlas-pro-checkout-close
                >
                    Back to Atlas
                </button>
            </header>
            <div class="atlas-pro-checkout-body">
                <div class="atlas-pro-checkout-layout">
                    <aside class="atlas-pro-checkout-summary">
                        <div class="atlas-pro-checkout-product">
                            <img
                                class="atlas-pro-checkout-product-icon"
                                src="${PRODUCT_ICON_URL}"
                                alt=""
                            >
                            <div>
                                <p class="atlas-pro-checkout-product-label">
                                    Your plan
                                </p>
                                <h2 class="atlas-pro-checkout-product-name">
                                    Atlas Pro
                                </h2>
                            </div>
                        </div>
                        <p class="atlas-pro-checkout-price">
                            <strong>US$12</strong> / month
                        </p>
                        <p class="atlas-pro-checkout-allowance">
                            100 fresh subject creations each billing month.
                        </p>
                        <p class="atlas-pro-checkout-value">
                            <strong>Make the lesson feel made for them.</strong>
                            <span>
                                Personal lessons with lighter preparation.
                                Your saved work and learner continuity stay with your account.
                            </span>
                        </p>
                    </aside>
                    <div class="atlas-pro-checkout-stage">
                        <div class="atlas-pro-checkout-inline-frame"></div>
                    </div>
                </div>
                <nav
                    class="atlas-pro-checkout-legal"
                    aria-label="Atlas checkout policies"
                >
                    <a
                        href="/privacy/"
                        target="_blank"
                        rel="noopener"
                    >Privacy</a>
                    <a
                        href="/terms/"
                        target="_blank"
                        rel="noopener"
                    >Terms</a>
                    <a
                        href="/refunds/"
                        target="_blank"
                        rel="noopener"
                    >Refunds</a>
                </nav>
            </div>
        `;

        checkoutShell
            .querySelector(
                '[data-atlas-pro-checkout-close]'
            )
            ?.addEventListener(
                'click',
                () => {
                    try {
                        window.Paddle
                            ?.Checkout
                            ?.close?.();
                    } catch {
                        hideCheckoutShell();
                        hideCheckoutLoading();
                        setCheckoutScrollLocked(
                            false
                        );
                    }
                }
            );

        document.body.appendChild(
            checkoutShell
        );

        return checkoutShell;
    }

    function showCheckoutShell() {
        const shell =
            ensureCheckoutShell();

        shell.hidden = false;
    }

    function hideCheckoutShell() {
        if (!checkoutShell) {
            return;
        }

        checkoutShell.hidden = true;
    }

    function waitForCheckoutPresentation() {
        const delay =
            activeCheckout?.inlineMobile
                ? 1600
                : 700;

        return new Promise(resolve => {
            checkoutRevealTimer =
                window.setTimeout(
                    () => resolve(true),
                    delay
                );
        });
    }

    async function revealCheckoutWhenReady() {
        const ready =
            await waitForCheckoutPresentation();

        if (
            !ready ||
            !activeCheckout ||
            activeCheckout.presentationSettled
        ) {
            return;
        }

        settleCheckoutPresentation(
            true
        );
        hideCheckoutLoading();
    }

    function settleCheckoutPresentation(
        presented
    ) {
        if (
            !activeCheckout ||
            activeCheckout.presentationSettled
        ) {
            return;
        }

        activeCheckout.presentationSettled =
            true;

        const resolve =
            activeCheckout.resolvePresentation;

        activeCheckout.resolvePresentation =
            null;

        resolve?.(Boolean(presented));
    }

    function showCheckoutLoading() {
        const layer =
            ensureCheckoutLoadingLayer();

        if (
            typeof layer.showModal ===
                'function'
        ) {
            if (!layer.open) {
                layer.showModal();
            }
        } else {
            layer.setAttribute(
                'open',
                ''
            );
        }

        clearCheckoutLoadingTimers();

        checkoutLoadingTimer =
            window.setTimeout(
                () => {
                    if (
                        !activeCheckout ||
                        activeCheckout.presentationSettled
                    ) {
                        return;
                    }

                    notifyStatus(
                        'Checkout took too long to load. Please try again.',
                        'error'
                    );
                    settleCheckoutPresentation(
                        false
                    );

                    try {
                        window.Paddle
                            ?.Checkout
                            ?.close?.();
                    } catch { }

                    hideCheckoutLoading();
                    setCheckoutScrollLocked(
                        false
                    );
                },
                20000
            );
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
                    const checkout =
                        activeCheckout;

                    successLayer.hidden = true;
                    setCheckoutScrollLocked(
                        false
                    );

                    activeCheckout = null;

                    if (
                        typeof checkout
                            ?.onContinue ===
                            'function'
                    ) {
                        checkout.onContinue();
                        return;
                    }

                    checkout?.trigger
                        ?.focus?.();
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
        button.textContent =
            clean(
                activeCheckout?.continueLabel
            ) || 'Continue';
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
            name === 'checkout.loaded'
        ) {
            void revealCheckoutWhenReady();
            return;
        }

        if (
            name ===
            'checkout.completed'
        ) {
            settleCheckoutPresentation(
                true
            );
            hideCheckoutLoading();
            hideCheckoutShell();
            restoreCheckoutTitle();
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
            settleCheckoutPresentation(
                false
            );
            hideCheckoutLoading();
            hideCheckoutShell();
            restoreCheckoutTitle();
            setCheckoutScrollLocked(
                false
            );

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
            const presentationPending =
                Boolean(
                    activeCheckout &&
                    !activeCheckout
                        .presentationSettled
                );

            notifyStatus(
                presentationPending
                    ? 'Checkout could not load. Please try again.'
                    : 'Checkout could not be completed. Please try again.',
                'error'
            );

            if (presentationPending) {
                settleCheckoutPresentation(
                    false
                );
                hideCheckoutLoading();
                hideCheckoutShell();
                restoreCheckoutTitle();
                setCheckoutScrollLocked(
                    false
                );
            }
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
        onActivated = null,
        continueLabel = 'Continue',
        onContinue = null
    } = {}) {
        activeCheckout = {
            source:
                clean(source) ||
                'contextual-upgrade',
            trigger,
            onStatus,
            onActivated,
            continueLabel:
                clean(continueLabel) ||
                'Continue',
            onContinue,
            completed: false,
            presentationSettled: false,
            resolvePresentation: null,
            inlineMobile:
                isMobileCheckoutPresentation()
        };

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
            setCanonicalCheckoutTitle();
            await initializePaddle();

            const config =
                window.AtlasPaddleConfig;

            notifyStatus('');

            const presentationPromise =
                new Promise(resolve => {
                    activeCheckout
                        .resolvePresentation =
                            resolve;
                });

            showCheckoutShell();

            showCheckoutLoading();

            setCheckoutScrollLocked(
                true
            );

            const checkoutTheme =
                document
                    .documentElement
                    .dataset
                    .theme ===
                'night'
                    ? 'dark'
                    : 'light';

            const checkoutSettings = {
                displayMode:
                    'inline',
                variant:
                    'one-page',
                theme:
                    checkoutTheme,
                showAddTaxId:
                    false,
                showAddDiscounts:
                    false,
                frameTarget:
                    'atlas-pro-checkout-inline-frame',
                frameInitialHeight:
                    checkoutFrameHeight(),
                frameStyle:
                    'width:100%;min-width:312px;background-color:transparent;border:none;'
            };

            window.Paddle
                .Checkout
                .open({
                    settings:
                        checkoutSettings,
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

            return await presentationPromise;
        } catch (error) {
            settleCheckoutPresentation(
                false
            );
            hideCheckoutLoading();
            hideCheckoutShell();
            restoreCheckoutTitle();
            setCheckoutScrollLocked(
                false
            );

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

    async function previewPrice() {
        await initializePaddle();

        const config =
            window.AtlasPaddleConfig;

        const result =
            await window.Paddle.PricePreview({
                items: [
                    {
                        priceId:
                            config.prices.proMonthly,
                        quantity: 1
                    }
                ]
            });

        const item =
            result?.data
                ?.details
                ?.lineItems?.[0];

        return clean(
            item?.formattedTotals?.total
        ) || null;
    }

    window.AtlasProCheckout =
        Object.freeze({
            open,
            previewPrice
        });
})();
