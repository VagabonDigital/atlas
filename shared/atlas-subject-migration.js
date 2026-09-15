/* ============================================================
   ATLAS SUBJECT MIGRATION
   One-time claim path for pre-account local My Subjects.

   Cloud-authority rule:
   - if a subject ID already exists in the signed-in account, it is
     already connected and the cloud record wins;
   - only local subject IDs missing from the account are inserted;
   - migration never overwrites an existing cloud subject;
   - verification confirms that every local ID now exists remotely.
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
        const connected = [];

        localSubjects.forEach(local => {
            if (cloudById.has(local.id)) {
                connected.push(local);
                return;
            }

            missing.push(local);
        });

        const localIds = new Set(localSubjects.map(subject => subject.id));
        const cloudOnly = cloudSubjects.filter(subject => !localIds.has(subject.id));

        return cloneJson({
            localCount: localSubjects.length,
            cloudCount: cloudSubjects.length,
            missingCount: missing.length,
            matchingCount: connected.length,
            conflictCount: 0,
            cloudOnlyCount: cloudOnly.length,
            conflicts: [],
            missingIds: missing.map(subject => subject.id),
            missingSubjects: missing.map(subject => ({
                id: subject.id,
                title: subject.metadata?.title || subject.id
            }))
        });
    }

    async function claim({ onProgress } = {}) {
        const initial = await preview();
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

                    if (cloud) {
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
