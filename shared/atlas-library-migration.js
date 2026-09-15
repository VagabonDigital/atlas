/* ============================================================
   ATLAS LIBRARY MIGRATION
   One-time claim path for pre-account My Subjects library organisation.

   Conservative rules:
   - the subject migration must already be complete;
   - an existing exact cloud match is accepted;
   - no cloud row is created until the local snapshot is validated;
   - any conflicting cloud row blocks migration;
   - the cloud snapshot is verified after creation.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasLibraryMigration) return;

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

    async function getLocalSnapshot() {
        if (!window.AtlasTutorSubjects) {
            throw new Error('Atlas Tutor Subjects is unavailable.');
        }

        const portable = await AtlasTutorSubjects.exportPortableData();
        const library = portable?.library;
        const order = portable?.order;

        if (
            !library ||
            typeof library !== 'object' ||
            Array.isArray(library) ||
            !Array.isArray(order)
        ) {
            throw new Error('Atlas could not build a valid local My Subjects library snapshot.');
        }

        return {
            schemaVersion: 1,
            state: cloneJson({
                library,
                order
            }),
            subjectCount: order.length,
            categoryCount: Array.isArray(library.categories)
                ? library.categories.length
                : 0
        };
    }

    async function requireSubjectsConnected() {
        if (!window.AtlasSubjectMigration) {
            throw new Error('Atlas subject migration is unavailable.');
        }

        const preview = await AtlasSubjectMigration.preview();

        if (
            preview.conflictCount > 0 ||
            preview.missingCount > 0 ||
            preview.matchingCount !== preview.localCount
        ) {
            const error = new Error(
                'Connect and verify every local My Subject before connecting library organisation.'
            );
            error.code = 'ATLAS_LIBRARY_SUBJECTS_INCOMPLETE';
            error.subjectPreview = preview;
            throw error;
        }

        return preview;
    }

    async function preview() {
        if (!window.AtlasCloud) {
            throw new Error('Atlas Cloud is unavailable.');
        }

        const subjectPreview = await requireSubjectsConnected();
        const local = await getLocalSnapshot();
        const cloud = await AtlasCloud.getSubjectLibraryState();

        if (!cloud) {
            return cloneJson({
                status: 'missing',
                matching: false,
                conflict: false,
                subjectCount: local.subjectCount,
                categoryCount: local.categoryCount,
                cloudRevision: null,
                difference: null,
                subjectsVerified: subjectPreview.matchingCount
            });
        }

        const schemaMatches = cloud.schemaVersion === local.schemaVersion;
        const difference = firstJsonDifference(
            cloud.state,
            local.state
        );
        const matching = schemaMatches && !difference;

        return cloneJson({
            status: matching ? 'matching' : 'conflict',
            matching,
            conflict: !matching,
            subjectCount: local.subjectCount,
            categoryCount: local.categoryCount,
            cloudRevision: cloud.revision,
            difference: !schemaMatches
                ? 'schema version differs'
                : difference
                    ? `${difference.path}: ${difference.reason}`
                    : null,
            subjectsVerified: subjectPreview.matchingCount
        });
    }

    async function claim() {
        const initial = await preview();

        if (initial.conflict) {
            const error = new Error(
                `Atlas found different My Subjects library organisation already stored in this account${initial.difference ? ` (${initial.difference})` : ''}. Migration stopped without overwriting it.`
            );
            error.code = 'ATLAS_LIBRARY_MIGRATION_CONFLICT';
            error.preview = initial;
            throw error;
        }

        if (initial.matching) {
            return cloneJson({
                created: false,
                verified: true,
                subjectCount: initial.subjectCount,
                categoryCount: initial.categoryCount,
                revision: initial.cloudRevision
            });
        }

        const local = await getLocalSnapshot();

        try {
            await AtlasCloud.createSubjectLibraryState(
                local.state,
                local.schemaVersion
            );
        } catch (error) {
            if (error?.code !== '23505') throw error;

            const existing = await AtlasCloud.getSubjectLibraryState();
            if (
                !existing ||
                existing.schemaVersion !== local.schemaVersion ||
                !sameJson(existing.state, local.state)
            ) {
                const conflict = new Error(
                    'A My Subjects library row appeared during migration and does not match this browser.'
                );
                conflict.code = 'ATLAS_LIBRARY_MIGRATION_CONFLICT';
                throw conflict;
            }
        }

        const verification = await preview();

        if (!verification.matching) {
            const error = new Error(
                'Atlas could not verify My Subjects library organisation after migration.'
            );
            error.code = 'ATLAS_LIBRARY_MIGRATION_VERIFY_FAILED';
            error.preview = verification;
            throw error;
        }

        return cloneJson({
            created: true,
            verified: true,
            subjectCount: verification.subjectCount,
            categoryCount: verification.categoryCount,
            revision: verification.cloudRevision
        });
    }

    window.AtlasLibraryMigration = Object.freeze({
        preview,
        claim,
        sameJson
    });
})();
