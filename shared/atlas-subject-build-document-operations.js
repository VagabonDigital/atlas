/* ============================================================
   ATLAS SUBJECT BUILD DOCUMENT OPERATIONS
   Worker-neutral AI generation primitives for Structured Subjects.

   Owns:
   - AI request context derived from a materialized document
   - canonical AI calls used by full-subject construction
   - atomic document mutations for generated results
   - build-enrichment candidate planning

   Does NOT own:
   - DOM / rendering
   - persistence
   - lifecycle status
   - checkpoints
   - sequencing
   - tutor history

   A host supplies getDocument() and commit(). Compass and a future
   SharedWorker can therefore execute exactly the same primitives.
   ============================================================ */

(function (root) {
    'use strict';

    if (root.AtlasSubjectBuildDocumentOperations) return;

    const KEY_LANGUAGE_LIMITS = Object.freeze({
        standard: Object.freeze({
            discussion: 6,
            culturalLens: 2
        }),
        compact: Object.freeze({
            discussion: 4,
            culturalLens: 1
        })
    });

    function cloneJson(value) {
        if (value === null || value === undefined) return value;
        return JSON.parse(JSON.stringify(value));
    }

    function clean(value) {
        return String(value ?? '').trim();
    }

    function isObject(value) {
        return Boolean(
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
        );
    }

    function requireDocument(document) {
        if (
            !isObject(document) ||
            !isObject(document.module) ||
            !isObject(document.subjectCopy) ||
            !Array.isArray(document.discussionSets) ||
            !Array.isArray(document.culturalLensCards)
        ) {
            throw new Error(
                'Atlas subject build requires a Structured Subject document.'
            );
        }

        return document;
    }

    function getSubject(document) {
        return {
            title:
                clean(document.module?.title),
            description:
                clean(
                    document.module?.catalogDescription
                ),
            hook:
                clean(
                    document.subjectCopy?.cover?.hook
                )
        };
    }

    function getOverview(document) {
        const overview =
            document.subjectCopy?.overview || {};

        return {
            heading:
                clean(overview.heading),
            intro:
                Array.isArray(overview.intro)
                    ? overview.intro
                        .map(clean)
                        .filter(Boolean)
                        .join('\n\n')
                    : clean(overview.intro),
            question:
                clean(overview.question)
        };
    }

    function getDiscussion(document) {
        const discussion =
            document.subjectCopy?.discussion || {};

        return {
            heading:
                clean(
                    discussion.heading ||
                    'Discussion'
                ),
            intro:
                clean(discussion.intro)
        };
    }

    function getCulturalLens(document) {
        const lens =
            document.subjectCopy?.culturalLens || {};

        return {
            heading:
                clean(
                    lens.heading ||
                    'Cultural Lens'
                ),
            intro:
                clean(lens.intro)
        };
    }

    function findMoment(document, momentId) {
        for (const set of document.discussionSets || []) {
            const moment =
                (set.moments || []).find(
                    item => item?.id === momentId
                );

            if (moment) {
                return {
                    set,
                    moment
                };
            }
        }

        return null;
    }

    function getPristineDiscussionStarter(
        document,
        Structured
    ) {
        if (document.discussionSets.length !== 1) {
            return null;
        }

        const set =
            document.discussionSets[0];

        if (
            !Array.isArray(set?.moments) ||
            set.moments.length !== 1
        ) {
            return null;
        }

        const starter =
            Structured.createDiscussionSet({
                id: set.id,
                moments: [
                    {
                        id:
                            set.moments[0].id
                    }
                ]
            });

        const moment = set.moments[0];
        const starterMoment =
            starter.moments[0];

        const pristine =
            set.title === starter.title &&
            set.stage === starter.stage &&
            set.icon === starter.icon &&
            set.description ===
                starter.description &&
            !set.makeItReal &&
            moment.preview ===
                starterMoment.preview &&
            moment.question ===
                starterMoment.question &&
            !moment.followUp &&
            (
                !Array.isArray(moment.followUps) ||
                moment.followUps.length === 0
            ) &&
            !moment.upgrade;

        return pristine
            ? set
            : null;
    }

    function getPristineCulturalLensStarter(
        document,
        Structured
    ) {
        if (
            document.culturalLensCards.length !== 1
        ) {
            return null;
        }

        const card =
            document.culturalLensCards[0];

        const starter =
            Structured.createCulturalLensCard({
                id: card.id
            });

        const questions =
            Array.isArray(card.questions)
                ? card.questions
                : [];

        const followTheThread =
            Array.isArray(card.followTheThread)
                ? card.followTheThread
                : [];

        const pristine =
            card.title === starter.title &&
            card.contextLine ===
                starter.contextLine &&
            card.teaser === starter.teaser &&
            card.context === starter.context &&
            questions.length ===
                starter.questions.length &&
            questions.every(
                (question, index) =>
                    question ===
                    starter.questions[index]
            ) &&
            (
                card.questionLabel === undefined ||
                card.questionLabel === 'Question'
            ) &&
            followTheThread.length === 0 &&
            !card.upgrade;

        return pristine
            ? card
            : null;
    }

    function getPristineMomentStarter(
        set,
        Structured
    ) {
        if (
            !set ||
            !Array.isArray(set.moments) ||
            set.moments.length !== 1
        ) {
            return null;
        }

        const moment = set.moments[0];

        const starter =
            Structured.createMoment({
                id: moment.id
            });

        const pristine =
            moment.preview === starter.preview &&
            moment.question === starter.question &&
            !moment.followUp &&
            (
                !Array.isArray(moment.followUps) ||
                moment.followUps.length === 0
            ) &&
            !moment.upgrade;

        return pristine
            ? moment
            : null;
    }

    function getExistingLanguage(
        document,
        excludedContextId = ''
    ) {
        const excluded =
            clean(excludedContextId);

        const items = [];

        document.discussionSets.forEach(set => {
            (set.moments || []).forEach(moment => {
                if (
                    excluded ===
                    'moment-' + moment.id
                ) {
                    return;
                }

                if (moment?.upgrade) {
                    items.push({
                        term:
                            clean(
                                moment.upgrade.term
                            ),
                        type:
                            clean(
                                moment.upgrade.type
                            ),
                        priority:
                            clean(
                                moment.upgrade.priority ||
                                'standard'
                            )
                    });
                }
            });
        });

        document.culturalLensCards.forEach(card => {
            if (
                excluded ===
                'cl-' + card.id
            ) {
                return;
            }

            if (card?.upgrade) {
                items.push({
                    term:
                        clean(
                            card.upgrade.term
                        ),
                    type:
                        clean(
                            card.upgrade.type
                        ),
                    priority:
                        clean(
                            card.upgrade.priority ||
                            'standard'
                        )
                });
            }
        });

        return items.filter(item => item.term);
    }

    function getDiscussionOpportunityIds(
        document,
        Structured
    ) {
        return document.discussionSets
            .flatMap(set => {
                const starter =
                    getPristineMomentStarter(
                        set,
                        Structured
                    );

                return (
                    Array.isArray(set.moments)
                        ? set.moments
                        : []
                )
                    .filter(moment =>
                        !starter ||
                        moment.id !== starter.id
                    )
                    .map(moment => moment.id);
            });
    }

    function getCulturalLensOpportunityIds(
        document,
        Structured
    ) {
        const starter =
            getPristineCulturalLensStarter(
                document,
                Structured
            );

        return document.culturalLensCards
            .filter(card =>
                !starter ||
                card.id !== starter.id
            )
            .map(card => card.id);
    }

    function removeOverride(
        controls,
        key
    ) {
        controls?.deleteOverride?.(key);
    }

    function removeOverridePrefix(
        controls,
        prefix
    ) {
        controls
            ?.deleteOverridesWithPrefix
            ?.(prefix);
    }

    function create(options = {}) {
        const config =
            isObject(options)
                ? options
                : {};

        const AI = config.ai;
        const Structured =
            config.structured;

        if (!AI || !Structured) {
            throw new Error(
                'Atlas subject build operations require AI and Structured Subject adapters.'
            );
        }

        if (
            typeof config.getDocument !== 'function' ||
            typeof config.commit !== 'function'
        ) {
            throw new Error(
                'Atlas subject build operations require getDocument() and commit().'
            );
        }

        const snapshotEditState =
            typeof config.snapshotEditState ===
                'function'
                ? config.snapshotEditState
                : () => null;

        const hasEditStateChanged =
            typeof config.hasEditStateChanged ===
                'function'
                ? config.hasEditStateChanged
                : () => false;

        async function readDocument() {
            return requireDocument(
                cloneJson(
                    await config.getDocument()
                )
            );
        }

        async function commitMutation(mutator) {
            return config.commit(
                (document, controls = {}) =>
                    mutator(
                        requireDocument(document),
                        controls
                    )
            );
        }

        async function generateSubjectFraming({
            brief = ''
        } = {}) {
            const document =
                await readDocument();

            const editSnapshot =
                snapshotEditState();

            const generated =
                await AI.generateSubjectFraming({
                    subject: {
                        title:
                            getSubject(document).title
                    },
                    brief:
                        clean(brief)
                });

            return commitMutation(
                (current, controls) => {
                    current.subjectCopy.cover =
                        isObject(
                            current.subjectCopy.cover
                        )
                            ? current.subjectCopy.cover
                            : {};

                    current.module.catalogDescription =
                        generated.catalogDescription;

                    current.subjectCopy.cover.hook =
                        generated.hook;

                    if (
                        !hasEditStateChanged(
                            editSnapshot,
                            'module.catalogDescription'
                        )
                    ) {
                        removeOverride(
                            controls,
                            'module.catalogDescription'
                        );
                    }

                    if (
                        !hasEditStateChanged(
                            editSnapshot,
                            'cover.hook'
                        )
                    ) {
                        removeOverride(
                            controls,
                            'cover.hook'
                        );
                    }

                    return {
                        catalogDescription:
                            generated.catalogDescription,
                        hook:
                            generated.hook
                    };
                }
            );
        }

        async function generateOverview({
            brief = ''
        } = {}) {
            const document =
                await readDocument();

            const generated =
                await AI.generateOverview({
                    subject:
                        getSubject(document),
                    brief:
                        clean(brief)
                });

            return commitMutation(
                (current, controls) => {
                    current.subjectCopy.overview =
                        isObject(
                            current.subjectCopy.overview
                        )
                            ? current.subjectCopy.overview
                            : {};

                    current.subjectCopy.overview.heading =
                        generated.heading;

                    current.subjectCopy.overview.intro = [
                        generated.intro
                    ];

                    current.subjectCopy.overview.question =
                        generated.question;

                    removeOverride(
                        controls,
                        'overview.heading'
                    );
                    removeOverride(
                        controls,
                        'overview.question'
                    );
                    removeOverridePrefix(
                        controls,
                        'overview.intro.'
                    );

                    return {
                        heading:
                            generated.heading,
                        intro:
                            generated.intro,
                        question:
                            generated.question
                    };
                }
            );
        }

        async function generateDiscussionFraming({
            brief = ''
        } = {}) {
            const document =
                await readDocument();

            const generated =
                await AI
                    .generateDiscussionFraming({
                        subject:
                            getSubject(document),
                        overview:
                            getOverview(document),
                        brief:
                            clean(brief)
                    });

            return commitMutation(
                (current, controls) => {
                    current.subjectCopy.discussion =
                        isObject(
                            current.subjectCopy.discussion
                        )
                            ? current.subjectCopy.discussion
                            : {};

                    current.subjectCopy.discussion.heading =
                        generated.heading;

                    current.subjectCopy.discussion.intro =
                        generated.intro;

                    current.subjectCopy.paths =
                        isObject(
                            current.subjectCopy.paths
                        )
                            ? current.subjectCopy.paths
                            : {};

                    current.subjectCopy.paths
                        .discussionDescription =
                            generated.pathDescription;

                    [
                        'discussion.heading',
                        'discussion.intro',
                        'paths.discussionDescription'
                    ].forEach(key =>
                        removeOverride(
                            controls,
                            key
                        )
                    );

                    return {
                        heading:
                            generated.heading,
                        intro:
                            generated.intro,
                        pathDescription:
                            generated.pathDescription
                    };
                }
            );
        }

        async function generateDiscussionSet({
            brief = ''
        } = {}) {
            const document =
                await readDocument();

            const starter =
                getPristineDiscussionStarter(
                    document,
                    Structured
                );

            const existingSets =
                document.discussionSets
                    .filter(set =>
                        !starter ||
                        set.id !== starter.id
                    )
                    .map(set => ({
                        title:
                            clean(set.title),
                        stage:
                            clean(set.stage),
                        description:
                            clean(set.description),
                        moments:
                            (set.moments || [])
                                .map(moment => ({
                                    preview:
                                        clean(
                                            moment.preview
                                        ),
                                    question:
                                        clean(
                                            moment.question
                                        )
                                }))
                    }));

            const generated =
                await AI.generateDiscussionSet({
                    subject:
                        getSubject(document),
                    discussion: {
                        ...getDiscussion(document),
                        sets:
                            existingSets
                    },
                    brief:
                        clean(brief)
                });

            const iconByStage = {
                'First Look':
                    'first-look',
                'Look Closer':
                    'closer-look',
                'Wider View':
                    'wider-view'
            };

            const nativeSet =
                Structured.createDiscussionSet({
                    ...generated,
                    icon:
                        iconByStage[
                            generated.stage
                        ] ||
                        'first-look'
                });

            const starterId =
                starter?.id || '';

            const added =
                await commitMutation(
                    (current, controls) => {
                        if (
                            current.discussionSets
                                .some(
                                    set =>
                                        set.id ===
                                        nativeSet.id
                                )
                        ) {
                            return null;
                        }

                        if (starterId) {
                            const index =
                                current.discussionSets
                                    .findIndex(
                                        set =>
                                            set.id ===
                                            starterId
                                    );

                            if (index >= 0) {
                                const [removed] =
                                    current
                                        .discussionSets
                                        .splice(
                                            index,
                                            1,
                                            cloneJson(
                                                nativeSet
                                            )
                                        );

                                controls
                                    ?.deleteDiscussionSetOverrides
                                    ?.(removed);

                                return {
                                    setId:
                                        nativeSet.id
                                };
                            }
                        }

                        current.discussionSets.push(
                            cloneJson(nativeSet)
                        );

                        return {
                            setId:
                                nativeSet.id
                        };
                    }
                );

            return added
                ? cloneJson(nativeSet)
                : null;
        }

        async function generateCulturalLensFraming({
            brief = ''
        } = {}) {
            const document =
                await readDocument();

            const generated =
                await AI
                    .generateCulturalLensFraming({
                        subject:
                            getSubject(document),
                        overview:
                            getOverview(document),
                        brief:
                            clean(brief)
                    });

            return commitMutation(
                (current, controls) => {
                    current.subjectCopy.culturalLens =
                        isObject(
                            current.subjectCopy.culturalLens
                        )
                            ? current.subjectCopy.culturalLens
                            : {};

                    current.subjectCopy.culturalLens.heading =
                        generated.heading;

                    current.subjectCopy.culturalLens.intro =
                        generated.intro;

                    current.subjectCopy.paths =
                        isObject(
                            current.subjectCopy.paths
                        )
                            ? current.subjectCopy.paths
                            : {};

                    current.subjectCopy.paths
                        .culturalLensDescription =
                            generated.pathDescription;

                    [
                        'culturalLens.heading',
                        'culturalLens.intro',
                        'paths.culturalLensDescription'
                    ].forEach(key =>
                        removeOverride(
                            controls,
                            key
                        )
                    );

                    return {
                        heading:
                            generated.heading,
                        intro:
                            generated.intro,
                        pathDescription:
                            generated.pathDescription
                    };
                }
            );
        }

        async function generateCulturalLensCard({
            brief = ''
        } = {}) {
            const document =
                await readDocument();

            const starter =
                getPristineCulturalLensStarter(
                    document,
                    Structured
                );

            const existingCards =
                document.culturalLensCards
                    .filter(card =>
                        !starter ||
                        card.id !== starter.id
                    )
                    .map(card => ({
                        title:
                            clean(card.title),
                        contextLine:
                            clean(card.contextLine),
                        teaser:
                            clean(card.teaser)
                    }));

            const existingTitles =
                new Set(
                    existingCards
                        .map(card =>
                            clean(card.title)
                                .toLowerCase()
                        )
                        .filter(Boolean)
                );

            const baseBrief =
                clean(brief);

            const generate =
                retryBrief =>
                    AI.generateCulturalLensCard({
                        subject:
                            getSubject(document),
                        culturalLens: {
                            ...getCulturalLens(
                                document
                            ),
                            cards:
                                existingCards
                        },
                        brief:
                            retryBrief
                    });

            let generated =
                await generate(
                    baseBrief
                );

            if (
                existingTitles.has(
                    clean(
                        generated?.title
                    ).toLowerCase()
                )
            ) {
                generated =
                    await generate(
                        [
                            baseBrief,
                            'Do not reuse the existing Cultural Lens card title "' +
                                generated.title +
                                '". Choose a genuinely different angle and title.'
                        ]
                            .filter(Boolean)
                            .join('\n')
                    );
            }

            if (
                existingTitles.has(
                    clean(
                        generated?.title
                    ).toLowerCase()
                )
            ) {
                return null;
            }

            const nativeCard =
                Structured.createCulturalLensCard(
                    generated
                );

            const starterId =
                starter?.id || '';

            const added =
                await commitMutation(
                    (current, controls) => {
                        if (
                            current.culturalLensCards
                                .some(
                                    card =>
                                        card.id ===
                                        nativeCard.id
                                )
                        ) {
                            return null;
                        }

                        if (starterId) {
                            const index =
                                current.culturalLensCards
                                    .findIndex(
                                        card =>
                                            card.id ===
                                            starterId
                                    );

                            if (index >= 0) {
                                const [removed] =
                                    current
                                        .culturalLensCards
                                        .splice(
                                            index,
                                            1,
                                            cloneJson(
                                                nativeCard
                                            )
                                        );

                                controls
                                    ?.deleteCulturalLensCardOverrides
                                    ?.(removed);

                                return {
                                    cardId:
                                        nativeCard.id
                                };
                            }
                        }

                        current.culturalLensCards.push(
                            cloneJson(nativeCard)
                        );

                        return {
                            cardId:
                                nativeCard.id
                        };
                    }
                );

            return added
                ? cloneJson(nativeCard)
                : null;
        }

        async function generateReflection({
            brief = ''
        } = {}) {
            const document =
                await readDocument();

            const starterSet =
                getPristineDiscussionStarter(
                    document,
                    Structured
                );

            const starterCard =
                getPristineCulturalLensStarter(
                    document,
                    Structured
                );

            const generated =
                await AI.generateReflection({
                    subject:
                        getSubject(document),
                    overview:
                        getOverview(document),
                    discussion: {
                        ...getDiscussion(
                            document
                        ),
                        sets:
                            document.discussionSets
                                .filter(set =>
                                    !starterSet ||
                                    set.id !==
                                        starterSet.id
                                )
                                .map(set => ({
                                    title:
                                        clean(set.title),
                                    stage:
                                        clean(set.stage),
                                    description:
                                        clean(
                                            set.description
                                        ),
                                    moments:
                                        (
                                            set.moments ||
                                            []
                                        ).map(
                                            moment => ({
                                                preview:
                                                    clean(
                                                        moment.preview
                                                    ),
                                                question:
                                                    clean(
                                                        moment.question
                                                    )
                                            })
                                        )
                                }))
                    },
                    culturalLens: {
                        ...getCulturalLens(
                            document
                        ),
                        cards:
                            document.culturalLensCards
                                .filter(card =>
                                    !starterCard ||
                                    card.id !==
                                        starterCard.id
                                )
                                .map(card => ({
                                    title:
                                        clean(card.title),
                                    contextLine:
                                        clean(
                                            card.contextLine
                                        ),
                                    teaser:
                                        clean(card.teaser),
                                    questions:
                                        (
                                            card.questions ||
                                            []
                                        )
                                            .map(clean)
                                            .filter(Boolean)
                                }))
                    },
                    brief:
                        clean(brief)
                });

            return commitMutation(
                (current, controls) => {
                    current.subjectCopy.reflection =
                        isObject(
                            current.subjectCopy.reflection
                        )
                            ? current.subjectCopy.reflection
                            : {};

                    current.subjectCopy.reflection.title =
                        generated.title;

                    current.subjectCopy.reflection.summary =
                        generated.summary;

                    current.subjectCopy.reflection.questions =
                        generated.questions.slice();

                    current.subjectCopy.paths =
                        isObject(
                            current.subjectCopy.paths
                        )
                            ? current.subjectCopy.paths
                            : {};

                    current.subjectCopy.paths
                        .reflectionDescription =
                            generated.pathDescription;

                    [
                        'reflection.title',
                        'reflection.summary',
                        'paths.reflectionDescription'
                    ].forEach(key =>
                        removeOverride(
                            controls,
                            key
                        )
                    );

                    controls
                        ?.deleteReflectionQuestionOverrides
                        ?.();

                    return {
                        title:
                            generated.title,
                        summary:
                            generated.summary,
                        questions:
                            generated.questions.slice(),
                        pathDescription:
                            generated.pathDescription
                    };
                }
            );
        }

        async function generateMomentUpgrade({
            momentId,
            brief = '',
            replace = false,
            priority = ''
        } = {}) {
            const id =
                clean(momentId);

            if (!id) return null;

            const document =
                await readDocument();

            const found =
                findMoment(
                    document,
                    id
                );

            if (
                !found ||
                (
                    found.moment.upgrade &&
                    replace !== true
                )
            ) {
                return null;
            }

            const generated =
                await AI.generateMomentUpgrade({
                    subject:
                        getSubject(document),
                    set: {
                        title:
                            clean(found.set.title),
                        stage:
                            clean(found.set.stage),
                        description:
                            clean(
                                found.set.description
                            )
                    },
                    moment: {
                        preview:
                            clean(
                                found.moment.preview
                            ),
                        question:
                            clean(
                                found.moment.question
                            )
                    },
                    existingLanguage:
                        getExistingLanguage(
                            document,
                            'moment-' + id
                        ),
                    brief:
                        clean(brief)
                });

            const committed =
                await commitMutation(
                    (current, controls) => {
                        const target =
                            findMoment(
                                current,
                                id
                            )?.moment;

                        if (
                            !target ||
                            (
                                target.upgrade &&
                                replace !== true
                            )
                        ) {
                            return null;
                        }

                        controls
                            ?.deleteUpgradeOverrides
                            ?.('moment-' + id);

                        target.upgrade = {
                            term:
                                generated.term,
                            type:
                                generated.type,
                            definition:
                                generated.definition,
                            ordinary:
                                generated.ordinary,
                            upgraded:
                                generated.upgraded,
                            priority:
                                (
                                    priority === 'key' ||
                                    priority === 'standard'
                                )
                                    ? priority
                                    : generated.priority,
                            atlasPrompt:
                                generated.atlasPrompt
                        };

                        return {
                            contextId:
                                'moment-' + id,
                            upgrade:
                                cloneJson(
                                    target.upgrade
                                )
                        };
                    }
                );

            return committed?.upgrade || null;
        }

        async function generateMakeItReal({
            setId,
            brief = ''
        } = {}) {
            const id =
                clean(setId);

            if (!id) return null;

            const document =
                await readDocument();

            const set =
                document.discussionSets
                    .find(item =>
                        item.id === id
                    );

            if (
                !set ||
                set.makeItReal
            ) {
                return null;
            }

            const existingActivities =
                document.discussionSets
                    .filter(item =>
                        item.id !== id &&
                        item.makeItReal
                    )
                    .map(item => ({
                        setTitle:
                            clean(item.title),
                        title:
                            clean(
                                item.makeItReal.title
                            ),
                        prompt:
                            clean(
                                item.makeItReal.prompt
                            )
                    }));

            const generated =
                await AI.generateMakeItReal({
                    subject:
                        getSubject(document),
                    set: {
                        title:
                            clean(set.title),
                        stage:
                            clean(set.stage),
                        description:
                            clean(set.description),
                        moments:
                            (set.moments || [])
                                .map(moment => ({
                                    preview:
                                        clean(
                                            moment.preview
                                        ),
                                    question:
                                        clean(
                                            moment.question
                                        )
                                }))
                    },
                    existingActivities,
                    brief:
                        clean(brief)
                });

            const committed =
                await commitMutation(
                    (current, controls) => {
                        const target =
                            current.discussionSets
                                .find(item =>
                                    item.id === id
                                );

                        if (
                            !target ||
                            target.makeItReal
                        ) {
                            return null;
                        }

                        controls
                            ?.deleteSetActivityOverrides
                            ?.(id);

                        target.makeItReal = {
                            label:
                                'Make It Real',
                            title:
                                generated.title,
                            prompt:
                                generated.prompt
                        };

                        return {
                            setId: id,
                            makeItReal:
                                cloneJson(
                                    target.makeItReal
                                )
                        };
                    }
                );

            return committed?.makeItReal || null;
        }

        async function generateCulturalLensUpgrade({
            cardId,
            brief = '',
            replace = false,
            priority = ''
        } = {}) {
            const id =
                clean(cardId);

            if (!id) return null;

            const document =
                await readDocument();

            const card =
                document.culturalLensCards
                    .find(item =>
                        item.id === id
                    );

            if (
                !card ||
                (
                    card.upgrade &&
                    replace !== true
                )
            ) {
                return null;
            }

            const generated =
                await AI
                    .generateCulturalLensUpgrade({
                        subject:
                            getSubject(document),
                        culturalLens:
                            getCulturalLens(
                                document
                            ),
                        card: {
                            title:
                                clean(card.title),
                            contextLine:
                                clean(
                                    card.contextLine
                                ),
                            teaser:
                                clean(card.teaser),
                            context:
                                clean(card.context),
                            questions:
                                Array.isArray(
                                    card.questions
                                )
                                    ? card.questions.slice()
                                    : [],
                            followTheThread:
                                Array.isArray(
                                    card.followTheThread
                                )
                                    ? card
                                        .followTheThread
                                        .slice()
                                    : []
                        },
                        existingLanguage:
                            getExistingLanguage(
                                document,
                                'cl-' + id
                            ),
                        brief:
                            clean(brief)
                    });

            const committed =
                await commitMutation(
                    (current, controls) => {
                        const target =
                            current.culturalLensCards
                                .find(item =>
                                    item.id === id
                                );

                        if (
                            !target ||
                            (
                                target.upgrade &&
                                replace !== true
                            )
                        ) {
                            return null;
                        }

                        controls
                            ?.deleteUpgradeOverrides
                            ?.('cl-' + id);

                        target.upgrade = {
                            term:
                                generated.term,
                            type:
                                generated.type,
                            definition:
                                generated.definition,
                            ordinary:
                                generated.ordinary,
                            upgraded:
                                generated.upgraded,
                            priority:
                                (
                                    priority === 'key' ||
                                    priority === 'standard'
                                )
                                    ? priority
                                    : generated.priority,
                            atlasPrompt:
                                generated.atlasPrompt
                        };

                        return {
                            contextId:
                                'cl-' + id,
                            upgrade:
                                cloneJson(
                                    target.upgrade
                                )
                        };
                    }
                );

            return committed?.upgrade || null;
        }

        async function selectKeyLanguageOpportunities({
            section,
            candidates = [],
            limit = 0
        } = {}) {
            return AI.selectKeyLanguageOpportunities({
                section:
                    clean(section),
                candidates:
                    Array.isArray(candidates)
                        ? cloneJson(candidates)
                        : [],
                limit:
                    Math.max(
                        0,
                        Math.floor(
                            Number(limit) || 0
                        )
                    )
            });
        }

        async function getDiscussionEnrichmentPlan({
            languageMode = 'all',
            subjectSize = 'standard'
        } = {}) {
            const document =
                await readDocument();

            const mode =
                ['off', 'key', 'all']
                    .includes(languageMode)
                    ? languageMode
                    : 'all';

            const opportunityIds =
                getDiscussionOpportunityIds(
                    document,
                    Structured
                );

            const candidateIds =
                opportunityIds.filter(id =>
                    !findMoment(
                        document,
                        id
                    )?.moment?.upgrade
                );

            const keyCount =
                opportunityIds.filter(id =>
                    findMoment(
                        document,
                        id
                    )?.moment?.upgrade
                        ?.priority === 'key'
                ).length;

            const size =
                clean(subjectSize) ===
                    'compact'
                    ? 'compact'
                    : 'standard';

            const remainingKeySlots =
                Math.max(
                    0,
                    KEY_LANGUAGE_LIMITS[
                        size
                    ].discussion -
                    keyCount
                );

            const keySelectionTarget =
                mode === 'off'
                    ? 0
                    : Math.min(
                        remainingKeySlots,
                        candidateIds.length
                    );

            const allowed =
                new Set(candidateIds);

            const keyCandidates =
                document.discussionSets
                    .flatMap(set =>
                        (set.moments || [])
                            .filter(moment =>
                                allowed.has(
                                    moment.id
                                )
                            )
                            .map(moment => ({
                                id:
                                    moment.id,
                                stage:
                                    clean(set.stage),
                                title:
                                    clean(set.title),
                                preview:
                                    clean(
                                        moment.preview
                                    ),
                                question:
                                    clean(
                                        moment.question
                                    )
                            }))
                    );

            const starter =
                getPristineDiscussionStarter(
                    document,
                    Structured
                );

            const makeItRealEligibleSetIds =
                document.discussionSets
                    .filter(set =>
                        !starter ||
                        set.id !== starter.id
                    )
                    .map(set => set.id);

            const makeItRealSetIds =
                document.discussionSets
                    .filter(set =>
                        (
                            !starter ||
                            set.id !== starter.id
                        ) &&
                        !set.makeItReal
                    )
                    .map(set => set.id);

            const languageTargetTotal =
                mode === 'off'
                    ? 0
                    : mode === 'key'
                        ? keyCount +
                            keySelectionTarget
                        : opportunityIds.length;

            return {
                mode,
                candidateIds,
                keyCandidates,
                keySelectionTarget,
                languageTargetTotal,
                makeItRealSetIds,
                makeItRealTotalCount:
                    makeItRealEligibleSetIds.length
            };
        }

        async function getCulturalLensEnrichmentPlan({
            languageMode = 'all',
            subjectSize = 'standard'
        } = {}) {
            const document =
                await readDocument();

            const mode =
                ['off', 'key', 'all']
                    .includes(languageMode)
                    ? languageMode
                    : 'all';

            const opportunityIds =
                getCulturalLensOpportunityIds(
                    document,
                    Structured
                );

            const candidateIds =
                opportunityIds.filter(id =>
                    !document.culturalLensCards
                        .find(card =>
                            card.id === id
                        )?.upgrade
                );

            const keyCount =
                opportunityIds.filter(id =>
                    document.culturalLensCards
                        .find(card =>
                            card.id === id
                        )?.upgrade?.priority ===
                            'key'
                ).length;

            const size =
                clean(subjectSize) ===
                    'compact'
                    ? 'compact'
                    : 'standard';

            const remainingKeySlots =
                Math.max(
                    0,
                    KEY_LANGUAGE_LIMITS[
                        size
                    ].culturalLens -
                    keyCount
                );

            const keySelectionTarget =
                mode === 'off'
                    ? 0
                    : Math.min(
                        remainingKeySlots,
                        candidateIds.length
                    );

            const allowed =
                new Set(candidateIds);

            const keyCandidates =
                document.culturalLensCards
                    .filter(card =>
                        allowed.has(card.id)
                    )
                    .map(card => ({
                        id:
                            card.id,
                        title:
                            clean(card.title),
                        contextLine:
                            clean(
                                card.contextLine
                            ),
                        teaser:
                            clean(card.teaser),
                        context:
                            clean(card.context),
                        questions:
                            Array.isArray(
                                card.questions
                            )
                                ? card.questions.slice()
                                : []
                    }));

            const languageTargetTotal =
                mode === 'off'
                    ? 0
                    : mode === 'key'
                        ? keyCount +
                            keySelectionTarget
                        : opportunityIds.length;

            return {
                mode,
                candidateIds,
                keyCandidates,
                keySelectionTarget,
                languageTargetTotal
            };
        }

        async function runEnrichmentOperationWithRetry(
            operation,
            {
                label = 'Enrichment operation',
                onEvent = null,
                event = {}
            } = {}
        ) {
            let lastError = null;

            for (
                let attempt = 1;
                attempt <= 2;
                attempt += 1
            ) {
                try {
                    const result =
                        await operation();

                    if (result) {
                        onEvent?.({
                            type:
                                'operation-complete',
                            ...event,
                            attempt
                        });

                        return result;
                    }

                    lastError =
                        new Error(
                            `${label} returned no result.`
                        );
                } catch (error) {
                    lastError = error;
                }

                if (attempt === 1) {
                    root.console?.warn?.(
                        `[AtlasSubjectBuildDocumentOperations] ${label} failed. Retrying once.`,
                        lastError
                    );

                    onEvent?.({
                        type:
                            'operation-retry',
                        ...event,
                        attempt,
                        delayMs: 600
                    });

                    await new Promise(resolve => {
                        root.setTimeout(
                            resolve,
                            600
                        );
                    });
                }
            }

            root.console?.error?.(
                `[AtlasSubjectBuildDocumentOperations] ${label} failed after retry:`,
                lastError
            );

            onEvent?.({
                type:
                    'operation-failed',
                ...event,
                attempts: 2
            });

            return null;
        }

        async function enrichDiscussion({
            languageMode = 'all',
            subjectSize = 'standard',
            onEvent = null,
            shouldStop = null
        } = {}) {
            const plan =
                await getDiscussionEnrichmentPlan({
                    languageMode,
                    subjectSize
                });

            const mode =
                plan.mode;

            const candidateIds =
                Array.isArray(
                    plan.candidateIds
                )
                    ? plan.candidateIds
                    : [];

            const keySelectionTarget =
                Math.max(
                    0,
                    Math.floor(
                        Number(
                            plan.keySelectionTarget
                        ) || 0
                    )
                );

            let selectedKeyIds = [];

            if (keySelectionTarget > 0) {
                onEvent?.({
                    type:
                        'selection-start',
                    section:
                        'discussion',
                    mode,
                    target:
                        keySelectionTarget
                });

                selectedKeyIds =
                    await selectKeyLanguageOpportunities({
                        section:
                            'discussion',
                        candidates:
                            Array.isArray(
                                plan.keyCandidates
                            )
                                ? plan.keyCandidates
                                : [],
                        limit:
                            keySelectionTarget
                    });

                onEvent?.({
                    type:
                        'selection-complete',
                    section:
                        'discussion',
                    mode,
                    selectedIds:
                        selectedKeyIds.slice()
                });

                if (
                    typeof shouldStop ===
                        'function' &&
                    shouldStop() === true
                ) {
                    return {
                        section:
                            'discussion',
                        mode,
                        selectedKeyIds:
                            selectedKeyIds.slice(),
                        completedOperations: [],
                        failedOperations: [],
                        remainingCount:
                            candidateIds.length +
                            (
                                Array.isArray(
                                    plan.makeItRealSetIds
                                )
                                    ? plan.makeItRealSetIds.length
                                    : 0
                            ),
                        complete: false,
                        stopped: true
                    };
                }
            }

            const selectedKeySet =
                new Set(
                    selectedKeyIds
                );

            const languageIds =
                mode === 'off'
                    ? []
                    : mode === 'key'
                        ? selectedKeyIds
                        : candidateIds;

            const operations = [
                ...languageIds
                    .map(momentId => ({
                        kind:
                            'upgrade',
                        id:
                            momentId,
                        priority:
                            selectedKeySet
                                .has(
                                    momentId
                                )
                                ? 'key'
                                : 'standard'
                    })),

                ...(
                    Array.isArray(
                        plan.makeItRealSetIds
                    )
                        ? plan.makeItRealSetIds
                        : []
                ).map(setId => ({
                    kind:
                        'make-it-real',
                    id:
                        setId
                }))
            ];

            const completedOperations = [];
            const failedOperations = [];

            const operationTotals = {
                upgrade:
                    Math.max(
                        0,
                        Math.floor(
                            Number(
                                plan.languageTargetTotal
                            ) || 0
                        )
                    ),
                'make-it-real':
                    Math.max(
                        0,
                        Math.floor(
                            Number(
                                plan.makeItRealTotalCount
                            ) || 0
                        )
                    )
            };

            /*
             * A resumed enrichment plan contains only work that is still
             * missing. Seed the counters with work already present in the
             * checkpoint so "1 of 15" becomes "14 of 15", not "1 of 2".
             */
            const completedByKind = {
                upgrade:
                    Math.max(
                        0,
                        operationTotals.upgrade -
                        languageIds.length
                    ),
                'make-it-real':
                    Math.max(
                        0,
                        operationTotals[
                            'make-it-real'
                        ] -
                        (
                            Array.isArray(
                                plan.makeItRealSetIds
                            )
                                ? plan
                                    .makeItRealSetIds
                                    .length
                                : 0
                        )
                    )
            };

            if (operations.length) {
                onEvent?.({
                    type:
                        'operations-start',
                    section:
                        'discussion',
                    mode,
                    operationTotals: {
                        ...operationTotals
                    },
                    total:
                        operations.length
                });
            }

            for (
                let index = 0;
                index < operations.length;
                index += 1
            ) {
                const operation =
                    operations[index];

                completedByKind[
                    operation.kind
                ] =
                    (
                        completedByKind[
                            operation.kind
                        ] || 0
                    ) + 1;

                const progress = {
                    section:
                        'discussion',
                    mode,
                    kind:
                        operation.kind,
                    id:
                        operation.id,
                    current:
                        completedByKind[
                            operation.kind
                        ],
                    total:
                        operationTotals[
                            operation.kind
                        ] || 0,
                    operationIndex:
                        index + 1,
                    operationCount:
                        operations.length
                };

                onEvent?.({
                    type:
                        'operation-start',
                    ...progress
                });

                const label =
                    operation.kind ===
                        'upgrade'
                        ? `Discussion language upgrade ${index + 1}`
                        : `Discussion activity ${index + 1}`;

                const result =
                    await runEnrichmentOperationWithRetry(
                        () =>
                            operation.kind ===
                                'upgrade'
                                ? generateMomentUpgrade({
                                    momentId:
                                        operation.id,
                                    priority:
                                        operation
                                            .priority
                                })
                                : generateMakeItReal({
                                    setId:
                                        operation.id
                                }),
                        {
                            label,
                            onEvent,
                            event:
                                progress
                        }
                    );

                if (result) {
                    completedOperations.push(
                        operation
                    );
                } else {
                    failedOperations.push(
                        operation
                    );
                }

                if (
                    typeof shouldStop ===
                        'function' &&
                    shouldStop() === true
                ) {
                    break;
                }
            }

            const remainingPlan =
                await getDiscussionEnrichmentPlan({
                    languageMode:
                        mode,
                    subjectSize
                });

            const remainingLanguage =
                mode === 'off'
                    ? 0
                    : mode === 'all'
                        ? remainingPlan
                            .candidateIds
                            .length
                        : remainingPlan
                            .keySelectionTarget;

            const remainingCount =
                remainingLanguage +
                remainingPlan
                    .makeItRealSetIds
                    .length;

            const result = {
                section:
                    'discussion',
                mode,
                selectedKeyIds:
                    selectedKeyIds.slice(),
                completedOperations:
                    cloneJson(
                        completedOperations
                    ),
                failedOperations:
                    cloneJson(
                        failedOperations
                    ),
                remainingCount,
                complete:
                    remainingCount === 0,
                stopped:
                    remainingCount > 0 &&
                    typeof shouldStop ===
                        'function' &&
                    shouldStop() === true
            };

            onEvent?.({
                type:
                    'enrichment-complete',
                section:
                    'discussion',
                mode,
                completedCount:
                    completedOperations.length,
                failedCount:
                    failedOperations.length,
                remainingCount,
                complete:
                    result.complete
            });

            return result;
        }

        async function enrichCulturalLens({
            languageMode = 'all',
            subjectSize = 'standard',
            onEvent = null,
            shouldStop = null
        } = {}) {
            const plan =
                await getCulturalLensEnrichmentPlan({
                    languageMode,
                    subjectSize
                });

            const mode =
                plan.mode;

            const candidateIds =
                Array.isArray(
                    plan.candidateIds
                )
                    ? plan.candidateIds
                    : [];

            const keySelectionTarget =
                Math.max(
                    0,
                    Math.floor(
                        Number(
                            plan.keySelectionTarget
                        ) || 0
                    )
                );

            let selectedKeyIds = [];

            if (keySelectionTarget > 0) {
                onEvent?.({
                    type:
                        'selection-start',
                    section:
                        'cultural-lens',
                    mode,
                    target:
                        keySelectionTarget
                });

                selectedKeyIds =
                    await selectKeyLanguageOpportunities({
                        section:
                            'cultural-lens',
                        candidates:
                            Array.isArray(
                                plan.keyCandidates
                            )
                                ? plan.keyCandidates
                                : [],
                        limit:
                            keySelectionTarget
                    });

                onEvent?.({
                    type:
                        'selection-complete',
                    section:
                        'cultural-lens',
                    mode,
                    selectedIds:
                        selectedKeyIds.slice()
                });

                if (
                    typeof shouldStop ===
                        'function' &&
                    shouldStop() === true
                ) {
                    return {
                        section:
                            'cultural-lens',
                        mode,
                        selectedKeyIds:
                            selectedKeyIds.slice(),
                        completedIds: [],
                        failedIds: [],
                        remainingCount:
                            candidateIds.length,
                        complete: false,
                        stopped: true
                    };
                }
            }

            const selectedKeySet =
                new Set(
                    selectedKeyIds
                );

            const idsToGenerate =
                mode === 'off'
                    ? []
                    : mode === 'key'
                        ? selectedKeyIds
                        : candidateIds;

            const completedIds = [];
            const failedIds = [];

            const languageTargetTotal =
                Math.max(
                    0,
                    Math.floor(
                        Number(
                            plan.languageTargetTotal
                        ) || 0
                    )
                );

            const completedBeforeRun =
                Math.max(
                    0,
                    languageTargetTotal -
                    idsToGenerate.length
                );

            if (idsToGenerate.length) {
                onEvent?.({
                    type:
                        'operations-start',
                    section:
                        'cultural-lens',
                    mode,
                    total:
                        languageTargetTotal
                });
            }

            for (
                let index = 0;
                index < idsToGenerate.length;
                index += 1
            ) {
                const cardId =
                    idsToGenerate[index];

                const progress = {
                    section:
                        'cultural-lens',
                    mode,
                    kind:
                        'upgrade',
                    id:
                        cardId,
                    current:
                        completedBeforeRun +
                        index + 1,
                    total:
                        languageTargetTotal,
                    operationIndex:
                        index + 1,
                    operationCount:
                        idsToGenerate.length
                };

                onEvent?.({
                    type:
                        'operation-start',
                    ...progress
                });

                const upgrade =
                    await runEnrichmentOperationWithRetry(
                        () =>
                            generateCulturalLensUpgrade({
                                cardId,
                                priority:
                                    selectedKeySet
                                        .has(
                                            cardId
                                        )
                                        ? 'key'
                                        : 'standard'
                            }),
                        {
                            label:
                                `Cultural Lens language upgrade ${index + 1}`,
                            onEvent,
                            event:
                                progress
                        }
                    );

                if (upgrade) {
                    completedIds.push(
                        cardId
                    );
                } else {
                    failedIds.push(
                        cardId
                    );
                }

                if (
                    typeof shouldStop ===
                        'function' &&
                    shouldStop() === true
                ) {
                    break;
                }
            }

            const remainingPlan =
                await getCulturalLensEnrichmentPlan({
                    languageMode:
                        mode,
                    subjectSize
                });

            const remainingCount =
                mode === 'off'
                    ? 0
                    : mode === 'all'
                        ? remainingPlan
                            .candidateIds
                            .length
                        : remainingPlan
                            .keySelectionTarget;

            const result = {
                section:
                    'cultural-lens',
                mode,
                selectedKeyIds:
                    selectedKeyIds.slice(),
                completedIds:
                    completedIds.slice(),
                failedIds:
                    failedIds.slice(),
                remainingCount,
                complete:
                    remainingCount === 0,
                stopped:
                    remainingCount > 0 &&
                    typeof shouldStop ===
                        'function' &&
                    shouldStop() === true
            };

            onEvent?.({
                type:
                    'enrichment-complete',
                section:
                    'cultural-lens',
                mode,
                completedCount:
                    completedIds.length,
                failedCount:
                    failedIds.length,
                remainingCount,
                complete:
                    result.complete
            });

            return result;
        }

        async function generateCurrentAffairsReading({
            generationContext = null
        } = {}) {
            const context =
                isObject(generationContext)
                    ? cloneJson(
                        generationContext
                    )
                    : {};

            const source =
                isObject(context.source)
                    ? context.source
                    : null;

            const ideaMode =
                clean(context.ideaMode);

            if (
                !source ||
                (
                    ideaMode &&
                    ideaMode !==
                        'current-affairs'
                )
            ) {
                return null;
            }

            const existingQuestions =
                Array.isArray(
                    source.readMoreQuestions
                )
                    ? source.readMoreQuestions
                        .map(clean)
                        .filter(Boolean)
                        .slice(0, 2)
                    : [];

            if (
                clean(source.readMore) &&
                existingQuestions.length === 2
            ) {
                return {
                    reading: {
                        readMore:
                            clean(
                                source.readMore
                            ),
                        readMoreQuestions:
                            existingQuestions,
                        imageUrl:
                            clean(
                                source.imageUrl
                            )
                    },
                    generationContext:
                        context,
                    alreadyComplete:
                        true
                };
            }

            const keyFacts =
                Array.isArray(source.keyFacts)
                    ? source.keyFacts
                        .map(clean)
                        .filter(Boolean)
                        .slice(0, 4)
                    : [];

            if (
                !clean(source.publisher) ||
                !clean(source.title) ||
                !clean(source.url) ||
                !clean(source.summary) ||
                keyFacts.length < 2
            ) {
                return null;
            }

            const reading =
                await AI
                    .generateCurrentAffairsReading({
                        source: {
                            ...source,
                            keyFacts
                        },
                        languageLevel:
                            clean(
                                context.languageLevel
                            ) || 'b2'
                    });

            return {
                reading:
                    cloneJson(reading),
                generationContext: {
                    ...context,
                    source: {
                        ...source,
                        readMore:
                            clean(
                                reading.readMore
                            ),
                        readMoreQuestions:
                            (
                                reading.readMoreQuestions ||
                                []
                            )
                                .map(clean)
                                .filter(Boolean)
                                .slice(0, 2),
                        imageUrl:
                            clean(
                                reading.imageUrl
                            )
                    }
                },
                alreadyComplete:
                    false
            };
        }

        return Object.freeze({
            generateSubjectFraming,
            generateOverview,
            generateDiscussionFraming,
            generateDiscussionSet,
            generateCulturalLensFraming,
            generateCulturalLensCard,
            generateReflection,
            generateMomentUpgrade,
            generateMakeItReal,
            generateCulturalLensUpgrade,
            selectKeyLanguageOpportunities,
            getDiscussionEnrichmentPlan,
            getCulturalLensEnrichmentPlan,
            enrichDiscussion,
            enrichCulturalLens,
            generateCurrentAffairsReading
        });
    }

    root.AtlasSubjectBuildDocumentOperations =
        Object.freeze({
            keyLanguageLimits:
                KEY_LANGUAGE_LIMITS,
            create
        });
})(
    typeof globalThis !== 'undefined'
        ? globalThis
        : self
);
