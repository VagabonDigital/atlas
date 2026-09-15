/* ============================================================
   ATLAS CLOUD
   Browser-side Supabase foundation for authenticated Atlas data.

   This module owns the vendor-specific connection/auth boundary and the
   first durable object: committed My Subjects. Product surfaces should
   continue to talk to Atlas persistence owners rather than Supabase
   directly; this adapter is the cloud implementation seam.
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
        const user = await getUser();

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

        let query = client
            .from('owned_subjects')
            .delete()
            .eq('id', id);

        if (expectedRevision !== null) {
            query = query.eq(
                'revision',
                Math.max(1, Math.floor(Number(expectedRevision) || 1))
            );
        }

        const { data, error } = await query
            .select('id')
            .maybeSingle();

        if (error) throw error;
        return Boolean(data && data.id === id);
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
        deleteOwnedSubject
    });
})();
