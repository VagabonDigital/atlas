'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const aiSource = fs.readFileSync(
    'shared/atlas-ai.js',
    'utf8'
);
const structuredSource = fs.readFileSync(
    'shared/atlas-structured-subject.js',
    'utf8'
);
const operationsSource = fs.readFileSync(
    'shared/atlas-subject-build-document-operations.js',
    'utf8'
);
const engineSource = fs.readFileSync(
    'compass/shared/compass-engine.js',
    'utf8'
);
const loaderSource = fs.readFileSync(
    'compass/shared/compass-subject-loader.js',
    'utf8'
);

assert.doesNotMatch(
    aiSource,
    /\bwindow\./
);
assert.doesNotMatch(
    structuredSource,
    /\bwindow\./
);
assert.doesNotMatch(
    operationsSource,
    /\bwindow\./
);
assert.doesNotMatch(
    operationsSource,
    /\bdocument\.(?:getElementById|querySelector|createElement|activeElement|body|head)\b/
);

assert.match(
    aiSource,
    /configureRuntime/
);
assert.match(
    aiSource,
    /runtime\.getAccessToken/
);
assert.match(
    aiSource,
    /runtime\.getSubjectId/
);
assert.match(
    aiSource,
    /runtime\.getGenerationContext/
);

assert.match(
    loaderSource,
    /atlas-subject-build-runner\.js[\s\S]*?atlas-subject-build-document-operations\.js[\s\S]*?compass-engine\.js/
);

[
    'generateSubjectFraming',
    'generateOverview',
    'generateDiscussionFraming',
    'generateDiscussionSet',
    'generateCulturalLensFraming',
    'generateCulturalLensCard',
    'generateReflection',
    'generateMomentUpgrade',
    'generateMakeItReal',
    'generateCulturalLensUpgrade',
    'getDiscussionEnrichmentPlan',
    'getCulturalLensEnrichmentPlan',
    'generateCurrentAffairsReading'
].forEach(name => {
    assert.ok(
        engineSource.includes(
            '.' + name + '('
        ),
        'Compass should delegate ' +
            name +
            ' to shared build operations.'
    );
});

const buildRoot = {
    crypto: {
        randomUUID() {
            buildRoot.__id =
                (buildRoot.__id || 0) + 1;
            return 'build-id-' +
                buildRoot.__id;
        }
    }
};

vm.createContext(buildRoot);

vm.runInContext(
    structuredSource,
    buildRoot
);
vm.runInContext(
    operationsSource,
    buildRoot
);

const Structured =
    buildRoot.AtlasStructuredSubject;

const Factory =
    buildRoot.AtlasSubjectBuildDocumentOperations;

assert.equal(
    typeof Structured?.createBlankDocument,
    'function'
);
assert.equal(
    typeof Factory?.create,
    'function'
);

let subjectDocument =
    Structured.createBlankDocument({
        title:
            'Worker Neutral Subject'
    });

const calls = [];
let setNumber = 0;
let cardNumber = 0;

const FakeAI = {
    async generateSubjectFraming(input) {
        calls.push([
            'subject-framing',
            input
        ]);

        return {
            catalogDescription:
                'A concise description.',
            hook:
                'A sharp hook.'
        };
    },

    async generateOverview(input) {
        calls.push([
            'overview',
            input
        ]);

        return {
            heading:
                'Open Door',
            intro:
                'Start here.',
            question:
                'What comes to mind first?'
        };
    },

    async generateDiscussionFraming(input) {
        calls.push([
            'discussion-framing',
            input
        ]);

        return {
            heading:
                'Talk It Through',
            intro:
                'Move into the idea.',
            pathDescription:
                'Questions that deepen the conversation.'
        };
    },

    async generateDiscussionSet(input) {
        calls.push([
            'discussion-set',
            input
        ]);

        setNumber += 1;

        const stages = [
            'First Look',
            'Look Closer',
            'Wider View'
        ];

        return {
            title:
                'Set ' + setNumber,
            stage:
                stages[
                    setNumber - 1
                ],
            description:
                'Discussion set ' +
                setNumber,
            moments: [
                {
                    preview:
                        'Moment ' +
                        setNumber,
                    question:
                        'Question ' +
                        setNumber
                }
            ]
        };
    },

    async generateCulturalLensFraming(input) {
        calls.push([
            'lens-framing',
            input
        ]);

        return {
            heading:
                'Across Contexts',
            intro:
                'Compare perspectives.',
            pathDescription:
                'See the subject in different contexts.'
        };
    },

    async generateCulturalLensCard(input) {
        calls.push([
            'lens-card',
            input
        ]);

        cardNumber += 1;

        return {
            title:
                'Lens ' + cardNumber,
            contextLine:
                'Context ' + cardNumber,
            teaser:
                'Teaser ' + cardNumber,
            context:
                'Background ' +
                cardNumber,
            questions: [
                'Lens question ' +
                    cardNumber
            ],
            followTheThread: []
        };
    },

    async generateReflection(input) {
        calls.push([
            'reflection',
            input
        ]);

        return {
            title:
                'Look Back',
            summary:
                'Pull it together.',
            questions: [
                'What stayed with you?'
            ],
            pathDescription:
                'Bring the subject together.'
        };
    },

    async generateMomentUpgrade(input) {
        calls.push([
            'moment-upgrade',
            input
        ]);

        return {
            term:
                'pinpoint',
            type:
                'verb',
            definition:
                'identify exactly',
            ordinary:
                'I can identify it.',
            upgraded:
                'I can pinpoint it.',
            priority:
                'standard',
            atlasPrompt:
                'What can you pinpoint?'
        };
    },

    async generateMakeItReal(input) {
        calls.push([
            'make-it-real',
            input
        ]);

        return {
            title:
                'Try It',
            prompt:
                'Use the idea.'
        };
    },

    async generateCulturalLensUpgrade(input) {
        calls.push([
            'lens-upgrade',
            input
        ]);

        return {
            term:
                'contrast',
            type:
                'verb',
            definition:
                'show a difference',
            ordinary:
                'They are different.',
            upgraded:
                'They contrast sharply.',
            priority:
                'standard',
            atlasPrompt:
                'What can you contrast?'
        };
    },

    async selectKeyLanguageOpportunities({
        candidates,
        limit
    }) {
        return candidates
            .slice(0, limit)
            .map(item =>
                item.id
            );
    },

    async generateCurrentAffairsReading(input) {
        calls.push([
            'current-affairs-reading',
            input
        ]);

        return {
            readMore:
                'Reading',
            readMoreQuestions: [
                'One?',
                'Two?'
            ],
            imageUrl: ''
        };
    }
};

const Operations =
    Factory.create({
        ai: FakeAI,
        structured:
            Structured,

        getDocument() {
            return subjectDocument;
        },

        commit(mutator) {
            return mutator(
                subjectDocument,
                {}
            );
        }
    });

async function testDocumentOperations() {
    await Operations
        .generateSubjectFraming();

    await Operations
        .generateOverview();

    await Operations
        .generateDiscussionFraming();

    for (
        let index = 0;
        index < 3;
        index += 1
    ) {
        await Operations
            .generateDiscussionSet();
    }

    await Operations
        .generateCulturalLensFraming();

    for (
        let index = 0;
        index < 6;
        index += 1
    ) {
        await Operations
            .generateCulturalLensCard();
    }

    await Operations
        .generateReflection();

    assert.equal(
        subjectDocument
            .discussionSets
            .length,
        3
    );

    assert.equal(
        subjectDocument
            .culturalLensCards
            .length,
        6
    );

    assert.equal(
        subjectDocument
            .subjectCopy
            .overview
            .heading,
        'Open Door'
    );

    assert.equal(
        subjectDocument
            .subjectCopy
            .reflection
            .title,
        'Look Back'
    );

    const firstMoment =
        subjectDocument
            .discussionSets[0]
            .moments[0];

    await Operations
        .generateMomentUpgrade({
            momentId:
                firstMoment.id,
            priority:
                'key'
        });

    await Operations
        .generateMakeItReal({
            setId:
                subjectDocument
                    .discussionSets[0]
                    .id
        });

    await Operations
        .generateCulturalLensUpgrade({
            cardId:
                subjectDocument
                    .culturalLensCards[0]
                    .id,
            priority:
                'key'
        });

    assert.equal(
        firstMoment
            .upgrade
            .priority,
        'key'
    );

    assert.equal(
        subjectDocument
            .discussionSets[0]
            .makeItReal
            .title,
        'Try It'
    );

    assert.equal(
        subjectDocument
            .culturalLensCards[0]
            .upgrade
            .priority,
        'key'
    );

    const discussionPlan =
        await Operations
            .getDiscussionEnrichmentPlan({
                languageMode:
                    'key',
                subjectSize:
                    'standard'
            });

    const lensPlan =
        await Operations
            .getCulturalLensEnrichmentPlan({
                languageMode:
                    'key',
                subjectSize:
                    'standard'
            });

    assert.ok(
        discussionPlan
            .candidateIds
            .length > 0
    );

    assert.ok(
        lensPlan
            .candidateIds
            .length > 0
    );

    const currentAffairs =
        await Operations
            .generateCurrentAffairsReading({
                generationContext: {
                    ideaMode:
                        'current-affairs',
                    languageLevel:
                        'b2',
                    source: {
                        publisher:
                            'Example News',
                        title:
                            'Example development',
                        url:
                            'https://example.com/story',
                        summary:
                            'A supported summary.',
                        keyFacts: [
                            'Fact one.',
                            'Fact two.'
                        ]
                    }
                }
            });

    assert.equal(
        currentAffairs
            .generationContext
            .source
            .readMore,
        'Reading'
    );

    assert.deepEqual(
        currentAffairs
            .generationContext
            .source
            .readMoreQuestions,
        [
            'One?',
            'Two?'
        ]
    );

    assert.ok(
        calls.some(
            ([kind]) =>
                kind ===
                'discussion-set'
        )
    );
}

async function testWorkerNeutralAI() {
    let captured = null;

    const aiRoot = {
        Headers,
        AbortController,
        setTimeout,
        clearTimeout,

        crypto: {
            randomUUID() {
                return (
                    'request-id-' +
                    '1234567890'
                );
            }
        },

        console,

        fetch: async () => {
            throw new Error(
                'Default fetch should not be used after runtime injection.'
            );
        }
    };

    vm.createContext(aiRoot);

    vm.runInContext(
        aiSource,
        aiRoot
    );

    const AI =
        aiRoot.AtlasAI;

    assert.equal(
        typeof AI?.configureRuntime,
        'function'
    );

    AI.configureRuntime({
        getAccessToken:
            async () =>
                'worker-token',

        getSubjectId:
            () =>
                'subject-worker-test',

        getGenerationContext:
            () => ({
                languageLevel:
                    'b2',
                conversationStyle:
                    'balanced'
            }),

        fetch:
            async (url, init) => {
                captured = {
                    url,
                    init
                };

                return {
                    ok: true,
                    status: 200,

                    async json() {
                        return {
                            ok: true,
                            payload: {
                                heading:
                                    'Worker Overview',
                                intro:
                                    'Worker intro.',
                                question:
                                    'Worker question?'
                            }
                        };
                    }
                };
            }
    });

    const result =
        await AI.generateOverview({
            subject: {
                title:
                    'Worker Subject',
                description:
                    'Description',
                hook:
                    'Hook'
            }
        });

    assert.equal(
        result.heading,
        'Worker Overview'
    );

    assert.equal(
        captured.init.headers.get(
            'Authorization'
        ),
        'Bearer worker-token'
    );

    assert.equal(
        captured.init.headers.get(
            'X-Atlas-Subject-Id'
        ),
        'subject-worker-test'
    );

    const body =
        JSON.parse(
            captured.init.body
        );

    assert.match(
        body.brief,
        /LANGUAGE LEVEL:/
    );
}

(async () => {
    await testDocumentOperations();
    await testWorkerNeutralAI();

    console.log(
        'Atlas Batch 1 worker-neutral subject generation passed.'
    );
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
