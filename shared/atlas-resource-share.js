/* ============================================================
   ATLAS RESOURCE SHARE
   Scoped public-resource grant for direct subject/game sharing.

   A share grant:
   - unlocks only the exact Compass subject or Arcade game named by its catalog;
   - does not change normal catalogue access;
   - does not grant ownership, persistence, learner, authoring or account capabilities;
   - marks a valid shared-resource visit as deliberate product entry.

   This is public-content routing, not an authorization boundary.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasResourceShare) return;

    const SHARE_PARAM = 'share';

    function normalizeWorld(world) {
        const value = String(world || '')
            .trim()
            .toLowerCase();

        return [
            'compass',
            'arcade'
        ].includes(value)
            ? value
            : '';
    }

    function normalizeResourceId(
        world,
        resourceId
    ) {
        const normalizedWorld =
            normalizeWorld(world);

        let id = String(resourceId || '')
            .trim();

        if (!normalizedWorld || !id) {
            return '';
        }

        if (normalizedWorld === 'compass') {
            return id.replace(
                /^compass:/,
                ''
            );
        }

        if (!id.startsWith('arcade:')) {
            id = `arcade:${id}`;
        }

        return id;
    }

    function getExpectedGrant(
        world,
        resourceId
    ) {
        const normalizedWorld =
            normalizeWorld(world);

        const id = normalizeResourceId(
            normalizedWorld,
            resourceId
        );

        if (!normalizedWorld || !id) {
            return '';
        }

        if (
            normalizedWorld === 'compass' &&
            typeof window.CompassCatalogData
                ?.getCompassSubjectShareGrant ===
                    'function'
        ) {
            return String(
                window.CompassCatalogData
                    .getCompassSubjectShareGrant(id) ||
                ''
            ).trim();
        }

        if (
            normalizedWorld === 'arcade' &&
            typeof window.ArcadeCatalogData
                ?.getArcadeGameShareGrant ===
                    'function'
        ) {
            return String(
                window.ArcadeCatalogData
                    .getArcadeGameShareGrant(id) ||
                ''
            ).trim();
        }

        return '';
    }

    function getGrantFromUrl(
        href = window.location.href
    ) {
        try {
            return String(
                new URL(
                    href,
                    window.location.href
                ).searchParams.get(
                    SHARE_PARAM
                ) || ''
            ).trim();
        } catch {
            return '';
        }
    }

    function markProductEntered() {
        try {
            window.localStorage.setItem(
                'atlas::welcomeSeen:v1',
                '1'
            );

            window.localStorage.setItem(
                'atlas::publicEntryStage:v1',
                'product'
            );
        } catch { }
    }

    function isGranted({
        world,
        resourceId,
        href = window.location.href
    } = {}) {
        const expected = getExpectedGrant(
            world,
            resourceId
        );

        if (!expected) {
            return false;
        }

        return (
            getGrantFromUrl(href) ===
            expected
        );
    }

    function accept(input = {}) {
        const granted =
            isGranted(input);

        if (granted) {
            markProductEntered();
        }

        return granted;
    }

    function buildShareUrl({
        world,
        resourceId,
        launchUrl
    } = {}) {
        const grant = getExpectedGrant(
            world,
            resourceId
        );

        if (!grant || !launchUrl) {
            return '';
        }

        try {
            const url = new URL(
                launchUrl,
                `${window.location.origin}/`
            );

            url.searchParams.set(
                SHARE_PARAM,
                grant
            );

            return url.href;
        } catch {
            return '';
        }
    }

    window.AtlasResourceShare =
        Object.freeze({
            SHARE_PARAM,
            getGrantFromUrl,
            isGranted,
            accept,
            buildShareUrl
        });
})();
