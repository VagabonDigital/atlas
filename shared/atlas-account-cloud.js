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

    const AUTH_STORAGE_KEY =
        'sb-jnhjfpagectprceswvqn-auth-token';

    const AUTH_SESSION_ERROR_CODES = new Set([
        'refresh_token_not_found',
        'refresh_token_already_used',
        'session_not_found',
        'bad_jwt',
        'pgrst301',
        'pgrst302',
        'pgrst303'
    ]);

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

    function isAuthSessionError(error) {
        const code = String(error?.code || '').trim().toLowerCase();
        const name = String(error?.name || '').trim().toLowerCase();
        const message = String(error?.message || error || '')
            .trim()
            .toLowerCase();
        const status = Number(
            error?.status ||
            error?.statusCode ||
            error?.httpStatusCode ||
            0
        );

        if (status === 401) return true;
        if (AUTH_SESSION_ERROR_CODES.has(code)) return true;

        if (
            name.includes('authsessionmissing') ||
            name.includes('sessionmissing')
        ) {
            return true;
        }

        return [
            'refresh token not found',
            'invalid refresh token',
            'refresh token has already been used',
            'auth session missing',
            'session missing',
            'session has expired',
            'jwt expired',
            'jwt is expired',
            'invalid jwt',
            'invalid claim: missing sub',
            'user from sub claim in jwt does not exist'
        ].some(fragment => message.includes(fragment));
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

    async function updateEmail(email, redirectTo) {
        requireAtlasCloud();

        const nextEmail = normalizeEmail(email);

        if (!nextEmail) {
            throw new Error(
                'Enter the new email address for this Atlas account.'
            );
        }

        const client = await AtlasCloud.getClient();
        const { data, error } = await client.auth.updateUser(
            {
                email: nextEmail
            },
            {
                emailRedirectTo:
                    normalizeRedirectUrl(redirectTo)
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

    async function updatePasswordWithCurrentCredentials(
        email,
        currentPassword,
        password
    ) {
        requireAtlasCloud();

        const client = await AtlasCloud.getClient();
        const signInResult =
            await client.auth.signInWithPassword({
                email: normalizeEmail(email),
                password:
                    normalizePassword(
                        currentPassword
                    )
            });

        if (signInResult?.error) {
            const message =
                String(
                    signInResult.error?.message ||
                    signInResult.error ||
                    ''
                ).toLowerCase();

            if (
                message.includes(
                    'invalid login credentials'
                ) ||
                message.includes(
                    'invalid email or password'
                )
            ) {
                const error = new Error(
                    'Your current password is incorrect.'
                );
                error.code =
                    'ATLAS_CURRENT_PASSWORD_INVALID';
                throw error;
            }

            throw signInResult.error;
        }

        const { data, error } =
            await client.auth.updateUser({
                password:
                    normalizePassword(password)
            });

        if (error) throw error;
        return data;
    }

    async function signOutCurrentSession() {
        requireAtlasCloud();
        const client = await AtlasCloud.getClient();
        const { error } = await client.auth.signOut({
            scope: 'local'
        });

        if (error && !isAuthSessionError(error)) {
            throw error;
        }

        if (error) {
            try {
                localStorage.removeItem(AUTH_STORAGE_KEY);
            } catch { }
        }

        return true;
    }

    async function reconcileCurrentSession() {
        requireAtlasCloud();
        const client = await AtlasCloud.getClient();
        const { data, error } = await client.auth.getUser();

        if (!error && data?.user) {
            return {
                valid: true,
                user: data.user
            };
        }

        if (error && !isAuthSessionError(error)) {
            throw error;
        }

        const signOutResult = await client.auth.signOut({
            scope: 'local'
        });

        if (
            signOutResult?.error &&
            !isAuthSessionError(signOutResult.error)
        ) {
            throw signOutResult.error;
        }

        try {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch { }

        return {
            valid: false,
            user: null
        };
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
        updateEmail,
        updatePassword,
        updatePasswordWithCurrentCredentials,
        signOutCurrentSession,
        reconcileCurrentSession,
        isAuthSessionError,
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
 * Supabase jsonb can return semantically identical library objects with a
 * different JavaScript key order. The legacy Tutor Subjects validator uses
 * JSON.stringify equality, so install an order-only compatibility boundary
 * before Backup v3 preview/restore validation.
 */
(function bootstrapTutorSubjectsPortableCompat() {
    'use strict';

    if (
        window.AtlasTutorSubjectsPortableCompat ||
        document.querySelector(
            'script[data-atlas-tutor-subjects-portable-compat]'
        )
    ) {
        return;
    }

    const script = document.createElement('script');
    script.src =
        '/shared/atlas-tutor-subjects-portable-compat.js?v=20260916-backup1';
    script.async = false;
    script.dataset.atlasTutorSubjectsPortableCompat = 'true';
    script.addEventListener(
        'error',
        () => {
            console.error(
                '[AtlasAccountCloud] Tutor Subjects portable compatibility could not load.'
            );
        },
        { once: true }
    );
    document.head.appendChild(script);
})();

/*
 * The root Settings surface already loads the legacy portable-data module.
 * Layer the canonical V3 exporter only after both portable compatibility
 * boundaries are present, preventing backup semantics from racing setup.
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
            !window.AtlasTutorContentPortableCompat ||
            !window.AtlasTutorSubjectsPortableCompat
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
            '/shared/atlas-portable-data-v3.js?v=20260916-backup4';
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
 * Safe restore is root-only product infrastructure. Backup v3 can reconstruct
 * into an account that already contains unrelated Atlas work: stable-id
 * collisions remain blockers, while singleton account state merges with the
 * destination taking precedence on overlap.
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
                'script[data-atlas-backup-restore-v3]'
            )
        ) {
            return;
        }

        if (
            !window.AtlasPortableDataV3 ||
            !window.AtlasTutorContentPortableCompat ||
            !window.AtlasTutorSubjectsPortableCompat
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
            '/shared/atlas-backup-restore-v3.js?v=20260916-restore6';
        script.async = false;
        script.dataset.atlasBackupRestoreV3 = 'true';
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
