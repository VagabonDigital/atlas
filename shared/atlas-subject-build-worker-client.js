/* ============================================================
   ATLAS SUBJECT BUILD — SHARED WORKER CLIENT

   Atlas-wide page bridge for SharedWorker subject generation.

   Page owns:
   - authenticated account/session state
   - short-lived access-token refresh
   - page lifecycle / identity
   - registering foreground builds for background continuation

   SharedWorker owns execution only while Atlas exists somewhere.
   ============================================================ */

(function () {
    'use strict';

    if (
        window
            .AtlasSubjectBuildWorkerClient
    ) {
        return;
    }

    const WORKER_URL =
        '/shared/atlas-subject-build-shared-worker.js?v=20260924-buildworker6';

    const WORKER_NAME =
        'atlas-subject-builds';

    const AUTH_STORAGE_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';

    const PAGE_HEARTBEAT_MS =
        15000;

    const WORKER_STALE_MS =
        45000;

    const REQUEST_TIMEOUT_MS =
        5000;

    const listeners =
        new Set();

    const pendingRequests =
        new Map();

    const registeredBuilds =
        new Map();

    const pageId =
        createPageId();

    const surface =
        detectSurface();

    let worker = null;
    let port = null;
    let heartbeatTimer = null;
    let reconnectTimer = null;
    let requestSequence = 0;

    let state = {
        supported:
            typeof window.SharedWorker ===
                'function',
        connected:
            false,
        ready:
            false,
        authenticated:
            false,
        userId:
            null,
        pageId,
        surface,
        workerVersion:
            null,
        activeBuild:
            null,
        queue: [],
        lastWorkerHeartbeat:
            null,
        lastError:
            null
    };

    function cloneJson(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return value;
        }

        return JSON.parse(
            JSON.stringify(value)
        );
    }

    function isObject(value) {
        return Boolean(
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
        );
    }

    function snapshot() {
        return {
            ...state,
            activeBuild:
                cloneJson(
                    state.activeBuild
                ),
            queue:
                cloneJson(
                    state.queue
                ) || []
        };
    }

    function publish(
        patch = {}
    ) {
        state = {
            ...state,
            ...patch
        };

        const next =
            snapshot();

        listeners.forEach(
            listener => {
                try {
                    listener(next);
                } catch (error) {
                    console.error(
                        '[AtlasSubjectBuildWorkerClient] listener failed:',
                        error
                    );
                }
            }
        );

        try {
            window.dispatchEvent(
                new CustomEvent(
                    'atlas:subject-build-worker-state',
                    {
                        detail: next
                    }
                )
            );
        } catch { }
    }

    function emitWorkerMessage(message) {
        try {
            window.dispatchEvent(
                new CustomEvent(
                    'atlas:subject-build-worker-message',
                    {
                        detail:
                            cloneJson(
                                message
                            )
                    }
                )
            );
        } catch { }
    }

    function createPageId() {
        if (
            window.crypto &&
            typeof window.crypto
                .randomUUID ===
                'function'
        ) {
            return (
                'page-' +
                window.crypto.randomUUID()
            );
        }

        return (
            'page-' +
            Date.now().toString(36) +
            '-' +
            Math.random()
                .toString(36)
                .slice(2, 12)
        );
    }

    function detectSurface() {
        const path =
            String(
                window.location
                    ?.pathname ||
                '/'
            );

        if (
            path.startsWith(
                '/compass/subject/'
            )
        ) {
            return 'compass-subject';
        }

        if (
            path.startsWith(
                '/compass/'
            )
        ) {
            return 'compass';
        }

        if (
            path.startsWith(
                '/arcade/'
            )
        ) {
            return 'arcade';
        }

        if (
            path === '/' ||
            path === '/index.html'
        ) {
            return 'atlas-root';
        }

        return (
            String(
                document.body
                    ?.dataset
                    ?.atlasSurface ||
                ''
            ).trim() ||
            'atlas'
        );
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
            const hash =
                new URLSearchParams(
                    String(
                        window.location
                            ?.hash ||
                        ''
                    )
                        .replace(
                            /^#/,
                            ''
                        )
                );

            return Boolean(
                hash.get(
                    'access_token'
                ) &&
                hash.get(
                    'refresh_token'
                )
            );
        } catch {
            return false;
        }
    }

    function normalizeBuildDescriptor(value) {
        const candidate =
            isObject(value)
                ? value
                : {};

        return {
            generationContext:
                isObject(
                    candidate
                        .generationContext
                )
                    ? cloneJson(
                        candidate
                            .generationContext
                    )
                    : null,

            autoSaveOnComplete:
                typeof candidate
                    .autoSaveOnComplete ===
                    'boolean'
                    ? candidate
                        .autoSaveOnComplete
                    : null,

            revision:
                Math.max(
                    0,
                    Math.floor(
                        Number(
                            candidate
                                .revision
                        ) || 0
                    )
                )
        };
    }

    function mergeBuildDescriptor(
        previous,
        incoming
    ) {
        const current =
            normalizeBuildDescriptor(
                previous
            );

        const next =
            normalizeBuildDescriptor(
                incoming
            );

        return {
            generationContext:
                next.generationContext ||
                current.generationContext,

            autoSaveOnComplete:
                typeof next
                    .autoSaveOnComplete ===
                    'boolean'
                    ? next
                        .autoSaveOnComplete
                    : current
                        .autoSaveOnComplete,

            revision:
                Math.max(
                    current.revision,
                    next.revision
                )
        };
    }

    function safePost(message) {
        if (
            !port ||
            !state.connected
        ) {
            return false;
        }

        try {
            port.postMessage(
                message
            );

            return true;
        } catch (error) {
            publish({
                lastError:
                    String(
                        error?.message ||
                        error
                    )
            });

            return false;
        }
    }

    function flushRegisteredBuilds() {
        if (
            !state.authenticated ||
            !state.connected
        ) {
            return false;
        }

        let sent = false;

        registeredBuilds.forEach(
            (build, subjectId) => {
                sent =
                    safePost({
                        type:
                            'enqueue-subject',
                        subjectId,
                        build:
                            cloneJson(
                                build
                            )
                    }) ||
                    sent;
            }
        );

        return sent;
    }

    function startHeartbeat() {
        stopHeartbeat();

        if (
            !port ||
            !state.connected
        ) {
            return;
        }

        heartbeatTimer =
            window.setInterval(
                () => {
                    const lastHeartbeat =
                        Number(
                            state.lastWorkerHeartbeat
                        ) || 0;

                    if (
                        state.authenticated &&
                        lastHeartbeat > 0 &&
                        Date.now() -
                            lastHeartbeat >
                            WORKER_STALE_MS
                    ) {
                        scheduleReconnect(
                            'worker-heartbeat-stale'
                        );
                        return;
                    }

                    safePost({
                        type:
                            'page-heartbeat',
                        pageId,
                        surface,
                        visible:
                            !document.hidden
                    });
                },
                PAGE_HEARTBEAT_MS
            );
    }

    function stopHeartbeat() {
        if (
            heartbeatTimer !==
                null
        ) {
            window.clearInterval(
                heartbeatTimer
            );

            heartbeatTimer =
                null;
        }
    }

    function createWorker() {
        if (
            typeof window.SharedWorker !==
                'function'
        ) {
            publish({
                supported:
                    false,
                connected:
                    false,
                ready:
                    false
            });

            return null;
        }

        try {
            return new window.SharedWorker(
                WORKER_URL,
                {
                    name:
                        WORKER_NAME,
                    type:
                        'classic'
                }
            );
        } catch {
            return new window.SharedWorker(
                WORKER_URL,
                WORKER_NAME
            );
        }
    }

    function settleRequest(
        requestId,
        value,
        error = null
    ) {
        const id =
            String(
                requestId || ''
            ).trim();

        if (!id) return false;

        const pending =
            pendingRequests.get(id);

        if (!pending) {
            return false;
        }

        pendingRequests.delete(
            id
        );

        window.clearTimeout(
            pending.timerId
        );

        if (error) {
            pending.reject(
                error
            );
        } else {
            pending.resolve(
                value
            );
        }

        return true;
    }

    function handleWorkerMessage(event) {
        const message =
            isObject(
                event?.data
            )
                ? event.data
                : {};

        const type =
            String(
                message.type || ''
            ).trim();

        if (
            message.workerVersion
        ) {
            publish({
                workerVersion:
                    String(
                        message
                            .workerVersion
                    )
            });
        }

        if (
            type ===
                'worker-connected'
        ) {
            safePost({
                type:
                    'connect',
                pageId,
                surface,
                visible:
                    !document.hidden
            });

            return;
        }

        if (
            type ===
                'worker-ready'
        ) {
            publish({
                ready:
                    true,
                activeBuild:
                    cloneJson(
                        message.activeBuild ||
                        null
                    ),
                queue:
                    Array.isArray(
                        message.queue
                    )
                        ? message.queue
                        : state.queue
            });

            flushRegisteredBuilds();
            return;
        }

        if (
            type ===
                'worker-heartbeat'
        ) {
            publish({
                lastWorkerHeartbeat:
                    Number(
                        message.at
                    ) ||
                    Date.now()
            });

            emitWorkerMessage(
                message
            );

            return;
        }

        if (
            type ===
                'queue-state'
        ) {
            publish({
                activeBuild:
                    cloneJson(
                        message.activeBuild ||
                        null
                    ),
                queue:
                    Array.isArray(
                        message.queue
                    )
                        ? message.queue
                        : []
            });
        }

        if (
            type ===
                'build-liveness'
        ) {
            const runtimeMessage =
                isObject(
                    message
                        .runtimeMessage
                )
                    ? message
                        .runtimeMessage
                    : null;

            if (runtimeMessage) {
                if (
                    message.relayRequired ===
                        true
                ) {
                    window
                        .AtlasSubjectRuntimeChannel
                        ?.ingestExternalMessage
                        ?.(
                            runtimeMessage
                        );
                }

                const detail =
                    runtimeMessage
                        .detail;

                if (
                    runtimeMessage.type ===
                        'build-heartbeat' &&
                    isObject(detail)
                ) {
                    publish({
                        activeBuild: {
                            subjectId:
                                runtimeMessage
                                    .subjectId ||
                                state
                                    .activeBuild
                                    ?.subjectId ||
                                null,
                            completedStep:
                                Number(
                                    detail
                                        .completedStep
                                ) ||
                                0,
                            progress: {
                                current:
                                    detail
                                        .current ||
                                    null,
                                total:
                                    detail
                                        .total ||
                                    9,
                                label:
                                    detail
                                        .label ||
                                    'Building subject'
                            }
                        }
                    });
                } else if (
                    runtimeMessage.type ===
                        'build-stop' &&
                    state
                        .activeBuild
                        ?.subjectId ===
                        runtimeMessage
                            .subjectId
                ) {
                    publish({
                        activeBuild:
                            null
                    });
                }
            }
        }

        if (
            type ===
                'auth-required'
        ) {
            const requestedUserId =
                String(
                    message.userId ||
                    ''
                ).trim();

            if (
                requestedUserId &&
                state.userId &&
                requestedUserId !==
                    state.userId
            ) {
                return;
            }

            void sendCurrentAuth(
                'worker-request'
            );
        }

        if (
            type ===
                'foreground-granted'
        ) {
            settleRequest(
                message.requestId,
                {
                    subjectId:
                        message.subjectId ||
                        null,
                    completedStep:
                        Number.isFinite(
                            Number(
                                message.completedStep
                            )
                        )
                            ? Number(
                                message.completedStep
                            )
                            : null,
                    readyToCommit:
                        message.readyToCommit ===
                        true,
                    generationContext:
                        cloneJson(
                            message
                                .generationContext ||
                            null
                        ),
                    noWorkerJob:
                        message.noWorkerJob ===
                        true
                }
            );
        }

        if (
            type ===
                'foreground-denied'
        ) {
            settleRequest(
                message.requestId,
                null,
                new Error(
                    String(
                        message.reason ||
                        'Atlas could not hand this build to the foreground page.'
                    )
                )
            );
        }

        if (
            type ===
                'checkpoint-result'
        ) {
            settleRequest(
                message.requestId,
                {
                    subjectId:
                        message.subjectId ||
                        null,
                    checkpoint:
                        cloneJson(
                            message.checkpoint
                        ),
                    error:
                        message.error ||
                        null
                },
                message.error
                    ? new Error(
                        String(
                            message.error
                        )
                    )
                    : null
            );
        }

        if (
            type ===
                'worker-state'
        ) {
            publish({
                activeBuild:
                    cloneJson(
                        message.activeBuild ||
                        null
                    ),
                queue:
                    Array.isArray(
                        message.queue
                    )
                        ? message.queue
                        : state.queue
            });

            settleRequest(
                message.requestId,
                cloneJson(
                    message
                )
            );
        }

        if (
            type ===
                'subject-cancelled'
        ) {
            registeredBuilds.delete(
                String(
                    message.subjectId ||
                    ''
                ).trim()
            );
        }

        emitWorkerMessage(
            message
        );
    }

    function connectWorker() {
        if (
            port &&
            state.connected
        ) {
            return true;
        }

        if (
            typeof window.SharedWorker !==
                'function'
        ) {
            publish({
                supported:
                    false,
                connected:
                    false,
                ready:
                    false
            });

            return false;
        }

        try {
            worker =
                createWorker();

            port =
                worker?.port ||
                null;

            if (!port) {
                throw new Error(
                    'Atlas SharedWorker opened without a MessagePort.'
                );
            }

            port.onmessage =
                handleWorkerMessage;

            port.onmessageerror =
                () => {
                    publish({
                        lastError:
                            'Atlas SharedWorker sent an unreadable message.'
                    });
                };

            if (worker) {
                worker.onerror =
                    () => {
                        publish({
                            lastError:
                                'Atlas SharedWorker stopped unexpectedly.'
                        });

                        scheduleReconnect(
                            'worker-error'
                        );
                    };
            }

            if (
                typeof port.start ===
                    'function'
            ) {
                port.start();
            }

            publish({
                supported:
                    true,
                connected:
                    true,
                ready:
                    false,
                lastError:
                    null
            });

            safePost({
                type:
                    'connect',
                pageId,
                surface,
                visible:
                    !document.hidden
            });

            startHeartbeat();

            return true;
        } catch (error) {
            worker = null;
            port = null;

            publish({
                connected:
                    false,
                ready:
                    false,
                lastError:
                    String(
                        error?.message ||
                        error
                    )
            });

            return false;
        }
    }

    function disconnectWorker(
        reason = 'page-disconnect'
    ) {
        stopHeartbeat();

        if (port) {
            try {
                port.postMessage({
                    type:
                        'disconnect',
                    pageId,
                    reason
                });
            } catch { }

            if (
                typeof port.close ===
                    'function'
            ) {
                try {
                    port.close();
                } catch { }
            }
        }

        worker = null;
        port = null;

        publish({
            connected:
                false,
            ready:
                false,
            activeBuild:
                null,
            queue: []
        });
    }

    function cancelScheduledReconnect() {
        if (
            reconnectTimer !==
                null
        ) {
            window.clearTimeout(
                reconnectTimer
            );

            reconnectTimer = null;
        }
    }

    function scheduleReconnect(
        reason = 'worker-reconnect'
    ) {
        if (
            reconnectTimer !== null ||
            !state.authenticated
        ) {
            return;
        }

        reconnectTimer =
            window.setTimeout(
                async () => {
                    reconnectTimer = null;

                    disconnectWorker(reason);

                    if (!connectWorker()) {
                        return;
                    }

                    try {
                        await sendCurrentAuth(
                            reason
                        );
                    } catch (error) {
                        publish({
                            lastError:
                                String(
                                    error?.message ||
                                    error
                                )
                        });
                    }
                },
                750
            );
    }

    async function ensureAccountRuntime() {
        if (window.AtlasAccount) {
            await window.AtlasAccount
                .initialize?.();

            return window.AtlasAccount;
        }

        const Bootstrap =
            window
                .AtlasAccessBootstrap;

        if (
            Bootstrap &&
            typeof Bootstrap
                .prepareAccountRuntime ===
                'function'
        ) {
            const Account =
                await Bootstrap
                    .prepareAccountRuntime();

            await Account
                ?.initialize?.();

            return (
                Account ||
                window.AtlasAccount ||
                null
            );
        }

        return null;
    }

    async function sendCurrentAuth(
        reason = 'account'
    ) {
        const Account =
            window.AtlasAccount;

        const accountState =
            Account?.getState?.() ||
            null;

        if (
            !accountState
                ?.authenticated ||
            !accountState
                ?.userId
        ) {
            if (state.userId) {
                safePost({
                    type:
                        'auth-clear',
                    userId:
                        state.userId,
                    reason
                });
            }

            publish({
                authenticated:
                    false,
                userId:
                    null
            });

            return false;
        }

        if (!connectWorker()) {
            return false;
        }

        const Cloud =
            window.AtlasCloud;

        if (
            !Cloud ||
            typeof Cloud.getSession !==
                'function'
        ) {
            publish({
                lastError:
                    'Atlas account session is unavailable to the build worker.'
            });

            return false;
        }

        try {
            const session =
                await Cloud
                    .getSession();

            const userId =
                String(
                    session?.user?.id ||
                    ''
                ).trim();

            const accessToken =
                String(
                    session
                        ?.access_token ||
                    ''
                ).trim();

            if (
                !userId ||
                !accessToken ||
                userId !==
                    String(
                        accountState
                            .userId
                    ).trim()
            ) {
                throw new Error(
                    'Atlas build-worker authentication is stale.'
                );
            }

            const previousUserId =
                state.userId;

            if (
                previousUserId &&
                previousUserId !==
                    userId
            ) {
                safePost({
                    type:
                        'auth-clear',
                    userId:
                        previousUserId,
                    reason:
                        'account-switch'
                });

                registeredBuilds.clear();
            }

            safePost({
                type:
                    'auth',
                userId,
                accessToken,
                expiresAt:
                    Number(
                        session
                            .expires_at
                    ) ||
                    null,
                account: {
                    planCode:
                        accountState
                            .planCode ||
                        null,
                    entitlementReady:
                        accountState
                            .entitlementReady ===
                        true
                },
                reason
            });

            publish({
                authenticated:
                    true,
                userId,
                lastError:
                    null
            });

            flushRegisteredBuilds();
            return true;
        } catch (error) {
            publish({
                lastError:
                    String(
                        error?.message ||
                        error
                    )
            });

            return false;
        }
    }

    async function syncAccount(
        detail = null
    ) {
        const accountState =
            isObject(detail)
                ? detail
                : window
                    .AtlasAccount
                    ?.getState?.();

        if (
            accountState
                ?.authenticated ===
                true &&
            accountState
                ?.userId
        ) {
            return sendCurrentAuth(
                'account-change'
            );
        }

        if (
            accountState &&
            accountState.ready ===
                true
        ) {
            const previousUserId =
                state.userId;

            if (previousUserId) {
                safePost({
                    type:
                        'auth-clear',
                    userId:
                        previousUserId,
                    reason:
                        'signed-out'
                });
            }

            registeredBuilds.clear();
            cancelScheduledReconnect();

            publish({
                authenticated:
                    false,
                userId:
                    null
            });

            disconnectWorker(
                'signed-out'
            );

            return false;
        }

        return null;
    }

    async function initialize() {
        if (
            !state.supported
        ) {
            return snapshot();
        }

        if (
            window.AtlasAccount
        ) {
            await window.AtlasAccount
                .initialize?.();

            await syncAccount(
                window.AtlasAccount
                    .getState?.()
            );

            return snapshot();
        }

        if (
            !hasStoredSession() &&
            !hasOAuthSessionInUrl()
        ) {
            return snapshot();
        }

        try {
            const Account =
                await ensureAccountRuntime();

            await syncAccount(
                Account
                    ?.getState?.()
            );
        } catch (error) {
            publish({
                lastError:
                    String(
                        error?.message ||
                        error
                    )
            });
        }

        return snapshot();
    }

    function nextRequestId() {
        requestSequence += 1;

        return (
            pageId +
            ':request:' +
            requestSequence
        );
    }

    function request(
        type,
        detail = {},
        {
            timeoutMs =
                REQUEST_TIMEOUT_MS
        } = {}
    ) {
        if (
            !state.authenticated ||
            !connectWorker()
        ) {
            return Promise.reject(
                new Error(
                    'Atlas build worker requires an authenticated page.'
                )
            );
        }

        const requestId =
            nextRequestId();

        return new Promise(
            (resolve, reject) => {
                const timerId =
                    window.setTimeout(
                        () => {
                            pendingRequests
                                .delete(
                                    requestId
                                );

                            reject(
                                new Error(
                                    'Atlas build worker request timed out.'
                                )
                            );
                        },
                        Math.max(
                            1000,
                            Number(
                                timeoutMs
                            ) ||
                            REQUEST_TIMEOUT_MS
                        )
                    );

                pendingRequests.set(
                    requestId,
                    {
                        resolve,
                        reject,
                        timerId
                    }
                );

                const sent =
                    safePost({
                        type,
                        requestId,
                        ...detail
                    });

                if (!sent) {
                    settleRequest(
                        requestId,
                        null,
                        new Error(
                            'Atlas build worker is disconnected.'
                        )
                    );
                }
            }
        );
    }

    function enqueueSubject(
        subjectId,
        build = {}
    ) {
        const id =
            String(
                subjectId || ''
            ).trim();

        if (
            !id ||
            !state.supported
        ) {
            return false;
        }

        const descriptor =
            mergeBuildDescriptor(
                registeredBuilds
                    .get(id),
                build
            );

        registeredBuilds.set(
            id,
            descriptor
        );

        if (
            !state.authenticated
        ) {
            void initialize();
            return true;
        }

        if (!connectWorker()) {
            return true;
        }

        safePost({
            type:
                'enqueue-subject',
            subjectId:
                id,
            build:
                cloneJson(
                    descriptor
                )
        });

        return true;
    }

    function cancelSubject(
        subjectId,
        reason = 'cancelled'
    ) {
        const id =
            String(
                subjectId || ''
            ).trim();

        if (!id) return false;

        registeredBuilds.delete(id);

        if (
            !state.authenticated ||
            !state.connected
        ) {
            return true;
        }

        return safePost({
            type:
                'cancel-subject',
            subjectId:
                id,
            reason:
                String(
                    reason || ''
                ).trim() ||
                'cancelled'
        });
    }

    function requestForegroundOwnership(
        subjectId,
        {
            reason =
                'subject-open',
            timeoutMs =
                150000
        } = {}
    ) {
        const id =
            String(
                subjectId || ''
            ).trim();

        if (!id) {
            return Promise.reject(
                new Error(
                    'Atlas foreground ownership requires a subject ID.'
                )
            );
        }

        return request(
            'request-foreground-ownership',
            {
                subjectId:
                    id,
                reason:
                    String(
                        reason || ''
                    ).trim() ||
                    'subject-open'
            },
            {
                timeoutMs
            }
        );
    }

    function releaseForegroundOwnership(
        subjectId,
        reason =
            'foreground-release'
    ) {
        const id =
            String(
                subjectId || ''
            ).trim();

        if (
            !id ||
            !state.authenticated ||
            !state.connected
        ) {
            return false;
        }

        return safePost({
            type:
                'release-foreground-ownership',
            subjectId:
                id,
            reason:
                String(
                    reason || ''
                ).trim() ||
                'foreground-release'
        });
    }

    function requestCheckpoint(subjectId) {
        const id =
            String(
                subjectId || ''
            ).trim();

        if (!id) {
            return Promise.reject(
                new Error(
                    'Atlas build checkpoint requires a subject ID.'
                )
            );
        }

        return request(
            'request-checkpoint',
            {
                subjectId:
                    id
            }
        );
    }

    function requestWorkerState() {
        return request(
            'get-worker-state'
        );
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

        listeners.add(
            listener
        );

        if (immediate) {
            try {
                listener(
                    snapshot()
                );
            } catch (error) {
                console.error(
                    '[AtlasSubjectBuildWorkerClient] listener failed:',
                    error
                );
            }
        }

        return () =>
            listeners.delete(
                listener
            );
    }

    function handleAccountChange(event) {
        void syncAccount(
            event?.detail ||
            null
        );
    }

    function handleVisibilityChange() {
        safePost({
            type:
                'page-state',
            pageId,
            surface,
            visible:
                !document.hidden
        });
    }

    function handlePageHide(event) {
        cancelScheduledReconnect();

        disconnectWorker(
            event?.persisted
                ? 'page-suspended'
                : 'page-hidden'
        );
    }

    function handlePageShow() {
        if (
            !state.authenticated
        ) {
            return;
        }

        connectWorker();

        safePost({
            type:
                'connect',
            pageId,
            surface,
            visible:
                !document.hidden
        });

        startHeartbeat();

        void sendCurrentAuth(
            'page-show'
        );
    }

    function destroy() {
        window.removeEventListener(
            'atlas:account-change',
            handleAccountChange
        );

        document.removeEventListener(
            'visibilitychange',
            handleVisibilityChange
        );

        window.removeEventListener(
            'pagehide',
            handlePageHide
        );

        window.removeEventListener(
            'pageshow',
            handlePageShow
        );

        pendingRequests.forEach(
            pending => {
                window.clearTimeout(
                    pending.timerId
                );

                pending.reject(
                    new Error(
                        'Atlas build worker client was destroyed.'
                    )
                );
            }
        );

        pendingRequests.clear();
        registeredBuilds.clear();
        cancelScheduledReconnect();

        disconnectWorker(
            'destroy'
        );

        listeners.clear();
    }

    window.addEventListener(
        'atlas:account-change',
        handleAccountChange
    );

    document.addEventListener(
        'visibilitychange',
        handleVisibilityChange
    );

    window.addEventListener(
        'pagehide',
        handlePageHide
    );

    window.addEventListener(
        'pageshow',
        handlePageShow
    );

    window
        .AtlasSubjectBuildWorkerClient =
        Object.freeze({
            initialize,
            connect:
                connectWorker,
            enqueueSubject,
            cancelSubject,
            requestForegroundOwnership,
            releaseForegroundOwnership,
            requestCheckpoint,
            requestWorkerState,
            sendCurrentAuth,
            getState:
                snapshot,
            subscribe,
            destroy
        });

    void initialize();
})();
