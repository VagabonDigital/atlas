'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const runtimeChannel = fs.readFileSync(
    'shared/atlas-subject-runtime-channel.js',
    'utf8'
);

const engine = fs.readFileSync(
    'compass/shared/compass-engine.js',
    'utf8'
);

const cloudSubjects = fs.readFileSync(
    'shared/atlas-tutor-subjects-cloud-authority.js',
    'utf8'
);

const subjectPage = fs.readFileSync(
    'compass/subject/index.html',
    'utf8'
);

const compassHub = fs.readFileSync(
    'compass/index.html',
    'utf8'
);

assert.match(
    runtimeChannel,
    /new window\.BroadcastChannel\([\s\S]*?CHANNEL_NAME/
);

assert.match(
    runtimeChannel,
    /navigator\.locks[\s\S]*?navigator\.locks\.request[\s\S]*?ifAvailable:\s*true/
);

assert.match(
    runtimeChannel,
    /async function probeActiveBuild\([\s\S]*?'build-probe'/
);

assert.match(
    runtimeChannel,
    /async function acquireFallbackLease\([\s\S]*?probeActiveBuild\(id\)[\s\S]*?'build-claim'/
);

assert.match(
    runtimeChannel,
    /function publishLocalHeartbeat\([\s\S]*?build-heartbeat/
);

assert.match(
    runtimeChannel,
    /function startBuildHeartbeat\([\s\S]*?publishLocalHeartbeat/
);

assert.match(
    runtimeChannel,
    /function publishSubjectChanged\([\s\S]*?'subject-changed'/
);

assert.match(
    runtimeChannel,
    /STORAGE_SIGNAL_KEY[\s\S]*?window\.addEventListener\([\s\S]*?'storage'/
);

assert.ok(
    subjectPage.includes(
        'atlas-subject-runtime-channel.js?v=20260924-workerrelay1'
    )
);

assert.ok(
    compassHub.includes(
        'atlas-subject-runtime-channel.js?v=20260924-workerrelay1'
    )
);

const generationStart = engine.indexOf(
    'async function generateMyVersionFullSubject({'
);

const acquireIndex = engine.indexOf(
    '.acquireBuildLease(',
    generationStart
);

const generatingTrueIndex = engine.indexOf(
    'myVersionGeneratingFullSubject = true;',
    generationStart
);

assert.ok(
    acquireIndex > generationStart &&
    acquireIndex < generatingTrueIndex,
    'The cross-tab lease must be acquired before generation becomes active.'
);

assert.match(
    engine,
    /acquired === false[\s\S]*?already building in another tab[\s\S]*?releaseCompassSubjectBuildHandoff\(\)/
);

assert.match(
    engine,
    /startBuildHeartbeat\([\s\S]*?MODULE\.id/
);

assert.match(
    engine,
    /finally \{[\s\S]*?generation-ended[\s\S]*?\.release\?\.\(\)[\s\S]*?myVersionGeneratingFullSubject = false/
);

assert.match(
    cloudSubjects,
    /publishSubjectRuntimeChanged\([\s\S]*?'committed'/
);

assert.match(
    cloudSubjects,
    /publishSubjectRuntimeChanged\([\s\S]*?'working-draft'/
);

assert.match(
    cloudSubjects,
    /publishSubjectRuntimeChanged\([\s\S]*?'build-checkpoint'/
);

console.log(
    'Atlas cross-tab subject runtime contract passed: live builds heartbeat, generation is single-writer within the browser, and durable/draft/checkpoint changes publish transient refresh signals.'
);
