'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
    return fs.readFileSync(path, 'utf8');
}

function between(source, start, end) {
    const startIndex = source.indexOf(start);
    const endIndex = source.indexOf(end, startIndex + start.length);

    assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
    assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);

    return source.slice(startIndex, endIndex);
}

const panel = read('shared/atlas-session-panel.js');
const atlas = read('index.html');
const hub = read('compass/index.html');
const engine = read('compass/shared/compass-engine.js');

assert.match(panel, /requireCapability\(\s*'canCreateLearner'[\s\S]*?action:\s*'create-learner'/);
assert.match(panel, /requestCreateLearner/);
assert.match(panel, /Authority\.createSession\(cleanName\)/);

const learnerRequest = between(
    panel,
    '    async function requestCreateLearner(',
    '    async function installLearnerCapabilityResume()'
);
assert.doesNotMatch(learnerRequest, /getBridge\(\)\.createSession|Bridge\.createSession/);
assert.match(panel, /subscribeResume\([\s\S]*?action:\s*'create-learner'/);

const rootCreate = between(
    atlas,
    '    async function startWithName(event) {',
    '    function startWithDefault()'
);
assert.match(rootCreate, /Panel\.requestCreateLearner/);
assert.doesNotMatch(rootCreate, /Bridge\.createSession/);

assert.match(hub, /requireCapability\(\s*'canAccessAccountLibrary'[\s\S]*?action:\s*'open-account-library'/);
assert.match(hub, /'add-atlas-original'/);
assert.match(hub, /'add-owned-subject'/);
assert.match(hub, /'remove-owned-subject'/);
assert.match(hub, /if \(action === 'own'\)[\s\S]*?requireAccountLibraryAccess/);
assert.match(hub, /void installAccountLibraryResume\(\);/);

assert.match(engine, /requireCapability\(\s*'canSaveDurableWork'[\s\S]*?action:\s*'save-work'/);
assert.match(engine, /async function toggleSavedLanguage[\s\S]*?requireDurableSaveAccess/);
assert.match(engine, /subscribeResume\([\s\S]*?action:\s*'save-work'/);
assert.match(engine, /void installDurableSaveResume\(\);/);

assert.doesNotMatch(hub, /await installAccountLibraryResume\(\);/);
assert.doesNotMatch(engine, /await installDurableSaveResume\(\);/);

assert.match(hub, /async function ensureAccountLibraryAuthorityReady/);
assert.match(hub, /window\.AtlasTutorSubjectsCloudAuthority/);
assert.match(hub, /isCompassCloudAuthorityPending\(\)[\s\S]*?ensureCompassCloudAuthorityReady\(\)/);
assert.match(hub, /await accountLibraryAccessAllows\(access\)/);

assert.match(engine, /async function ensureDurableContinuityAuthorityReady/);
assert.match(engine, /AtlasLearnerContinuityCloudAuthority/);
assert.match(engine, /AtlasSharedContinuityCloudAuthority/);
assert.match(engine, /data-atlas-learner-cloud-adapter/);
assert.match(engine, /async function removeSavedLanguageEntryById[\s\S]*?requireDurableSaveAccess\([\s\S]*?'remove-entry'/);
assert.match(engine, /context\.operation === 'remove-entry'[\s\S]*?removeSavedLanguageEntryById/);
assert.match(engine, /await durableSaveAccessAllows\(access\)/);

console.log(
    'Stage 2.4B capability wiring proof passed: learner creation, durable saves, and My Subjects use canonical capabilities with resumable auth.'
);
