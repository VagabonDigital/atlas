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
    const DISCUSSION_FOLLOW_UP_LIMIT = 3;
    const DISCUSSION_FOLLOW_UP_KINDS = new Set([
        'go-deeper',
        'another-angle',
        'add-a-twist',
        'custom'
    ]);
    const UPGRADE_PRIORITIES = new Set([
        'key',
        'standard'
    ]);

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
                    heading: 'Discussion',
                    intro: ''
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

    function isPlainObject(value) {
        return Boolean(
            value &&
            typeof value === 'object' &&
            !Array.isArray(value)
        );
    }

    function validateString(
        value,
        label,
        errors,
        optional = false
    ) {
        if (optional && value === undefined) return;

        if (typeof value !== 'string') {
            errors.push(`${label} must be a string.`);
        }
    }

    function validateStringArray(
        value,
        label,
        errors,
        optional = false
    ) {
        if (optional && value === undefined) return;

        if (!Array.isArray(value)) {
            errors.push(`${label} must be an array.`);
            return;
        }

        value.forEach((item, index) => {
            if (typeof item !== 'string') {
                errors.push(
                    `${label} item ${index + 1} must be a string.`
                );
            }
        });
    }

    function validateUpgrade(
        upgrade,
        label,
        errors
    ) {
        if (upgrade === undefined) return;

        if (!isPlainObject(upgrade)) {
            errors.push(`${label} must be an object.`);
            return;
        }

        [
            'term',
            'type',
            'definition',
            'ordinary',
            'upgraded',
            'atlasPrompt',
            'insteadOfLabel',
            'tryLabel'
        ].forEach(field => {
            validateString(
                upgrade[field],
                `${label}.${field}`,
                errors,
                true
            );
        });

        if (upgrade.priority !== undefined) {
            validateString(
                upgrade.priority,
                `${label}.priority`,
                errors
            );

            if (
                typeof upgrade.priority === 'string' &&
                !UPGRADE_PRIORITIES.has(upgrade.priority)
            ) {
                errors.push(
                    `${label}.priority must be key or standard.`
                );
            }
        }
    }

    function validateDiscussionFollowUps(
        moment,
        label,
        errors
    ) {
        const hasLegacyFollowUp =
            Object.prototype.hasOwnProperty.call(
                moment,
                'followUp'
            );

        const hasFollowUps =
            Object.prototype.hasOwnProperty.call(
                moment,
                'followUps'
            );

        if (hasLegacyFollowUp && hasFollowUps) {
            errors.push(
                `${label} cannot contain both followUp and followUps.`
            );
        }

        let followUps = [];

        if (hasFollowUps) {
            if (!Array.isArray(moment.followUps)) {
                errors.push(
                    `${label}.followUps must be an array.`
                );
                return;
            }

            followUps = moment.followUps;
        } else if (hasLegacyFollowUp) {
            if (!isPlainObject(moment.followUp)) {
                errors.push(
                    `${label}.followUp must be an object.`
                );
                return;
            }

            followUps = [moment.followUp];
        }

        if (
            followUps.length >
            DISCUSSION_FOLLOW_UP_LIMIT
        ) {
            errors.push(
                `${label} cannot contain more than ${DISCUSSION_FOLLOW_UP_LIMIT} follow-ups.`
            );
        }

        const followUpIds = new Set();

        followUps.forEach((followUp, index) => {
            const followUpLabel =
                `${label} follow-up ${index + 1}`;

            if (!isPlainObject(followUp)) {
                errors.push(
                    `${followUpLabel} must be an object.`
                );
                return;
            }

            const id =
                typeof followUp.id === 'string'
                    ? followUp.id.trim()
                    : '';

            if (!id) {
                errors.push(
                    `${followUpLabel} requires an ID.`
                );
            } else if (followUpIds.has(id)) {
                errors.push(
                    `${followUpLabel} has a duplicate ID.`
                );
            } else {
                followUpIds.add(id);
            }

            validateString(
                followUp.kind,
                `${followUpLabel}.kind`,
                errors
            );

            if (
                typeof followUp.kind === 'string' &&
                !DISCUSSION_FOLLOW_UP_KINDS.has(
                    followUp.kind
                )
            ) {
                errors.push(
                    `${followUpLabel}.kind is not supported.`
                );
            }

            validateString(
                followUp.prompt,
                `${followUpLabel}.prompt`,
                errors
            );

            validateString(
                followUp.label,
                `${followUpLabel}.label`,
                errors,
                true
            );
        });
    }

    function validateLevelOneContent(
        document,
        errors
    ) {
        if (
            document.schemaVersion !== undefined &&
            (
                !Number.isInteger(document.schemaVersion) ||
                document.schemaVersion < 1
            )
        ) {
            errors.push(
                'Document schemaVersion must be a positive integer.'
            );
        }

        if (isPlainObject(document.module)) {
            [
                'navTitle',
                'bgImage',
                'catalogDescription'
            ].forEach(field => {
                validateString(
                    document.module[field],
                    `module.${field}`,
                    errors,
                    true
                );
            });
        }

        const copy = document.subjectCopy;

        if (isPlainObject(copy)) {
            if (isPlainObject(copy.cover)) {
                validateString(
                    copy.cover.hook,
                    'subjectCopy.cover.hook',
                    errors,
                    true
                );
            }

            if (isPlainObject(copy.overview)) {
                validateString(
                    copy.overview.heading,
                    'subjectCopy.overview.heading',
                    errors,
                    true
                );

                validateString(
                    copy.overview.question,
                    'subjectCopy.overview.question',
                    errors,
                    true
                );

                if (
                    Array.isArray(
                        copy.overview.intro
                    )
                ) {
                    validateStringArray(
                        copy.overview.intro,
                        'subjectCopy.overview.intro',
                        errors
                    );
                }
            }

            if (isPlainObject(copy.discussion)) {
                validateString(
                    copy.discussion.heading,
                    'subjectCopy.discussion.heading',
                    errors,
                    true
                );

                validateString(
                    copy.discussion.intro,
                    'subjectCopy.discussion.intro',
                    errors,
                    true
                );
            }

            if (isPlainObject(copy.culturalLens)) {
                validateString(
                    copy.culturalLens.heading,
                    'subjectCopy.culturalLens.heading',
                    errors,
                    true
                );

                validateString(
                    copy.culturalLens.intro,
                    'subjectCopy.culturalLens.intro',
                    errors,
                    true
                );
            }

            if (isPlainObject(copy.reflection)) {
                validateString(
                    copy.reflection.title,
                    'subjectCopy.reflection.title',
                    errors,
                    true
                );

                validateString(
                    copy.reflection.summary,
                    'subjectCopy.reflection.summary',
                    errors,
                    true
                );

                if (
                    Array.isArray(
                        copy.reflection.questions
                    )
                ) {
                    validateStringArray(
                        copy.reflection.questions,
                        'subjectCopy.reflection.questions',
                        errors
                    );
                }
            }
        }

        const setIds = new Set();
        const momentIds = new Set();

        if (Array.isArray(document.discussionSets)) {
            document.discussionSets.forEach(
                (set, setIndex) => {
                    if (!isPlainObject(set)) return;

                    const setLabel =
                        `Discussion set ${setIndex + 1}`;

                    const setId =
                        typeof set.id === 'string'
                            ? set.id.trim()
                            : '';

                    if (setId) {
                        if (setIds.has(setId)) {
                            errors.push(
                                `${setLabel} has a duplicate ID.`
                            );
                        } else {
                            setIds.add(setId);
                        }
                    }

                    [
                        'title',
                        'stage',
                        'icon',
                        'description'
                    ].forEach(field => {
                        validateString(
                            set[field],
                            `${setLabel}.${field}`,
                            errors
                        );
                    });

                    if (
                        set.makeItReal !== undefined
                    ) {
                        if (
                            !isPlainObject(
                                set.makeItReal
                            )
                        ) {
                            errors.push(
                                `${setLabel}.makeItReal must be an object.`
                            );
                        } else {
                            validateString(
                                set.makeItReal.label,
                                `${setLabel}.makeItReal.label`,
                                errors,
                                true
                            );

                            validateString(
                                set.makeItReal.title,
                                `${setLabel}.makeItReal.title`,
                                errors
                            );

                            validateString(
                                set.makeItReal.prompt,
                                `${setLabel}.makeItReal.prompt`,
                                errors
                            );
                        }
                    }

                    if (!Array.isArray(set.moments)) {
                        return;
                    }

                    set.moments.forEach(
                        (moment, momentIndex) => {
                            if (
                                !isPlainObject(moment)
                            ) {
                                return;
                            }

                            const momentLabel =
                                `${setLabel} moment ${momentIndex + 1}`;

                            const momentId =
                                typeof moment.id === 'string'
                                    ? moment.id.trim()
                                    : '';

                            if (momentId) {
                                if (
                                    momentIds.has(
                                        momentId
                                    )
                                ) {
                                    errors.push(
                                        `${momentLabel} has a duplicate ID.`
                                    );
                                } else {
                                    momentIds.add(
                                        momentId
                                    );
                                }
                            }

                            validateString(
                                moment.preview,
                                `${momentLabel}.preview`,
                                errors
                            );

                            validateString(
                                moment.question,
                                `${momentLabel}.question`,
                                errors
                            );

                            validateDiscussionFollowUps(
                                moment,
                                momentLabel,
                                errors
                            );

                            validateUpgrade(
                                moment.upgrade,
                                `${momentLabel}.upgrade`,
                                errors
                            );
                        }
                    );
                }
            );
        }

        const cardIds = new Set();

        if (
            Array.isArray(
                document.culturalLensCards
            )
        ) {
            document.culturalLensCards.forEach(
                (card, cardIndex) => {
                    if (!isPlainObject(card)) return;

                    const cardLabel =
                        `Cultural Lens card ${cardIndex + 1}`;

                    const cardId =
                        typeof card.id === 'string'
                            ? card.id.trim()
                            : '';

                    if (cardId) {
                        if (cardIds.has(cardId)) {
                            errors.push(
                                `${cardLabel} has a duplicate ID.`
                            );
                        } else {
                            cardIds.add(cardId);
                        }
                    }

                    [
                        'title',
                        'contextLine',
                        'teaser',
                        'context'
                    ].forEach(field => {
                        validateString(
                            card[field],
                            `${cardLabel}.${field}`,
                            errors
                        );
                    });

                    validateString(
                        card.mainQuestion,
                        `${cardLabel}.mainQuestion`,
                        errors,
                        true
                    );

                    validateString(
                        card.questionLabel,
                        `${cardLabel}.questionLabel`,
                        errors,
                        true
                    );

                    validateString(
                        card.followTheThreadLabel,
                        `${cardLabel}.followTheThreadLabel`,
                        errors,
                        true
                    );

                    validateStringArray(
                        card.questions,
                        `${cardLabel}.questions`,
                        errors,
                        true
                    );

                    validateStringArray(
                        card.followTheThread,
                        `${cardLabel}.followTheThread`,
                        errors,
                        true
                    );

                    validateUpgrade(
                        card.upgrade,
                        `${cardLabel}.upgrade`,
                        errors
                    );
                }
            );
        }
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
                copy.discussion &&
                Object.prototype.hasOwnProperty.call(
                    copy.discussion,
                    'intro'
                ) &&
                typeof copy.discussion.intro !== 'string'
            ) {
                errors.push(
                    'Discussion intro must be a string.'
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

        validateLevelOneContent(
            document,
            errors
        );

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