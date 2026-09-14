/* ============================================================
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

            clearRecoveryTimer();
            queueRecoveryCheck({ wake: true });
        };

        window.addEventListener('online', () => {
            if (!isOwnedSubjectRuntime()) return;
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
