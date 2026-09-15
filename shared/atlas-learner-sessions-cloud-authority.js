/* ============================================================
   ATLAS LEARNER SESSIONS — CLOUD AUTHORITY

   Supabase owns committed named learner sessions for signed-in users.
   AtlasBridge remains the synchronous runtime/cache used by product UI.

   Rules:
   - cloud hydrates the local bridge cache on entry
   - committed learner writes go to cloud before local cache mutation
   - Shared/default and active-tab selection remain browser-local
   - legacy local-only named sessions are preserved until migrated
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasLearnerSessionsCloudAuthority) return;

    const SUPABASE_SESSION_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';

    let initializePromise = null;
    let authenticated = false;
    let initialized = false;
    const recordsById = new Map();
    const mutationQueues = new Map();

    function requireBridge() {
        if (!window.AtlasBridge) {
            throw new Error(
                'Atlas learner cloud authority requires AtlasBridge.'
            );
        }

        return window.AtlasBridge;
    }

    function requireCloud() {
        if (!window.AtlasCloud) {
            throw new Error(
                'Atlas learner cloud authority requires AtlasCloud.'
            );
        }

        return window.AtlasCloud;
    }

    function requireLearnerCloud() {
        if (!window.AtlasLearnerSessionsCloud) {
            throw new Error(
                'Atlas learner cloud authority requires AtlasLearnerSessionsCloud.'
            );
        }

        return window.AtlasLearnerSessionsCloud;
    }

    function hasStoredAccountSession() {
        try {
            return Boolean(
                localStorage.getItem(SUPABASE_SESSION_KEY)
            );
        } catch {
            return false;
        }
    }

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function createId(prefix = 'session') {
        if (
            window.crypto &&
            typeof window.crypto.randomUUID === 'function'
        ) {
            return `${prefix}-${window.crypto.randomUUID()}`;
        }

        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    function bridgeSessionFromRecord(record) {
        return {
            id: record.id,
            name: record.name,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            lastActiveAt: record.lastActiveAt
        };
    }

    function dispatchReady() {
        window.dispatchEvent(
            new CustomEvent('atlas:learner-cloud-ready', {
                detail: getState()
            })
        );
    }

    function dispatchError(error, action, sessionId = '') {
        window.dispatchEvent(
            new CustomEvent('atlas:learner-cloud-error', {
                detail: {
                    action,
                    sessionId,
                    code: error?.code || '',
                    message:
                        error?.message ||
                        String(error || 'Learner cloud operation failed.')
                }
            })
        );
    }

    function hydrateBridge(remoteRecords) {
        const Bridge = requireBridge();
        const localSessions = Bridge.readSessions();
        const localNamed = localSessions.filter(
            session => session.id !== Bridge.defaultSessionId
        );
        const sessionsById = new Map(
            localNamed.map(session => [session.id, session])
        );

        remoteRecords.forEach(record => {
            sessionsById.set(
                record.id,
                bridgeSessionFromRecord(record)
            );
        });

        Bridge.writeSessions(
            Array.from(sessionsById.values())
        );

        const existingMemory =
            Bridge.readJson(Bridge.keys.learnerMemory, {});
        const nextMemory =
            existingMemory &&
            typeof existingMemory === 'object' &&
            !Array.isArray(existingMemory)
                ? { ...existingMemory }
                : {};

        remoteRecords.forEach(record => {
            const memory = record.memory || null;

            if (
                memory &&
                (
                    String(memory.about || '').trim() ||
                    String(memory.interests || '').trim() ||
                    String(memory.notes || '').trim() ||
                    String(memory.nextTime || '').trim()
                )
            ) {
                nextMemory[record.id] = cloneJson(memory);
            } else {
                delete nextMemory[record.id];
            }
        });

        Bridge.writeJson(
            Bridge.keys.learnerMemory,
            nextMemory
        );
    }

    async function initialize({ force = false } = {}) {
        if (!hasStoredAccountSession()) {
            authenticated = false;
            initialized = true;
            return getState();
        }

        if (initializePromise && !force) {
            return initializePromise;
        }

        initializePromise = (async () => {
            const Cloud = requireCloud();
            const LearnerCloud = requireLearnerCloud();
            const session = await Cloud.getSession();

            authenticated = Boolean(session?.user);

            if (!authenticated) {
                recordsById.clear();
                initialized = true;
                return getState();
            }

            const remote =
                await LearnerCloud.listLearnerSessions();

            recordsById.clear();
            remote.forEach(record => {
                recordsById.set(record.id, record);
            });

            hydrateBridge(remote);
            initialized = true;
            dispatchReady();

            return getState();
        })().catch(error => {
            initializePromise = null;
            dispatchError(error, 'initialize');
            throw error;
        });

        return initializePromise;
    }

    function getState() {
        return {
            initialized,
            authenticated,
            active: initialized && authenticated,
            cloudCount: recordsById.size
        };
    }

    async function getCloudRecord(sessionId) {
        await initialize();

        const id = String(sessionId || '').trim();
        if (!id) return null;

        if (recordsById.has(id)) {
            return recordsById.get(id);
        }

        if (!authenticated) return null;

        const record =
            await requireLearnerCloud()
                .getLearnerSession(id);

        if (record) {
            recordsById.set(id, record);
        }

        return record;
    }

    function runForSession(sessionId, task) {
        const id = String(sessionId || '').trim();
        const previous =
            mutationQueues.get(id) || Promise.resolve();

        const next = previous
            .catch(() => undefined)
            .then(task);

        mutationQueues.set(id, next);

        next.finally(() => {
            if (mutationQueues.get(id) === next) {
                mutationQueues.delete(id);
            }
        });

        return next;
    }

    async function createSession(name) {
        await initialize();

        if (!authenticated) {
            return requireBridge().createSession(name);
        }

        const Bridge = requireBridge();
        const LearnerCloud = requireLearnerCloud();
        const cleanName = String(name || '').trim();

        if (!cleanName) return null;

        const duplicate = Bridge.readSessions().some(session =>
            session.name.trim().toLowerCase() ===
            cleanName.toLowerCase()
        );

        if (duplicate) return null;

        const timestamp = Date.now();
        const inheritedAppearance = Bridge.readAppearanceMode();
        const record = {
            schemaVersion: 1,
            id: createId('session'),
            name: cleanName,
            revision: 1,
            memory: LearnerCloud.normalizeMemory(
                null,
                ''
            ),
            createdAt: timestamp,
            updatedAt: timestamp,
            lastActiveAt: timestamp
        };
        record.memory.sessionId = record.id;

        try {
            const saved =
                await LearnerCloud.createLearnerSession(record);

            recordsById.set(saved.id, saved);

            const existing = Bridge.readSessions().filter(
                session => session.id !== saved.id
            );

            Bridge.writeSessions([
                ...existing,
                bridgeSessionFromRecord(saved)
            ]);
            Bridge.setActiveSession(saved.id);
            Bridge.setAppearanceMode(inheritedAppearance);

            return Bridge.readSessions().find(
                session => session.id === saved.id
            ) || bridgeSessionFromRecord(saved);
        } catch (error) {
            dispatchError(error, 'create', record.id);
            throw error;
        }
    }

    async function renameSession(sessionId, nextName) {
        const id = String(sessionId || '').trim();

        return runForSession(id, async () => {
            await initialize();

            if (!authenticated) {
                return requireBridge().renameSession(
                    id,
                    nextName
                );
            }

            const Bridge = requireBridge();
            const cleanName = String(nextName || '').trim();

            if (!cleanName) return null;

            const duplicate = Bridge.readSessions().some(session =>
                session.id !== id &&
                session.name.trim().toLowerCase() ===
                cleanName.toLowerCase()
            );

            if (duplicate) return null;

            const current = await getCloudRecord(id);

            if (!current) {
                const error = new Error(
                    'This learner has not been connected to your Atlas account yet.'
                );
                error.code = 'ATLAS_LEARNER_NOT_CONNECTED';
                dispatchError(error, 'rename', id);
                throw error;
            }

            try {
                const saved =
                    await requireLearnerCloud()
                        .updateLearnerSession(
                            {
                                ...current,
                                name: cleanName
                            },
                            current.revision
                        );

                recordsById.set(id, saved);
                Bridge.renameSession(id, saved.name);

                return Bridge.readSessions().find(
                    session => session.id === id
                ) || bridgeSessionFromRecord(saved);
            } catch (error) {
                dispatchError(error, 'rename', id);
                throw error;
            }
        });
    }

    async function deleteSession(sessionId) {
        const id = String(sessionId || '').trim();

        return runForSession(id, async () => {
            await initialize();

            if (!authenticated) {
                return requireBridge().deleteSession(id);
            }

            const Bridge = requireBridge();
            const current = await getCloudRecord(id);

            if (!current) {
                const deletedLocally = Bridge.deleteSession(id);
                recordsById.delete(id);
                return deletedLocally;
            }

            try {
                const deleted =
                    await requireLearnerCloud()
                        .deleteLearnerSession(
                            id,
                            current.revision
                        );

                if (!deleted) {
                    const latest =
                        await requireLearnerCloud()
                            .getLearnerSession(id);

                    if (latest) {
                        const error = new Error(
                            'This learner changed elsewhere before deletion completed.'
                        );
                        error.code = 'ATLAS_REVISION_CONFLICT';
                        throw error;
                    }
                }

                recordsById.delete(id);
                return Bridge.deleteSession(id);
            } catch (error) {
                dispatchError(error, 'delete', id);
                throw error;
            }
        });
    }

    async function saveLearnerMemory(
        sessionId,
        changes = {}
    ) {
        const id = String(sessionId || '').trim();

        return runForSession(id, async () => {
            await initialize();

            if (!authenticated) {
                return requireBridge().writeLearnerMemory(
                    id,
                    changes
                );
            }

            const Bridge = requireBridge();
            const LearnerCloud = requireLearnerCloud();
            const current = await getCloudRecord(id);

            if (!current) {
                const error = new Error(
                    'This learner has not been connected to your Atlas account yet.'
                );
                error.code = 'ATLAS_LEARNER_NOT_CONNECTED';
                dispatchError(error, 'memory', id);
                throw error;
            }

            const nextMemory = LearnerCloud.normalizeMemory(
                {
                    ...current.memory,
                    ...changes,
                    updatedAt: Date.now()
                },
                id
            );

            try {
                const saved =
                    await LearnerCloud.updateLearnerSession(
                        {
                            ...current,
                            memory: nextMemory
                        },
                        current.revision
                    );

                recordsById.set(id, saved);

                Bridge.writeLearnerMemory(
                    id,
                    saved.memory
                );

                return Bridge.readLearnerMemory(id);
            } catch (error) {
                dispatchError(error, 'memory', id);
                throw error;
            }
        });
    }

    async function touchSession(sessionId) {
        const id = String(sessionId || '').trim();

        if (!id) return null;

        return runForSession(id, async () => {
            await initialize();

            if (!authenticated) return null;

            const current = await getCloudRecord(id);
            if (!current) return null;

            try {
                const saved =
                    await requireLearnerCloud()
                        .updateLearnerSession(
                            {
                                ...current,
                                lastActiveAt: Date.now()
                            },
                            current.revision
                        );

                recordsById.set(id, saved);
                return saved;
            } catch (error) {
                dispatchError(error, 'touch', id);
                return null;
            }
        });
    }

    window.AtlasLearnerSessionsCloudAuthority = Object.freeze({
        initialize,
        getState,
        createSession,
        renameSession,
        deleteSession,
        saveLearnerMemory,
        touchSession
    });
})();
