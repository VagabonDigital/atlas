/* ============================================================
   ATLAS PORTABLE DATA
   Versioned Backup & Restore boundary for browser-local Atlas data.

   This module coordinates existing persistence owners. It deliberately
   excludes tab/session state, live manipulation, wrap-up drafts, catalog
   projections, launch URLs, legacy keys, and unrelated browser storage.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasPortableData) return;

    const FORMAT = 'atlas-backup';
    const VERSION = 1;
    const DEFAULT_SESSION_ID = 'default';
    const SESSION_ATMOSPHERE_KEY =
        'atlas::sessionAtmosphereImages';
    const WELCOME_FAVORITES_KEY =
        'atlas::welcomeImageFavorites';
    const MAX_WELCOME_FAVORITES = 12;
    const TRANSIENT_PREFIXES = [
        'atlas::tutorContent::live::',
        'atlas::compassWrapUpDraft::',
        'atlas::activeCompassWrapUpDraft::'
    ];
    const BACKUP_DATA_KEYS = [
        'sessions',
        'sessionStates',
        'ledger',
        'handoffs',
        'preferences',
        'appearanceBySession',
        'sessionAtmosphereImages',
        'welcomeImageFavorites',
        'tutorContent',
        'tutorSubjects'
    ];

    function isPlainObject(value) {
        if (!value || typeof value !== 'object') return false;

        const prototype = Object.getPrototypeOf(value);
        return prototype === Object.prototype || prototype === null;
    }

    function hasExactKeys(value, expectedKeys) {
        if (!isPlainObject(value)) return false;

        const keys = Object.keys(value).sort();
        const expected = [...expectedKeys].sort();

        return keys.length === expected.length &&
            keys.every((key, index) => key === expected[index]);
    }

    function validateJsonValue(value, label, errors) {
        const seen = new WeakSet();

        function visit(candidate, path, depth) {
            if (depth > 100) {
                errors.push(`${path} is nested too deeply.`);
                return;
            }

            if (
                candidate === null ||
                typeof candidate === 'string' ||
                typeof candidate === 'boolean'
            ) {
                return;
            }

            if (typeof candidate === 'number') {
                if (!Number.isFinite(candidate)) {
                    errors.push(`${path} contains a non-finite number.`);
                }
                return;
            }

            if (!candidate || typeof candidate !== 'object') {
                errors.push(`${path} is not JSON-safe.`);
                return;
            }

            if (seen.has(candidate)) {
                errors.push(`${path} contains a circular reference.`);
                return;
            }

            seen.add(candidate);

            if (Array.isArray(candidate)) {
                candidate.forEach((item, index) => {
                    visit(item, `${path}[${index}]`, depth + 1);
                });
                return;
            }

            if (!isPlainObject(candidate)) {
                errors.push(`${path} must be a plain object.`);
                return;
            }

            Object.entries(candidate).forEach(([key, item]) => {
                if (
                    key === '__proto__' ||
                    key === 'prototype' ||
                    key === 'constructor'
                ) {
                    errors.push(`${path} contains an unsafe property name.`);
                    return;
                }

                visit(item, `${path}.${key}`, depth + 1);
            });
        }

        visit(value, label, 0);
    }

    function cloneJson(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function requireOwners() {
        const Bridge = window.AtlasBridge;
        const TutorContent = window.AtlasTutorContent;
        const TutorSubjects = window.AtlasTutorSubjects;

        if (!Bridge) {
            throw new Error('AtlasBridge is unavailable.');
        }

        if (
            !TutorContent ||
            typeof TutorContent.exportPortableData !== 'function' ||
            typeof TutorContent.validatePortableData !== 'function' ||
            typeof TutorContent.restorePortableData !== 'function'
        ) {
            throw new Error('AtlasTutorContent portable data is unavailable.');
        }

        if (
            !TutorSubjects ||
            typeof TutorSubjects.exportPortableData !== 'function' ||
            typeof TutorSubjects.validatePortableData !== 'function' ||
            typeof TutorSubjects.restorePortableData !== 'function'
        ) {
            throw new Error('AtlasTutorSubjects portable data is unavailable.');
        }

        return { Bridge, TutorContent, TutorSubjects };
    }

    function readStoredJson(key, fallback) {
        const raw = localStorage.getItem(key);

        if (raw === null) return cloneJson(fallback);

        try {
            return JSON.parse(raw);
        } catch {
            throw new Error(`Atlas cannot read ${key}.`);
        }
    }

    function sanitizeSessionState(value) {
        if (Array.isArray(value)) {
            return value.map(sanitizeSessionState);
        }

        if (!isPlainObject(value)) return value;

        return Object.entries(value).reduce((result, [key, item]) => {
            if (key !== 'launchUrl') {
                result[key] = sanitizeSessionState(item);
            }
            return result;
        }, {});
    }

    function containsLaunchUrl(value) {
        if (Array.isArray(value)) {
            return value.some(containsLaunchUrl);
        }

        if (!isPlainObject(value)) return false;

        return Object.entries(value).some(([key, item]) =>
            key === 'launchUrl' || containsLaunchUrl(item)
        );
    }

    function canonicalSessions(sessions) {
        return sessions.map(session => ({
            id: session.id,
            name: session.name,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            lastActiveAt: session.lastActiveAt
        }));
    }

    function selectSessionMap(value, sessionIds, transform) {
        if (!isPlainObject(value)) return {};

        return Object.entries(value).reduce((result, [sessionId, item]) => {
            if (sessionIds.has(sessionId)) {
                result[sessionId] = transform
                    ? transform(item)
                    : cloneJson(item);
            }
            return result;
        }, {});
    }

    function selectSessionStringMap(
        value,
        sessionIds,
        allowedValues
    ) {
        if (!isPlainObject(value)) return {};

        return Object.entries(value).reduce((result, [sessionId, item]) => {
            if (
                sessionIds.has(sessionId) &&
                typeof item === 'string' &&
                item.trim() &&
                (!allowedValues || allowedValues.includes(item))
            ) {
                result[sessionId] = item;
            }
            return result;
        }, {});
    }

    function selectLedger(ledger, sessionIds) {
        const entries = isPlainObject(ledger?.entries)
            ? ledger.entries
            : {};

        return {
            schemaVersion: 1,
            updatedAt: Number(ledger?.updatedAt) || Date.now(),
            entries: Object.entries(entries).reduce(
                (result, [entryId, entry]) => {
                    if (
                        isPlainObject(entry) &&
                        entry.kind === 'language' &&
                        entry.status === 'saved' &&
                        sessionIds.has(entry.sessionId)
                    ) {
                        result[entryId] = cloneJson(entry);
                    }
                    return result;
                },
                {}
            )
        };
    }

    function selectHandoffs(handoffs, sessionIds) {
        if (!isPlainObject(handoffs)) return {};

        return Object.entries(handoffs).reduce(
            (result, [storageId, handoff]) => {
                if (
                    isPlainObject(handoff) &&
                    handoff.v === 1 &&
                    sessionIds.has(handoff.sessionId)
                ) {
                    result[storageId] = cloneJson(handoff);
                }
                return result;
            },
            {}
        );
    }

    function selectPreferences(preferences) {
        return {
            schemaVersion: 1,
            upgradeVisibility: preferences?.upgradeVisibility
        };
    }

    function selectWelcomeFavorites(value) {
        return Array.from(new Set(
            (Array.isArray(value) ? value : [])
                .map(item =>
                    typeof item === 'string'
                        ? item.trim()
                        : ''
                )
                .filter(Boolean)
        )).slice(0, MAX_WELCOME_FAVORITES);
    }

    async function exportBackup() {
        const {
            Bridge,
            TutorContent,
            TutorSubjects
        } = requireOwners();
        const sessions = canonicalSessions(
            Bridge.readSessions()
        );
        const sessionIds = new Set(
            sessions.map(session => session.id)
        );
        const registry = Bridge.readRegistry();
        const ledger = Bridge.readLedger();
        const handoffs = Bridge.readJson(
            Bridge.keys.handoffs,
            {}
        );
        const preferences = Bridge.readPreferences();
        const appearance = Bridge.readJson(
            Bridge.keys.appearanceBySession,
            {}
        );
        const atmosphere = readStoredJson(
            SESSION_ATMOSPHERE_KEY,
            {}
        );
        const favorites = readStoredJson(
            WELCOME_FAVORITES_KEY,
            []
        );
        const [tutorContent, tutorSubjects] = await Promise.all([
            TutorContent.exportPortableData(),
            TutorSubjects.exportPortableData()
        ]);

        const backup = {
            format: FORMAT,
            version: VERSION,
            exportedAt: new Date().toISOString(),
            data: {
                sessions,
                sessionStates: selectSessionMap(
                    registry.sessionStates,
                    sessionIds,
                    sanitizeSessionState
                ),
                ledger: selectLedger(ledger, sessionIds),
                handoffs: selectHandoffs(handoffs, sessionIds),
                preferences: selectPreferences(preferences),
                appearanceBySession: selectSessionStringMap(
                    appearance,
                    sessionIds,
                    ['light', 'night']
                ),
                sessionAtmosphereImages: selectSessionStringMap(
                    atmosphere,
                    sessionIds,
                    null
                ),
                welcomeImageFavorites:
                    selectWelcomeFavorites(favorites),
                tutorContent,
                tutorSubjects
            }
        };

        const validation = validateBackup(backup);

        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        return validation.backup;
    }

    function validateSessions(value, errors) {
        if (!Array.isArray(value)) {
            errors.push('data.sessions must be an array.');
            return { sessions: [], sessionIds: new Set() };
        }

        const sessions = [];
        const sessionIds = new Set();

        value.forEach((session, index) => {
            const label = `data.sessions[${index}]`;

            if (
                !hasExactKeys(session, [
                    'id',
                    'name',
                    'createdAt',
                    'updatedAt',
                    'lastActiveAt'
                ])
            ) {
                errors.push(`${label} has an invalid shape.`);
                return;
            }

            const id =
                typeof session.id === 'string'
                    ? session.id.trim()
                    : '';
            const name =
                typeof session.name === 'string'
                    ? session.name.trim()
                    : '';

            if (!id) errors.push(`${label}.id is required.`);
            if (!name) errors.push(`${label}.name is required.`);

            if (id && sessionIds.has(id)) {
                errors.push(`${label}.id is duplicated.`);
            }

            ['createdAt', 'updatedAt', 'lastActiveAt']
                .forEach(field => {
                    if (
                        !Number.isFinite(session[field]) ||
                        session[field] < 0
                    ) {
                        errors.push(
                            `${label}.${field} must be a non-negative number.`
                        );
                    }
                });

            if (id) sessionIds.add(id);
            sessions.push({
                id,
                name,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
                lastActiveAt: session.lastActiveAt
            });
        });

        if (!sessionIds.has(DEFAULT_SESSION_ID)) {
            errors.push('data.sessions must contain the Shared/default session.');
        }

        return { sessions, sessionIds };
    }

    function validateSessionStates(value, sessionIds, errors) {
        if (!isPlainObject(value)) {
            errors.push('data.sessionStates must be an object.');
            return {};
        }

        Object.entries(value).forEach(([sessionId, states]) => {
            const label = `data.sessionStates.${sessionId}`;

            if (!sessionIds.has(sessionId)) {
                errors.push(`${label} refers to an unknown session.`);
            }

            if (!isPlainObject(states)) {
                errors.push(`${label} must be an object.`);
                return;
            }

            Object.entries(states).forEach(([registryId, state]) => {
                const stateLabel = `${label}.${registryId}`;

                if (!registryId.trim() || !isPlainObject(state)) {
                    errors.push(`${stateLabel} must be a state object.`);
                    return;
                }

                if (
                    state.sessionId !== undefined &&
                    state.sessionId !== sessionId
                ) {
                    errors.push(`${stateLabel}.sessionId does not match.`);
                }

                if (
                    state.registryId !== undefined &&
                    state.registryId !== registryId
                ) {
                    errors.push(`${stateLabel}.registryId does not match.`);
                }
            });
        });

        if (containsLaunchUrl(value)) {
            errors.push('data.sessionStates cannot contain launchUrl.');
        }

        return cloneJson(value);
    }

    function validateLedger(value, sessionIds, errors) {
        if (
            !hasExactKeys(value, [
                'schemaVersion',
                'updatedAt',
                'entries'
            ])
        ) {
            errors.push('data.ledger has an invalid shape.');
            return { schemaVersion: 1, updatedAt: 0, entries: {} };
        }

        if (value.schemaVersion !== 1) {
            errors.push('data.ledger.schemaVersion must be 1.');
        }

        if (!Number.isFinite(value.updatedAt) || value.updatedAt < 0) {
            errors.push('data.ledger.updatedAt must be a non-negative number.');
        }

        if (!isPlainObject(value.entries)) {
            errors.push('data.ledger.entries must be an object.');
            return { schemaVersion: 1, updatedAt: value.updatedAt, entries: {} };
        }

        Object.entries(value.entries).forEach(([entryId, entry]) => {
            const label = `data.ledger.entries.${entryId}`;

            if (!isPlainObject(entry)) {
                errors.push(`${label} must be an object.`);
                return;
            }

            if (!entryId.trim() || entry.id !== entryId) {
                errors.push(`${label}.id must match its storage ID.`);
            }

            if (
                entry.kind !== 'language' ||
                entry.status !== 'saved'
            ) {
                errors.push(`${label} is not saved-language data.`);
            }

            if (!sessionIds.has(entry.sessionId)) {
                errors.push(`${label} refers to an unknown session.`);
            }

            if (
                typeof entry.term !== 'string' ||
                !entry.term.trim()
            ) {
                errors.push(`${label}.term is required.`);
            }

            [
                'sessionName',
                'sourceWorld',
                'sourceItem',
                'sourceRegistryId',
                'sourceTitle',
                'sourceNavTitle',
                'sourceElementId',
                'sourceKind',
                'type',
                'definition',
                'upgraded',
                'priority',
                'atlasPrompt',
                'reviewPrompt',
                'def',
                'inAction'
            ].forEach(field => {
                if (
                    entry[field] !== undefined &&
                    typeof entry[field] !== 'string'
                ) {
                    errors.push(`${label}.${field} must be a string.`);
                }
            });

            if (
                entry.ordinary !== undefined &&
                entry.ordinary !== null &&
                typeof entry.ordinary !== 'string'
            ) {
                errors.push(`${label}.ordinary must be null or a string.`);
            }

            ['savedAt', 'lastTouchedAt', 'updatedAt']
                .forEach(field => {
                    if (
                        entry[field] !== undefined &&
                        (
                            !Number.isFinite(entry[field]) ||
                            entry[field] < 0
                        )
                    ) {
                        errors.push(
                            `${label}.${field} must be a non-negative number.`
                        );
                    }
                });
        });

        if (containsLaunchUrl(value)) {
            errors.push('data.ledger cannot contain launchUrl.');
        }

        return cloneJson(value);
    }

    function validateHandoffs(value, sessionIds, errors) {
        if (!isPlainObject(value)) {
            errors.push('data.handoffs must be an object.');
            return {};
        }

        Object.entries(value).forEach(([storageId, handoff]) => {
            const label = `data.handoffs.${storageId}`;

            if (!isPlainObject(handoff)) {
                errors.push(`${label} must be an object.`);
                return;
            }

            if (!hasExactKeys(handoff, [
                'v',
                'id',
                'sessionId',
                'subjectId',
                'subjectTitle',
                'world',
                'exploredItems',
                'savedLanguageCount',
                'pickupLabel',
                'pickupRef',
                'completedAt'
            ])) {
                errors.push(`${label} has an invalid shape.`);
            }

            const expectedStorageId =
                `${encodeURIComponent(handoff.sessionId || '')}::` +
                `${encodeURIComponent(handoff.subjectId || '')}`;

            if (
                handoff.v !== 1 ||
                typeof handoff.id !== 'string' ||
                !handoff.id.trim() ||
                typeof handoff.subjectId !== 'string' ||
                !handoff.subjectId.trim()
            ) {
                errors.push(`${label} has an invalid handoff identity.`);
            }

            if (storageId !== expectedStorageId) {
                errors.push(`${label} does not match its storage ID.`);
            }

            if (!sessionIds.has(handoff.sessionId)) {
                errors.push(`${label} refers to an unknown session.`);
            }

            ['subjectTitle', 'world'].forEach(field => {
                if (typeof handoff[field] !== 'string') {
                    errors.push(`${label}.${field} must be a string.`);
                }
            });

            ['pickupLabel', 'pickupRef'].forEach(field => {
                if (
                    handoff[field] !== null &&
                    (
                        typeof handoff[field] !== 'string' ||
                        !handoff[field].trim()
                    )
                ) {
                    errors.push(
                        `${label}.${field} must be null or a non-empty string.`
                    );
                }
            });

            if (!Array.isArray(handoff.exploredItems)) {
                errors.push(`${label}.exploredItems must be an array.`);
            } else {
                handoff.exploredItems.forEach((item, index) => {
                    if (
                        !isPlainObject(item) ||
                        !hasExactKeys(item, ['id', 'title']) ||
                        typeof item.id !== 'string' ||
                        !item.id.trim() ||
                        typeof item.title !== 'string' ||
                        !item.title.trim()
                    ) {
                        errors.push(
                            `${label}.exploredItems[${index}] is invalid.`
                        );
                    }
                });
            }

            if (
                !Number.isInteger(handoff.savedLanguageCount) ||
                handoff.savedLanguageCount < 0
            ) {
                errors.push(
                    `${label}.savedLanguageCount must be a non-negative integer.`
                );
            }

            if (
                !Number.isFinite(handoff.completedAt) ||
                handoff.completedAt < 0
            ) {
                errors.push(
                    `${label}.completedAt must be a non-negative number.`
                );
            }
        });

        if (containsLaunchUrl(value)) {
            errors.push('data.handoffs cannot contain launchUrl.');
        }

        return cloneJson(value);
    }

    function validatePreferences(value, errors) {
        if (
            !hasExactKeys(value, [
                'schemaVersion',
                'upgradeVisibility'
            ])
        ) {
            errors.push('data.preferences has an invalid shape.');
            return { schemaVersion: 1, upgradeVisibility: 'key' };
        }

        if (value.schemaVersion !== 1) {
            errors.push('data.preferences.schemaVersion must be 1.');
        }

        if (!['off', 'key', 'all'].includes(value.upgradeVisibility)) {
            errors.push('data.preferences.upgradeVisibility is invalid.');
        }

        return {
            schemaVersion: 1,
            upgradeVisibility: value.upgradeVisibility
        };
    }

    function validateSessionStringMap(
        value,
        sessionIds,
        label,
        allowedValues,
        errors
    ) {
        if (!isPlainObject(value)) {
            errors.push(`${label} must be an object.`);
            return {};
        }

        Object.entries(value).forEach(([sessionId, item]) => {
            if (!sessionIds.has(sessionId)) {
                errors.push(`${label}.${sessionId} refers to an unknown session.`);
            }

            if (
                typeof item !== 'string' ||
                !item.trim() ||
                (allowedValues && !allowedValues.includes(item))
            ) {
                errors.push(`${label}.${sessionId} is invalid.`);
            }
        });

        return cloneJson(value);
    }

    function validateWelcomeFavorites(value, errors) {
        if (!Array.isArray(value)) {
            errors.push('data.welcomeImageFavorites must be an array.');
            return [];
        }

        if (value.length > MAX_WELCOME_FAVORITES) {
            errors.push(
                `data.welcomeImageFavorites cannot exceed ${MAX_WELCOME_FAVORITES} items.`
            );
        }

        const seen = new Set();

        value.forEach((item, index) => {
            if (typeof item !== 'string' || !item.trim()) {
                errors.push(
                    `data.welcomeImageFavorites[${index}] is invalid.`
                );
                return;
            }

            if (seen.has(item)) {
                errors.push(
                    `data.welcomeImageFavorites[${index}] is duplicated.`
                );
            }

            seen.add(item);
        });

        return [...value];
    }

    function validateBackup(candidate) {
        const errors = [];

        try {
            validateJsonValue(candidate, 'backup', errors);

            if (
                !hasExactKeys(candidate, [
                    'format',
                    'version',
                    'exportedAt',
                    'data'
                ])
            ) {
                errors.push('Backup package has an invalid shape.');
            }

            if (candidate?.format !== FORMAT) {
                errors.push(`Backup format must be ${FORMAT}.`);
            }

            if (candidate?.version !== VERSION) {
                errors.push(`Backup version must be ${VERSION}.`);
            }

            if (
                typeof candidate?.exportedAt !== 'string' ||
                Number.isNaN(Date.parse(candidate.exportedAt)) ||
                new Date(candidate.exportedAt).toISOString() !==
                    candidate.exportedAt
            ) {
                errors.push('Backup exportedAt must be an ISO timestamp.');
            }

            if (!hasExactKeys(candidate?.data, BACKUP_DATA_KEYS)) {
                errors.push('Backup data has an invalid or incomplete shape.');
            }

            const data = isPlainObject(candidate?.data)
                ? candidate.data
                : {};
            const { sessions, sessionIds } = validateSessions(
                data.sessions,
                errors
            );
            const sessionStates = validateSessionStates(
                data.sessionStates,
                sessionIds,
                errors
            );
            const ledger = validateLedger(
                data.ledger,
                sessionIds,
                errors
            );
            const handoffs = validateHandoffs(
                data.handoffs,
                sessionIds,
                errors
            );
            const preferences = validatePreferences(
                data.preferences,
                errors
            );
            const appearanceBySession = validateSessionStringMap(
                data.appearanceBySession,
                sessionIds,
                'data.appearanceBySession',
                ['light', 'night'],
                errors
            );
            const sessionAtmosphereImages = validateSessionStringMap(
                data.sessionAtmosphereImages,
                sessionIds,
                'data.sessionAtmosphereImages',
                null,
                errors
            );
            const welcomeImageFavorites = validateWelcomeFavorites(
                data.welcomeImageFavorites,
                errors
            );

            const { TutorContent, TutorSubjects } = requireOwners();
            const tutorContentValidation =
                TutorContent.validatePortableData(data.tutorContent);
            const tutorSubjectsValidation =
                TutorSubjects.validatePortableData(data.tutorSubjects);

            if (!tutorContentValidation.valid) {
                errors.push(...tutorContentValidation.errors);
            }

            if (!tutorSubjectsValidation.valid) {
                errors.push(...tutorSubjectsValidation.errors);
            }

            return {
                valid: errors.length === 0,
                errors,
                ...(errors.length === 0
                    ? {
                        backup: {
                            format: FORMAT,
                            version: VERSION,
                            exportedAt: candidate.exportedAt,
                            data: {
                                sessions,
                                sessionStates,
                                ledger,
                                handoffs,
                                preferences,
                                appearanceBySession,
                                sessionAtmosphereImages,
                                welcomeImageFavorites,
                                tutorContent: tutorContentValidation.data,
                                tutorSubjects: tutorSubjectsValidation.data
                            }
                        }
                    }
                    : {})
            };
        } catch (error) {
            errors.push(
                error instanceof Error
                    ? error.message
                    : 'Backup validation failed.'
            );

            return { valid: false, errors };
        }
    }

    function summarizeBackup(candidate) {
        const validation = validateBackup(candidate);

        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        const data = validation.backup.data;

        return {
            students: data.sessions.filter(
                session => session.id !== DEFAULT_SESSION_ID
            ).length,
            tutorSubjects: data.tutorSubjects.subjects.length,
            tutorVersions: data.tutorContent.versions.length,
            savedExpressions: Object.keys(data.ledger.entries).length
        };
    }

    function hasMeaningfulPortableData(candidate) {
        const validation = validateBackup(candidate);

        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        const data = validation.backup.data;
        const defaultSession = data.sessions.find(
            session => session.id === DEFAULT_SESSION_ID
        );

        return data.sessions.some(
            session => session.id !== DEFAULT_SESSION_ID
        ) ||
            Boolean(defaultSession && defaultSession.name !== 'Default') ||
            Object.values(data.sessionStates).some(states =>
                Object.keys(states).length > 0
            ) ||
            Object.keys(data.ledger.entries).length > 0 ||
            Object.keys(data.handoffs).length > 0 ||
            data.preferences.upgradeVisibility !== 'key' ||
            Object.keys(data.appearanceBySession).length > 0 ||
            Object.keys(data.sessionAtmosphereImages).length > 0 ||
            data.welcomeImageFavorites.length > 0 ||
            data.tutorContent.versions.length > 0 ||
            data.tutorContent.workingDrafts.length > 0 ||
            data.tutorSubjects.subjects.length > 0 ||
            data.tutorSubjects.workingDrafts.length > 0;
    }

    function pad(value) {
        return String(value).padStart(2, '0');
    }

    function dateStamp(date = new Date()) {
        return [
            date.getFullYear(),
            pad(date.getMonth() + 1),
            pad(date.getDate())
        ].join('-');
    }

    function backupFilename(date = new Date()) {
        return `atlas-backup-${dateStamp(date)}.json`;
    }

    function safetyBackupFilename(date = new Date()) {
        return [
            'atlas-backup-before-restore-',
            dateStamp(date),
            '-',
            pad(date.getHours()),
            pad(date.getMinutes()),
            '.json'
        ].join('');
    }

    function downloadPackage(backup, filename) {
        const validation = validateBackup(backup);

        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        const blob = new Blob(
            [JSON.stringify(validation.backup, null, 2)],
            { type: 'application/json' }
        );
        const url = URL.createObjectURL(blob);

        try {
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename;
            anchor.hidden = true;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
        } finally {
            setTimeout(() => URL.revokeObjectURL(url), 0);
        }
    }

    async function downloadBackup() {
        const backup = await exportBackup();
        downloadPackage(backup, backupFilename());
        return backup;
    }

    function writeBridgeJson(Bridge, key, value, label) {
        if (!Bridge.writeJson(key, value)) {
            throw new Error(`Atlas could not restore ${label}.`);
        }
    }

    function replaceOptionalJson(key, value, isEmpty) {
        if (isEmpty) {
            localStorage.removeItem(key);
            return;
        }

        localStorage.setItem(key, JSON.stringify(value));
    }

    function clearTransientState(Bridge) {
        localStorage.removeItem(Bridge.keys.activeSessionId);
        localStorage.removeItem(Bridge.keys.appearance);

        const transientKeys = [];

        for (
            let index = 0;
            index < sessionStorage.length;
            index += 1
        ) {
            const key = sessionStorage.key(index);

            if (
                key &&
                (
                    key === Bridge.keys.activeSessionId ||
                    TRANSIENT_PREFIXES.some(prefix =>
                        key.startsWith(prefix)
                    )
                )
            ) {
                transientKeys.push(key);
            }
        }

        transientKeys.forEach(key => {
            sessionStorage.removeItem(key);
        });
    }

    async function restoreBackup(candidate, options = {}) {
        const validation = validateBackup(candidate);

        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        const {
            Bridge,
            TutorContent,
            TutorSubjects
        } = requireOwners();
        const shouldDownloadSafety =
            options.downloadSafetyBackup !== false;

        if (shouldDownloadSafety) {
            const currentBackup = await exportBackup();

            if (hasMeaningfulPortableData(currentBackup)) {
                downloadPackage(
                    currentBackup,
                    safetyBackupFilename()
                );
            }
        }

        const data = validation.backup.data;

        if (!Bridge.writeSessions(data.sessions)) {
            throw new Error('Atlas could not restore students.');
        }

        if (!Bridge.writeRegistry({
            schemaVersion: 2,
            updatedAt: Date.now(),
            worlds: {},
            items: {},
            sessionStates: data.sessionStates,
            recentActivity: []
        })) {
            throw new Error('Atlas could not restore learner progress.');
        }

        if (!Bridge.writeLedger(data.ledger)) {
            throw new Error('Atlas could not restore saved language.');
        }

        writeBridgeJson(
            Bridge,
            Bridge.keys.handoffs,
            data.handoffs,
            'Compass handoffs'
        );
        writeBridgeJson(
            Bridge,
            Bridge.keys.preferences,
            data.preferences,
            'preferences'
        );
        writeBridgeJson(
            Bridge,
            Bridge.keys.appearanceBySession,
            data.appearanceBySession,
            'appearance'
        );

        replaceOptionalJson(
            SESSION_ATMOSPHERE_KEY,
            data.sessionAtmosphereImages,
            Object.keys(data.sessionAtmosphereImages).length === 0
        );
        replaceOptionalJson(
            WELCOME_FAVORITES_KEY,
            data.welcomeImageFavorites,
            data.welcomeImageFavorites.length === 0
        );

        await TutorContent.restorePortableData(data.tutorContent);
        await TutorSubjects.restorePortableData(data.tutorSubjects);

        clearTransientState(Bridge);

        return validation.backup;
    }

    window.AtlasPortableData = {
        format: FORMAT,
        version: VERSION,

        exportBackup,
        validateBackup,
        summarizeBackup,
        hasMeaningfulPortableData,
        downloadBackup,
        restoreBackup,

        backupFilename,
        safetyBackupFilename
    };
})();
