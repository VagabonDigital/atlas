/* ============================================================
   ATLAS SUBJECT BUILD — SHARED WORKER FOUNDATION

   Batch 2 only.

   Owns while Atlas pages are connected:
   - page ports + liveness
   - short-lived access tokens in memory
   - IndexedDB checkpoint reads
   - per-subject build-lock awareness
   - one shared queue skeleton

   Deliberately does NOT:
   - run AtlasAI
   - generate subject content
   - mutate subject documents
   - commit Supabase state
   - hold a build lock for generation

   Real generation ownership arrives in Batch 3.
   ============================================================ */

'use strict';

const WORKER_VERSION =
    '20260924-buildworker1';

const BROWSER_STATE_DB_NAME =
    'atlas-tutor-subjects';

const BROWSER_STATE_STORE =
    'browser-state';

const BUILD_CHECKPOINT_KEY_PREFIX =
    'build-checkpoint::';

const BUILD_LOCK_PREFIX =
    'atlas-subject-build:';

const PAGE_STALE_MS = 45000;
const WORKER_HEARTBEAT_MS = 15000;

const connections = new Map();
const authByUser = new Map();
const queueByKey = new Map();
const queueOrder = [];

let browserStateDbPromise = null;

function now() {
    return Date.now();
}

function clean(value) {
    return String(value || '').trim();
}

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

function normalizeCompletedStep(value) {
    return Math.max(
        0,
        Math.min(
            18,
            Math.floor(
                Number(value) || 0
            )
        )
    );
}

function queueKey(userId, subjectId) {
    return `${clean(userId)}::${clean(subjectId)}`;
}

function buildLockName(subjectId) {
    return (
        BUILD_LOCK_PREFIX +
        clean(subjectId)
    );
}

function buildCheckpointKey(subjectId) {
    return (
        BUILD_CHECKPOINT_KEY_PREFIX +
        clean(subjectId)
    );
}

function safePost(
    port,
    type,
    detail = {}
) {
    if (
        !port ||
        typeof port.postMessage !==
            'function'
    ) {
        return false;
    }

    try {
        port.postMessage({
            type,
            workerVersion:
                WORKER_VERSION,
            ...(
                detail &&
                typeof detail ===
                    'object' &&
                !Array.isArray(detail)
                    ? detail
                    : {}
            )
        });

        return true;
    } catch {
        return false;
    }
}

function pagesForUser(userId) {
    const id = clean(userId);

    return Array.from(
        connections.values()
    ).filter(connection =>
        clean(connection.userId) === id
    );
}

function clearQueueForUser(userId) {
    const id =
        clean(userId);

    if (!id) return;

    Array.from(
        queueByKey.entries()
    ).forEach(
        ([key, job]) => {
            if (
                job?.userId ===
                id
            ) {
                queueByKey.delete(
                    key
                );
            }
        }
    );

    for (
        let index =
            queueOrder.length - 1;
        index >= 0;
        index -= 1
    ) {
        if (
            !queueByKey.has(
                queueOrder[index]
            )
        ) {
            queueOrder.splice(
                index,
                1
            );
        }
    }
}

function pruneAuthForUser(userId) {
    const id = clean(userId);

    if (
        !id ||
        pagesForUser(id).length
    ) {
        return;
    }

    authByUser.delete(id);
}

function removeConnection(
    connection,
    reason = 'disconnect'
) {
    if (!connection) return;

    const previousUserId =
        clean(connection.userId);

    connections.delete(
        connection.port
    );

    connection.connected = false;
    connection.lastSeenAt = now();
    connection.disconnectReason =
        clean(reason);

    pruneAuthForUser(
        previousUserId
    );
}

function broadcast(
    type,
    detail = {},
    predicate = null
) {
    connections.forEach(connection => {
        if (
            typeof predicate ===
                'function' &&
            !predicate(connection)
        ) {
            return;
        }

        safePost(
            connection.port,
            type,
            detail
        );
    });
}

function broadcastToUser(
    userId,
    type,
    detail = {}
) {
    const id = clean(userId);

    if (!id) return;

    broadcast(
        type,
        detail,
        connection =>
            clean(
                connection.userId
            ) === id
    );
}

function queueSnapshot(userId = '') {
    const id = clean(userId);

    return queueOrder
        .map(key =>
            queueByKey.get(key)
        )
        .filter(Boolean)
        .filter(job =>
            !id ||
            job.userId === id
        )
        .map(job => ({
            userId:
                job.userId,
            subjectId:
                job.subjectId,
            status:
                job.status,
            hasCheckpoint:
                job.hasCheckpoint,
            completedStep:
                job.completedStep,
            lockState:
                job.lockState,
            enqueuedAt:
                job.enqueuedAt,
            updatedAt:
                job.updatedAt
        }));
}

function workerSnapshot(
    connection = null
) {
    const userId =
        clean(
            connection?.userId
        );

    return {
        version:
            WORKER_VERSION,
        pageCount:
            connections.size,
        authenticated:
            Boolean(
                userId &&
                authByUser
                    .get(userId)
                    ?.accessToken
            ),
        userId:
            userId || null,
        queue:
            queueSnapshot(
                userId
            )
    };
}

function openBrowserStateDb() {
    if (browserStateDbPromise) {
        return browserStateDbPromise;
    }

    if (!self.indexedDB) {
        return Promise.reject(
            new Error(
                'Atlas build checkpoint storage is unavailable.'
            )
        );
    }

    browserStateDbPromise =
        new Promise(
            (resolve, reject) => {
                let request;

                try {
                    request =
                        self.indexedDB.open(
                            BROWSER_STATE_DB_NAME
                        );
                } catch (error) {
                    reject(error);
                    return;
                }

                request.onupgradeneeded =
                    () => {
                        const db =
                            request.result;

                        if (
                            !db.objectStoreNames
                                .contains(
                                    BROWSER_STATE_STORE
                                )
                        ) {
                            db.createObjectStore(
                                BROWSER_STATE_STORE
                            );
                        }
                    };

                request.onerror =
                    () => {
                        browserStateDbPromise =
                            null;

                        reject(
                            request.error ||
                            new Error(
                                'Atlas build checkpoint database could not open.'
                            )
                        );
                    };

                request.onblocked =
                    () => {
                        browserStateDbPromise =
                            null;

                        reject(
                            new Error(
                                'Atlas build checkpoint database is blocked.'
                            )
                        );
                    };

                request.onsuccess =
                    () => {
                        const db =
                            request.result;

                        db.onversionchange =
                            () => {
                                try {
                                    db.close();
                                } catch { }

                                browserStateDbPromise =
                                    null;
                            };

                        resolve(db);
                    };
            }
        );

    return browserStateDbPromise;
}

async function readBrowserState(key) {
    const db =
        await openBrowserStateDb();

    if (
        !db.objectStoreNames
            .contains(
                BROWSER_STATE_STORE
            )
    ) {
        return null;
    }

    return new Promise(
        (resolve, reject) => {
            let transaction;

            try {
                transaction =
                    db.transaction(
                        BROWSER_STATE_STORE,
                        'readonly'
                    );
            } catch (error) {
                reject(error);
                return;
            }

            const request =
                transaction
                    .objectStore(
                        BROWSER_STATE_STORE
                    )
                    .get(
                        clean(key)
                    );

            request.onsuccess =
                () =>
                    resolve(
                        cloneJson(
                            request.result ??
                            null
                        )
                    );

            request.onerror =
                () =>
                    reject(
                        request.error ||
                        transaction.error ||
                        new Error(
                            'Atlas build checkpoint could not be read.'
                        )
                    );
        }
    );
}

async function readBuildCheckpoint(
    subjectId
) {
    const id =
        clean(subjectId);

    if (!id) return null;

    return readBrowserState(
        buildCheckpointKey(id)
    );
}

async function inspectBuildLock(
    subjectId
) {
    const id =
        clean(subjectId);

    if (!id) {
        return {
            name: '',
            state:
                'invalid'
        };
    }

    const name =
        buildLockName(id);

    const Locks =
        self.navigator?.locks;

    if (!Locks) {
        return {
            name,
            state:
                'unsupported'
        };
    }

    if (
        typeof Locks.query ===
            'function'
    ) {
        try {
            const snapshot =
                await Locks.query();

            const held =
                Array.isArray(
                    snapshot?.held
                ) &&
                snapshot.held.some(
                    lock =>
                        lock?.name ===
                        name
                );

            const pending =
                Array.isArray(
                    snapshot?.pending
                ) &&
                snapshot.pending.some(
                    lock =>
                        lock?.name ===
                        name
                );

            return {
                name,
                state:
                    held
                        ? 'held'
                        : pending
                            ? 'pending'
                            : 'available'
            };
        } catch {
            // Fall through to a non-holding ifAvailable probe.
        }
    }

    if (
        typeof Locks.request ===
            'function'
    ) {
        let acquired = false;

        try {
            await Locks.request(
                name,
                {
                    mode:
                        'exclusive',
                    ifAvailable:
                        true
                },
                lock => {
                    acquired =
                        Boolean(lock);
                }
            );

            return {
                name,
                state:
                    acquired
                        ? 'available'
                        : 'held'
            };
        } catch {
            return {
                name,
                state:
                    'unknown'
            };
        }
    }

    return {
        name,
        state:
            'unsupported'
    };
}

function requestAuthForUser(
    userId,
    reason = 'worker'
) {
    const id =
        clean(userId);

    if (!id) return;

    broadcastToUser(
        id,
        'auth-required',
        {
            userId: id,
            reason:
                clean(reason) ||
                'worker'
        }
    );
}

function publishQueueState(
    userId
) {
    const id =
        clean(userId);

    if (!id) return;

    broadcastToUser(
        id,
        'queue-state',
        {
            userId: id,
            queue:
                queueSnapshot(id)
        }
    );
}

async function enqueueSubject(
    connection,
    subjectId
) {
    const userId =
        clean(
            connection?.userId
        );

    const id =
        clean(subjectId);

    if (!userId) {
        safePost(
            connection?.port,
            'queue-rejected',
            {
                subjectId:
                    id || null,
                reason:
                    'auth-required'
            }
        );

        return null;
    }

    if (!id) {
        safePost(
            connection.port,
            'queue-rejected',
            {
                subjectId: null,
                reason:
                    'invalid-subject'
            }
        );

        return null;
    }

    const key =
        queueKey(
            userId,
            id
        );

    const existing =
        queueByKey.get(key);

    const enqueuedAt =
        existing?.enqueuedAt ||
        now();

    const inspecting = {
        userId,
        subjectId:
            id,
        status:
            'inspecting',
        hasCheckpoint:
            false,
        completedStep:
            0,
        lockState:
            'unknown',
        enqueuedAt,
        updatedAt:
            now()
    };

    queueByKey.set(
        key,
        inspecting
    );

    if (
        !queueOrder.includes(key)
    ) {
        queueOrder.push(key);
    }

    publishQueueState(
        userId
    );

    let checkpoint = null;
    let checkpointError = null;
    let lock = {
        name:
            buildLockName(id),
        state:
            'unknown'
    };

    try {
        [
            checkpoint,
            lock
        ] =
            await Promise.all([
                readBuildCheckpoint(id),
                inspectBuildLock(id)
            ]);
    } catch (error) {
        checkpointError =
            error;
    }

    const completedStep =
        normalizeCompletedStep(
            checkpoint
                ?.buildState
                ?.completedStep
        );

    const hasCheckpoint =
        Boolean(
            checkpoint &&
            typeof checkpoint ===
                'object'
        );

    let status =
        hasCheckpoint
            ? 'queued'
            : 'checkpoint-missing';

    if (
        lock?.state ===
            'held' ||
        lock?.state ===
            'pending'
    ) {
        status =
            'blocked-by-owner';
    }

    if (checkpointError) {
        status =
            'checkpoint-error';
    }

    const job = {
        userId,
        subjectId:
            id,
        status,
        hasCheckpoint,
        completedStep,
        lockState:
            clean(
                lock?.state
            ) || 'unknown',
        enqueuedAt,
        updatedAt:
            now()
    };

    queueByKey.set(
        key,
        job
    );

    safePost(
        connection.port,
        'checkpoint-read',
        {
            subjectId:
                id,
            hasCheckpoint,
            completedStep,
            error:
                checkpointError
                    ? String(
                        checkpointError
                            .message ||
                        checkpointError
                    )
                    : null
        }
    );

    if (
        !authByUser
            .get(userId)
            ?.accessToken
    ) {
        requestAuthForUser(
            userId,
            'queue'
        );
    }

    publishQueueState(
        userId
    );

    return job;
}

async function handleCheckpointRequest(
    connection,
    message
) {
    const requestId =
        clean(
            message?.requestId
        );

    const subjectId =
        clean(
            message?.subjectId
        );

    if (
        !connection?.userId ||
        !requestId ||
        !subjectId
    ) {
        safePost(
            connection?.port,
            'checkpoint-result',
            {
                requestId:
                    requestId || null,
                subjectId:
                    subjectId || null,
                checkpoint:
                    null,
                error:
                    !connection?.userId
                        ? 'auth-required'
                        : 'invalid-request'
            }
        );

        return;
    }

    try {
        const checkpoint =
            await readBuildCheckpoint(
                subjectId
            );

        safePost(
            connection.port,
            'checkpoint-result',
            {
                requestId,
                subjectId,
                checkpoint:
                    cloneJson(
                        checkpoint
                    ),
                error: null
            }
        );
    } catch (error) {
        safePost(
            connection.port,
            'checkpoint-result',
            {
                requestId,
                subjectId,
                checkpoint:
                    null,
                error:
                    String(
                        error?.message ||
                        error
                    )
            }
        );
    }
}

function handleAuth(
    connection,
    message
) {
    const userId =
        clean(
            message?.userId
        );

    const accessToken =
        clean(
            message?.accessToken
        );

    if (
        !userId ||
        !accessToken
    ) {
        safePost(
            connection.port,
            'auth-rejected',
            {
                reason:
                    'invalid-auth'
            }
        );

        return;
    }

    const previousUserId =
        clean(
            connection.userId
        );

    connection.userId =
        userId;
    connection.lastSeenAt =
        now();

    if (
        previousUserId &&
        previousUserId !==
            userId
    ) {
        pruneAuthForUser(
            previousUserId
        );
    }

    authByUser.set(
        userId,
        {
            accessToken,
            expiresAt:
                Number(
                    message?.expiresAt
                ) || null,
            account:
                cloneJson(
                    message?.account ||
                    {}
                ),
            updatedAt:
                now(),
            refreshRequestedAt:
                null
        }
    );

    safePost(
        connection.port,
        'auth-accepted',
        {
            userId,
            expiresAt:
                Number(
                    message?.expiresAt
                ) || null
        }
    );
}

function handleAuthClear(
    connection,
    message
) {
    const requestedUserId =
        clean(
            message?.userId
        );

    const previousUserId =
        requestedUserId ||
        clean(
            connection.userId
        );

    if (previousUserId) {
        authByUser.delete(
            previousUserId
        );

        clearQueueForUser(
            previousUserId
        );

        publishQueueState(
            previousUserId
        );
    }

    connection.userId = '';
    connection.lastSeenAt =
        now();

    safePost(
        connection.port,
        'auth-cleared',
        {
            userId:
                previousUserId ||
                null
        }
    );
}

function handleMessage(
    connection,
    event
) {
    const message =
        event?.data &&
        typeof event.data ===
            'object' &&
        !Array.isArray(event.data)
            ? event.data
            : {};

    const type =
        clean(
            message.type
        );

    connection.lastSeenAt =
        now();

    if (type === 'connect') {
        connection.pageId =
            clean(
                message.pageId
            );

        connection.surface =
            clean(
                message.surface
            ) || 'atlas';

        connection.visible =
            message.visible !==
            false;

        safePost(
            connection.port,
            'worker-ready',
            workerSnapshot(
                connection
            )
        );

        return;
    }

    if (
        type ===
            'page-heartbeat' ||
        type ===
            'page-state'
    ) {
        connection.visible =
            message.visible !==
            false;

        return;
    }

    if (type === 'disconnect') {
        removeConnection(
            connection,
            message.reason ||
            'page-disconnect'
        );

        return;
    }

    if (type === 'auth') {
        handleAuth(
            connection,
            message
        );

        return;
    }

    if (type === 'auth-clear') {
        handleAuthClear(
            connection,
            message
        );

        return;
    }

    if (type === 'enqueue-subject') {
        void enqueueSubject(
            connection,
            message.subjectId
        );

        return;
    }

    if (
        type ===
            'request-checkpoint'
    ) {
        void handleCheckpointRequest(
            connection,
            message
        );

        return;
    }

    if (
        type ===
            'get-worker-state'
    ) {
        safePost(
            connection.port,
            'worker-state',
            {
                requestId:
                    clean(
                        message.requestId
                    ) || null,
                ...workerSnapshot(
                    connection
                )
            }
        );

        return;
    }

    if (
        type ===
            'request-auth'
    ) {
        requestAuthForUser(
            connection.userId,
            message.reason ||
            'explicit'
        );
    }
}

self.onconnect =
    function onAtlasSharedWorkerConnect(
        event
    ) {
        const port =
            event?.ports?.[0];

        if (!port) return;

        const connection = {
            port,
            pageId: '',
            surface:
                'atlas',
            userId: '',
            visible:
                true,
            connected:
                true,
            connectedAt:
                now(),
            lastSeenAt:
                now()
        };

        connections.set(
            port,
            connection
        );

        port.onmessage =
            event =>
                handleMessage(
                    connection,
                    event
                );

        port.onmessageerror =
            () => {
                connection.lastSeenAt =
                    now();
            };

        if (
            typeof port.start ===
                'function'
        ) {
            port.start();
        }

        safePost(
            port,
            'worker-connected',
            {
                version:
                    WORKER_VERSION
            }
        );
    };

self.setInterval(
    () => {
        const cutoff =
            now() -
            PAGE_STALE_MS;

        Array.from(
            connections.values()
        ).forEach(
            connection => {
                if (
                    connection.lastSeenAt <
                    cutoff
                ) {
                    removeConnection(
                        connection,
                        'stale'
                    );

                    try {
                        connection.port
                            .close?.();
                    } catch { }
                }
            }
        );

        const currentTime =
            now();

        authByUser.forEach(
            (auth, userId) => {
                const expiresAtMs =
                    Number(
                        auth?.expiresAt
                    ) > 0
                        ? Number(
                            auth.expiresAt
                        ) * 1000
                        : null;

                if (
                    !expiresAtMs ||
                    expiresAtMs -
                        currentTime >
                        60000
                ) {
                    return;
                }

                const requestedAt =
                    Number(
                        auth
                            ?.refreshRequestedAt
                    ) || 0;

                if (
                    requestedAt &&
                    currentTime -
                        requestedAt <
                        30000
                ) {
                    return;
                }

                auth.refreshRequestedAt =
                    currentTime;

                requestAuthForUser(
                    userId,
                    'token-expiring'
                );
            }
        );

        broadcast(
            'worker-heartbeat',
            {
                at:
                    currentTime,
                pageCount:
                    connections.size,
                queueSize:
                    queueByKey.size
            }
        );
    },
    WORKER_HEARTBEAT_MS
);
