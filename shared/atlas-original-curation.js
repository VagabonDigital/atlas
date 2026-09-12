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

    function installCompassHubIntegration() {
        if (
            window.__atlasOriginalCurationHubInstalled ||
            typeof window.getAtlasSubjects !== 'function' ||
            typeof window.renderHub !== 'function'
        ) {
            return;
        }

        window.__atlasOriginalCurationHubInstalled = true;

        const originalGetAtlasSubjects =
            window.getAtlasSubjects;
        const originalRestoreDialog =
            window.openRestoreAtlasOriginalHubDialog;

        window.getAtlasSubjects = function (options) {
            return sortSubjects(
                originalGetAtlasSubjects(options)
            );
        };

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

                await window.renderHub();
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

            await window.renderHub();
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

        Promise.resolve(window.renderHub())
            .then(decorateAtlasSubjectMenus)
            .catch(() => { });
    }

    window.addEventListener(
        'load',
        installCompassHubIntegration,
        { once: true }
    );
})();
