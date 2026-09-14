from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {count}')
    return text.replace(old, new, 1)


# ------------------------------------------------------------
# 1. Tutor Subjects persistence: atomic build checkpoint journal.
# ------------------------------------------------------------
path = Path('shared/atlas-tutor-subjects.js')
text = path.read_text(encoding='utf-8')

text = replace_once(
    text,
    "    const WORKING_DRAFT_PREFIX = 'atlas::tutorSubjects::workingDraft::';\n    const BUILD_STATE_PREFIX = 'atlas::tutorSubjects::buildState::';\n    const SESSION_SUBJECTS_PREFIX = 'atlas::tutorSubjects::sessionSubjects::';",
    "    const WORKING_DRAFT_PREFIX = 'atlas::tutorSubjects::workingDraft::';\n    const BUILD_STATE_PREFIX = 'atlas::tutorSubjects::buildState::';\n    const BUILD_CHECKPOINT_PREFIX = 'atlas::tutorSubjects::buildCheckpoint::';\n    const SESSION_SUBJECTS_PREFIX = 'atlas::tutorSubjects::sessionSubjects::';",
    'checkpoint prefix'
)

text = replace_once(
    text,
    "    function buildStateStorageKey(subjectId) {\n        return `${BUILD_STATE_PREFIX}${encodePart(subjectId)}`;\n    }\n\n    function sessionSubjectsStorageKey(sessionId) {",
    "    function buildStateStorageKey(subjectId) {\n        return `${BUILD_STATE_PREFIX}${encodePart(subjectId)}`;\n    }\n\n    function buildCheckpointStorageKey(subjectId) {\n        return `${BUILD_CHECKPOINT_PREFIX}${encodePart(subjectId)}`;\n    }\n\n    function sessionSubjectsStorageKey(sessionId) {",
    'checkpoint storage key'
)

checkpoint_normalizer = r'''
    function normalizeBuildCheckpoint(record, subjectId) {
        if (
            !record ||
            typeof record !== 'object' ||
            Array.isArray(record)
        ) {
            return null;
        }

        const id = String(subjectId || '').trim();
        const workingDraft = normalizeWorkingDraft(
            record.workingDraft,
            id
        );
        const buildState = normalizeBuildState(
            record.buildState,
            id
        );

        if (!id || !workingDraft || !buildState) {
            return null;
        }

        return {
            schemaVersion: SCHEMA_VERSION,
            subjectId: id,
            workingDraft,
            buildState,
            updatedAt: Math.max(
                Number(record.updatedAt) || 0,
                Number(workingDraft.updatedAt) || 0,
                Number(buildState.updatedAt) || 0
            )
        };
    }

'''
marker = '    function validatePortableDocument(document, label, errors) {'
if text.count(marker) != 1:
    raise SystemExit('checkpoint normalizer marker mismatch')
text = text.replace(marker, checkpoint_normalizer + marker, 1)

old_get_draft = r'''    async function getWorkingDraft(subjectId) {
        const subject = await getSubject(subjectId);

        if (!subject) return null;

        return normalizeWorkingDraft(
            readJson(workingDraftStorageKey(subject.id)),
            subject.id
        );
    }
'''
new_get_draft = r'''    async function getWorkingDraft(subjectId) {
        const subject = await getSubject(subjectId);

        if (!subject) return null;

        const storedDraft = normalizeWorkingDraft(
            readJson(workingDraftStorageKey(subject.id)),
            subject.id
        );

        const checkpoint = normalizeBuildCheckpoint(
            readJson(buildCheckpointStorageKey(subject.id)),
            subject.id
        );

        if (
            checkpoint &&
            (
                !storedDraft ||
                checkpoint.workingDraft.updatedAt >=
                    storedDraft.updatedAt
            )
        ) {
            if (
                !storedDraft ||
                JSON.stringify(storedDraft) !==
                    JSON.stringify(checkpoint.workingDraft)
            ) {
                writeJson(
                    workingDraftStorageKey(subject.id),
                    checkpoint.workingDraft
                );
            }

            return cloneJson(
                checkpoint.workingDraft
            );
        }

        return cloneJson(storedDraft);
    }
'''
text = replace_once(text, old_get_draft, new_get_draft, 'getWorkingDraft')

old_get_state = r'''    async function getBuildState(subjectId) {
        const subject = await getSubject(subjectId);

        if (!subject) return null;

        return normalizeBuildState(
            readJson(
                buildStateStorageKey(subject.id)
            ),
            subject.id
        );
    }
'''
new_get_state = r'''    async function getBuildState(subjectId) {
        const subject = await getSubject(subjectId);

        if (!subject) return null;

        const storedState = normalizeBuildState(
            readJson(
                buildStateStorageKey(subject.id)
            ),
            subject.id
        );

        const checkpoint = normalizeBuildCheckpoint(
            readJson(
                buildCheckpointStorageKey(subject.id)
            ),
            subject.id
        );

        if (
            checkpoint &&
            (
                !storedState ||
                checkpoint.buildState.updatedAt >=
                    storedState.updatedAt
            )
        ) {
            if (
                !storedState ||
                JSON.stringify(storedState) !==
                    JSON.stringify(checkpoint.buildState)
            ) {
                writeJson(
                    buildStateStorageKey(subject.id),
                    checkpoint.buildState
                );
            }

            return cloneJson(
                checkpoint.buildState
            );
        }

        return cloneJson(storedState);
    }
'''
text = replace_once(text, old_get_state, new_get_state, 'getBuildState')

save_checkpoint = r'''
    async function saveBuildCheckpoint(
        subjectId,
        checkpoint = {}
    ) {
        const subject = await getSubject(subjectId);

        if (!subject) return null;

        const candidate =
            checkpoint &&
            typeof checkpoint === 'object' &&
            !Array.isArray(checkpoint)
                ? checkpoint
                : {};

        const workingPatch =
            candidate.workingDraft &&
            typeof candidate.workingDraft === 'object' &&
            !Array.isArray(candidate.workingDraft)
                ? candidate.workingDraft
                : {};

        const buildPatch =
            candidate.buildState &&
            typeof candidate.buildState === 'object' &&
            !Array.isArray(candidate.buildState)
                ? candidate.buildState
                : {};

        const document = normalizeDocument(
            workingPatch.document
        );

        if (
            !document ||
            !validateStructuredDocument(
                document,
                'build checkpoint'
            )
        ) {
            return null;
        }

        const currentDraft =
            await getWorkingDraft(subject.id);

        const currentState =
            await getBuildState(subject.id);

        const timestamp = Date.now();

        const workingDraft = {
            schemaVersion: SCHEMA_VERSION,
            subjectId: subject.id,
            ownerId: LOCAL_OWNER_ID,
            format: STRUCTURED_FORMAT,
            baseRevision: Math.max(
                1,
                Math.floor(
                    Number(workingPatch.baseRevision) ||
                    Number(currentDraft?.baseRevision) ||
                    subject.revision
                )
            ),
            document,
            includedLiveSessionId:
                typeof workingPatch.includedLiveSessionId === 'string' &&
                workingPatch.includedLiveSessionId.trim()
                    ? workingPatch.includedLiveSessionId.trim()
                    : null,
            activeViewId:
                typeof workingPatch.activeViewId === 'string' &&
                workingPatch.activeViewId.trim()
                    ? workingPatch.activeViewId.trim()
                    : currentDraft?.activeViewId || 'view-cover',
            startedAt:
                currentDraft?.startedAt ||
                timestamp,
            updatedAt:
                timestamp
        };

        const buildState = normalizeBuildState(
            {
                ...currentState,
                ...buildPatch,
                kind:
                    buildPatch.kind ||
                    currentState?.kind ||
                    'full-subject',
                startedAt:
                    currentState?.startedAt ||
                    timestamp,
                updatedAt:
                    timestamp
            },
            subject.id
        );

        if (!buildState) return null;

        const next = {
            schemaVersion: SCHEMA_VERSION,
            subjectId: subject.id,
            workingDraft,
            buildState,
            updatedAt: timestamp
        };

        /*
         * One localStorage write owns the durable generation checkpoint.
         * The old draft/state records remain mirrored for compatibility,
         * but either mirror can be reconstructed from this journal after
         * interrupted navigation.
         */
        if (
            !writeJson(
                buildCheckpointStorageKey(subject.id),
                next
            )
        ) {
            return null;
        }

        const draftMirrored = writeJson(
            workingDraftStorageKey(subject.id),
            workingDraft
        );

        const stateMirrored = writeJson(
            buildStateStorageKey(subject.id),
            buildState
        );

        if (!draftMirrored || !stateMirrored) {
            console.warn(
                '[AtlasTutorSubjects] Generation checkpoint mirror write failed; the atomic checkpoint journal remains authoritative.'
            );
        }

        return cloneJson(next);
    }

'''
marker = '    async function clearBuildState(subjectId) {'
if text.count(marker) != 1:
    raise SystemExit('saveBuildCheckpoint marker mismatch')
text = text.replace(marker, save_checkpoint + marker, 1)

old_clear = r'''    async function clearBuildState(subjectId) {
        const id = String(subjectId || '').trim();

        if (!id) return false;

        return removeValue(
            buildStateStorageKey(id)
        );
    }
'''
new_clear = r'''    async function clearBuildState(subjectId) {
        const id = String(subjectId || '').trim();

        if (!id) return false;

        const stateRemoved = removeValue(
            buildStateStorageKey(id)
        );

        const checkpointRemoved = removeValue(
            buildCheckpointStorageKey(id)
        );

        return stateRemoved && checkpointRemoved;
    }
'''
text = replace_once(text, old_clear, new_clear, 'clearBuildState')

text = replace_once(
    text,
    "            removeValue(\n                buildStateStorageKey(current.id)\n            );\n\n            removeMySubjectFromSessionSubjects(",
    "            removeValue(\n                buildStateStorageKey(current.id)\n            );\n\n            removeValue(\n                buildCheckpointStorageKey(current.id)\n            );\n\n            removeMySubjectFromSessionSubjects(",
    'delete checkpoint cleanup'
)

text = replace_once(
    text,
    "        getBuildState,\n        saveBuildState,\n        clearBuildState,",
    "        getBuildState,\n        saveBuildState,\n        saveBuildCheckpoint,\n        clearBuildState,",
    'API export'
)

path.write_text(text, encoding='utf-8')


# ------------------------------------------------------------
# 2. Compass engine: draft and completedStep become one checkpoint.
# ------------------------------------------------------------
path = Path('compass/shared/compass-engine.js')
text = path.read_text(encoding='utf-8')

old_engine = r'''async function saveMyVersionFullSubjectBuildState(
    completedStep,
    autoSaveOnComplete
) {
    if (!isOwnedSubjectRuntime()) {
        return null;
    }

    return requireAtlasTutorSubjects()
        .saveBuildState(
            MODULE.id,
            {
                kind: 'full-subject',
                completedStep,
                autoSaveOnComplete
            }
        );
}

async function checkpointMyVersionFullSubjectGeneration(
    completedStep,
    autoSaveOnComplete
) {
    const savedDraft =
        await flushMyVersionWorkingDraftSave();

    if (!savedDraft) {
        throw new Error(
            'Could not autosave subject construction progress.'
        );
    }

    const savedState =
        await saveMyVersionFullSubjectBuildState(
            completedStep,
            autoSaveOnComplete
        );

    if (!savedState) {
        throw new Error(
            'Could not save subject construction state.'
        );
    }

    return savedState;
}
'''

new_engine = r'''async function checkpointMyVersionFullSubjectGeneration(
    completedStep,
    autoSaveOnComplete
) {
    if (!isOwnedSubjectRuntime()) {
        return null;
    }

    clearMyVersionWorkingDraftSaveTimer();

    const pending =
        myVersionPendingWorkingDraftOverrides;

    myVersionPendingWorkingDraftOverrides = null;

    const workingDraft =
        getMyVersionWorkingDraftPatch(
            pending || myVersionDraftOverrides
        );

    const checkpoint =
        await queueTutorContentWrite(
            async () => {
                const Subjects =
                    requireAtlasTutorSubjects();

                if (
                    typeof Subjects.saveBuildCheckpoint !==
                    'function'
                ) {
                    throw new Error(
                        'Atomic subject construction checkpoints are unavailable.'
                    );
                }

                const saved =
                    await Subjects.saveBuildCheckpoint(
                        MODULE.id,
                        {
                            workingDraft,
                            buildState: {
                                kind: 'full-subject',
                                completedStep,
                                autoSaveOnComplete
                            }
                        }
                    );

                if (
                    saved?.workingDraft &&
                    myVersionEditing
                ) {
                    tutorContentWorkingDraft =
                        saved.workingDraft;
                }

                return saved;
            }
        );

    const savedState =
        checkpoint?.buildState || null;

    if (!savedState) {
        throw new Error(
            'Could not save subject construction checkpoint.'
        );
    }

    return savedState;
}
'''

text = replace_once(text, old_engine, new_engine, 'Compass atomic checkpoint')
path.write_text(text, encoding='utf-8')


# ------------------------------------------------------------
# 3. Recovery: persisted unfinished state is the recovery signal.
# ------------------------------------------------------------
recovery = r'''/* ============================================================
   COMPASS GENERATION RECOVERY
   Bounded self-healing for owned-subject background generation.

   Full-subject construction checkpoints each completed step. This layer
   treats the persisted checkpoint itself as the recovery signal: if a
   build exists and no generator is active, Compass can continue it
   without waiting for an error string to appear first.

   Does NOT own:
   - generated content
   - authoring history
   - Live Changes
   - persistence implementation
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasCompassGenerationRecovery) return;

    const FULL_SUBJECT_RECOVERY_DELAYS_MS = [5000, 15000];
    const PAUSED_ERROR_PREFIX = 'Generation paused at ';

    let runtimeInstalled = false;
    let recoveryTimer = null;
    let recoveryCheckQueued = false;
    let recoveryWakeRequested = false;
    let recoveryStepKey = '';
    let recoveryAttemptsAtStep = 0;
    let recoveryPending = false;
    let lastCheckpointAttempt = null;
    let originalUpdateMyVersionAuthorBar = null;
    let originalCheckpointFullSubject = null;

    function getSubjectId() {
        return String(window.MODULE?.id || '').trim();
    }

    function getSubjectsStore() {
        const Subjects = window.AtlasTutorSubjects;

        return Subjects &&
            typeof Subjects.getBuildState === 'function'
                ? Subjects
                : null;
    }

    function isOwnedSubjectRuntime() {
        return Boolean(
            window.AtlasCompassSubjectRuntime?.source === 'owned' &&
            getSubjectId()
        );
    }

    function hasOtherGenerationActivity() {
        return Boolean(
            myVersionGeneratingSubjectFraming ||
            myVersionGeneratingOverview ||
            myVersionGeneratingDiscussionFraming ||
            myVersionGeneratingCulturalLensFraming ||
            myVersionGeneratingReflection ||
            myVersionGeneratingDiscussionSet ||
            myVersionGeneratingCulturalLensCard ||
            myVersionEnrichingDiscussion ||
            myVersionEnrichingCulturalLens ||
            myVersionGeneratingMomentSetIds.size > 0 ||
            myVersionGeneratingPathwayMomentIds.size > 0
        );
    }

    function clearRecoveryTimer() {
        if (recoveryTimer === null) return;

        window.clearTimeout(recoveryTimer);
        recoveryTimer = null;
    }

    function getRetryButton() {
        return document.getElementById(
            'atlas-full-subject-retry'
        );
    }

    function ensureRetryButton() {
        let button = getRetryButton();
        if (button) return button;

        const actions = document.getElementById(
            'atlas-my-version-actions'
        );

        if (!actions) return null;

        button = document.createElement('button');
        button.id = 'atlas-full-subject-retry';
        button.className =
            'atlas-my-version-secondary atlas-my-version-ai';
        button.type = 'button';
        button.textContent = 'Retry generation';
        button.hidden = true;
        button.addEventListener('click', () => {
            clearRecoveryTimer();
            button.hidden = true;
            void resumeFromCheckpoint({ manual: true });
        });

        const moreButton = document.getElementById(
            'atlas-my-version-more-action'
        );

        actions.insertBefore(
            button,
            moreButton || actions.firstChild
        );

        return button;
    }

    function showRetryButton(show) {
        const button = ensureRetryButton();
        if (button) button.hidden = !show;
    }

    function resetRecoveryState() {
        clearRecoveryTimer();
        recoveryWakeRequested = false;
        recoveryStepKey = '';
        recoveryAttemptsAtStep = 0;
        recoveryPending = false;
        lastCheckpointAttempt = null;
        showRetryButton(false);
    }

    function setRecoveryStatus(message) {
        myVersionFullSubjectGenerationError =
            String(message || '');

        if (
            typeof originalUpdateMyVersionAuthorBar === 'function'
        ) {
            originalUpdateMyVersionAuthorBar();
        }
    }

    function getFailedStageLabel() {
        const message = String(
            myVersionFullSubjectGenerationError || ''
        );

        if (!message.startsWith(PAUSED_ERROR_PREFIX)) {
            return '';
        }

        return message
            .slice(PAUSED_ERROR_PREFIX.length)
            .split('. Your work')[0]
            .trim();
    }

    async function readBuildState() {
        const Subjects = getSubjectsStore();
        const subjectId = getSubjectId();

        if (!Subjects || !subjectId) return null;

        try {
            const state = await Subjects.getBuildState(
                subjectId
            );

            return state?.kind === 'full-subject'
                ? state
                : null;
        } catch (error) {
            console.warn(
                '[Compass] Could not read generation checkpoint.',
                error
            );
            return null;
        }
    }

    /*
     * A generated mutation can land in memory immediately before a storage
     * failure. Retry that exact checkpoint before regenerating the step so
     * structural content cannot be duplicated.
     */
    async function repairLatestCheckpoint(state) {
        if (
            !lastCheckpointAttempt ||
            typeof originalCheckpointFullSubject !== 'function'
        ) {
            return state;
        }

        const persistedStep = Math.max(
            0,
            Math.floor(Number(state?.completedStep) || 0)
        );
        const attemptedStep = Math.max(
            0,
            Math.floor(
                Number(lastCheckpointAttempt.completedStep) || 0
            )
        );

        if (state && attemptedStep <= persistedStep) {
            return state;
        }

        try {
            await originalCheckpointFullSubject(
                attemptedStep,
                lastCheckpointAttempt.autoSaveOnComplete
            );

            return await readBuildState();
        } catch (error) {
            console.warn(
                '[Compass] Generation checkpoint repair failed.',
                error
            );
            return state;
        }
    }

    function isRecoveryEligible() {
        return Boolean(
            runtimeInstalled &&
            isOwnedSubjectRuntime() &&
            myVersionEditing &&
            !myVersionSaving &&
            !myVersionGeneratingFullSubject
        );
    }

    function queueRecoveryCheck({ wake = false } = {}) {
        if (wake) {
            recoveryWakeRequested = true;
        }

        if (recoveryCheckQueued) return;

        recoveryCheckQueued = true;

        queueMicrotask(() => {
            recoveryCheckQueued = false;
            void maybeScheduleRecovery();
        });
    }

    function scheduleRetry(delayMs) {
        clearRecoveryTimer();

        recoveryTimer = window.setTimeout(() => {
            recoveryTimer = null;
            void resumeFromCheckpoint();
        }, delayMs);
    }

    async function maybeScheduleRecovery() {
        if (!runtimeInstalled) return;

        if (!myVersionEditing) {
            resetRecoveryState();
            return;
        }

        if (!isRecoveryEligible()) return;

        let state = await readBuildState();
        state = await repairLatestCheckpoint(state);

        if (!state) {
            resetRecoveryState();
            return;
        }

        recoveryPending = true;
        showRetryButton(false);

        const completedStep = Math.max(
            0,
            Math.floor(Number(state.completedStep) || 0)
        );
        const stepKey = `${getSubjectId()}:${completedStep}`;

        if (stepKey !== recoveryStepKey) {
            recoveryStepKey = stepKey;
            recoveryAttemptsAtStep = 0;
        }

        if (navigator.onLine === false) {
            setRecoveryStatus(
                'Connection lost · generation will continue when you reconnect.'
            );
            return;
        }

        if (recoveryTimer !== null) return;

        const failedAt =
            getFailedStageLabel() ||
            'this step';

        if (
            recoveryAttemptsAtStep >=
            FULL_SUBJECT_RECOVERY_DELAYS_MS.length
        ) {
            recoveryWakeRequested = false;
            recoveryPending = false;
            setRecoveryStatus(
                `Generation paused at ${failedAt}. Your work is saved — Atlas already retried automatically.`
            );
            showRetryButton(true);
            return;
        }

        const delayMs =
            recoveryWakeRequested
                ? 500
                : FULL_SUBJECT_RECOVERY_DELAYS_MS[
                    recoveryAttemptsAtStep
                ];

        recoveryWakeRequested = false;

        setRecoveryStatus(
            'Generation interrupted · continuing…'
        );
        scheduleRetry(delayMs);
    }

    async function resumeFromCheckpoint({ manual = false } = {}) {
        if (!isRecoveryEligible()) return false;

        if (navigator.onLine === false) {
            recoveryPending = true;
            setRecoveryStatus(
                'Connection lost · generation will continue when you reconnect.'
            );
            return false;
        }

        if (hasOtherGenerationActivity()) {
            recoveryPending = true;
            scheduleRetry(2000);
            return false;
        }

        let state = await readBuildState();
        state = await repairLatestCheckpoint(state);

        if (!state || !isRecoveryEligible()) {
            if (!state) {
                resetRecoveryState();
            }
            return false;
        }

        const generator =
            window.generateMyVersionFullSubject;

        if (typeof generator !== 'function') {
            showRetryButton(true);
            return false;
        }

        const completedStep = Math.max(
            0,
            Math.floor(Number(state.completedStep) || 0)
        );
        const stepKey = `${getSubjectId()}:${completedStep}`;

        if (stepKey !== recoveryStepKey) {
            recoveryStepKey = stepKey;
            recoveryAttemptsAtStep = 0;
        }

        if (!manual) {
            recoveryAttemptsAtStep += 1;
        }

        recoveryPending = true;
        showRetryButton(false);

        myVersionFullSubjectGenerationError = '';
        myVersionFullSubjectGenerationNotice =
            manual
                ? 'Retrying generation…'
                : 'Continuing generation…';

        if (
            typeof originalUpdateMyVersionAuthorBar === 'function'
        ) {
            originalUpdateMyVersionAuthorBar();
        }

        void generator({
            autoSaveOnComplete:
                state.autoSaveOnComplete !== false,
            resumeFromStep: completedStep
        });

        return true;
    }

    function installRuntimeRecovery() {
        if (runtimeInstalled) return true;

        if (
            typeof window.generateMyVersionFullSubject !== 'function' ||
            typeof window.updateMyVersionAuthorBar !== 'function' ||
            typeof window.checkpointMyVersionFullSubjectGeneration !== 'function'
        ) {
            return false;
        }

        originalUpdateMyVersionAuthorBar =
            window.updateMyVersionAuthorBar;
        originalCheckpointFullSubject =
            window.checkpointMyVersionFullSubjectGeneration;

        window.checkpointMyVersionFullSubjectGeneration =
            async function (
                completedStep,
                autoSaveOnComplete
            ) {
                lastCheckpointAttempt = {
                    completedStep,
                    autoSaveOnComplete
                };

                return originalCheckpointFullSubject
                    .apply(this, arguments);
            };

        window.updateMyVersionAuthorBar = function (...args) {
            const result =
                originalUpdateMyVersionAuthorBar
                    .apply(this, args);

            queueRecoveryCheck();
            return result;
        };

        const wakeRecovery = () => {
            if (
                !runtimeInstalled ||
                document.hidden
            ) {
                return;
            }

            queueRecoveryCheck({ wake: true });
        };

        window.addEventListener('online', () => {
            if (!isOwnedSubjectRuntime()) return;

            if (myVersionEditing) {
                setRecoveryStatus(
                    'Connection restored · checking generation…'
                );
            }

            wakeRecovery();
        });

        window.addEventListener(
            'focus',
            wakeRecovery
        );

        window.addEventListener(
            'pageshow',
            wakeRecovery
        );

        document.addEventListener(
            'visibilitychange',
            () => {
                if (!document.hidden) {
                    wakeRecovery();
                }
            }
        );

        runtimeInstalled = true;
        ensureRetryButton();
        queueRecoveryCheck();
        return true;
    }

    window.AtlasCompassGenerationRecovery = {
        installRuntime: installRuntimeRecovery,

        retryNow() {
            if (!runtimeInstalled) return false;

            clearRecoveryTimer();
            showRetryButton(false);
            void resumeFromCheckpoint({ manual: true });
            return true;
        }
    };
})();
'''

Path('compass/shared/compass-generation-recovery.js').write_text(
    recovery,
    encoding='utf-8'
)
