/* ============================================================
   ATLAS CLOUD
   Browser-side Supabase foundation for authenticated Atlas data.

   This module owns the vendor-specific connection/auth boundary for
   account-owned Atlas data. Product surfaces should continue to talk to
   Atlas persistence owners rather than Supabase directly; this adapter is
   the cloud seam.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasCloud) return;

    const SUPABASE_URL = 'https://jnhjfpagectprceswvqn.supabase.co';
    const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_VzDMy2xcmZm79DGAlg2r0A_ZNQJUO27';
    const SUPABASE_JS_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    const LOCAL_OWNER_ID = 'local-tutor';

    let clientPromise = null;

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function loadSupabaseLibrary() {
        if (
            window.supabase &&
            typeof window.supabase.createClient === 'function'
        ) {
            return Promise.resolve(window.supabase);
        }

        return new Promise((resolve, reject) => {
            const existing = document.querySelector(
                'script[data-atlas-supabase-library]'
            );

            if (existing) {
                existing.addEventListener(
                    'load',
                    () => resolve(window.supabase),
                    { once: true }
                );
                existing.addEventListener(
                    'error',
                    () => reject(
                        new Error('Atlas could not load the Supabase client.')
                    ),
                    { once: true }
                );
                return;
            }

            const script = document.createElement('script');
            script.src = SUPABASE_JS_URL;
            script.async = true;
            script.dataset.atlasSupabaseLibrary = 'true';
            script.onload = () => resolve(window.supabase);
            script.onerror = () => reject(
                new Error('Atlas could not load the Supabase client.')
            );
            document.head.appendChild(script);
        });
    }

    function getClient() {
        if (!clientPromise) {
            clientPromise = loadSupabaseLibrary().then(library => {
                if (
                    !library ||
                    typeof library.createClient !== 'function'
                ) {
                    throw new Error(
                        'Supabase loaded without a usable browser client.'
                    );
                }

                return library.createClient(
                    SUPABASE_URL,
                    SUPABASE_PUBLISHABLE_KEY,
                    {
                        auth: {
                            persistSession: true,
                            autoRefreshToken: true,
                            detectSessionInUrl: true
                        }
                    }
                );
            });
        }

        return clientPromise;
    }

    async function getSession() {
        const client = await getClient();
        const { data, error } = await client.auth.getSession();

        if (error) throw error;
        return data.session || null;
    }

    async function getUser() {
        const client = await getClient();
        const { data, error } = await client.auth.getUser();

        if (error) throw error;
        return data.user || null;
    }

    async function requireUser() {
        const session = await getSession();
        const user = session?.user || null;

        if (!user) {
            throw new Error('Atlas cloud access requires a signed-in user.');
        }

        return user;
    }

    async function signInWithPassword(email, password) {
        const client = await getClient();
        const { data, error } = await client.auth.signInWithPassword({
            email: String(email || '').trim(),
            password: String(password || '')
        });

        if (error) throw error;
        return data;
    }

    async function signOut() {
        const client = await getClient();
        const { error } = await client.auth.signOut();

        if (error) throw error;
        return true;
    }

    function atlasSubjectToRow(record, ownerUserId) {
        if (!record || typeof record !== 'object' || Array.isArray(record)) {
            throw new Error('AtlasCloud requires a My Subject record.');
        }

        const id = typeof record.id === 'string'
            ? record.id.trim()
            : '';

        if (!id) {
            throw new Error('My Subject requires a stable ID.');
        }

        if (
            record.format !== 'structured' ||
            !record.document ||
            typeof record.document !== 'object' ||
            Array.isArray(record.document)
        ) {
            throw new Error('My Subject requires a structured document.');
        }

        const revision = Math.max(
            1,
            Math.floor(Number(record.revision) || 1)
        );

        const row = {
            id,
            owner_user_id: ownerUserId,
            schema_version: Math.max(
                1,
                Math.floor(Number(record.schemaVersion) || 1)
            ),
            format: 'structured',
            metadata:
                record.metadata &&
                typeof record.metadata === 'object' &&
                !Array.isArray(record.metadata)
                    ? cloneJson(record.metadata)
                    : {},
            document: cloneJson(record.document),
            revision,
            provenance:
                record.provenance &&
                typeof record.provenance === 'object' &&
                !Array.isArray(record.provenance)
                    ? cloneJson(record.provenance)
                    : null
        };

        const createdAt = Number(record.createdAt);
        if (Number.isFinite(createdAt) && createdAt > 0) {
            row.created_at = new Date(createdAt).toISOString();
        }

        return row;
    }

    function rowToAtlasSubject(row) {
        if (!row || typeof row !== 'object') return null;

        return {
            schemaVersion: Math.max(
                1,
                Math.floor(Number(row.schema_version) || 1)
            ),
            id: String(row.id || ''),
            ownerId: LOCAL_OWNER_ID,
            format: row.format === 'structured'
                ? 'structured'
                : String(row.format || ''),
            metadata: cloneJson(row.metadata || {}),
            document: cloneJson(row.document || {}),
            revision: Math.max(
                1,
                Math.floor(Number(row.revision) || 1)
            ),
            createdAt: Date.parse(row.created_at) || 0,
            updatedAt: Date.parse(row.updated_at) || 0,
            provenance: row.provenance
                ? cloneJson(row.provenance)
                : null
        };
    }

    async function createOwnedSubject(record) {
        const client = await getClient();
        const user = await requireUser();
        const row = atlasSubjectToRow(record, user.id);

        const { data, error } = await client
            .from('owned_subjects')
            .insert(row)
            .select('*')
            .single();

        if (error) throw error;
        return rowToAtlasSubject(data);
    }

    async function getOwnedSubject(subjectId) {
        const client = await getClient();
        await requireUser();

        const id = String(subjectId || '').trim();
        if (!id) return null;

        const { data, error } = await client
            .from('owned_subjects')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return rowToAtlasSubject(data);
    }

    async function listOwnedSubjects() {
        const client = await getClient();
        await requireUser();

        const { data, error } = await client
            .from('owned_subjects')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return (data || [])
            .map(rowToAtlasSubject)
            .filter(Boolean);
    }

    async function updateOwnedSubject(record, expectedRevision) {
        const client = await getClient();
        const user = await requireUser();
        const previousRevision = Math.max(
            1,
            Math.floor(Number(expectedRevision) || 0)
        );

        if (!previousRevision) {
            throw new Error('Cloud update requires the previous revision.');
        }

        const nextRecord = {
            ...record,
            revision: previousRevision + 1
        };
        const row = atlasSubjectToRow(nextRecord, user.id);

        const update = {
            schema_version: row.schema_version,
            format: row.format,
            metadata: row.metadata,
            document: row.document,
            revision: row.revision,
            provenance: row.provenance
        };

        const { data, error } = await client
            .from('owned_subjects')
            .update(update)
            .eq('id', row.id)
            .eq('revision', previousRevision)
            .select('*')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const conflict = new Error(
                'This My Subject changed elsewhere before your save completed.'
            );
            conflict.code = 'ATLAS_REVISION_CONFLICT';
            throw conflict;
        }

        return rowToAtlasSubject(data);
    }

    async function deleteOwnedSubject(subjectId, expectedRevision = null) {
        const client = await getClient();
        await requireUser();

        const id = String(subjectId || '').trim();
        if (!id) return false;

        const revision =
            expectedRevision === null
                ? null
                : Math.max(
                    1,
                    Math.floor(Number(expectedRevision) || 1)
                );

        const { data, error } = await client.rpc(
            'atlas_delete_owned_subject_v1',
            {
                p_subject_id: id,
                p_expected_revision: revision
            }
        );

        if (error) throw error;

        if (data?.conflict === true) {
            const conflict = new Error(
                'This My Subject changed elsewhere before deletion completed.'
            );
            conflict.code = 'ATLAS_REVISION_CONFLICT';
            throw conflict;
        }

        return data?.deleted === true;
    }

    function rowToSubjectLibraryState(row) {
        if (!row || typeof row !== 'object') return null;

        return {
            schemaVersion: Math.max(
                1,
                Math.floor(Number(row.schema_version) || 1)
            ),
            revision: Math.max(
                1,
                Math.floor(Number(row.revision) || 1)
            ),
            state:
                row.state &&
                typeof row.state === 'object' &&
                !Array.isArray(row.state)
                    ? cloneJson(row.state)
                    : {},
            createdAt: Date.parse(row.created_at) || 0,
            updatedAt: Date.parse(row.updated_at) || 0
        };
    }

    async function getSubjectLibraryState() {
        const client = await getClient();
        const user = await requireUser();

        const { data, error } = await client
            .from('subject_library_state')
            .select('*')
            .eq('owner_user_id', user.id)
            .maybeSingle();

        if (error) throw error;
        return rowToSubjectLibraryState(data);
    }

    async function createSubjectLibraryState(state, schemaVersion = 1) {
        const client = await getClient();
        const user = await requireUser();
        const payload =
            state &&
            typeof state === 'object' &&
            !Array.isArray(state)
                ? cloneJson(state)
                : {};

        const { data, error } = await client
            .from('subject_library_state')
            .insert({
                owner_user_id: user.id,
                schema_version: Math.max(
                    1,
                    Math.floor(Number(schemaVersion) || 1)
                ),
                revision: 1,
                state: payload
            })
            .select('*')
            .single();

        if (error) throw error;
        return rowToSubjectLibraryState(data);
    }

    async function updateSubjectLibraryState(
        state,
        expectedRevision,
        schemaVersion = 1
    ) {
        const client = await getClient();
        const user = await requireUser();
        const previousRevision = Math.max(
            1,
            Math.floor(Number(expectedRevision) || 0)
        );

        if (!previousRevision) {
            throw new Error('Cloud library update requires the previous revision.');
        }

        const payload =
            state &&
            typeof state === 'object' &&
            !Array.isArray(state)
                ? cloneJson(state)
                : {};

        const { data, error } = await client
            .from('subject_library_state')
            .update({
                schema_version: Math.max(
                    1,
                    Math.floor(Number(schemaVersion) || 1)
                ),
                revision: previousRevision + 1,
                state: payload
            })
            .eq('owner_user_id', user.id)
            .eq('revision', previousRevision)
            .select('*')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const conflict = new Error(
                'Your My Subjects library changed elsewhere before this save completed.'
            );
            conflict.code = 'ATLAS_REVISION_CONFLICT';
            throw conflict;
        }

        return rowToSubjectLibraryState(data);
    }

    function tutorContentVersionToRow(record, ownerUserId) {
        if (!record || typeof record !== 'object' || Array.isArray(record)) {
            throw new Error('AtlasCloud requires a Tutor Content version.');
        }

        const contentId = String(record.contentId || '').trim();
        if (!contentId) {
            throw new Error('Tutor Content version requires contentId.');
        }

        if (
            !record.document ||
            typeof record.document !== 'object' ||
            Array.isArray(record.document)
        ) {
            throw new Error('Tutor Content version requires a document.');
        }

        const overrides =
            record.overrides &&
            typeof record.overrides === 'object' &&
            !Array.isArray(record.overrides)
                ? cloneJson(record.overrides)
                : {};

        return {
            owner_user_id: ownerUserId,
            content_id: contentId,
            schema_version: Math.max(
                1,
                Math.floor(Number(record.schemaVersion) || 2)
            ),
            base_content_version:
                typeof record.baseContentVersion === 'string'
                    ? record.baseContentVersion
                    : '',
            revision: Math.max(
                0,
                Math.floor(Number(record.revision) || 0)
            ),
            overrides,
            document: cloneJson(record.document)
        };
    }

    function rowToTutorContentVersion(row) {
        if (!row || typeof row !== 'object') return null;

        const contentId = String(row.content_id || '').trim();
        if (!contentId) return null;

        return {
            schemaVersion: Math.max(
                1,
                Math.floor(Number(row.schema_version) || 2)
            ),
            ownerId: LOCAL_OWNER_ID,
            contentId,
            baseContentVersion:
                typeof row.base_content_version === 'string'
                    ? row.base_content_version
                    : '',
            revision: Math.max(
                0,
                Math.floor(Number(row.revision) || 0)
            ),
            updatedAt: Date.parse(row.updated_at) || 0,
            overrides:
                row.overrides &&
                typeof row.overrides === 'object' &&
                !Array.isArray(row.overrides)
                    ? cloneJson(row.overrides)
                    : {},
            document: cloneJson(row.document || {})
        };
    }

    async function createTutorContentVersion(record) {
        const client = await getClient();
        const user = await requireUser();
        const row = tutorContentVersionToRow(record, user.id);

        const { data, error } = await client
            .from('tutor_content_versions')
            .insert(row)
            .select('*')
            .single();

        if (error) throw error;
        return rowToTutorContentVersion(data);
    }

    async function getTutorContentVersion(contentId) {
        const client = await getClient();
        const user = await requireUser();
        const id = String(contentId || '').trim();

        if (!id) return null;

        const { data, error } = await client
            .from('tutor_content_versions')
            .select('*')
            .eq('owner_user_id', user.id)
            .eq('content_id', id)
            .maybeSingle();

        if (error) throw error;
        return rowToTutorContentVersion(data);
    }

    async function listTutorContentVersions() {
        const client = await getClient();
        const user = await requireUser();

        const { data, error } = await client
            .from('tutor_content_versions')
            .select('*')
            .eq('owner_user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return (data || [])
            .map(rowToTutorContentVersion)
            .filter(Boolean);
    }

    async function updateTutorContentVersion(record, expectedRevision) {
        const client = await getClient();
        const user = await requireUser();
        const previousRevision = Math.max(
            0,
            Math.floor(Number(expectedRevision) || 0)
        );
        const row = tutorContentVersionToRow(
            {
                ...record,
                revision: previousRevision + 1
            },
            user.id
        );

        const { data, error } = await client
            .from('tutor_content_versions')
            .update({
                schema_version: row.schema_version,
                base_content_version: row.base_content_version,
                revision: row.revision,
                overrides: row.overrides,
                document: row.document
            })
            .eq('owner_user_id', user.id)
            .eq('content_id', row.content_id)
            .eq('revision', previousRevision)
            .select('*')
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const conflict = new Error(
                'This My Version changed elsewhere before your save completed.'
            );
            conflict.code = 'ATLAS_REVISION_CONFLICT';
            throw conflict;
        }

        return rowToTutorContentVersion(data);
    }

    async function deleteTutorContentVersion(contentId, expectedRevision = null) {
        const client = await getClient();
        const user = await requireUser();
        const id = String(contentId || '').trim();

        if (!id) return false;

        let query = client
            .from('tutor_content_versions')
            .delete()
            .eq('owner_user_id', user.id)
            .eq('content_id', id);

        if (expectedRevision !== null) {
            query = query.eq(
                'revision',
                Math.max(0, Math.floor(Number(expectedRevision) || 0))
            );
        }

        const { data, error } = await query
            .select('content_id')
            .maybeSingle();

        if (error) throw error;
        return Boolean(data && data.content_id === id);
    }

    async function status() {
        const session = await getSession();

        return {
            configured: true,
            authenticated: Boolean(session && session.user),
            userId: session?.user?.id || null,
            email: session?.user?.email || null
        };
    }

    window.AtlasCloud = Object.freeze({
        getClient,
        getSession,
        getUser,
        signInWithPassword,
        signOut,
        status,
        createOwnedSubject,
        getOwnedSubject,
        listOwnedSubjects,
        updateOwnedSubject,
        deleteOwnedSubject,
        getSubjectLibraryState,
        createSubjectLibraryState,
        updateSubjectLibraryState,
        createTutorContentVersion,
        getTutorContentVersion,
        listTutorContentVersions,
        updateTutorContentVersion,
        deleteTutorContentVersion
    });
})();
