/* ============================================================
   ATLAS ACCOUNT GATE
   Reusable authentication gate + signed-in account menu.

   AtlasAccess owns semantic access state.
   AtlasAccount owns account lifecycle.
   AtlasAccessBootstrap owns loading the heavy auth stack on demand.
   AtlasReturnIntent owns temporary interrupted-action records.

   This module owns same-page authentication resume publication only.

   This module does NOT own:
   - header placement
   - cross-page confirmation/deep-link return routing
   - feature interception
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasAccountGate) return;

    const STYLE_HREF =
        '/shared/atlas-account-gate.css?v=20260916-accountgate2';
    const RETURN_INTENT_SRC =
        '/shared/atlas-return-intent.js?v=20260916-returnintent1';
    const FEEDBACK_SRC =
        '/shared/atlas-feedback.js?v=20260918-publicentry1';

    let gateLayer = null;
    let accountMenu = null;
    let previousFocus = null;
    let activeTrigger = null;
    let menuAnchor = null;
    let busy = false;
    let returnIntentPromise = null;
    let feedbackPromise = null;
    let activeReturnIntentId = null;

    const state = {
        gateOpen: false,
        gateMode: null,
        menuOpen: false
    };

    function snapshot() {
        return { ...state };
    }

    function focusWithoutScroll(target) {
        if (!target || typeof target.focus !== 'function') return;

        try {
            target.focus({ preventScroll: true });
        } catch {
            target.focus();
        }
    }

    function ensureStyles() {
        if (
            document.querySelector(
                'link[data-atlas-account-gate-styles]'
            )
        ) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = STYLE_HREF;
        link.setAttribute('data-atlas-account-gate-styles', 'true');
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

    function ensureReturnIntent() {
        if (window.AtlasReturnIntent) {
            return Promise.resolve(window.AtlasReturnIntent);
        }

        if (returnIntentPromise) return returnIntentPromise;

        returnIntentPromise = new Promise((resolve, reject) => {
            const existing = existingScriptFor(RETURN_INTENT_SRC);

            function complete() {
                if (window.AtlasReturnIntent) {
                    resolve(window.AtlasReturnIntent);
                } else {
                    returnIntentPromise = null;
                    reject(new Error(
                        'Atlas could not preserve what you were doing.'
                    ));
                }
            }

            if (existing) {
                existing.addEventListener('load', complete, { once: true });
                existing.addEventListener(
                    'error',
                    () => {
                        returnIntentPromise = null;
                        reject(new Error(
                            'Atlas could not load return-intent support.'
                        ));
                    },
                    { once: true }
                );
                return;
            }

            const script = document.createElement('script');
            script.src = RETURN_INTENT_SRC;
            script.async = false;
            script.setAttribute(
                'data-atlas-return-intent-runtime',
                'true'
            );
            script.addEventListener('load', complete, { once: true });
            script.addEventListener(
                'error',
                () => {
                    returnIntentPromise = null;
                    reject(new Error(
                        'Atlas could not load return-intent support.'
                    ));
                },
                { once: true }
            );
            document.head.appendChild(script);
        });

        return returnIntentPromise;
    }

    async function bindReturnIntent(returnIntentId) {
        activeReturnIntentId = null;

        const id = String(returnIntentId || '').trim();
        if (!id) return null;

        const ReturnIntent = await ensureReturnIntent();
        const intent = ReturnIntent.get(id);

        if (!intent) {
            throw new Error(
                'That Atlas action can no longer be resumed. Close this window and try the action again.'
            );
        }

        activeReturnIntentId = intent.id;
        return intent;
    }

    async function prepareAccount() {
        if (
            window.AtlasAccessBootstrap &&
            typeof window.AtlasAccessBootstrap.prepareAccount === 'function'
        ) {
            return window.AtlasAccessBootstrap.prepareAccount();
        }

        if (
            window.AtlasAccount &&
            window.AtlasAccess &&
            typeof window.AtlasAccount.initialize === 'function' &&
            typeof window.AtlasAccess.initialize === 'function'
        ) {
            await window.AtlasAccount.initialize();
            await window.AtlasAccess.initialize();
            return {
                account: window.AtlasAccount.getState?.() || null,
                access: window.AtlasAccess.getState?.() || null
            };
        }

        throw new Error(
            'Atlas account support is not available on this surface.'
        );
    }

    function ensureFeedback() {
        if (window.AtlasFeedback) {
            return Promise.resolve(
                window.AtlasFeedback
            );
        }

        if (feedbackPromise) {
            return feedbackPromise;
        }

        feedbackPromise =
            new Promise((resolve, reject) => {
                const existing =
                    existingScriptFor(
                        FEEDBACK_SRC
                    );

                function complete() {
                    if (window.AtlasFeedback) {
                        resolve(
                            window.AtlasFeedback
                        );
                    } else {
                        feedbackPromise = null;
                        reject(
                            new Error(
                                'Atlas messaging could not initialize.'
                            )
                        );
                    }
                }

                if (existing) {
                    existing.addEventListener(
                        'load',
                        complete,
                        { once: true }
                    );
                    existing.addEventListener(
                        'error',
                        reject,
                        { once: true }
                    );
                    return;
                }

                const script =
                    document.createElement(
                        'script'
                    );

                script.src = FEEDBACK_SRC;
                script.async = false;

                script.addEventListener(
                    'load',
                    complete,
                    { once: true }
                );

                script.addEventListener(
                    'error',
                    () => {
                        feedbackPromise = null;
                        reject(
                            new Error(
                                'Atlas messaging could not load.'
                            )
                        );
                    },
                    { once: true }
                );

                document.head.appendChild(
                    script
                );
            });

        return feedbackPromise;
    }

    async function openFeedbackFromAccount() {
        closeMenu();

        try {
            const Feedback =
                await ensureFeedback();

            Feedback.open();
        } catch (error) {
            console.error(
                '[AtlasAccountGate] feedback UI failed:',
                error
            );
        }
    }


    function humanizeError(error) {
        const message = String(error?.message || error || '').trim();
        const lower = message.toLowerCase();

        if (
            lower.includes('invalid login credentials') ||
            lower.includes('invalid email or password')
        ) {
            return 'That email or password is incorrect.';
        }

        if (
            lower.includes('email not confirmed') ||
            lower.includes('email_not_confirmed')
        ) {
            return 'Confirm your email before signing in.';
        }

        if (
            lower.includes('already registered') ||
            lower.includes('user already registered')
        ) {
            return 'An account already exists for that email. Try signing in.';
        }

        if (
            lower.includes('email rate limit exceeded') ||
            lower.includes('email rate limit')
        ) {
            return 'Too many account emails have been sent. Please try again shortly.';
        }

        if (lower.includes('password') && lower.includes('8')) {
            return 'Use a password with at least 8 characters.';
        }

        if (lower.includes('network') || lower.includes('fetch')) {
            return 'Atlas could not reach the account service. Check your connection and try again.';
        }

        return message || 'Atlas could not complete that account action. Please try again.';
    }

    function passwordVisibilityIcon(visible) {
        return visible
            ? `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2.2 10s2.8-4.2 7.8-4.2 7.8 4.2 7.8 4.2-2.8 4.2-7.8 4.2S2.2 10 2.2 10Z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="10" cy="10" r="2.1" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M4 4l12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`
            : `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2.2 10s2.8-4.2 7.8-4.2 7.8 4.2 7.8 4.2-2.8 4.2-7.8 4.2S2.2 10 2.2 10Z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="10" cy="10" r="2.1" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
    }

    function installPasswordVisibilityToggles(root) {
        root?.querySelectorAll('input[type="password"]').forEach(input => {
            if (input.closest('.atlas-account-password-field')) return;
            const wrapper = document.createElement('div');
            wrapper.className = 'atlas-account-password-field';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'atlas-account-password-toggle';
            button.setAttribute('aria-label', 'Show password');
            button.setAttribute('aria-pressed', 'false');
            button.title = 'Show password';
            button.innerHTML = passwordVisibilityIcon(false);

            button.addEventListener('click', () => {
                const visible = input.type === 'text';
                input.type = visible ? 'password' : 'text';
                const nowVisible = !visible;
                const label = nowVisible ? 'Hide password' : 'Show password';
                button.setAttribute('aria-label', label);
                button.setAttribute('aria-pressed', String(nowVisible));
                button.title = label;
                button.innerHTML = passwordVisibilityIcon(nowVisible);
            });

            wrapper.appendChild(button);
        });
    }

    function ensureGate() {
        if (gateLayer) return gateLayer;

        ensureStyles();

        gateLayer = document.createElement('div');
        gateLayer.className = 'atlas-account-gate-layer';
        gateLayer.hidden = true;
        gateLayer.innerHTML = `
            <section class="atlas-account-gate-card" role="dialog" aria-modal="true" aria-labelledby="atlas-account-gate-title">
                <div class="atlas-account-gate-head">
                    <h2 class="atlas-account-gate-heading" id="atlas-account-gate-title">Atlas account</h2>
                    <button class="atlas-account-gate-close" type="button" data-account-close aria-label="Close account dialog">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M3 3l8 8M11 3 3 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
                <div class="atlas-account-gate-body">
                    <p class="atlas-account-gate-copy" data-account-copy></p>

                    <div class="atlas-account-gate-tabs" data-account-tabs>
                        <button class="atlas-account-gate-tab" type="button" data-account-mode="sign-in">Sign in</button>
                        <button class="atlas-account-gate-tab" type="button" data-account-mode="create">Create free account</button>
                    </div>

                    <p class="atlas-account-gate-status" data-account-status role="status" aria-live="polite" hidden></p>

                    <form class="atlas-account-gate-form" data-account-form="sign-in">
                        <label class="atlas-account-gate-label" for="atlas-account-sign-in-email">Email</label>
                        <input class="atlas-account-gate-input" id="atlas-account-sign-in-email" name="email" type="email" autocomplete="username" required>

                        <label class="atlas-account-gate-label" for="atlas-account-sign-in-password">Password</label>
                        <input class="atlas-account-gate-input" id="atlas-account-sign-in-password" name="password" type="password" autocomplete="current-password" required>

                        <button class="atlas-account-gate-primary" type="submit">Sign in</button>
                        <button class="atlas-account-gate-text" type="button" data-account-forgot>Forgot password?</button>
                    </form>

                    <form class="atlas-account-gate-form" data-account-form="create" hidden>
                        <label class="atlas-account-gate-label" for="atlas-account-create-email">Email</label>
                        <input class="atlas-account-gate-input" id="atlas-account-create-email" name="email" type="email" autocomplete="username" required>

                        <label class="atlas-account-gate-label" for="atlas-account-create-password">Password</label>
                        <input class="atlas-account-gate-input" id="atlas-account-create-password" name="password" type="password" autocomplete="new-password" minlength="8" required>
                        <p class="atlas-account-gate-hint">Use at least 8 characters.</p>

                        <label class="atlas-account-gate-label" for="atlas-account-create-confirm">Confirm password</label>
                        <input class="atlas-account-gate-input" id="atlas-account-create-confirm" name="confirm" type="password" autocomplete="new-password" minlength="8" required>

                        <button class="atlas-account-gate-primary" type="submit">Create free account</button>
                    </form>

                    <form class="atlas-account-gate-form" data-account-form="forgot" hidden>
                        <label class="atlas-account-gate-label" for="atlas-account-forgot-email">Email</label>
                        <input class="atlas-account-gate-input" id="atlas-account-forgot-email" name="email" type="email" autocomplete="username" required>
                        <button class="atlas-account-gate-primary" type="submit">Send reset link</button>
                        <button class="atlas-account-gate-text" type="button" data-account-back-sign-in>Back to sign in</button>
                    </form>

                    <div class="atlas-account-gate-message" data-account-message hidden>
                        <h3 data-account-message-title></h3>
                        <p data-account-message-copy></p>
                        <button class="atlas-account-gate-secondary" type="button" data-account-message-close>Close</button>
                    </div>
                </div>
            </section>
        `;

        document.body.appendChild(gateLayer);
        installPasswordVisibilityToggles(gateLayer);

        gateLayer.addEventListener('click', event => {
            if (event.target === gateLayer) close();
        });

        gateLayer.querySelector('[data-account-close]')
            ?.addEventListener('click', () => close());

        gateLayer.querySelectorAll('[data-account-mode]')
            .forEach(button => {
                button.addEventListener('click', () => {
                    setGateMode(button.dataset.accountMode);
                });
            });

        gateLayer.querySelector('[data-account-forgot]')
            ?.addEventListener('click', () => setGateMode('forgot'));

        gateLayer.querySelector('[data-account-back-sign-in]')
            ?.addEventListener('click', () => setGateMode('sign-in'));

        gateLayer.querySelector('[data-account-message-close]')
            ?.addEventListener('click', () => close());

        gateLayer.querySelector('[data-account-form="sign-in"]')
            ?.addEventListener('submit', handleSignIn);

        gateLayer.querySelector('[data-account-form="create"]')
            ?.addEventListener('submit', handleCreateAccount);

        gateLayer.querySelector('[data-account-form="forgot"]')
            ?.addEventListener('submit', handleForgotPassword);

        gateLayer.addEventListener('keydown', trapGateKeyboard);

        return gateLayer;
    }

    function getAccountSettingsHref() {
        const body = document.body;
        const surface = body?.dataset?.atlasSurface || '';
        const world = body?.dataset?.atlasWorld || '';

        let from = 'atlas';

        if (surface === 'inside-atlas') {
            from = 'inside-atlas';
        } else if (world === 'compass') {
            from = 'compass';
        } else if (world === 'arcade') {
            from = 'arcade';
        }

        return `/account/?from=${encodeURIComponent(from)}`;
    }

    function ensureMenu() {
        if (accountMenu) return accountMenu;

        ensureStyles();

        accountMenu = document.createElement('div');
        accountMenu.className = 'atlas-account-menu';
        accountMenu.hidden = true;
        accountMenu.setAttribute('role', 'dialog');
        accountMenu.setAttribute('aria-label', 'Atlas account');
        accountMenu.innerHTML = `
            <p class="atlas-account-menu-kicker">Signed in as</p>
            <p class="atlas-account-menu-email" data-account-menu-email></p>
            <span class="atlas-account-menu-plan" data-account-menu-plan></span>
            <div class="atlas-account-menu-actions">
                <a class="atlas-account-menu-action" href="/account/" data-account-settings>Account settings</a>
                <button class="atlas-account-menu-action" type="button" data-account-menu-feedback>Message Atlas</button>
                <button class="atlas-account-menu-action" type="button" data-account-menu-sign-out>Sign out</button>
            </div>
            <p class="atlas-account-menu-status" data-account-menu-status role="status" aria-live="polite" hidden></p>
        `;

        document.body.appendChild(accountMenu);

        const accountSettingsLink =
            accountMenu.querySelector('[data-account-settings]');
        if (accountSettingsLink) {
            accountSettingsLink.href = getAccountSettingsHref();
        }

        accountMenu.querySelector('[data-account-menu-feedback]')
            ?.addEventListener(
                'click',
                openFeedbackFromAccount
            );

        accountMenu.querySelector('[data-account-menu-sign-out]')
            ?.addEventListener('click', handleSignOut);

        return accountMenu;
    }

    function setGateStatus(message = '', kind = 'info') {
        const status = gateLayer?.querySelector('[data-account-status]');
        if (!status) return;

        status.textContent = String(message || '');
        status.dataset.kind = kind;
        status.hidden = !message;
    }

    function setBusy(nextBusy, actionLabel = '') {
        busy = Boolean(nextBusy);

        gateLayer?.querySelectorAll('button, input').forEach(control => {
            control.disabled = busy;
        });

        gateLayer?.querySelectorAll(
            '[data-account-form] .atlas-account-gate-primary'
        ).forEach(button => {
            if (!button.dataset.defaultLabel) {
                button.dataset.defaultLabel =
                    String(button.textContent || '').trim();
            }

            const form =
                button.closest('[data-account-form]');
            const isActiveForm =
                form?.dataset.accountForm ===
                    state.gateMode;

            button.textContent =
                busy && actionLabel && isActiveForm
                    ? actionLabel
                    : button.dataset.defaultLabel;
        });
    }

    function setGateMode(mode) {
        ensureGate();

        const nextMode = ['create', 'forgot'].includes(mode)
            ? mode
            : 'sign-in';

        state.gateMode = nextMode;
        setGateStatus('');

        const isAuthMode = nextMode === 'sign-in' || nextMode === 'create';
        const title = gateLayer.querySelector('[data-account-copy]');
        const tabs = gateLayer.querySelector('[data-account-tabs]');
        const message = gateLayer.querySelector('[data-account-message]');

        if (title) {
            title.textContent = nextMode === 'create'
                ? 'Create a free account to make your own subjects, add students and build your teaching workspace.'
                : nextMode === 'forgot'
                    ? 'Reset your password with a secure link sent to your email.'
                    : 'Sign in to continue with your Atlas work.';
        }

        if (tabs) tabs.hidden = !isAuthMode;
        if (message) message.hidden = true;

        gateLayer.querySelectorAll('[data-account-mode]')
            .forEach(button => {
                button.classList.toggle(
                    'is-active',
                    button.dataset.accountMode === nextMode
                );
            });

        gateLayer.querySelectorAll('[data-account-form]')
            .forEach(form => {
                form.hidden = form.dataset.accountForm !== nextMode;
            });

        window.setTimeout(() => {
            const target = gateLayer?.querySelector(
                `[data-account-form="${nextMode}"] input`
            );
            focusWithoutScroll(target);
        }, 0);
    }

    function showMessage(title, copy, kind = 'success') {
        ensureGate();

        state.gateMode = 'message';
        gateLayer.querySelector('[data-account-tabs]').hidden = true;
        gateLayer.querySelectorAll('[data-account-form]')
            .forEach(form => {
                form.hidden = true;
            });

        const message = gateLayer.querySelector('[data-account-message]');
        gateLayer.querySelector('[data-account-message-title]').textContent = title;
        gateLayer.querySelector('[data-account-message-copy]').textContent = copy;
        message.hidden = false;
        setGateStatus('', kind);

        window.setTimeout(() => {
            focusWithoutScroll(
                gateLayer.querySelector('[data-account-message-close]')
            );
        }, 0);
    }

    function visibleFocusable(container) {
        return Array.from(container.querySelectorAll(
            'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(element => !element.closest('[hidden]'));
    }

    function trapGateKeyboard(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
            return;
        }

        if (event.key !== 'Tab') return;

        const items = visibleFocusable(gateLayer);
        if (!items.length) return;

        const first = items[0];
        const last = items[items.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function rememberTrigger(trigger) {
        activeTrigger = trigger && typeof trigger.focus === 'function'
            ? trigger
            : null;

        previousFocus = document.activeElement &&
            typeof document.activeElement.focus === 'function'
            ? document.activeElement
            : null;
    }

    async function open({
        mode = 'sign-in',
        trigger = null,
        returnIntentId = null
    } = {}) {
        ensureGate();
        closeAccountMenu({ restoreFocus: false });
        rememberTrigger(trigger);

        gateLayer.hidden = false;
        document.body.classList.add('atlas-account-gate-open');
        state.gateOpen = true;
        setGateMode(mode);

        try {
            const returnIntent =
                await bindReturnIntent(returnIntentId);

            await prepareAccount();
            const account = window.AtlasAccount?.getState?.() || null;

            if (account?.authenticated) {
                if (returnIntent) {
                    await completeAuthenticatedFlow();
                    return snapshot();
                }

                close({ restoreFocus: false });
                await openAccountMenu(trigger || activeTrigger || previousFocus);
                return snapshot();
            }

            /*
             * Opening the gate must stay immediately usable. If the tutor
             * already submitted while account preparation was finishing,
             * leave that submit-owned busy state alone.
             */
            if (!busy) {
                setGateStatus('');
            }

            return snapshot();
        } catch (error) {
            if (!busy) {
                setGateStatus(humanizeError(error), 'error');
            }

            return snapshot();
        }
    }

    function openSignIn(trigger = null) {
        return open({ mode: 'sign-in', trigger });
    }

    function openCreateAccount(trigger = null) {
        return open({ mode: 'create', trigger });
    }

    function close({ restoreFocus = true } = {}) {
        if (!gateLayer || gateLayer.hidden) return;

        gateLayer.hidden = true;
        document.body.classList.remove('atlas-account-gate-open');
        setBusy(false);
        setGateStatus('');
        state.gateOpen = false;
        state.gateMode = null;

        if (restoreFocus) {
            const target = activeTrigger || previousFocus;
            window.setTimeout(() => target?.focus?.(), 0);
        }

        activeTrigger = null;
        previousFocus = null;
        activeReturnIntentId = null;
    }

    function dispatchAuthenticated(returnIntent = null) {
        try {
            window.dispatchEvent(new CustomEvent(
                'atlas:account-gate-authenticated',
                {
                    detail: {
                        account: window.AtlasAccount?.getState?.() || null,
                        access: window.AtlasAccess?.getState?.() || null,
                        returnIntent
                    }
                }
            ));
        } catch {
            // Access/account subscriptions remain the canonical state path.
        }
    }

    function dispatchReturnIntentResume(intent) {
        if (!intent) return;

        try {
            window.dispatchEvent(new CustomEvent(
                'atlas:return-intent-resume',
                {
                    detail: {
                        intent,
                        source: 'account-gate'
                    }
                }
            ));
        } catch {
            // Consumers can still inspect their own canonical state.
        }
    }

    async function completeAuthenticatedFlow() {
        const account = window.AtlasAccount?.getState?.() || null;
        const intentId = activeReturnIntentId;
        let returnIntent = null;

        if (account?.authenticated && intentId) {
            try {
                const ReturnIntent = await ensureReturnIntent();
                returnIntent = ReturnIntent.consume(intentId);
            } catch (error) {
                console.error(
                    '[AtlasAccountGate] return intent resume failed:',
                    error
                );
            }
        }

        close({
            restoreFocus: !returnIntent
        });
        dispatchAuthenticated(returnIntent);
        dispatchReturnIntentResume(returnIntent);

        return returnIntent;
    }

    async function handleSignIn(event) {
        event.preventDefault();
        if (busy) return;

        const form = event.currentTarget;
        const data = new FormData(form);
        const email = String(data.get('email') || '').trim();
        const password = String(data.get('password') || '');

        setGateStatus('');
        setBusy(true, 'Signing in…');

        try {
            await prepareAccount();
            await window.AtlasAccount.signIn(email, password);
            await completeAuthenticatedFlow();
        } catch (error) {
            setBusy(false);
            setGateStatus(humanizeError(error), 'error');
        }
    }

    async function handleCreateAccount(event) {
        event.preventDefault();
        if (busy) return;

        const form = event.currentTarget;
        const data = new FormData(form);
        const email = String(data.get('email') || '').trim();
        const password = String(data.get('password') || '');
        const confirm = String(data.get('confirm') || '');

        if (password.length < 8) {
            setGateStatus('Use a password with at least 8 characters.', 'error');
            return;
        }

        if (password !== confirm) {
            setGateStatus('Those passwords do not match.', 'error');
            return;
        }

        setGateStatus('');
        setBusy(true, 'Creating account…');

        try {
            await prepareAccount();
            const result = await window.AtlasAccount.createAccount(
                email,
                password,
                {
                    returnIntentId: activeReturnIntentId
                }
            );

            setBusy(false);

            if (result?.confirmationRequired) {
                showMessage(
                    'Check your email',
                    `We sent a confirmation link to ${result.email || email}. Open it to finish creating your account.`
                );
                return;
            }

            await completeAuthenticatedFlow();
        } catch (error) {
            setBusy(false);
            setGateStatus(humanizeError(error), 'error');
        }
    }

    async function handleForgotPassword(event) {
        event.preventDefault();
        if (busy) return;

        const form = event.currentTarget;
        const data = new FormData(form);
        const email = String(data.get('email') || '').trim();

        setGateStatus('');
        setBusy(true, 'Sending reset link…');

        try {
            await prepareAccount();
            await window.AtlasAccount.requestPasswordReset(
                email,
                {
                    returnIntentId:
                        activeReturnIntentId
                }
            );
            setBusy(false);
            showMessage(
                'Check your email',
                `If ${email} is linked to an account, a password reset link is on its way.`
            );
        } catch (error) {
            setBusy(false);
            setGateStatus(humanizeError(error), 'error');
        }
    }

    function renderAccountMenu() {
        if (!accountMenu) return;

        const account = window.AtlasAccount?.getState?.() || {};
        const access = window.AtlasAccess?.getState?.() || {};
        const email = account.email || 'Atlas account';
        const tier = access.tier === 'pro'
            ? 'Pro'
            : access.tier === 'free'
                ? 'Free account'
                : 'Account';

        accountMenu.querySelector('[data-account-menu-email]').textContent = email;
        accountMenu.querySelector('[data-account-menu-plan]').textContent = tier;
        const signOutButton = accountMenu.querySelector('[data-account-menu-sign-out]');
        if (signOutButton) signOutButton.disabled = false;
        const status = accountMenu.querySelector('[data-account-menu-status]');
        status.textContent = '';
        status.hidden = true;
    }

    function positionAccountMenu() {
        if (!accountMenu || accountMenu.hidden || !menuAnchor) return;
        if (window.matchMedia?.('(max-width: 640px)').matches) {
            accountMenu.style.top = '';
            accountMenu.style.left = '';
            return;
        }

        const rect = menuAnchor.getBoundingClientRect?.();
        if (!rect) return;

        const width = Math.min(310, window.innerWidth - 24);
        const left = Math.max(
            12,
            Math.min(rect.right - width, window.innerWidth - width - 12)
        );
        const top = Math.min(rect.bottom + 8, window.innerHeight - 180);

        accountMenu.style.left = `${left}px`;
        accountMenu.style.top = `${Math.max(12, top)}px`;
    }

    async function openAccountMenu(anchor = null) {
        ensureMenu();
        close({ restoreFocus: false });
        menuAnchor = anchor && typeof anchor.focus === 'function'
            ? anchor
            : null;

        try {
            await prepareAccount();
        } catch (error) {
            return openSignIn(anchor);
        }

        const account = window.AtlasAccount?.getState?.() || null;

        if (!account?.authenticated) {
            return openSignIn(anchor);
        }

        renderAccountMenu();
        accountMenu.hidden = false;
        state.menuOpen = true;

        if (menuAnchor) {
            menuAnchor.setAttribute?.('aria-expanded', 'true');
        }

        positionAccountMenu();
        document.addEventListener('pointerdown', handleOutsideMenu, true);
        document.addEventListener('keydown', handleMenuKeydown, true);
        window.addEventListener('resize', positionAccountMenu);

        window.setTimeout(() => {
            focusWithoutScroll(accountMenu.querySelector('a, button'));
        }, 0);

        return snapshot();
    }

    function handleOutsideMenu(event) {
        if (
            accountMenu?.contains(event.target) ||
            menuAnchor?.contains?.(event.target)
        ) {
            return;
        }

        closeAccountMenu();
    }

    function handleMenuKeydown(event) {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        closeAccountMenu();
    }

    function closeAccountMenu({ restoreFocus = true } = {}) {
        if (!accountMenu || accountMenu.hidden) return;

        accountMenu.hidden = true;
        state.menuOpen = false;

        document.removeEventListener('pointerdown', handleOutsideMenu, true);
        document.removeEventListener('keydown', handleMenuKeydown, true);
        window.removeEventListener('resize', positionAccountMenu);

        if (menuAnchor) {
            menuAnchor.setAttribute?.('aria-expanded', 'false');
            if (restoreFocus) {
                const anchor = menuAnchor;
                window.setTimeout(() => anchor?.focus?.(), 0);
            }
        }

        menuAnchor = null;
    }

    async function handleSignOut(event) {
        const button = event.currentTarget;
        const status = accountMenu?.querySelector('[data-account-menu-status]');

        button.disabled = true;
        if (status) {
            status.textContent = '';
            status.hidden = true;
        }

        try {
            await prepareAccount();
            await window.AtlasAccount.signOut();
            closeAccountMenu({ restoreFocus: true });
        } catch (error) {
            button.disabled = false;
            if (status) {
                status.textContent = humanizeError(error);
                status.hidden = false;
            }
        }
    }

    window.AtlasAccountGate = Object.freeze({
        open,
        openSignIn,
        openCreateAccount,
        openAccountMenu,
        close,
        closeAccountMenu,
        getState: snapshot
    });
})();
