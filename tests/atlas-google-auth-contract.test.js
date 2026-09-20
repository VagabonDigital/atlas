'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const cloud = fs.readFileSync(
  'shared/atlas-account-cloud.js',
  'utf8'
);
const account = fs.readFileSync(
  'shared/atlas-account.js',
  'utf8'
);
const gate = fs.readFileSync(
  'shared/atlas-account-gate.js',
  'utf8'
);
const gateCss = fs.readFileSync(
  'shared/atlas-account-gate.css',
  'utf8'
);
const page = fs.readFileSync(
  'account/index.html',
  'utf8'
);
const registry = fs.readFileSync(
  'shared/atlas-content-registry.js',
  'utf8'
);
const capabilityGate = fs.readFileSync(
  'shared/atlas-capability-gate.js',
  'utf8'
);

assert.match(
  cloud,
  /client\.auth\.signInWithOAuth\([\s\S]*?provider:\s*'google'/
);
assert.ok(account.includes('async function signInWithGoogle({'));
assert.ok(account.includes('returnIntentId'));
assert.ok(account.includes('candidate.origin !=='));
assert.ok(
  account.includes(
    'const GOOGLE_AUTH_ENABLED = true;'
  )
);
assert.ok(
  account.includes(
    'googleAuthEnabled,\n        signInWithGoogle,'
  )
);
assert.ok(gate.includes('Continue with Google'));
assert.ok(gate.includes('activeReturnIntentId'));
assert.ok(gate.includes('updateGoogleProviderVisibility()'));
assert.ok(gateCss.includes('.atlas-account-google'));
assert.ok(page.includes('id="continue-google"'));
assert.ok(page.includes('Sign-in method'));
assert.ok(page.includes('state.hasPassword !== true'));
assert.ok(
  registry.includes(
    'atlas-access-bootstrap.js?v=20260920-oauthreturn1'
  )
);
assert.ok(
  registry.includes(
    'atlas-account-chrome.js?v=20260920-googleauth1'
  )
);
assert.ok(
  capabilityGate.includes(
    'atlas-account-gate.js?v=20260920-googleauth1'
  )
);

console.log(
  'Atlas Google auth contract passed: OAuth adapter, safe redirect, return-intent preservation, provider-aware UI, and deploy safety.'
);
