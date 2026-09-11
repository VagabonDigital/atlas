/* ============================================================
   ATLAS ORIGINAL CURATION
   User-level visibility state for canonical Compass subjects.

   This store never mutates the canonical catalog. It only records
   whether a tutor has archived or deleted/suppressed an Atlas Original.
   ============================================================ */

(function () {
    'use strict';

    const SCHEMA_VERSION = 1;
    const STORAGE_KEY = 'atlas::originalCuration';
    const STATE_ARCHIVED = 'archived';
    const STATE_DELETED = 'deleted';

    function normalizeRegistryId(value) {
        const id = String(value || '').trim();
        return id.startsWith('compass:') ? id : '';
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
            items
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
                localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
            }
        } catch { }

        return normalized;
    }

    function writeStore(store) {
        const normalized = normalizeStore(store);

        try {
            if (Object.keys(normalized.items).length === 0) {
                localStorage.removeItem(STORAGE_KEY);
            } else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
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

    window.AtlasOriginalCuration = Object.freeze({
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
        isHidden,
        listArchived,
        listDeleted
    });
})();
