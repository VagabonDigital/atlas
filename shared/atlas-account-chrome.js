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
        '/shared/atlas-account-chrome.css?v=20260921-insideheader1';
    const GATE_STYLE_HREF =
        '/shared/atlas-account-gate.css?v=20260922-allowance1';
    const GATE_SRC =
        '/shared/atlas-account-gate.js?v=20260922-allowance1';

    let gatePromise = null;
    let gateStylePromise = null;
    let accessUnsubscribe = null;
    let initialized = false;

    const ACCOUNT_ICON = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.15" stroke="currentColor" stroke-width="1.15" />
            <circle cx="8" cy="6.05" r="1.95" stroke="currentColor" stroke-width="1.15" />
            <path d="M4.65 11.85c.52-1.72 1.8-2.68 3.35-2.68s2.83.96 3.35 2.68" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" />
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

    function ensureGateStyles() {
        if (gateStylePromise) return gateStylePromise;

        gateStylePromise = new Promise((resolve, reject) => {
            let link = document.querySelector(
                'link[data-atlas-account-gate-styles]'
            );

            function complete() {
                resolve(true);
            }

            function fail() {
                gateStylePromise = null;
                reject(new Error('Atlas account styles could not load.'));
            }

            if (link) {
                try {
                    if (link.sheet) {
                        complete();
                        return;
                    }
                } catch { }

                link.addEventListener('load', complete, { once: true });
                link.addEventListener('error', fail, { once: true });
                return;
            }

            link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = GATE_STYLE_HREF;
            link.setAttribute('data-atlas-account-gate-styles', 'true');
            link.addEventListener('load', complete, { once: true });
            link.addEventListener('error', fail, { once: true });
            document.head.appendChild(link);
        });

        return gateStylePromise;
    }

    function ensureGate() {
        if (window.AtlasAccountGate) {
            return ensureGateStyles().then(() => window.AtlasAccountGate);
        }

        if (gatePromise) return gatePromise;

        gatePromise = ensureGateStyles().then(() => new Promise((resolve, reject) => {
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
        })).catch(error => {
            gatePromise = null;
            throw error;
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
        const nativeClass = variant === 'mobile'
            ? 'mobile-header-btn'
            : 'spine-btn';

        button.type = 'button';
        button.className = `${nativeClass} atlas-account-control atlas-account-control--${variant}`;
        button.setAttribute('data-atlas-account-control', variant);
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-expanded', 'false');
        button.addEventListener('click', () => handleAccountAction(button));
        button.dataset.accountControlReady = 'true';
        return button;
    }

    function renderHubControl(button, presentation) {
        if (!button) return;

        button.dataset.accountState = presentation.kind;
        button.disabled = presentation.disabled;
        button.title = presentation.title;
        button.setAttribute('aria-label', presentation.title);

        if (presentation.kind === 'pending') return;

        if (presentation.kind === 'sign-in') {
            button.innerHTML = '<span>Sign in</span>';
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

            if (control.dataset.accountControlReady !== 'true') { control.addEventListener('click', () => handleAccountAction(control)); control.dataset.accountControlReady = 'true'; }
            mounted.push(control);
        }

        const mobileActions = document.querySelector('.mobile-header-actions');

        if (mobileActions) {
            let control = mobileActions.querySelector(
                '[data-atlas-account-control="mobile"]'
            );

            if (!control) {
                control = createHubControl('mobile');
                const searchButton =
                    mobileActions.querySelector(
                        '[data-atlas-search]'
                    );

                const menuButton = Array.from(
                    mobileActions.querySelectorAll('button')
                ).find(
                    button =>
                        button.getAttribute(
                            'aria-label'
                        ) === 'Menu'
                );

                if (searchButton) {
                    mobileActions.insertBefore(
                        control,
                        searchButton
                    );
                } else if (menuButton) {
                    mobileActions.insertBefore(
                        control,
                        menuButton
                    );
                } else {
                    mobileActions.appendChild(control);
                }
            }

            if (control.dataset.accountControlReady !== 'true') { control.addEventListener('click', () => handleAccountAction(control)); control.dataset.accountControlReady = 'true'; }
            mounted.push(control);
        }

        return mounted;
    }

    function createInsideAtlasEntry(container) {
        if (!container) return;

        container.classList.add('atlas-inside-account-entry');

        if (!container.querySelector('[data-atlas-inside-account]')) {
            container.innerHTML = `
            <a class="atlas-inside-account-action atlas-inside-account-explore" href="/?entry=product" data-atlas-product-entry>Explore Atlas</a>
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
        }

        if (container.dataset.accountEntryReady === 'true') return;

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
        const pendingAnonymous =
            isPending &&
            document.documentElement.dataset.atlasAccountHint === 'anonymous';

        if (signIn) {
            signIn.hidden = isAccount || (isPending && !pendingAnonymous);
            signIn.disabled = false;
        }

        if (create) {
            create.hidden = isAccount || (isPending && !pendingAnonymous);
            create.disabled = false;
        }

        if (account) {
            account.hidden = presentation.kind === 'sign-in' || pendingAnonymous;
            account.disabled = false;
            account.title = isPending
                ? 'Checking Atlas account'
                : 'Atlas account';
            account.setAttribute(
                'aria-label',
                isPending ? 'Checking Atlas account' : 'Atlas account'
            );
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
            const gateState = Gate.getState?.() || {};

            if (gateState.gateOpen && gateState.gateMode === 'sign-in') {
                Gate.close();
                return;
            }

            await Gate.openSignIn(trigger);
        } catch (error) {
            console.error('[AtlasAccountChrome] sign-in UI failed:', error);
        }
    }

    async function handleCreateAccount(trigger) {
        try {
            const Gate = await ensureGate();
            const gateState = Gate.getState?.() || {};

            if (gateState.gateOpen && gateState.gateMode === 'create') {
                Gate.close();
                return;
            }

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
                const gateState = Gate.getState?.() || {};

                if (gateState.menuOpen) {
                    Gate.closeAccountMenu();
                    return;
                }

                if (gateState.gateOpen) {
                    Gate.close();
                    return;
                }

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

        const presentation =
            getPresentation(
                window.AtlasAccess?.getState?.() || null
            );

        if (presentation.kind === 'sign-in') {
            void ensureGate()
                .then(Gate =>
                    Gate.prewarm?.()
                )
                .catch(error => {
                    console.error(
                        '[AtlasAccountChrome] account prewarm failed:',
                        error
                    );
                });
        }

        return presentation;
    }

    window.AtlasAccountChrome = Object.freeze({
        initialize,
        getPresentation,
        render: renderAll
    });

    function surfaceMountReady() {
        const body = document.body;
        if (!body) return false;

        if (body.dataset.atlasSurface === 'hub') {
            return Boolean(
                document.querySelector('.spine-actions') ||
                document.querySelector('.mobile-header-actions')
            );
        }

        if (body.dataset.atlasSurface === 'inside-atlas') {
            return Boolean(
                document.querySelector('[data-atlas-account-entry]')
            );
        }

        return true;
    }

    function startWhenMountReady() {
        if (surfaceMountReady()) {
            initialize();
            return;
        }

        if (typeof MutationObserver !== 'function') {
            document.addEventListener(
                'DOMContentLoaded',
                () => initialize(),
                { once: true }
            );
            return;
        }

        const observer = new MutationObserver(() => {
            if (!surfaceMountReady()) return;
            observer.disconnect();
            initialize();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    if (typeof document !== 'undefined') {
        startWhenMountReady();
    }
})();
