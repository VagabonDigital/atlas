/* ============================================================
   ATLAS SUBJECT MIGRATION
   One-time claim path for pre-account local My Subjects.

   Cloud-authority rule:
   - if a subject ID already exists in the signed-in account, it is
     already connected and the cloud record wins;
   - only local subject IDs missing from the account are inserted;
   - migration never overwrites an existing cloud subject;
   - once a legacy subject has been observed connected, a later cloud
     deletion is treated as intentional and is never offered for migration;
   - local-only remnants can also be left in this browser explicitly;
   - migration memory is scoped to the signed-in account.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasSubjectMigration) return;

    const DISMISSED_KEY_PREFIX =
        'atlas::migration::dismissedSubjectIds::';
    const CONNECTED_KEY_PREFIX =
        'atlas::migration::connectedSubjectIds::';

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

    async function accountStorageKey(prefix, purpose) {
        const session = await AtlasCloud.getSession();
        const userId = String(session?.user?.id || '').trim();

        if (!userId) {
            throw new Error(
                `Subject migration ${purpose} requires a signed-in Atlas account.`
            );
        }

        return `${prefix}${userId}`;
    }

    async function readIdSet(prefix, purpose) {
        const key = await accountStorageKey(prefix, purpose);

        try {
            const parsed = JSON.parse(
                localStorage.getItem(key) || '[]'
            );

            if (!Array.isArray(parsed)) return new Set();

            return new Set(
                parsed
                    .map(value => String(value || '').trim())
                    .filter(Boolean)
            );
        } catch {
            return new Set();
        }
    }

    async function writeIdSet(prefix, purpose, ids) {
        const key = await accountStorageKey(prefix, purpose);
        const values = Array.from(ids)
            .map(value => String(value || '').trim())
            .filter(Boolean)
            .sort();

        if (values.length) {
            localStorage.setItem(key, JSON.stringify(values));
        } else {
            localStorage.removeItem(key);
        }
    }

    function readDismissedIds() {
        return readIdSet(DISMISSED_KEY_PREFIX, 'dismissals');
    }

    function writeDismissedIds(ids) {
        return writeIdSet(
            DISMISSED_KEY_PREFIX,
            'dismissals',
            ids
        );
    }

    function readConnectedIds() {
        return readIdSet(CONNECTED_KEY_PREFIX, 'history');
    }

    function writeConnectedIds(ids) {
        return writeIdSet(
            CONNECTED_KEY_PREFIX,
            'history',
            ids
        );
    }

    function portableSubject(subject) {
        return {
            id: subject.id,
            title: subject.metadata?.title || subject.id
        };
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

        const connected = [];
        const localOnly = [];

        localSubjects.forEach(local => {
            if (cloudById.has(local.id)) {
                connected.push(local);
                return;
            }

            localOnly.push(local);
        });

        // Remember every legacy browser subject that has ever been seen in
        // this account. If it disappears from cloud later, that is a normal
        // product deletion — not an invitation to migrate the stale local copy.
        const connectedIds = await readConnectedIds();
        let connectedHistoryChanged = false;

        connected.forEach(subject => {
            if (!connectedIds.has(subject.id)) {
                connectedIds.add(subject.id);
                connectedHistoryChanged = true;
            }
        });

        if (connectedHistoryChanged) {
            await writeConnectedIds(connectedIds);
        }

        const validLocalOnlyIds = new Set(
            localOnly.map(subject => subject.id)
        );
        const dismissedIds = await readDismissedIds();
        let dismissalChanged = false;

        Array.from(dismissedIds).forEach(id => {
            if (!validLocalOnlyIds.has(id)) {
                dismissedIds.delete(id);
                dismissalChanged = true;
            }
        });

        if (dismissalChanged) {
            await writeDismissedIds(dismissedIds);
        }

        const retired = localOnly.filter(subject =>
            connectedIds.has(subject.id)
        );
        const explicitlyDismissed = localOnly.filter(subject =>
            !connectedIds.has(subject.id) &&
            dismissedIds.has(subject.id)
        );
        const excluded = [
            ...retired,
            ...explicitlyDismissed
        ];
        const excludedIds = new Set(
            excluded.map(subject => subject.id)
        );
        const missing = localOnly.filter(subject =>
            !excludedIds.has(subject.id)
        );

        const localIds = new Set(localSubjects.map(subject => subject.id));
        const cloudOnly = cloudSubjects.filter(subject => !localIds.has(subject.id));

        return cloneJson({
            localCount: localSubjects.length,
            cloudCount: cloudSubjects.length,
            missingCount: missing.length,
            matchingCount: connected.length,
            dismissedCount: excluded.length,
            explicitlyDismissedCount: explicitlyDismissed.length,
            retiredCount: retired.length,
            resolvedCount: connected.length + excluded.length,
            conflictCount: 0,
            cloudOnlyCount: cloudOnly.length,
            conflicts: [],
            missingIds: missing.map(subject => subject.id),
            missingSubjects: missing.map(portableSubject),
            dismissedSubjects: excluded.map(portableSubject),
            explicitlyDismissedSubjects:
                explicitlyDismissed.map(portableSubject),
            retiredSubjects: retired.map(portableSubject)
        });
    }

    async function dismissMissing(subjectIds) {
        const requested = new Set(
            (Array.isArray(subjectIds) ? subjectIds : [subjectIds])
                .map(value => String(value || '').trim())
                .filter(Boolean)
        );

        if (!requested.size) return preview();

        const current = await preview();
        const available = new Set(current.missingIds || []);
        const dismissed = await readDismissedIds();

        requested.forEach(id => {
            if (available.has(id)) dismissed.add(id);
        });

        await writeDismissedIds(dismissed);
        return preview();
    }

    async function restoreDismissed(subjectIds) {
        const requested = new Set(
            (Array.isArray(subjectIds) ? subjectIds : [subjectIds])
                .map(value => String(value || '').trim())
                .filter(Boolean)
        );
        const dismissed = await readDismissedIds();

        requested.forEach(id => dismissed.delete(id));
        await writeDismissedIds(dismissed);

        return preview();
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
            verification.resolvedCount !== verification.localCount
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
            dismissed: verification.dismissedCount,
            resolved: verification.resolvedCount,
            localCount: verification.localCount,
            cloudCount: verification.cloudCount,
            cloudOnlyCount: verification.cloudOnlyCount
        });
    }

    window.AtlasSubjectMigration = Object.freeze({
        preview,
        claim,
        dismissMissing,
        restoreDismissed,
        sameJson
    });
})();
