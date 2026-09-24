'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const runnerSource = fs.readFileSync(
    'shared/atlas-subject-build-runner.js',
    'utf8'
);

const swSource = fs.readFileSync(
    'atlas-subject-build-sw.js',
    'utf8'
);

const clientSource = fs.readFileSync(
    'shared/atlas-subject-build-sw-client.js',
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
    swSource,
    /importScripts\(\s*['"]\/shared\/atlas-subject-build-runner\.js['"]/
);

assert.doesNotMatch(
    swSource,
    /addEventListener\(\s*['"]fetch['"]/
);

assert.doesNotMatch(
    swSource,
    /respondWith\s*\(/
);

assert.doesNotMatch(
    swSource,
    /\bcaches\./
);

assert.match(
    swSource,
    /message[\s\S]*?event\.waitUntil\(/
);

assert.match(
    swSource,
    /indexedDB\.open\([\s\S]*?DB_NAME/
);

assert.match(
    swSource,
    /DB_NAME\s*=\s*['"]atlas-tutor-subjects['"]/
);

assert.match(
    swSource,
    /['"]build-checkpoint::['"]/
);

assert.match(
    clientSource,
    /register\([\s\S]*?\/atlas-subject-build-sw\.js[\s\S]*?scope:\s*['"]\/['"]/
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

    assert.equal(
        result.completedStep,
        18
    );

    assert.equal(
        result.complete,
        true
    );

    assert.deepEqual(
        checkpoints,
        [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            13,
            16,
            17,
            18
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

    assert.equal(
        compact.completedStep,
        18
    );

    assert.deepEqual(
        compactCheckpoints,
        [
            3,
            4,
            5,
            7,
            8,
            9,
            10,
            16,
            17,
            18
        ]
    );

    console.log(
        'Atlas Service Worker subject-build foundation passed: canonical build orchestration is DOM-free, current Compass delegates to it, and the experimental Service Worker does not intercept page traffic.'
    );
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
