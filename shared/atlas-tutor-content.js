/* ============================================================
   ATLAS TUTOR CONTENT
   Shared persistence boundary for Tutor Authorship.

   Current storage:
   - My Version: localStorage
   - Live Manipulation: sessionStorage

   Consumers must use this asynchronous API rather than reading or
   writing browser storage directly. The implementation can later move
   to authenticated cloud persistence without changing the editor.
   ============================================================ */

(function () {
    'use strict';

    const SCHEMA_VERSION = 2;
    const LOCAL_OWNER_ID = 'local-tutor';
    const VERSION_PREFIX = 'atlas::tutorContent::version::';
    const WORKING_DRAFT_PREFIX = 'atlas::tutorContent::workingDraft::';
    const LIVE_PREFIX = 'atlas::tutorContent::live::';

    function encodePart(value) {
        return encodeURIComponent(String(value || ''));
    }

    function versionStorageKey(contentId) {
        return `${VERSION_PREFIX}${encodePart(contentId)}`;
    }

    function workingDraftStorageKey(contentId) {
        return `${WORKING_DRAFT_PREFIX}${encodePart(contentId)}`;
    }

    function liveStorageKey(sessionId, contentId) {
        return [
            LIVE_PREFIX,
            encodePart(sessionId),
            '::',
            encodePart(contentId)
        ].join('');
    }

    function readJson(storage, key) {
        try {
            const raw = storage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function writeJson(storage, key, value) {
        try {
            storage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }

    function removeValue(storage, key) {
        try {
            storage.removeItem(key);
            return true;
        } catch {
            return false;
        }
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
                if (typeof fieldKey !== 'string' || !fieldKey.trim()) {
                    return result;
                }

                if (typeof value === 'string') {
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

    function normalizeRecord(record, {
        contentId,
        sessionId = null,
        ownerId = LOCAL_OWNER_ID
    }) {
        if (
            !record ||
            typeof record !== 'object' ||
            Array.isArray(record)
        ) {
            return null;
        }

        const normalizedContentId = String(contentId || '').trim();

        if (!normalizedContentId) return null;

        const normalizedSessionId = sessionId === null
            ? null
            : String(sessionId || '').trim();

        if (sessionId !== null && !normalizedSessionId) {
            return null;
        }

        return {
            schemaVersion: SCHEMA_VERSION,
            ownerId: String(record.ownerId || ownerId),
            contentId: normalizedContentId,
            ...(normalizedSessionId
                ? { sessionId: normalizedSessionId }
                : {}),
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

    function normalizeWorkingDraft(record, identity) {
        const normalized = normalizeRecord(record, identity);

        if (!normalized) return null;

        const includedLiveSessionId =
            typeof record.includedLiveSessionId === 'string' &&
            record.includedLiveSessionId.trim()
                ? record.includedLiveSessionId.trim()
                : null;

        const activeViewId =
            typeof record.activeViewId === 'string' &&
            record.activeViewId.trim()
                ? record.activeViewId.trim()
                : 'view-cover';

        return {
            ...normalized,
            includedLiveSessionId,
            activeViewId,
            startedAt: Math.max(
                0,
                Number(record.startedAt) ||
                normalized.updatedAt ||
                Date.now()
            )
        };
    }

    function mergeRecord(current, patch, identity) {
        const base = normalizeRecord(current, identity) || {
            schemaVersion: SCHEMA_VERSION,
            ownerId: identity.ownerId || LOCAL_OWNER_ID,
            contentId: identity.contentId,
            ...(identity.sessionId
                ? { sessionId: identity.sessionId }
                : {}),
            baseContentVersion: '',
            revision: 0,
            updatedAt: 0,
            overrides: {},
            document: null
        };

        const nextPatch = patch && typeof patch === 'object'
            ? patch
            : {};

        const overrides = nextPatch.replaceOverrides === true
            ? normalizeOverrides(nextPatch.overrides)
            : {
                ...base.overrides,
                ...normalizeOverrides(nextPatch.overrides)
            };

        const document = Object.prototype.hasOwnProperty.call(
            nextPatch,
            'document'
        )
            ? normalizeDocument(nextPatch.document)
            : base.document;

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

    async function getVersion(contentId) {
        const identity = {
            contentId: String(contentId || '').trim(),
            ownerId: LOCAL_OWNER_ID
        };

        if (!identity.contentId) return null;

        return normalizeRecord(
            readJson(
                localStorage,
                versionStorageKey(identity.contentId)
            ),
            identity
        );
    }

    async function saveVersion(contentId, patch = {}) {
        const identity = {
            contentId: String(contentId || '').trim(),
            ownerId: LOCAL_OWNER_ID
        };

        if (!identity.contentId) return null;

        const current = await getVersion(identity.contentId);
        const next = mergeRecord(current, patch, identity);

        return writeJson(
            localStorage,
            versionStorageKey(identity.contentId),
            next
        )
            ? next
            : null;
    }

    async function deleteVersion(contentId) {
        const cleanContentId = String(contentId || '').trim();

        if (!cleanContentId) return false;

        return removeValue(
            localStorage,
            versionStorageKey(cleanContentId)
        );
    }

    async function getWorkingDraft(contentId) {
        const identity = {
            contentId: String(contentId || '').trim(),
            ownerId: LOCAL_OWNER_ID
        };

        if (!identity.contentId) return null;

        return normalizeWorkingDraft(
            readJson(
                localStorage,
                workingDraftStorageKey(identity.contentId)
            ),
            identity
        );
    }

    async function saveWorkingDraft(contentId, patch = {}) {
        const identity = {
            contentId: String(contentId || '').trim(),
            ownerId: LOCAL_OWNER_ID
        };

        if (!identity.contentId) return null;

        const current = await getWorkingDraft(identity.contentId);
        const nextPatch = patch && typeof patch === 'object'
            ? patch
            : {};

        const merged = mergeRecord(current, nextPatch, identity);
        const next = {
            ...merged,
            includedLiveSessionId:
                Object.prototype.hasOwnProperty.call(
                    nextPatch,
                    'includedLiveSessionId'
                )
                    ? (
                        typeof nextPatch.includedLiveSessionId === 'string' &&
                        nextPatch.includedLiveSessionId.trim()
                            ? nextPatch.includedLiveSessionId.trim()
                            : null
                    )
                    : current?.includedLiveSessionId || null,
            activeViewId:
                typeof nextPatch.activeViewId === 'string' &&
                nextPatch.activeViewId.trim()
                    ? nextPatch.activeViewId.trim()
                    : current?.activeViewId || 'view-cover',
            startedAt: current?.startedAt || Date.now()
        };

        return writeJson(
            localStorage,
            workingDraftStorageKey(identity.contentId),
            next
        )
            ? next
            : null;
    }

    async function clearWorkingDraft(contentId) {
        const cleanContentId = String(contentId || '').trim();

        if (!cleanContentId) return false;

        return removeValue(
            localStorage,
            workingDraftStorageKey(cleanContentId)
        );
    }

    async function getLiveDraft(sessionId, contentId) {
        const identity = {
            sessionId: String(sessionId || '').trim(),
            contentId: String(contentId || '').trim(),
            ownerId: LOCAL_OWNER_ID
        };

        if (!identity.sessionId || !identity.contentId) {
            return null;
        }

        return normalizeRecord(
            readJson(
                sessionStorage,
                liveStorageKey(
                    identity.sessionId,
                    identity.contentId
                )
            ),
            identity
        );
    }

    async function saveLiveDraft(
        sessionId,
        contentId,
        patch = {}
    ) {
        const identity = {
            sessionId: String(sessionId || '').trim(),
            contentId: String(contentId || '').trim(),
            ownerId: LOCAL_OWNER_ID
        };

        if (!identity.sessionId || !identity.contentId) {
            return null;
        }

        const current = await getLiveDraft(
            identity.sessionId,
            identity.contentId
        );

        const next = mergeRecord(current, patch, identity);

        return writeJson(
            sessionStorage,
            liveStorageKey(
                identity.sessionId,
                identity.contentId
            ),
            next
        )
            ? next
            : null;
    }

    async function clearLiveDraft(sessionId, contentId) {
        const cleanSessionId = String(sessionId || '').trim();
        const cleanContentId = String(contentId || '').trim();

        if (!cleanSessionId || !cleanContentId) {
            return false;
        }

        return removeValue(
            sessionStorage,
            liveStorageKey(cleanSessionId, cleanContentId)
        );
    }

    window.AtlasTutorContent = {
        schemaVersion: SCHEMA_VERSION,
        localOwnerId: LOCAL_OWNER_ID,

        getVersion,
        saveVersion,
        deleteVersion,

        getWorkingDraft,
        saveWorkingDraft,
        clearWorkingDraft,

        getLiveDraft,
        saveLiveDraft,
        clearLiveDraft
    };
})();