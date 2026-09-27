'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const googleIdentity = fs.readFileSync(
  'shared/atlas-google-identity.js',
  'utf8'
);
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

assert.ok(
  googleIdentity.includes(
    '557655283318-jb0eopspea509ra2bg6878ajiio88ekh.apps.googleusercontent.com'
  )
);
assert.ok(
  googleIdentity.includes(
    'https://accounts.google.com/gsi/client'
  )
);
assert.ok(
  googleIdentity.includes(
    'Identity.renderButton'
  )
);
assert.match(
  googleIdentity,
  /ux_mode:\s*'popup'/
);
assert.match(
  googleIdentity,
  /auto_select:\s*false/
);
assert.match(
  googleIdentity,
  /handlers\.get\(state\)/
);
assert.ok(
  googleIdentity.includes(
    'response?.credential'
  )
);

assert.match(
  cloud,
  /client\.auth\.signInWithIdToken\(\{[\s\S]*?provider:\s*'google'[\s\S]*?token/
);

assert.ok(
  account.includes(
    'async function signInWithGoogleIdToken(idToken)'
  )
);
assert.ok(
  account.includes(
    'const GOOGLE_AUTH_ENABLED = true;'
  )
);
assert.ok(
  account.includes(
    'googleAuthEnabled,\n        signInWithGoogle,\n        signInWithGoogleIdToken,'
  )
);

assert.ok(
  gate.includes(
    'AtlasGoogleIdentity'
  )
);
assert.ok(
  gate.includes(
    'handleGoogleCredential'
  )
);
assert.ok(
  gate.includes(
    '.signInWithGoogleIdToken('
  )
);
assert.match(
  gate,
  /await completeAuthenticatedFlow\(\)/
);
assert.match(
  gate,
  /action:\s*'google_id_token'/
);
assert.doesNotMatch(
  gate,
  /signInWithGoogle\(\{/
);

assert.match(
  page,
  /atlas-google-identity\.js\?v=[^"'\s<]+/
);
assert.ok(
  page.includes(
    'id="continue-google"'
  )
);
assert.ok(
  page.includes(
    '.signInWithGoogleIdToken('
  )
);
assert.match(
  page,
  /action:\s*'google_id_token'/
);
assert.doesNotMatch(
  page,
  /AtlasAccount\.signInWithGoogle\(/
);

assert.match(
  registry,
  /atlas-access-bootstrap\.js\?v=[^"'\s<]+/
);
assert.match(
  registry,
  /atlas-account-chrome\.js\?v=[^"'\s<]+/
);
assert.match(
  capabilityGate,
  /atlas-account-gate\.js\?v=[^"'\s<]+/
);

console.log(
  'Atlas Google auth contract passed: GIS popup delivers a Google ID token directly to Supabase on the active account and gate paths.'
);
