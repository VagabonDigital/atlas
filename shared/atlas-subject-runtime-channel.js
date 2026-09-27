/* ============================================================
   ATLAS SUBJECT RUNTIME CHANNEL
   Same-browser coordination for live owned-subject work.

   Durable subject lifecycle stays in account storage.
   This channel is transient only: liveness, cross-tab change
   notifications, and a same-origin generation lease.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasSubjectRuntimeChannel) return;

    const CHANNEL_NAME =
        'atlas-subject-runtime-v1';
    const STORAGE_SIGNAL_KEY =
        'atlas::subjectRuntimeSignal::v1';
    const HEARTBEAT_INTERVAL_MS = 1500;
    const HEARTBEAT_STALE_MS = 4500;
    const PROBE_WAIT_MS = 160;
    const CLAIM_WAIT_MS = 90;
    const CLAIM_STALE_MS = 1200;

    const instanceId =
        window.crypto &&
        typeof window.crypto.randomUUID === 'function'
            ? window.crypto.randomUUID()
            : `runtime-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`;

    const listeners = new Set();
    const localBuilds = new Map();
    const remoteBuilds = new Map();
    const softClaims = new Map();

    let channel = null;

    try {
        if (typeof window.BroadcastChannel === 'function') {
            channel =
                new window.BroadcastChannel(
                    CHANNEL_NAME
                );
        }
    } catch {
        channel = null;
    }

    function cleanSubjectId(value) {
        return String(value || '').trim();
    }

    function cloneDetail(value) {
        if (
            !value ||
            typeof value !== 'object' ||
            Array.isArray(value)
        ) {
            return {};
        }

        try {
            return JSON.parse(
                JSON.stringify(value)
            );
        } catch {
            return {};
        }
    }

    function normalizeMessage(message) {
        if (
            !message ||
            typeof message !== 'object' ||
            Array.isArray(message)
        ) {
            return null;
        }

        const type =
            String(message.type || '').trim();
        const subjectId =
            cleanSubjectId(message.subjectId);
        const sourceId =
            String(message.sourceId || '').trim();
        const sentAt =
            Math.max(
                0,
                Number(message.sentAt) || 0
            );

        if (
            !type ||
            !subjectId ||
            !sourceId ||
            !sentAt
        ) {
            return null;
        }

        return {
            version: 1,
            type,
            subjectId,
            sourceId,
            sentAt,
            detail:
                cloneDetail(message.detail)
        };
    }

    function getRemoteBuildBucket(subjectId) {
        const id = cleanSubjectId(subjectId);

        if (!remoteBuilds.has(id)) {
            remoteBuilds.set(
                id,
                new Map()
            );
        }

        return remoteBuilds.get(id);
    }

    function getClaimBucket(subjectId) {
        const id = cleanSubjectId(subjectId);

        if (!softClaims.has(id)) {
            softClaims.set(
                id,
                new Map()
            );
        }

        return softClaims.get(id);
    }

    function prune() {
        const now = Date.now();

        remoteBuilds.forEach(
            (bucket, subjectId) => {
                bucket.forEach(
                    (record, sourceId) => {
                        if (
                            now - record.sentAt >
                            HEARTBEAT_STALE_MS
                        ) {
                            bucket.delete(sourceId);
                        }
                    }
                );

                if (bucket.size === 0) {
                    remoteBuilds.delete(subjectId);
                }
            }
        );

        softClaims.forEach(
            (bucket, subjectId) => {
                bucket.forEach(
                    (sentAt, sourceId) => {
                        if (
                            now - sentAt >
                            CLAIM_STALE_MS
                        ) {
                            bucket.delete(sourceId);
                        }
                    }
                );

                if (bucket.size === 0) {
                    softClaims.delete(subjectId);
                }
            }
        );
    }

    function dispatch(message) {
        const event =
            new CustomEvent(
                'atlas:subject-runtime-message',
                {
                    detail: message
                }
            );

        window.dispatchEvent(event);

        listeners.forEach(listener => {
            try {
                listener(message);
            } catch (error) {
                console.warn(
                    '[AtlasSubjectRuntimeChannel] listener failed:',
                    error
                );
            }
        });
    }

    function transmit(message) {
        if (channel) {
            try {
                channel.postMessage(message);
                return;
            } catch { }
        }

        try {
            localStorage.setItem(
                STORAGE_SIGNAL_KEY,
                JSON.stringify(message)
            );
            localStorage.removeItem(
                STORAGE_SIGNAL_KEY
            );
        } catch { }
    }

    function publish(
        type,
        subjectId,
        detail = {}
    ) {
        const id = cleanSubjectId(subjectId);

        if (!id) return null;

        const message = {
            version: 1,
            type,
            subjectId: id,
            sourceId: instanceId,
            sentAt: Date.now(),
            detail: cloneDetail(detail)
        };

        handleMessage(
            message,
            false
        );
        transmit(message);

        return message;
    }

    function publishLocalHeartbeat(
        subjectId,
        detail = {}
    ) {
        const id = cleanSubjectId(subjectId);
        const build = localBuilds.get(id);

        if (!build) return null;

        let dynamicDetail = {};

        try {
            dynamicDetail =
                typeof build.getDetail === 'function'
                    ? cloneDetail(
                        build.getDetail()
                    )
                    : {};
        } catch { }

        return publish(
            'build-heartbeat',
            id,
            {
                ...dynamicDetail,
                ...cloneDetail(detail)
            }
        );
    }

    function handleMessage(
        rawMessage,
        remote = true
    ) {
        const message =
            normalizeMessage(rawMessage);

        if (!message) return;

        if (
            remote &&
            message.sourceId === instanceId
        ) {
            return;
        }

        prune();

        if (
            message.type ===
            'build-heartbeat'
        ) {
            if (
                message.sourceId !== instanceId
            ) {
                getRemoteBuildBucket(
                    message.subjectId
                ).set(
                    message.sourceId,
                    {
                        sentAt:
                            message.sentAt,
                        detail:
                            message.detail
                    }
                );
            }
        } else if (
            message.type ===
            'build-stop'
        ) {
            const bucket =
                remoteBuilds.get(
                    message.subjectId
                );

            bucket?.delete(
                message.sourceId
            );

            if (
                bucket &&
                bucket.size === 0
            ) {
                remoteBuilds.delete(
                    message.subjectId
                );
            }
        } else if (
            message.type ===
            'build-probe'
        ) {
            if (
                message.sourceId !== instanceId &&
                localBuilds.has(
                    message.subjectId
                )
            ) {
                publishLocalHeartbeat(
                    message.subjectId,
                    {
                        respondingTo:
                            message.detail?.probeId ||
                            ''
                    }
                );
            }
        } else if (
            message.type ===
            'build-claim'
        ) {
            getClaimBucket(
                message.subjectId
            ).set(
                message.sourceId,
                message.sentAt
            );
        }

        dispatch(message);
    }

    if (channel) {
        channel.addEventListener(
            'message',
            event => {
                handleMessage(
                    event?.data,
                    true
                );
            }
        );
    } else {
        window.addEventListener(
            'storage',
            event => {
                if (
                    event?.key !==
                        STORAGE_SIGNAL_KEY ||
                    !event.newValue
                ) {
                    return;
                }

                try {
                    handleMessage(
                        JSON.parse(
                            event.newValue
                        ),
                        true
                    );
                } catch { }
            }
        );
    }

    function subscribe(listener) {
        if (typeof listener !== 'function') {
            return () => {};
        }

        listeners.add(listener);

        return () => {
            listeners.delete(listener);
        };
    }

    function getActiveBuild(subjectId) {
        const id = cleanSubjectId(subjectId);

        if (!id) return null;

        prune();

        const bucket =
            remoteBuilds.get(id);

        if (!bucket?.size) {
            return null;
        }

        let newest = null;

        bucket.forEach(
            (record, sourceId) => {
                if (
                    !newest ||
                    record.sentAt >
                        newest.sentAt
                ) {
                    newest = {
                        subjectId: id,
                        sourceId,
                        sentAt:
                            record.sentAt,
                        detail:
                            cloneDetail(
                                record.detail
                            )
                    };
                }
            }
        );

        return newest;
    }

    function isBuildActive(subjectId) {
        return Boolean(
            getActiveBuild(subjectId)
        );
    }

    async function probeActiveBuild(
        subjectId,
        {
            timeoutMs =
                PROBE_WAIT_MS
        } = {}
    ) {
        const id = cleanSubjectId(subjectId);

        if (!id) return false;

        if (isBuildActive(id)) {
            return true;
        }

        const probeId =
            `${instanceId}:${Date.now()}:${Math.random()
                .toString(36)
                .slice(2)}`;

        publish(
            'build-probe',
            id,
            { probeId }
        );

        await new Promise(resolve => {
            window.setTimeout(
                resolve,
                Math.max(
                    0,
                    Number(timeoutMs) ||
                        PROBE_WAIT_MS
                )
            );
        });

        return isBuildActive(id);
    }

    async function acquireFallbackLease(
        subjectId
    ) {
        const id = cleanSubjectId(subjectId);

        if (
            await probeActiveBuild(id)
        ) {
            return {
                acquired: false,
                release() {}
            };
        }

        const bucket =
            getClaimBucket(id);

        bucket.set(
            instanceId,
            Date.now()
        );

        publish(
            'build-claim',
            id
        );

        await new Promise(resolve => {
            window.setTimeout(
                resolve,
                CLAIM_WAIT_MS
            );
        });

        prune();

        const contenders =
            Array.from(
                getClaimBucket(id)
                    .keys()
            ).sort();

        const acquired =
            contenders[0] === instanceId;

        if (!acquired) {
            bucket.delete(instanceId);
        }

        let released = false;

        return {
            acquired,
            release() {
                if (released) return;
                released = true;
                bucket.delete(instanceId);
            }
        };
    }

    async function acquireBuildLease(
        subjectId
    ) {
        const id = cleanSubjectId(subjectId);

        if (!id) {
            return {
                acquired: false,
                release() {}
            };
        }

        if (
            navigator.locks &&
            typeof navigator.locks.request ===
                'function'
        ) {
            let releaseHold = null;
            let settleAcquired = null;
            let settled = false;

            const hold =
                new Promise(resolve => {
                    releaseHold = resolve;
                });

            const acquired =
                new Promise(resolve => {
                    settleAcquired = value => {
                        if (settled) return;
                        settled = true;
                        resolve(value);
                    };
                });

            navigator.locks.request(
                `atlas-subject-build:${id}`,
                {
                    mode: 'exclusive',
                    ifAvailable: true
                },
                async lock => {
                    if (!lock) {
                        settleAcquired({
                            acquired: false,
                            release() {}
                        });
                        return;
                    }

                    let released = false;

                    settleAcquired({
                        acquired: true,
                        release() {
                            if (released) return;
                            released = true;
                            releaseHold();
                        }
                    });

                    await hold;
                }
            ).catch(error => {
                console.warn(
                    '[AtlasSubjectRuntimeChannel] build lock failed; using channel fallback:',
                    error
                );

                settleAcquired(null);
            });

            const lease =
                await acquired;

            if (lease) {
                return lease;
            }
        }

        return acquireFallbackLease(id);
    }

    function startBuildHeartbeat(
        subjectId,
        getDetail = null
    ) {
        const id = cleanSubjectId(subjectId);

        if (!id) {
            return () => {};
        }

        const existing =
            localBuilds.get(id);

        if (existing) {
            window.clearInterval(
                existing.timerId
            );
        }

        const record = {
            getDetail:
                typeof getDetail === 'function'
                    ? getDetail
                    : null,
            timerId: null
        };

        localBuilds.set(
            id,
            record
        );

        publishLocalHeartbeat(id);

        record.timerId =
            window.setInterval(
                () => {
                    publishLocalHeartbeat(id);
                },
                HEARTBEAT_INTERVAL_MS
            );

        let stopped = false;

        return (
            reason = 'ended'
        ) => {
            if (stopped) return;
            stopped = true;

            const active =
                localBuilds.get(id);

            if (active === record) {
                window.clearInterval(
                    record.timerId
                );
                localBuilds.delete(id);
            }

            publish(
                'build-stop',
                id,
                { reason }
            );
        };
    }

    function pulseBuildHeartbeat(
        subjectId,
        detail = {}
    ) {
        return publishLocalHeartbeat(
            subjectId,
            detail
        );
    }

    function publishSubjectChanged(
        subjectId,
        detail = {}
    ) {
        return publish(
            'subject-changed',
            subjectId,
            detail
        );
    }

    function publishLifecycleSignal(
        type
    ) {
        localBuilds.forEach(
            (
                _record,
                subjectId
            ) => {
                if (type === 'resume') {
                    publishLocalHeartbeat(
                        subjectId
                    );
                } else {
                    publish(
                        'build-stop',
                        subjectId,
                        {
                            reason:
                                type
                        }
                    );
                }
            }
        );
    }

    window.addEventListener(
        'pagehide',
        () => {
            publishLifecycleSignal(
                'pagehide'
            );
        }
    );

    window.addEventListener(
        'pageshow',
        () => {
            publishLifecycleSignal(
                'resume'
            );
        }
    );

    window.addEventListener(
        'beforeunload',
        () => {
            publishLifecycleSignal(
                'beforeunload'
            );
        }
    );

    window.AtlasSubjectRuntimeChannel =
        Object.freeze({
            instanceId,
            heartbeatIntervalMs:
                HEARTBEAT_INTERVAL_MS,
            heartbeatStaleMs:
                HEARTBEAT_STALE_MS,
            subscribe,
            getActiveBuild,
            isBuildActive,
            probeActiveBuild,
            acquireBuildLease,
            startBuildHeartbeat,
            pulseBuildHeartbeat,
            publishSubjectChanged,

            ingestExternalMessage(
                message
            ) {
                handleMessage(
                    message,
                    true
                );

                return true;
            }
        });
})();
