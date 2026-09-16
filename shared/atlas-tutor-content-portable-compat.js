/* ============================================================
   ATLAS TUTOR CONTENT — PORTABLE COMPATIBILITY

   Committed My Versions may be intentionally sparse: an override-only version
   can have a valid overrides map and an empty document object. Working drafts,
   by contrast, still require a complete structured document.

   This layer aligns portable validation/export with the live cloud authority
   without weakening draft validation or changing committed My Version data.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasTutorContentPortableCompat) return;

    const SCHEMA_VERSION = 2;
    const PORTABLE_SCHEMA_VERSION = 1;
    const LOCAL_OWNER_ID = 'local-tutor';
    const RETRY_LIMIT = 160;
    let attempts = 0;

    function isPlainObject(value) {
        return Boolean(
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
        );
    }

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function exactKeys(value, expected) {
        if (!isPlainObject(value)) return false;
        const keys = Object.keys(value).sort();
        const wanted = [...expected].sort();
        return keys.length === wanted.length &&
            keys.every((key, index) => key === wanted[index]);
    }

    function normalizeOverrides(value) {
        if (!isPlainObject(value)) return {};

        return Object.entries(value).reduce((result, [key, item]) => {
            if (key.trim() && typeof item === 'string') {
                result[key] = item;
            }
            return result;
        }, {});
    }

    function normalizeDocument(value) {
        if (!isPlainObject(value)) return null;
        try {
            return cloneJson(value);
        } catch {
            return null;
        }
    }

    function validateStructuredDocument(document, label, errors) {
        const Structured = window.AtlasStructuredSubject;

        if (
            !Structured ||
            typeof Structured.validateDocument !== 'function'
        ) {
            errors.push('Structured Subject validation is unavailable.');
            return;
        }

        const validation = Structured.validateDocument(document);
        if (!validation.valid) {
            validation.errors.forEach(error => {
                errors.push(`${label}: ${error}`);
            });
        }
    }

    function validateRecord(record, label, isDraft, errors) {
        if (!isPlainObject(record)) {
            errors.push(`${label} must be an object.`);
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

        if (!exactKeys(record, expectedKeys)) {
            errors.push(`${label} has an invalid shape.`);
        }

        const contentId = String(record.contentId || '').trim();
        if (!contentId) {
            errors.push(`${label} requires contentId.`);
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

        if (!Number.isInteger(record.revision) || record.revision < 0) {
            errors.push(`${label}.revision must be a non-negative integer.`);
        }

        if (!Number.isFinite(record.updatedAt) || record.updatedAt < 0) {
            errors.push(`${label}.updatedAt must be a non-negative number.`);
        }

        const overrides = normalizeOverrides(record.overrides);
        if (
            !isPlainObject(record.overrides) ||
            Object.keys(overrides).length !== Object.keys(record.overrides || {}).length
        ) {
            errors.push(`${label}.overrides must contain only string fields.`);
        }

        const document = normalizeDocument(record.document);
        if (!document) {
            errors.push(`${label}.document must be an object.`);
        } else {
            const hasDocument = Object.keys(document).length > 0;
            const hasOverrides = Object.keys(overrides).length > 0;

            if (isDraft || hasDocument) {
                validateStructuredDocument(
                    document,
                    `${label}.document`,
                    errors
                );
            } else if (!hasOverrides) {
                errors.push(
                    `${label} requires overrides or a complete document.`
                );
            }
        }

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

            if (!Number.isFinite(record.startedAt) || record.startedAt < 0) {
                errors.push(`${label}.startedAt must be a non-negative number.`);
            }
        }

        if (!contentId || !document) return null;

        return {
            schemaVersion: SCHEMA_VERSION,
            ownerId: LOCAL_OWNER_ID,
            contentId,
            baseContentVersion:
                typeof record.baseContentVersion === 'string'
                    ? record.baseContentVersion
                    : '',
            revision: Math.max(0, Math.floor(Number(record.revision) || 0)),
            updatedAt: Math.max(0, Number(record.updatedAt) || 0),
            overrides,
            document,
            ...(isDraft
                ? {
                    includedLiveSessionId:
                        typeof record.includedLiveSessionId === 'string' &&
                        record.includedLiveSessionId.trim()
                            ? record.includedLiveSessionId.trim()
                            : null,
                    activeViewId:
                        typeof record.activeViewId === 'string' &&
                        record.activeViewId.trim()
                            ? record.activeViewId.trim()
                            : 'view-cover',
                    startedAt: Math.max(
                        0,
                        Number(record.startedAt) ||
                        Number(record.updatedAt) ||
                        0
                    )
                }
                : {})
        };
    }

    function validatePortableData(payload) {
        const errors = [];

        if (!isPlainObject(payload)) {
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

        if (!exactKeys(payload, ['schemaVersion', 'versions', 'workingDrafts'])) {
            errors.push('Tutor Content data has an invalid shape.');
        }

        if (!Array.isArray(payload.versions)) {
            errors.push('Tutor Content versions must be an array.');
        }

        if (!Array.isArray(payload.workingDrafts)) {
            errors.push('Tutor Content workingDrafts must be an array.');
        }

        const versions = [];
        const versionIds = new Set();

        (Array.isArray(payload.versions) ? payload.versions : [])
            .forEach((record, index) => {
                const label = `Tutor Content version ${index + 1}`;
                const normalized = validateRecord(
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

        const workingDrafts = [];
        const draftIds = new Set();

        (Array.isArray(payload.workingDrafts)
            ? payload.workingDrafts
            : []
        ).forEach((record, index) => {
            const label = `Tutor Content working draft ${index + 1}`;
            const normalized = validateRecord(
                record,
                label,
                true,
                errors
            );
            if (!normalized) return;

            if (!versionIds.has(normalized.contentId)) {
                errors.push(
                    `${label} does not belong to a backed-up My Version.`
                );
            }

            if (draftIds.has(normalized.contentId)) {
                errors.push(
                    `${label} duplicates contentId ${normalized.contentId}.`
                );
                return;
            }

            draftIds.add(normalized.contentId);
            workingDrafts.push(normalized);
        });

        versions.sort((left, right) =>
            left.contentId.localeCompare(right.contentId)
        );
        workingDrafts.sort((left, right) =>
            left.contentId.localeCompare(right.contentId)
        );

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

    function install() {
        const Store = window.AtlasTutorContent;
        const Authority = window.AtlasTutorContentCloudAuthority;
        const Cloud = window.AtlasCloud;

        if (
            !Store ||
            !Authority ||
            !Cloud ||
            typeof Store.exportPortableData !== 'function' ||
            typeof Store.getWorkingDraft !== 'function' ||
            typeof Authority.useCloud !== 'function' ||
            typeof Cloud.listTutorContentVersions !== 'function'
        ) {
            attempts += 1;
            if (attempts < RETRY_LIMIT) {
                window.setTimeout(install, 50);
            }
            return;
        }

        const previousExportPortableData =
            Store.exportPortableData.bind(Store);
        const currentGetWorkingDraft =
            Store.getWorkingDraft.bind(Store);

        async function exportPortableData() {
            if (!(await Authority.useCloud())) {
                return previousExportPortableData();
            }

            const versions = await Cloud.listTutorContentVersions();
            const workingDrafts = [];

            for (const version of versions || []) {
                const contentId = String(version?.contentId || '').trim();
                if (!contentId) continue;

                const draft = await currentGetWorkingDraft(contentId);
                if (draft) workingDrafts.push(cloneJson(draft));
            }

            const validation = validatePortableData({
                schemaVersion: PORTABLE_SCHEMA_VERSION,
                versions: cloneJson(versions || []),
                workingDrafts
            });

            if (!validation.valid) {
                throw new Error(validation.errors.join(' '));
            }

            return validation.data;
        }

        Store.validatePortableData = validatePortableData;
        Store.exportPortableData = exportPortableData;

        window.AtlasTutorContentPortableCompat = Object.freeze({
            active: true,
            validatePortableData
        });
    }

    install();
})();
