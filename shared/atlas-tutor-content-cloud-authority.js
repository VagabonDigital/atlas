/* ============================================================
   ATLAS TUTOR CONTENT — CLOUD AUTHORITY

   Authenticated authority for committed Tutor Authorship / My Versions.

   Cloud authoritative when signed in:
   - committed My Version records

   Browser-local by design:
   - working drafts
   - Live Manipulation session drafts

   Local working drafts may resume only when they are newer than the
   committed cloud version. A stale browser draft must never mask a newer
   account-owned My Version from another browser/device.

   Signed-out behavior remains on the existing AtlasTutorContent boundary.
   No authenticated cloud write silently falls back to localStorage.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasTutorContentCloudAuthority) return;

    const Local = window.AtlasTutorContent;

    if (!Local) {
        console.error(
            '[AtlasTutorContentCloudAuthority] AtlasTutorContent is unavailable.'
        );
        return;
    }

    const SCHEMA_VERSION = 2;
    const PORTABLE_SCHEMA_VERSION = 1;
    const LOCAL_OWNER_ID = 'local-tutor';

    const original = Object.fromEntries(
        Object.entries(Local).map(([key, value]) => [
            key,
            typeof value === 'function' ? value.bind(Local) : value
        ])
    );

    const cloudVersionReads = new Map();

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function normalizeOverrides(overrides) {
        if (
            !overrides ||
            typeof overrides !== 'object' ||
            Array.isArray(overrides)
        ) {
            return {};
        }

        return Object.entries(overrides).reduce(
            (result, [fieldKey, value]) => {
                if (
                    typeof fieldKey === 'string' &&
                    fieldKey.trim() &&
                    typeof value === 'string'
                ) {
                    result[fieldKey] = value;
                }

                return result;
            },
            {}
        );
    }

    function normalizeDocument(document) {
        if (
            !document ||
            typeof document !== 'object' ||
            Array.isArray(document)
        ) {
            return null;
        }

        try {
            return JSON.parse(JSON.stringify(document));
        } catch {
            return null;
        }
    }

    function normalizeRecord(record, contentId) {
        if (
            !record ||
            typeof record !== 'object' ||
            Array.isArray(record)
        ) {
            return null;
        }

        const id = String(contentId || record.contentId || '').trim();
        if (!id) return null;

        return {
            schemaVersion: SCHEMA_VERSION,
            ownerId: LOCAL_OWNER_ID,
            contentId: id,
            baseContentVersion:
                typeof record.baseContentVersion === 'string'
                    ? record.baseContentVersion
                    : '',
            revision: Math.max(
                0,
                Math.floor(Number(record.revision) || 0)
            ),
            updatedAt: Math.max(
                0,
                Number(record.updatedAt) || 0
            ),
            overrides: normalizeOverrides(record.overrides),
            document: normalizeDocument(record.document)
        };
    }

    function mergeRecord(current, patch, contentId) {
        const base = normalizeRecord(current, contentId) || {
            schemaVersion: SCHEMA_VERSION,
            ownerId: LOCAL_OWNER_ID,
            contentId,
            baseContentVersion: '',
            revision: 0,
            updatedAt: 0,
            overrides: {},
            document: null
        };

        const nextPatch =
            patch &&
            typeof patch === 'object' &&
            !Array.isArray(patch)
                ? patch
                : {};

        const overrides = nextPatch.replaceOverrides === true
            ? normalizeOverrides(nextPatch.overrides)
            : {
                ...base.overrides,
                ...normalizeOverrides(nextPatch.overrides)
            };

        const removeOverrideKeys = Array.isArray(
            nextPatch.removeOverrideKeys
        )
            ? nextPatch.removeOverrideKeys
            : [];

        removeOverrideKeys.forEach(fieldKey => {
            if (typeof fieldKey === 'string') {
                delete overrides[fieldKey];
            }
        });

        const document = Object.prototype.hasOwnProperty.call(
            nextPatch,
            'document'
        )
            ? normalizeDocument(nextPatch.document)
            : base.document;

        return {
            ...base,
            baseContentVersion:
                typeof nextPatch.baseContentVersion === 'string'
                    ? nextPatch.baseContentVersion
                    : base.baseContentVersion,
            revision: base.revision + 1,
            updatedAt: Date.now(),
            overrides,
            document
        };
    }

    async function getAccountState() {
        if (!window.AtlasAccount || !window.AtlasCloud) {
            return {
                ready: true,
                authenticated: false,
                userId: null,
                email: null
            };
        }

        await AtlasAccount.initialize();
        return AtlasAccount.getState();
    }

    async function useCloud() {
        return Boolean((await getAccountState()).authenticated);
    }

    function readCloudVersion(contentId) {
        const id = String(contentId || '').trim();
        if (!id) return Promise.resolve(null);

        const existing = cloudVersionReads.get(id);
        if (existing) return existing;

        const pending = AtlasCloud.getTutorContentVersion(id);
        cloudVersionReads.set(id, pending);

        const release = () => {
            if (cloudVersionReads.get(id) === pending) {
                cloudVersionReads.delete(id);
            }
        };

        pending.then(release, release);
        return pending;
    }

    async function getVersion(contentId) {
        const id = String(contentId || '').trim();
        if (!id) return null;

        if (!(await useCloud())) {
            return original.getVersion(id);
        }

        return readCloudVersion(id);
    }

    async function getWorkingDraft(contentId) {
        const id = String(contentId || '').trim();
        if (!id) return null;

        const localDraft = await original.getWorkingDraft(id);
        if (!localDraft) return null;

        if (!(await useCloud())) {
            return localDraft;
        }

        const committed = await readCloudVersion(id);
        if (!committed) return localDraft;

        const draftUpdatedAt = Math.max(
            0,
            Number(localDraft.updatedAt) || 0
        );
        const committedUpdatedAt = Math.max(
            0,
            Number(committed.updatedAt) || 0
        );

        return committedUpdatedAt >= draftUpdatedAt
            ? null
            : localDraft;
    }

    async function saveVersion(contentId, patch = {}) {
        const id = String(contentId || '').trim();
        if (!id) return null;

        if (!(await useCloud())) {
            return original.saveVersion(id, patch);
        }

        let lastConflict = null;

        for (let attempt = 0; attempt < 3; attempt += 1) {
            const current = await AtlasCloud.getTutorContentVersion(id);
            const next = mergeRecord(current, patch, id);

            if (!next.document) {
                return null;
            }

            try {
                if (!current) {
                    return await AtlasCloud.createTutorContentVersion(next);
                }

                return await AtlasCloud.updateTutorContentVersion(
                    next,
                    current.revision
                );
            } catch (error) {
                if (
                    error?.code !== '23505' &&
                    error?.code !== 'ATLAS_REVISION_CONFLICT'
                ) {
                    throw error;
                }

                lastConflict = error;
            }
        }

        throw lastConflict || new Error(
            'Atlas could not save this My Version because it changed elsewhere.'
        );
    }

    async function deleteVersion(contentId) {
        const id = String(contentId || '').trim();
        if (!id) return false;

        if (!(await useCloud())) {
            return original.deleteVersion(id);
        }

        const current = await AtlasCloud.getTutorContentVersion(id);
        if (!current) return true;

        const deleted = await AtlasCloud.deleteTutorContentVersion(
            id,
            current.revision
        );

        if (!deleted) {
            const conflict = new Error(
                'This My Version changed elsewhere before deletion completed.'
            );
            conflict.code = 'ATLAS_REVISION_CONFLICT';
            throw conflict;
        }

        return true;
    }

    async function exportPortableData() {
        if (!(await useCloud())) {
            return original.exportPortableData();
        }

        const [versions, localData] = await Promise.all([
            AtlasCloud.listTutorContentVersions(),
            original.exportPortableData()
        ]);

        const payload = {
            schemaVersion: PORTABLE_SCHEMA_VERSION,
            versions: (versions || [])
                .map(version => normalizeRecord(
                    version,
                    version?.contentId
                ))
                .filter(Boolean),
            workingDrafts: Array.isArray(localData?.workingDrafts)
                ? cloneJson(localData.workingDrafts)
                : []
        };

        payload.versions.sort((left, right) =>
            left.contentId.localeCompare(right.contentId)
        );

        payload.workingDrafts.sort((left, right) =>
            left.contentId.localeCompare(right.contentId)
        );

        const validation = original.validatePortableData(payload);

        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        return validation.data;
    }

    async function restorePortableData(payload) {
        if (!(await useCloud())) {
            return original.restorePortableData(payload);
        }

        const validation = original.validatePortableData(payload);

        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        const error = new Error(
            'Signed-in cloud restore for Tutor Content is not available yet. Atlas did not change your cloud or local data.'
        );
        error.code = 'ATLAS_CLOUD_RESTORE_UNAVAILABLE';
        throw error;
    }

    Local.getVersion = getVersion;
    Local.getWorkingDraft = getWorkingDraft;
    Local.saveVersion = saveVersion;
    Local.deleteVersion = deleteVersion;
    Local.exportPortableData = exportPortableData;
    Local.restorePortableData = restorePortableData;
    Local.__atlasCloudAuthority = true;

    window.AtlasTutorContentCloudAuthority = Object.freeze({
        active: true,
        local: original,
        useCloud
    });
})();