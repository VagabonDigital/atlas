/* ============================================================
   ATLAS LEARNER SESSION MIGRATION

   One-time claim of browser-local named sessions + learner memory into
   the signed-in Atlas account. Conflicts stop the migration rather than
   guessing which side should win.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasLearnerSessionMigration) return;

    function requireBridge() {
        if (!window.AtlasBridge) {
            throw new Error(
                'AtlasLearnerSessionMigration requires AtlasBridge.'
            );
        }

        return window.AtlasBridge;
    }

    function requireCloud() {
        if (!window.AtlasLearnerSessionsCloud) {
            throw new Error(
                'AtlasLearnerSessionMigration requires AtlasLearnerSessionsCloud.'
            );
        }

        return window.AtlasLearnerSessionsCloud;
    }

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function localSnapshot() {
        const Bridge = requireBridge();
        const Cloud = requireCloud();

        return Bridge.readSessions()
            .filter(session =>
                session &&
                session.id !== Bridge.defaultSessionId
            )
            .map(session => Cloud.normalizeRecord({
                ...cloneJson(session),
                revision: 1,
                memory: Bridge.readLearnerMemory(session.id)
            }))
            .filter(Boolean);
    }

    function meaningfulMemory(memory, sessionId) {
        return requireCloud().normalizeMemory(
            memory,
            sessionId
        );
    }

    function recordsMatch(local, cloud) {
        if (!local || !cloud) return false;

        return (
            local.id === cloud.id &&
            local.name === cloud.name &&
            JSON.stringify(
                meaningfulMemory(local.memory, local.id)
            ) === JSON.stringify(
                meaningfulMemory(cloud.memory, cloud.id)
            )
        );
    }

    function describeDifference(local, cloud) {
        if (!cloud) return 'missing from account';
        if (local.name !== cloud.name) return 'name differs';

        if (
            JSON.stringify(
                meaningfulMemory(local.memory, local.id)
            ) !== JSON.stringify(
                meaningfulMemory(cloud.memory, cloud.id)
            )
        ) {
            return 'learner memory differs';
        }

        return 'record differs';
    }

    async function preview() {
        const Cloud = requireCloud();
        const local = localSnapshot();
        const remote = await Cloud.listLearnerSessions();
        const remoteById = new Map(
            remote.map(record => [record.id, record])
        );

        const missing = [];
        const matching = [];
        const conflicts = [];

        local.forEach(record => {
            const cloudRecord = remoteById.get(record.id) || null;

            if (!cloudRecord) {
                missing.push(record);
                return;
            }

            if (recordsMatch(record, cloudRecord)) {
                matching.push(record);
                return;
            }

            conflicts.push({
                id: record.id,
                name: record.name,
                difference: describeDifference(
                    record,
                    cloudRecord
                )
            });
        });

        return {
            localCount: local.length,
            cloudCount: remote.length,
            missingCount: missing.length,
            matchingCount: matching.length,
            conflictCount: conflicts.length,
            missing: cloneJson(missing),
            conflicts: cloneJson(conflicts)
        };
    }

    async function claim({ onProgress = null } = {}) {
        const Cloud = requireCloud();
        const before = await preview();

        if (before.conflictCount > 0) {
            const error = new Error(
                'Learner migration is paused because local and cloud records differ.'
            );
            error.code = 'ATLAS_LEARNER_MIGRATION_CONFLICT';
            error.conflicts = before.conflicts;
            throw error;
        }

        const missing = before.missing || [];

        for (let index = 0; index < missing.length; index += 1) {
            const record = missing[index];

            if (typeof onProgress === 'function') {
                onProgress({
                    phase: 'upload',
                    completed: index,
                    total: missing.length,
                    name: record.name
                });
            }

            await Cloud.createLearnerSession(record);
        }

        if (typeof onProgress === 'function') {
            onProgress({
                phase: 'verify',
                completed: missing.length,
                total: missing.length
            });
        }

        const after = await preview();

        if (
            after.conflictCount > 0 ||
            after.missingCount > 0 ||
            after.matchingCount !== after.localCount
        ) {
            const error = new Error(
                'Atlas uploaded learner sessions but could not verify the complete migration.'
            );
            error.code = 'ATLAS_LEARNER_MIGRATION_VERIFY_FAILED';
            error.preview = after;
            throw error;
        }

        return {
            localCount: after.localCount,
            verified: after.matchingCount,
            uploaded: missing.length,
            cloudCount: after.cloudCount
        };
    }

    window.AtlasLearnerSessionMigration = Object.freeze({
        preview,
        claim
    });
})();
