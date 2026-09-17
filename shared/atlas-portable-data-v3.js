/* ============================================================
   ATLAS PORTABLE DATA V3
   Canonical signed-in backup export.

   Version 3 separates durable account truth from deliberately local working
   state. Signed-in exports read durable data from Supabase / cloud adapters,
   never from browser projections. Working drafts and cosmetic preferences
   remain local by design and are included as a separate workspace section.

   Restore is intentionally NOT implemented here. V3 restore semantics belong
   to Stage 1.4 and must be explicit about ownership, merge/conflict behavior,
   validation and failure recovery.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasPortableDataV3) return;
    if (!window.AtlasPortableData) return;

    const Portable = window.AtlasPortableData;
    const Legacy = {
        version: Portable.version,
        exportBackup: Portable.exportBackup.bind(Portable),
        validateBackup: Portable.validateBackup.bind(Portable),
        summarizeBackup: Portable.summarizeBackup.bind(Portable),
        hasMeaningfulPortableData:
            Portable.hasMeaningfulPortableData.bind(Portable),
        downloadBackup: Portable.downloadBackup.bind(Portable),
        restoreBackup: Portable.restoreBackup.bind(Portable),
        backupFilename: Portable.backupFilename.bind(Portable),
        safetyBackupFilename:
            Portable.safetyBackupFilename.bind(Portable)
    };

    const FORMAT = 'atlas-backup';
    const VERSION = 3;
    const DEFAULT_SESSION_ID = 'default';
    const LEARNER_CLOUD_SRC =
        '/shared/atlas-learner-sessions-cloud.js?v=20260916-backup1';

    let learnerCloudPromise = null;

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

    function validateJsonValue(value, label, errors) {
        const seen = new WeakSet();

        function visit(candidate, path, depth) {
            if (depth > 120) {
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
                candidate.forEach((item, index) =>
                    visit(item, `${path}[${index}]`, depth + 1)
                );
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

                if (
                    key === 'access_token' ||
                    key === 'refresh_token' ||
                    key === 'provider_token' ||
                    key === 'provider_refresh_token'
                ) {
                    errors.push(`${path} contains authentication credentials.`);
                    return;
                }

                visit(item, `${path}.${key}`, depth + 1);
            });
        }

        visit(value, label, 0);
    }

    function ensureLearnerCloud() {
        if (window.AtlasLearnerSessionsCloud) {
            return Promise.resolve(window.AtlasLearnerSessionsCloud);
        }

        if (learnerCloudPromise) return learnerCloudPromise;

        learnerCloudPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector(
                'script[data-atlas-backup-learner-cloud]'
            );

            function complete() {
                if (window.AtlasLearnerSessionsCloud) {
                    resolve(window.AtlasLearnerSessionsCloud);
                } else {
                    learnerCloudPromise = null;
                    reject(new Error(
                        'Atlas learner cloud support did not initialize.'
                    ));
                }
            }

            if (existing) {
                existing.addEventListener('load', complete, { once: true });
                existing.addEventListener(
                    'error',
                    () => {
                        learnerCloudPromise = null;
                        reject(new Error(
                            'Atlas could not load learner cloud support.'
                        ));
                    },
                    { once: true }
                );
                return;
            }

            const script = document.createElement('script');
            script.src = LEARNER_CLOUD_SRC;
            script.async = false;
            script.dataset.atlasBackupLearnerCloud = 'true';
            script.addEventListener('load', complete, { once: true });
            script.addEventListener(
                'error',
                () => {
                    learnerCloudPromise = null;
                    reject(new Error(
                        'Atlas could not load learner cloud support.'
                    ));
                },
                { once: true }
            );
            document.head.appendChild(script);
        });

        return learnerCloudPromise;
    }

    async function requireAccountRuntime() {
        if (!window.AtlasCloud) {
            throw new Error('AtlasCloud is unavailable.');
        }

        if (!window.AtlasTutorSubjects || !window.AtlasTutorContent) {
            throw new Error('Atlas authoring persistence is unavailable.');
        }

        if (!window.AtlasBridge) {
            throw new Error('AtlasBridge is unavailable.');
        }

        const LearnerCloud = await ensureLearnerCloud();
        const user = await AtlasCloud.getUser();

        if (!user?.id) return null;

        return {
            user,
            client: await AtlasCloud.getClient(),
            LearnerCloud,
            Bridge: window.AtlasBridge,
            TutorSubjects: window.AtlasTutorSubjects,
            TutorContent: window.AtlasTutorContent
        };
    }

    function normalizeStateRow(row) {
        if (!row || typeof row !== 'object') return null;

        return {
            schemaVersion: Math.max(
                1,
                Math.floor(Number(row.schema_version) || 1)
            ),
            revision: Math.max(
                1,
                Math.floor(Number(row.revision) || 1)
            ),
            state: isPlainObject(row.state)
                ? cloneJson(row.state)
                : {},
            createdAt: Date.parse(row.created_at) || 0,
            updatedAt: Date.parse(row.updated_at) || 0
        };
    }

    function normalizeLearnerContinuityRow(row) {
        const base = normalizeStateRow(row);
        const sessionId = String(row?.session_id || '').trim();
        if (!base || !sessionId) return null;

        return {
            sessionId,
            ...base
        };
    }

    function normalizeSubjectRefs(value) {
        const seen = new Set();

        return (Array.isArray(value) ? value : [])
            .map(item => ({
                kind: String(item?.kind || '').trim(),
                id: String(item?.id || '').trim()
            }))
            .filter(item => {
                if (
                    !item.id ||
                    !['my-subject', 'atlas-subject'].includes(item.kind)
                ) {
                    return false;
                }

                const key = `${item.kind}:${item.id}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
    }

    function normalizeSharedRow(row) {
        const continuity = normalizeStateRow(row);

        return {
            continuity,
            subjectRefs: normalizeSubjectRefs(row?.subject_refs),
            subjectRefsMigrated:
                row?.subject_refs_migrated === true
        };
    }

    async function readSingleRow(client, table, userId) {
        const { data, error } = await client
            .from(table)
            .select('*')
            .eq('owner_user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return data || null;
    }

    async function readLearnerContinuity(client, userId) {
        const { data, error } = await client
            .from('learner_continuity_state')
            .select('*')
            .eq('owner_user_id', userId)
            .order('session_id', { ascending: true });

        if (error) throw error;

        return (data || [])
            .map(normalizeLearnerContinuityRow)
            .filter(Boolean);
    }

    function readPreferences(Bridge) {
        const value = Bridge.readPreferences?.() || {};
        return {
            schemaVersion: 1,
            upgradeVisibility:
                ['off', 'key', 'all'].includes(value.upgradeVisibility)
                    ? value.upgradeVisibility
                    : 'key'
        };
    }

    function readAppearanceBySession(Bridge, learnerIds) {
        const raw = Bridge.readJson?.(
            Bridge.keys.appearanceBySession,
            {}
        ) || {};
        const allowedIds = new Set([
            DEFAULT_SESSION_ID,
            ...learnerIds
        ]);

        if (!isPlainObject(raw)) return {};

        return Object.entries(raw).reduce((result, [sessionId, mode]) => {
            if (
                allowedIds.has(sessionId) &&
                (mode === 'light' || mode === 'night')
            ) {
                result[sessionId] = mode;
            }
            return result;
        }, {});
    }

    function sortById(records, field = 'id') {
        return [...records].sort((left, right) =>
            String(left?.[field] || '').localeCompare(
                String(right?.[field] || '')
            )
        );
    }

    async function exportAccountBackup(runtime) {
        const {
            user,
            client,
            LearnerCloud,
            Bridge,
            TutorSubjects,
            TutorContent
        } = runtime;

        const [
            learners,
            learnerContinuity,
            sharedRow,
            subjects,
            library,
            versions,
            curationRow,
            personalizationRow
        ] = await Promise.all([
            LearnerCloud.listLearnerSessions(),
            readLearnerContinuity(client, user.id),
            readSingleRow(client, 'shared_continuity_state', user.id),
            AtlasCloud.listOwnedSubjects(),
            AtlasCloud.getSubjectLibraryState(),
            AtlasCloud.listTutorContentVersions(),
            readSingleRow(client, 'original_curation_state', user.id),
            readSingleRow(client, 'hub_personalization_state', user.id)
        ]);

        if (
            typeof TutorSubjects.exportWorkingDrafts !== 'function' ||
            typeof TutorContent.exportWorkingDrafts !== 'function'
        ) {
            throw new Error(
                'Atlas workspace draft export support is unavailable.'
            );
        }

        const subjectRecords = sortById(subjects || []);
        const versionRecords = sortById(
            versions || [],
            'contentId'
        );

        const [
            subjectWorkingDrafts,
            versionWorkingDrafts
        ] = await Promise.all([
            TutorSubjects.exportWorkingDrafts(
                subjectRecords.map(record => record.id)
            ),
            TutorContent.exportWorkingDrafts(
                versionRecords.map(record => record.contentId)
            )
        ]);

        const learnerRecords = sortById(learners || []);
        const learnerIds = learnerRecords.map(record => record.id);

        const backup = {
            format: FORMAT,
            version: VERSION,
            exportedAt: new Date().toISOString(),
            source: {
                kind: 'account',
                userId: String(user.id),
                email: user.email ? String(user.email) : null
            },
            data: {
                learners: learnerRecords,
                learnerContinuity: sortById(
                    learnerContinuity || [],
                    'sessionId'
                ),
                shared: normalizeSharedRow(sharedRow),
                mySubjects: {
                    subjects: subjectRecords,
                    library: library ? cloneJson(library) : null
                },
                myVersions: versionRecords,
                originalCuration:
                    normalizeStateRow(curationRow),
                hubPersonalization:
                    normalizeStateRow(personalizationRow),
                workspace: {
                    mySubjectWorkingDrafts:
                        cloneJson(subjectWorkingDrafts || []),
                    myVersionWorkingDrafts:
                        cloneJson(versionWorkingDrafts || []),
                    preferences: readPreferences(Bridge),
                    appearanceBySession:
                        readAppearanceBySession(Bridge, learnerIds)
                }
            }
        };

        const validation = validateV3Backup(backup);

        if (!validation.valid) {
            const error = new Error(validation.errors.join(' '));
            error.code = 'ATLAS_BACKUP_VALIDATION_FAILED';
            throw error;
        }

        return validation.backup;
    }

    function validateTimestamp(value, label, errors) {
        if (!Number.isFinite(value) || value < 0) {
            errors.push(`${label} must be a non-negative number.`);
        }
    }

    function validateStateRecord(value, label, errors, { nullable = true } = {}) {
        if (value === null && nullable) return null;

        if (
            !exactKeys(value, [
                'schemaVersion',
                'revision',
                'state',
                'createdAt',
                'updatedAt'
            ])
        ) {
            errors.push(`${label} has an invalid shape.`);
            return null;
        }

        if (!Number.isInteger(value.schemaVersion) || value.schemaVersion < 1) {
            errors.push(`${label}.schemaVersion must be a positive integer.`);
        }

        if (!Number.isInteger(value.revision) || value.revision < 1) {
            errors.push(`${label}.revision must be a positive integer.`);
        }

        if (!isPlainObject(value.state)) {
            errors.push(`${label}.state must be an object.`);
        }

        validateTimestamp(value.createdAt, `${label}.createdAt`, errors);
        validateTimestamp(value.updatedAt, `${label}.updatedAt`, errors);
        return cloneJson(value);
    }

    function validateV3Backup(candidate) {
        const errors = [];

        try {
            validateJsonValue(candidate, 'backup', errors);

            if (
                !exactKeys(candidate, [
                    'format',
                    'version',
                    'exportedAt',
                    'source',
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
                Number.isNaN(Date.parse(candidate.exportedAt))
            ) {
                errors.push('Backup exportedAt must be an ISO timestamp.');
            }

            if (
                !exactKeys(candidate?.source, [
                    'kind',
                    'userId',
                    'email'
                ])
            ) {
                errors.push('Backup source has an invalid shape.');
            } else {
                if (candidate.source.kind !== 'account') {
                    errors.push('Backup source.kind must be account.');
                }

                if (
                    typeof candidate.source.userId !== 'string' ||
                    !candidate.source.userId.trim()
                ) {
                    errors.push('Backup source.userId is required.');
                }

                if (
                    candidate.source.email !== null &&
                    typeof candidate.source.email !== 'string'
                ) {
                    errors.push('Backup source.email must be null or a string.');
                }
            }

            const data = isPlainObject(candidate?.data)
                ? candidate.data
                : {};

            if (
                !exactKeys(data, [
                    'learners',
                    'learnerContinuity',
                    'shared',
                    'mySubjects',
                    'myVersions',
                    'originalCuration',
                    'hubPersonalization',
                    'workspace'
                ])
            ) {
                errors.push('Backup data has an invalid or incomplete shape.');
            }

            const learners = Array.isArray(data.learners)
                ? cloneJson(data.learners)
                : [];

            if (!Array.isArray(data.learners)) {
                errors.push('data.learners must be an array.');
            }

            const learnerIds = new Set();
            learners.forEach((record, index) => {
                const id = String(record?.id || '').trim();
                const name = String(record?.name || '').trim();

                if (!id || !name) {
                    errors.push(
                        `data.learners[${index}] requires id and name.`
                    );
                    return;
                }

                if (id === DEFAULT_SESSION_ID) {
                    errors.push(
                        `data.learners[${index}] cannot use the Shared/default id.`
                    );
                }

                if (learnerIds.has(id)) {
                    errors.push(`data.learners[${index}].id is duplicated.`);
                }
                learnerIds.add(id);
            });

            const learnerContinuity = Array.isArray(data.learnerContinuity)
                ? cloneJson(data.learnerContinuity)
                : [];

            if (!Array.isArray(data.learnerContinuity)) {
                errors.push('data.learnerContinuity must be an array.');
            }

            const continuityIds = new Set();
            learnerContinuity.forEach((record, index) => {
                const label = `data.learnerContinuity[${index}]`;

                if (
                    !exactKeys(record, [
                        'sessionId',
                        'schemaVersion',
                        'revision',
                        'state',
                        'createdAt',
                        'updatedAt'
                    ])
                ) {
                    errors.push(`${label} has an invalid shape.`);
                    return;
                }

                const sessionId = String(record.sessionId || '').trim();
                if (!learnerIds.has(sessionId)) {
                    errors.push(`${label} refers to an unknown learner.`);
                }
                if (continuityIds.has(sessionId)) {
                    errors.push(`${label}.sessionId is duplicated.`);
                }
                continuityIds.add(sessionId);

                validateStateRecord(
                    {
                        schemaVersion: record.schemaVersion,
                        revision: record.revision,
                        state: record.state,
                        createdAt: record.createdAt,
                        updatedAt: record.updatedAt
                    },
                    label,
                    errors,
                    { nullable: false }
                );
            });

            if (
                !exactKeys(data.shared, [
                    'continuity',
                    'subjectRefs',
                    'subjectRefsMigrated'
                ])
            ) {
                errors.push('data.shared has an invalid shape.');
            } else {
                validateStateRecord(
                    data.shared.continuity,
                    'data.shared.continuity',
                    errors
                );

                if (!Array.isArray(data.shared.subjectRefs)) {
                    errors.push('data.shared.subjectRefs must be an array.');
                } else if (
                    JSON.stringify(normalizeSubjectRefs(data.shared.subjectRefs)) !==
                    JSON.stringify(data.shared.subjectRefs)
                ) {
                    errors.push('data.shared.subjectRefs contains invalid refs.');
                }

                if (typeof data.shared.subjectRefsMigrated !== 'boolean') {
                    errors.push(
                        'data.shared.subjectRefsMigrated must be a boolean.'
                    );
                }
            }

            if (
                !exactKeys(data.mySubjects, ['subjects', 'library']) ||
                !Array.isArray(data.mySubjects.subjects)
            ) {
                errors.push('data.mySubjects has an invalid shape.');
            }

            const subjectIds = new Set();
            (Array.isArray(data.mySubjects?.subjects)
                ? data.mySubjects.subjects
                : []
            ).forEach((subject, index) => {
                const id = String(subject?.id || '').trim();
                if (!id) {
                    errors.push(`data.mySubjects.subjects[${index}].id is required.`);
                    return;
                }
                if (subjectIds.has(id)) {
                    errors.push(`data.mySubjects.subjects[${index}].id is duplicated.`);
                }
                subjectIds.add(id);
            });

            if (
                data.mySubjects?.library !== null &&
                !isPlainObject(data.mySubjects?.library)
            ) {
                errors.push('data.mySubjects.library must be null or an object.');
            }

            if (!Array.isArray(data.myVersions)) {
                errors.push('data.myVersions must be an array.');
            }

            const contentIds = new Set();
            (Array.isArray(data.myVersions) ? data.myVersions : [])
                .forEach((version, index) => {
                    const contentId = String(version?.contentId || '').trim();
                    if (!contentId) {
                        errors.push(`data.myVersions[${index}].contentId is required.`);
                        return;
                    }
                    if (contentIds.has(contentId)) {
                        errors.push(`data.myVersions[${index}].contentId is duplicated.`);
                    }
                    contentIds.add(contentId);
                });

            const originalCuration = validateStateRecord(
                data.originalCuration,
                'data.originalCuration',
                errors
            );
            const hubPersonalization = validateStateRecord(
                data.hubPersonalization,
                'data.hubPersonalization',
                errors
            );

            if (
                !exactKeys(data.workspace, [
                    'mySubjectWorkingDrafts',
                    'myVersionWorkingDrafts',
                    'preferences',
                    'appearanceBySession'
                ])
            ) {
                errors.push('data.workspace has an invalid shape.');
            }

            if (!Array.isArray(data.workspace?.mySubjectWorkingDrafts)) {
                errors.push(
                    'data.workspace.mySubjectWorkingDrafts must be an array.'
                );
            }

            if (!Array.isArray(data.workspace?.myVersionWorkingDrafts)) {
                errors.push(
                    'data.workspace.myVersionWorkingDrafts must be an array.'
                );
            }

            if (!isPlainObject(data.workspace?.preferences)) {
                errors.push('data.workspace.preferences must be an object.');
            }

            if (!isPlainObject(data.workspace?.appearanceBySession)) {
                errors.push(
                    'data.workspace.appearanceBySession must be an object.'
                );
            }

            // The owning persistence modules validate local working drafts
            // through their narrow workspace exporters before this package is
            // assembled. Re-run Tutor Content validation here when available
            // so My Versions + their drafts remain independently coherent.
            if (
                window.AtlasTutorContent?.validatePortableData &&
                Array.isArray(data.myVersions) &&
                Array.isArray(data.workspace?.myVersionWorkingDrafts)
            ) {
                const validation = AtlasTutorContent.validatePortableData({
                    schemaVersion: 1,
                    versions: data.myVersions,
                    workingDrafts: data.workspace.myVersionWorkingDrafts
                });
                if (!validation.valid) errors.push(...validation.errors);
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
                            source: cloneJson(candidate.source),
                            data: {
                                learners,
                                learnerContinuity,
                                shared: cloneJson(data.shared),
                                mySubjects: cloneJson(data.mySubjects),
                                myVersions: cloneJson(data.myVersions),
                                originalCuration,
                                hubPersonalization,
                                workspace: cloneJson(data.workspace)
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

    async function exportBackup() {
        const runtime = await requireAccountRuntime();

        // Preserve the established browser-local V2 path for signed-out use.
        // V3 is specifically the canonical signed-in account snapshot.
        if (!runtime) {
            return Legacy.exportBackup();
        }

        return exportAccountBackup(runtime);
    }

    function validateBackup(candidate) {
        if (Number(candidate?.version) === VERSION) {
            return validateV3Backup(candidate);
        }
        return Legacy.validateBackup(candidate);
    }

    function countLedgerEntries(stateRecord) {
        const entries = stateRecord?.state?.ledgerEntries;
        return isPlainObject(entries)
            ? Object.keys(entries).length
            : 0;
    }

    function summarizeBackup(candidate) {
        if (Number(candidate?.version) !== VERSION) {
            return Legacy.summarizeBackup(candidate);
        }

        const validation = validateV3Backup(candidate);
        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        const data = validation.backup.data;
        const savedExpressions =
            data.learnerContinuity.reduce(
                (total, record) => total + countLedgerEntries(record),
                0
            ) +
            countLedgerEntries(data.shared.continuity);

        return {
            students: data.learners.length,
            tutorSubjects: data.mySubjects.subjects.length,
            tutorVersions: data.myVersions.length,
            savedExpressions
        };
    }

    function hasMeaningfulPortableData(candidate) {
        if (Number(candidate?.version) !== VERSION) {
            return Legacy.hasMeaningfulPortableData(candidate);
        }

        const validation = validateV3Backup(candidate);
        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        const data = validation.backup.data;

        return Boolean(
            data.learners.length ||
            data.learnerContinuity.length ||
            data.shared.continuity ||
            data.shared.subjectRefs.length ||
            data.mySubjects.subjects.length ||
            data.mySubjects.library ||
            data.myVersions.length ||
            data.originalCuration ||
            data.hubPersonalization ||
            data.workspace.mySubjectWorkingDrafts.length ||
            data.workspace.myVersionWorkingDrafts.length ||
            Object.keys(data.workspace.appearanceBySession).length ||
            data.workspace.preferences.upgradeVisibility !== 'key'
        );
    }

    function downloadPackage(backup, filename) {
        const validation = validateBackup(backup);
        if (!validation.valid) {
            throw new Error(validation.errors.join(' '));
        }

        const payload = validation.backup;
        const blob = new Blob(
            [JSON.stringify(payload, null, 2)],
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
            window.setTimeout(() => URL.revokeObjectURL(url), 0);
        }

        return payload;
    }

    async function downloadBackup() {
        const backup = await exportBackup();
        return downloadPackage(
            backup,
            Legacy.backupFilename(new Date())
        );
    }

    async function restoreBackup(candidate, options = {}) {
        if (Number(candidate?.version) === VERSION) {
            const validation = validateV3Backup(candidate);
            if (!validation.valid) {
                throw new Error(validation.errors.join(' '));
            }

            const error = new Error(
                'Atlas Backup v3 restore is not enabled yet. Atlas did not change your data. Safe account restore is completed in Stage 1.4.'
            );
            error.code = 'ATLAS_V3_RESTORE_PENDING';
            throw error;
        }

        return Legacy.restoreBackup(candidate, options);
    }

    Portable.version = VERSION;
    Portable.exportBackup = exportBackup;
    Portable.validateBackup = validateBackup;
    Portable.summarizeBackup = summarizeBackup;
    Portable.hasMeaningfulPortableData = hasMeaningfulPortableData;
    Portable.downloadBackup = downloadBackup;
    Portable.restoreBackup = restoreBackup;

    window.AtlasPortableDataV3 = Object.freeze({
        active: true,
        version: VERSION,
        exportBackup,
        validateBackup,
        summarizeBackup
    });
})();
