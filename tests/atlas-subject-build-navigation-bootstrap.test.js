'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const registry = fs.readFileSync('shared/atlas-content-registry.js', 'utf8');
const client = fs.readFileSync('shared/atlas-subject-build-worker-client.js', 'utf8');
const loader = fs.readFileSync('compass/shared/compass-subject-loader.js', 'utf8');

const surfaces = [
  'index.html',
  'compass/index.html',
  'arcade/index.html',
  'compass/subject/index.html'
];

for (const path of surfaces) {
  const source = fs.readFileSync(path, 'utf8');
  assert.match(
    source,
    /atlas-content-registry\.js\?v=20260926-sharedworkerbatch5/,
    path + ' must load the Batch 5 SharedWorker registry bootstrap.'
  );
}

const subjectPage = fs.readFileSync('compass/subject/index.html', 'utf8');

assert.match(
  subjectPage,
  /compass-subject-loader\.js\?v=20260926-sharedworkerbatch5/,
  'Subject entry must bust the loader cache for SharedWorker handoff integration.'
);

assert.match(
  loader,
  /compass-generation-recovery\.js\?v=20260926-sharedworkerbatch5/,
  'Subject loader must bust the recovery cache for Worker-aware recovery.'
);

assert.match(
  registry,
  /writeAtlasSubjectBuildWorkerClientScript\(\);[\s\S]*?writeAtlasSubjectBuildResurrectionScript\(\);/,
  'SharedWorker client must bootstrap before resurrection coordination.'
);

assert.match(
  registry,
  /atlas-subject-build-worker-client\.js\?v=20260926-buildworker16-integration1/
);

assert.match(
  client,
  /const WORKER_URL =[\s\S]*?buildworker16[\s\S]*?const WORKER_NAME =[\s\S]*?buildworker16/
);

assert.match(
  client,
  /new window\.SharedWorker\([\s\S]*?extendedLifetime:[\s\S]*?true[\s\S]*?catch \{[\s\S]*?new window\.SharedWorker\([\s\S]*?WORKER_URL,[\s\S]*?WORKER_NAME/
);

console.log(
  'Atlas Batch 5 navigation bootstrap passed: all core Atlas surfaces load one versioned SharedWorker bootstrap, subject recovery assets are cache-safe, and extended SharedWorker lifetime retains a fallback path.'
);
