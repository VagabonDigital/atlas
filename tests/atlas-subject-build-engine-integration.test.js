'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const engine = fs.readFileSync('compass/shared/compass-engine.js', 'utf8');
const loader = fs.readFileSync('compass/shared/compass-subject-loader.js', 'utf8');
const authority = fs.readFileSync('shared/atlas-tutor-subjects-cloud-authority.js', 'utf8');

assert.match(loader, /atlas-subject-build-runner\.js[\s\S]*?atlas-subject-build-document-operations\.js[\s\S]*?compass-engine\.js/);
assert.match(engine, /function getMyVersionBuildDocumentOperations\(\)[\s\S]*?AtlasSubjectBuildDocumentOperations[\s\S]*?Factory\.create\(/);

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
  'enrichDiscussion',
  'enrichCulturalLens',
  'generateCurrentAffairsReading'
].forEach(name => {
  assert.ok(
    engine.includes('.' + name + '('),
    'Foreground engine must delegate ' + name + ' through shared document operations.'
  );
});

assert.match(engine, /AtlasSubjectBuildRunner[\s\S]*?BuildRunner\.run\(\{[\s\S]*?resumeFromStep:[\s\S]*?onCheckpoint:/);
assert.match(engine, /AtlasForegroundSubjectBuildHandoffPromise[\s\S]*?handoff-await-start[\s\S]*?handoff-await-result/);
assert.match(engine, /loadTutorContentState\(\{ forceOwnedWorkingDraft = false \} = \{\}\)/);

const ownedStateLoader = engine.slice(
  engine.indexOf('async function loadTutorContentState'),
  engine.indexOf('function queueTutorContentWrite')
);
assert.match(
  ownedStateLoader,
  /getBuildState\(MODULE\.id\)[\s\S]*?completedAiSubject[\s\S]*?staleCompletedBuildDraft[\s\S]*?clearWorkingDraft\([\s\S]*?MODULE\.id/
);
assert.match(
  ownedStateLoader,
  /stale-completed-build-draft-discarded/
);
assert.match(engine, /await awaitMyVersionForegroundBuildHandoff\(\);[\s\S]*?loadTutorContentState\(\{[\s\S]*?forceOwnedWorkingDraft:[\s\S]*?true[\s\S]*?\}\)[\s\S]*?getBuildState\([\s\S]*?acquireMyVersionForegroundBuildHandoffLease\(\)/);
assert.match(engine, /myVersionFullSubjectLeasePreacquired[\s\S]*?acquireBuildLease/);
assert.match(engine, /saveMyVersionWorkingDraftNow\([\s\S]*?saveBuildCheckpoint\(/);

const fullSubjectCheckpoint = engine.slice(
  engine.indexOf('async function checkpointMyVersionFullSubjectGeneration'),
  engine.indexOf('function clearMyVersionFullSubjectBuildState')
);
assert.match(fullSubjectCheckpoint, /saveBuildCheckpoint\([\s\S]*?buildState:[\s\S]*?generationContext:[\s\S]*?window\.AtlasGenerationContext/);

const activeBuildDraftCheckpoint = engine.slice(
  engine.indexOf('function saveMyVersionWorkingDraftNow'),
  engine.indexOf('function scheduleMyVersionWorkingDraftSave')
);
assert.match(activeBuildDraftCheckpoint, /saveBuildCheckpoint\([\s\S]*?buildState:[\s\S]*?generationContext:[\s\S]*?window\.AtlasGenerationContext/);
assert.match(engine, /function requireOwnedSubjectRuntimeRevision\([\s\S]*?ATLAS_REVISION_REQUIRED/);
assert.match(engine, /function updateOwnedSubjectAtRuntimeRevision[\s\S]*?updateSubjectAtRevision\([\s\S]*?requireOwnedSubjectRuntimeRevision\(\)/);
assert.match(engine, /completesAiSubjectBuild[\s\S]*?aiBuildStatus:[\s\S]*?'complete'[\s\S]*?generationContext:/);
assert.match(authority, /async function updateSubjectAtRevision\([\s\S]*?ATLAS_REVISION_CONFLICT[\s\S]*?AtlasCloud\.updateOwnedSubject\([\s\S]*?revision/);
assert.match(authority, /updateSubject,[\s\S]*?updateSubjectAtRevision,[\s\S]*?renameSubject/);
assert.match(engine, /function registerMyVersionFullSubjectWithWorker\([\s\S]*?enqueueSubject\([\s\S]*?revision:[\s\S]*?requireOwnedSubjectRuntimeRevision\(\)/);
assert.match(engine, /pagehide[\s\S]*?noteMyVersionFullSubjectPageExit[\s\S]*?beforeunload/);

console.log(
  'Atlas Batch 3 engine integration passed: foreground generation shares Worker document operations and runner semantics, adopts the post-handoff checkpoint before lease acquisition, saves at an exact cloud revision, and registers unfinished foreground work for Worker continuation.'
);
