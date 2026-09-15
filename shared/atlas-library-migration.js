/* ============================================================
   ATLAS LIBRARY MIGRATION
   One-time claim path for pre-account My Subjects library organisation.

   Conservative rules:
   - the subject migration must already be resolved;
   - local-only subjects intentionally left in this browser are excluded;
   - an existing exact cloud match is accepted;
   - an existing cloud library may be expanded when the local snapshot is
     an exact superset created only by newly connected subjects;
   - unrelated cloud/local differences still block migration;
   - cloud writes use optimistic revision checks and are verified.
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

    function filterDismissedSubjects(library, order, subjectPreview) {
        const dismissedIds = new Set(
            (subjectPreview?.dismissedSubjects || [])
                .map(subject => String(subject?.id || '').trim())
                .filter(Boolean)
        );

        if (!dismissedIds.size) {
            return {
                library: cloneJson(library),
                order: cloneJson(order)
            };
        }

        const nextLibrary = cloneJson(library);
        const nextOrder = order.filter(id => !dismissedIds.has(id));

        if (
            nextLibrary.subjects &&
            typeof nextLibrary.subjects === 'object' &&
            !Array.isArray(nextLibrary.subjects)
        ) {
            dismissedIds.forEach(id => {
                delete nextLibrary.subjects[id];
            });
        }

        return {
            library: nextLibrary,
            order: nextOrder
        };
    }

    async function getLocalSnapshot(subjectPreview) {
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

        const filtered = filterDismissedSubjects(
            library,
            order,
            subjectPreview
        );

        return {
            schemaVersion: 1,
            state: cloneJson(filtered),
            subjectCount: filtered.order.length,
            categoryCount: Array.isArray(filtered.library.categories)
                ? filtered.library.categories.length
                : 0,
            dismissedCount: Number(subjectPreview?.dismissedCount || 0)
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
            preview.resolvedCount !== preview.localCount
        ) {
            const error = new Error(
                'Resolve the remaining local My Subjects before connecting library organisation.'
            );
            error.code = 'ATLAS_LIBRARY_SUBJECTS_INCOMPLETE';
            error.subjectPreview = preview;
            throw error;
        }

        return preview;
    }

    function expansionDetails(cloudState, localState) {
        if (
            !cloudState ||
            typeof cloudState !== 'object' ||
            Array.isArray(cloudState) ||
            !localState ||
            typeof localState !== 'object' ||
            Array.isArray(localState)
        ) {
            return null;
        }

        const cloudLibrary = cloudState.library;
        const localLibrary = localState.library;
        const cloudOrder = cloudState.order;
        const localOrder = localState.order;

        if (
            !cloudLibrary ||
            typeof cloudLibrary !== 'object' ||
            Array.isArray(cloudLibrary) ||
            !localLibrary ||
            typeof localLibrary !== 'object' ||
            Array.isArray(localLibrary) ||
            !Array.isArray(cloudOrder) ||
            !Array.isArray(localOrder)
        ) {
            return null;
        }

        const cloudSubjects =
            cloudLibrary.subjects &&
            typeof cloudLibrary.subjects === 'object' &&
            !Array.isArray(cloudLibrary.subjects)
                ? cloudLibrary.subjects
                : {};
        const localSubjects =
            localLibrary.subjects &&
            typeof localLibrary.subjects === 'object' &&
            !Array.isArray(localLibrary.subjects)
                ? localLibrary.subjects
                : {};

        const cloudLibraryMeta = cloneJson(cloudLibrary);
        const localLibraryMeta = cloneJson(localLibrary);
        delete cloudLibraryMeta.subjects;
        delete localLibraryMeta.subjects;

        if (!sameJson(cloudLibraryMeta, localLibraryMeta)) {
            return null;
        }

        const cloudIds = Object.keys(cloudSubjects);
        const localIds = Object.keys(localSubjects);
        const cloudIdSet = new Set(cloudIds);
        const localIdSet = new Set(localIds);

        if (cloudIds.some(id => !localIdSet.has(id))) {
            return null;
        }

        for (const id of cloudIds) {
            if (!sameJson(cloudSubjects[id], localSubjects[id])) {
                return null;
            }
        }

        const addedIds = localIds.filter(id => !cloudIdSet.has(id));
        if (!addedIds.length) return null;

        const cloudOrderExpected = localOrder.filter(id => cloudIdSet.has(id));
        if (!sameJson(cloudOrder, cloudOrderExpected)) {
            return null;
        }

        if (addedIds.some(id => !localOrder.includes(id))) {
            return null;
        }

        return {
            addedIds,
            addedCount: addedIds.length
        };
    }

    async function preview() {
        if (!window.AtlasCloud) {
            throw new Error('Atlas Cloud is unavailable.');
        }

        const subjectPreview = await requireSubjectsConnected();
        const local = await getLocalSnapshot(subjectPreview);
        const cloud = await AtlasCloud.getSubjectLibraryState();

        if (!cloud) {
            return cloneJson({
                status: 'missing',
                matching: false,
                expandable: false,
                conflict: false,
                subjectCount: local.subjectCount,
                categoryCount: local.categoryCount,
                dismissedCount: local.dismissedCount,
                addedSubjectCount: 0,
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
        const expansion = !matching && schemaMatches
            ? expansionDetails(cloud.state, local.state)
            : null;
        const expandable = Boolean(expansion);

        return cloneJson({
            status: matching
                ? 'matching'
                : expandable
                    ? 'expandable'
                    : 'conflict',
            matching,
            expandable,
            conflict: !matching && !expandable,
            subjectCount: local.subjectCount,
            categoryCount: local.categoryCount,
            dismissedCount: local.dismissedCount,
            addedSubjectCount: expansion?.addedCount || 0,
            addedSubjectIds: expansion?.addedIds || [],
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
                updated: false,
                verified: true,
                subjectCount: initial.subjectCount,
                categoryCount: initial.categoryCount,
                dismissedCount: initial.dismissedCount,
                revision: initial.cloudRevision
            });
        }

        const subjectPreview = await requireSubjectsConnected();
        const local = await getLocalSnapshot(subjectPreview);

        if (initial.expandable) {
            try {
                await AtlasCloud.updateSubjectLibraryState(
                    local.state,
                    initial.cloudRevision,
                    local.schemaVersion
                );
            } catch (error) {
                if (error?.code !== 'ATLAS_REVISION_CONFLICT') throw error;

                const afterConflict = await preview();
                if (!afterConflict.matching) throw error;
            }
        } else {
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
            created: !initial.expandable,
            updated: initial.expandable,
            verified: true,
            subjectCount: verification.subjectCount,
            categoryCount: verification.categoryCount,
            dismissedCount: verification.dismissedCount,
            revision: verification.cloudRevision
        });
    }

    window.AtlasLibraryMigration = Object.freeze({
        preview,
        claim,
        sameJson
    });
})();
