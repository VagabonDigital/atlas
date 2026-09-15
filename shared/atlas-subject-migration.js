/* ============================================================
   ATLAS SUBJECT MIGRATION
   One-time claim path for pre-account local My Subjects.

   This is deliberately conservative:
   - existing exact cloud matches are accepted;
   - missing local subjects are inserted;
   - any conflicting same-ID subject blocks the migration;
   - verification runs again after migration.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasSubjectMigration) return;

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function firstJsonDifference(left, right, path = '$') {
        if (Object.is(left, right)) return null;

        if (left === null || right === null) {
            return { path, reason: 'value', left, right };
        }

        const leftIsArray = Array.isArray(left);
        const rightIsArray = Array.isArray(right);

        if (leftIsArray !== rightIsArray) {
            return { path, reason: 'type', left, right };
        }

        if (leftIsArray) {
            if (left.length !== right.length) {
                return {
                    path,
                    reason: `array length ${left.length} !== ${right.length}`,
                    left,
                    right
                };
            }

            for (let index = 0; index < left.length; index += 1) {
                const difference = firstJsonDifference(
                    left[index],
                    right[index],
                    `${path}[${index}]`
                );
                if (difference) return difference;
            }

            return null;
        }

        const leftType = typeof left;
        const rightType = typeof right;

        if (leftType !== rightType) {
            return { path, reason: 'type', left, right };
        }

        if (leftType !== 'object') {
            return { path, reason: 'value', left, right };
        }

        const leftKeys = Object.keys(left).sort();
        const rightKeys = Object.keys(right).sort();

        if (
            leftKeys.length !== rightKeys.length ||
            leftKeys.some((key, index) => key !== rightKeys[index])
        ) {
            return {
                path,
                reason: 'object keys differ',
                left: leftKeys,
                right: rightKeys
            };
        }

        for (const key of leftKeys) {
            const difference = firstJsonDifference(
                left[key],
                right[key],
                `${path}.${key}`
            );
            if (difference) return difference;
        }

        return null;
    }

    function sameJson(left, right) {
        return firstJsonDifference(left, right) === null;
    }

    function subjectDifference(local, cloud) {
        if (!local || !cloud) {
            return 'subject record missing';
        }

        if (local.id !== cloud.id) return 'id differs';
        if (local.schemaVersion !== cloud.schemaVersion) return 'schema version differs';
        if (local.format !== cloud.format) return 'format differs';
        if (local.revision !== cloud.revision) return 'revision differs';

        const metadataDifference = firstJsonDifference(
            local.metadata,
            cloud.metadata
        );
        if (metadataDifference) {
            return `metadata differs at ${metadataDifference.path}`;
        }

        const documentDifference = firstJsonDifference(
            local.document,
            cloud.document
        );
        if (documentDifference) {
            return `document differs at ${documentDifference.path}`;
        }

        const provenanceDifference = firstJsonDifference(
            local.provenance,
            cloud.provenance
        );
        if (provenanceDifference) {
            return `provenance differs at ${provenanceDifference.path}`;
        }

        return null;
    }

    async function preview() {
        if (!window.AtlasTutorSubjects || !window.AtlasCloud) {
            throw new Error('Atlas subject migration dependencies are unavailable.');
        }

        const localSubjects = await AtlasTutorSubjects.listSubjects();
        const cloudSubjects = await AtlasCloud.listOwnedSubjects();
        const cloudById = new Map(
            cloudSubjects.map(subject => [subject.id, subject])
        );

        const missing = [];
        const matching = [];
        const conflicts = [];

        localSubjects.forEach(local => {
            const cloud = cloudById.get(local.id);

            if (!cloud) {
                missing.push(local);
                return;
            }

            const difference = subjectDifference(local, cloud);

            if (difference) {
                conflicts.push({
                    id: local.id,
                    title: local.metadata?.title || local.id,
                    difference
                });
                return;
            }

            matching.push(local);
        });

        const localIds = new Set(localSubjects.map(subject => subject.id));
        const cloudOnly = cloudSubjects.filter(subject => !localIds.has(subject.id));

        return cloneJson({
            localCount: localSubjects.length,
            cloudCount: cloudSubjects.length,
            missingCount: missing.length,
            matchingCount: matching.length,
            conflictCount: conflicts.length,
            cloudOnlyCount: cloudOnly.length,
            conflicts,
            missingIds: missing.map(subject => subject.id)
        });
    }

    async function claim({ onProgress } = {}) {
        const initial = await preview();

        if (initial.conflictCount > 0) {
            const error = new Error(
                'Atlas found conflicting My Subjects with the same IDs in this account. Migration stopped before writing anything new.'
            );
            error.code = 'ATLAS_MIGRATION_CONFLICT';
            error.preview = initial;
            throw error;
        }

        const localSubjects = await AtlasTutorSubjects.listSubjects();
        const missingIds = new Set(initial.missingIds);
        const missing = localSubjects.filter(subject => missingIds.has(subject.id));

        let inserted = 0;

        for (const subject of missing) {
            if (typeof onProgress === 'function') {
                onProgress({
                    phase: 'insert',
                    completed: inserted,
                    total: missing.length,
                    subjectId: subject.id,
                    title: subject.metadata?.title || subject.id
                });
            }

            try {
                await AtlasCloud.createOwnedSubject(subject);
                inserted += 1;
            } catch (error) {
                if (error?.code === '23505') {
                    const cloud = await AtlasCloud.getOwnedSubject(subject.id);
                    if (cloud && !subjectDifference(subject, cloud)) {
                        inserted += 1;
                        continue;
                    }
                }

                error.migrationProgress = {
                    inserted,
                    total: missing.length,
                    subjectId: subject.id
                };
                throw error;
            }
        }

        if (typeof onProgress === 'function') {
            onProgress({
                phase: 'verify',
                completed: inserted,
                total: missing.length
            });
        }

        const verification = await preview();

        if (
            verification.conflictCount > 0 ||
            verification.missingCount > 0 ||
            verification.matchingCount !== verification.localCount
        ) {
            const error = new Error(
                'Atlas could not verify every local My Subject after migration.'
            );
            error.code = 'ATLAS_MIGRATION_VERIFY_FAILED';
            error.preview = verification;
            throw error;
        }

        return cloneJson({
            inserted,
            alreadyPresent: initial.matchingCount,
            verified: verification.matchingCount,
            localCount: verification.localCount,
            cloudCount: verification.cloudCount,
            cloudOnlyCount: verification.cloudOnlyCount
        });
    }

    window.AtlasSubjectMigration = Object.freeze({
        preview,
        claim,
        sameJson
    });
})();
