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

const cloudSubjects = fs.readFileSync(
  'shared/atlas-tutor-subjects-cloud-authority.js',
  'utf8'
);

assert.match(
  loader,
  /AtlasCompassOwnedSubjectRuntimeLayersReady\s*=\s*new Promise/
);

assert.match(
  loader,
  /AtlasCompassGenerationRecovery[\s\S]*?installRuntime\(\)[\s\S]*?signalOwnedSubjectRuntimeLayersReady\(true\)/
);

assert.match(
  loader,
  /catch \(error\) \{[\s\S]*?signalOwnedSubjectRuntimeLayersReady\(false\)[\s\S]*?throw error;/
);

assert.match(
  engine,
  /pendingOwnedSubjectAuthoringIntent\s*=\s*getOwnedSubjectAuthoringIntent\(\)[\s\S]*?freshOwnedSubjectBuild[\s\S]*?pendingOwnedSubjectAuthoringIntent ===[\s\S]*?'generate'/
);

assert.match(
  engine,
  /if \(!runtimeLayersReady\) \{[\s\S]*?Keep \?author=generate intact[\s\S]*?return;[\s\S]*?const ownedSubjectAuthoringIntent =\s*consumeOwnedSubjectAuthoringIntent\(\);/
);

assert.match(
  engine,
  /if \(freshOwnedSubjectBuild\) \{[\s\S]*?waitForOwnedSubjectRuntimeLayersReady\(\)[\s\S]*?tutorContentWorkingDraft = null;[\s\S]*?\} else \{\s*await loadTutorContentState\(\);/
);

assert.match(
  engine,
  /isOwnedSubjectRuntime\(\) &&\s*!freshOwnedSubjectBuild[\s\S]*?getBuildState\(MODULE\.id\)/
);

assert.match(
  engine,
  /skipCapabilityGate:\s*freshOwnedSubjectBuild/
);

const releaseIndex = engine.indexOf(
  'if (freshOwnedSubjectBuild) {\n        /*\n         * The real owned-subject shell'
);

assert.ok(
  releaseIndex >= 0,
  'Fresh generation must have an explicit early cover-release boundary.'
);

const generationIndex = engine.indexOf(
  'void generateMyVersionFullSubject({',
  releaseIndex
);

assert.ok(
  generationIndex > releaseIndex,
  'The cover handoff must release before full AI generation begins.'
);

const fullGenerationStart = engine.indexOf(
  'async function generateMyVersionFullSubject({'
);

const overviewStep = engine.indexOf(
  "if (completedStep < 2) {",
  fullGenerationStart
);

const framingSegment = engine.slice(
  fullGenerationStart,
  overviewStep
);

assert.doesNotMatch(
  framingSegment,
  /releaseCompassSubjectBuildHandoff\(\)/,
  'Hook/framing completion must not own cover entry.'
);

assert.doesNotMatch(
  engine,
  /A fresh build keeps the gate until step 1 completes/
);

assert.match(
  cloudSubjects,
  /createOwnedSubject\(record\)[\s\S]*?invalidateSnapshot\(\);[\s\S]*?return cloneJson\(created\);/
);

assert.doesNotMatch(
  cloudSubjects,
  /return AtlasCloud\.getOwnedSubject\(created\.id\);/
);

console.log(
  'Atlas fresh subject entry contract passed: runtime layers gate safety, fresh-state reads are skipped, cover releases before AI framing, and create avoids the redundant cloud re-fetch.'
);
