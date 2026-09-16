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

/*
 * Committed My Versions may be override-only records with an intentionally
 * empty document. Load the portable compatibility boundary before Backup v3
 * so export/restore validation matches the live Tutor Content model.
 */
(function bootstrapTutorContentPortableCompat() {
    'use strict';

    if (
        window.AtlasTutorContentPortableCompat ||
        document.querySelector(
            'script[data-atlas-tutor-content-portable-compat]'
        )
    ) {
        return;
    }

    const script = document.createElement('script');
    script.src =
        '/shared/atlas-tutor-content-portable-compat.js?v=20260916-backup3';
    script.async = false;
    script.dataset.atlasTutorContentPortableCompat = 'true';
    script.addEventListener(
        'error',
        () => {
            console.error(
                '[AtlasAccountCloud] Tutor Content portable compatibility could not load.'
            );
        },
        { once: true }
    );
    document.head.appendChild(script);
})();

/*
 * The root Settings surface already loads the legacy portable-data module.
 * Layer the canonical V3 exporter only after the Tutor Content compatibility
 * boundary is present, preventing backup semantics from racing runtime setup.
 */
(function bootstrapCanonicalBackupExport() {
    'use strict';

    let attempts = 0;

    function load() {
        if (
            window.AtlasPortableDataV3 ||
            document.querySelector(
                'script[data-atlas-portable-data-v3]'
            )
        ) {
            return;
        }

        if (
            !window.AtlasPortableData ||
            !window.AtlasTutorContentPortableCompat
        ) {
            attempts += 1;
            if (attempts < 200) {
                window.setTimeout(load, 50);
            }
            return;
        }

        try {
            window.AtlasTutorContentPortableCompat.ensurePatched?.();
        } catch { }

        const script = document.createElement('script');
        script.src =
            '/shared/atlas-portable-data-v3.js?v=20260916-backup3';
        script.async = false;
        script.dataset.atlasPortableDataV3 = 'true';
        script.addEventListener(
            'error',
            () => {
                console.error(
                    '[AtlasAccountCloud] Canonical backup export could not load.'
                );
            },
            { once: true }
        );
        document.head.appendChild(script);
    }

    load();
})();

/*
 * Safe restore is root-only product infrastructure. It layers over Backup v3,
 * adds account conflict preview, and calls the transaction-scoped restore RPC.
 * Loading it here keeps the existing Settings UI decoupled from Supabase.
 */
(function bootstrapSafeBackupRestore() {
    'use strict';

    if (
        window.location.pathname !== '/' &&
        window.location.pathname !== '/index.html'
    ) {
        return;
    }

    let attempts = 0;

    function load() {
        if (
            window.AtlasPortableRestoreV3 ||
            document.querySelector(
                'script[data-atlas-restore-v3]'
            )
        ) {
            return;
        }

        if (
            !window.AtlasPortableDataV3 ||
            !window.AtlasTutorContentPortableCompat
        ) {
            attempts += 1;
            if (attempts < 200) {
                window.setTimeout(load, 50);
            }
            return;
        }

        try {
            window.AtlasTutorContentPortableCompat.ensurePatched?.();
        } catch { }

        const script = document.createElement('script');
        script.src =
            '/shared/atlas-restore-v3.js?v=20260916-restore3';
        script.async = false;
        script.dataset.atlasRestoreV3 = 'true';
        script.addEventListener(
            'error',
            () => {
                console.error(
                    '[AtlasAccountCloud] Safe Backup v3 restore could not load.'
                );
            },
            { once: true }
        );
        document.head.appendChild(script);
    }

    load();
})();
