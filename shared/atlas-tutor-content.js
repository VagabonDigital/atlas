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
    const PORTABLE_SCHEMA_VERSION = 1;
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

    function listKeysWithPrefix(storage, prefix) {
        const keys = [];

        for (let index = 0; index < storage.length; index += 1) {
            const key = storage.key(index);

            if (key && key.startsWith(prefix)) {
                keys.push(key);
            }
        }

        return keys.sort();
    }

    function readJsonStrict(storage, key) {
        const raw = storage.getItem(key);

        if (raw === null) {
            throw new Error(`Missing Tutor Content record: ${key}`);
        }

        try {
            return JSON.parse(raw);
        } catch {
            throw new Error(`Invalid Tutor Content JSON: ${key}`);
        }
    }

    function readPortableRecord(storage, key, prefix) {
        const record = readJsonStrict(storage, key);
        let storageContentId = '';

        try {
            storageContentId = decodeURIComponent(
                key.slice(prefix.length)
            );
        } catch {
            throw new Error(`Invalid Tutor Content key: ${key}`);
        }

        if (record?.contentId !== storageContentId) {
            throw new Error(
                `Tutor Content record does not match its key: ${key}`
            );
        }

        return record;
    }

    function hasExactKeys(value, expectedKeys) {
        const keys = Object.keys(value).sort();
        const expected = [...expectedKeys].sort();

        return keys.length === expected.length &&
            keys.every((key, index) => key === expected[index]);
    }

    function validateAuthoredDocument(document, label, errors) {
        const Structured = window.AtlasStructuredSubject;

        if (
            !Structured ||
            typeof Structured.validateDocument !== 'function'
        ) {
            errors.push(
                'Structured Subject validation is unavailable.'
            );
            return;
        }

        const validation = Structured.validateDocument(document);

        if (!validation.valid) {
            validation.errors.forEach(error => {
                errors.push(`${label}: ${error}`);
            });
        }
    }

    function validatePortableRecord(record, label, isDraft, errors) {
        if (
            !record ||
            typeof record !== 'object' ||
            Array.isArray(record)
        ) {
            errors.push(`${label} must be an object.`);
            return null;
        }

        const contentId =
            typeof record.contentId === 'string'
                ? record.contentId.trim()
                : '';

        if (!contentId) {
            errors.push(`${label} requires contentId.`);
            return null;
        }

        const expectedKeys = [
            'schemaVersion',
            'ownerId',
            'contentId',
            'baseContentVersion',
            'revision',
            'updatedAt',
            'overrides',
            'document',
            ...(isDraft
                ? [
                    'includedLiveSessionId',
                    'activeViewId',
                    'startedAt'
                ]
                : [])
        ];

        if (!hasExactKeys(record, expectedKeys)) {
            errors.push(`${label} has an invalid shape.`);
        }

        if (record.schemaVersion !== SCHEMA_VERSION) {
            errors.push(
                `${label} must use Tutor Content schema ${SCHEMA_VERSION}.`
            );
        }

        if (record.ownerId !== LOCAL_OWNER_ID) {
            errors.push(`${label} has an unsupported owner.`);
        }

        if (typeof record.baseContentVersion !== 'string') {
            errors.push(`${label}.baseContentVersion must be a string.`);
        }

        if (
            !Number.isInteger(record.revision) ||
            record.revision < 0
        ) {
            errors.push(`${label}.revision must be a non-negative integer.`);
        }

        if (
            !Number.isFinite(record.updatedAt) ||
            record.updatedAt < 0
        ) {
            errors.push(`${label}.updatedAt must be a non-negative number.`);
        }

        if (
            !record.overrides ||
            typeof record.overrides !== 'object' ||
            Array.isArray(record.overrides) ||
            Object.entries(record.overrides).some(
                ([fieldKey, value]) =>
                    !fieldKey.trim() || typeof value !== 'string'
            )
        ) {
            errors.push(`${label}.overrides must contain only string fields.`);
        }

        validateAuthoredDocument(
            record.document,
            `${label}.document`,
            errors
        );

        if (isDraft) {
            if (
                record.includedLiveSessionId !== null &&
                (
                    typeof record.includedLiveSessionId !== 'string' ||
                    !record.includedLiveSessionId.trim()
                )
            ) {
                errors.push(
                    `${label}.includedLiveSessionId must be null or a non-empty string.`
                );
            }

            if (
                typeof record.activeViewId !== 'string' ||
                !record.activeViewId.trim()
            ) {
                errors.push(`${label}.activeViewId must be a non-empty string.`);
            }

            if (
                !Number.isFinite(record.startedAt) ||
                record.startedAt < 0
            ) {
                errors.push(`${label}.startedAt must be a non-negative number.`);
            }
        }

        const normalized = isDraft
            ? normalizeWorkingDraft(record, {
                contentId,
                ownerId: LOCAL_OWNER_ID
            })
            : normalizeRecord(record, {
                contentId,
                ownerId: LOCAL_OWNER_ID
            });

        if (!normalized || !normalized.document) {
            errors.push(`${label} cannot be serialized safely.`);
            return null;
        }

        return normalized;
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

    function validatePortableData(payload) {
        const errors = [];

        if (
            !payload ||
            typeof payload !== 'object' ||
            Array.isArray(payload)
        ) {
            return {
                valid: false,
                errors: ['Tutor Content data must be an object.']
            };
        }

        if (payload.schemaVersion !== PORTABLE_SCHEMA_VERSION) {
            errors.push(
                `Tutor Content portable schema must be ${PORTABLE_SCHEMA_VERSION}.`
            );
        }

        if (!hasExactKeys(payload, [
            'schemaVersion',
            'versions',
            'workingDrafts'
        ])) {
            errors.push('Tutor Content data has an invalid shape.');
        }

        if (!Array.isArray(payload.versions)) {
            errors.push('Tutor Content versions must be an array.');
        }

        if (!Array.isArray(payload.workingDrafts)) {
            errors.push('Tutor Content workingDrafts must be an array.');
        }

        const versions = [];
        const workingDrafts = [];
        const versionIds = new Set();
        const draftIds = new Set();

        (Array.isArray(payload.versions) ? payload.versions : [])
            .forEach((record, index) => {
                const label = `Tutor Content version ${index + 1}`;
                const normalized = validatePortableRecord(
                    record,
                    label,
                    false,
                    errors
                );

                if (!normalized) return;

                if (versionIds.has(normalized.contentId)) {
                    errors.push(
                        `${label} duplicates contentId ${normalized.contentId}.`
                    );
                    return;
                }

                versionIds.add(normalized.contentId);
                versions.push(normalized);
            });

        (Array.isArray(payload.workingDrafts)
            ? payload.workingDrafts
            : []
        ).forEach((record, index) => {
            const label = `Tutor Content working draft ${index + 1}`;
            const normalized = validatePortableRecord(
                record,
                label,
                true,
                errors
            );

            if (!normalized) return;

            if (draftIds.has(normalized.contentId)) {
                errors.push(
                    `${label} duplicates contentId ${normalized.contentId}.`
                );
                return;
            }

            draftIds.add(normalized.contentId);
            workingDrafts.push(normalized);
        });

        return {
            valid: errors.length === 0,
            errors,
            ...(errors.length === 0
                ? {
                    data: {
                        schemaVersion: PORTABLE_SCHEMA_VERSION,
                        versions,
                        workingDrafts
                    }
                }
                : {})
        };
    }

    async function exportPortableData() {
        const versions = listKeysWithPrefix(
            localStorage,
            VERSION_PREFIX
        ).map(key => readPortableRecord(
            localStorage,
            key,
            VERSION_PREFIX
        ));

        const workingDrafts = listKeysWithPrefix(
            localStorage,
            WORKING_DRAFT_PREFIX
        ).map(key => readPortableRecord(
            localStorage,
            key,
            WORKING_DRAFT_PREFIX
        ));

        const validation = validatePortableData({
            schemaVersion: PORTABLE_SCHEMA_VERSION,
            versions,
            workingDrafts
        });

        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        validation.data.versions.sort((left, right) =>
            left.contentId.localeCompare(right.contentId)
        );
        validation.data.workingDrafts.sort((left, right) =>
            left.contentId.localeCompare(right.contentId)
        );

        return validation.data;
    }

    async function restorePortableData(payload) {
        const validation = validatePortableData(payload);

        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        const existingKeys = [
            ...listKeysWithPrefix(localStorage, VERSION_PREFIX),
            ...listKeysWithPrefix(localStorage, WORKING_DRAFT_PREFIX)
        ];

        existingKeys.forEach(key => {
            localStorage.removeItem(key);
        });

        validation.data.versions.forEach(record => {
            localStorage.setItem(
                versionStorageKey(record.contentId),
                JSON.stringify(record)
            );
        });

        validation.data.workingDrafts.forEach(record => {
            localStorage.setItem(
                workingDraftStorageKey(record.contentId),
                JSON.stringify(record)
            );
        });

        return true;
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
        clearLiveDraft,

        exportPortableData,
        validatePortableData,
        restorePortableData
    };
})();
