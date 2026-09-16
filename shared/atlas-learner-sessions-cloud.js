/* ============================================================
   ATLAS LEARNER SESSIONS — CLOUD ADAPTER

   Vendor-specific persistence seam for account-owned learner/session
   continuity. AtlasBridge remains the product/runtime contract.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasLearnerSessionsCloud) return;

    const SCHEMA_VERSION = 1;

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function requireCloud() {
        if (!window.AtlasCloud) {
            throw new Error(
                'AtlasLearnerSessionsCloud requires AtlasCloud.'
            );
        }

        return window.AtlasCloud;
    }

    async function requireUser() {
        const Cloud = requireCloud();
        const session = await Cloud.getSession();
        const user = session?.user || null;

        if (!user) {
            throw new Error(
                'Learner session cloud access requires a signed-in Atlas account.'
            );
        }

        return user;
    }

    function normalizeMemory(memory, sessionId) {
        const candidate =
            memory &&
            typeof memory === 'object' &&
            !Array.isArray(memory)
                ? memory
                : {};

        return {
            schemaVersion: 1,
            sessionId,
            about: typeof candidate.about === 'string'
                ? candidate.about
                : '',
            interests: typeof candidate.interests === 'string'
                ? candidate.interests
                : '',
            notes: typeof candidate.notes === 'string'
                ? candidate.notes
                : '',
            nextTime: typeof candidate.nextTime === 'string'
                ? candidate.nextTime
                : '',
            updatedAt: Math.max(
                0,
                Number(candidate.updatedAt) || 0
            )
        };
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

    function normalizeRecord(record) {
        if (
            !record ||
            typeof record !== 'object' ||
            Array.isArray(record)
        ) {
            return null;
        }

        const id = String(record.id || '').trim();
        const name = String(record.name || '').trim();

        if (!id || !name) return null;

        const timestamp = Date.now();

        return {
            schemaVersion: SCHEMA_VERSION,
            id,
            name,
            revision: Math.max(
                1,
                Math.floor(Number(record.revision) || 1)
            ),
            memory: normalizeMemory(record.memory, id),
            subjectRefsSupported:
                record.subjectRefsSupported === true,
            subjectRefs:
                normalizeSubjectRefs(record.subjectRefs),
            subjectRefsMigrated:
                record.subjectRefsMigrated === true,
            createdAt: Math.max(
                0,
                Number(record.createdAt) || timestamp
            ),
            updatedAt: Math.max(
                0,
                Number(record.updatedAt) || timestamp
            ),
            lastActiveAt: Math.max(
                0,
                Number(record.lastActiveAt) || timestamp
            )
        };
    }

    function recordToRow(record, ownerUserId) {
        const normalized = normalizeRecord(record);

        if (!normalized) {
            throw new Error(
                'Atlas learner session requires a stable id and name.'
            );
        }

        const row = {
            owner_user_id: ownerUserId,
            id: normalized.id,
            schema_version: normalized.schemaVersion,
            name: normalized.name,
            revision: normalized.revision,
            memory: cloneJson(normalized.memory),
            created_at: new Date(normalized.createdAt).toISOString(),
            updated_at: new Date(normalized.updatedAt).toISOString(),
            last_active_at: new Date(normalized.lastActiveAt).toISOString()
        };

        if (normalized.subjectRefsSupported) {
            row.subject_refs =
                cloneJson(normalized.subjectRefs);
            row.subject_refs_migrated =
                normalized.subjectRefsMigrated;
        }

        return row;
    }

    function rowToRecord(row) {
        if (!row || typeof row !== 'object') return null;

        const id = String(row.id || '').trim();
        const name = String(row.name || '').trim();

        if (!id || !name) return null;

        const subjectRefsSupported =
            Object.prototype.hasOwnProperty.call(
                row,
                'subject_refs'
            ) &&
            Object.prototype.hasOwnProperty.call(
                row,
                'subject_refs_migrated'
            );

        return normalizeRecord({
            schemaVersion: row.schema_version,
            id,
            name,
            revision: row.revision,
            memory: row.memory,
            subjectRefsSupported,
            subjectRefs:
                subjectRefsSupported
                    ? row.subject_refs
                    : [],
            subjectRefsMigrated:
                subjectRefsSupported &&
                row.subject_refs_migrated === true,
            createdAt: Date.parse(row.created_at) || 0,
            updatedAt: Date.parse(row.updated_at) || 0,
            lastActiveAt: Date.parse(row.last_active_at) || 0
        });
    }

    function isSubjectRefsSchemaError(error) {
        const code = String(error?.code || '').trim();
        const message = String(error?.message || '').toLowerCase();

        return (
            (
                code === 'PGRST204' ||
                code === '42703'
            ) &&
            (
                message.includes('subject_refs') ||
                message.includes('subject_refs_migrated')
            )
        );
    }

    function withoutSubjectRefColumns(row) {
        const legacy = { ...row };
        delete legacy.subject_refs;
        delete legacy.subject_refs_migrated;
        return legacy;
    }

    async function createLearnerSession(record) {
        const Cloud = requireCloud();
        const client = await Cloud.getClient();
        const user = await requireUser();
        const row = recordToRow(record, user.id);

        let response = await client
            .from('learner_sessions')
            .insert(row)
            .select('*')
            .single();

        if (
            response.error &&
            Object.prototype.hasOwnProperty.call(
                row,
                'subject_refs'
            ) &&
            isSubjectRefsSchemaError(response.error)
        ) {
            response = await client
                .from('learner_sessions')
                .insert(
                    withoutSubjectRefColumns(row)
                )
                .select('*')
                .single();
        }

        if (response.error) throw response.error;
        return rowToRecord(response.data);
    }

    async function getLearnerSession(sessionId) {
        const Cloud = requireCloud();
        const client = await Cloud.getClient();
        const user = await requireUser();
        const id = String(sessionId || '').trim();

        if (!id) return null;

        const { data, error } = await client
            .from('learner_sessions')
            .select('*')
            .eq('owner_user_id', user.id)
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return rowToRecord(data);
    }

    async function listLearnerSessions() {
        const Cloud = requireCloud();
        const client = await Cloud.getClient();
        const user = await requireUser();

        const { data, error } = await client
            .from('learner_sessions')
            .select('*')
            .eq('owner_user_id', user.id)
            .order('last_active_at', { ascending: false });

        if (error) throw error;

        return (data || [])
            .map(rowToRecord)
            .filter(Boolean);
    }

    async function updateLearnerSession(
        record,
        expectedRevision
    ) {
        const Cloud = requireCloud();
        const client = await Cloud.getClient();
        const user = await requireUser();
        const previousRevision = Math.max(
            1,
            Math.floor(Number(expectedRevision) || 0)
        );

        if (!previousRevision) {
            throw new Error(
                'Learner session cloud update requires the previous revision.'
            );
        }

        const row = recordToRow(
            {
                ...record,
                revision: previousRevision + 1,
                updatedAt: Date.now()
            },
            user.id
        );

        const buildMutation = payload =>
            client
                .from('learner_sessions')
                .update(payload)
                .eq('owner_user_id', user.id)
                .eq('id', row.id)
                .eq('revision', previousRevision)
                .select('*')
                .maybeSingle();

        const payload = {
            schema_version: row.schema_version,
            name: row.name,
            revision: row.revision,
            memory: row.memory,
            last_active_at: row.last_active_at
        };

        if (
            Object.prototype.hasOwnProperty.call(
                row,
                'subject_refs'
            )
        ) {
            payload.subject_refs = row.subject_refs;
            payload.subject_refs_migrated =
                row.subject_refs_migrated;
        }

        let response = await buildMutation(payload);

        if (
            response.error &&
            Object.prototype.hasOwnProperty.call(
                payload,
                'subject_refs'
            ) &&
            isSubjectRefsSchemaError(response.error)
        ) {
            const legacyPayload = { ...payload };
            delete legacyPayload.subject_refs;
            delete legacyPayload.subject_refs_migrated;
            response = await buildMutation(legacyPayload);
        }

        if (response.error) throw response.error;

        if (!response.data) {
            const conflict = new Error(
                'This learner changed elsewhere before your save completed.'
            );
            conflict.code = 'ATLAS_REVISION_CONFLICT';
            throw conflict;
        }

        return rowToRecord(response.data);
    }

    async function deleteLearnerSession(
        sessionId,
        expectedRevision = null
    ) {
        const Cloud = requireCloud();
        const client = await Cloud.getClient();
        const user = await requireUser();
        const id = String(sessionId || '').trim();

        if (!id) return false;

        let query = client
            .from('learner_sessions')
            .delete()
            .eq('owner_user_id', user.id)
            .eq('id', id);

        if (expectedRevision !== null) {
            query = query.eq(
                'revision',
                Math.max(
                    1,
                    Math.floor(Number(expectedRevision) || 1)
                )
            );
        }

        const { data, error } = await query
            .select('id')
            .maybeSingle();

        if (error) throw error;
        return Boolean(data && data.id === id);
    }

    window.AtlasLearnerSessionsCloud = Object.freeze({
        normalizeMemory,
        normalizeSubjectRefs,
        normalizeRecord,
        createLearnerSession,
        getLearnerSession,
        listLearnerSessions,
        updateLearnerSession,
        deleteLearnerSession
    });
})();

/*
 * Learner continuity is a separate account-owned object, but every Atlas
 * teaching surface already loads the learner-session cloud adapter through
 * AtlasSessionPanel. Bootstrap the continuity authority from this stable seam
 * so root, Compass, and Arcade all receive the same persistence layer without
 * product-specific wiring.
 */
(function bootstrapLearnerContinuityAuthority() {
    'use strict';

    if (
        window.AtlasLearnerContinuityCloudAuthority ||
        document.querySelector(
            'script[data-atlas-learner-continuity-cloud]'
        )
    ) {
        return;
    }

    const script = document.createElement('script');
    script.src =
        '/shared/atlas-learner-continuity-cloud-authority.js?v=20260915-continuity1';
    script.async = false;
    script.dataset.atlasLearnerContinuityCloud = 'true';
    document.head.appendChild(script);
})();
