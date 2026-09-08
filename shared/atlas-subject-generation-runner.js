/* ============================================================
   ATLAS SUBJECT GENERATION RUNNER
   Shared orchestration for resumable Structured Subject builds.

   Owns:
   - canonical full-subject generation sequence
   - generation checkpoints
   - section readiness milestones

   Does NOT own:
   - UI state
   - persistence implementation
   - Compass authoring state
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasSubjectGenerationRunner) return;

    const DISCUSSION_STAGES = [
        'First Look',
        'Look Closer',
        'Wider View'
    ];

    const CULTURAL_LENS_CARD_COUNT = 6;
    const CORE_COMPLETE_STEP = 16;
    const FULL_COMPLETE_STEP = 18;

    const SECTION_MILESTONES = {
        overview: 2,
        discussion: 6,
        culturalLens: 13,
        reflection: 16
    };

    function normalizeStep(value) {
        return Math.min(
            FULL_COMPLETE_STEP,
            Math.max(
                0,
                Math.floor(Number(value) || 0)
            )
        );
    }

    function getSectionReadiness(completedStep) {
        const step = normalizeStep(completedStep);

        return {
            overview:
                step >= SECTION_MILESTONES.overview,
            discussion:
                step >= SECTION_MILESTONES.discussion,
            culturalLens:
                step >= SECTION_MILESTONES.culturalLens,
            reflection:
                step >= SECTION_MILESTONES.reflection
        };
    }

    function requireOperation(
        operations,
        name
    ) {
        const operation = operations?.[name];

        if (typeof operation !== 'function') {
            throw new Error(
                `Atlas subject generation requires ${name}().`
            );
        }

        return operation;
    }

    async function run({
        resumeFromStep = 0,
        includeEnrichment = true,
        operations = {},
        onProgress = null,
        onCheckpoint = null
    } = {}) {
        let completedStep =
            normalizeStep(resumeFromStep);

        const emitProgress = async (
            current,
            label,
            section
        ) => {
            if (typeof onProgress !== 'function') {
                return;
            }

            await onProgress({
                current,
                total: 9,
                label,
                section,
                completedStep,
                readiness:
                    getSectionReadiness(
                        completedStep
                    )
            });
        };

        const checkpoint = async nextStep => {
            completedStep =
                normalizeStep(nextStep);

            if (typeof onCheckpoint === 'function') {
                await onCheckpoint(
                    completedStep,
                    {
                        readiness:
                            getSectionReadiness(
                                completedStep
                            )
                    }
                );
            }
        };

        await checkpoint(completedStep);

        if (completedStep < 1) {
            await emitProgress(
                1,
                'Hook and introduction',
                'overview'
            );

            const framing =
                await requireOperation(
                    operations,
                    'generateSubjectFraming'
                )();

            if (!framing) {
                throw new Error(
                    'Subject framing generation failed.'
                );
            }

            await checkpoint(1);
        }

        if (completedStep < 2) {
            await emitProgress(
                2,
                'Overview',
                'overview'
            );

            const overview =
                await requireOperation(
                    operations,
                    'generateOverview'
                )();

            if (!overview) {
                throw new Error(
                    'Overview generation failed.'
                );
            }

            await checkpoint(2);
        }

        if (
            completedStep >= 2 &&
            typeof operations.enrichSource === 'function'
        ) {
            await emitProgress(
                3,
                'Adding source context',
                'overview'
            );

            await operations.enrichSource();
        }

        if (completedStep < 3) {
            await emitProgress(
                3,
                'Discussion framing',
                'discussion'
            );

            const framing =
                await requireOperation(
                    operations,
                    'generateDiscussionFraming'
                )();

            if (!framing) {
                throw new Error(
                    'Discussion framing generation failed.'
                );
            }

            await checkpoint(3);
        }

        for (
            let index = 0;
            index < DISCUSSION_STAGES.length;
            index += 1
        ) {
            const step = 4 + index;

            if (completedStep >= step) {
                continue;
            }

            const stage =
                DISCUSSION_STAGES[index];

            await emitProgress(
                4,
                `${stage} · ${index + 1} of ${DISCUSSION_STAGES.length}`,
                'discussion'
            );

            const set =
                await requireOperation(
                    operations,
                    'generateDiscussionSet'
                )(
                    stage,
                    index
                );

            if (!set) {
                throw new Error(
                    `${stage} generation failed.`
                );
            }

            await checkpoint(step);
        }

        if (completedStep < 7) {
            await emitProgress(
                5,
                'Cultural Lens framing',
                'culturalLens'
            );

            const framing =
                await requireOperation(
                    operations,
                    'generateCulturalLensFraming'
                )();

            if (!framing) {
                throw new Error(
                    'Cultural Lens framing generation failed.'
                );
            }

            await checkpoint(7);
        }

        for (
            let index = 0;
            index < CULTURAL_LENS_CARD_COUNT;
            index += 1
        ) {
            const step = 8 + index;

            if (completedStep >= step) {
                continue;
            }

            await emitProgress(
                6,
                `Cultural Lens card ${index + 1} of ${CULTURAL_LENS_CARD_COUNT}`,
                'culturalLens'
            );

            const card =
                await requireOperation(
                    operations,
                    'generateCulturalLensCard'
                )(index);

            if (!card) {
                throw new Error(
                    `Cultural Lens card ${index + 1} generation failed.`
                );
            }

            await checkpoint(step);
        }

        if (completedStep < CORE_COMPLETE_STEP) {
            await emitProgress(
                7,
                'Reflection',
                'reflection'
            );

            const reflection =
                await requireOperation(
                    operations,
                    'generateReflection'
                )();

            if (!reflection) {
                throw new Error(
                    'Reflection generation failed.'
                );
            }

            await checkpoint(CORE_COMPLETE_STEP);
        }

        if (!includeEnrichment) {
            return {
                completedStep,
                coreComplete:
                    completedStep >= CORE_COMPLETE_STEP,
                complete: false,
                readiness:
                    getSectionReadiness(completedStep)
            };
        }

        if (completedStep < 17) {
            await emitProgress(
                8,
                'Adding Discussion language + activities',
                'discussion'
            );

            const enriched =
                await requireOperation(
                    operations,
                    'enrichDiscussion'
                )();

            if (enriched === false) {
                throw new Error(
                    'Discussion enrichment did not finish.'
                );
            }

            await checkpoint(17);
        }

        if (completedStep < FULL_COMPLETE_STEP) {
            await emitProgress(
                9,
                'Adding Cultural Lens language',
                'culturalLens'
            );

            const enriched =
                await requireOperation(
                    operations,
                    'enrichCulturalLens'
                )();

            if (enriched === false) {
                throw new Error(
                    'Cultural Lens enrichment did not finish.'
                );
            }

            await checkpoint(FULL_COMPLETE_STEP);
        }

        return {
            completedStep,
            coreComplete:
                completedStep >= CORE_COMPLETE_STEP,
            complete:
                completedStep >= FULL_COMPLETE_STEP,
            readiness:
                getSectionReadiness(completedStep)
        };
    }

    function createStructuredDocumentOperations({
        getDocument,
        brief = ''
    } = {}) {
        if (typeof getDocument !== 'function') {
            throw new Error(
                'Atlas subject generation requires getDocument().'
            );
        }

        const AI = window.AtlasAI;
        const Structured =
            window.AtlasStructuredSubject;

        if (!AI || !Structured) {
            throw new Error(
                'Atlas AI and Structured Subject must load before the generation runner.'
            );
        }

        const getCurrentDocument = () => {
            const document = getDocument();

            if (
                !document ||
                typeof document !== 'object'
            ) {
                throw new Error(
                    'The Structured Subject document is unavailable.'
                );
            }

            return document;
        };

        const getSubject = document => ({
            title:
                String(
                    document.module?.title || ''
                ).trim(),
            description:
                String(
                    document.module?.catalogDescription || ''
                ).trim(),
            hook:
                String(
                    document.subjectCopy?.cover?.hook || ''
                ).trim()
        });

        const getOverview = document => {
            const overview =
                document.subjectCopy?.overview || {};

            return {
                heading:
                    String(overview.heading || '').trim(),
                intro:
                    Array.isArray(overview.intro)
                        ? overview.intro
                            .map(value =>
                                String(value || '').trim()
                            )
                            .filter(Boolean)
                            .join('\n\n')
                        : '',
                question:
                    String(overview.question || '').trim()
            };
        };

        const isStarterDiscussionSet = set => (
            set?.title === 'New set' &&
            set?.stage === 'First Look' &&
            Array.isArray(set?.moments) &&
            set.moments.length === 1 &&
            set.moments[0]?.preview ===
                'New conversation moment' &&
            set.moments[0]?.question ===
                'What would you like to explore?'
        );

        const getDiscussionSets = document =>
            (Array.isArray(document.discussionSets)
                ? document.discussionSets
                : []
            )
                .filter(set =>
                    !isStarterDiscussionSet(set)
                )
                .map(set => ({
                    title:
                        String(set.title || '').trim(),
                    stage:
                        String(set.stage || '').trim(),
                    description:
                        String(set.description || '').trim(),
                    moments:
                        Array.isArray(set.moments)
                            ? set.moments.map(moment => ({
                                preview:
                                    String(
                                        moment.preview || ''
                                    ).trim(),
                                question:
                                    String(
                                        moment.question || ''
                                    ).trim()
                            }))
                            : []
                }));

        const isStarterCulturalLensCard = card => (
            card?.title === 'New card' &&
            card?.context === 'Add context or background.' &&
            Array.isArray(card?.questions) &&
            card.questions.length === 1 &&
            card.questions[0] ===
                'What would you like to explore?'
        );

        const getCulturalLensCards = document =>
            (Array.isArray(document.culturalLensCards)
                ? document.culturalLensCards
                : []
            )
                .filter(card =>
                    !isStarterCulturalLensCard(card)
                )
                .map(card => ({
                    title:
                        String(card.title || '').trim(),
                    contextLine:
                        String(
                            card.contextLine || ''
                        ).trim(),
                    teaser:
                        String(card.teaser || '').trim(),
                    questions:
                        Array.isArray(card.questions)
                            ? card.questions
                                .map(question =>
                                    String(
                                        question || ''
                                    ).trim()
                                )
                                .filter(Boolean)
                            : []
                }));

        return {
            async generateSubjectFraming() {
                const document =
                    getCurrentDocument();

                const generated =
                    await AI.generateSubjectFraming({
                        subject: {
                            title:
                                getSubject(document).title
                        },
                        brief
                    });

                document.module.catalogDescription =
                    generated.catalogDescription;

                document.subjectCopy.cover.hook =
                    generated.hook;

                return generated;
            },

            async generateOverview() {
                const document =
                    getCurrentDocument();

                const generated =
                    await AI.generateOverview({
                        subject:
                            getSubject(document),
                        brief
                    });

                document.subjectCopy.overview.heading =
                    generated.heading;
                document.subjectCopy.overview.intro = [
                    generated.intro
                ];
                document.subjectCopy.overview.question =
                    generated.question;

                return generated;
            },

            async generateDiscussionFraming() {
                const document =
                    getCurrentDocument();

                const generated =
                    await AI.generateDiscussionFraming({
                        subject:
                            getSubject(document),
                        overview:
                            getOverview(document),
                        brief
                    });

                document.subjectCopy.discussion.heading =
                    generated.heading;
                document.subjectCopy.discussion.intro =
                    generated.intro;
                document.subjectCopy.paths.discussionDescription =
                    generated.pathDescription;

                return generated;
            },

            async generateDiscussionSet(stage) {
                const document =
                    getCurrentDocument();

                const discussion =
                    document.subjectCopy?.discussion || {};

                const generated =
                    await AI.generateDiscussionSet({
                        subject:
                            getSubject(document),
                        discussion: {
                            heading:
                                String(
                                    discussion.heading || ''
                                ).trim(),
                            intro:
                                String(
                                    discussion.intro || ''
                                ).trim(),
                            sets:
                                getDiscussionSets(document)
                        },
                        brief:
                            [
                                brief,
                                `Create the ${stage} discussion set.`
                            ]
                                .filter(Boolean)
                                .join('\n')
                    });

                const iconByStage = {
                    'First Look': 'first-look',
                    'Look Closer': 'closer-look',
                    'Wider View': 'wider-view'
                };

                const nativeSet =
                    Structured.createDiscussionSet({
                        ...generated,
                        icon:
                            iconByStage[
                                generated.stage
                            ] || 'first-look'
                    });

                const starterIndex =
                    document.discussionSets.findIndex(
                        isStarterDiscussionSet
                    );

                if (starterIndex >= 0) {
                    document.discussionSets.splice(
                        starterIndex,
                        1,
                        nativeSet
                    );
                } else {
                    document.discussionSets.push(
                        nativeSet
                    );
                }

                return nativeSet;
            },

            async generateCulturalLensFraming() {
                const document =
                    getCurrentDocument();

                const generated =
                    await AI.generateCulturalLensFraming({
                        subject:
                            getSubject(document),
                        overview:
                            getOverview(document),
                        brief
                    });

                document.subjectCopy.culturalLens.heading =
                    generated.heading;
                document.subjectCopy.culturalLens.intro =
                    generated.intro;
                document.subjectCopy.paths.culturalLensDescription =
                    generated.pathDescription;

                return generated;
            },

            async generateCulturalLensCard() {
                const document =
                    getCurrentDocument();

                const culturalLens =
                    document.subjectCopy?.culturalLens || {};

                const existingCards =
                    getCulturalLensCards(document);

                const existingTitles =
                    new Set(
                        existingCards
                            .map(card =>
                                card.title.toLowerCase()
                            )
                            .filter(Boolean)
                    );

                const generateCard = retryBrief =>
                    AI.generateCulturalLensCard({
                        subject:
                            getSubject(document),
                        culturalLens: {
                            heading:
                                String(
                                    culturalLens.heading ||
                                    'Cultural Lens'
                                ).trim(),
                            intro:
                                String(
                                    culturalLens.intro || ''
                                ).trim(),
                            cards:
                                existingCards
                        },
                        brief: retryBrief
                    });

                let generated =
                    await generateCard(brief);

                if (
                    existingTitles.has(
                        String(
                            generated?.title || ''
                        )
                            .trim()
                            .toLowerCase()
                    )
                ) {
                    generated =
                        await generateCard(
                            [
                                brief,
                                `Do not reuse the existing Cultural Lens card title "${generated.title}". Choose a genuinely different angle and title.`
                            ]
                                .filter(Boolean)
                                .join('\n')
                        );
                }

                if (
                    existingTitles.has(
                        String(
                            generated?.title || ''
                        )
                            .trim()
                            .toLowerCase()
                    )
                ) {
                    return null;
                }

                const nativeCard =
                    Structured.createCulturalLensCard(
                        generated
                    );

                const starterIndex =
                    document.culturalLensCards.findIndex(
                        isStarterCulturalLensCard
                    );

                if (starterIndex >= 0) {
                    document.culturalLensCards.splice(
                        starterIndex,
                        1,
                        nativeCard
                    );
                } else {
                    document.culturalLensCards.push(
                        nativeCard
                    );
                }

                return nativeCard;
            },

            async generateReflection() {
                const document =
                    getCurrentDocument();

                const discussion =
                    document.subjectCopy?.discussion || {};

                const culturalLens =
                    document.subjectCopy?.culturalLens || {};

                const generated =
                    await AI.generateReflection({
                        subject:
                            getSubject(document),
                        overview:
                            getOverview(document),
                        discussion: {
                            heading:
                                String(
                                    discussion.heading || ''
                                ).trim(),
                            intro:
                                String(
                                    discussion.intro || ''
                                ).trim(),
                            sets:
                                getDiscussionSets(document)
                        },
                        culturalLens: {
                            heading:
                                String(
                                    culturalLens.heading || ''
                                ).trim(),
                            intro:
                                String(
                                    culturalLens.intro || ''
                                ).trim(),
                            cards:
                                getCulturalLensCards(document)
                        },
                        brief
                    });

                document.subjectCopy.reflection.title =
                    generated.title;
                document.subjectCopy.reflection.summary =
                    generated.summary;
                document.subjectCopy.reflection.questions =
                    generated.questions.slice();
                document.subjectCopy.paths.reflectionDescription =
                    generated.pathDescription;

                return generated;
            }
        };
    }

    window.AtlasSubjectGenerationRunner = {
        discussionStages:
            DISCUSSION_STAGES.slice(),
        culturalLensCardCount:
            CULTURAL_LENS_CARD_COUNT,
        coreCompleteStep:
            CORE_COMPLETE_STEP,
        fullCompleteStep:
            FULL_COMPLETE_STEP,
        sectionMilestones: {
            ...SECTION_MILESTONES
        },
        getSectionReadiness,
        createStructuredDocumentOperations,
        run
    };
})();
