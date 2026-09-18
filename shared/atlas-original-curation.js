/* ============================================================
   ATLAS ORIGINAL CURATION
   User-level visibility and ordering state for canonical Compass subjects.

   This store never mutates the canonical catalog. It only records
   whether a tutor has archived/deleted an Atlas Original and any
   personal ordering applied to the Atlas Subjects shelf.
   ============================================================ */

(function () {
    'use strict';

    const SCHEMA_VERSION = 2;
    const STORAGE_KEY = 'atlas::originalCuration';
    const STATE_ARCHIVED = 'archived';
    const STATE_DELETED = 'deleted';
    const OWNED_DUPLICATE_DISABLED_CLASS =
        'is-duplicate-unavailable';
    const OWNED_DUPLICATE_STYLE_ID =
        'atlas-owned-duplicate-availability-style';
    const UNDO_TOAST_STYLE_ID =
        'atlas-undo-toast-style';
    const ARCHIVE_UNDO_DURATION = 7000;
    const DELETE_UNDO_DURATION = 7000;
    let hubToastTimer = null;

    function normalizeRegistryId(value) {
        const id = String(value || '').trim();
        return id.startsWith('compass:') ? id : '';
    }

    function normalizeOrder(value) {
        const seen = new Set();

        return (Array.isArray(value) ? value : [])
            .map(normalizeRegistryId)
            .filter(id => {
                if (!id || seen.has(id)) return false;
                seen.add(id);
                return true;
            });
    }

    function normalizeRecord(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }

        const state = value.state === STATE_ARCHIVED
            ? STATE_ARCHIVED
            : value.state === STATE_DELETED
                ? STATE_DELETED
                : '';

        if (!state) return null;

        return {
            state,
            updatedAt: Number.isFinite(Number(value.updatedAt))
                ? Number(value.updatedAt)
                : Date.now()
        };
    }

    function normalizeStore(value) {
        const candidate = value && typeof value === 'object' && !Array.isArray(value)
            ? value
            : {};

        const rawItems = candidate.items && typeof candidate.items === 'object' && !Array.isArray(candidate.items)
            ? candidate.items
            : {};

        const items = {};

        Object.entries(rawItems).forEach(([registryId, rawRecord]) => {
            const id = normalizeRegistryId(registryId);
            const record = normalizeRecord(rawRecord);
            if (id && record) items[id] = record;
        });

        return {
            schemaVersion: SCHEMA_VERSION,
            items,
            order: normalizeOrder(candidate.order)
        };
    }

    function readStore() {
        let parsed = null;

        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            parsed = raw ? JSON.parse(raw) : null;
        } catch { }

        const normalized = normalizeStore(parsed);

        try {
            if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
                if (
                    Object.keys(normalized.items).length === 0 &&
                    normalized.order.length === 0
                ) {
                    localStorage.removeItem(STORAGE_KEY);
                } else {
                    localStorage.setItem(
                        STORAGE_KEY,
                        JSON.stringify(normalized)
                    );
                }
            }
        } catch { }

        return normalized;
    }

    function writeStore(store) {
        const normalized = normalizeStore(store);

        try {
            if (
                Object.keys(normalized.items).length === 0 &&
                normalized.order.length === 0
            ) {
                localStorage.removeItem(STORAGE_KEY);
            } else {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(normalized)
                );
            }
            return true;
        } catch {
            return false;
        }
    }

    function getState(registryId) {
        const id = normalizeRegistryId(registryId);
        if (!id) return null;

        const record = readStore().items[id];
        return record ? { ...record } : null;
    }

    function listStates() {
        const store = readStore();
        return Object.entries(store.items).map(([registryId, record]) => ({
            registryId,
            state: record.state,
            updatedAt: record.updatedAt
        }));
    }

    function setState(registryId, state) {
        const id = normalizeRegistryId(registryId);
        if (!id || (state !== STATE_ARCHIVED && state !== STATE_DELETED)) {
            return false;
        }

        const store = readStore();
        store.items[id] = {
            state,
            updatedAt: Date.now()
        };

        return writeStore(store);
    }

    function archive(registryId) {
        return setState(registryId, STATE_ARCHIVED);
    }

    function deleteOriginal(registryId) {
        return setState(registryId, STATE_DELETED);
    }

    function restore(registryId) {
        const id = normalizeRegistryId(registryId);
        if (!id) return false;

        const store = readStore();
        if (!store.items[id]) return true;

        delete store.items[id];
        return writeStore(store);
    }

    function restoreAll() {
        const store = readStore();

        return writeStore({
            schemaVersion: SCHEMA_VERSION,
            items: {},
            order: store.order
        });
    }

    function isHidden(registryId) {
        const state = getState(registryId)?.state;
        return state === STATE_ARCHIVED || state === STATE_DELETED;
    }

    function listArchived() {
        return listStates().filter(item => item.state === STATE_ARCHIVED);
    }

    function listDeleted() {
        return listStates().filter(item => item.state === STATE_DELETED);
    }

    function sortSubjects(subjects) {
        const list = Array.isArray(subjects)
            ? [...subjects]
            : [];

        const ids = list
            .map(subject => normalizeRegistryId(subject?.registryId))
            .filter(Boolean);

        const store = readStore();
        const order = [...store.order];
        const seen = new Set(order);
        let changed = false;

        ids.forEach(id => {
            if (seen.has(id)) return;
            seen.add(id);
            order.push(id);
            changed = true;
        });

        if (changed) {
            writeStore({
                ...store,
                order
            });
        }

        const position = new Map(
            order.map((id, index) => [id, index])
        );

        return list.sort((left, right) => {
            const leftId = normalizeRegistryId(left?.registryId);
            const rightId = normalizeRegistryId(right?.registryId);

            const leftIndex = position.has(leftId)
                ? position.get(leftId)
                : Number.MAX_SAFE_INTEGER;
            const rightIndex = position.has(rightId)
                ? position.get(rightId)
                : Number.MAX_SAFE_INTEGER;

            return leftIndex - rightIndex;
        });
    }

    function moveVisible(registryId, direction, visibleIds, allIds) {
        const id = normalizeRegistryId(registryId);
        const step = Number(direction) < 0 ? -1 : 1;
        const visible = normalizeOrder(visibleIds);
        const all = normalizeOrder(allIds);

        const visibleIndex = visible.indexOf(id);
        const targetVisibleIndex = visibleIndex + step;

        if (
            !id ||
            visibleIndex < 0 ||
            targetVisibleIndex < 0 ||
            targetVisibleIndex >= visible.length
        ) {
            return false;
        }

        const targetId = visible[targetVisibleIndex];
        const store = readStore();
        const order = normalizeOrder([
            ...store.order,
            ...all,
            ...visible
        ]);

        const sourceIndex = order.indexOf(id);
        const targetIndex = order.indexOf(targetId);

        if (sourceIndex < 0 || targetIndex < 0) {
            return false;
        }

        [order[sourceIndex], order[targetIndex]] = [
            order[targetIndex],
            order[sourceIndex]
        ];

        return writeStore({
            ...store,
            order
        });
    }

    const api = Object.freeze({
        schemaVersion: SCHEMA_VERSION,
        states: Object.freeze({
            archived: STATE_ARCHIVED,
            deleted: STATE_DELETED
        }),
        getState,
        listStates,
        archive,
        deleteOriginal,
        restore,
        restoreAll,
        isHidden,
        listArchived,
        listDeleted,
        sortSubjects,
        moveVisible
    });

    window.AtlasOriginalCuration = api;

    function parseAtlasRegistryIdFromMenu(menu) {
        const editButton = menu?.querySelector(
            'button[onclick^="editAtlasOriginal("]'
        );

        const code = String(
            editButton?.getAttribute('onclick') || ''
        );

        const match = code.match(
            /^editAtlasOriginal\((.+?),\s*event\)/
        );

        if (!match) return '';

        try {
            return normalizeRegistryId(
                JSON.parse(match[1])
            );
        } catch {
            return '';
        }
    }

    function parseOwnedSubjectIdFromMenu(menu) {
        const duplicateButton = menu?.querySelector(
            'button[onclick^="duplicateOwnedSubject("]'
        );

        const code = String(
            duplicateButton?.getAttribute('onclick') || ''
        );

        const match = code.match(
            /^duplicateOwnedSubject\((.+?),\s*event\)/
        );

        if (!match) return '';

        try {
            return String(JSON.parse(match[1]) || '').trim();
        } catch {
            return '';
        }
    }

    async function getOwnedSubjectDuplicateAvailability(subjectId) {
        const id = String(subjectId || '').trim();
        const Subjects = window.AtlasTutorSubjects;

        if (
            !id ||
            !Subjects ||
            typeof Subjects.getBuildState !== 'function' ||
            typeof Subjects.getWorkingDraft !== 'function'
        ) {
            return {
                available: false,
                reason: 'Duplicate is temporarily unavailable.'
            };
        }

        try {
            const [buildState, workingDraft] = await Promise.all([
                Subjects.getBuildState(id),
                Subjects.getWorkingDraft(id)
            ]);

            if (
                buildState &&
                Number(buildState.completedStep || 0) < 18
            ) {
                return {
                    available: false,
                    reason: 'Available when this subject is ready.'
                };
            }

            if (workingDraft || buildState) {
                return {
                    available: false,
                    reason: 'Save changes before duplicating.'
                };
            }

            return {
                available: true,
                reason: ''
            };
        } catch {
            return {
                available: false,
                reason: 'Duplicate is temporarily unavailable.'
            };
        }
    }

    function ensureOwnedDuplicateAvailabilityStyles() {
        if (document.getElementById(OWNED_DUPLICATE_STYLE_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = OWNED_DUPLICATE_STYLE_ID;
        style.textContent = `
            .subject-card-menu button.${OWNED_DUPLICATE_DISABLED_CLASS} {
                opacity: 0.48;
                cursor: not-allowed;
                color: var(--text-muted);
            }
        `;

        document.head.appendChild(style);
    }

    function ensureUndoToastStyles() {
        if (document.getElementById(UNDO_TOAST_STYLE_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = UNDO_TOAST_STYLE_ID;
        style.textContent = `
            .hub-toast.has-action {
                display: flex;
                align-items: center;
                gap: 0.85rem;
            }

            .hub-toast-message {
                min-width: 0;
            }

            .hub-toast-action {
                flex: 0 0 auto;
                border: 0;
                padding: 0;
                background: transparent;
                color: var(--accent);
                font: inherit;
                font-weight: 600;
                cursor: pointer;
            }

            .hub-toast-action:hover,
            .hub-toast-action:focus-visible {
                text-decoration: underline;
                text-underline-offset: 0.18em;
            }

            .hub-toast-action:disabled {
                opacity: 0.55;
                cursor: default;
                text-decoration: none;
            }
        `;

        document.head.appendChild(style);
    }

    function showHubToast(text, options = {}) {
        let el = document.getElementById('hub-toast');

        if (!el) {
            el = document.createElement('div');
            el.id = 'hub-toast';
            el.className = 'hub-toast';
            el.setAttribute('role', 'status');
            document.body.appendChild(el);
        }

        const config =
            options &&
            typeof options === 'object' &&
            !Array.isArray(options)
                ? options
                : {};

        const message = String(text || '');
        const actionLabel = String(
            config.actionLabel || ''
        ).trim();
        const action =
            typeof config.action === 'function'
                ? config.action
                : null;
        const hasAction = !!actionLabel && !!action;
        const requestedDuration = Number(config.duration);
        const duration =
            Number.isFinite(requestedDuration) &&
            requestedDuration >= 1000
                ? requestedDuration
                : 3200;

        if (hubToastTimer) {
            clearTimeout(hubToastTimer);
            hubToastTimer = null;
        }

        el.classList.remove('visible');
        el.classList.toggle('has-action', hasAction);
        el.textContent = '';

        if (hasAction) {
            const messageEl = document.createElement('span');
            messageEl.className = 'hub-toast-message';
            messageEl.textContent = message;
            el.appendChild(messageEl);

            const actionButton = document.createElement('button');
            actionButton.type = 'button';
            actionButton.className = 'hub-toast-action';
            actionButton.textContent = actionLabel;
            actionButton.addEventListener(
                'click',
                async () => {
                    if (hubToastTimer) {
                        clearTimeout(hubToastTimer);
                        hubToastTimer = null;
                    }

                    actionButton.disabled = true;
                    el.classList.remove('visible');

                    try {
                        await action();
                    } catch (error) {
                        console.error(
                            '[Compass Hub] Undo action failed:',
                            error
                        );
                        showHubToast(
                            'Couldn’t undo that action.'
                        );
                    }
                }
            );
            el.appendChild(actionButton);
        } else {
            el.textContent = message;
        }

        requestAnimationFrame(() =>
            el.classList.add('visible')
        );

        hubToastTimer = setTimeout(() => {
            el.classList.remove('visible');
            hubToastTimer = null;
        }, duration);
    }

    async function decorateOwnedSubjectDuplicate(menu) {
        const subjectId = parseOwnedSubjectIdFromMenu(menu);

        if (!subjectId) return;

        const button = menu.querySelector(
            'button[onclick^="duplicateOwnedSubject("]'
        );

        if (!button) return;

        const availability =
            await getOwnedSubjectDuplicateAvailability(subjectId);

        if (!button.isConnected) return;

        button.classList.toggle(
            OWNED_DUPLICATE_DISABLED_CLASS,
            !availability.available
        );
        button.setAttribute(
            'aria-disabled',
            availability.available ? 'false' : 'true'
        );

        if (availability.available) {
            button.removeAttribute('title');
            button.setAttribute('aria-label', 'Duplicate');
            delete button.dataset.atlasDuplicateUnavailableReason;
            return;
        }

        button.title = availability.reason;
        button.setAttribute(
            'aria-label',
            `Duplicate. ${availability.reason}`
        );
        button.dataset.atlasDuplicateUnavailableReason =
            availability.reason;
    }

    function installCompassHubIntegration() {
        if (
            window.__atlasOriginalCurationHubInstalled ||
            typeof window.getAtlasSubjects !== 'function' ||
            typeof window.renderHub !== 'function'
        ) {
            return;
        }

        window.__atlasOriginalCurationHubInstalled = true;
        ensureOwnedDuplicateAvailabilityStyles();
        ensureUndoToastStyles();

        const originalGetAtlasSubjects =
            window.getAtlasSubjects;
        const originalRestoreDialog =
            window.openRestoreAtlasOriginalHubDialog;
        const originalDuplicateOwnedSubject =
            window.duplicateOwnedSubject;
        const originalArchiveAtlasOriginal =
            window.archiveAtlasOriginal;
        const originalOpenOwnedSubjectDeleteDialog =
            window.openOwnedSubjectDeleteDialog;
        const originalConfirmOwnedSubjectDialog =
            window.confirmOwnedSubjectDialog;
        const originalOpenAtlasOriginalDeleteDialog =
            window.openAtlasOriginalDeleteDialog;
        const Subjects = window.AtlasTutorSubjects;
        const originalDeleteSubject =
            Subjects?.deleteSubject?.bind(Subjects);
        let pendingOwnedArchiveId = '';
        let pendingAtlasArchive = null;
        let openedOwnedDeleteSubjectId = '';
        let ownedDeleteInterceptId = '';
        let pendingOwnedDeleteToastId = '';
        let pendingAtlasDelete = null;

        function removeOwnedSubjectRegistryProjection(subjectId) {
            try {
                const registryId =
                    window.getOwnedSubjectRegistryId?.(
                        subjectId
                    ) || '';

                if (
                    registryId &&
                    typeof window.AtlasBridge?.removeItem ===
                        'function'
                ) {
                    window.AtlasBridge.removeItem(registryId);
                }
            } catch { }
        }

        async function beginOwnedSubjectDelete(subjectId) {
            const id = String(subjectId || '').trim();

            if (
                !id ||
                !Subjects ||
                typeof Subjects.beginPendingDelete !== 'function'
            ) {
                return false;
            }

            const record =
                await Subjects.beginPendingDelete(
                    id,
                    DELETE_UNDO_DURATION
                );

            if (!record) return false;

            pendingOwnedDeleteToastId = id;
            removeOwnedSubjectRegistryProjection(id);
            return true;
        }

        async function undoOwnedSubjectDelete(subjectId) {
            if (
                !Subjects ||
                typeof Subjects.cancelPendingDelete !== 'function'
            ) {
                throw new Error(
                    'Subject deletion can no longer be undone.'
                );
            }

            const subject =
                await Subjects.cancelPendingDelete(
                    subjectId
                );

            if (!subject) {
                throw new Error(
                    'The subject has already been permanently deleted.'
                );
            }

            window.syncOwnedSubjectRegistryProjection?.(
                subject
            );

            await (window.requestCompassHubRender?.() || Promise.resolve());
            showHubToast('Subject restored.');
        }

        async function reconcilePendingDeletes() {
            if (
                !Subjects ||
                typeof Subjects.reconcilePendingDeletes !== 'function'
            ) {
                return;
            }

            const result =
                await Subjects.reconcilePendingDeletes();
            const pending =
                Array.isArray(result?.pending)
                    ? result.pending
                    : [];
            const finalized =
                Array.isArray(result?.finalized)
                    ? result.finalized
                    : [];

            finalized.forEach(subjectId =>
                removeOwnedSubjectRegistryProjection(
                    subjectId
                )
            );

            pending.forEach(record =>
                removeOwnedSubjectRegistryProjection(
                    record.subjectId
                )
            );

            if (!pending.length) return;

            const latest = pending
                .slice()
                .sort(
                    (left, right) =>
                        Number(right.createdAt || 0) -
                        Number(left.createdAt || 0)
                )[0];
            const remaining = Math.max(
                1000,
                Number(latest.deleteAt || 0) - Date.now()
            );

            showHubToast(
                'Subject deleted.',
                {
                    duration: remaining,
                    actionLabel: 'Undo',
                    action: () =>
                        undoOwnedSubjectDelete(
                            latest.subjectId
                        )
                }
            );
        }

        if (
            Subjects &&
            originalDeleteSubject
        ) {
            Subjects.deleteSubject = async function (
                subjectId,
                ...args
            ) {
                const id = String(subjectId || '').trim();

                if (
                    id &&
                    ownedDeleteInterceptId === id
                ) {
                    ownedDeleteInterceptId = '';
                    return beginOwnedSubjectDelete(id);
                }

                return originalDeleteSubject(
                    subjectId,
                    ...args
                );
            };
        }

        if (
            Subjects &&
            typeof Subjects.setSubjectLibraryPlacement === 'function'
        ) {
            const originalSetSubjectLibraryPlacement =
                Subjects.setSubjectLibraryPlacement;

            Subjects.setSubjectLibraryPlacement =
                async function (
                    subjectId,
                    patch = {}
                ) {
                    const id = String(subjectId || '').trim();
                    const candidate =
                        patch &&
                        typeof patch === 'object' &&
                        !Array.isArray(patch)
                            ? patch
                            : {};
                    const isArchive =
                        id &&
                        Object.prototype.hasOwnProperty.call(
                            candidate,
                            'archived'
                        ) &&
                        candidate.archived === true;

                    const result =
                        await originalSetSubjectLibraryPlacement.call(
                            this,
                            subjectId,
                            patch
                        );

                    if (result && isArchive) {
                        pendingOwnedArchiveId = id;
                    }

                    return result;
                };
        }

        async function captureAtlasOriginalSessionPositions(
            registryId
        ) {
            if (
                !Subjects ||
                typeof Subjects.getSubjectSessionIds !== 'function' ||
                typeof Subjects.getSessionSubjects !== 'function'
            ) {
                return [];
            }

            try {
                const sessionIds =
                    await Subjects.getSubjectSessionIds({
                        kind: 'atlas-subject',
                        id: registryId
                    });

                return Promise.all(
                    sessionIds.map(async sessionId => {
                        const refs =
                            await Subjects.getSessionSubjects(
                                sessionId
                            );

                        return {
                            sessionId,
                            index: Math.max(
                                0,
                                refs.findIndex(ref =>
                                    ref.kind === 'atlas-subject' &&
                                    ref.id === registryId
                                )
                            )
                        };
                    })
                );
            } catch {
                return [];
            }
        }

        async function undoOwnedSubjectArchive(subjectId) {
            if (
                !Subjects ||
                typeof Subjects.setSubjectLibraryPlacement !== 'function'
            ) {
                throw new Error(
                    'Owned subject restore is unavailable.'
                );
            }

            const restored =
                await Subjects.setSubjectLibraryPlacement(
                    subjectId,
                    {
                        archived: false
                    }
                );

            if (!restored) {
                throw new Error(
                    'Owned subject restore failed.'
                );
            }

            window.setOwnedSubjectRegistryArchived?.(
                subjectId,
                false
            );

            await (window.requestCompassHubRender?.() || Promise.resolve());
            showHubToast('Subject restored.');
        }

        async function undoAtlasOriginalArchive(context) {
            if (!context?.registryId) {
                throw new Error(
                    'Atlas Original restore context is missing.'
                );
            }

            if (
                Subjects &&
                typeof Subjects.getSessionSubjects === 'function' &&
                typeof Subjects.setSessionSubjects === 'function'
            ) {
                for (const placement of context.sessionPositions) {
                    const refs =
                        await Subjects.getSessionSubjects(
                            placement.sessionId
                        );

                    const alreadyPresent = refs.some(ref =>
                        ref.kind === 'atlas-subject' &&
                        ref.id === context.registryId
                    );

                    if (alreadyPresent) continue;

                    const next = [...refs];
                    const index = Math.min(
                        Math.max(
                            Number(placement.index) || 0,
                            0
                        ),
                        next.length
                    );

                    next.splice(
                        index,
                        0,
                        {
                            kind: 'atlas-subject',
                            id: context.registryId
                        }
                    );

                    const saved =
                        await Subjects.setSessionSubjects(
                            placement.sessionId,
                            next
                        );

                    if (!saved) {
                        throw new Error(
                            'Atlas Original session restore failed.'
                        );
                    }
                }
            }

            if (!restore(context.registryId)) {
                throw new Error(
                    'Atlas Original restore failed.'
                );
            }

            await (window.requestCompassHubRender?.() || Promise.resolve());
            showHubToast('Atlas Original restored.');
        }

        window.showToast = function (
            text,
            options = {}
        ) {
            const message = String(text || '');

            if (
                pendingOwnedArchiveId &&
                message.startsWith('Subject archived.')
            ) {
                const subjectId = pendingOwnedArchiveId;
                pendingOwnedArchiveId = '';

                showHubToast(
                    'Subject archived.',
                    {
                        duration: ARCHIVE_UNDO_DURATION,
                        actionLabel: 'Undo',
                        action: () =>
                            undoOwnedSubjectArchive(
                                subjectId
                            )
                    }
                );
                return;
            }

            if (
                pendingOwnedDeleteToastId &&
                message === 'Subject deleted.'
            ) {
                const subjectId =
                    pendingOwnedDeleteToastId;
                pendingOwnedDeleteToastId = '';

                Promise.resolve(
                    Subjects?.getPendingDelete?.(subjectId)
                ).then(record => {
                    if (!record) {
                        showHubToast(message, options);
                        return;
                    }

                    showHubToast(
                        'Subject deleted.',
                        {
                            duration: Math.max(
                                1000,
                                Number(record.deleteAt || 0) -
                                    Date.now()
                            ),
                            actionLabel: 'Undo',
                            action: () =>
                                undoOwnedSubjectDelete(
                                    subjectId
                                )
                        }
                    );
                });
                return;
            }

            if (
                pendingAtlasArchive &&
                message.startsWith(
                    'Atlas Original archived.'
                )
            ) {
                const context = pendingAtlasArchive;
                pendingAtlasArchive = null;

                showHubToast(
                    'Atlas Original archived.',
                    {
                        duration: ARCHIVE_UNDO_DURATION,
                        actionLabel: 'Undo',
                        action: () =>
                            undoAtlasOriginalArchive(
                                context
                            )
                    }
                );
                return;
            }

            if (
                pendingAtlasDelete &&
                message.startsWith(
                    'Atlas Original deleted'
                )
            ) {
                const context = pendingAtlasDelete;
                pendingAtlasDelete = null;

                showHubToast(
                    'Atlas Original deleted.',
                    {
                        duration: DELETE_UNDO_DURATION,
                        actionLabel: 'Undo',
                        action: () =>
                            undoAtlasOriginalArchive(
                                context
                            )
                    }
                );
                return;
            }

            if (
                message.startsWith(
                    'Couldn’t archive this subject.'
                )
            ) {
                pendingOwnedArchiveId = '';
            }

            if (
                message.startsWith(
                    'Couldn’t archive this Atlas Original.'
                )
            ) {
                pendingAtlasArchive = null;
            }

            showHubToast(message, options);
        };

        if (
            typeof originalOpenOwnedSubjectDeleteDialog ===
                'function'
        ) {
            window.openOwnedSubjectDeleteDialog =
                async function (
                    subjectId,
                    event
                ) {
                    openedOwnedDeleteSubjectId =
                        String(subjectId || '').trim();

                    return originalOpenOwnedSubjectDeleteDialog.call(
                        this,
                        subjectId,
                        event
                    );
                };
        }

        if (
            typeof originalConfirmOwnedSubjectDialog ===
                'function'
        ) {
            window.confirmOwnedSubjectDialog =
                async function (...args) {
                    const dialogTitle = String(
                        document.getElementById(
                            'owned-subject-dialog-title'
                        )?.textContent || ''
                    ).trim();
                    const isOwnedDelete =
                        dialogTitle === 'Delete subject?' &&
                        !!openedOwnedDeleteSubjectId;

                    if (isOwnedDelete) {
                        ownedDeleteInterceptId =
                            openedOwnedDeleteSubjectId;
                    }

                    try {
                        return await originalConfirmOwnedSubjectDialog.call(
                            this,
                            ...args
                        );
                    } finally {
                        ownedDeleteInterceptId = '';

                        if (isOwnedDelete) {
                            openedOwnedDeleteSubjectId = '';
                        }
                    }
                };
        }

        if (
            typeof originalOpenAtlasOriginalDeleteDialog ===
                'function'
        ) {
            window.openAtlasOriginalDeleteDialog =
                async function (
                    registryId,
                    event
                ) {
                    const id = normalizeRegistryId(
                        registryId
                    );

                    pendingAtlasDelete = id
                        ? {
                            registryId: id,
                            sessionPositions:
                                await captureAtlasOriginalSessionPositions(
                                    id
                                )
                        }
                        : null;

                    return originalOpenAtlasOriginalDeleteDialog.call(
                        this,
                        registryId,
                        event
                    );
                };
        }

        if (typeof originalArchiveAtlasOriginal === 'function') {
            window.archiveAtlasOriginal = async function (
                registryId,
                event
            ) {
                event?.preventDefault?.();
                event?.stopPropagation?.();

                const id = normalizeRegistryId(registryId);

                pendingAtlasArchive = id
                    ? {
                        registryId: id,
                        sessionPositions:
                            await captureAtlasOriginalSessionPositions(
                                id
                            )
                    }
                    : null;

                try {
                    return await originalArchiveAtlasOriginal.call(
                        this,
                        registryId,
                        event
                    );
                } finally {
                    if (
                        pendingAtlasArchive?.registryId === id
                    ) {
                        pendingAtlasArchive = null;
                    }
                }
            };
        }

        if (
            originalGetAtlasSubjects
                .__atlasCurationSorted !== true
        ) {
            window.getAtlasSubjects = function (options) {
                return sortSubjects(
                    originalGetAtlasSubjects(options)
                );
            };
        }

        if (typeof originalDuplicateOwnedSubject === 'function') {
            window.duplicateOwnedSubject = async function (
                subjectId,
                event
            ) {
                const availability =
                    await getOwnedSubjectDuplicateAvailability(
                        subjectId
                    );

                if (!availability.available) {
                    event?.preventDefault?.();
                    event?.stopPropagation?.();
                    window.showToast?.(availability.reason);
                    return null;
                }

                return originalDuplicateOwnedSubject.call(
                    this,
                    subjectId,
                    event
                );
            };
        }

        async function moveAtlasOriginalFromHub(
            registryId,
            direction,
            event
        ) {
            event?.preventDefault?.();
            event?.stopPropagation?.();

            try {
                window.closeOwnedSubjectMenus?.();

                const visible = window.getAtlasSubjects();
                const all = window.getAtlasSubjects({
                    includeCuratedHidden: true
                });

                const moved = moveVisible(
                    registryId,
                    direction,
                    visible.map(subject => subject.registryId),
                    all.map(subject => subject.registryId)
                );

                if (!moved) return;

                await (window.requestCompassHubRender?.() || Promise.resolve());
            } catch (error) {
                console.error(
                    '[Compass Hub] Atlas Subject reorder failed:',
                    error
                );
                window.showToast?.(
                    'Couldn’t move this Atlas Subject.'
                );
            }
        }

        function decorateAtlasSubjectMenus() {
            const visible = window.getAtlasSubjects();
            const visibleIds = visible
                .map(subject => subject.registryId)
                .filter(Boolean);

            document
                .querySelectorAll('.subject-card-menu')
                .forEach(menu => {
                    void decorateOwnedSubjectDuplicate(menu);

                    const registryId =
                        parseAtlasRegistryIdFromMenu(menu);

                    if (!registryId) return;

                    const index = visibleIds.indexOf(registryId);
                    const canMoveEarlier = index > 0;
                    const canMoveLater =
                        index >= 0 && index < visibleIds.length - 1;

                    const signature = [
                        registryId,
                        canMoveEarlier ? '1' : '0',
                        canMoveLater ? '1' : '0'
                    ].join(':');

                    if (
                        menu.dataset.atlasOrderSignature ===
                        signature
                    ) {
                        return;
                    }

                    menu
                        .querySelectorAll('[data-atlas-order-action]')
                        .forEach(button => button.remove());

                    const anchor =
                        menu.querySelector(
                            'button[onclick^="archiveAtlasOriginal("], button[onclick^="openAtlasOriginalDeleteDialog("]'
                        );

                    const addButton = (label, direction) => {
                        const button =
                            document.createElement('button');

                        button.type = 'button';
                        button.setAttribute('role', 'menuitem');
                        button.dataset.atlasOrderAction =
                            direction < 0 ? 'earlier' : 'later';
                        button.textContent = label;
                        button.addEventListener('click', event => {
                            moveAtlasOriginalFromHub(
                                registryId,
                                direction,
                                event
                            );
                        });

                        if (anchor) {
                            menu.insertBefore(button, anchor);
                        } else {
                            menu.appendChild(button);
                        }
                    };

                    if (canMoveEarlier) {
                        addButton('Move earlier', -1);
                    }

                    if (canMoveLater) {
                        addButton('Move later', 1);
                    }

                    menu.dataset.atlasOrderSignature = signature;
                });
        }

        async function isPristineOwnedAtlasSubject(
            registryId,
            subjectId
        ) {
            const Subjects = window.AtlasTutorSubjects;
            const Content = window.AtlasTutorContent;

            if (
                !Subjects ||
                typeof Subjects.getSubject !== 'function'
            ) {
                return false;
            }

            const record = await Subjects.getSubject(subjectId);
            const provenance =
                record?.provenance &&
                typeof record.provenance === 'object'
                    ? record.provenance
                    : null;

            if (
                !record ||
                Number(record.revision) !== 1 ||
                provenance?.kind !== 'atlas-original-owned' ||
                provenance?.sourceWorld !== 'compass'
            ) {
                return false;
            }

            const sourceId = normalizeRegistryId(
                provenance.sourceContentId ||
                (
                    provenance.sourceSubjectId
                        ? 'compass:' + provenance.sourceSubjectId
                        : ''
                )
            );

            if (sourceId !== normalizeRegistryId(registryId)) {
                return false;
            }

            if (
                Content &&
                typeof Content.getVersion === 'function'
            ) {
                const savedVersion = await Content.getVersion(sourceId);
                if (savedVersion) return false;
            }

            return true;
        }

        async function restorePristineOwnedAtlasSubject(
            registryId,
            subjectId,
            event
        ) {
            event?.preventDefault?.();
            event?.stopPropagation?.();
            window.closeOwnedSubjectMenus?.();

            const Subjects = window.AtlasTutorSubjects;
            const source =
                window.getAtlasOriginalSubject?.(registryId);

            if (
                !Subjects ||
                typeof Subjects.deleteSubject !== 'function' ||
                !source
            ) {
                throw new Error(
                    'Atlas restore dependencies are unavailable.'
                );
            }

            await window.migrateOwnedSubjectSessionHomesToAtlas?.(
                subjectId,
                registryId
            );

            const ownedRegistryId =
                window.getOwnedSubjectRegistryId?.(subjectId) || '';

            const deleted = await Subjects.deleteSubject(subjectId);

            if (!deleted) {
                throw new Error(
                    'Owned subject removal failed.'
                );
            }

            try {
                if (
                    ownedRegistryId &&
                    typeof window.AtlasBridge?.removeItem === 'function'
                ) {
                    window.AtlasBridge.removeItem(ownedRegistryId);
                }
            } catch { }

            if (!restore(registryId)) {
                throw new Error(
                    'Atlas source suppression could not be cleared.'
                );
            }

            await (window.requestCompassHubRender?.() || Promise.resolve());
            window.showToast?.('Atlas Original restored.');
        }

        if (typeof originalRestoreDialog === 'function') {
            window.openRestoreAtlasOriginalHubDialog =
                async function ({
                    registryId,
                    subjectId = '',
                    event = null
                } = {}) {
                    const sourceRegistryId =
                        normalizeRegistryId(registryId);
                    const ownedSubjectId =
                        String(subjectId || '').trim();

                    if (!sourceRegistryId || !ownedSubjectId) {
                        return originalRestoreDialog({
                            registryId,
                            subjectId,
                            event
                        });
                    }

                    let pristine = false;

                    try {
                        pristine =
                            await isPristineOwnedAtlasSubject(
                                sourceRegistryId,
                                ownedSubjectId
                            );
                    } catch {
                        pristine = false;
                    }

                    if (!pristine) {
                        return originalRestoreDialog({
                            registryId,
                            subjectId,
                            event
                        });
                    }

                    try {
                        await restorePristineOwnedAtlasSubject(
                            sourceRegistryId,
                            ownedSubjectId,
                            event
                        );
                    } catch (error) {
                        console.error(
                            '[Compass Hub] Direct pristine Atlas restore failed:',
                            error
                        );
                        window.showToast?.(
                            'Couldn’t restore this Atlas Original.'
                        );
                    }
                };
        }

        const main = document.getElementById('hub-main');

        if (main && typeof MutationObserver === 'function') {
            const observer = new MutationObserver(() => {
                decorateAtlasSubjectMenus();
            });

            observer.observe(main, {
                childList: true,
                subtree: true
            });
        }

        window.addEventListener(
            'focus',
            decorateAtlasSubjectMenus
        );

        void reconcilePendingDeletes();

        Promise.resolve(window.requestCompassHubRender?.())
            .then(decorateAtlasSubjectMenus)
            .catch(() => { });
    }

    window.addEventListener(
        'load',
        installCompassHubIntegration,
        { once: true }
    );
})();