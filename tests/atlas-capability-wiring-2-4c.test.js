'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
    return fs.readFileSync(path, 'utf8');
}

const gate = read('shared/atlas-capability-gate.js');
const hub = read('compass/index.html');
const engine = read('compass/shared/compass-engine.js');
const actionWorker = read('compass/shared/atlas-original-action-worker.js');
const restoreWorker = read('compass/shared/atlas-original-restore-worker.js');

assert.match(gate, /const capabilityAllowed =[\s\S]*?can\(capability\)/);
assert.match(gate, /allowance\.status === 'exhausted'[\s\S]*?OUTCOMES\.LIMITED/);
assert.match(gate, /capabilityAllowed[\s\S]*?allowance\.allowed !== false[\s\S]*?OUTCOMES\.ALLOWED/);

assert.match(hub, /requireCompassSubjectCapability\([\s\S]*?'canCreateSubject'[\s\S]*?'create-subject'[\s\S]*?'open-create-dialog'/);
assert.match(hub, /editOwnedSubject[\s\S]*?'canEditSubject'[\s\S]*?'edit-subject'[\s\S]*?'open-owned-subject'/);
assert.match(hub, /duplicateOwnedSubject[\s\S]*?'canCreateSubject'[\s\S]*?'duplicate-owned-subject'/);
assert.match(hub, /generateFullSubject[\s\S]*?'canCreateWithAI'[\s\S]*?'create-subject-ai'/);
assert.match(hub, /askCompassForSubjects[\s\S]*?'canCreateWithAI'[\s\S]*?'suggest-subject-ideas'/);
assert.match(hub, /installSubjectCapabilityResume/);

assert.match(engine, /requestMyVersionEditing[\s\S]*?'canEditSubject'[\s\S]*?'open-authoring'/);
assert.match(engine, /async function saveMyVersion\(options = \{\}\)[\s\S]*?'canEditSubject'[\s\S]*?'save-subject'/);
assert.match(engine, /createSubjectFromMyVersion\(options = \{\}\)[\s\S]*?'canCreateSubject'[\s\S]*?'create-from-version'/);
assert.match(engine, /isSubjectAuthoringAIContext[\s\S]*?myVersionGeneratingFullSubject[\s\S]*?myVersionAuthoringOpen/);
assert.match(engine, /installSubjectAuthoringAIGuard[\s\S]*?'canCreateWithAI'[\s\S]*?'ai-authoring'/);
assert.match(engine, /await requestMyVersionEditing\([\s\S]*?ownedSubjectAuthoringIntent === 'edit'/);

assert.match(engine, /createOwnedSubjectFromAtlasHub[\s\S]*?'canAccessAccountLibrary'[\s\S]*?'canCreateSubject'/);
assert.match(engine, /hubAction === 'restore-version'[\s\S]*?'canEditSubject'[\s\S]*?'restore-atlas-original'/);

assert.match(actionWorker, /action === 'own'[\s\S]*?'canAccessAccountLibrary'[\s\S]*?'canCreateSubject'/);
assert.match(restoreWorker, /requireCapability\([\s\S]*?'canEditSubject'[\s\S]*?'restore-atlas-original'/);

assert.doesNotMatch(hub, /\bisPro\s*\(/);
assert.doesNotMatch(engine, /\bisPro\s*\(/);

console.log(
    'Stage 2.4C capability wiring proof passed: subject creation, editing/My Version, AI allowance, and worker bypasses use canonical capabilities.'
);
