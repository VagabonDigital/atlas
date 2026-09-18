/* ============================================================
   ATLAS SESSION PANEL
   Small reusable session UI for Atlas surfaces.

   AtlasBridge owns session state. Integrating surfaces may add
   optional context, a primary action, and existing destructive
   action callbacks.
   ============================================================ */

(function () {
    'use strict';

    const SCRIPT_URL =
        document.currentScript?.src ||
        window.location.href;

    const SUPABASE_SESSION_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';

    let root = null;
    let options = {};
    let panelView = 'safe';
    let manageHasSafeHistory = false;
    let expandedSessionId = null;
    let rowActionState = null;
    let lastTrigger = null;
    let previousBodyOverflow = '';
    let mounted = false;
    let learnerCloudPromise = null;
    let learnerCloudPromiseUserId = '';
    let capabilityGatePromise = null;
    let learnerResumeUnsubscribe = null;

    function storedAtlasAccountUserId() {
        try {
            const raw = localStorage.getItem(
                SUPABASE_SESSION_KEY
            );

            if (!raw) return '';

            const parsed = JSON.parse(raw);
            const candidates = [
                parsed,
                parsed?.session,
                parsed?.currentSession,
                parsed?.data?.session
            ];

            for (const candidate of candidates) {
                const id = String(
                    candidate?.user?.id || ''
                ).trim();

                if (id) return id;
            }
        } catch { }

        return '';
    }

    function hasStoredAtlasAccountSession() {
        return Boolean(storedAtlasAccountUserId());
    }

    function loadScript(src, marker) {
        if (marker && document.querySelector(`script[${marker}]`)) {
            return new Promise((resolve, reject) => {
                const existing = document.querySelector(`script[${marker}]`);

                if (existing.dataset.atlasLoaded === 'true') {
                    resolve();
                    return;
                }

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

            script.addEventListener('load', () => {
                script.dataset.atlasLoaded = 'true';
                resolve();
            }, { once: true });
            script.addEventListener('error', reject, { once: true });
            document.head.appendChild(script);
        });
    }

    async function ensureCapabilityGate() {
        if (window.AtlasCapabilityGate) {
            return window.AtlasCapabilityGate;
        }

        if (capabilityGatePromise) {
            return capabilityGatePromise;
        }

        capabilityGatePromise = (async () => {
            if (!window.AtlasAccessBootstrap) {
                await loadScript(
                    '/shared/atlas-access-bootstrap.js?v=20260918-publicaccess1',
                    'data-atlas-access-bootstrap'
                );
            }

            const Bootstrap = window.AtlasAccessBootstrap;

            if (
                !Bootstrap ||
                typeof Bootstrap.prepareCapabilityGate !== 'function'
            ) {
                throw new Error(
                    'Atlas capability enforcement is unavailable.'
                );
            }

            return Bootstrap.prepareCapabilityGate();
        })().catch(error => {
            capabilityGatePromise = null;
            throw error;
        });

        return capabilityGatePromise;
    }

    async function ensureLearnerCloud({ force = false } = {}) {
        const userId = storedAtlasAccountUserId();

        if (!userId) {
            return null;
        }

        if (
            learnerCloudPromise &&
            learnerCloudPromiseUserId === userId
        ) {
            if (!force) {
                return learnerCloudPromise;
            }

            return learnerCloudPromise.then(async Authority => {
                if (
                    Authority &&
                    typeof Authority.initialize === 'function'
                ) {
                    await Authority.initialize({ force: true });
                }

                return Authority;
            });
        }

        learnerCloudPromiseUserId = userId;

        learnerCloudPromise = (async () => {
            if (!window.AtlasCloud) {
                await loadScript(
                    '/shared/atlas-cloud.js?v=20260916-runtime3',
                    'data-atlas-learner-cloud-core'
                );
            }

            if (!window.AtlasLearnerSessionsCloud) {
                await loadScript(
                    '/shared/atlas-learner-sessions-cloud.js?v=20260916-runtime3',
                    'data-atlas-learner-cloud-adapter'
                );
            }

            if (!window.AtlasLearnerSessionsCloudAuthority) {
                await loadScript(
                    '/shared/atlas-learner-sessions-cloud-authority.js?v=20260916-runtime3',
                    'data-atlas-learner-cloud-authority'
                );
            }

            const Authority =
                window.AtlasLearnerSessionsCloudAuthority || null;

            if (Authority) {
                await Authority.initialize({ force });
            }

            return Authority;
        })().catch(error => {
            if (learnerCloudPromiseUserId === userId) {
                learnerCloudPromise = null;
                learnerCloudPromiseUserId = '';
            }

            throw error;
        });

        return learnerCloudPromise;
    }

    function getBridge() {
        if (!window.AtlasBridge) {
            throw new Error('AtlasSessionPanel requires AtlasBridge.');
        }

        return window.AtlasBridge;
    }

    function escHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function resolveOption(value, activeSession) {
        return typeof value === 'function'
            ? value(activeSession)
            : value;
    }

    function getElements() {
        return {
            overlay: root?.querySelector('#atlas-session-panel-overlay'),
            dialog: root?.querySelector('.atlas-session-panel'),
            safeView: root?.querySelector('#atlas-session-safe-view'),
            manageView: root?.querySelector('#atlas-session-manage-view'),
            activeName: root?.querySelector('#atlas-session-active-name'),
            contextTitle: root?.querySelector('#atlas-session-context-title'),
            contextDescription: root?.querySelector('#atlas-session-context-description'),
            primaryAction: root?.querySelector('#atlas-session-primary-action'),
            manageButton: root?.querySelector('#atlas-session-open-manage'),
            backButton: root?.querySelector('#atlas-session-manage-back'),
            searchLabel: root?.querySelector('.atlas-session-search-label'),
            searchInput: root?.querySelector('#atlas-session-search'),
            sessionList: root?.querySelector('#atlas-session-list'),
            searchEmpty: root?.querySelector('#atlas-session-search-empty'),
            createForm: root?.querySelector('#atlas-session-create-form'),
            createToggle: root?.querySelector('#atlas-session-create-toggle'),
            createFields: root?.querySelector('#atlas-session-create-fields'),
            createInput: root?.querySelector('#atlas-session-create-name'),
            createError: root?.querySelector('#atlas-session-create-error')
        };
    }

    function isMobileSessionLayout() {
        return window.matchMedia('(max-width: 680px)').matches;
    }

    function resetMobileVisualViewport() {
        const elements = getElements();

        if (elements.overlay) {
            elements.overlay.style.removeProperty('top');
            elements.overlay.style.removeProperty('bottom');
            elements.overlay.style.removeProperty('height');
        }

        elements.dialog?.style.removeProperty('max-height');
    }

    function syncMobileVisualViewport() {
        const elements = getElements();

        if (
            !elements.overlay ||
            !elements.dialog ||
            !isOpen() ||
            !isMobileSessionLayout()
        ) {
            resetMobileVisualViewport();
            return;
        }

        const viewport = window.visualViewport;
        const height = Math.max(
            0,
            Number(viewport?.height) ||
            Number(window.innerHeight) ||
            Number(document.documentElement?.clientHeight) ||
            0
        );
        const offsetTop = Math.max(
            0,
            Number(viewport?.offsetTop) || 0
        );

        if (!height) return;

        elements.overlay.style.top = `${offsetTop}px`;
        elements.overlay.style.bottom = 'auto';
        elements.overlay.style.height = `${height}px`;
        elements.dialog.style.maxHeight = `${Math.max(180, height)}px`;
    }

    function focusTextControl(element) {
        if (!element) return;

        const mobile = isMobileSessionLayout();

        element.focus({
            preventScroll: !mobile
        });

        if (!mobile) return;

        window.requestAnimationFrame(() => {
            syncMobileVisualViewport();
            element.scrollIntoView({
                block: 'nearest',
                inline: 'nearest'
            });
        });
    }

    function setCreateExpanded(
        expanded,
        { focus = false, reset = false } = {}
    ) {
        const elements = getElements();

        if (!elements.createToggle || !elements.createFields) return;

        elements.createToggle.style.display = expanded ? 'none' : '';
        elements.createToggle.setAttribute('aria-expanded', String(expanded));
        elements.createFields.hidden = !expanded;

        if (!expanded && reset) {
            if (elements.createInput) {
                elements.createInput.value = '';
            }

            if (elements.createError) {
                elements.createError.textContent = '';
            }
        }

        if (expanded && focus) {
            window.requestAnimationFrame(() => {
                focusTextControl(elements.createInput);
            });
        }
    }

    function isOpen() {
        return getElements().overlay?.classList.contains('is-open') || false;
    }

    function getInitialView() {
        return options.initialView === 'manage' ? 'manage' : 'safe';
    }

    function getSessionDisplayName(session) {
        if (!session || session.id === getBridge().defaultSessionId) {
            return 'Shared';
        }

        return session.name || 'Shared';
    }

    function getLearnerMemoryUrl(sessionId) {
        const destination = new URL(
            '../memory/',
            SCRIPT_URL
        );

        destination.searchParams.set(
            'session',
            sessionId
        );

        return destination.href;
    }

    function getDisplaySession(session) {
        return {
            ...session,
            name: getSessionDisplayName(session)
        };
    }

    function getAvailableSessionActions(session) {
        const Bridge = getBridge();
        const isFallback = session.id === Bridge.defaultSessionId;

        return {
            rename:
                !isFallback &&
                (
                    typeof options.onRenameSession === 'function' ||
                    typeof Bridge.renameSession === 'function'
                ),
            reset:
                typeof options.onResetSession === 'function',
            delete:
                !isFallback &&
                (
                    typeof options.onDeleteSession === 'function' ||
                    typeof Bridge.deleteSession === 'function'
                )
        };
    }

    function getVisibleSessions() {
        const Bridge = getBridge();
        const sessions = Bridge.readSessions();

        if (hasStoredAtlasAccountSession()) {
            return sessions;
        }

        return sessions.filter(
            session =>
                session.id ===
                Bridge.defaultSessionId
        );
    }

    function getVisibleActiveSession() {
        const Bridge = getBridge();

        if (hasStoredAtlasAccountSession()) {
            return Bridge.readActiveSession();
        }

        return (
            getVisibleSessions().find(
                session =>
                    session.id ===
                    Bridge.defaultSessionId
            ) ||
            {
                id: Bridge.defaultSessionId,
                name: 'Shared'
            }
        );
    }

    function updateSafeView() {
        const activeSession =
            getVisibleActiveSession();
        const displaySession = getDisplaySession(activeSession);
        const elements = getElements();
        const contextTitle = resolveOption(options.contextTitle, displaySession);
        const contextDescription = resolveOption(
            options.contextDescription,
            displaySession
        );
        const primaryActionLabel = resolveOption(
            options.primaryActionLabel,
            displaySession
        );

        if (elements.activeName) {
            elements.activeName.textContent = displaySession.name;
        }

        if (elements.contextTitle) {
            elements.contextTitle.hidden = !contextTitle;
            elements.contextTitle.textContent = contextTitle || '';
        }

        if (elements.contextDescription) {
            elements.contextDescription.hidden = !contextDescription;
            elements.contextDescription.textContent = contextDescription || '';
        }

        if (elements.primaryAction) {
            elements.primaryAction.hidden = !(
                primaryActionLabel &&
                typeof options.onPrimaryAction === 'function'
            );
            elements.primaryAction.textContent = primaryActionLabel || '';
        }
    }

    function getFilteredSessions() {
        const query = getElements().searchInput?.value.trim().toLowerCase() || '';

        return getVisibleSessions().filter(session =>
            !query || getSessionDisplayName(session).toLowerCase().includes(query)
        );
    }

    function createActionButton({
        label,
        ariaLabel = label,
        className = '',
        action,
        sessionId
    }) {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = `atlas-session-row-action${className ? ` ${className}` : ''}`;
        button.textContent = label;
        button.dataset.action = action;
        button.dataset.sessionId = sessionId;
        button.setAttribute('aria-label', ariaLabel);

        return button;
    }

    function createSessionIcon() {
        const icon = document.createElement('span');

        icon.className = 'atlas-session-row-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = `
            <svg viewBox="0 0 24 24" focusable="false">
                <circle cx="12" cy="8" r="3.25"></circle>
                <path d="M5.75 19c.45-3.25 2.55-5 6.25-5s5.8 1.75 6.25 5"></path>
            </svg>
        `;

        return icon;
    }

    function getSessionActionsToggle(sessionId) {
        return Array.from(root?.querySelectorAll(
            '[data-session-actions-toggle][data-session-id]'
        ) || []).find(button => button.dataset.sessionId === sessionId) || null;
    }

    function focusSessionActionsToggle(sessionId, { fallbackToSearch = false } = {}) {
        window.requestAnimationFrame(() => {
            const toggle = getSessionActionsToggle(sessionId);

            if (toggle) {
                toggle.focus({ preventScroll: true });
            } else if (fallbackToSearch) {
                getElements().searchInput?.focus({ preventScroll: true });
            }
        });
    }

    function toggleSessionActions(sessionId) {
        expandedSessionId = expandedSessionId === sessionId
            ? null
            : sessionId;

        rowActionState = null;

        renderManageView();
        focusSessionActionsToggle(sessionId);
    }

    function focusRowActionControl(sessionId, selector) {
        window.requestAnimationFrame(() => {
            const row = root?.querySelector(
                `.atlas-session-row[data-session-id="${CSS.escape(sessionId)}"]`
            );
            const control = row?.querySelector(selector) || null;

            if (
                control instanceof HTMLInputElement ||
                control instanceof HTMLTextAreaElement
            ) {
                focusTextControl(control);
            } else {
                control?.focus({
                    preventScroll: true
                });
            }
        });
    }

    function startRowAction(type, session) {
        rowActionState = {
            type,
            sessionId: session.id,
            value: session.name || '',
            error: ''
        };

        expandedSessionId = session.id;

        renderManageView();

        focusRowActionControl(
            session.id,
            type === 'rename'
                ? '.atlas-session-row-editor-input'
                : type === 'reset'
                    ? '[data-action="confirm-reset"]'
                    : '[data-action="confirm-delete"]'
        );
    }

    function cancelRowAction(sessionId) {
        rowActionState = null;
        renderManageView();
        focusSessionActionsToggle(sessionId);
    }

    async function commitSessionRename(
        sessionId,
        nextName
    ) {
        const Bridge = getBridge();
        const session = Bridge.readSessions().find(
            item => item.id === sessionId
        );

        if (!session) return;

        const cleanName = String(nextName || '').trim();

        if (!cleanName) {
            rowActionState = {
                type: 'rename',
                sessionId,
                value: cleanName,
                error: 'Enter a student name.'
            };

            renderManageView();
            focusRowActionControl(
                sessionId,
                '.atlas-session-row-editor-input'
            );
            return;
        }

        if (cleanName === session.name) {
            cancelRowAction(sessionId);
            return;
        }

        let renamed = null;

        try {
            const Authority = await ensureLearnerCloud();

            renamed =
                Authority?.getState?.().active
                    ? await Authority.renameSession(
                        sessionId,
                        cleanName
                    )
                    : Bridge.renameSession(
                        sessionId,
                        cleanName
                    );
        } catch {
            rowActionState = {
                type: 'rename',
                sessionId,
                value: cleanName,
                error: 'Couldn’t save this change.'
            };

            renderManageView();
            focusRowActionControl(
                sessionId,
                '.atlas-session-row-editor-input'
            );
            return;
        }

        if (!renamed) {
            rowActionState = {
                type: 'rename',
                sessionId,
                value: cleanName,
                error: 'That name is already in use.'
            };

            renderManageView();
            focusRowActionControl(
                sessionId,
                '.atlas-session-row-editor-input'
            );
            return;
        }

        rowActionState = null;
        renderManageView();
        focusSessionActionsToggle(sessionId);
    }

    async function commitSessionReset(sessionId) {
        const Bridge = getBridge();
        const session = Bridge.readSessions().find(
            item => item.id === sessionId
        );

        if (
            !session ||
            typeof options.onResetSession !== 'function'
        ) {
            return;
        }

        try {
            await options.onResetSession(session);
        } catch {
            rowActionState = {
                type: 'reset',
                sessionId,
                value: '',
                error: 'Couldn’t clear this subject activity.'
            };

            renderManageView();
            focusRowActionControl(
                sessionId,
                '[data-action="confirm-reset"]'
            );
            return;
        }

        rowActionState = null;
        renderManageView();
        focusSessionActionsToggle(sessionId);
    }

    async function commitSessionDelete(sessionId) {
        const Bridge = getBridge();
        const session = Bridge.readSessions().find(
            item => item.id === sessionId
        );

        if (!session) return;

        try {
            if (
                typeof options.onBeforeDeleteSession ===
                'function'
            ) {
                await options.onBeforeDeleteSession(session);
            }

            const Authority = await ensureLearnerCloud();
            const deleted =
                Authority?.getState?.().active
                    ? await Authority.deleteSession(session.id)
                    : Bridge.deleteSession(session.id);

            if (!deleted) {
                throw new Error(
                    'Session deletion failed.'
                );
            }
        } catch {
            rowActionState = {
                type: 'delete',
                sessionId,
                value: '',
                error: 'Couldn’t delete this student.'
            };

            renderManageView();
            focusRowActionControl(
                sessionId,
                '[data-action="confirm-delete"]'
            );
            return;
        }

        rowActionState = null;
        expandedSessionId = null;

        updateSafeView();
        renderManageView();

        window.requestAnimationFrame(() => {
            getElements().searchInput?.focus({
                preventScroll: true
            });
        });
    }

    function renderRowAction(
        container,
        session
    ) {
        const state =
            rowActionState?.sessionId === session.id
                ? rowActionState
                : null;

        if (!state) return false;

        const displayName =
            getSessionDisplayName(session);

        if (state.type === 'rename') {
            const form = document.createElement('form');
            const input = document.createElement('input');
            const actions = document.createElement('div');
            const save = document.createElement('button');
            const cancel = document.createElement('button');
            const error = document.createElement('p');

            form.className =
                'atlas-session-row-editor';

            input.className =
                'atlas-session-row-editor-input';
            input.type = 'text';
            input.maxLength = 40;
            input.value =
                typeof state.value === 'string'
                    ? state.value
                    : session.name || '';
            input.setAttribute(
                'aria-label',
                `Rename ${displayName}`
            );

            actions.className =
                'atlas-session-row-editor-actions';

            save.type = 'submit';
            save.className =
                'atlas-session-row-action';
            save.textContent = 'Save';

            cancel.type = 'button';
            cancel.className =
                'atlas-session-row-action';
            cancel.textContent = 'Cancel';
            cancel.dataset.action =
                'cancel-row-action';
            cancel.dataset.sessionId =
                session.id;

            error.className =
                'atlas-session-row-editor-error';
            error.textContent =
                state.error || '';

            actions.appendChild(save);
            actions.appendChild(cancel);

            form.appendChild(input);
            form.appendChild(actions);
            form.appendChild(error);

            form.addEventListener(
                'submit',
                event => {
                    event.preventDefault();

                    commitSessionRename(
                        session.id,
                        input.value
                    );
                }
            );

            container.appendChild(form);
            return true;
        }

        if (state.type === 'reset') {
            const confirmation =
                document.createElement('div');
            const title =
                document.createElement('p');
            const copy =
                document.createElement('p');
            const actions =
                document.createElement('div');
            const displaySession =
                getDisplaySession(session);
            const resetTitle =
                resolveOption(
                    options.resetTitle,
                    displaySession
                ) || 'Clear this subject?';
            const resetMessage =
                resolveOption(
                    options.resetMessage,
                    displaySession
                ) ||
                `This removes saved subject activity for ${displayName}.`;
            const resetConfirmLabel =
                resolveOption(
                    options.resetConfirmLabel,
                    displaySession
                ) || 'Clear activity';
            const confirm =
                createActionButton({
                    label: resetConfirmLabel,
                    ariaLabel:
                        `${resetConfirmLabel} for ${displayName}`,
                    className: 'is-danger',
                    action: 'confirm-reset',
                    sessionId: session.id
                });
            const cancel =
                createActionButton({
                    label: 'Cancel',
                    action: 'cancel-row-action',
                    sessionId: session.id
                });
            const error =
                document.createElement('p');

            confirmation.className =
                'atlas-session-row-confirm';

            title.className =
                'atlas-session-row-confirm-title';
            title.textContent = resetTitle;

            copy.className =
                'atlas-session-row-confirm-copy';
            copy.textContent = resetMessage;

            actions.className =
                'atlas-session-row-editor-actions';

            error.className =
                'atlas-session-row-editor-error';
            error.textContent =
                state.error || '';

            actions.appendChild(confirm);
            actions.appendChild(cancel);

            confirmation.appendChild(title);
            confirmation.appendChild(copy);
            confirmation.appendChild(actions);
            confirmation.appendChild(error);

            container.appendChild(confirmation);
            return true;
        }

        if (state.type === 'delete') {
            const confirmation =
                document.createElement('div');
            const copy =
                document.createElement('p');
            const actions =
                document.createElement('div');
            const confirm =
                createActionButton({
                    label: 'Delete student',
                    ariaLabel:
                        `Permanently delete ${displayName}`,
                    className: 'is-danger',
                    action: 'confirm-delete',
                    sessionId: session.id
                });
            const cancel =
                createActionButton({
                    label: 'Cancel',
                    action: 'cancel-row-action',
                    sessionId: session.id
                });
            const error =
                document.createElement('p');

            confirmation.className =
                'atlas-session-row-confirm';

            copy.className =
                'atlas-session-row-confirm-copy';
            copy.textContent =
                `Delete ${displayName}? This permanently removes this student and their saved activity.`;

            actions.className =
                'atlas-session-row-editor-actions';

            error.className =
                'atlas-session-row-editor-error';
            error.textContent =
                state.error || '';

            actions.appendChild(confirm);
            actions.appendChild(cancel);

            confirmation.appendChild(copy);
            confirmation.appendChild(actions);
            confirmation.appendChild(error);

            container.appendChild(confirmation);
            return true;
        }

        return false;
    }

    function renderManageView() {
        if (panelView !== 'manage') return;

        const Bridge = getBridge();
        const elements = getElements();
        const activeSession =
            getVisibleActiveSession();
        const sessions = getFilteredSessions();

        if (!elements.sessionList || !elements.searchEmpty) return;

        elements.sessionList.innerHTML = '';
        elements.searchEmpty.hidden = sessions.length > 0;

        if (expandedSessionId) {
            const expandedSession = getVisibleSessions().find(
                session => session.id === expandedSessionId
            );
            const availableActions = expandedSession
                ? getAvailableSessionActions(expandedSession)
                : null;

            if (
                !availableActions ||
                !Object.values(availableActions).some(Boolean)
            ) {
                expandedSessionId = null;
            }
        }

        sessions.forEach((session, index) => {
            const row = document.createElement('div');
            const main = document.createElement('div');
            const identity = document.createElement('div');
            const name = document.createElement('span');
            const controls = document.createElement('div');
            const moreButton = document.createElement('button');
            const secondaryActions = document.createElement('div');
            const availableActions = getAvailableSessionActions(session);
            const hasSecondaryActions = Object.values(availableActions).some(Boolean);
            const displayName = getSessionDisplayName(session);
            const active = session.id === activeSession.id;
            const expanded = hasSecondaryActions && session.id === expandedSessionId;
            const secondaryActionsId = `atlas-session-secondary-actions-${index}`;

            row.className = [
                'atlas-session-row',
                active ? 'is-active' : '',
                expanded ? 'is-expanded' : ''
            ].filter(Boolean).join(' ');
            row.dataset.sessionId = session.id;
            main.className = 'atlas-session-row-main';
            identity.className = 'atlas-session-row-identity';
            name.className = 'atlas-session-row-name';
            name.textContent = displayName;
            identity.appendChild(name);

            if (active) {
                const badge = document.createElement('span');
                badge.className = 'atlas-session-active-badge';
                badge.textContent = 'Active';
                identity.appendChild(badge);
            }

            controls.className = 'atlas-session-row-controls';

            if (!active) {
                controls.appendChild(createActionButton({
                    label: 'Switch',
                    ariaLabel: `Switch to ${displayName}`,
                    className: 'is-switch',
                    action: 'switch',
                    sessionId: session.id
                }));
            }

            if (session.id !== Bridge.defaultSessionId) {
                controls.appendChild(createActionButton({
                    label: 'Memory',
                    ariaLabel: `Open learner memory for ${displayName}`,
                    className: 'is-switch',
                    action: 'memory',
                    sessionId: session.id
                }));
            }

            if (hasSecondaryActions) {
                moreButton.type = 'button';
                moreButton.className = 'atlas-session-row-more';
                moreButton.textContent = '⋯';
                moreButton.dataset.sessionActionsToggle = '';
                moreButton.dataset.sessionId = session.id;
                moreButton.setAttribute(
                    'aria-label',
                    `${expanded ? 'Hide' : 'Show'} actions for ${displayName}`
                );
                moreButton.setAttribute('aria-expanded', String(expanded));
                moreButton.setAttribute('aria-controls', secondaryActionsId);
                controls.appendChild(moreButton);

                secondaryActions.className = 'atlas-session-row-secondary';
                secondaryActions.id = secondaryActionsId;
                secondaryActions.hidden = !expanded;
                secondaryActions.setAttribute('role', 'group');
                secondaryActions.setAttribute('aria-label', `Actions for ${displayName}`);

                const renderingRowAction =
                    renderRowAction(
                        secondaryActions,
                        session
                    );

                if (!renderingRowAction) {
                    if (availableActions.rename) {
                        secondaryActions.appendChild(
                            createActionButton({
                                label: 'Rename',
                                ariaLabel:
                                    `Rename ${displayName}`,
                                action: 'rename',
                                sessionId: session.id
                            })
                        );
                    }

                    if (availableActions.reset) {
                        secondaryActions.appendChild(
                            createActionButton({
                                label: 'Clear',
                                ariaLabel:
                                    `Clear subject activity for ${displayName}`,
                                className: 'is-danger',
                                action: 'reset',
                                sessionId: session.id
                            })
                        );
                    }

                    if (availableActions.delete) {
                        secondaryActions.appendChild(
                            createActionButton({
                                label: 'Delete',
                                ariaLabel:
                                    `Delete ${displayName}`,
                                className: 'is-danger',
                                action: 'delete',
                                sessionId: session.id
                            })
                        );
                    }
                }
            }

            main.appendChild(createSessionIcon());
            main.appendChild(identity);
            main.appendChild(controls);
            row.appendChild(main);
            if (hasSecondaryActions) {
                row.appendChild(secondaryActions);
            }
            elements.sessionList.appendChild(row);
        });
    }

    function showSafeView({ focus = false } = {}) {
        const elements = getElements();

        panelView = 'safe';
        manageHasSafeHistory = false;
        expandedSessionId = null;
        elements.safeView.hidden = false;
        elements.manageView.hidden = true;
        elements.dialog?.setAttribute('aria-labelledby', 'atlas-session-active-name');
        updateSafeView();

        if (focus) {
            window.requestAnimationFrame(() => {
                elements.manageButton?.focus({ preventScroll: true });
            });
        }
    }

    function showManageView({ focus = true, fromSafe = false } = {}) {
        const elements = getElements();

        panelView = 'manage';
        manageHasSafeHistory = Boolean(fromSafe);
        expandedSessionId = null;
        elements.safeView.hidden = true;
        elements.manageView.hidden = false;
        elements.backButton.hidden = !manageHasSafeHistory;
        elements.dialog?.setAttribute('aria-labelledby', 'atlas-session-manage-title');

        const searchable =
            hasStoredAtlasAccountSession();

        if (elements.searchLabel) {
            elements.searchLabel.hidden =
                !searchable;
        }

        if (elements.searchInput) {
            elements.searchInput.value = '';
            elements.searchInput.hidden =
                !searchable;
        }

        setCreateExpanded(false, { reset: true });
        renderManageView();

        if (focus) {
            window.requestAnimationFrame(() => {
                if (hasStoredAtlasAccountSession()) {
                    elements.searchInput?.focus({
                        preventScroll: true
                    });
                } else {
                    elements.dialog
                        ?.querySelector(
                            '#atlas-session-manage-title'
                        )
                        ?.focus({
                            preventScroll: true
                        });
                }
            });
        }
    }

    function getFocusableElements() {
        const dialog = getElements().dialog;

        if (!dialog) return [];

        return Array.from(dialog.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        )).filter(element => !element.hidden && element.getClientRects().length > 0);
    }

    function close() {
        const elements = getElements();

        if (!elements.overlay) return;

        const focusedElement = document.activeElement;
        if (
            isMobileSessionLayout() &&
            (
                focusedElement instanceof HTMLInputElement ||
                focusedElement instanceof HTMLTextAreaElement
            )
        ) {
            focusedElement.blur();
        }

        elements.overlay.classList.remove('is-open');
        elements.overlay.setAttribute('aria-hidden', 'true');
        resetMobileVisualViewport();
        document.body.style.overflow = previousBodyOverflow;

        const trigger = lastTrigger;
        lastTrigger = null;

        if (trigger?.isConnected) {
            window.requestAnimationFrame(() => {
                trigger.focus({ preventScroll: true });
            });
        }
    }

    function open(
        trigger = document.activeElement,
        openOptions = {}
    ) {
        const elements = getElements();

        const focusedElement =
            document.activeElement;

        if (
            focusedElement instanceof HTMLInputElement ||
            focusedElement instanceof HTMLTextAreaElement
        ) {
            focusedElement.blur();
        }

        if (
            window.AtlasSearch &&
            typeof AtlasSearch.isOpen === 'function' &&
            AtlasSearch.isOpen() &&
            typeof AtlasSearch.close === 'function'
        ) {
            AtlasSearch.close();
        }

        const initialView =
            openOptions.initialView === 'manage'
                ? 'manage'
                : openOptions.initialView === 'safe'
                    ? 'safe'
                    : getInitialView();

        if (!elements.overlay) return;

        lastTrigger = trigger instanceof HTMLElement
            ? trigger
            : null;

        previousBodyOverflow =
            document.body.style.overflow;

        if (initialView === 'manage') {
            showManageView({
                focus: false,
                fromSafe: false
            });
        } else {
            showSafeView();
        }

        elements.overlay.classList.add('is-open');
        elements.overlay.setAttribute(
            'aria-hidden',
            'false'
        );

        document.body.style.overflow = 'hidden';
        syncMobileVisualViewport();

        window.requestAnimationFrame(() => {
            if (initialView === 'manage') {
                if (
                    window.matchMedia(
                        '(max-width: 680px)'
                    ).matches ||
                    !hasStoredAtlasAccountSession()
                ) {
                    root
                        ?.querySelector('#atlas-session-manage-title')
                        ?.focus({ preventScroll: true });
                } else {
                    elements.searchInput?.focus({
                        preventScroll: true
                    });
                }
            } else {
                elements.activeName?.focus({
                    preventScroll: true
                });
            }
        });
    }

    function openCreateLearner(
        trigger = document.activeElement
    ) {
        open(
            trigger,
            { initialView: 'manage' }
        );

        setCreateExpanded(
            true,
            {
                // Mobile keyboards consume most of the learner panel.
                // Show the ready input immediately, but let the tutor
                // deliberately tap it before typing.
                focus:
                    !isMobileSessionLayout(),
                reset: true
            }
        );
    }

    async function runSessionAction(action, sessionId) {
        const Bridge = getBridge();
        const session = Bridge.readSessions().find(item => item.id === sessionId);

        if (!session) return;

        if (action === 'memory') {
            close();
            window.location.href =
                getLearnerMemoryUrl(session.id);
            return;
        }

        if (action === 'switch') {
            Bridge.setActiveSession(session.id);

            void ensureLearnerCloud()
                .then(Authority => {
                    if (Authority?.getState?.().active) {
                        return Authority.touchSession(session.id);
                    }
                    return null;
                })
                .catch(() => undefined);

            close();
            return;
        } else if (action === 'rename') {
            if (
                typeof options.onRenameSession ===
                'function'
            ) {
                await options.onRenameSession(session);
            } else {
                startRowAction('rename', session);
                return;
            }
        } else if (action === 'reset') {
            startRowAction('reset', session);
            return;
        } else if (action === 'confirm-reset') {
            await commitSessionReset(session.id);
            return;
        } else if (action === 'delete') {
            if (
                typeof options.onDeleteSession ===
                'function'
            ) {
                await options.onDeleteSession(session);
            } else {
                startRowAction('delete', session);
                return;
            }
        } else if (action === 'confirm-delete') {
            await commitSessionDelete(session.id);
            return;
        } else if (action === 'cancel-row-action') {
            cancelRowAction(session.id);
            return;
        }

        updateSafeView();
        renderManageView();

        if (Bridge.readSessions().some(item => item.id === session.id)) {
            focusSessionActionsToggle(session.id, { fallbackToSearch: true });
        } else {
            window.requestAnimationFrame(() => {
                getElements().searchInput?.focus({ preventScroll: true });
            });
        }
    }

    async function handlePanelClick(event) {
        const elements = getElements();

        if (event.target === elements.overlay) {
            close();
            return;
        }

        const createArea = event.target.closest('#atlas-session-create-form');

        if (!createArea && elements.createFields?.hidden === false) {
            setCreateExpanded(false, { reset: true });
        }

        if (event.target.closest('#atlas-session-create-toggle')) {
            setCreateExpanded(true, { focus: true });
            return;
        }

        const actionsToggle = event.target.closest(
            '[data-session-actions-toggle][data-session-id]'
        );

        if (actionsToggle) {
            toggleSessionActions(actionsToggle.dataset.sessionId);
            return;
        }

        const actionButton = event.target.closest('[data-action][data-session-id]');

        if (actionButton) {
            await runSessionAction(
                actionButton.dataset.action,
                actionButton.dataset.sessionId
            );
            return;
        }

        if (event.target.closest('[data-atlas-session-close]')) {
            close();
            return;
        }

        if (event.target.closest('#atlas-session-open-manage')) {
            showManageView({ fromSafe: true });
            return;
        }

        if (event.target.closest('#atlas-session-manage-back')) {
            if (manageHasSafeHistory) {
                showSafeView({ focus: true });
            }
            return;
        }

        if (event.target.closest('#atlas-session-primary-action')) {
            const activeSession = getBridge().readActiveSession();
            close();
            options.onPrimaryAction?.(activeSession);
        }
    }

    async function requestCreateLearner(
        name,
        {
            trigger = null,
            source = 'session-panel'
        } = {}
    ) {
        const cleanName = String(name || '').trim();

        if (!cleanName) {
            return {
                outcome: 'invalid',
                created: null
            };
        }

        let access = null;

        try {
            const Gate = await ensureCapabilityGate();

            access = await Gate.requireCapability(
                'canCreateLearner',
                {
                    action: 'create-learner',
                    destination: window.location.href,
                    context: {
                        name: cleanName,
                        source: String(source || 'session-panel')
                            .slice(0, 80)
                    },
                    trigger
                }
            );
        } catch (error) {
            return {
                outcome: 'unavailable',
                created: null,
                error
            };
        }

        if (access?.outcome !== 'allowed') {
            return {
                outcome:
                    access?.outcome || 'unavailable',
                created: null,
                access
            };
        }

        try {
            const Authority = await ensureLearnerCloud();

            if (
                !Authority ||
                !Authority.getState?.().active ||
                typeof Authority.createSession !== 'function'
            ) {
                throw new Error(
                    'Account learner storage is unavailable.'
                );
            }

            const created =
                await Authority.createSession(cleanName);

            if (!created) {
                return {
                    outcome: 'duplicate',
                    created: null,
                    access
                };
            }

            refresh();
            window.renderHome?.();

            return {
                outcome: 'allowed',
                created,
                access
            };
        } catch (error) {
            return {
                outcome: 'unavailable',
                created: null,
                access,
                error
            };
        }
    }

    async function installLearnerCapabilityResume() {
        try {
            const Gate = await ensureCapabilityGate();

            learnerResumeUnsubscribe?.();

            learnerResumeUnsubscribe =
                Gate.subscribeResume(
                    async payload => {
                        const intent = payload?.intent || null;

                        if (
                            !intent ||
                            intent.action !== 'create-learner'
                        ) {
                            return;
                        }

                        const name = String(
                            intent.context?.name || ''
                        ).trim();

                        if (!name) return;

                        const result =
                            await requestCreateLearner(
                                name,
                                {
                                    source: 'return-intent'
                                }
                            );

                        if (!result?.created) return;

                        if (mounted) {
                            setCreateExpanded(
                                false,
                                { reset: true }
                            );
                            refresh();
                        }

                        window.renderHome?.();
                    },
                    {
                        action: 'create-learner',
                        replay: true
                    }
                );
        } catch (error) {
            console.warn(
                '[AtlasSessionPanel] learner capability resume unavailable:',
                error
            );
        }
    }

    async function handleCreate(event) {
        event.preventDefault();

        const elements = getElements();
        const name = elements.createInput?.value.trim() || '';

        if (!name) return;

        if (elements.createError) {
            elements.createError.textContent = '';
        }

        const result =
            await requestCreateLearner(
                name,
                {
                    trigger:
                        event.submitter ||
                        elements.createToggle ||
                        elements.createInput,
                    source: 'session-panel'
                }
            );

        if (result?.outcome === 'auth-required') {
            return;
        }

        if (!result?.created) {
            if (elements.createError) {
                elements.createError.textContent =
                    result?.outcome === 'duplicate'
                        ? 'A learner with that name already exists.'
                        : 'Couldn’t add this learner right now. Try again.';
            }
            return;
        }

        setCreateExpanded(false, { reset: true });
        updateSafeView();
        renderManageView();
    }

    function handleKeydown(event) {
        if (!isOpen() || document.querySelector('dialog[open]')) return;

        if (event.key === 'Escape') {
            event.preventDefault();

            const expandedRow = event.target instanceof Element
                ? event.target.closest('.atlas-session-row.is-expanded')
                : null;

            if (
                panelView === 'manage' &&
                expandedRow?.dataset.sessionId === expandedSessionId
            ) {
                const sessionId = expandedSessionId;

                expandedSessionId = null;
                renderManageView();
                focusSessionActionsToggle(sessionId);
                return;
            }

            if (panelView === 'manage') {
                if (manageHasSafeHistory) {
                    showSafeView({ focus: true });
                } else {
                    close();
                }
            } else {
                close();
            }

            return;
        }

        if (event.key !== 'Tab') return;

        const focusable = getFocusableElements();

        if (!focusable.length) {
            event.preventDefault();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function refresh() {
        if (!mounted) return;

        updateSafeView();

        // Management rows are interaction-only UI. Keep closed-panel
        // refreshes lightweight and rebuild the list when Manage is visible.
        if (
            isOpen() &&
            panelView === 'manage'
        ) {
            renderManageView();
        }
    }

    function mount(nextOptions = {}) {
        options = { ...nextOptions };
        root = typeof options.root === 'string'
            ? document.querySelector(options.root)
            : options.root;

        if (!root) {
            root = document.createElement('div');
            root.id = 'atlas-session-panel-root';
            document.body.appendChild(root);
        }

        root.innerHTML = `
            <div class="atlas-session-overlay" id="atlas-session-panel-overlay" aria-hidden="true">
                <section class="atlas-session-panel" role="dialog" aria-modal="true"
                    aria-labelledby="atlas-session-active-name">
                    <header class="atlas-session-header">
                        <p class="atlas-session-header-label">Students</p>
                        <button class="atlas-session-close" type="button"
                            data-atlas-session-close aria-label="Close students panel">×</button>
                    </header>

                    <div class="atlas-session-safe" id="atlas-session-safe-view">
                        <h2 class="atlas-session-active-name" id="atlas-session-active-name" tabindex="-1"></h2>
                        <p class="atlas-session-context-title" id="atlas-session-context-title" hidden></p>
                        <p class="atlas-session-context-description" id="atlas-session-context-description" hidden></p>
                        <button class="atlas-session-primary" id="atlas-session-primary-action"
                            type="button" hidden></button>
                        <button class="atlas-session-manage-link" id="atlas-session-open-manage" type="button">
                            Choose or manage students
                        </button>
                    </div>

                    <div class="atlas-session-manage" id="atlas-session-manage-view" hidden>
                        <div class="atlas-session-manage-top">
                            <button class="atlas-session-back" id="atlas-session-manage-back" type="button">
                                ← Back
                            </button>
                            <h2 id="atlas-session-manage-title" tabindex="-1">Choose or manage students</h2>
                            <label class="atlas-session-search-label" for="atlas-session-search">
                                Search students
                            </label>
                            <input class="atlas-session-search" id="atlas-session-search" type="search"
                                placeholder="Search students" autocomplete="off">
                        </div>

                        <div class="atlas-session-list-scroll">
                            <div class="atlas-session-list" id="atlas-session-list"></div>
                            <p class="atlas-session-search-empty" id="atlas-session-search-empty" hidden>
                                No students match that search.
                            </p>
                        </div>

                        <form class="atlas-session-create" id="atlas-session-create-form">
                            <button class="atlas-session-create-toggle"
                                id="atlas-session-create-toggle" type="button"
                                aria-expanded="false"
                                aria-controls="atlas-session-create-fields">
                                + Add student
                            </button>

                            <div class="atlas-session-create-fields"
                                id="atlas-session-create-fields" hidden>
                                <label for="atlas-session-create-name">Student name</label>
                                <div class="atlas-session-create-row">
                                    <input id="atlas-session-create-name" type="text" maxlength="40"
                                        placeholder="Name this student" autocomplete="off">
                                    <button type="submit">Add</button>
                                </div>
                                <p class="atlas-session-create-error"
                                    id="atlas-session-create-error" role="alert"></p>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        `;

        const elements = getElements();

        elements.overlay.addEventListener('click', handlePanelClick);
        elements.searchInput.addEventListener('input', renderManageView);
        elements.createForm.addEventListener('submit', handleCreate);
        document.addEventListener('keydown', handleKeydown);
        window.addEventListener('atlas:session-change', refresh);
        window.addEventListener('atlas:learner-cloud-ready', refresh);
        window.addEventListener('resize', syncMobileVisualViewport);
        window.visualViewport?.addEventListener(
            'resize',
            syncMobileVisualViewport
        );
        window.visualViewport?.addEventListener(
            'scroll',
            syncMobileVisualViewport
        );
        root.addEventListener('focusin', event => {
            if (
                isMobileSessionLayout() &&
                (
                    event.target instanceof HTMLInputElement ||
                    event.target instanceof HTMLTextAreaElement
                )
            ) {
                window.requestAnimationFrame(syncMobileVisualViewport);
            }
        });
        window.addEventListener('storage', event => {
            if (event.key === 'atlas::sessions') {
                refresh();
            }
        });

        mounted = true;

        // The closed panel needs only its lightweight safe/session summary.
        // Preserve options.initialView for open(), where Manage is rendered
        // on demand if that is the surface's configured entry view.
        showSafeView();

        void installLearnerCapabilityResume();

        void ensureLearnerCloud()
            .then(() => refresh())
            .catch(() => refresh());

        return window.AtlasSessionPanel;
    }

    window.AtlasSessionPanel = {
        mount,
        open,
        openCreateLearner,
        close,
        refresh,
        showSafeView,
        showManageView,
        getSessionDisplayName,
        requestCreateLearner,
        isOpen
    };

    /*
     * Anonymous startup deliberately skips learner/cloud bootstrap. If the
     * tutor signs in without navigating away, activate that same existing
     * bootstrap chain now. AtlasLearnerSessionsCloud loads the continuity
     * authorities, whose ready events refresh Atlas Continue/Review state.
     *
     * Account publications also occur for entitlement changes, so react only
     * when authentication or account identity actually changes.
     */
    let observedAccountAuthenticated =
        hasStoredAtlasAccountSession();
    let observedAccountUserId =
        storedAtlasAccountUserId();

    window.addEventListener(
        'atlas:account-change',
        event => {
            const detail = event?.detail || {};
            const nextAuthenticated =
                detail.authenticated === true;
            const nextUserId =
                String(detail.userId || '').trim();

            const identityChanged =
                observedAccountAuthenticated !==
                    nextAuthenticated ||
                (
                    nextAuthenticated &&
                    observedAccountUserId &&
                    nextUserId &&
                    observedAccountUserId !== nextUserId
                );

            observedAccountAuthenticated =
                nextAuthenticated;
            observedAccountUserId =
                nextAuthenticated ? nextUserId : '';

            if (!identityChanged) {
                return;
            }

            // Reconcile visible state immediately. On sign-in this removes
            // anonymous-only setup before cloud hydration finishes.
            refresh();
            window.renderHome?.();

            if (!nextAuthenticated) {
                return;
            }

            void ensureLearnerCloud({ force: true })
                .then(() => {
                    refresh();
                    window.renderHome?.();
                })
                .catch(() => {
                    refresh();
                    window.renderHome?.();
                });
        }
    );
})();

/* ============================================================
   ATLAS SESSION PANEL — LIVE LEARNER CLOUD REFRESH
   Account-owned learners refresh when a tab becomes active again. Active
   learner selection remains tab-local. Compass repainting is requested
   through the single coalesced hub refresh boundary.
   ============================================================ */
(function () {
    'use strict';

    let learnerRefreshPromise = null;
    let lastRefreshAt = 0;

    function requestCompassHubRefresh() {
        try {
            window.dispatchEvent(
                new CustomEvent(
                    'atlas:compass-hub-refresh-request',
                    { detail: { source: 'learner-cloud' } }
                )
            );
        } catch { }
    }

    function refreshLearnersFromCloud() {
        const Authority =
            window.AtlasLearnerSessionsCloudAuthority || null;

        if (
            !Authority ||
            typeof Authority.initialize !== 'function'
        ) {
            return Promise.resolve(null);
        }

        const now = Date.now();

        if (learnerRefreshPromise) {
            return learnerRefreshPromise;
        }

        if (now - lastRefreshAt < 750) {
            return Promise.resolve(null);
        }

        lastRefreshAt = now;

        learnerRefreshPromise = Promise.resolve()
            .then(() => Authority.initialize({ force: true }))
            .then(result => {
                window.AtlasSessionPanel?.refresh?.();
                window.renderHome?.();
                requestCompassHubRefresh();
                return result;
            })
            .catch(error => {
                console.warn(
                    '[AtlasSessionPanel] Learner cloud refresh failed:',
                    error
                );
                return null;
            })
            .finally(() => {
                learnerRefreshPromise = null;
            });

        return learnerRefreshPromise;
    }

    let hasBlurred = false;
    let hasBeenHidden = document.hidden;

    function refreshAfterFocusReturn() {
        if (!hasBlurred || document.hidden) return;
        hasBlurred = false;
        void refreshLearnersFromCloud();
    }

    function refreshAfterPageRestore(event) {
        if (event?.persisted === true) {
            void refreshLearnersFromCloud();
        }
    }

    function refreshAfterVisibilityReturn() {
        if (document.hidden) {
            hasBeenHidden = true;
            return;
        }

        if (!hasBeenHidden) return;

        hasBeenHidden = false;
        void refreshLearnersFromCloud();
    }

    function patchOpen() {
        const Panel = window.AtlasSessionPanel;

        if (!Panel || Panel.__atlasLearnerLiveRefreshPatched) {
            return;
        }

        const originalOpen = Panel.open;

        if (typeof originalOpen === 'function') {
            Panel.open = function (...args) {
                void refreshLearnersFromCloud();
                return originalOpen.apply(this, args);
            };
        }

        Panel.__atlasLearnerLiveRefreshPatched = true;
    }

    window.addEventListener('blur', () => {
        hasBlurred = true;
    });
    window.addEventListener(
        'focus',
        refreshAfterFocusReturn
    );
    window.addEventListener(
        'pageshow',
        refreshAfterPageRestore
    );
    document.addEventListener(
        'visibilitychange',
        refreshAfterVisibilityReturn
    );

    patchOpen();
})();
