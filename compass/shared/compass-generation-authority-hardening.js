/* ============================================================
   COMPASS GENERATION AUTHORITY — BACKGROUND HARDENING
   Preserves tutor authority that already exists before a later
   full-subject generation stage begins.

   Loaded after compass-generation-authority.js for owned subjects.
   ============================================================ */

(function () {
    'use strict';

    const originalGenerateMyVersionSubjectFraming =
        generateMyVersionSubjectFraming;

    const originalGenerateMyVersionOverview =
        generateMyVersionOverview;

    const originalGenerateMyVersionDiscussionFraming =
        generateMyVersionDiscussionFraming;

    const originalGenerateMyVersionCulturalLensFraming =
        generateMyVersionCulturalLensFraming;

    const originalGenerateMyVersionReflection =
        generateMyVersionReflection;

    function hasOwn(object, key) {
        return Object.prototype.hasOwnProperty.call(
            object || {},
            key
        );
    }

    function cloneJson(value) {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return null;
        }
    }

    function jsonMatches(left, right) {
        try {
            return JSON.stringify(left) === JSON.stringify(right);
        } catch {
            return false;
        }
    }

    function captureAuthorityOverrides(
        exactFields = [],
        prefixes = []
    ) {
        const source = myVersionDraftOverrides || {};
        const captured = {};

        exactFields.forEach(fieldKey => {
            if (hasOwn(source, fieldKey)) {
                captured[fieldKey] = source[fieldKey];
            }
        });

        Object.keys(source).forEach(fieldKey => {
            if (
                prefixes.some(prefix =>
                    fieldKey.startsWith(prefix)
                )
            ) {
                captured[fieldKey] = source[fieldKey];
            }
        });

        return captured;
    }

    function restoreCapturedOverrides(captured) {
        const current = {
            ...(myVersionDraftOverrides || {})
        };

        let changed = false;

        Object.entries(captured || {}).forEach(
            ([fieldKey, value]) => {
                /*
                 * If the key still exists, the first authority layer
                 * either preserved it or the tutor changed it again
                 * while AI was in flight. Never replace that newer value.
                 */
                if (hasOwn(current, fieldKey)) {
                    return;
                }

                current[fieldKey] = value;
                changed = true;
            }
        );

        if (changed) {
            myVersionDraftOverrides = current;
        }

        return changed;
    }

    function getReflectionQuestions(document) {
        const questions =
            document?.subjectCopy?.reflection?.questions;

        return Array.isArray(questions)
            ? cloneJson(questions) || []
            : [];
    }

    function restoreReflectionStructure(
        startingQuestions,
        originalQuestions,
        generatedResult
    ) {
        if (
            jsonMatches(
                startingQuestions,
                originalQuestions
            )
        ) {
            return false;
        }

        const currentQuestions =
            getReflectionQuestions(
                myVersionDraftDocument
            );

        const generatedQuestions =
            Array.isArray(generatedResult?.questions)
                ? generatedResult.questions
                : null;

        /*
         * The existing authority layer already protects structural
         * edits made after the AI request began. Restore only when the
         * response actually replaced the pre-existing tutor structure.
         */
        if (
            !generatedQuestions ||
            jsonMatches(
                currentQuestions,
                startingQuestions
            ) ||
            !jsonMatches(
                currentQuestions,
                generatedQuestions
            )
        ) {
            return false;
        }

        const reflection =
            myVersionDraftDocument
                ?.subjectCopy
                ?.reflection;

        if (!reflection) return false;

        reflection.questions =
            cloneJson(startingQuestions) || [];

        return true;
    }

    function updateLatestGenerationHistoryAfter(
        historyLengthBefore
    ) {
        const undo = myVersionHistory?.undo;

        if (
            !Array.isArray(undo) ||
            undo.length <= historyLengthBefore
        ) {
            return;
        }

        const action = undo[undo.length - 1];

        if (action) {
            action.after =
                createMyVersionHistorySnapshot();
        }
    }

    function reconcileRestoredAuthority(
        historyLengthBefore,
        overridesChanged,
        structureChanged
    ) {
        if (!overridesChanged && !structureChanged) {
            return;
        }

        applyTutorSubjectDocument(
            myVersionDraftDocument
        );

        updateLatestGenerationHistoryAfter(
            historyLengthBefore
        );

        refreshMyVersionDirtyState();
        scheduleMyVersionWorkingDraftSave();
        renderAllTutorContentSurfaces();
    }

    function authorityTargetIsValid(kind) {
        if (
            !myVersionEditing ||
            !isOwnedSubjectRuntime() ||
            !myVersionDraftDocument ||
            typeof myVersionDraftDocument !== 'object'
        ) {
            return false;
        }

        if (kind === 'subject-framing') {
            return Boolean(
                myVersionDraftDocument.module &&
                typeof myVersionDraftDocument.module === 'object' &&
                myVersionDraftDocument.subjectCopy &&
                typeof myVersionDraftDocument.subjectCopy === 'object'
            );
        }

        return Boolean(
            myVersionDraftDocument.subjectCopy &&
            typeof myVersionDraftDocument.subjectCopy === 'object'
        );
    }

    async function runBackgroundAuthorityStage(
        originalGenerator,
        args,
        {
            kind,
            exactFields = [],
            prefixes = [],
            preserveReflectionStructure = false
        }
    ) {
        if (!myVersionGeneratingFullSubject) {
            return originalGenerator(...args);
        }

        const capturedOverrides =
            captureAuthorityOverrides(
                exactFields,
                prefixes
            );

        const historyLengthBefore =
            Array.isArray(myVersionHistory?.undo)
                ? myVersionHistory.undo.length
                : 0;

        const startingQuestions =
            preserveReflectionStructure
                ? getReflectionQuestions(
                    myVersionDraftDocument
                )
                : null;

        const originalQuestions =
            preserveReflectionStructure
                ? getReflectionQuestions(
                    myVersionOriginalDocument
                )
                : null;

        const result =
            await originalGenerator(...args);

        const overridesChanged =
            restoreCapturedOverrides(
                capturedOverrides
            );

        const structureChanged =
            preserveReflectionStructure
                ? restoreReflectionStructure(
                    startingQuestions,
                    originalQuestions,
                    result
                )
                : false;

        reconcileRestoredAuthority(
            historyLengthBefore,
            overridesChanged,
            structureChanged
        );

        if (result) {
            return result;
        }

        /*
         * A fully tutor-owned stage can legitimately produce no document
         * diff. That is success, not a reason to pause the background build.
         */
        return authorityTargetIsValid(kind)
            ? { authoritySatisfied: true }
            : null;
    }

    generateMyVersionSubjectFraming = function (...args) {
        return runBackgroundAuthorityStage(
            originalGenerateMyVersionSubjectFraming,
            args,
            {
                kind: 'subject-framing',
                exactFields: [
                    'module.catalogDescription',
                    'cover.hook'
                ]
            }
        );
    };

    generateMyVersionOverview = function (...args) {
        return runBackgroundAuthorityStage(
            originalGenerateMyVersionOverview,
            args,
            {
                kind: 'overview',
                exactFields: [
                    'overview.heading',
                    'overview.question'
                ],
                prefixes: [
                    'overview.intro.'
                ]
            }
        );
    };

    generateMyVersionDiscussionFraming = function (...args) {
        return runBackgroundAuthorityStage(
            originalGenerateMyVersionDiscussionFraming,
            args,
            {
                kind: 'discussion-framing',
                exactFields: [
                    'discussion.heading',
                    'discussion.intro',
                    'paths.discussionDescription'
                ]
            }
        );
    };

    generateMyVersionCulturalLensFraming = function (...args) {
        return runBackgroundAuthorityStage(
            originalGenerateMyVersionCulturalLensFraming,
            args,
            {
                kind: 'cultural-lens-framing',
                exactFields: [
                    'culturalLens.heading',
                    'culturalLens.intro',
                    'paths.culturalLensDescription'
                ]
            }
        );
    };

    generateMyVersionReflection = function (...args) {
        return runBackgroundAuthorityStage(
            originalGenerateMyVersionReflection,
            args,
            {
                kind: 'reflection',
                exactFields: [
                    'reflection.title',
                    'reflection.summary',
                    'paths.reflectionDescription'
                ],
                prefixes: [
                    'reflection.questions.'
                ],
                preserveReflectionStructure: true
            }
        );
    };
})();
