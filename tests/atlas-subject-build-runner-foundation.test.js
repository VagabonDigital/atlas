'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const runnerSource = fs.readFileSync(
    'shared/atlas-subject-build-runner.js',
    'utf8'
);

const loaderSource = fs.readFileSync(
    'compass/shared/compass-subject-loader.js',
    'utf8'
);

const engineSource = fs.readFileSync(
    'compass/shared/compass-engine.js',
    'utf8'
);

assert.doesNotMatch(
    runnerSource,
    /\b(?:window|document|localStorage|sessionStorage)\b/
);

assert.match(
    loaderSource,
    /atlas-subject-build-runner\.js[\s\S]*?compass-engine\.js/
);

assert.match(
    engineSource,
    /BuildRunner\.run\(\{/
);

assert.match(
    engineSource,
    /generateSubjectFraming:[\s\S]*?generateMyVersionSubjectFraming/
);

assert.match(
    engineSource,
    /enrichDiscussion:[\s\S]*?enrichMyVersionDiscussionFromUI/
);

const context = {};
context.globalThis = context;
context.self = context;

vm.runInNewContext(
    runnerSource,
    context
);

const Runner =
    context.AtlasSubjectBuildRunner;

assert.equal(
    typeof Runner?.run,
    'function'
);

const operations = {
    generateSubjectFraming: async () => ({ ok: true }),
    generateOverview: async () => ({ ok: true }),
    enrichCurrentAffairs: async () => true,
    generateDiscussionFraming: async () => ({ ok: true }),
    generateDiscussionSet: async ({ stage }) => ({ stage }),
    generateCulturalLensFraming: async () => ({ ok: true }),
    generateCulturalLensCard: async () => ({ ok: true }),
    generateReflection: async () => ({ ok: true }),
    enrichDiscussion: async () => true,
    enrichCulturalLens: async () => true
};

(async () => {
    const checkpoints = [];

    const result = await Runner.run({
        operations,
        onCheckpoint: step => {
            checkpoints.push(step);
        }
    });

    assert.equal(result.completedStep, 18);
    assert.equal(result.complete, true);

    assert.deepEqual(
        checkpoints,
        [
            0, 1, 2, 3, 4, 5, 6, 7,
            8, 9, 10, 11, 12, 13, 16, 17, 18
        ]
    );

    const compactCheckpoints = [];

    const compact = await Runner.run({
        subjectSize: 'compact',
        resumeFromStep: 3,
        operations,
        onCheckpoint: step => {
            compactCheckpoints.push(step);
        }
    });

    assert.equal(compact.completedStep, 18);

    assert.deepEqual(
        compactCheckpoints,
        [
            3, 4, 5, 7, 8, 9, 10, 16, 17, 18
        ]
    );

    console.log(
        'Atlas subject-build runner foundation passed: canonical orchestration is DOM-free and current Compass delegates to it.'
    );
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
