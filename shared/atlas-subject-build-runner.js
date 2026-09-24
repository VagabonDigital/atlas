/* ============================================================
   ATLAS SUBJECT BUILD RUNNER
   Pure, resumable orchestration for a Structured Subject build.

   Owns:
   - canonical build sequence
   - step numbering
   - progress labels
   - checkpoint boundaries

   Does NOT own:
   - UI
   - authentication
   - AI transport
   - subject persistence
   - tutor editing state

   The same runner can therefore be hosted by the Compass subject page
   or by the Atlas subject-build Service Worker.
   ============================================================ */

(function (root) {
    'use strict';

    if (root.AtlasSubjectBuildRunner) return;

    const FULL_COMPLETE_STEP = 18;
    const TOTAL_PROGRESS_STAGES = 9;
    const STANDARD_DISCUSSION_STAGES = Object.freeze([
        'First Look',
        'Look Closer',
        'Wider View'
    ]);

    function normalizeStep(value) {
        return Math.min(
            FULL_COMPLETE_STEP,
            Math.max(
                0,
                Math.floor(Number(value) || 0)
            )
        );
    }

    function normalizeSubjectSize(value) {
        return String(value || '').trim() === 'compact'
            ? 'compact'
            : 'standard';
    }

    function normalizeLanguageSupport(value) {
        const mode = String(value || '').trim();

        return ['off', 'key', 'all'].includes(mode)
            ? mode
            : 'key';
    }

    function requireOperation(operations, name) {
        const operation = operations?.[name];

        if (typeof operation !== 'function') {
            throw new Error(
                `Atlas subject build requires ${name}().`
            );
        }

        return operation;
    }

    async function requireResult(
        operations,
        name,
        args,
        errorMessage
    ) {
        const result =
            await requireOperation(
                operations,
                name
            )(args);

        if (!result) {
            throw new Error(errorMessage);
        }

        return result;
    }

    async function run({
        resumeFromStep = 0,
        subjectSize = 'standard',
        languageSupport = 'key',
        operations = {},
        onProgress = null,
        onCheckpoint = null
    } = {}) {
        const size =
            normalizeSubjectSize(subjectSize);

        const languageMode =
            normalizeLanguageSupport(
                languageSupport
            );

        const discussionStages =
            size === 'compact'
                ? STANDARD_DISCUSSION_STAGES.slice(0, 2)
                : [...STANDARD_DISCUSSION_STAGES];

        const culturalLensCardCount =
            size === 'compact'
                ? 3
                : 6;

        let completedStep =
            normalizeStep(resumeFromStep);

        const progress = async (
            current,
            label
        ) => {
            if (typeof onProgress !== 'function') {
                return;
            }

            await onProgress({
                current,
                total: TOTAL_PROGRESS_STAGES,
                label,
                completedStep
            });
        };

        const checkpoint = async nextStep => {
            completedStep =
                normalizeStep(nextStep);

            if (typeof onCheckpoint === 'function') {
                await onCheckpoint(completedStep);
            }
        };

        await checkpoint(completedStep);

        if (completedStep < 1) {
            await progress(
                1,
                'Hook and introduction'
            );

            await requireResult(
                operations,
                'generateSubjectFraming',
                {},
                'Subject framing generation failed.'
            );

            await checkpoint(1);
        }

        if (completedStep < 2) {
            await progress(2, 'Overview');

            await requireResult(
                operations,
                'generateOverview',
                {},
                'Overview generation failed.'
            );

            await checkpoint(2);
        }

        if (completedStep >= 2) {
            await progress(
                3,
                'Adding source context'
            );

            if (
                typeof operations.enrichCurrentAffairs ===
                    'function'
            ) {
                await operations.enrichCurrentAffairs();
            }
        }

        if (completedStep < 3) {
            await progress(
                3,
                'Discussion framing'
            );

            await requireResult(
                operations,
                'generateDiscussionFraming',
                {},
                'Discussion framing generation failed.'
            );

            await checkpoint(3);
        }

        for (
            let index = 0;
            index < discussionStages.length;
            index += 1
        ) {
            const step = 4 + index;

            if (completedStep >= step) {
                continue;
            }

            const stage =
                discussionStages[index];

            await progress(
                4,
                `${stage} · ${index + 1} of ${discussionStages.length}`
            );

            await requireResult(
                operations,
                'generateDiscussionSet',
                {
                    stage,
                    index,
                    total:
                        discussionStages.length,
                    brief:
                        `Create the ${stage} discussion set.`
                },
                `${stage} generation failed.`
            );

            await checkpoint(step);
        }

        if (completedStep < 7) {
            await progress(
                5,
                'Cultural Lens framing'
            );

            await requireResult(
                operations,
                'generateCulturalLensFraming',
                {},
                'Cultural Lens framing generation failed.'
            );

            await checkpoint(7);
        }

        for (
            let index = 0;
            index < culturalLensCardCount;
            index += 1
        ) {
            const step = 8 + index;

            if (completedStep >= step) {
                continue;
            }

            await progress(
                6,
                `Cultural Lens card ${index + 1} of ${culturalLensCardCount}`
            );

            await requireResult(
                operations,
                'generateCulturalLensCard',
                {
                    index,
                    total:
                        culturalLensCardCount
                },
                `Cultural Lens card ${index + 1} generation failed.`
            );

            await checkpoint(step);
        }

        if (completedStep < 16) {
            await progress(7, 'Reflection');

            await requireResult(
                operations,
                'generateReflection',
                {},
                'Reflection generation failed.'
            );

            await checkpoint(16);
        }

        if (completedStep < 17) {
            const label =
                languageMode === 'off'
                    ? 'Adding Discussion activities'
                    : languageMode === 'key'
                        ? 'Adding key Discussion language + activities'
                        : 'Adding Discussion language + activities';

            await progress(8, label);

            await requireResult(
                operations,
                'enrichDiscussion',
                {
                    languageSupport:
                        languageMode
                },
                'Discussion enrichment did not finish.'
            );

            await checkpoint(17);
        }

        if (completedStep < 18) {
            const label =
                languageMode === 'off'
                    ? 'Finishing Cultural Lens'
                    : languageMode === 'key'
                        ? 'Adding key Cultural Lens language'
                        : 'Adding Cultural Lens language';

            await progress(9, label);

            await requireResult(
                operations,
                'enrichCulturalLens',
                {
                    languageSupport:
                        languageMode
                },
                'Cultural Lens enrichment did not finish.'
            );

            await checkpoint(18);
        }

        return {
            completedStep,
            complete:
                completedStep >=
                FULL_COMPLETE_STEP
        };
    }

    root.AtlasSubjectBuildRunner =
        Object.freeze({
            fullCompleteStep:
                FULL_COMPLETE_STEP,
            totalProgressStages:
                TOTAL_PROGRESS_STAGES,
            normalizeStep,
            run
        });
})(
    typeof globalThis !== 'undefined'
        ? globalThis
        : self
);
