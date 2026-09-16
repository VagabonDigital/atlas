/* ============================================================
   ATLAS ACCOUNT CHROME
   Shared public account entry for Atlas product hubs + Inside Atlas.

   AtlasAccess owns semantic access state.
   AtlasAccountGate owns authentication/account UI.
   This module owns only persistent account-entry chrome and its rendering.

   Hub contract:
   - anonymous: visible Sign in action
   - authenticated: compact account icon in the same utility zone
   - Subjects/Games: no injected account chrome

   Inside Atlas contract:
   - anonymous: Explore Atlas + Sign in + Create free account
   - authenticated: Explore Atlas + compact account icon
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasAccountChrome) return;

    const STYLE_HREF =
        '/shared/atlas-account-chrome.css?v=20260916-accountchrome1';
    const GATE_SRC =
        '/shared/atlas-account-gate.js?v=20260916-accountgate1';

    let gatePromise = null;
    let accessUnsubscribe = null;
    let initialized = false;

    const ACCOUNT_ICON = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="5.1" r="2.45" stroke="currentColor" stroke-width="1.3" />
            <path d="M3.25 13c0-2.35 2.1-4.2 4.75-4.2s4.75 1.85 4.75 4.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
        </svg>
    `;

    const SIGN_IN_ICON = `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="4.35" r="2.05" stroke="currentColor" stroke-width="1.2" />
            <path d="M2.9 11.7c0-2 1.8-3.55 4.1-3.55s4.1 1.55 4.1 3.55" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </svg>
    `;

    function ensureStyles() {
        if (document.querySelector('link[data-atlas-account-chrome-styles]')) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = STYLE_HREF;
        link.setAttribute('data-atlas-account-chrome-styles', 'true');
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

    function ensureGate() {
        if (window.AtlasAccountGate) {
            return Promise.resolve(window.AtlasAccountGate);
        }

        if (gatePromise) return gatePromise;

        gatePromise = new Promise((resolve, reject) => {
            const existing = existingScriptFor(GATE_SRC);

            function complete() {
                if (window.AtlasAccountGate) {
                    resolve(window.AtlasAccountGate);
                } else {
                    gatePromise = null;
                    reject(new Error('Atlas account UI could not initialize.'));
                }
            }

            if (existing) {
                existing.addEventListener('load', complete, { once: true });
                existing.addEventListener('error', reject, { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = GATE_SRC;
            script.async = false;
            script.setAttribute('data-atlas-account-gate-runtime', 'true');
            script.addEventListener('load', complete, { once: true });
            script.addEventListener('error', () => {
                gatePromise = null;
                reject(new Error('Atlas account UI could not load.'));
            }, { once: true });
            document.head.appendChild(script);
        });

        return gatePromise;
    }

    function getPresentation(accessState) {
        const access =
            accessState && typeof accessState === 'object'
                ? accessState
                : {};

        if (access.authenticated) {
            return {
                kind: 'account',
                label: 'Account',
                title: 'Atlas account',
                disabled: false
            };
        }

        if (access.ready && access.tier === 'anonymous') {
            return {
                kind: 'sign-in',
                label: 'Sign in',
                title: 'Sign in to Atlas',
                disabled: false
            };
        }

        return {
            kind: 'pending',
            label: 'Account',
            title: 'Checking Atlas account',
            disabled: true
        };
    }

    function createHubControl(variant) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `atlas-account-control atlas-account-control--${variant}`;
        button.setAttribute('data-atlas-account-control', variant);
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-expanded', 'false');
        button.addEventListener('click', () => handleAccountAction(button));
        return button;
    }

    function renderHubControl(button, presentation) {
        if (!button) return;

        button.dataset.accountState = presentation.kind;
        button.disabled = presentation.disabled;
        button.title = presentation.title;
        button.setAttribute('aria-label', presentation.title);

        if (presentation.kind === 'sign-in') {
            button.innerHTML = `${SIGN_IN_ICON}<span>Sign in</span>`;
            return;
        }

        button.innerHTML = ACCOUNT_ICON;
    }

    function mountHubChrome() {
        const body = document.body;
        if (!body || body.dataset.atlasSurface !== 'hub') return [];

        const mounted = [];
        const desktopActions = document.querySelector('.spine-actions');

        if (desktopActions) {
            let control = desktopActions.querySelector(
                '[data-atlas-account-control="desktop"]'
            );

            if (!control) {
                control = createHubControl('desktop');
                desktopActions.appendChild(control);
            }

            mounted.push(control);
        }

        const mobileActions = document.querySelector('.mobile-header-actions');

        if (mobileActions) {
            let control = mobileActions.querySelector(
                '[data-atlas-account-control="mobile"]'
            );

            if (!control) {
                control = createHubControl('mobile');
                const menuButton = Array.from(
                    mobileActions.querySelectorAll('button')
                ).find(button => button.getAttribute('aria-label') === 'Menu');

                if (menuButton) {
                    mobileActions.insertBefore(control, menuButton);
                } else {
                    mobileActions.appendChild(control);
                }
            }

            mounted.push(control);
        }

        return mounted;
    }

    function createInsideAtlasEntry(container) {
        if (!container || container.dataset.accountEntryReady === 'true') {
            return;
        }

        container.classList.add('atlas-inside-account-entry');
        container.innerHTML = `
            <a class="atlas-inside-account-action atlas-inside-account-explore" href="/">Explore Atlas</a>
            <button class="atlas-inside-account-action atlas-inside-account-sign-in" type="button" data-atlas-inside-sign-in>
                Sign in
            </button>
            <button class="atlas-inside-account-action atlas-inside-account-create" type="button" data-atlas-inside-create>
                <span class="atlas-account-create-label-full">Create free account</span>
                <span class="atlas-account-create-label-short">Create account</span>
            </button>
            <button class="atlas-inside-account-action atlas-inside-account-icon" type="button" data-atlas-inside-account aria-haspopup="dialog" aria-expanded="false" aria-label="Atlas account" title="Atlas account" hidden>
                ${ACCOUNT_ICON}
            </button>
        `;

        container.querySelector('[data-atlas-inside-sign-in]')
            ?.addEventListener('click', event => {
                handleSignIn(event.currentTarget);
            });

        container.querySelector('[data-atlas-inside-create]')
            ?.addEventListener('click', event => {
                handleCreateAccount(event.currentTarget);
            });

        container.querySelector('[data-atlas-inside-account]')
            ?.addEventListener('click', event => {
                handleAccountAction(event.currentTarget);
            });

        container.dataset.accountEntryReady = 'true';
    }

    function mountInsideAtlasChrome() {
        const body = document.body;
        if (!body || body.dataset.atlasSurface !== 'inside-atlas') return [];

        const entries = Array.from(
            document.querySelectorAll('[data-atlas-account-entry]')
        );

        entries.forEach(createInsideAtlasEntry);
        return entries;
    }

    function renderInsideAtlasEntry(container, presentation) {
        if (!container) return;

        const signIn = container.querySelector('[data-atlas-inside-sign-in]');
        const create = container.querySelector('[data-atlas-inside-create]');
        const account = container.querySelector('[data-atlas-inside-account]');
        const isAccount = presentation.kind === 'account';
        const isPending = presentation.kind === 'pending';

        if (signIn) {
            signIn.hidden = isAccount;
            signIn.disabled = isPending;
        }

        if (create) {
            create.hidden = isAccount;
            create.disabled = isPending;
        }

        if (account) {
            account.hidden = !isAccount;
            account.disabled = false;
        }

        container.dataset.accountState = presentation.kind;
        document.body?.setAttribute('data-atlas-account-ready', 'true');
    }

    function renderAll(accessState) {
        const presentation = getPresentation(accessState);

        document.querySelectorAll('[data-atlas-account-control]')
            .forEach(button => renderHubControl(button, presentation));

        document.querySelectorAll('[data-atlas-account-entry]')
            .forEach(container => renderInsideAtlasEntry(
                container,
                presentation
            ));

        return presentation;
    }

    async function handleSignIn(trigger) {
        try {
            const Gate = await ensureGate();
            await Gate.openSignIn(trigger);
        } catch (error) {
            console.error('[AtlasAccountChrome] sign-in UI failed:', error);
        }
    }

    async function handleCreateAccount(trigger) {
        try {
            const Gate = await ensureGate();
            await Gate.openCreateAccount(trigger);
        } catch (error) {
            console.error('[AtlasAccountChrome] create-account UI failed:', error);
        }
    }

    async function handleAccountAction(trigger) {
        const presentation = getPresentation(
            window.AtlasAccess?.getState?.() || null
        );

        if (presentation.kind === 'account') {
            try {
                const Gate = await ensureGate();
                await Gate.openAccountMenu(trigger);
            } catch (error) {
                console.error('[AtlasAccountChrome] account menu failed:', error);
            }
            return;
        }

        if (presentation.kind === 'sign-in') {
            await handleSignIn(trigger);
        }
    }

    async function initialize() {
        if (initialized) {
            return renderAll(window.AtlasAccess?.getState?.() || null);
        }

        initialized = true;
        ensureStyles();
        mountHubChrome();
        mountInsideAtlasChrome();
        renderAll(window.AtlasAccess?.getState?.() || null);

        const Bootstrap = window.AtlasAccessBootstrap;

        if (!Bootstrap || typeof Bootstrap.initialize !== 'function') {
            console.error(
                '[AtlasAccountChrome] AtlasAccessBootstrap is required.'
            );
            return getPresentation(null);
        }

        try {
            await Bootstrap.initialize();
        } catch (error) {
            console.error(
                '[AtlasAccountChrome] access initialization failed:',
                error
            );
            return renderAll(window.AtlasAccess?.getState?.() || null);
        }

        if (accessUnsubscribe) {
            accessUnsubscribe();
            accessUnsubscribe = null;
        }

        if (window.AtlasAccess?.subscribe) {
            accessUnsubscribe = window.AtlasAccess.subscribe(
                renderAll,
                { immediate: true }
            );
        } else {
            renderAll(window.AtlasAccess?.getState?.() || null);
        }

        return getPresentation(
            window.AtlasAccess?.getState?.() || null
        );
    }

    window.AtlasAccountChrome = Object.freeze({
        initialize,
        getPresentation,
        render: renderAll
    });

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener(
                'DOMContentLoaded',
                () => initialize(),
                { once: true }
            );
        } else {
            initialize();
        }
    }
})();
