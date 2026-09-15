/* ============================================================
   ATLAS CLOUD
   Supabase adapter for durable account-owned Atlas data.

   This module deliberately sits beside AtlasBridge rather than replacing it.
   AtlasBridge remains the shared product state contract; AtlasCloud owns the
   vendor-specific browser connection, authentication session, and durable
   owned-subject CRUD.
   ============================================================ */

(function () {
    'use strict';

    const SUPABASE_URL = 'https://jnhjfpagectprceswvqn.supabase.co';
    const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_VzDMy2xcmZm79DGAlg2r0A_ZNQJUO27';
    const SUPABASE_JS_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

    let clientPromise = null;

    function loadSupabaseLibrary() {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            return Promise.resolve(window.supabase);
        }

        return new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-atlas-supabase]');

            if (existing) {
                existing.addEventListener('load', () => resolve(window.supabase), { once: true });
                existing.addEventListener('error', () => reject(new Error('AtlasCloud could not load Supabase.')), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = SUPABASE_JS_URL;
            script.async = true;
            script.dataset.atlasSupabase = 'true';
            script.onload = () => resolve(window.supabase);
            script.onerror = () => reject(new Error('AtlasCloud could not load Supabase.'));
            document.head.appendChild(script);
        });
    }

    function getClient() {
        if (!clientPromise) {
            clientPromise = loadSupabaseLibrary().then((library) => {
                if (!library || typeof library.createClient !== 'function') {
                    throw new Error('AtlasCloud loaded Supabase without createClient().');
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

    async function signInWithPassword(email, password) {
        const client = await getClient();
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    }

    async function signUpWithPassword(email, password) {
        const client = await getClient();
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    }

    async function signOut() {
        const client = await getClient();
        const { error } = await client.auth.signOut();
        if (error) throw error;
    }

    async function requireUser() {
        const user = await getUser();
        if (!user) throw new Error('AtlasCloud requires an authenticated user.');
        return user;
    }

    function normalizeOwnedSubject(record, ownerUserId) {
        if (!record || !record.id) {
            throw new Error('AtlasCloud owned subject requires a stable id.');
        }

        return {
            id: String(record.id),
            owner_user_id: ownerUserId,
            kind: record.kind === 'version' ? 'version' : 'created',
            source_resource_id: record.source_resource_id || record.sourceResourceId || null,
            source_revision: record.source_revision ?? record.sourceRevision ?? null,
            revision: Math.max(1, Number(record.revision) || 1),
            document: record.document && typeof record.document === 'object' ? record.document : {},
            metadata: record.metadata && typeof record.metadata === 'object' ? record.metadata : {},
            provenance: record.provenance && typeof record.provenance === 'object' ? record.provenance : {},
            archived_at: record.archived_at || record.archivedAt || null
        };
    }

    async function listOwnedSubjects({ includeArchived = false } = {}) {
        const client = await getClient();
        await requireUser();

        let query = client
            .from('owned_subjects')
            .select('*')
            .order('updated_at', { ascending: false });

        if (!includeArchived) query = query.is('archived_at', null);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async function getOwnedSubject(id) {
        const client = await getClient();
        await requireUser();

        const { data, error } = await client
            .from('owned_subjects')
            .select('*')
            .eq('id', String(id))
            .maybeSingle();

        if (error) throw error;
        return data || null;
    }

    async function saveOwnedSubject(record) {
        const client = await getClient();
        const user = await requireUser();
        const row = normalizeOwnedSubject(record, user.id);

        const { data, error } = await client
            .from('owned_subjects')
            .upsert(row, { onConflict: 'id' })
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }

    async function deleteOwnedSubject(id) {
        const client = await getClient();
        await requireUser();

        const { error } = await client
            .from('owned_subjects')
            .delete()
            .eq('id', String(id));

        if (error) throw error;
        return true;
    }

    async function health() {
        const session = await getSession();
        return {
            configured: true,
            authenticated: Boolean(session && session.user),
            userId: session && session.user ? session.user.id : null
        };
    }

    window.AtlasCloud = Object.freeze({
        getClient,
        getSession,
        getUser,
        signInWithPassword,
        signUpWithPassword,
        signOut,
        listOwnedSubjects,
        getOwnedSubject,
        saveOwnedSubject,
        deleteOwnedSubject,
        health
    });
})();
