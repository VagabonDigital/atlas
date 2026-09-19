'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const registry = fs.readFileSync(
    'shared/atlas-content-registry.js',
    'utf8'
);

const engine = fs.readFileSync(
    'compass/shared/compass-engine.js',
    'utf8'
);

const tutorContent = fs.readFileSync(
    'shared/atlas-tutor-content-cloud-authority.js',
    'utf8'
);

const tutorSubjects = fs.readFileSync(
    'shared/atlas-tutor-subjects-cloud-authority.js',
    'utf8'
);

// Anonymous -> authenticated must upgrade persistence in every Compass
// document, not only on the Compass hub.
assert.match(
    registry,
    /function installCompassLiveAccountBootstrap\(\)[\s\S]*?startsWith\('\/compass\/'\)[\s\S]*?atlas:account-change/
);

assert.match(
    registry,
    /if \(isCompassHubPath\(\)\) \{[\s\S]*?scheduleCompassHubCloudAuthorityScripts\(\);[\s\S]*?return;[\s\S]*?void loadCompassCloudAuthorityScripts\(\);/
);

assert.match(
    registry,
    /ensureCompassCloudAuthority:[\s\S]*?loadCompassCloudAuthorityScripts/
);

// The dynamic loader owns both authorities used by authorship.
assert.match(
    registry,
    /loadCompassCloudAuthorityScripts\([\s\S]*?AtlasTutorSubjectsCloudAuthority[\s\S]*?AtlasTutorContentCloudAuthority/
);

// Signed-in My Version commits must fail closed until Tutor Content is cloud
// authoritative. A successful browser-local write is not an acceptable fallback.
assert.match(
    engine,
    /async function ensureSubjectAuthoringCloudAuthorityReady\([\s\S]*?ensureCompassCloudAuthority\(\)[\s\S]*?subjectAuthoringCloudAuthorityReady\(kind\)/
);

assert.match(
    engine,
    /async function saveMyVersion\([\s\S]*?await ensureSubjectAuthoringCloudAuthorityReady\(\)[\s\S]*?showSubjectAuthoringPersistenceUnavailable\(\)[\s\S]*?return;[\s\S]*?\.saveVersion\(/
);

// Creating an independently owned subject is protected by the same rule.
assert.match(
    engine,
    /async function createSubjectFromMyVersion\([\s\S]*?await ensureSubjectAuthoringCloudAuthorityReady\([\s\S]*?'subjects'[\s\S]*?Try creating the subject again\.[\s\S]*?return;/
);

assert.match(
    tutorContent,
    /Local\.__atlasCloudAuthority = true/
);

assert.match(
    tutorContent,
    /Store\.__atlasCloudSync = true/
);

assert.match(
    tutorSubjects,
    /cloudWriteAuthority: true/
);

console.log(
    'Compass live-auth authorship persistence contract passed: an anonymous subject upgraded in-place after authentication installs cloud ownership authorities, and signed-in My Version/create writes fail closed until those authorities are active.'
);
