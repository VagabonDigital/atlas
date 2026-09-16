/* ============================================================
   ATLAS ACCOUNT CLOUD
   Supabase-specific account lifecycle and entitlement adapter.

   AtlasCloud owns the shared Supabase browser client. AtlasAccountCloud keeps
   signup, recovery and entitlement reads out of product UI code so AtlasAccount
   can remain the stable product-facing account contract.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasAccountCloud) return;

    function requireAtlasCloud() {
        if (!window.AtlasCloud || typeof AtlasCloud.getClient !== 'function') {
            throw new Error('AtlasAccountCloud requires AtlasCloud.');
        }
    }

    function normalizeEmail(email) {
        return String(email || '').trim();
    }

    function normalizePassword(password) {
        return String(password || '');
    }

    function normalizeRedirectUrl(redirectTo) {
        const value = String(redirectTo || '').trim();
        return value || new URL('/account/', window.location.origin).href;
    }

    async function signUpWithPassword(email, password, redirectTo) {
        requireAtlasCloud();
        const client = await AtlasCloud.getClient();
        const { data, error } = await client.auth.signUp({
            email: normalizeEmail(email),
            password: normalizePassword(password),
            options: {
                emailRedirectTo: normalizeRedirectUrl(redirectTo)
            }
        });

        if (error) throw error;
        return data;
    }

    async function requestPasswordReset(email, redirectTo) {
        requireAtlasCloud();
        const client = await AtlasCloud.getClient();
        const { data, error } = await client.auth.resetPasswordForEmail(
            normalizeEmail(email),
            {
                redirectTo: normalizeRedirectUrl(redirectTo)
            }
        );

        if (error) throw error;
        return data;
    }

    async function updatePassword(password) {
        requireAtlasCloud();
        const client = await AtlasCloud.getClient();
        const { data, error } = await client.auth.updateUser({
            password: normalizePassword(password)
        });

        if (error) throw error;
        return data;
    }

    async function getAccountEntitlement() {
        requireAtlasCloud();
        const client = await AtlasCloud.getClient();
        const user = await AtlasCloud.getUser();

        if (!user?.id) {
            return null;
        }

        const { data, error } = await client
            .from('account_entitlements')
            .select('schema_version, plan_code, capabilities, updated_at')
            .eq('owner_user_id', user.id)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        return {
            schemaVersion: Math.max(
                1,
                Math.floor(Number(data.schema_version) || 1)
            ),
            planCode: String(data.plan_code || '').trim() || 'free',
            capabilities:
                data.capabilities &&
                typeof data.capabilities === 'object' &&
                !Array.isArray(data.capabilities)
                    ? JSON.parse(JSON.stringify(data.capabilities))
                    : {},
            updatedAt: Date.parse(data.updated_at) || 0
        };
    }

    window.AtlasAccountCloud = Object.freeze({
        signUpWithPassword,
        requestPasswordReset,
        updatePassword,
        getAccountEntitlement
    });
})();
