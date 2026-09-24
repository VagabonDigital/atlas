/* ============================================================
   ATLAS SUBJECT BUILD — RESURRECTION COORDINATOR

   Authenticated page-side orchestration for unfinished AI subjects.

   Page owns:
   - authoritative owned-subject discovery
   - durable cloud completion / pause transitions

   SharedWorker owns:
   - AI execution
   - sequencing
   - browser checkpoints
   - subject build lock while generating
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasSubjectBuildResurrection) return;

    const AUTH_STORAGE_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';

    const LOCK_PREFIX =
        'atlas-subject-build:';

    const SOURCES = Object.freeze({
        structured:
            '/shared/atlas-structured-subject.js?v=20260924-workerneutral1',
        subjects:
            '/shared/atlas-tutor-subjects.js?v=20260911-1',
        lifecycle:
            '/shared/atlas-ai-subject-build-lifecycle.js?v=20260923-buildprojection1',
        cloudAuthority:
            '/shared/atlas-tutor-subjects-cloud-authority.js?v=20260924-resurrection1'
    });

    const listeners = new Set();
    const establishingSubjects = new Set();
    const blockedSubjects = new Map();
    const completionPromises = new Map();

    let runtimePromise = null;
    let scanPromise = null;
    let currentUserId = '';
    let bootstrapping =
        hasAuthenticatedRuntimeHint();

    function cloneJson(value) {
        if (value === null || value === undefined) {
            return value;
        }

        try {
            return JSON.parse(
                JSON.stringify(value)
            );
        } catch {
            return null;
        }
    }

    function hasStoredSession() {
        try {
            return Boolean(
                localStorage.getItem(
                    AUTH_STORAGE_KEY
                )
            );
        } catch {
            return false;
        }
    }

    function hasOAuthSessionInUrl() {
        try {
            const url =
                new URL(
                    window.location.href
                );

            return Boolean(
                url.searchParams.get('code') ||
                url.hash.includes(
                    'access_token='
                ) ||
                url.hash.includes(
                    'refresh_token='
                )
            );
        } catch {
            return false;
        }
    }

    function hasAuthenticatedRuntimeHint() {
        const accountState =
            window.AtlasAccount
                ?.getState?.() ||
            null;

        if (
            accountState
                ?.authenticated ===
            true
        ) {
            return true;
        }

        if (
            accountState
                ?.ready ===
            true
        ) {
            return false;
        }

        return Boolean(
            hasStoredSession() ||
            hasOAuthSessionInUrl() ||
            window.AtlasAccount
        );
    }

    function supportsBackgroundOwnership() {
        const clientState =
            window
                .AtlasSubjectBuildWorkerClient
                ?.getState?.() ||
            null;

        const sharedWorkerSupported =
            clientState
                ? clientState.supported !==
                    false
                : typeof window.SharedWorker ===
                    'function';

        const locksSupported =
            Boolean(
                navigator.locks &&
                typeof navigator.locks
                    .request ===
                    'function'
            );

        return (
            sharedWorkerSupported &&
            locksSupported
        );
    }

    function snapshot() {
        return {
            bootstrapping,
            userId:
                currentUserId || null,
            establishing:
                Array.from(
                    establishingSubjects
                ),
            blocked:
                Array.from(
                    blockedSubjects.entries()
                ).map(
                    ([subjectId, reason]) => ({
                        subjectId,
                        reason
                    })
                )
        };
    }

    function publish() {
        const next = snapshot();

        listeners.forEach(listener => {
            try {
                listener(next);
            } catch (error) {
                console.error(
                    '[AtlasSubjectBuildResurrection] listener failed:',
                    error
                );
            }
        });

        try {
            window.dispatchEvent(
                new CustomEvent(
                    'atlas:subject-build-resurrection-state',
                    {
                        detail: next
                    }
                )
            );
        } catch { }
    }

    function setBootstrapping(value) {
        const next = Boolean(value);
        if (bootstrapping === next) return;
        bootstrapping = next;
        publish();
    }

    function markEstablishing(subjectId, active) {
        const id =
            String(subjectId || '').trim();

        if (!id) return;

        if (active) {
            blockedSubjects.delete(id);
            establishingSubjects.add(id);
        } else {
            establishingSubjects.delete(id);
        }

        publish();
    }

    function markBlocked(subjectId, reason) {
        const id =
            String(subjectId || '').trim();

        if (!id) return;

        establishingSubjects.delete(id);
        blockedSubjects.set(
            id,
            String(reason || 'unavailable')
        );
        publish();
    }

    function clearRuntimeState() {
        establishingSubjects.clear();
        blockedSubjects.clear();
        completionPromises.clear();
        currentUserId = '';
        publish();
    }

    function existingScriptFor(src) {
        const pathname =
            new URL(
                src,
                window.location.href
            ).pathname;

        return Array.from(
            document.scripts || []
        ).find(script => {
            if (!script.src) return false;

            try {
                return new URL(
                    script.src,
                    window.location.href
                ).pathname === pathname;
            } catch {
                return false;
            }
        }) || null;
    }

    function loadScript(src, globalName) {
        if (
            globalName &&
            window[globalName]
        ) {
            return Promise.resolve(
                window[globalName]
            );
        }

        return new Promise(
            (resolve, reject) => {
                const existing =
                    existingScriptFor(src);

                const complete = () => {
                    if (
                        !globalName ||
                        window[globalName]
                    ) {
                        resolve(
                            globalName
                                ? window[globalName]
                                : true
                        );
                        return;
                    }

                    reject(
                        new Error(
                            `${globalName} did not initialize.`
                        )
                    );
                };

                const fail = () =>
                    reject(
                        new Error(
                            `Atlas runtime failed to load: ${src}`
                        )
                    );

                if (existing) {
                    if (
                        globalName &&
                        window[globalName]
                    ) {
                        complete();
                        return;
                    }

                    existing.addEventListener(
                        'load',
                        complete,
                        { once: true }
                    );
                    existing.addEventListener(
                        'error',
                        fail,
                        { once: true }
                    );
                    return;
                }

                const script =
                    document.createElement(
                        'script'
                    );

                script.src = src;
                script.async = false;
                script.setAttribute(
                    'data-atlas-subject-build-resurrection-runtime',
                    'true'
                );
                script.addEventListener(
                    'load',
                    complete,
                    { once: true }
                );
                script.addEventListener(
                    'error',
                    fail,
                    { once: true }
                );
                document.head.appendChild(script);
            }
        );
    }

    async function ensureRuntime() {
        if (runtimePromise) {
            return runtimePromise;
        }

        runtimePromise = (async () => {
            const Bootstrap =
                window.AtlasAccessBootstrap;

            if (
                !Bootstrap ||
                typeof Bootstrap
                    .prepareAccountRuntime !==
                    'function'
            ) {
                throw new Error(
                    'Atlas account bootstrap is unavailable.'
                );
            }

            const Account =
                await Bootstrap
                    .prepareAccountRuntime();

            await Account?.initialize?.();

            const accountState =
                Account?.getState?.() ||
                null;

            if (
                accountState?.authenticated !==
                    true ||
                !accountState?.userId
            ) {
                return null;
            }

            const userId =
                String(
                    accountState.userId
                ).trim();

            if (!userId) return null;

            if (
                currentUserId &&
                currentUserId !== userId
            ) {
                clearRuntimeState();
            }

            currentUserId = userId;

            await loadScript(
                SOURCES.structured,
                'AtlasStructuredSubject'
            );
            await loadScript(
                SOURCES.subjects,
                'AtlasTutorSubjects'
            );
            await loadScript(
                SOURCES.lifecycle,
                'AtlasAiSubjectBuildLifecycle'
            );

            if (
                !window
                    .AtlasTutorSubjectsCloudAuthority
            ) {
                await loadScript(
                    SOURCES.cloudAuthority,
                    'AtlasTutorSubjectsCloudAuthority'
                );
            }

            const Subjects =
                window.AtlasTutorSubjects;

            if (
                !Subjects ||
                Subjects.cloudReadAuthority !==
                    true ||
                Subjects.cloudWriteAuthority !==
                    true
            ) {
                throw new Error(
                    'Atlas authenticated subject authority is unavailable.'
                );
            }

            const Client =
                window
                    .AtlasSubjectBuildWorkerClient;

            if (!Client) {
                throw new Error(
                    'Atlas subject build worker client is unavailable.'
                );
            }

            await Client.initialize?.();

            if (
                Client.getState?.()
                    ?.authenticated !== true
            ) {
                await Client.sendCurrentAuth?.(
                    'resurrection'
                );
            }

            return {
                Account,
                Subjects,
                Lifecycle:
                    window
                        .AtlasAiSubjectBuildLifecycle,
                Client,
                userId
            };
        })().catch(error => {
            runtimePromise = null;
            throw error;
        });

        return runtimePromise;
    }

    function buildContext(
        subject,
        buildState
    ) {
        const fromBuild =
            buildState?.generationContext;

        if (
            fromBuild &&
            typeof fromBuild === 'object' &&
            !Array.isArray(fromBuild)
        ) {
            return cloneJson(fromBuild);
        }

        const fromSubject =
            subject?.metadata
                ?.generationContext;

        if (
            fromSubject &&
            typeof fromSubject === 'object' &&
            !Array.isArray(fromSubject)
        ) {
            return cloneJson(fromSubject);
        }

        return null;
    }

    function shouldAutoWake(
        lifecycle,
        buildState
    ) {
        if (
            lifecycle?.incomplete !== true ||
            buildState?.kind !==
                'full-subject'
        ) {
            return false;
        }

        /*
         * "paused" is the deliberate emergency/retry state. Normal
         * all-pages-close resurrection leaves the durable status "building".
         */
        return lifecycle.status !== 'paused';
    }

    async function scan() {
        if (scanPromise) {
            return scanPromise;
        }

        if (
            (
                !currentUserId &&
                !hasAuthenticatedRuntimeHint()
            ) ||
            !supportsBackgroundOwnership()
        ) {
            setBootstrapping(false);
            return false;
        }

        setBootstrapping(true);

        scanPromise = (async () => {
            let runtime = null;

            try {
                runtime =
                    await ensureRuntime();
            } catch (error) {
                console.warn(
                    '[AtlasSubjectBuildResurrection] authenticated runtime unavailable:',
                    error
                );
                return false;
            }

            if (!runtime) {
                clearRuntimeState();
                return false;
            }

            const {
                Subjects,
                Lifecycle,
                Client,
                userId
            } = runtime;

            if (
                Client.getState?.()
                    ?.supported === false
            ) {
                return false;
            }

            let subjects = [];

            try {
                subjects =
                    await Subjects
                        .listSubjects();
            } catch (error) {
                console.warn(
                    '[AtlasSubjectBuildResurrection] subject discovery failed:',
                    error
                );
                return false;
            }

            for (const subject of subjects) {
                if (
                    currentUserId !== userId
                ) {
                    return false;
                }

                const subjectId =
                    String(
                        subject?.id || ''
                    ).trim();

                if (!subjectId) continue;

                const lifecycle =
                    Lifecycle?.classify?.(
                        subject
                    );

                if (
                    lifecycle?.incomplete !==
                        true
                ) {
                    establishingSubjects.delete(
                        subjectId
                    );
                    blockedSubjects.delete(
                        subjectId
                    );
                    continue;
                }

                let buildState = null;

                try {
                    buildState =
                        await Subjects
                            .getBuildState(
                                subjectId
                            );
                } catch {
                    markBlocked(
                        subjectId,
                        'checkpoint-unavailable'
                    );
                    continue;
                }

                if (
                    !shouldAutoWake(
                        lifecycle,
                        buildState
                    )
                ) {
                    continue;
                }

                const generationContext =
                    buildContext(
                        subject,
                        buildState
                    );

                if (!generationContext) {
                    markBlocked(
                        subjectId,
                        'generation-context-missing'
                    );
                    continue;
                }

                markEstablishing(
                    subjectId,
                    true
                );

                const enqueued =
                    Client.enqueueSubject(
                        subjectId,
                        {
                            generationContext,
                            autoSaveOnComplete:
                                buildState
                                    .autoSaveOnComplete !==
                                false,
                            revision:
                                Math.max(
                                    1,
                                    Math.floor(
                                        Number(
                                            subject.revision
                                        ) || 1
                                    )
                                )
                        }
                    );

                if (!enqueued) {
                    markBlocked(
                        subjectId,
                        'worker-unavailable'
                    );
                    continue;
                }

                if (
                    Number(
                        buildState.completedStep
                    ) >= 18
                ) {
                    void completeReadyBuild(
                        subjectId,
                        generationContext
                    );
                }
            }

            publish();
            return true;
        })().finally(() => {
            scanPromise = null;
            setBootstrapping(false);
        });

        return scanPromise;
    }

    function canonicalLockName(subjectId) {
        return (
            LOCK_PREFIX +
            String(
                subjectId || ''
            ).trim()
        );
    }

    async function withSubjectLock(
        subjectId,
        operation
    ) {
        if (
            !navigator.locks ||
            typeof navigator.locks
                .request !== 'function'
        ) {
            throw new Error(
                'Atlas subject build Web Locks are unavailable.'
            );
        }

        return navigator.locks.request(
            canonicalLockName(subjectId),
            {
                mode: 'exclusive'
            },
            async lock => {
                if (!lock) {
                    throw new Error(
                        'Atlas subject build lock could not be acquired.'
                    );
                }

                return operation();
            }
        );
    }

    async function pauseFailedBuild(
        subjectId,
        reason = 'generation-failed'
    ) {
        const id =
            String(subjectId || '').trim();

        if (!id) return false;

        try {
            const runtime =
                await ensureRuntime();

            if (!runtime) return false;

            return await withSubjectLock(
                id,
                async () => {
                    if (
                        runtime.userId !==
                        currentUserId
                    ) {
                        return false;
                    }

                    const subject =
                        await runtime.Subjects
                            .getSubject(id);

                    const lifecycle =
                        runtime.Lifecycle
                            ?.classify?.(
                                subject
                            );

                    if (
                        !subject ||
                        lifecycle?.incomplete !==
                            true ||
                        lifecycle.status ===
                            'complete'
                    ) {
                        return false;
                    }

                    if (
                        typeof runtime.Subjects
                            .updateSubjectAtRevision !==
                            'function'
                    ) {
                        return false;
                    }

                    await runtime.Subjects
                        .updateSubjectAtRevision(
                            id,
                            {
                                metadata: {
                                    aiBuildStatus:
                                        'paused'
                                }
                            },
                            subject.revision
                        );

                    markBlocked(
                        id,
                        reason
                    );

                    try {
                        await runtime.Account
                            ?.refreshEntitlement?.();
                    } catch { }

                    return true;
                }
            );
        } catch (error) {
            console.warn(
                '[AtlasSubjectBuildResurrection] failed build could not be paused:',
                error
            );
            markBlocked(
                id,
                reason
            );
            return false;
        }
    }

    async function completeReadyBuild(
        subjectId,
        generationContextHint = null
    ) {
        const id =
            String(subjectId || '').trim();

        if (!id) return false;

        if (
            completionPromises.has(id)
        ) {
            return completionPromises.get(id);
        }

        const promise = (async () => {
            let runtime = null;

            try {
                runtime =
                    await ensureRuntime();
            } catch {
                markBlocked(
                    id,
                    'completion-runtime-unavailable'
                );
                return false;
            }

            if (!runtime) return false;

            try {
                return await withSubjectLock(
                    id,
                    async () => {
                        if (
                            runtime.userId !==
                            currentUserId
                        ) {
                            return false;
                        }

                        const workerJob =
                            runtime.Client
                                ?.getState?.()
                                ?.queue
                                ?.find?.(
                                    job =>
                                        String(
                                            job?.subjectId ||
                                            ''
                                        ).trim() === id
                                ) ||
                            null;

                        if (
                            [
                                'foreground-owned',
                                'yielding-to-foreground'
                            ].includes(
                                String(
                                    workerJob?.status ||
                                    ''
                                ).trim()
                            )
                        ) {
                            /*
                             * The subject page has already claimed the build.
                             * Let the foreground completion path finish under
                             * the same canonical lock rather than racing a
                             * second page-side durable commit.
                             */
                            return false;
                        }

                        const subject =
                            await runtime.Subjects
                                .getSubject(id);

                        const lifecycle =
                            runtime.Lifecycle
                                ?.classify?.(
                                    subject
                                );

                        if (!subject) {
                            markBlocked(
                                id,
                                'subject-missing'
                            );
                            return false;
                        }

                        if (
                            lifecycle?.incomplete !==
                                true
                        ) {
                            establishingSubjects.delete(
                                id
                            );
                            blockedSubjects.delete(
                                id
                            );
                            publish();
                            return true;
                        }

                        const [
                            buildState,
                            workingDraft
                        ] = await Promise.all([
                            runtime.Subjects
                                .getBuildState(id),
                            runtime.Subjects
                                .getWorkingDraft(id)
                        ]);

                        if (
                            buildState?.kind !==
                                'full-subject' ||
                            Number(
                                buildState.completedStep
                            ) < 18
                        ) {
                            return false;
                        }

                        if (
                            buildState
                                .autoSaveOnComplete ===
                                false
                        ) {
                            markBlocked(
                                id,
                                'manual-save-required'
                            );
                            return false;
                        }

                        const document =
                            workingDraft?.document;

                        const baseRevision =
                            Math.max(
                                0,
                                Math.floor(
                                    Number(
                                        workingDraft
                                            ?.baseRevision
                                    ) || 0
                                )
                            );

                        const currentRevision =
                            Math.max(
                                0,
                                Math.floor(
                                    Number(
                                        subject.revision
                                    ) || 0
                                )
                            );

                        if (
                            !document ||
                            typeof document !==
                                'object' ||
                            Array.isArray(document)
                        ) {
                            markBlocked(
                                id,
                                'checkpoint-document-missing'
                            );
                            return false;
                        }

                        if (
                            !baseRevision ||
                            baseRevision !==
                                currentRevision
                        ) {
                            markBlocked(
                                id,
                                'revision-conflict'
                            );
                            return false;
                        }

                        const persistedGenerationContext =
                            buildState
                                ?.generationContext &&
                            typeof buildState
                                .generationContext ===
                                'object' &&
                            !Array.isArray(
                                buildState
                                    .generationContext
                            )
                                ? cloneJson(
                                    buildState
                                        .generationContext
                                )
                                : null;

                        const hintedGenerationContext =
                            generationContextHint &&
                            typeof generationContextHint ===
                                'object' &&
                            !Array.isArray(
                                generationContextHint
                            )
                                ? cloneJson(
                                    generationContextHint
                                )
                                : null;

                        const generationContext =
                            persistedGenerationContext ||
                            hintedGenerationContext ||
                            buildContext(
                                subject,
                                null
                            ) ||
                            {};

                        if (
                            typeof runtime.Subjects
                                .updateSubjectAtRevision !==
                                'function'
                        ) {
                            markBlocked(
                                id,
                                'revision-save-unavailable'
                            );
                            return false;
                        }

                        const title =
                            String(
                                document.module
                                    ?.title ||
                                subject.metadata
                                    ?.title ||
                                'Untitled Subject'
                            ).trim() ||
                            'Untitled Subject';

                        const saved =
                            await runtime.Subjects
                                .updateSubjectAtRevision(
                                    id,
                                    {
                                        metadata: {
                                            title,
                                            navTitle:
                                                String(
                                                    document.module
                                                        ?.navTitle ||
                                                    document.module
                                                        ?.title ||
                                                    subject.metadata
                                                        ?.navTitle ||
                                                    title
                                                ).trim() ||
                                                title,
                                            description:
                                                String(
                                                    document.module
                                                        ?.catalogDescription ||
                                                    ''
                                                ).trim(),
                                            coverImage:
                                                String(
                                                    document.module
                                                        ?.bgImage ||
                                                    ''
                                                ).trim(),
                                            aiBuildStatus:
                                                'complete',
                                            generationContext
                                        },
                                        document
                                    },
                                    currentRevision
                                );

                        if (!saved) {
                            return false;
                        }

                        await runtime.Subjects
                            .clearWorkingDraft(id);

                        runtime.Client
                            ?.cancelSubject?.(
                                id,
                                'background-complete'
                            );

                        establishingSubjects.delete(
                            id
                        );
                        blockedSubjects.delete(
                            id
                        );
                        publish();

                        try {
                            await runtime.Account
                                ?.refreshEntitlement?.();
                        } catch (error) {
                            console.warn(
                                '[AtlasSubjectBuildResurrection] creation allowance refresh failed:',
                                error
                            );
                        }

                        return true;
                    }
                );
            } catch (error) {
                if (
                    error?.code ===
                        'ATLAS_REVISION_CONFLICT'
                ) {
                    markBlocked(
                        id,
                        'revision-conflict'
                    );
                } else {
                    console.warn(
                        '[AtlasSubjectBuildResurrection] ready build completion failed:',
                        error
                    );
                    markBlocked(
                        id,
                        'completion-failed'
                    );
                }

                return false;
            }
        })().finally(() => {
            completionPromises.delete(id);
        });

        completionPromises.set(
            id,
            promise
        );

        return promise;
    }

    function handleWorkerMessage(event) {
        const message =
            event?.detail;

        if (
            !message ||
            typeof message !== 'object'
        ) {
            return;
        }

        const subjectId =
            String(
                message.subjectId ||
                message.activeBuild
                    ?.subjectId ||
                ''
            ).trim();

        if (
            message.type ===
                'build-ready' &&
            subjectId
        ) {
            markEstablishing(
                subjectId,
                true
            );
            void completeReadyBuild(
                subjectId,
                message.generationContext ||
                    null
            );
            return;
        }

        if (
            message.type ===
                'build-started' &&
            subjectId
        ) {
            /*
             * Keep the auto-resurrection projection active through the
             * worker handoff. The runtime heartbeat will shortly provide
             * independent liveness, but clearing this flag here can expose a
             * brief "Continue building" frame between those two messages.
             */
            markEstablishing(
                subjectId,
                true
            );
            return;
        }

        if (
            message.type ===
                'build-failed' &&
            subjectId
        ) {
            if (
                navigator.onLine ===
                    false
            ) {
                markBlocked(
                    subjectId,
                    'offline'
                );
                return;
            }

            void pauseFailedBuild(
                subjectId,
                'generation-failed'
            );
        }
    }

    function handleWorkerState(event) {
        const queue =
            Array.isArray(
                event?.detail?.queue
            )
                ? event.detail.queue
                : [];

        queue.forEach(job => {
            const subjectId =
                String(
                    job?.subjectId || ''
                ).trim();

            if (!subjectId) return;

            const status =
                String(
                    job.status || ''
                ).trim();

            if (
                [
                    'checkpoint-error',
                    'checkpoint-missing',
                    'lock-unavailable',
                    'failed',
                    'cancelled'
                ].includes(status)
            ) {
                markBlocked(
                    subjectId,
                    status
                );
                return;
            }

            if (
                status ===
                    'ready-to-commit'
            ) {
                markEstablishing(
                    subjectId,
                    true
                );
                void completeReadyBuild(
                    subjectId
                );
            }
        });
    }

    function handleAccountChange(event) {
        const detail =
            event?.detail || {};

        const authenticated =
            detail.authenticated === true;

        const userId =
            String(
                detail.userId || ''
            ).trim();

        if (!authenticated || !userId) {
            runtimePromise = null;
            scanPromise = null;
            clearRuntimeState();
            setBootstrapping(false);
            return;
        }

        if (
            currentUserId &&
            currentUserId !== userId
        ) {
            runtimePromise = null;
            scanPromise = null;
            clearRuntimeState();
        }

        currentUserId = userId;
        void scan();
    }

    function retryOnOnline() {
        blockedSubjects.forEach(
            (reason, subjectId) => {
                if (reason === 'offline') {
                    blockedSubjects.delete(
                        subjectId
                    );
                }
            }
        );

        runtimePromise = null;

        if (
            currentUserId ||
            hasAuthenticatedRuntimeHint()
        ) {
            void scan();
        }
    }

    function subscribe(
        listener,
        {
            immediate = true
        } = {}
    ) {
        if (
            typeof listener !==
                'function'
        ) {
            return () => {};
        }

        listeners.add(listener);

        if (immediate) {
            listener(snapshot());
        }

        return () => {
            listeners.delete(listener);
        };
    }

    window.addEventListener(
        'atlas:account-change',
        handleAccountChange
    );
    window.addEventListener(
        'atlas:subject-build-worker-message',
        handleWorkerMessage
    );
    window.addEventListener(
        'atlas:subject-build-worker-state',
        handleWorkerState
    );
    window.addEventListener(
        'online',
        retryOnOnline
    );
    window.addEventListener(
        'pageshow',
        () => {
            if (currentUserId) {
                void scan();
            }
        }
    );

    window.AtlasSubjectBuildResurrection =
        Object.freeze({
            scan,
            completeReadyBuild,
            isBootstrapping() {
                return bootstrapping;
            },
            isEstablishing(
                subjectId,
                lifecycleStatus = ''
            ) {
                const id =
                    String(
                        subjectId || ''
                    ).trim();

                const status =
                    String(
                        lifecycleStatus || ''
                    ).trim();

                return Boolean(
                    id &&
                    (
                        establishingSubjects
                            .has(id) ||
                        (
                            bootstrapping &&
                            supportsBackgroundOwnership() &&
                            status !== 'paused' &&
                            !blockedSubjects
                                .has(id)
                        )
                    )
                );
            },
            getState: snapshot,
            subscribe
        });

    void scan();
})();