/* ============================================================
   COMPASS SUBJECT LOADER
   Loads a Structured Subject into the shared Compass runtime.

   Current dynamic source:
   - independently owned My Subjects via AtlasTutorSubjects

   The shared Compass engine remains the teaching runtime.
   This loader only resolves subject data before that engine executes.
   ============================================================ */

(function () {
    'use strict';

    const SUBJECT_LOAD_TIMEOUT_MS = 15000;

    let resolveOwnedSubjectRuntimeLayersReady = null;

    window.AtlasCompassOwnedSubjectRuntimeLayersReady =
        new Promise(resolve => {
            resolveOwnedSubjectRuntimeLayersReady = resolve;
        });

    function signalOwnedSubjectRuntimeLayersReady(ready) {
        if (!resolveOwnedSubjectRuntimeLayersReady) return;

        const resolve =
            resolveOwnedSubjectRuntimeLayersReady;

        resolveOwnedSubjectRuntimeLayersReady = null;
        resolve(Boolean(ready));
    }

    function cloneJson(value) {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return null;
        }
    }

    function traceBuild(
        stage,
        detail = {}
    ) {
        window
            .AtlasSubjectBuildWorkerClient
            ?.traceDebug?.(
                'loader:' + stage,
                detail
            );
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getRequestedSubjectId() {
        try {
            return new URL(window.location.href)
                .searchParams
                .get('id')
                ?.trim() || '';
        } catch {
            return '';
        }
    }

    function getBuildPresentationRequest() {
        try {
            return new URL(window.location.href)
                .searchParams
                .get('author') === 'generate';
        } catch {
            return false;
        }
    }

    function getStatusElement() {
        return document.getElementById(
            'compass-subject-load-status'
        );
    }

    function showLoadError(
        message,
        {
            canRetry = true
        } = {}
    ) {
        const status = getStatusElement();

        if (!status) return;

        const messageElement =
            status.querySelector(
                '#compass-subject-load-message'
            );

        const retryButton =
            status.querySelector(
                '#compass-subject-load-retry'
            );

        if (messageElement) {
            messageElement.textContent = message;
        } else {
            status.textContent = message;
        }

        status.classList.add('is-error');
        status.setAttribute('role', 'alert');
        status.setAttribute('aria-busy', 'false');

        if (retryButton) {
            retryButton.hidden = !canRetry;
            retryButton.onclick = canRetry
                ? () => window.location.reload()
                : null;
        }
    }

    function withTimeout(
        promise,
        errorMessage
    ) {
        let timeoutId = null;

        const timeoutPromise =
            new Promise((resolve, reject) => {
                timeoutId = setTimeout(
                    () => reject(
                        new Error(errorMessage)
                    ),
                    SUBJECT_LOAD_TIMEOUT_MS
                );
            });

        return Promise.race([
            promise,
            timeoutPromise
        ]).finally(() => {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
        });
    }

    function requireAtlasTutorSubjects() {
        if (!window.AtlasTutorSubjects) {
            throw new Error(
                'AtlasTutorSubjects is missing. atlas-tutor-subjects.js must load before compass-subject-loader.js.'
            );
        }

        return window.AtlasTutorSubjects;
    }

    function getOwnedSubjectAiBuildState(record) {
        const Lifecycle =
            window.AtlasAiSubjectBuildLifecycle;

        if (
            Lifecycle &&
            typeof Lifecycle.classify === 'function'
        ) {
            return Lifecycle.classify(record);
        }

        /*
         * Fail-safe only for a partially cached deploy. The shared lifecycle
         * module is the canonical path; this preserves recovery rather than
         * exposing an unfinished shell if that script failed to load.
         */
        const metadata =
            record?.metadata &&
            typeof record.metadata === 'object' &&
            !Array.isArray(record.metadata)
                ? record.metadata
                : {};

        const provenanceKind =
            String(
                record?.provenance?.kind || ''
            ).trim();

        const status =
            String(
                metadata.aiBuildStatus || ''
            ).trim();

        const legacyRecovery =
            metadata.legacyAiBuildRecovery === true;

        const knownAiLifecycle =
            provenanceKind === 'ai-subject-build' ||
            ['building', 'paused', 'complete']
                .includes(status);

        return {
            status,
            provenanceKind,
            legacyRecovery,
            incomplete:
                status === 'complete'
                    ? false
                    : (
                        legacyRecovery ||
                        knownAiLifecycle
                    )
        };
    }

    function normalizeOwnedStructuredSubject(record) {
        if (
            !record ||
            typeof record !== 'object' ||
            record.format !== 'structured'
        ) {
            return null;
        }

        const document = cloneJson(record.document);
        const Structured =
            window.AtlasStructuredSubject;

        if (
            !document ||
            !Structured ||
            typeof Structured.validateDocument !== 'function'
        ) {
            return null;
        }

        const validation =
            Structured.validateDocument(document);

        if (!validation.valid) {
            console.error(
                '[Compass] Owned Structured Subject validation failed:',
                validation.errors
            );
            return null;
        }

        if (
            !document.module ||
            typeof document.module !== 'object' ||
            !document.subjectCopy ||
            typeof document.subjectCopy !== 'object' ||
            !Array.isArray(document.discussionSets) ||
            !Array.isArray(document.culturalLensCards)
        ) {
            return null;
        }

        const title = String(
            document.module.title ||
            record.metadata?.title ||
            'Untitled Subject'
        ).trim() || 'Untitled Subject';

        const navTitle = String(
            document.module.navTitle ||
            record.metadata?.navTitle ||
            title
        ).trim() || title;

        const bgImage = String(
            document.module.bgImage ||
            record.metadata?.coverImage ||
            ''
        ).trim();

        const catalogDescription = String(
            document.module.catalogDescription ||
            record.metadata?.description ||
            ''
        ).trim();

        const aiBuild =
            getOwnedSubjectAiBuildState(record);

        return {
            runtime: {
                source: 'owned',
                subjectId: record.id,
                ownerId: record.ownerId,
                format: record.format,
                revision: record.revision,
                generationContext:
                    cloneJson(
                        record.metadata?.generationContext
                    ) || {},
                aiBuildStatus:
                    aiBuild.status,
                aiBuildIncomplete:
                    aiBuild.incomplete,
                aiBuildRecoverySource:
                    aiBuild.legacyRecovery
                        ? 'legacy-explicit'
                        : aiBuild.incomplete
                            ? 'durable-status'
                            : ''
            },

            module: {
                id: record.id,
                schemaVersion:
                    Math.max(
                        1,
                        Math.floor(
                            Number(document.schemaVersion) || 1
                        )
                    ),
                contentVersion: `owned-r${record.revision}`,
                title,
                titleHtml: escapeHtml(title),
                navTitle,
                bgImage,
                catalogDescription
            },

            subjectCopy: cloneJson(document.subjectCopy) || {},
            discussionSets:
                cloneJson(document.discussionSets) || [],
            culturalLensCards:
                cloneJson(document.culturalLensCards) || []
        };
    }

    async function applyOwnedBuildGenerationContext(
        subject,
        fallbackContext = null
    ) {
        if (
            subject
                ?.runtime
                ?.aiBuildIncomplete !==
                true
        ) {
            return subject;
        }

        let generationContext =
            fallbackContext &&
            typeof fallbackContext ===
                'object' &&
            !Array.isArray(
                fallbackContext
            )
                ? cloneJson(
                    fallbackContext
                )
                : null;

        try {
            const buildState =
                await requireAtlasTutorSubjects()
                    .getBuildState(
                        subject
                            .runtime
                            .subjectId
                    );

            if (
                buildState
                    ?.generationContext &&
                typeof buildState
                    .generationContext ===
                    'object' &&
                !Array.isArray(
                    buildState
                        .generationContext
                )
            ) {
                generationContext =
                    cloneJson(
                        buildState
                            .generationContext
                    );
            }
        } catch { }

        if (generationContext) {
            subject.runtime
                .generationContext =
                generationContext;
        }

        return subject;
    }

    async function requestForegroundBuildOwnership(
        subject
    ) {
        if (
            !subject
                ?.runtime
                ?.aiBuildIncomplete
        ) {
            return null;
        }

        traceBuild(
            'foreground-request-start',
            {
                subjectId:
                    subject
                        ?.runtime
                        ?.subjectId ||
                    null
            }
        );

        const Client =
            window
                .AtlasSubjectBuildWorkerClient;

        if (
            !Client ||
            typeof Client
                .requestForegroundOwnership !==
                'function'
        ) {
            return null;
        }

        try {
            await Client.initialize?.();

            const state =
                Client.getState?.();

            if (
                state &&
                state.supported ===
                    false
            ) {
                return null;
            }

            const grant =
                await Client
                    .requestForegroundOwnership(
                        subject
                            .runtime
                            .subjectId,
                        {
                            reason:
                                'subject-open'
                        }
                    );

            if (
                grant
                    ?.generationContext &&
                typeof grant
                    .generationContext ===
                    'object' &&
                !Array.isArray(
                    grant
                        .generationContext
                )
            ) {
                subject.runtime
                    .generationContext =
                    cloneJson(
                        grant
                            .generationContext
                    );
            }

            traceBuild(
                'foreground-request-result',
                {
                    subjectId:
                        subject
                            ?.runtime
                            ?.subjectId ||
                        null,
                    granted:
                        Boolean(grant),
                    completedStep:
                        grant
                            ?.completedStep ??
                        null,
                    readyToCommit:
                        grant
                            ?.readyToCommit ===
                        true,
                    noWorkerJob:
                        grant
                            ?.noWorkerJob ===
                        true
                }
            );

            return grant || null;
        } catch (error) {
            traceBuild(
                'foreground-request-error',
                {
                    subjectId:
                        subject
                            ?.runtime
                            ?.subjectId ||
                        null,
                    error:
                        String(
                            error
                                ?.message ||
                            error
                        )
                }
            );

            console.warn(
                '[Compass] SharedWorker foreground handoff was unavailable:',
                error
            );

            return null;
        }
    }

    function installRuntimeSubject(subject) {
        window.AtlasCompassSubjectRuntime = subject.runtime;

        window.AtlasGenerationContext =
            cloneJson(
                subject.runtime?.generationContext
            ) || {};

        window.MODULE = subject.module;
        window.subjectCopy = subject.subjectCopy;
        window.discussionSets = subject.discussionSets;
        window.clCards = subject.culturalLensCards;
    }

    function loadScript(relativePath, errorMessage) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            let settled = false;

            const finish = (
                callback,
                value
            ) => {
                if (settled) return;

                settled = true;
                clearTimeout(timeoutId);
                callback(value);
            };

            script.src = new URL(
                relativePath,
                window.location.href
            ).href;

            script.onload = () =>
                finish(resolve);

            script.onerror = () =>
                finish(
                    reject,
                    new Error(errorMessage)
                );

            const timeoutId = setTimeout(
                () => {
                    script.remove();
                    finish(
                        reject,
                        new Error(errorMessage)
                    );
                },
                SUBJECT_LOAD_TIMEOUT_MS
            );

            document.body.appendChild(script);
        });
    }

    function installOwnedSubjectSaveGuard() {
        if (
            typeof saveMyVersion !== 'function' ||
            saveMyVersion.__atlasOwnedSubjectSaveGuard === true
        ) {
            return;
        }

        const originalSaveMyVersion = saveMyVersion;
        let activeSavePromise = null;

        const guardedSaveMyVersion = function (...args) {
            if (activeSavePromise) {
                return activeSavePromise;
            }

            activeSavePromise = (async () => {
                try {
                    return await originalSaveMyVersion.apply(
                        this,
                        args
                    );
                } catch (error) {
                    if (
                        error?.code !==
                        'ATLAS_REVISION_CONFLICT'
                    ) {
                        throw error;
                    }

                    /*
                     * A successful same-page write can advance the cloud
                     * revision while an older cached read is still in flight.
                     * AtlasCloudCache invalidates that stale read when the
                     * conflict is raised, so the next getSubject() is fresh.
                     *
                     * Retry only when the live Compass runtime already knows
                     * that exact cloud revision. If the cloud is newer than
                     * this page, another tab/device really changed the subject
                     * and the optimistic lock must remain authoritative.
                     */
                    myVersionSaving = false;
                    updateMyVersionAuthorBar();

                    let freshSubject = null;

                    try {
                        freshSubject =
                            await requireAtlasTutorSubjects()
                                .getSubject(MODULE.id);
                    } catch {
                        freshSubject = null;
                    }

                    const runtimeRevision = Math.max(
                        0,
                        Math.floor(
                            Number(
                                getCompassSubjectRuntime()
                                    ?.revision
                            ) || 0
                        )
                    );

                    const freshRevision = Math.max(
                        0,
                        Math.floor(
                            Number(
                                freshSubject?.revision
                            ) || 0
                        )
                    );

                    if (
                        myVersionEditing &&
                        myVersionDirty &&
                        freshSubject &&
                        runtimeRevision > 0 &&
                        freshRevision === runtimeRevision
                    ) {
                        return await originalSaveMyVersion.apply(
                            this,
                            args
                        );
                    }

                    const status = document.getElementById(
                        'atlas-my-version-status'
                    );

                    if (status) {
                        status.textContent =
                            'Changed elsewhere · reload latest';
                    }

                    throw error;
                } finally {
                    /*
                     * The engine historically set myVersionSaving after an
                     * awaited draft flush, leaving a re-entry window and also
                     * leaving the bar stuck on "Saving…" when a cloud write
                     * rejected. The outer guard closes both failure modes.
                     */
                    if (
                        myVersionEditing &&
                        myVersionSaving
                    ) {
                        myVersionSaving = false;
                        updateMyVersionAuthorBar();
                    }
                }
            })().finally(() => {
                activeSavePromise = null;
            });

            return activeSavePromise;
        };

        guardedSaveMyVersion
            .__atlasOwnedSubjectSaveGuard = true;

        saveMyVersion = guardedSaveMyVersion;
        window.saveMyVersion = guardedSaveMyVersion;
    }

    async function loadCompassEngine() {
        try {
            await loadScript(
                '../../shared/atlas-subject-build-runner.js?v=20260924-workerneutral1',
                'Atlas subject build runner could not be loaded.'
            );

            await loadScript(
                '../../shared/atlas-subject-build-document-operations.js?v=20260924-foreground2',
                'Atlas subject build document operations could not be loaded.'
            );

            await loadScript(
                '../shared/compass-engine.js?v=20260925-completionstate1',
                'Compass engine could not be loaded.'
            );

            installOwnedSubjectSaveGuard();

            await loadScript(
                '../shared/compass-generation-authority.js',
                'Compass generation authority layer could not be loaded.'
            );

            await loadScript(
                '../shared/compass-build-presentation.js',
                'Compass build presentation layer could not be loaded.'
            );

            await loadScript(
                '../shared/compass-generation-recovery.js?v=20260925-workeraware2',
                'Compass generation recovery layer could not be loaded.'
            );

            const Recovery =
                window.AtlasCompassGenerationRecovery;

            if (
                !Recovery ||
                typeof Recovery.installRuntime !== 'function' ||
                !Recovery.installRuntime()
            ) {
                throw new Error(
                    'Compass generation recovery could not initialize.'
                );
            }

            signalOwnedSubjectRuntimeLayersReady(true);
        } catch (error) {
            signalOwnedSubjectRuntimeLayersReady(false);
            throw error;
        }
    }

    async function bootstrap() {
        const subjectId = getRequestedSubjectId();

        if (!subjectId) {
            showLoadError(
                'This subject link isn’t available.',
                {
                    canRetry: false
                }
            );
            return;
        }

        let foregroundOwnershipSubjectId = '';
        let foregroundGenerationContext = null;

        try {
            const record = await withTimeout(
                requireAtlasTutorSubjects()
                    .getSubject(subjectId),
                'Subject request timed out.'
            );

            if (!record) {
                showLoadError(
                    'This subject isn’t available.',
                    {
                        canRetry: false
                    }
                );
                return;
            }

            let subject =
                normalizeOwnedStructuredSubject(record);

            if (!subject) {
                showLoadError(
                    'This subject isn’t available.',
                    {
                        canRetry: false
                    }
                );
                return;
            }

            window.AtlasSubjectBuildPresentationRequested =
                getBuildPresentationRequest() ||
                subject.runtime?.aiBuildIncomplete === true;

            traceBuild(
                'subject-loaded',
                {
                    subjectId:
                        subject
                            .runtime
                            ?.subjectId ||
                        subjectId,
                    revision:
                        subject
                            .runtime
                            ?.revision ??
                        null,
                    aiBuildIncomplete:
                        subject
                            .runtime
                            ?.aiBuildIncomplete ===
                        true,
                    aiBuildStatus:
                        subject
                            .runtime
                            ?.aiBuildStatus ||
                        null
                }
            );

            if (
                subject.runtime
                    ?.aiBuildIncomplete ===
                    true
            ) {
                const grant =
                    await requestForegroundBuildOwnership(
                        subject
                    );

                if (
                    grant
                        ?.generationContext &&
                    typeof grant
                        .generationContext ===
                        'object' &&
                    !Array.isArray(
                        grant
                            .generationContext
                    )
                ) {
                    foregroundGenerationContext =
                        cloneJson(
                            grant
                                .generationContext
                        );
                }

                if (
                    grant &&
                    grant.noWorkerJob !==
                        true
                ) {
                    foregroundOwnershipSubjectId =
                        subject.runtime
                            .subjectId;

                    window
                        .AtlasForegroundSubjectBuildHandoff = {
                            subjectId:
                                foregroundOwnershipSubjectId,
                            completedStep:
                                Number.isFinite(
                                    Number(
                                        grant.completedStep
                                    )
                                )
                                    ? Math.max(
                                        0,
                                        Math.floor(
                                            Number(
                                                grant.completedStep
                                            )
                                        )
                                    )
                                    : null,
                            readyToCommit:
                                grant.readyToCommit ===
                                true
                        };

                    traceBuild(
                        'handoff-installed',
                        {
                            subjectId:
                                foregroundOwnershipSubjectId,
                            completedStep:
                                window
                                    .AtlasForegroundSubjectBuildHandoff
                                    ?.completedStep ??
                                null,
                            readyToCommit:
                                window
                                    .AtlasForegroundSubjectBuildHandoff
                                    ?.readyToCommit ===
                                true
                        }
                    );

                    /*
                     * A non-subject Atlas page may have completed step 18
                     * while this page was negotiating foreground ownership.
                     * Revalidate the durable row after the worker handoff so
                     * an old "incomplete" read cannot restart a subject that
                     * has just been committed elsewhere.
                     */
                    window.AtlasCloudCache
                        ?.clear?.();

                    window
                        .AtlasTutorSubjectsCloudAuthority
                        ?.refresh?.();

                    const latestRecord =
                        await withTimeout(
                            requireAtlasTutorSubjects()
                                .getSubject(subjectId),
                            'Subject refresh timed out.'
                        );

                    const latestSubject =
                        normalizeOwnedStructuredSubject(
                            latestRecord
                        );

                    if (!latestSubject) {
                        throw new Error(
                            'Atlas could not revalidate subject ownership after build handoff.'
                        );
                    }

                    subject =
                        latestSubject;

                    if (
                        subject.runtime
                            ?.aiBuildIncomplete !==
                            true
                    ) {
                        window
                            .AtlasSubjectBuildWorkerClient
                            ?.releaseForegroundOwnership
                            ?.(
                                foregroundOwnershipSubjectId,
                                'subject-completed-during-handoff'
                            );

                        foregroundOwnershipSubjectId =
                            '';

                        delete window
                            .AtlasForegroundSubjectBuildHandoff;
                    }
                }
            }

            if (
                subject.runtime
                    ?.aiBuildIncomplete ===
                    true &&
                !foregroundOwnershipSubjectId
            ) {
                traceBuild(
                    'no-foreground-handoff',
                    {
                        subjectId:
                            subject
                                .runtime
                                ?.subjectId ||
                            subjectId
                    }
                );
            }

            await applyOwnedBuildGenerationContext(
                subject,
                foregroundGenerationContext
            );

            installRuntimeSubject(subject);
            await loadCompassEngine();
        } catch (error) {
            if (
                foregroundOwnershipSubjectId
            ) {
                window
                    .AtlasSubjectBuildWorkerClient
                    ?.releaseForegroundOwnership
                    ?.(
                        foregroundOwnershipSubjectId,
                        'subject-bootstrap-failed'
                    );

                delete window
                    .AtlasForegroundSubjectBuildHandoff;
            }

            console.error(
                '[Compass] Subject bootstrap failed:',
                error
            );

            showLoadError(
                'We couldn’t open this subject.'
            );
        }
    }

    bootstrap();
})();
