/* ============================================================
   ATLAS SESSION PANEL
   Small reusable session UI for Atlas surfaces.

   AtlasBridge owns session state. Integrating surfaces may add
   optional context, a primary action, and existing destructive
   action callbacks.
   ============================================================ */

(function () {
    'use strict';

    let root = null;
    let options = {};
    let panelView = 'safe';
    let manageHasSafeHistory = false;
    let expandedSessionId = null;
    let lastTrigger = null;
    let previousBodyOverflow = '';
    let mounted = false;

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
                elements.createInput?.focus({ preventScroll: true });
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

    function getDisplaySession(session) {
        return {
            ...session,
            name: getSessionDisplayName(session)
        };
    }

    function getAvailableSessionActions(session) {
        const isFallback = session.id === getBridge().defaultSessionId;

        return {
            rename: !isFallback && typeof options.onRenameSession === 'function',
            reset: typeof options.onResetSession === 'function',
            delete: !isFallback && typeof options.onDeleteSession === 'function'
        };
    }

    function updateSafeView() {
        const activeSession = getBridge().readActiveSession();
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

        return getBridge().readSessions().filter(session =>
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
        renderManageView();
        focusSessionActionsToggle(sessionId);
    }

    function renderManageView() {
        if (panelView !== 'manage') return;

        const Bridge = getBridge();
        const elements = getElements();
        const activeSession = Bridge.readActiveSession();
        const sessions = getFilteredSessions();

        if (!elements.sessionList || !elements.searchEmpty) return;

        elements.sessionList.innerHTML = '';
        elements.searchEmpty.hidden = sessions.length > 0;

        if (expandedSessionId) {
            const expandedSession = Bridge.readSessions().find(
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

            if (availableActions.rename) {
                secondaryActions.appendChild(createActionButton({
                    label: 'Rename',
                    ariaLabel: `Rename ${displayName}`,
                    action: 'rename',
                    sessionId: session.id
                }));
            }

            if (availableActions.reset) {
                secondaryActions.appendChild(createActionButton({
                    label: 'Clear',
                    ariaLabel: `Clear subject activity for ${displayName}`,
                    className: 'is-danger',
                    action: 'reset',
                    sessionId: session.id
                }));
            }

            if (availableActions.delete) {
                secondaryActions.appendChild(createActionButton({
                    label: 'Delete',
                    ariaLabel: `Delete ${displayName}`,
                    className: 'is-danger',
                    action: 'delete',
                    sessionId: session.id
                }));
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

        if (elements.searchInput) {
            elements.searchInput.value = '';
        }

        setCreateExpanded(false, { reset: true });
        renderManageView();

        if (focus) {
            window.requestAnimationFrame(() => {
                elements.searchInput?.focus({ preventScroll: true });
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

        elements.overlay.classList.remove('is-open');
        elements.overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = previousBodyOverflow;

        const trigger = lastTrigger;
        lastTrigger = null;

        if (trigger?.isConnected) {
            window.requestAnimationFrame(() => {
                trigger.focus({ preventScroll: true });
            });
        }
    }

    function open(trigger = document.activeElement) {
        const elements = getElements();
        const initialView = getInitialView();

        if (!elements.overlay) return;

        lastTrigger = trigger instanceof HTMLElement ? trigger : null;
        previousBodyOverflow = document.body.style.overflow;
        if (initialView === 'manage') {
            showManageView({ focus: false, fromSafe: false });
        } else {
            showSafeView();
        }
        elements.overlay.classList.add('is-open');
        elements.overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        window.requestAnimationFrame(() => {
            if (initialView === 'manage') {
                elements.searchInput?.focus({ preventScroll: true });
            } else {
                elements.activeName?.focus({ preventScroll: true });
            }
        });
    }

    async function runSessionAction(action, sessionId) {
        const Bridge = getBridge();
        const session = Bridge.readSessions().find(item => item.id === sessionId);

        if (!session) return;

        if (action === 'switch') {
            Bridge.setActiveSession(session.id);
        } else if (action === 'rename') {
            await options.onRenameSession?.(session);
        } else if (action === 'reset') {
            await options.onResetSession?.(session);
        } else if (action === 'delete') {
            await options.onDeleteSession?.(session);
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

    function handleCreate(event) {
        event.preventDefault();

        const elements = getElements();
        const name = elements.createInput?.value.trim() || '';

        if (!name) return;

        const created = getBridge().createSession(name);

        if (!created) {
            if (elements.createError) {
                elements.createError.textContent =
                    'A session with that name already exists.';
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

        if (panelView === 'manage') {
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
                        <p class="atlas-session-header-label">Session</p>
                        <button class="atlas-session-close" type="button"
                            data-atlas-session-close aria-label="Close session panel">×</button>
                    </header>

                    <div class="atlas-session-safe" id="atlas-session-safe-view">
                        <h2 class="atlas-session-active-name" id="atlas-session-active-name" tabindex="-1"></h2>
                        <p class="atlas-session-context-title" id="atlas-session-context-title" hidden></p>
                        <p class="atlas-session-context-description" id="atlas-session-context-description" hidden></p>
                        <button class="atlas-session-primary" id="atlas-session-primary-action"
                            type="button" hidden></button>
                        <button class="atlas-session-manage-link" id="atlas-session-open-manage" type="button">
                            Switch or manage sessions
                        </button>
                    </div>

                    <div class="atlas-session-manage" id="atlas-session-manage-view" hidden>
                        <div class="atlas-session-manage-top">
                            <button class="atlas-session-back" id="atlas-session-manage-back" type="button">
                                ← Back to current session
                            </button>
                            <h2 id="atlas-session-manage-title">Switch or manage sessions</h2>
                            <label class="atlas-session-search-label" for="atlas-session-search">
                                Search sessions
                            </label>
                            <input class="atlas-session-search" id="atlas-session-search" type="search"
                                placeholder="Search sessions" autocomplete="off">
                        </div>

                        <div class="atlas-session-list-scroll">
                            <div class="atlas-session-list" id="atlas-session-list"></div>
                            <p class="atlas-session-search-empty" id="atlas-session-search-empty" hidden>
                                No sessions match that search.
                            </p>
                        </div>

                        <form class="atlas-session-create" id="atlas-session-create-form">
                            <button class="atlas-session-create-toggle"
                                id="atlas-session-create-toggle" type="button"
                                aria-expanded="false"
                                aria-controls="atlas-session-create-fields">
                                + New session
                            </button>

                            <div class="atlas-session-create-fields"
                                id="atlas-session-create-fields" hidden>
                                <label for="atlas-session-create-name">New session</label>
                                <div class="atlas-session-create-row">
                                    <input id="atlas-session-create-name" type="text" maxlength="40"
                                        placeholder="Name this session" autocomplete="off">
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
        window.addEventListener('storage', event => {
            if (
                event.key === 'atlas::sessions' ||
                event.key === 'atlas::activeSessionId'
            ) {
                refresh();
            }
        });

        mounted = true;
        if (getInitialView() === 'manage') {
            showManageView({ focus: false, fromSafe: false });
        } else {
            showSafeView();
        }

        return window.AtlasSessionPanel;
    }

    window.AtlasSessionPanel = {
        mount,
        open,
        close,
        refresh,
        showSafeView,
        showManageView,
        getSessionDisplayName,
        isOpen
    };
})();
