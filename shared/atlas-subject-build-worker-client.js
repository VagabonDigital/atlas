/* ============================================================
   ATLAS SUBJECT BUILD — SHARED WORKER CLIENT

   Atlas-wide page bridge for Batch 2.

   Page owns:
   - authenticated account/session state
   - short-lived access-token refresh
   - lifecycle/page identity

   SharedWorker owns only its in-memory runtime skeleton.
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
        '/shared/atlas-subject-build-shared-worker.js?v=20260924-buildworker1';

    const WORKER_NAME =
        'atlas-subject-builds';

    const AUTH_STORAGE_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';

    const PAGE_HEARTBEAT_MS =
        15000;

    const REQUEST_TIMEOUT_MS =
        5000;

    const listeners =
        new Set();

    const pendingRequests =
        new Map();

    const pageId =
        createPageId();

    const surface =
        detectSurface();

    let worker = null;
    let port = null;
    let heartbeatTimer = null;
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

    function snapshot() {
        return {
            ...state,
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

    function emitWorkerMessage(
        message
    ) {
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

            heartbeatTimer = null;
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

    function handleWorkerMessage(
        event
    ) {
        const message =
            event?.data &&
            typeof event.data ===
                'object' &&
            !Array.isArray(
                event.data
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
                queue:
                    Array.isArray(
                        message.queue
                    )
                        ? message.queue
                        : state.queue
            });

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
                'auth-required'
        ) {
            void sendCurrentAuth(
                'worker-request'
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
            if (
                Array.isArray(
                    message.queue
                )
            ) {
                publish({
                    queue:
                        message.queue
                });
            }

            settleRequest(
                message.requestId,
                cloneJson(
                    message
                )
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
        reason = 'page-disconnect',
        {
            closePort = true
        } = {}
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
                closePort &&
                typeof port.close ===
                    'function'
            ) {
                try {
                    port.close();
                } catch { }
            }
        }

        if (closePort) {
            worker = null;
            port = null;

            publish({
                connected:
                    false,
                ready:
                    false,
                queue: []
            });
        }
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
            detail &&
            typeof detail ===
                'object'
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
        detail = {}
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
                        REQUEST_TIMEOUT_MS
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
        subjectId
    ) {
        const id =
            String(
                subjectId || ''
            ).trim();

        if (
            !id ||
            !state.authenticated ||
            !connectWorker()
        ) {
            return false;
        }

        return safePost({
            type:
                'enqueue-subject',
            subjectId:
                id
        });
    }

    function requestCheckpoint(
        subjectId
    ) {
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

    function handleAccountChange(
        event
    ) {
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

    function handlePageHide(
        event
    ) {
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
