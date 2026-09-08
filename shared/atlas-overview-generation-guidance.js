/* ============================================================
   ATLAS OVERVIEW GENERATION GUIDANCE
   Keeps generated Overview introductions natural and varied.
   ============================================================ */

(function () {
    'use strict';

    const AI = window.AtlasAI;

    if (
        !AI ||
        AI.__atlasOverviewGenerationGuidancePatched ||
        typeof AI.generateOverview !== 'function'
    ) {
        return;
    }

    const originalGenerateOverview =
        AI.generateOverview;

    const overviewIntroGuidance = [
        'OVERVIEW INTRO STYLE:',
        'Do not begin the intro with an instructional imperative such as “Explore”, “Discover”, “Consider”, or “Learn”.',
        'Open naturally with the subject itself: a concrete observation, tension, familiar situation, surprising contrast, or direct framing.',
        'Vary the opening construction across subjects and avoid formulaic course-description language. There is no default sentence opener.'
    ].join(' ');

    AI.generateOverview = function (input = {}) {
        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        return originalGenerateOverview.call(
            this,
            {
                ...candidate,
                brief: [
                    String(candidate.brief || '').trim(),
                    overviewIntroGuidance
                ]
                    .filter(Boolean)
                    .join('\n')
            }
        );
    };

    AI.__atlasOverviewGenerationGuidancePatched = true;
})();
