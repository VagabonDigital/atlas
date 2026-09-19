/* ============================================================
   ARCADE PUBLIC ACCESS
   Shared anonymous/full-game boundary for Stage 3.3.

   Owns:
   - canonical public-access lookup through ArcadeCatalogData
   - anonymous preview detection
   - account interruption at the real gameplay threshold
   - return-intent replay after authentication

   Does NOT own:
   - game state
   - game rendering
   - session persistence
   - paid capabilities
   ============================================================ */

(function () {
    'use strict';

    if (window.ArcadePublicAccess) return;

    const BEGIN_GAME_OPERATION =
        'begin-arcade-game';

    let capabilityGatePromise = null;

    function hasStoredAtlasAccountSession() {
        try {
            return Boolean(
                localStorage.getItem(
                    'sb-jnhjfpagectprceswvqn-auth-token'
                )
            );
        } catch {
            return false;
        }
    }

    function getPublicAccess(registryId) {
        const Catalog =
            window.ArcadeCatalogData;

        if (
            Catalog &&
            typeof Catalog.getArcadeGamePublicAccess ===
                'function'
        ) {
            return Catalog
                .getArcadeGamePublicAccess(
                    registryId
                );
        }

        return 'preview';
    }

    function hasSharedResourceGrant(
        registryId
    ) {
        return (
            window.AtlasResourceShare
                ?.accept?.({
                    world: 'arcade',
                    resourceId: registryId
                }) === true
        );
    }

    function isAnonymousPreview(registryId) {
        return (
            !hasStoredAtlasAccountSession() &&
            getPublicAccess(registryId) ===
                'preview' &&
            !hasSharedResourceGrant(registryId)
        );
    }

    async function ensureCapabilityGate() {
        if (window.AtlasCapabilityGate) {
            return window.AtlasCapabilityGate;
        }

        if (capabilityGatePromise) {
            return capabilityGatePromise;
        }

        capabilityGatePromise =
            (async () => {
                const Bootstrap =
                    window.AtlasAccessBootstrap;

                if (
                    !Bootstrap ||
                    typeof Bootstrap.prepareCapabilityGate !==
                        'function'
                ) {
                    throw new Error(
                        'Atlas account access is unavailable.'
                    );
                }

                return Bootstrap
                    .prepareCapabilityGate();
            })().catch(error => {
                capabilityGatePromise = null;
                throw error;
            });

        return capabilityGatePromise;
    }

    async function requestGameAccess(
        registryId,
        trigger = null
    ) {
        if (!isAnonymousPreview(registryId)) {
            return {
                outcome: 'allowed'
            };
        }

        try {
            const Gate =
                await ensureCapabilityGate();

            return Gate.requireAuthentication({
                action: 'open-gated-content',
                destination:
                    window.location.href,
                context: {
                    operation:
                        BEGIN_GAME_OPERATION,
                    gameId:
                        String(
                            registryId || ''
                        ).trim()
                },
                trigger,
                mode: 'create'
            });
        } catch (error) {
            return {
                outcome: 'unavailable',
                error
            };
        }
    }

    function accessAllows(access) {
        return access?.outcome === 'allowed';
    }

    async function subscribeGameResume(
        registryId,
        onResume
    ) {
        if (typeof onResume !== 'function') {
            return () => {};
        }

        try {
            const Gate =
                await ensureCapabilityGate();

            return Gate.subscribeResume(
                async payload => {
                    const intent =
                        payload?.intent || null;

                    const context =
                        intent?.context || {};

                    if (
                        intent?.action !==
                            'open-gated-content' ||
                        context.operation !==
                            BEGIN_GAME_OPERATION ||
                        String(
                            context.gameId || ''
                        ).trim() !==
                            String(
                                registryId || ''
                            ).trim()
                    ) {
                        return;
                    }

                    await onResume(payload);
                },
                {
                    replay: true
                }
            );
        } catch (error) {
            console.warn(
                '[Arcade] public game resume unavailable:',
                error
            );

            return () => {};
        }
    }

    window.ArcadePublicAccess = {
        getPublicAccess,
        isAnonymousPreview,
        requestGameAccess,
        accessAllows,
        subscribeGameResume
    };
})();
