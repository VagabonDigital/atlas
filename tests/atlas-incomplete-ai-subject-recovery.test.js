'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const loader = fs.readFileSync(
    'compass/shared/compass-subject-loader.js',
    'utf8'
);

const engine = fs.readFileSync(
    'compass/shared/compass-engine.js',
    'utf8'
);

const subjectPage = fs.readFileSync(
    'compass/subject/index.html',
    'utf8'
);

const recovery = fs.readFileSync(
    'compass/shared/compass-generation-recovery.js',
    'utf8'
);

// Owned-subject loading must distinguish a durable unfinished AI build from
// a normal Structured Subject. The loader delegates to the shared lifecycle
// classifier; its inline fallback exists only for a partially cached deploy.
assert.match(
    subjectPage,
    /atlas-ai-subject-build-lifecycle\.js\?v=20260923-buildprojection1/
);

assert.match(
    loader,
    /AtlasAiSubjectBuildLifecycle[\s\S]*?Lifecycle\.classify\(record\)/
);

assert.match(
    loader,
    /function getOwnedSubjectAiBuildState\(record\)/
);

assert.match(
    loader,
    /provenanceKind === 'ai-subject-build'/
);

assert.match(
    loader,
    /\['building', 'paused', 'complete'\][\s\S]*?\.includes\(status\)/
);

assert.match(
    loader,
    /metadata\.legacyAiBuildRecovery === true/
);

assert.match(
    loader,
    /status === 'complete'[\s\S]*?\? false/
);

assert.match(
    loader,
    /aiBuildIncomplete:[\s\S]*?aiBuild\.incomplete/
);

assert.match(
    loader,
    /AtlasSubjectBuildPresentationRequested =[\s\S]*?getBuildPresentationRequest\(\) \|\|[\s\S]*?aiBuildIncomplete === true/
);

// Opening an unfinished build must enter recovery instead of teaching the
// starter shell. Existing browser checkpoint state is read when present; if
// it is missing, generation restarts from step 0 using the durable brief.
assert.match(
    engine,
    /const recoveringOwnedSubjectBuild =[\s\S]*?incompleteOwnedSubjectBuild &&[\s\S]*?!freshOwnedSubjectBuild/
);

assert.match(
    engine,
    /pendingOwnedSubjectAuthoringIntent ===[\s\S]*?'generate'[\s\S]*?!incompleteOwnedSubjectBuild[\s\S]*?consumeOwnedSubjectAuthoringIntent\(\)[\s\S]*?pendingOwnedSubjectAuthoringIntent =[\s\S]*?''/,
    'A stale author=generate URL must be discarded after durable completion.'
);

assert.match(
    engine,
    /const freshOwnedSubjectBuild =[\s\S]*?incompleteOwnedSubjectBuild &&[\s\S]*?pendingOwnedSubjectAuthoringIntent ===[\s\S]*?'generate'/,
    'Fresh generation intent is valid only while the owned subject is incomplete.'
);

assert.match(
    engine,
    /recoveringOwnedSubjectBuild[\s\S]*?ensureSubjectAuthoringCloudAuthorityReady\([\s\S]*?'subjects'/
);

assert.match(
    engine,
    /Recovery must read browser-owned checkpoint state[\s\S]*?await loadTutorContentState\(\)/
);

assert.match(
    engine,
    /recoveringOwnedSubjectBuild[\s\S]*?\? 'generate'/
);

assert.match(
    engine,
    /skipCapabilityGate:[\s\S]*?freshOwnedSubjectBuild \|\|[\s\S]*?recoveringOwnedSubjectBuild/
);

assert.match(
    engine,
    /const resumableFullSubjectBuild =[\s\S]*?ownedSubjectBuildState\?\.kind ===[\s\S]*?'full-subject'/
);

assert.match(
    engine,
    /resumeFromStep:[\s\S]*?resumableFullSubjectBuild[\s\S]*?\.completedStep[\s\S]*?: 0/
);

assert.match(
    loader,
    /compass-engine\.js\?v=20260925-completionstate1/
);

assert.match(
    loader,
    /compass-generation-recovery\.js\?v=20260925-workeraware2/
);

assert.match(
    recovery,
    /function hasLiveBackgroundBuild\(\)[\s\S]*?AtlasSubjectBuildWorkerClient[\s\S]*?activeBuild[\s\S]*?AtlasSubjectRuntimeChannel[\s\S]*?isBuildActive/
);

assert.match(
    recovery,
    /if \(hasLiveBackgroundBuild\(\)\) \{\s*showLiveContinuation\(\);\s*return;\s*\}[\s\S]*?Generation interrupted · continuing…/
);

assert.match(
    recovery,
    /async function resumeFromCheckpoint[\s\S]*?if \(hasLiveBackgroundBuild\(\)\) \{\s*showLiveContinuation\(\);\s*return false;/
);

assert.match(
    recovery,
    /myVersionFullSubjectGenerationNotice =\s*'Continuing generation…'/
);

assert.match(
    recovery,
    /async function refreshCompletedSubjectIfNeeded\(\)[\s\S]*?aiBuildStatus[\s\S]*?'complete'[\s\S]*?window\.location\.reload\(\)/
);

assert.match(
    recovery,
    /if \(!state\) \{[\s\S]*?await refreshCompletedSubjectIfNeeded\(\)[\s\S]*?resetRecoveryState\(\)/
);

assert.match(
    subjectPage,
    /compass-subject-loader\.js\?v=20260925-workeraware3/
);

console.log(
    'Atlas incomplete AI subject recovery contract passed: unfinished cloud markers activate build presentation and recovery, live Batch 5 background builds suppress legacy interruption recovery, browser checkpoints resume when available, and missing checkpoints restart from the durable generation context rather than exposing a blank teaching shell.'
);
