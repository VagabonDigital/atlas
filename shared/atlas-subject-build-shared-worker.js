/* ============================================================
   ATLAS SUBJECT BUILD — SHARED WORKER

   Batch 4 runtime.

   Owns while at least one Atlas page is connected:
   - authenticated in-memory AI execution
   - exactly one background subject build at a time
   - canonical BuildRunner sequencing
   - canonical worker-neutral document operations
   - IndexedDB build checkpoints
   - Web Lock subject ownership
   - transient build liveness / progress

   Does NOT own:
   - Supabase session refresh
   - account / billing state
   - final durable subject commit
   - UI / tutor editing state

   Foreground subject pages and this worker never mutate the same
   subject concurrently. The existing atlas-subject-build:<id> Web
   Lock remains the single-writer authority.
   ============================================================ */

'use strict';

const WORKER_VERSION =
    '20260925-buildworker12';

const DEPENDENCY_VERSION =
    '20260924-workerbuild3';

const BROWSER_STATE_DB_NAME =
    'atlas-tutor-subjects';

const BROWSER_STATE_DB_VERSION = 2;

const BROWSER_STATE_STORE =
    'browser-state';

const BUILD_CHECKPOINT_KEY_PREFIX =
    'build-checkpoint::';

const BUILD_LOCK_PREFIX =
    'atlas-subject-build:';

const RUNTIME_CHANNEL_NAME =
    'atlas-subject-runtime-v1';

const PAGE_STALE_MS = 45000;
const WORKER_HEARTBEAT_MS = 15000;
const BUILD_HEARTBEAT_MS = 1500;
const QUEUE_RETRY_MS = 1000;

const connections = new Map();
const authByUser = new Map();
const queueByKey = new Map();
const queueOrder = [];

let browserStateDbPromise = null;
let dependenciesLoaded = false;
let queuePumpTimer = null;
let queuePumping = false;
let activeBuild = null;

const runtimeSourceId =
    self.crypto &&
    typeof self.crypto.randomUUID ===
        'function'
        ? 'shared-worker-' +
            self.crypto.randomUUID()
        : 'shared-worker-' +
            Date.now().toString(36) +
            '-' +
            Math.random()
                .toString(36)
                .slice(2, 12);

let runtimeChannel = null;

try {
    if (
        typeof self.BroadcastChannel ===
            'function'
    ) {
        runtimeChannel =
            new self.BroadcastChannel(
                RUNTIME_CHANNEL_NAME
            );
    }
} catch {
    runtimeChannel = null;
}

function now() {
    return Date.now();
}

function clean(value) {
    return String(
        value || ''
    ).trim();
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

function isObject(value) {
    return Boolean(
        value &&
        typeof value === 'object' &&
        !Array.isArray(value)
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

function normalizeGenerationContext(value) {
    return isObject(value)
        ? cloneJson(value)
        : null;
}

function queueKey(
    userId,
    subjectId
) {
    return [
        clean(userId),
        clean(subjectId)
    ].join('::');
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

function ensureGenerationDependencies() {
    if (dependenciesLoaded) {
        return true;
    }

    if (
        typeof self.importScripts !==
            'function'
    ) {
        throw new Error(
            'Atlas SharedWorker cannot load subject-build dependencies.'
        );
    }

    self.importScripts(
        '/shared/atlas-structured-subject.js?v=' +
            DEPENDENCY_VERSION,
        '/shared/atlas-ai.js?v=' +
            DEPENDENCY_VERSION,
        '/shared/atlas-subject-build-document-operations.js?v=' +
            DEPENDENCY_VERSION,
        '/shared/atlas-subject-build-runner.js?v=' +
            DEPENDENCY_VERSION
    );

    const valid =
        self.AtlasStructuredSubject &&
        self.AtlasAI &&
        typeof self.AtlasAI
            .configureRuntime ===
            'function' &&
        self
            .AtlasSubjectBuildDocumentOperations &&
        typeof self
            .AtlasSubjectBuildDocumentOperations
            .create ===
            'function' &&
        self.AtlasSubjectBuildRunner &&
        typeof self
            .AtlasSubjectBuildRunner
            .run ===
            'function';

    if (!valid) {
        throw new Error(
            'Atlas SharedWorker loaded an incomplete subject-build runtime.'
        );
    }

    dependenciesLoaded = true;
    return true;
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
                isObject(detail)
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
    const id =
        clean(userId);

    return Array.from(
        connections.values()
    ).filter(connection =>
        clean(
            connection.userId
        ) === id
    );
}

function broadcast(
    type,
    detail = {},
    predicate = null
) {
    connections.forEach(
        connection => {
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
        }
    );
}

function broadcastToUser(
    userId,
    type,
    detail = {}
) {
    const id =
        clean(userId);

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

function postDebugTrace(
    connection,
    stage,
    detail = {}
) {
    const event =
        clean(stage);

    if (!event) {
        return false;
    }

    return safePost(
        connection?.port,
        'worker-debug',
        {
            stage:
                event,
            detail:
                isObject(detail)
                    ? cloneJson(detail)
                    : {}
        }
    );
}

function publishDebugTrace(
    userId,
    stage,
    detail = {}
) {
    const id =
        clean(userId);

    const event =
        clean(stage);

    if (!id || !event) {
        return false;
    }

    broadcastToUser(
        id,
        'worker-debug',
        {
            stage:
                event,
            detail:
                isObject(detail)
                    ? cloneJson(detail)
                    : {}
        }
    );

    return true;
}

function publishRuntimeSignal(
    type,
    subjectId,
    detail = {}
) {
    const id =
        clean(subjectId);

    if (!id) return null;

    const message = {
        version: 1,
        type:
            clean(type),
        subjectId:
            id,
        sourceId:
            runtimeSourceId,
        sentAt:
            now(),
        detail:
            isObject(detail)
                ? cloneJson(detail)
                : {}
    };

    if (runtimeChannel) {
        try {
            runtimeChannel.postMessage(
                message
            );
        } catch { }
    }

    if (activeBuild?.subjectId === id) {
        broadcastToUser(
            activeBuild.userId,
            'build-liveness',
            {
                runtimeMessage:
                    cloneJson(
                        message
                    ),
                relayRequired:
                    !runtimeChannel
            }
        );
    }

    return message;
}

function publishActiveBuildHeartbeat(
    extra = {}
) {
    if (!activeBuild) {
        return null;
    }

    const progress =
        activeBuild.progress || {};

    return publishRuntimeSignal(
        'build-heartbeat',
        activeBuild.subjectId,
        {
            owner:
                'shared-worker',
            current:
                progress.current ||
                null,
            total:
                progress.total ||
                self
                    .AtlasSubjectBuildRunner
                    ?.totalProgressStages ||
                9,
            label:
                progress.label ||
                'Building subject',
            completedStep:
                normalizeCompletedStep(
                    activeBuild.completedStep
                ),
            ...(
                isObject(extra)
                    ? extra
                    : {}
            )
        }
    );
}

function startActiveBuildHeartbeat() {
    if (!activeBuild) {
        return () => {};
    }

    publishActiveBuildHeartbeat();

    const timerId =
        self.setInterval(
            () => {
                publishActiveBuildHeartbeat();
            },
            BUILD_HEARTBEAT_MS
        );

    let stopped = false;

    return (
        reason = 'ended'
    ) => {
        if (stopped) return;
        stopped = true;

        self.clearInterval(
            timerId
        );

        if (activeBuild) {
            publishRuntimeSignal(
                'build-stop',
                activeBuild.subjectId,
                {
                    reason,
                    owner:
                        'shared-worker'
                }
            );
        }
    };
}

if (runtimeChannel) {
    const handleRuntimeMessage =
        event => {
            const message =
                event?.data;

            if (
                !activeBuild ||
                !isObject(message) ||
                clean(message.type) !==
                    'build-probe' ||
                clean(message.subjectId) !==
                    activeBuild.subjectId ||
                clean(message.sourceId) ===
                    runtimeSourceId
            ) {
                return;
            }

            publishActiveBuildHeartbeat({
                respondingTo:
                    clean(
                        message.detail
                            ?.probeId
                    )
            });
        };

    if (
        typeof runtimeChannel
            .addEventListener ===
            'function'
    ) {
        runtimeChannel.addEventListener(
            'message',
            handleRuntimeMessage
        );
    } else {
        runtimeChannel.onmessage =
            handleRuntimeMessage;
    }
}

function queueSnapshot(userId = '') {
    const id =
        clean(userId);

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
            progress:
                cloneJson(
                    job.progress ||
                    null
                ),
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
        activeBuild:
            activeBuild
                ? {
                    userId:
                        activeBuild.userId,
                    subjectId:
                        activeBuild.subjectId,
                    completedStep:
                        normalizeCompletedStep(
                            activeBuild.completedStep
                        ),
                    progress:
                        cloneJson(
                            activeBuild.progress ||
                            null
                        )
                }
                : null,
        queue:
            queueSnapshot(
                userId
            )
    };
}

function publishQueueState(userId) {
    const id =
        clean(userId);

    if (!id) return;

    broadcastToUser(
        id,
        'queue-state',
        {
            userId:
                id,
            activeBuild:
                activeBuild &&
                activeBuild.userId ===
                    id
                    ? {
                        subjectId:
                            activeBuild.subjectId,
                        completedStep:
                            normalizeCompletedStep(
                                activeBuild.completedStep
                            ),
                        progress:
                            cloneJson(
                                activeBuild.progress ||
                                null
                            )
                    }
                    : null,
            queue:
                queueSnapshot(id)
        }
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
                id &&
                (
                    !activeBuild ||
                    activeBuild.userId !==
                        id ||
                    activeBuild.subjectId !==
                        job.subjectId
                )
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

function findConnectionByPage(
    userId,
    pageId
) {
    const uid =
        clean(userId);

    const pid =
        clean(pageId);

    if (!uid || !pid) {
        return null;
    }

    return Array.from(
        connections.values()
    ).find(
        connection =>
            clean(
                connection.userId
            ) === uid &&
            clean(
                connection.pageId
            ) === pid
    ) || null;
}

function releaseForegroundOwnershipForPage(
    userId,
    pageId,
    reason = 'page-left'
) {
    const uid =
        clean(userId);

    const pid =
        clean(pageId);

    if (!uid || !pid) {
        return false;
    }

    let released = false;

    queueByKey.forEach(
        job => {
            if (
                job?.userId !== uid ||
                clean(
                    job.foregroundOwnerPageId
                ) !== pid
            ) {
                return;
            }

            publishDebugTrace(
                uid,
                'foreground-ownership-release',
                {
                    subjectId:
                        job.subjectId,
                    pageId:
                        pid,
                    requestId:
                        clean(
                            job.foregroundRequestId
                        ) ||
                        null,
                    reason:
                        clean(reason),
                    jobStatus:
                        job.status,
                    completedStep:
                        normalizeCompletedStep(
                            job.completedStep
                        ),
                    lockState:
                        job.lockState,
                    activeBuildMatches:
                        Boolean(
                            activeBuild &&
                            activeBuild.userId ===
                                uid &&
                            activeBuild.subjectId ===
                                job.subjectId
                        )
                }
            );

            job.foregroundOwnerPageId = '';
            job.foregroundRequestId = '';
            job.foregroundReason =
                clean(reason);
            job.updatedAt =
                now();

            if (
                activeBuild &&
                activeBuild.userId ===
                    uid &&
                activeBuild.subjectId ===
                    job.subjectId &&
                clean(
                    activeBuild
                        .yieldPageId
                ) === pid
            ) {
                activeBuild.yieldRequested =
                    false;
                activeBuild.yieldPageId =
                    '';
                activeBuild.yieldRequestId =
                    '';
            }

            job.status =
                job.completedStep >= 18
                    ? 'ready-to-commit'
                    : 'queued';

            released = true;

            publishQueueState(
                uid
            );
        }
    );

    if (released) {
        scheduleQueuePump();
    }

    return released;
}

function finalizeForegroundGrant(job) {
    const pageId =
        clean(
            job?.foregroundOwnerPageId
        );

    const requestId =
        clean(
            job?.foregroundRequestId
        );

    if (
        !job ||
        !pageId ||
        !requestId
    ) {
        return false;
    }

    const connection =
        findConnectionByPage(
            job.userId,
            pageId
        );

    publishDebugTrace(
        job.userId,
        'foreground-grant-connection-lookup',
        {
            subjectId:
                job.subjectId,
            requestId,
            pageId,
            found:
                Boolean(connection),
            jobStatus:
                job.status,
            completedStep:
                normalizeCompletedStep(
                    job.completedStep
                ),
            lockState:
                job.lockState,
            connectedPageIds:
                pagesForUser(
                    job.userId
                ).map(page =>
                    clean(
                        page.pageId
                    )
                )
        }
    );

    if (!connection) {
        releaseForegroundOwnershipForPage(
            job.userId,
            pageId,
            'requester-gone'
        );

        return false;
    }

    job.status =
        'foreground-owned';
    job.lockState =
        'available';
    job.progress =
        null;
    job.updatedAt =
        now();

    const grantPosted =
        safePost(
            connection.port,
            'foreground-granted',
            {
                requestId,
                subjectId:
                    job.subjectId,
                completedStep:
                    normalizeCompletedStep(
                        job.completedStep
                    ),
                readyToCommit:
                    job.completedStep >= 18,
                generationContext:
                    cloneJson(
                        job
                            .build
                            ?.generationContext ||
                        null
                    )
            }
        );

    publishDebugTrace(
        job.userId,
        'foreground-grant-post-result',
        {
            subjectId:
                job.subjectId,
            requestId,
            pageId,
            posted:
                grantPosted,
            completedStep:
                normalizeCompletedStep(
                    job.completedStep
                ),
            lockState:
                job.lockState
        }
    );

    publishQueueState(
        job.userId
    );

    return true;
}

function pruneAuthForUser(userId) {
    const id =
        clean(userId);

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
        clean(
            connection.userId
        );

    if (previousUserId) {
        publishDebugTrace(
            previousUserId,
            'connection-removing',
            {
                pageId:
                    clean(
                        connection.pageId
                    ) ||
                    null,
                surface:
                    clean(
                        connection.surface
                    ) ||
                    null,
                reason:
                    clean(reason),
                connected:
                    connection.connected !==
                    false
            }
        );
    } else {
        postDebugTrace(
            connection,
            'connection-removing',
            {
                pageId:
                    clean(
                        connection.pageId
                    ) ||
                    null,
                surface:
                    clean(
                        connection.surface
                    ) ||
                    null,
                reason:
                    clean(reason),
                connected:
                    connection.connected !==
                    false
            }
        );
    }

    connections.delete(
        connection.port
    );

    connection.connected = false;
    connection.lastSeenAt =
        now();
    connection.disconnectReason =
        clean(reason);

    releaseForegroundOwnershipForPage(
        previousUserId,
        connection.pageId,
        reason
    );

    pruneAuthForUser(
        previousUserId
    );
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
            userId:
                id,
            reason:
                clean(reason) ||
                'worker'
        }
    );
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
                            BROWSER_STATE_DB_NAME,
                            BROWSER_STATE_DB_VERSION
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

async function writeBrowserState(
    key,
    value
) {
    const db =
        await openBrowserStateDb();

    if (
        !db.objectStoreNames
            .contains(
                BROWSER_STATE_STORE
            )
    ) {
        throw new Error(
            'Atlas build checkpoint store is unavailable.'
        );
    }

    return new Promise(
        (resolve, reject) => {
            let transaction;

            try {
                transaction =
                    db.transaction(
                        BROWSER_STATE_STORE,
                        'readwrite'
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
                    .put(
                        cloneJson(value),
                        clean(key)
                    );

            request.onsuccess =
                () => resolve(true);

            request.onerror =
                () =>
                    reject(
                        request.error ||
                        transaction.error ||
                        new Error(
                            'Atlas build checkpoint could not be saved.'
                        )
                    );
        }
    );
}

async function readBuildCheckpoint(subjectId) {
    const id =
        clean(subjectId);

    if (!id) return null;

    return readBrowserState(
        buildCheckpointKey(id)
    );
}

async function writeBuildCheckpoint(
    job,
    document,
    completedStep
) {
    const id =
        clean(
            job?.subjectId
        );

    if (!id) {
        throw new Error(
            'Atlas worker checkpoint requires a subject ID.'
        );
    }

    ensureGenerationDependencies();

    const validation =
        self.AtlasStructuredSubject
            .validateDocument(
                document
            );

    if (
        !validation ||
        validation.valid !==
            true
    ) {
        throw new Error(
            'Atlas worker refused to checkpoint an invalid Structured Subject.'
        );
    }

    const previous =
        await readBuildCheckpoint(
            id
        );

    if (
        !isObject(previous) ||
        !isObject(
            previous.workingDraft
        ) ||
        !isObject(
            previous.buildState
        )
    ) {
        throw new Error(
            'Atlas worker cannot checkpoint without an existing foreground build journal.'
        );
    }

    const timestamp =
        now();

    const workingDraft = {
        ...cloneJson(
            previous.workingDraft
        ),
        document:
            cloneJson(document),
        updatedAt:
            timestamp
    };

    const buildState = {
        ...cloneJson(
            previous.buildState
        ),
        kind:
            'full-subject',
        completedStep:
            normalizeCompletedStep(
                completedStep
            ),
        autoSaveOnComplete:
            typeof job
                ?.build
                ?.autoSaveOnComplete ===
                'boolean'
                ? job.build
                    .autoSaveOnComplete
                : previous
                    .buildState
                    .autoSaveOnComplete !==
                    false,
        generationContext:
            cloneJson(
                job?.build?.generationContext ||
                previous
                    .buildState
                    .generationContext ||
                null
            ),
        updatedAt:
            timestamp
    };

    const next = {
        schemaVersion:
            Math.max(
                1,
                Math.floor(
                    Number(
                        previous
                            .schemaVersion
                    ) || 1
                )
            ),
        subjectId:
            id,
        workingDraft,
        buildState,
        updatedAt:
            timestamp
    };

    await writeBrowserState(
        buildCheckpointKey(id),
        next
    );

    job.hasCheckpoint = true;
    job.completedStep =
        buildState.completedStep;
    job.updatedAt =
        timestamp;

    publishRuntimeSignal(
        'subject-changed',
        id,
        {
            change:
                'build-checkpoint',
            completedStep:
                buildState
                    .completedStep,
            updatedAt:
                timestamp,
            owner:
                'shared-worker'
        }
    );

    broadcastToUser(
        job.userId,
        'build-checkpoint',
        {
            subjectId:
                id,
            completedStep:
                buildState
                    .completedStep,
            updatedAt:
                timestamp
        }
    );

    publishQueueState(
        job.userId
    );

    return next;
}

async function inspectBuildLock(subjectId) {
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
        } catch { }
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

function normalizeBuildDescriptor(value) {
    const candidate =
        isObject(value)
            ? value
            : {};

    const generationContext =
        normalizeGenerationContext(
            candidate.generationContext
        );

    return {
        generationContext,
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
                        candidate.revision
                    ) || 0
                )
            )
    };
}

function mergeBuildDescriptor(
    previous,
    incoming
) {
    const next =
        normalizeBuildDescriptor(
            incoming
        );

    const current =
        normalizeBuildDescriptor(
            previous
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
                next.revision || 0,
                current.revision || 0
            )
    };
}

async function refreshJobReadiness(job) {
    let checkpoint = null;
    let checkpointError = null;
    let lock = {
        name:
            buildLockName(
                job.subjectId
            ),
        state:
            'unknown'
    };

    try {
        [
            checkpoint,
            lock
        ] =
            await Promise.all([
                readBuildCheckpoint(
                    job.subjectId
                ),
                inspectBuildLock(
                    job.subjectId
                )
            ]);
    } catch (error) {
        checkpointError =
            error;
    }

    job.hasCheckpoint =
        Boolean(
            checkpoint &&
            isObject(checkpoint)
        );

    job.completedStep =
        normalizeCompletedStep(
            checkpoint
                ?.buildState
                ?.completedStep
        );

    job.lockState =
        clean(
            lock?.state
        ) || 'unknown';

    if (
        clean(
            job.foregroundOwnerPageId
        )
    ) {
        job.status =
            activeBuild &&
            activeBuild.userId ===
                job.userId &&
            activeBuild.subjectId ===
                job.subjectId
                ? 'yielding-to-foreground'
                : 'foreground-owned';

        job.error = '';
        job.updatedAt =
            now();

        return {
            checkpoint,
            lock
        };
    }

    if (checkpointError) {
        job.status =
            'checkpoint-error';
        job.error =
            clean(
                checkpointError
                    ?.message ||
                checkpointError
            );
    } else if (!job.hasCheckpoint) {
        job.status =
            'checkpoint-missing';
        job.error = '';
    } else if (
        job.completedStep >= 18
    ) {
        job.status =
            'ready-to-commit';
        job.error = '';
    } else if (
        job.lockState ===
            'unsupported' ||
        job.lockState ===
            'unknown'
    ) {
        job.status =
            'lock-unavailable';
        job.error = '';
    } else if (
        job.lockState ===
            'held' ||
        job.lockState ===
            'pending'
    ) {
        job.status =
            'blocked-by-owner';
        job.error = '';
    } else if (
        !authByUser
            .get(job.userId)
            ?.accessToken
    ) {
        job.status =
            'waiting-auth';
        job.error = '';

        requestAuthForUser(
            job.userId,
            'queue'
        );
    } else {
        job.status =
            'queued';
        job.error = '';
    }

    job.updatedAt =
        now();

    return {
        checkpoint,
        lock
    };
}

function jobHasExecutionContext(job) {
    return Boolean(
        isObject(
            job
                ?.build
                ?.generationContext
        )
    );
}

function jobMayRetry(job) {
    return Boolean(
        job &&
        !clean(
            job.foregroundOwnerPageId
        ) &&
        jobHasExecutionContext(job) &&
        ![
            'ready-to-commit',
            'cancelled',
            'failed',
            'lock-unavailable'
        ].includes(
            job.status
        )
    );
}

function scheduleQueuePump(
    delayMs = 0
) {
    if (queuePumpTimer !== null) {
        return;
    }

    queuePumpTimer =
        self.setTimeout(
            () => {
                queuePumpTimer =
                    null;

                void pumpQueue();
            },
            Math.max(
                0,
                Number(delayMs) || 0
            )
        );
}

function isAuthGenerationError(error) {
    const code =
        clean(
            error?.code
        );

    const message =
        clean(
            error?.message ||
            error
        ).toLowerCase();

    return (
        code ===
            'ATLAS_AI_AUTH_REQUIRED' ||
        message.includes(
            'status 401'
        ) ||
        message.includes(
            'signed-in atlas account'
        )
    );
}

function isForegroundYieldError(error) {
    return (
        clean(
            error?.code
        ) ===
        'ATLAS_WORKER_FOREGROUND_YIELD'
    );
}

function createForegroundYieldError() {
    const error =
        new Error(
            'Atlas worker yielded subject generation to the foreground page.'
        );

    error.code =
        'ATLAS_WORKER_FOREGROUND_YIELD';

    return error;
}

function shouldYieldActiveJob(job) {
    return Boolean(
        activeBuild &&
        activeBuild.userId ===
            job?.userId &&
        activeBuild.subjectId ===
            job?.subjectId &&
        activeBuild.yieldRequested ===
            true
    );
}

async function checkpointForegroundYield(
    job,
    document
) {
    const completedStep =
        normalizeCompletedStep(
            activeBuild
                ?.completedStep ||
            job
                ?.completedStep
        );

    publishDebugTrace(
        job?.userId,
        'foreground-yield-checkpoint-start',
        {
            subjectId:
                job?.subjectId ||
                null,
            requestId:
                clean(
                    activeBuild
                        ?.yieldRequestId
                ) ||
                clean(
                    job
                        ?.foregroundRequestId
                ) ||
                null,
            pageId:
                clean(
                    activeBuild
                        ?.yieldPageId
                ) ||
                clean(
                    job
                        ?.foregroundOwnerPageId
                ) ||
                null,
            completedStep,
            jobCompletedStep:
                normalizeCompletedStep(
                    job?.completedStep
                ),
            lockState:
                job?.lockState ||
                null
        }
    );

    await writeBuildCheckpoint(
        job,
        document,
        completedStep
    );

    publishDebugTrace(
        job?.userId,
        'foreground-yield-checkpoint-written',
        {
            subjectId:
                job?.subjectId ||
                null,
            requestId:
                clean(
                    activeBuild
                        ?.yieldRequestId
                ) ||
                clean(
                    job
                        ?.foregroundRequestId
                ) ||
                null,
            completedStep,
            jobCompletedStep:
                normalizeCompletedStep(
                    job?.completedStep
                ),
            lockState:
                job?.lockState ||
                null
        }
    );

    publishDebugTrace(
        job?.userId,
        'foreground-yield-throw',
        {
            subjectId:
                job?.subjectId ||
                null,
            requestId:
                clean(
                    activeBuild
                        ?.yieldRequestId
                ) ||
                clean(
                    job
                        ?.foregroundRequestId
                ) ||
                null,
            completedStep:
                normalizeCompletedStep(
                    job?.completedStep
                ),
            source:
                'checkpoint-foreground-yield'
        }
    );

    throw createForegroundYieldError();
}

function configureAIForJob(job) {
    self.AtlasAI
        .configureRuntime({
            getAccessToken() {
                return (
                    authByUser
                        .get(job.userId)
                        ?.accessToken ||
                    ''
                );
            },

            getSubjectId() {
                return job.subjectId;
            },

            getGenerationContext() {
                return (
                    job
                        .build
                        .generationContext ||
                    {}
                );
            },

            fetch:
                typeof self.fetch ===
                    'function'
                    ? self.fetch
                        .bind(self)
                    : null
        });
}

function clearAIWorkerRuntime() {
    try {
        self.AtlasAI
            ?.configureRuntime?.({
                getAccessToken:
                    null,
                getSubjectId:
                    null,
                getGenerationContext:
                    null,
                fetch:
                    null
            });
    } catch { }
}

function createWorkerOperations(
    job,
    getDocument,
    commitDocument
) {
    const Operations =
        self
            .AtlasSubjectBuildDocumentOperations
            .create({
                ai:
                    self.AtlasAI,
                structured:
                    self
                        .AtlasStructuredSubject,

                getDocument,

                commit(mutator) {
                    const current =
                        cloneJson(
                            getDocument()
                        );

                    const result =
                        mutator(
                            current,
                            {}
                        );

                    if (!result) {
                        return null;
                    }

                    commitDocument(
                        current
                    );

                    return result;
                }
            });

    const yieldBeforeOperation =
        async () => {
            if (
                shouldYieldActiveJob(
                    job
                )
            ) {
                await checkpointForegroundYield(
                    job,
                    getDocument()
                );
            }
        };

    return {
        generateSubjectFraming:
            async () => {
                await yieldBeforeOperation();

                return Operations
                    .generateSubjectFraming();
            },

        generateOverview:
            async () => {
                await yieldBeforeOperation();

                return Operations
                    .generateOverview();
            },

        enrichCurrentAffairs:
            async () => {
                await yieldBeforeOperation();

                const result =
                    await Operations
                        .generateCurrentAffairsReading({
                            generationContext:
                                job
                                    .build
                                    .generationContext ||
                                {}
                        });

                if (
                    result &&
                    result.alreadyComplete !==
                        true &&
                    isObject(
                        result.generationContext
                    )
                ) {
                    job.build
                        .generationContext =
                        cloneJson(
                            result
                                .generationContext
                        );
                }

                if (
                    shouldYieldActiveJob(
                        job
                    )
                ) {
                    await checkpointForegroundYield(
                        job,
                        getDocument()
                    );
                }

                return true;
            },

        generateDiscussionFraming:
            async () => {
                await yieldBeforeOperation();

                return Operations
                    .generateDiscussionFraming();
            },

        generateDiscussionSet:
            async ({ brief }) => {
                await yieldBeforeOperation();

                return Operations
                    .generateDiscussionSet({
                        brief
                    });
            },

        generateCulturalLensFraming:
            async () => {
                await yieldBeforeOperation();

                return Operations
                    .generateCulturalLensFraming();
            },

        generateCulturalLensCard:
            async () => {
                await yieldBeforeOperation();

                return Operations
                    .generateCulturalLensCard();
            },

        generateReflection:
            async () => {
                await yieldBeforeOperation();

                return Operations
                    .generateReflection();
            },

        enrichDiscussion:
            async ({
                languageSupport
            }) => {
                await yieldBeforeOperation();

                const result =
                    await Operations
                        .enrichDiscussion({
                            languageMode:
                                languageSupport,
                            subjectSize:
                                clean(
                                    job
                                        .build
                                        .generationContext
                                        ?.subjectSize
                                ) ||
                                'standard',
                            shouldStop:
                                () =>
                                    shouldYieldActiveJob(
                                        job
                                    )
                        });

                if (
                    result?.stopped ===
                        true &&
                    shouldYieldActiveJob(
                        job
                    )
                ) {
                    await checkpointForegroundYield(
                        job,
                        getDocument()
                    );
                }

                return (
                    result?.complete ===
                    true
                );
            },

        enrichCulturalLens:
            async ({
                languageSupport
            }) => {
                await yieldBeforeOperation();

                const result =
                    await Operations
                        .enrichCulturalLens({
                            languageMode:
                                languageSupport,
                            subjectSize:
                                clean(
                                    job
                                        .build
                                        .generationContext
                                        ?.subjectSize
                                ) ||
                                'standard',
                            shouldStop:
                                () =>
                                    shouldYieldActiveJob(
                                        job
                                    )
                        });

                if (
                    result?.stopped ===
                        true &&
                    shouldYieldActiveJob(
                        job
                    )
                ) {
                    await checkpointForegroundYield(
                        job,
                        getDocument()
                    );
                }

                return (
                    result?.complete ===
                    true
                );
            }
    };
}

async function executeBuild(job) {
    ensureGenerationDependencies();

    const latest =
        await readBuildCheckpoint(
            job.subjectId
        );

    if (
        !isObject(latest) ||
        !isObject(
            latest.workingDraft
        ) ||
        !isObject(
            latest.workingDraft
                .document
        ) ||
        !isObject(
            latest.buildState
        )
    ) {
        throw new Error(
            'Atlas worker cannot resume without a valid build checkpoint.'
        );
    }

    let document =
        cloneJson(
            latest
                .workingDraft
                .document
        );

    const validation =
        self.AtlasStructuredSubject
            .validateDocument(
                document
            );

    if (
        !validation ||
        validation.valid !==
            true
    ) {
        throw new Error(
            'Atlas worker checkpoint contains an invalid Structured Subject.'
        );
    }

    const checkpointGenerationContext =
        normalizeGenerationContext(
            latest
                .buildState
                .generationContext
        );

    if (checkpointGenerationContext) {
        job.build = {
            ...normalizeBuildDescriptor(
                job.build
            ),
            generationContext:
                checkpointGenerationContext
        };
    }

    const resumeFromStep =
        normalizeCompletedStep(
            latest
                .buildState
                .completedStep
        );

    if (resumeFromStep >= 18) {
        job.status =
            'ready-to-commit';
        job.completedStep =
            18;
        job.updatedAt =
            now();
        publishQueueState(
            job.userId
        );
        return {
            completedStep: 18,
            complete: true
        };
    }

    configureAIForJob(job);

    activeBuild = {
        userId:
            job.userId,
        subjectId:
            job.subjectId,
        completedStep:
            resumeFromStep,
        progress: null,
        cancelRequested:
            false,
        yieldRequested:
            Boolean(
                clean(
                    job.foregroundOwnerPageId
                )
            ),
        yieldPageId:
            clean(
                job.foregroundOwnerPageId
            ),
        yieldRequestId:
            clean(
                job.foregroundRequestId
            )
    };

    job.status =
        'building';
    job.completedStep =
        resumeFromStep;
    job.progress = null;
    job.updatedAt =
        now();

    publishQueueState(
        job.userId
    );

    broadcastToUser(
        job.userId,
        'build-started',
        {
            subjectId:
                job.subjectId,
            completedStep:
                resumeFromStep
        }
    );

    const stopHeartbeat =
        startActiveBuildHeartbeat();

    try {
        const result =
            await self
                .AtlasSubjectBuildRunner
                .run({
                    resumeFromStep,
                    subjectSize:
                        clean(
                            job
                                .build
                                .generationContext
                                ?.subjectSize
                        ) ||
                        'standard',
                    languageSupport:
                        clean(
                            job
                                .build
                                .generationContext
                                ?.languageSupport
                        ) ||
                        'key',

                    operations:
                        createWorkerOperations(
                            job,
                            () =>
                                document,
                            nextDocument => {
                                document =
                                    cloneJson(
                                        nextDocument
                                    );
                            }
                        ),

                    onProgress:
                        ({
                            current,
                            total,
                            label
                        }) => {
                            if (!activeBuild) {
                                return;
                            }

                            activeBuild.progress = {
                                current:
                                    Number(
                                        current
                                    ) ||
                                    null,
                                total:
                                    Number(
                                        total
                                    ) ||
                                    9,
                                label:
                                    clean(label)
                            };

                            job.progress =
                                cloneJson(
                                    activeBuild.progress
                                );

                            job.updatedAt =
                                now();

                            publishActiveBuildHeartbeat();
                            publishQueueState(
                                job.userId
                            );
                        },

                    onCheckpoint:
                        async step => {
                            await writeBuildCheckpoint(
                                job,
                                document,
                                step
                            );

                            if (activeBuild) {
                                activeBuild.completedStep =
                                    normalizeCompletedStep(
                                        step
                                    );
                            }

                            if (
                                activeBuild
                                    ?.yieldRequested
                            ) {
                                publishDebugTrace(
                                    job.userId,
                                    'foreground-yield-runner-checkpoint',
                                    {
                                        subjectId:
                                            job.subjectId,
                                        requestId:
                                            clean(
                                                activeBuild
                                                    .yieldRequestId
                                            ) ||
                                            clean(
                                                job.foregroundRequestId
                                            ) ||
                                            null,
                                        pageId:
                                            clean(
                                                activeBuild
                                                    .yieldPageId
                                            ) ||
                                            clean(
                                                job.foregroundOwnerPageId
                                            ) ||
                                            null,
                                        completedStep:
                                            normalizeCompletedStep(
                                                step
                                            ),
                                        jobCompletedStep:
                                            normalizeCompletedStep(
                                                job.completedStep
                                            ),
                                        lockState:
                                            job.lockState
                                    }
                                );

                                publishDebugTrace(
                                    job.userId,
                                    'foreground-yield-throw',
                                    {
                                        subjectId:
                                            job.subjectId,
                                        requestId:
                                            clean(
                                                activeBuild
                                                    .yieldRequestId
                                            ) ||
                                            clean(
                                                job.foregroundRequestId
                                            ) ||
                                            null,
                                        completedStep:
                                            normalizeCompletedStep(
                                                step
                                            ),
                                        source:
                                            'runner-checkpoint'
                                    }
                                );

                                throw createForegroundYieldError();
                            }

                            if (
                                activeBuild
                                    ?.cancelRequested
                            ) {
                                const error =
                                    new Error(
                                        'Atlas worker build was cancelled after checkpoint.'
                                    );

                                error.code =
                                    'ATLAS_WORKER_BUILD_CANCELLED';

                                throw error;
                            }
                        }
                });

        job.status =
            result.complete
                ? 'ready-to-commit'
                : 'queued';

        job.completedStep =
            normalizeCompletedStep(
                result.completedStep
            );

        job.progress =
            null;
        job.updatedAt =
            now();

        broadcastToUser(
            job.userId,
            'build-ready',
            {
                subjectId:
                    job.subjectId,
                completedStep:
                    job.completedStep,
                generationContext:
                    cloneJson(
                        job
                            .build
                            .generationContext
                    )
            }
        );

        publishQueueState(
            job.userId
        );

        return result;
    } finally {
        stopHeartbeat(
            job.completedStep >= 18
                ? 'generation-complete'
                : 'generation-ended'
        );

        clearAIWorkerRuntime();

        activeBuild = null;
    }
}

async function runJobWithLock(job) {
    const Locks =
        self.navigator?.locks;

    if (
        !Locks ||
        typeof Locks.request !==
            'function'
    ) {
        job.status =
            'lock-unavailable';
        job.lockState =
            'unsupported';
        job.updatedAt =
            now();

        publishQueueState(
            job.userId
        );

        return false;
    }

    let acquired =
        false;

    await Locks.request(
        buildLockName(
            job.subjectId
        ),
        {
            mode:
                'exclusive',
            ifAvailable:
                true
        },
        async lock => {
            if (!lock) {
                return;
            }

            acquired = true;
            job.lockState =
                'held-by-worker';
            job.updatedAt =
                now();

            try {
                await executeBuild(
                    job
                );
            } catch (error) {
                if (
                    isForegroundYieldError(
                        error
                    )
                ) {
                    publishDebugTrace(
                        job.userId,
                        'foreground-yield-caught',
                        {
                            subjectId:
                                job.subjectId,
                            requestId:
                                clean(
                                    job.foregroundRequestId
                                ) ||
                                null,
                            pageId:
                                clean(
                                    job.foregroundOwnerPageId
                                ) ||
                                null,
                            completedStep:
                                normalizeCompletedStep(
                                    job.completedStep
                                ),
                            lockState:
                                job.lockState
                        }
                    );

                    job.status =
                        'foreground-owned';
                    job.error = '';
                    job.progress =
                        null;
                    job.updatedAt =
                        now();

                    publishQueueState(
                        job.userId
                    );
                } else {
                    if (
                        error?.code ===
                            'ATLAS_WORKER_BUILD_CANCELLED'
                    ) {
                        job.status =
                            'cancelled';
                    } else if (
                        isAuthGenerationError(
                            error
                        )
                    ) {
                        job.status =
                            'waiting-auth';

                        requestAuthForUser(
                            job.userId,
                            'generation-auth'
                        );
                    } else {
                        job.status =
                            'failed';
                    }

                    job.error =
                        clean(
                            error?.message ||
                            error
                        );

                    job.progress =
                        null;
                    job.updatedAt =
                        now();

                    broadcastToUser(
                        job.userId,
                        'build-failed',
                        {
                            subjectId:
                                job.subjectId,
                            completedStep:
                                job.completedStep,
                            retryable:
                                job.status ===
                                    'waiting-auth',
                            error:
                                job.error
                        }
                    );

                    publishQueueState(
                        job.userId
                    );
                }
            } finally {
                job.lockState =
                    'available';

                publishDebugTrace(
                    job.userId,
                    'foreground-lock-callback-leaving',
                    {
                        subjectId:
                            job.subjectId,
                        requestId:
                            clean(
                                job.foregroundRequestId
                            ) ||
                            null,
                        pageId:
                            clean(
                                job.foregroundOwnerPageId
                            ) ||
                            null,
                        completedStep:
                            normalizeCompletedStep(
                                job.completedStep
                            ),
                        lockState:
                            job.lockState,
                        webLockCallbackActive:
                            true
                    }
                );
            }
        }
    );

    publishDebugTrace(
        job.userId,
        'foreground-lock-request-resolved',
        {
            subjectId:
                job.subjectId,
            requestId:
                clean(
                    job.foregroundRequestId
                ) ||
                null,
            pageId:
                clean(
                    job.foregroundOwnerPageId
                ) ||
                null,
            acquired,
            completedStep:
                normalizeCompletedStep(
                    job.completedStep
                ),
            lockState:
                job.lockState,
            hasForegroundOwner:
                Boolean(
                    clean(
                        job.foregroundOwnerPageId
                    )
                )
        }
    );

    if (
        acquired &&
        clean(
            job.foregroundOwnerPageId
        )
    ) {
        publishDebugTrace(
            job.userId,
            'foreground-grant-finalize-call',
            {
                subjectId:
                    job.subjectId,
                requestId:
                    clean(
                        job.foregroundRequestId
                    ) ||
                    null,
                pageId:
                    clean(
                        job.foregroundOwnerPageId
                    ) ||
                    null,
                completedStep:
                    normalizeCompletedStep(
                        job.completedStep
                    ),
                lockState:
                    job.lockState
            }
        );

        finalizeForegroundGrant(
            job
        );
    }

    if (!acquired) {
        job.status =
            'blocked-by-owner';
        job.lockState =
            'held';
        job.updatedAt =
            now();
    }

    publishQueueState(
        job.userId
    );

    return acquired;
}

async function pumpQueue() {
    if (
        queuePumping ||
        activeBuild
    ) {
        return;
    }

    queuePumping = true;

    try {
        for (
            const key of
            queueOrder
        ) {
            const job =
                queueByKey.get(key);

            if (
                !job ||
                !jobHasExecutionContext(
                    job
                ) ||
                [
                    'ready-to-commit',
                    'cancelled',
                    'failed',
                    'lock-unavailable'
                ].includes(
                    job.status
                )
            ) {
                continue;
            }

            await refreshJobReadiness(
                job
            );

            publishQueueState(
                job.userId
            );

            if (
                job.status !==
                    'queued'
            ) {
                continue;
            }

            await runJobWithLock(
                job
            );

            break;
        }
    } finally {
        queuePumping =
            false;

        if (
            Array.from(
                queueByKey.values()
            ).some(
                job =>
                    jobMayRetry(job)
            )
        ) {
            scheduleQueuePump(
                QUEUE_RETRY_MS
            );
        }
    }
}

async function enqueueSubject(
    connection,
    message
) {
    const userId =
        clean(
            connection?.userId
        );

    const id =
        clean(
            message?.subjectId
        );

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

    const job = {
        userId,
        subjectId:
            id,
        status:
            existing?.status ||
            'inspecting',
        hasCheckpoint:
            existing
                ?.hasCheckpoint ||
            false,
        completedStep:
            normalizeCompletedStep(
                existing
                    ?.completedStep
            ),
        lockState:
            existing
                ?.lockState ||
            'unknown',
        progress:
            cloneJson(
                existing
                    ?.progress ||
                null
            ),
        build:
            mergeBuildDescriptor(
                existing?.build,
                message?.build
            ),
        error:
            existing?.error ||
            '',
        foregroundOwnerPageId:
            clean(
                existing
                    ?.foregroundOwnerPageId
            ),
        foregroundRequestId:
            clean(
                existing
                    ?.foregroundRequestId
            ),
        foregroundReason:
            clean(
                existing
                    ?.foregroundReason
            ),
        enqueuedAt:
            existing
                ?.enqueuedAt ||
            now(),
        updatedAt:
            now()
    };

    queueByKey.set(
        key,
        job
    );

    if (
        !queueOrder.includes(key)
    ) {
        queueOrder.push(key);
    }

    await refreshJobReadiness(
        job
    );

    safePost(
        connection.port,
        'checkpoint-read',
        {
            subjectId:
                id,
            hasCheckpoint:
                job.hasCheckpoint,
            completedStep:
                job.completedStep,
            error:
                job.status ===
                    'checkpoint-error'
                    ? job.error
                    : null
        }
    );

    publishQueueState(
        userId
    );

    if (
        jobHasExecutionContext(
            job
        )
    ) {
        scheduleQueuePump();
    }

    return job;
}

function requestForegroundOwnership(
    connection,
    message
) {
    const userId =
        clean(
            connection?.userId
        );

    const subjectId =
        clean(
            message?.subjectId
        );

    const requestId =
        clean(
            message?.requestId
        );

    if (
        !userId ||
        !subjectId ||
        !requestId
    ) {
        safePost(
            connection?.port,
            'foreground-denied',
            {
                requestId:
                    requestId ||
                    null,
                subjectId:
                    subjectId ||
                    null,
                reason:
                    !userId
                        ? 'auth-required'
                        : 'invalid-request'
            }
        );

        return false;
    }

    const key =
        queueKey(
            userId,
            subjectId
        );

    const job =
        queueByKey.get(key);

    postDebugTrace(
        connection,
        'foreground-request-received',
        {
            requestId,
            subjectId,
            pageId:
                clean(
                    connection.pageId
                ) ||
                null,
            jobFound:
                Boolean(job),
            jobStatus:
                job?.status ||
                null,
            completedStep:
                job
                    ? normalizeCompletedStep(
                        job.completedStep
                    )
                    : null,
            lockState:
                job?.lockState ||
                null,
            foregroundOwnerPageId:
                clean(
                    job
                        ?.foregroundOwnerPageId
                ) ||
                null,
            activeBuildExists:
                Boolean(activeBuild),
            activeBuildMatches:
                Boolean(
                    activeBuild &&
                    activeBuild.userId ===
                        userId &&
                    activeBuild.subjectId ===
                        subjectId
                ),
            activeBuildCompletedStep:
                activeBuild
                    ? normalizeCompletedStep(
                        activeBuild.completedStep
                    )
                    : null
        }
    );

    if (!job) {
        safePost(
            connection.port,
            'foreground-granted',
            {
                requestId,
                subjectId,
                completedStep:
                    null,
                readyToCommit:
                    false,
                generationContext:
                    null,
                noWorkerJob:
                    true
            }
        );

        return true;
    }

    const currentOwner =
        clean(
            job.foregroundOwnerPageId
        );

    if (
        currentOwner &&
        currentOwner !==
            clean(
                connection.pageId
            )
    ) {
        safePost(
            connection.port,
            'foreground-denied',
            {
                requestId,
                subjectId,
                reason:
                    'foreground-owned-elsewhere'
            }
        );

        return false;
    }

    job.foregroundOwnerPageId =
        clean(
            connection.pageId
        );

    job.foregroundRequestId =
        requestId;

    job.foregroundReason =
        clean(
            message?.reason
        ) ||
        'subject-open';

    job.updatedAt =
        now();

    const workerOwnsSubject =
        (
            activeBuild &&
            activeBuild.userId ===
                userId &&
            activeBuild.subjectId ===
                subjectId
        ) ||
        job.lockState ===
            'held-by-worker';

    if (workerOwnsSubject) {
        job.status =
            'yielding-to-foreground';

        if (
            activeBuild &&
            activeBuild.userId ===
                userId &&
            activeBuild.subjectId ===
                subjectId
        ) {
            activeBuild.yieldRequested =
                true;
            activeBuild.yieldPageId =
                job.foregroundOwnerPageId;
            activeBuild.yieldRequestId =
                requestId;

            publishDebugTrace(
                userId,
                'foreground-yield-requested',
                {
                    subjectId,
                    requestId,
                    pageId:
                        clean(
                            job.foregroundOwnerPageId
                        ) ||
                        null,
                    jobStatus:
                        job.status,
                    completedStep:
                        normalizeCompletedStep(
                            job.completedStep
                        ),
                    activeBuildCompletedStep:
                        normalizeCompletedStep(
                            activeBuild.completedStep
                        ),
                    lockState:
                        job.lockState,
                    yieldRequested:
                        activeBuild
                            .yieldRequested ===
                        true
                }
            );
        }

        safePost(
            connection.port,
            'foreground-yield-pending',
            {
                requestId,
                subjectId,
                completedStep:
                    normalizeCompletedStep(
                        job.completedStep
                    )
            }
        );

        publishQueueState(
            userId
        );

        return true;
    }

    job.status =
        'foreground-owned';

    finalizeForegroundGrant(
        job
    );

    return true;
}

function releaseForegroundOwnership(
    connection,
    message
) {
    const userId =
        clean(
            connection?.userId
        );

    const subjectId =
        clean(
            message?.subjectId
        );

    if (
        !userId ||
        !subjectId
    ) {
        return false;
    }

    const job =
        queueByKey.get(
            queueKey(
                userId,
                subjectId
            )
        );

    if (
        !job ||
        clean(
            job.foregroundOwnerPageId
        ) !==
            clean(
                connection.pageId
            )
    ) {
        return false;
    }

    job.foregroundOwnerPageId = '';
    job.foregroundRequestId = '';
    job.foregroundReason =
        clean(
            message?.reason
        ) ||
        'foreground-release';
    job.updatedAt =
        now();

    job.status =
        job.completedStep >= 18
            ? 'ready-to-commit'
            : 'queued';

    safePost(
        connection.port,
        'foreground-released',
        {
            subjectId,
            completedStep:
                normalizeCompletedStep(
                    job.completedStep
                )
        }
    );

    publishQueueState(
        userId
    );

    scheduleQueuePump();

    return true;
}

function cancelSubject(
    connection,
    message
) {
    const userId =
        clean(
            connection?.userId
        );

    const subjectId =
        clean(
            message?.subjectId
        );

    if (
        !userId ||
        !subjectId
    ) {
        return false;
    }

    if (
        activeBuild &&
        activeBuild.userId ===
            userId &&
        activeBuild.subjectId ===
            subjectId
    ) {
        activeBuild.cancelRequested =
            true;

        safePost(
            connection.port,
            'cancel-pending',
            {
                subjectId
            }
        );

        return true;
    }

    const key =
        queueKey(
            userId,
            subjectId
        );

    queueByKey.delete(
        key
    );

    const index =
        queueOrder.indexOf(
            key
        );

    if (index >= 0) {
        queueOrder.splice(
            index,
            1
        );
    }

    publishQueueState(
        userId
    );

    safePost(
        connection.port,
        'subject-cancelled',
        {
            subjectId,
            reason:
                clean(
                    message?.reason
                ) ||
                'cancelled'
        }
    );

    return true;
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
                    requestId ||
                    null,
                subjectId:
                    subjectId ||
                    null,
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
                    clean(
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
                ) ||
                null,
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
                ) ||
                null
        }
    );

    scheduleQueuePump();
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
        isObject(
            event?.data
        )
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
            ) ||
            'atlas';

        connection.visible =
            message.visible !==
            false;

        postDebugTrace(
            connection,
            'connection-connect',
            {
                pageId:
                    connection.pageId ||
                    null,
                surface:
                    connection.surface ||
                    null,
                visible:
                    connection.visible,
                pageCount:
                    connections.size
            }
        );

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
            message
        );

        return;
    }

    if (
        type ===
            'request-foreground-ownership'
    ) {
        requestForegroundOwnership(
            connection,
            message
        );

        return;
    }

    if (
        type ===
            'release-foreground-ownership'
    ) {
        releaseForegroundOwnership(
            connection,
            message
        );

        return;
    }

    if (type === 'cancel-subject') {
        cancelSubject(
            connection,
            message
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
                    ) ||
                    null,
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
                    queueByKey.size,
                activeSubjectId:
                    activeBuild
                        ?.subjectId ||
                    null
            }
        );

        if (
            !activeBuild &&
            Array.from(
                queueByKey.values()
            ).some(
                job =>
                    jobMayRetry(job)
            )
        ) {
            scheduleQueuePump();
        }
    },
    WORKER_HEARTBEAT_MS
);
