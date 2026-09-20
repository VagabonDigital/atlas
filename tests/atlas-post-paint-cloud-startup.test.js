'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const access = fs.readFileSync('shared/atlas-access-bootstrap.js', 'utf8');
const root = fs.readFileSync('shared/atlas-root-runtime.js', 'utf8');
const registry = fs.readFileSync('shared/atlas-content-registry.js', 'utf8');
const tutors = fs.readFileSync('tutors/index.html', 'utf8');

assert.match(access, /function waitForHubPresentationPaint\(\)/);
assert.match(access, /atlas:local-presentation-ready/);
assert.match(access, /await waitForHubPresentationPaint\(\);\s*\n\s*const Access = await ensureAccess\(\);/);
assert.match(access, /let accountStackPromise = null;/);
assert.match(access, /async function prepareAccountRuntime\(\)/);
assert.match(access, /prepareAccount,\s*prepareAccountRuntime,/);

const prepareAccountStart = access.indexOf('async function prepareAccount()');
const prepareCapabilityStart = access.indexOf('async function prepareCapabilityGate()', prepareAccountStart);
assert.doesNotMatch(
  access.slice(prepareAccountStart, prepareCapabilityStart),
  /waitForHubPresentationPaint/,
  'explicit account actions must bypass the automatic startup gate'
);

const loaderStart = root.indexOf('async function writeRootCloudAuthorityScripts()');
const loaderEnd = root.indexOf('function startInitialRootCloudBootstrap', loaderStart);
const loader = root.slice(loaderStart, loaderEnd);
assert.doesNotMatch(loader, /document\.write/);
assert.match(loader, /Bootstrap\.prepareAccountRuntime\(\)/);
assert.match(root, /function scheduleInitialRootCloudBootstrap\(userId\)/);
assert.match(root, /atlas:local-presentation-ready/);
assert.match(root, /scheduleInitialRootCloudBootstrap\(\s*storedSessionUserId\(\)\s*\);/);
assert.doesNotMatch(root, /const rootCloudAuthorityBootstrapPromise/);

assert.match(registry, /atlas-root-runtime\.js\?v=20260917-postpaint1/);
assert.match(registry, /atlas-access-bootstrap\.js\?v=20260920-googleid1/);
assert.match(registry, /function scheduleCompassHubCloudAuthorityScripts\(\)[\s\S]*atlas:compass-first-paint-ready/);
assert.match(registry, /function installCompassLiveAccountBootstrap\(\)/);
assert.match(
  registry,
  /installCompassLiveAccountBootstrap[\s\S]*atlas:account-change[\s\S]*identityChanged[\s\S]*isCompassHubPath\(\)[\s\S]*scheduleCompassHubCloudAuthorityScripts\(\)[\s\S]*loadCompassCloudAuthorityScripts\(\)/
);
assert.match(
  registry,
  /installCompassLiveAccountBootstrap\(\);\s*\n\s*writeCloudAuthorityScripts\(\);/
);

assert.match(tutors, /class="atlas-fonts-pending"/);
assert.match(tutors, /document\.fonts\.load\('400 16px "DM Sans"'\)/);
assert.match(tutors, /document\.fonts\.load\('400 48px "DM Serif Display"'\)/);
assert.match(tutors, /document\.fonts\.load\('500 16px "Playfair Display"'\)/);
assert.match(tutors, /root\.classList\.remove\('atlas-fonts-pending'\)/);

console.log('Atlas post-paint cloud startup contract passed.');
