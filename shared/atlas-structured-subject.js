/* ============================================================
   ATLAS STRUCTURED SUBJECT
   Canonical domain boundary for Structured Subject documents.

   Owns:
   - minimum-valid Structured Subject construction
   - starter Discussion set / moment construction
   - starter Cultural Lens card construction
   - structural document validation
   - authored content IDs

   Does NOT own:
   - persistence
   - ownership records
   - registry projection
   - UI state
   - AI generation
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasStructuredSubject) return;

    const SCHEMA_VERSION = 1;

    function cloneJson(value) {
        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return null;
        }
    }

    function createId(prefix) {
        const suffix =
            window.crypto &&
            typeof window.crypto.randomUUID === 'function'
                ? window.crypto.randomUUID()
                : `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 10)}`;

        return `${prefix}-${suffix}`;
    }

    function createMoment(input = {}) {
        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        return {
            id:
                typeof candidate.id === 'string' &&
                candidate.id.trim()
                    ? candidate.id.trim()
                    : createId('moment'),

            preview:
                typeof candidate.preview === 'string'
                    ? candidate.preview
                    : 'New conversation moment',

            question:
                typeof candidate.question === 'string'
                    ? candidate.question
                    : 'What would you like to explore?'
        };
    }

    function createDiscussionSet(input = {}) {
        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const moments =
            Array.isArray(candidate.moments) &&
            candidate.moments.length
                ? candidate.moments.map(moment =>
                    createMoment(moment)
                )
                : [
                    createMoment()
                ];

        return {
            id:
                typeof candidate.id === 'string' &&
                candidate.id.trim()
                    ? candidate.id.trim()
                    : createId('discussion-set'),

            title:
                typeof candidate.title === 'string'
                    ? candidate.title
                    : 'New set',

            stage:
                typeof candidate.stage === 'string'
                    ? candidate.stage
                    : 'First Look',

            icon:
                typeof candidate.icon === 'string'
                    ? candidate.icon
                    : 'first-look',

            description:
                typeof candidate.description === 'string'
                    ? candidate.description
                    : 'What will this part of the conversation explore?',

            moments
        };
    }

    function createCulturalLensCard(input = {}) {
        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const questions =
            Array.isArray(candidate.questions) &&
            candidate.questions.length
                ? candidate.questions.map(question =>
                    String(question ?? '')
                )
                : [
                    'What would you like to explore?'
                ];

        return {
            id:
                typeof candidate.id === 'string' &&
                candidate.id.trim()
                    ? candidate.id.trim()
                    : createId('cultural-lens-card'),

            title:
                typeof candidate.title === 'string'
                    ? candidate.title
                    : 'New card',

            contextLine:
                typeof candidate.contextLine === 'string'
                    ? candidate.contextLine
                    : '',

            teaser:
                typeof candidate.teaser === 'string'
                    ? candidate.teaser
                    : '',

            context:
                typeof candidate.context === 'string'
                    ? candidate.context
                    : 'Add context or background.',

            questions,

            followTheThread:
                Array.isArray(candidate.followTheThread)
                    ? candidate.followTheThread.map(question =>
                        String(question ?? '')
                    )
                    : []
        };
    }

    function createBlankDocument(input = {}) {
        const candidate =
            input &&
            typeof input === 'object' &&
            !Array.isArray(input)
                ? input
                : {};

        const title =
            typeof candidate.title === 'string' &&
            candidate.title.trim()
                ? candidate.title.trim()
                : 'Untitled Subject';

        const navTitle =
            typeof candidate.navTitle === 'string' &&
            candidate.navTitle.trim()
                ? candidate.navTitle.trim()
                : title;

        return {
            schemaVersion: SCHEMA_VERSION,

            module: {
                title,
                navTitle,
                bgImage:
                    typeof candidate.bgImage === 'string'
                        ? candidate.bgImage.trim()
                        : '',
                catalogDescription:
                    typeof candidate.catalogDescription === 'string'
                        ? candidate.catalogDescription.trim()
                        : ''
            },

            subjectCopy: {
                cover: {
                    hook: 'Add a short hook for this subject.'
                },

                overview: {
                    heading: 'Start Here',
                    intro: [
                        'Add a short introduction to frame the subject.'
                    ],
                    question:
                        'What would you like to explore?'
                },

                paths: {
                    discussionTitle: 'Discussion',
                    discussionDescription:
                        'Explore the subject through questions and conversation.',
                    culturalLensTitle: 'Cultural Lens',
                    culturalLensDescription:
                        'Add context, perspectives, examples, or stories.',
                    reflectionTitle: 'Reflection',
                    reflectionDescription:
                        'Bring ideas from the subject together.'
                },

                culturalLens: {
                    heading: 'Cultural Lens',
                    intro:
                        'Add context, perspectives, examples, or stories that deepen the conversation.'
                },

                discussion: {
                    heading: 'Discussion'
                },

                reflection: {
                    title: 'Reflection',
                    summary:
                        'Bring together the ideas that stood out.',
                    questions: [
                        'What stands out to you from this subject?'
                    ]
                },

                keyLanguage: {
                    intro:
                        'Useful language from this subject.'
                }
            },

            discussionSets: [
                createDiscussionSet()
            ],

            culturalLensCards: [
                createCulturalLensCard()
            ]
        };
    }

    function validateDocument(document) {
        const errors = [];

        if (
            !document ||
            typeof document !== 'object' ||
            Array.isArray(document)
        ) {
            return {
                valid: false,
                errors: ['Document must be an object.']
            };
        }

        if (
            !document.module ||
            typeof document.module !== 'object' ||
            Array.isArray(document.module)
        ) {
            errors.push('Document requires module.');
        }

        if (
            typeof document.module?.title !== 'string' ||
            !document.module.title.trim()
        ) {
            errors.push('Module requires a title.');
        }

        const copy = document.subjectCopy;

        if (
            !copy ||
            typeof copy !== 'object' ||
            Array.isArray(copy)
        ) {
            errors.push('Document requires subjectCopy.');
        } else {
            [
                'cover',
                'overview',
                'paths',
                'culturalLens',
                'discussion',
                'reflection',
                'keyLanguage'
            ].forEach(section => {
                if (
                    !copy[section] ||
                    typeof copy[section] !== 'object' ||
                    Array.isArray(copy[section])
                ) {
                    errors.push(
                        `subjectCopy requires ${section}.`
                    );
                }
            });

            if (
                copy.overview &&
                !Array.isArray(copy.overview.intro)
            ) {
                errors.push(
                    'Overview intro must be an array.'
                );
            }

            if (
                copy.reflection &&
                !Array.isArray(copy.reflection.questions)
            ) {
                errors.push(
                    'Reflection questions must be an array.'
                );
            }
        }

        if (
            !Array.isArray(document.discussionSets) ||
            document.discussionSets.length === 0
        ) {
            errors.push(
                'Structured Subject requires at least one Discussion set.'
            );
        } else {
            document.discussionSets.forEach(
                (set, setIndex) => {
                    if (
                        !set ||
                        typeof set !== 'object' ||
                        Array.isArray(set)
                    ) {
                        errors.push(
                            `Discussion set ${setIndex + 1} must be an object.`
                        );
                        return;
                    }

                    if (
                        typeof set.id !== 'string' ||
                        !set.id.trim()
                    ) {
                        errors.push(
                            `Discussion set ${setIndex + 1} requires an ID.`
                        );
                    }

                    if (
                        !Array.isArray(set.moments) ||
                        set.moments.length === 0
                    ) {
                        errors.push(
                            `Discussion set ${setIndex + 1} requires at least one moment.`
                        );
                        return;
                    }

                    set.moments.forEach(
                        (moment, momentIndex) => {
                            if (
                                !moment ||
                                typeof moment !== 'object' ||
                                Array.isArray(moment) ||
                                typeof moment.id !== 'string' ||
                                !moment.id.trim()
                            ) {
                                errors.push(
                                    `Moment ${momentIndex + 1} in Discussion set ${setIndex + 1} requires an ID.`
                                );
                            }
                        }
                    );
                }
            );
        }

        if (
            !Array.isArray(document.culturalLensCards) ||
            document.culturalLensCards.length === 0
        ) {
            errors.push(
                'Structured Subject requires at least one Cultural Lens card.'
            );
        } else {
            document.culturalLensCards.forEach(
                (card, cardIndex) => {
                    if (
                        !card ||
                        typeof card !== 'object' ||
                        Array.isArray(card) ||
                        typeof card.id !== 'string' ||
                        !card.id.trim()
                    ) {
                        errors.push(
                            `Cultural Lens card ${cardIndex + 1} requires an ID.`
                        );
                    }
                }
            );
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    function isValidDocument(document) {
        return validateDocument(document).valid;
    }

    window.AtlasStructuredSubject = {
        schemaVersion: SCHEMA_VERSION,

        createId,
        createMoment,
        createDiscussionSet,
        createCulturalLensCard,
        createBlankDocument,

        validateDocument,
        isValidDocument,

        cloneDocument: cloneJson
    };
})();