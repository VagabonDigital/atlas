/* ============================================================
   ATLAS AI SUBJECT BUILD LIFECYCLE
   Canonical classification for durable owned-subject AI builds.
   Live generator liveness is intentionally NOT part of this state.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasAiSubjectBuildLifecycle) return;

    const KNOWN_STATUSES =
        new Set([
            'building',
            'paused',
            'complete'
        ]);

    function classify(record) {
        const metadata =
            record?.metadata &&
            typeof record.metadata === 'object' &&
            !Array.isArray(record.metadata)
                ? record.metadata
                : {};

        const provenanceKind =
            String(
                record?.provenance?.kind || ''
            ).trim();

        const status =
            String(
                metadata.aiBuildStatus || ''
            ).trim();

        const legacyRecovery =
            metadata.legacyAiBuildRecovery === true;

        const knownAiLifecycle =
            provenanceKind === 'ai-subject-build' ||
            KNOWN_STATUSES.has(status);

        return Object.freeze({
            status,
            provenanceKind,
            legacyRecovery,
            incomplete:
                status === 'complete'
                    ? false
                    : (
                        legacyRecovery ||
                        knownAiLifecycle
                    )
        });
    }

    window.AtlasAiSubjectBuildLifecycle =
        Object.freeze({
            classify
        });
})();
