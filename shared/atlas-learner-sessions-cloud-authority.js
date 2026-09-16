/* ============================================================
   ATLAS LEARNER SESSIONS — CLOUD AUTHORITY

   Supabase owns committed named learner sessions for signed-in users.
   AtlasBridge remains the synchronous runtime/cache used by product UI.

   Rules:
   - cloud hydrates the local bridge cache on entry
   - committed learner writes go to cloud before local cache mutation
   - named-learner Session Subjects are account continuity when supported
   - Shared/default and active-tab selection remain browser-local
   - signed-in named learners and Session Subjects are cloud-authoritative
   - browser-local records remain only for signed-out behavior and UI caching
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasLearnerSessionsCloudAuthority) return;

    const SUPABASE_SESSION_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';

    const SESSION_SUBJECTS_PREFIX =
        'atlas::tutorSubjects::sessionSubjects::';

    let initializePromise = null;
    let authenticated = false;
    let initialized = false;
    let subjectApiFallback = null;

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

    function encodePart(value) {
        return encodeURIComponent(
            String(value || '')
        );
    }

    function sessionSubjectsStorageKey(sessionId) {
        return (
            SESSION_SUBJECTS_PREFIX +
            encodePart(sessionId)
        );
    }

    function normalizeSubjectRef(value) {
        if (
            !value ||
            typeof value !== 'object' ||
            Array.isArray(value)
        ) {
            return null;
        }

        const kind = String(value.kind || '').trim();
        const id = String(value.id || '').trim();

        if (
            !id ||
            (
                kind !== 'my-subject' &&
                kind !== 'atlas-subject'
            )
        ) {
            return null;
        }

        return { kind, id };
    }

    function normalizeSubjectRefs(value) {
        const LearnerCloud =
            window.AtlasLearnerSessionsCloud;

        if (
            LearnerCloud &&
            typeof LearnerCloud.normalizeSubjectRefs ===
                'function'
        ) {
            return LearnerCloud.normalizeSubjectRefs(
                value
            );
        }

        const seen = new Set();

        return (Array.isArray(value) ? value : [])
            .map(normalizeSubjectRef)
            .filter(ref => {
                if (!ref) return false;

                const key = `${ref.kind}:${ref.id}`;

                if (seen.has(key)) return false;

                seen.add(key);
                return true;
            });
    }

    function readSessionSubjectCache(sessionId) {
        const id = String(sessionId || '').trim();

        if (!id) return [];

        try {
            return normalizeSubjectRefs(
                JSON.parse(
                    localStorage.getItem(
                        sessionSubjectsStorageKey(id)
                    ) || '[]'
                )
            );
        } catch {
            return [];
        }
    }

    function writeSessionSubjectCache(
        sessionId,
        subjectRefs
    ) {
        const id = String(sessionId || '').trim();

        if (!id) return false;

        const refs =
            normalizeSubjectRefs(subjectRefs);

        try {
            const key =
                sessionSubjectsStorageKey(id);

            if (!refs.length) {
                localStorage.removeItem(key);
                return true;
            }

            localStorage.setItem(
                key,
                JSON.stringify(refs)
            );
            return true;
        } catch {
            return false;
        }
    }

    function clearSessionSubjectCache(sessionId) {
        const id = String(sessionId || '').trim();

        if (!id) return false;

        try {
            localStorage.removeItem(
                sessionSubjectsStorageKey(id)
            );
            return true;
        } catch {
            return false;
        }
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

        window.requestAnimationFrame(() => {
            try {
                window.dispatchEvent(
                    new CustomEvent(
                        'atlas:compass-hub-refresh-request',
                        { detail: { source: 'learner-cloud' } }
                    )
                );
            } catch { }
        });
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

    function syncSessionSubjectCache(remoteRecords) {
        remoteRecords.forEach(record => {
            if (!record?.subjectRefsSupported) {
                return;
            }

            writeSessionSubjectCache(
                record.id,
                record.subjectRefs
            );
        });
    }

    function hydrateBridge(remoteRecords) {
        const Bridge = requireBridge();
        Bridge.writeSessions(
            remoteRecords.map(bridgeSessionFromRecord)
        );

        const nextMemory = {};

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

        /*
         * Session Subjects still use the long-standing local cache contract
         * inside Compass. Once a named learner has cloud-authoritative refs,
         * mirror them into that cache so all existing read/guard paths see
         * the same state. Cloud remains authoritative; the cache is replaced
         * from cloud on every learner hydration.
         */
        syncSessionSubjectCache(remoteRecords);
    }

    function patchSubjectSessionApi() {
        const Subjects =
            window.AtlasTutorSubjects || null;

        if (
            !Subjects ||
            Subjects.__atlasLearnerSessionSubjectsCloud ===
                true
        ) {
            return false;
        }

        subjectApiFallback = {
            getSubjectSessionIds:
                typeof Subjects.getSubjectSessionIds ===
                    'function'
                    ? Subjects.getSubjectSessionIds.bind(
                        Subjects
                    )
                    : null,
            getSessionSubjects:
                typeof Subjects.getSessionSubjects ===
                    'function'
                    ? Subjects.getSessionSubjects.bind(
                        Subjects
                    )
                    : null,
            setSessionSubjects:
                typeof Subjects.setSessionSubjects ===
                    'function'
                    ? Subjects.setSessionSubjects.bind(
                        Subjects
                    )
                    : null,
            addSessionSubject:
                typeof Subjects.addSessionSubject ===
                    'function'
                    ? Subjects.addSessionSubject.bind(
                        Subjects
                    )
                    : null,
            removeSessionSubject:
                typeof Subjects.removeSessionSubject ===
                    'function'
                    ? Subjects.removeSessionSubject.bind(
                        Subjects
                    )
                    : null
        };

        Subjects.getSubjectSessionIds =
            getSubjectSessionIds;
        Subjects.getSessionSubjects =
            getSessionSubjects;
        Subjects.setSessionSubjects =
            setSessionSubjects;
        Subjects.addSessionSubject =
            addSessionSubject;
        Subjects.removeSessionSubject =
            removeSessionSubject;

        Subjects.__atlasLearnerSessionSubjectsCloud =
            true;

        return true;
    }

    async function initialize({ force = false } = {}) {
        if (!hasStoredAccountSession()) {
            authenticated = false;
            initialized = true;
            patchSubjectSessionApi();
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
                patchSubjectSessionApi();
                return getState();
            }

            const remote =
                await LearnerCloud.listLearnerSessions();

            recordsById.clear();

            remote.forEach(record => {
                recordsById.set(record.id, record);
            });

            hydrateBridge(remote);
            patchSubjectSessionApi();

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
        const records = Array.from(
            recordsById.values()
        );

        return {
            initialized,
            authenticated,
            active: initialized && authenticated,
            cloudCount: recordsById.size,
            sessionSubjectsSupported:
                records.some(record =>
                    record.subjectRefsSupported === true
                )
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

            if (record.subjectRefsSupported) {
                writeSessionSubjectCache(
                    id,
                    record.subjectRefs
                );
            }
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

        const cleanup = () => {
            if (mutationQueues.get(id) === next) {
                mutationQueues.delete(id);
            }
        };

        next.then(cleanup, cleanup);

        return next;
    }

    function isSharedSession(sessionId) {
        const id = String(sessionId || '').trim();

        return (
            !id ||
            id === requireBridge().defaultSessionId
        );
    }

    async function fallbackGetSessionSubjects(sessionId) {
        if (
            subjectApiFallback &&
            typeof subjectApiFallback.getSessionSubjects ===
                'function'
        ) {
            return (
                await subjectApiFallback
                    .getSessionSubjects(sessionId)
            ) || [];
        }

        return readSessionSubjectCache(sessionId);
    }

    async function fallbackSetSessionSubjects(
        sessionId,
        refs
    ) {
        if (
            subjectApiFallback &&
            typeof subjectApiFallback.setSessionSubjects ===
                'function'
        ) {
            return subjectApiFallback
                .setSessionSubjects(
                    sessionId,
                    refs
                );
        }

        return writeSessionSubjectCache(
            sessionId,
            refs
        )
            ? cloneJson(normalizeSubjectRefs(refs))
            : null;
    }

    async function getSessionSubjects(sessionId) {
        const id = String(sessionId || '').trim();

        if (!id) return [];

        await initialize();

        if (
            !authenticated ||
            isSharedSession(id)
        ) {
            return cloneJson(
                await fallbackGetSessionSubjects(id)
            ) || [];
        }

        const current =
            await getCloudRecord(id);

        if (
            !current ||
            !current.subjectRefsSupported
        ) {
            return cloneJson(
                await fallbackGetSessionSubjects(id)
            ) || [];
        }

        writeSessionSubjectCache(
            id,
            current.subjectRefs
        );

        return cloneJson(
            current.subjectRefs
        ) || [];
    }

    async function getSubjectSessionIds(subjectRef) {
        const ref = normalizeSubjectRef(subjectRef);

        if (!ref) return [];

        await initialize();

        if (!authenticated) {
            return subjectApiFallback
                ?.getSubjectSessionIds
                ? (
                    await subjectApiFallback
                        .getSubjectSessionIds(ref)
                ) || []
                : [];
        }

        const records =
            Array.from(recordsById.values());

        const cloudSupported =
            records.some(record =>
                record.subjectRefsSupported === true
            );

        if (!cloudSupported) {
            return subjectApiFallback
                ?.getSubjectSessionIds
                ? (
                    await subjectApiFallback
                        .getSubjectSessionIds(ref)
                ) || []
                : [];
        }

        const sessionIds = new Set();

        if (
            subjectApiFallback &&
            typeof subjectApiFallback.getSubjectSessionIds ===
                'function'
        ) {
            const localIds =
                await subjectApiFallback
                    .getSubjectSessionIds(ref);

            (Array.isArray(localIds) ? localIds : [])
                .filter(id =>
                    id === requireBridge().defaultSessionId
                )
                .forEach(id =>
                    sessionIds.add(id)
                );
        }

        records.forEach(record => {
            const refs = record.subjectRefsSupported
                ? record.subjectRefs
                : [];

            if (
                normalizeSubjectRefs(refs)
                    .some(item =>
                        item.kind === ref.kind &&
                        item.id === ref.id
                    )
            ) {
                sessionIds.add(record.id);
            }
        });

        return Array.from(sessionIds);
    }

    async function setSessionSubjects(
        sessionId,
        subjectRefs
    ) {
        const id = String(sessionId || '').trim();

        if (!id || !Array.isArray(subjectRefs)) {
            return null;
        }

        const refs =
            normalizeSubjectRefs(subjectRefs);

        await initialize();

        if (
            !authenticated ||
            isSharedSession(id)
        ) {
            return fallbackSetSessionSubjects(
                id,
                refs
            );
        }

        return runForSession(id, async () => {
            const current =
                await getCloudRecord(id);

            if (
                !current ||
                !current.subjectRefsSupported
            ) {
                return fallbackSetSessionSubjects(
                    id,
                    refs
                );
            }

            try {
                const saved =
                    await requireLearnerCloud()
                        .updateLearnerSession(
                            {
                                ...current,
                                subjectRefs: refs,
                                subjectRefsMigrated: true
                            },
                            current.revision
                        );

                recordsById.set(id, saved);

                writeSessionSubjectCache(
                    id,
                    saved.subjectRefs
                );

                return cloneJson(
                    saved.subjectRefs
                ) || [];
            } catch (error) {
                dispatchError(
                    error,
                    'session-subjects',
                    id
                );
                throw error;
            }
        });
    }

    async function addSessionSubject(
        sessionId,
        subjectRef
    ) {
        const ref = normalizeSubjectRef(subjectRef);
        const id = String(sessionId || '').trim();

        if (!ref || !id) return null;

        const Subjects =
            window.AtlasTutorSubjects || null;

        if (
            ref.kind === 'my-subject' &&
            Subjects &&
            typeof Subjects.getSubject === 'function'
        ) {
            const subject =
                await Subjects.getSubject(ref.id);

            if (!subject) return null;
        }

        const current =
            await getSessionSubjects(id);

        const next =
            normalizeSubjectRefs([
                ref,
                ...current
            ]);

        return setSessionSubjects(
            id,
            next
        );
    }

    async function removeSessionSubject(
        sessionId,
        subjectRef
    ) {
        const ref = normalizeSubjectRef(subjectRef);
        const id = String(sessionId || '').trim();

        if (!ref || !id) return null;

        const Subjects =
            window.AtlasTutorSubjects || null;

        if (
            ref.kind === 'my-subject' &&
            Subjects
        ) {
            const subject =
                typeof Subjects.getSubject === 'function'
                    ? await Subjects.getSubject(ref.id)
                    : null;

            if (!subject) return null;

            const placement =
                typeof Subjects.getSubjectLibraryState ===
                    'function'
                    ? await Subjects
                        .getSubjectLibraryState(
                            ref.id
                        )
                    : null;

            if (
                placement &&
                placement.libraryIncluded === false &&
                placement.archived !== true
            ) {
                const sessionIds =
                    await getSubjectSessionIds(ref);

                const remainingHomes =
                    sessionIds.filter(
                        candidate =>
                            candidate !== id
                    );

                if (!remainingHomes.length) {
                    return null;
                }
            }
        }

        const current =
            await getSessionSubjects(id);

        const next =
            current.filter(item =>
                !(
                    item.kind === ref.kind &&
                    item.id === ref.id
                )
            );

        return setSessionSubjects(
            id,
            next
        );
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
            subjectRefsSupported: true,
            subjectRefs: [],
            subjectRefsMigrated: true,
            createdAt: timestamp,
            updatedAt: timestamp,
            lastActiveAt: timestamp
        };
        record.memory.sessionId = record.id;

        try {
            const saved =
                await LearnerCloud.createLearnerSession(record);

            recordsById.set(saved.id, saved);

            if (
                saved.subjectRefsSupported &&
                saved.subjectRefsMigrated
            ) {
                writeSessionSubjectCache(
                    saved.id,
                    saved.subjectRefs
                );
            }

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
                clearSessionSubjectCache(id);
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
                clearSessionSubjectCache(id);
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
        touchSession,
        getSessionSubjects,
        getSubjectSessionIds,
        setSessionSubjects,
        addSessionSubject,
        removeSessionSubject
    });
})();
