/* ============================================================
   ATLAS BACKUP V3 RESTORE
   Safe account reconstruction + conflict preview.

   Durable restore is one authenticated Supabase transaction. It merges only
   missing stable identities, never deletes account data and never overwrites
   an existing record. Local working state is staged separately and rolled back
   if the cloud transaction fails.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasPortableRestoreV3) return;

    const VERSION = 3;
    const RPC_NAME = 'atlas_restore_v3';
    const SUBJECT_DRAFT_PREFIX = 'atlas::tutorSubjects::workingDraft::';
    const VERSION_DRAFT_PREFIX = 'atlas::tutorContent::workingDraft::';
    const INSTALL_RETRY_LIMIT = 120;

    let installAttempts = 0;
    let installed = false;
    let previewUiToken = 0;

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function isPlainObject(value) {
        return Boolean(
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
        );
    }

    function storageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    function storageSet(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    }

    function storageRemove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }

    function encodedKey(prefix, id) {
        return prefix + encodeURIComponent(String(id || ''));
    }

    function jsonEquals(left, right) {
        try {
            return JSON.stringify(left) === JSON.stringify(right);
        } catch {
            return false;
        }
    }

    function requirePortable() {
        const Portable = window.AtlasPortableData;

        if (!Portable || Number(Portable.version) !== VERSION) {
            throw new Error('Atlas Backup v3 is unavailable.');
        }

        return Portable;
    }

    function validateRestorePayload(candidate) {
        const Portable = requirePortable();
        const validation = Portable.validateBackup(candidate);

        if (!validation.valid || Number(validation.backup?.version) !== VERSION) {
            const error = new Error(
                validation.errors?.join(' ') ||
                'Atlas requires a valid Backup v3 package.'
            );
            error.code = 'ATLAS_BACKUP_VALIDATION_FAILED';
            throw error;
        }

        const backup = validation.backup;
        const data = backup.data;
        const errors = [];

        const subjectIds = new Set(
            data.mySubjects.subjects.map(subject => String(subject.id || ''))
        );
        const versionIds = new Set(
            data.myVersions.map(version => String(version.contentId || ''))
        );

        data.workspace.mySubjectWorkingDrafts.forEach((draft, index) => {
            const subjectId = String(draft?.subjectId || '').trim();
            if (!subjectId || !subjectIds.has(subjectId)) {
                errors.push(
                    `My Subject working draft ${index + 1} does not belong to a backed-up subject.`
                );
            }
        });

        data.workspace.myVersionWorkingDrafts.forEach((draft, index) => {
            const contentId = String(draft?.contentId || '').trim();
            if (!contentId || !versionIds.has(contentId)) {
                errors.push(
                    `My Version working draft ${index + 1} does not belong to a backed-up version.`
                );
            }
        });

        if (window.AtlasTutorContent?.validatePortableData) {
            const contentValidation =
                window.AtlasTutorContent.validatePortableData({
                    schemaVersion: 1,
                    versions: data.myVersions,
                    workingDrafts: data.workspace.myVersionWorkingDrafts
                });

            if (!contentValidation.valid) {
                errors.push(...contentValidation.errors);
            }
        }

        if (window.AtlasTutorSubjects?.validatePortableData) {
            const libraryState = data.mySubjects.library?.state || {};
            const fallbackOrder = data.mySubjects.subjects.map(subject => subject.id);
            const subjectValidation =
                window.AtlasTutorSubjects.validatePortableData({
                    schemaVersion: 1,
                    subjects: data.mySubjects.subjects,
                    workingDrafts: data.workspace.mySubjectWorkingDrafts,
                    order: Array.isArray(libraryState.order)
                        ? libraryState.order
                        : fallbackOrder,
                    sessionSubjects: {},
                    library: isPlainObject(libraryState.library)
                        ? libraryState.library
                        : undefined
                });

            if (!subjectValidation.valid) {
                errors.push(...subjectValidation.errors);
            }
        }

        const preferences = data.workspace.preferences;
        if (
            !isPlainObject(preferences) ||
            preferences.schemaVersion !== 1 ||
            !['off', 'key', 'all'].includes(preferences.upgradeVisibility)
        ) {
            errors.push('Backup workspace preferences are invalid.');
        }

        const allowedSessionIds = new Set([
            'default',
            ...data.learners.map(learner => learner.id)
        ]);

        Object.entries(data.workspace.appearanceBySession || {})
            .forEach(([sessionId, mode]) => {
                if (
                    !allowedSessionIds.has(sessionId) ||
                    !['light', 'night'].includes(mode)
                ) {
                    errors.push(
                        `Backup appearance for ${sessionId} is invalid.`
                    );
                }
            });

        if (errors.length) {
            const error = new Error(errors.join(' '));
            error.code = 'ATLAS_BACKUP_VALIDATION_FAILED';
            throw error;
        }

        return backup;
    }

    async function callRestoreRpc(backup, apply) {
        if (!window.AtlasCloud) {
            throw new Error('Atlas cloud restore is unavailable.');
        }

        const user = await AtlasCloud.getUser();
        if (!user?.id) {
            const error = new Error(
                'Sign in to an Atlas account before restoring an account backup.'
            );
            error.code = 'ATLAS_AUTH_REQUIRED';
            throw error;
        }

        const client = await AtlasCloud.getClient();
        const { data, error } = await client.rpc(RPC_NAME, {
            p_backup: backup,
            p_apply: apply === true
        });

        if (error) throw error;
        return data || {};
    }

    function collectWorkspaceConflicts(backup) {
        const data = backup.data;
        const conflicts = [];

        data.workspace.mySubjectWorkingDrafts.forEach(draft => {
            const key = encodedKey(SUBJECT_DRAFT_PREFIX, draft.subjectId);
            const currentRaw = storageGet(key);

            if (currentRaw === null) return;

            let current = null;
            try {
                current = JSON.parse(currentRaw);
            } catch {
                current = currentRaw;
            }

            if (!jsonEquals(current, draft)) {
                conflicts.push({
                    surface: 'my-subject-working-draft',
                    id: draft.subjectId,
                    reason: 'local working draft already exists'
                });
            }
        });

        data.workspace.myVersionWorkingDrafts.forEach(draft => {
            const key = encodedKey(VERSION_DRAFT_PREFIX, draft.contentId);
            const currentRaw = storageGet(key);

            if (currentRaw === null) return;

            let current = null;
            try {
                current = JSON.parse(currentRaw);
            } catch {
                current = currentRaw;
            }

            if (!jsonEquals(current, draft)) {
                conflicts.push({
                    surface: 'my-version-working-draft',
                    id: draft.contentId,
                    reason: 'local working draft already exists'
                });
            }
        });

        const Bridge = window.AtlasBridge;
        const preferenceKey = Bridge?.keys?.preferences;
        const appearanceKey = Bridge?.keys?.appearanceBySession;

        if (preferenceKey) {
            const raw = storageGet(preferenceKey);
            if (raw !== null) {
                try {
                    const current = JSON.parse(raw);
                    if (!jsonEquals(current, data.workspace.preferences)) {
                        conflicts.push({
                            surface: 'preferences',
                            id: 'account',
                            reason: 'local preferences already exist'
                        });
                    }
                } catch {
                    conflicts.push({
                        surface: 'preferences',
                        id: 'account',
                        reason: 'local preferences are unreadable'
                    });
                }
            }
        }

        if (appearanceKey) {
            const raw = storageGet(appearanceKey);
            if (raw !== null) {
                try {
                    const current = JSON.parse(raw);
                    Object.entries(data.workspace.appearanceBySession)
                        .forEach(([sessionId, mode]) => {
                            if (
                                Object.prototype.hasOwnProperty.call(
                                    current || {},
                                    sessionId
                                ) &&
                                current[sessionId] !== mode
                            ) {
                                conflicts.push({
                                    surface: 'appearance',
                                    id: sessionId,
                                    reason: 'local appearance already differs'
                                });
                            }
                        });
                } catch {
                    conflicts.push({
                        surface: 'appearance',
                        id: 'account',
                        reason: 'local appearance state is unreadable'
                    });
                }
            }
        }

        return conflicts;
    }

    async function previewRestore(candidate) {
        const backup = validateRestorePayload(candidate);
        const user = await AtlasCloud.getUser();

        if (!user?.id) {
            const error = new Error(
                'Sign in to an Atlas account before restoring an account backup.'
            );
            error.code = 'ATLAS_AUTH_REQUIRED';
            throw error;
        }

        const cloudPreview = await callRestoreRpc(backup, false);
        const workspaceConflicts = collectWorkspaceConflicts(backup);
        const cloudConflicts = Array.isArray(cloudPreview.conflicts)
            ? cloudPreview.conflicts
            : [];
        const conflicts = [
            ...cloudConflicts,
            ...workspaceConflicts
        ];

        return {
            ok: conflicts.length === 0,
            mode: 'preview',
            sourceAccountDifferent:
                String(backup.source.userId || '') !== String(user.id),
            conflictCount: conflicts.length,
            conflicts,
            wouldInsert: cloneJson(cloudPreview.wouldInsert || {}),
            workspace: {
                mySubjectWorkingDrafts:
                    backup.data.workspace.mySubjectWorkingDrafts.length,
                myVersionWorkingDrafts:
                    backup.data.workspace.myVersionWorkingDrafts.length,
                appearanceEntries:
                    Object.keys(backup.data.workspace.appearanceBySession).length,
                preferences: 1
            }
        };
    }

    function workspaceWrites(backup) {
        const data = backup.data;
        const writes = [];

        data.workspace.mySubjectWorkingDrafts.forEach(draft => {
            writes.push([
                encodedKey(SUBJECT_DRAFT_PREFIX, draft.subjectId),
                JSON.stringify(draft)
            ]);
        });

        data.workspace.myVersionWorkingDrafts.forEach(draft => {
            writes.push([
                encodedKey(VERSION_DRAFT_PREFIX, draft.contentId),
                JSON.stringify(draft)
            ]);
        });

        const Bridge = window.AtlasBridge;
        const preferenceKey = Bridge?.keys?.preferences;
        const appearanceKey = Bridge?.keys?.appearanceBySession;

        if (preferenceKey && storageGet(preferenceKey) === null) {
            writes.push([
                preferenceKey,
                JSON.stringify(data.workspace.preferences)
            ]);
        }

        if (appearanceKey) {
            let current = {};
            const raw = storageGet(appearanceKey);

            if (raw !== null) {
                try {
                    current = JSON.parse(raw) || {};
                } catch {
                    current = {};
                }
            }

            const merged = {
                ...current,
                ...data.workspace.appearanceBySession
            };

            if (!jsonEquals(current, merged)) {
                writes.push([
                    appearanceKey,
                    JSON.stringify(merged)
                ]);
            }
        }

        return writes;
    }

    function rollbackWorkspace(originals) {
        originals.forEach((value, key) => {
            if (value === null) {
                storageRemove(key);
            } else {
                storageSet(key, value);
            }
        });
    }

    function stageWorkspace(backup) {
        const originals = new Map();
        const writes = workspaceWrites(backup);

        try {
            writes.forEach(([key, value]) => {
                if (!originals.has(key)) {
                    originals.set(key, storageGet(key));
                }

                if (!storageSet(key, value)) {
                    throw new Error(
                        `Atlas could not stage local restore state for ${key}.`
                    );
                }
            });
        } catch (error) {
            rollbackWorkspace(originals);
            throw error;
        }

        return originals;
    }

    function pad(value) {
        return String(value).padStart(2, '0');
    }

    function safetyFilename(date = new Date()) {
        return [
            'atlas-backup-before-restore-',
            date.getFullYear(),
            '-',
            pad(date.getMonth() + 1),
            '-',
            pad(date.getDate()),
            '-',
            pad(date.getHours()),
            pad(date.getMinutes()),
            '.json'
        ].join('');
    }

    function downloadJson(backup, filename) {
        const blob = new Blob(
            [JSON.stringify(backup, null, 2)],
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
    }

    async function maybeDownloadSafetyBackup(Portable, enabled) {
        if (enabled === false) return null;

        const current = await Portable.exportBackup();
        if (!Portable.hasMeaningfulPortableData(current)) return current;

        downloadJson(current, safetyFilename());
        return current;
    }

    function conflictMessage(preview) {
        const conflicts = preview.conflicts || [];
        const first = conflicts.slice(0, 3)
            .map(item => `${item.surface}: ${item.id}`)
            .join(', ');
        const suffix = conflicts.length > 3
            ? ` and ${conflicts.length - 3} more`
            : '';

        return [
            `Atlas found ${conflicts.length} restore conflict${conflicts.length === 1 ? '' : 's'}.`,
            first ? `${first}${suffix}.` : '',
            'Nothing was changed. Restore into a fresh account or resolve the conflicting Atlas data first.'
        ].filter(Boolean).join(' ');
    }

    async function restoreV3(candidate, options = {}) {
        const Portable = requirePortable();
        const backup = validateRestorePayload(candidate);
        const preview = await previewRestore(backup);

        if (preview.conflictCount > 0) {
            const error = new Error(conflictMessage(preview));
            error.code = 'ATLAS_RESTORE_CONFLICTS';
            error.preview = preview;
            throw error;
        }

        await maybeDownloadSafetyBackup(
            Portable,
            options.downloadSafetyBackup !== false
        );

        const originals = stageWorkspace(backup);
        let result;

        try {
            result = await callRestoreRpc(backup, true);
        } catch (error) {
            rollbackWorkspace(originals);
            throw error;
        }

        try {
            window.dispatchEvent(
                new CustomEvent('atlas:restore-complete', {
                    detail: {
                        version: VERSION,
                        inserted: cloneJson(result.inserted || {}),
                        sourceAccountDifferent:
                            preview.sourceAccountDifferent
                    }
                })
            );
        } catch { }

        return {
            backup,
            preview,
            inserted: cloneJson(result.inserted || {})
        };
    }

    function describePreview(preview) {
        if (!preview) return '';

        if (preview.conflictCount > 0) {
            return conflictMessage(preview);
        }

        const counts = preview.wouldInsert || {};
        const pieces = [
            counts.learners ? `${counts.learners} learner${counts.learners === 1 ? '' : 's'}` : '',
            counts.mySubjects ? `${counts.mySubjects} My Subject${counts.mySubjects === 1 ? '' : 's'}` : '',
            counts.myVersions ? `${counts.myVersions} My Version${counts.myVersions === 1 ? '' : 's'}` : ''
        ].filter(Boolean);

        const sourceNote = preview.sourceAccountDifferent
            ? ' The backup came from another Atlas account; account access and plan do not transfer.'
            : '';

        return [
            'Safe restore is ready.',
            pieces.length ? `Atlas will add ${pieces.join(', ')} without deleting existing unrelated data.` : 'Atlas found no conflicting durable data.',
            'A safety backup will download first if this account already contains Atlas data.',
            sourceNote
        ].join(' ').replace(/\s+/g, ' ').trim();
    }

    function installPreviewUi(Portable) {
        const input = document.getElementById('restore-backup-input');
        if (!input || input.dataset.atlasV3RestorePreview === 'true') return;

        input.dataset.atlasV3RestorePreview = 'true';

        input.addEventListener('change', event => {
            const file = event.target?.files?.[0];
            const token = ++previewUiToken;

            window.setTimeout(async () => {
                if (!file || token !== previewUiToken) return;

                let candidate;
                try {
                    candidate = JSON.parse(await file.text());
                } catch {
                    return;
                }

                if (Number(candidate?.version) !== VERSION) return;

                const warning = document.querySelector(
                    '#data-backup-preview .data-backup-warning'
                );
                const confirm = document.getElementById(
                    'confirm-restore-button'
                );

                if (warning) {
                    warning.textContent = 'Checking this backup against the current Atlas account…';
                }
                if (confirm) {
                    confirm.disabled = true;
                    confirm.textContent = 'Checking…';
                }

                try {
                    const validation = Portable.validateBackup(candidate);
                    if (!validation.valid) return;

                    const preview = await previewRestore(validation.backup);
                    if (token !== previewUiToken) return;

                    if (warning) {
                        warning.textContent = describePreview(preview);
                    }

                    if (confirm) {
                        confirm.disabled = preview.conflictCount > 0;
                        confirm.textContent = preview.conflictCount > 0
                            ? 'Conflicts found'
                            : 'Restore backup';
                    }
                } catch (error) {
                    if (token !== previewUiToken) return;

                    if (warning) {
                        warning.textContent =
                            error?.message ||
                            'Atlas could not preview this restore.';
                    }
                    if (confirm) {
                        confirm.disabled = true;
                        confirm.textContent = 'Restore unavailable';
                    }
                }
            }, 0);
        });
    }

    function install() {
        if (installed) return true;

        const Portable = window.AtlasPortableData;
        if (
            !Portable ||
            Number(Portable.version) !== VERSION ||
            !window.AtlasPortableDataV3
        ) {
            return false;
        }

        const previousRestore =
            typeof Portable.restoreBackup === 'function'
                ? Portable.restoreBackup.bind(Portable)
                : null;

        Portable.previewRestore = previewRestore;
        Portable.restoreBackup = async function restoreBackup(
            candidate,
            options = {}
        ) {
            if (Number(candidate?.version) !== VERSION) {
                if (!previousRestore) {
                    throw new Error('Legacy Atlas restore is unavailable.');
                }
                return previousRestore(candidate, options);
            }

            return restoreV3(candidate, options);
        };

        window.AtlasPortableRestoreV3 = Object.freeze({
            active: true,
            version: VERSION,
            previewRestore,
            describePreview
        });

        installed = true;

        if (document.readyState === 'loading') {
            document.addEventListener(
                'DOMContentLoaded',
                () => installPreviewUi(Portable),
                { once: true }
            );
        } else {
            installPreviewUi(Portable);
        }

        return true;
    }

    function retryInstall() {
        if (install()) return;
        installAttempts += 1;
        if (installAttempts >= INSTALL_RETRY_LIMIT) return;
        window.setTimeout(retryInstall, 50);
    }

    retryInstall();
})();
