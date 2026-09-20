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
const gate = fs.readFileSync(
  'shared/atlas-account-gate.js',
  'utf8'
);
const page = fs.readFileSync(
  'account/index.html',
  'utf8'
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
assert.match(
  googleIdentity,
  /response\?\.credential/
);

assert.match(
  cloud,
  /signInWithIdToken/
);
assert.match(
  gate,
  /await completeAuthenticatedFlow\(\)/
);
assert.match(
  gate,
  /action:\s*'google_id_token'/
);
assert.match(
  page,
  /action:\s*'google_id_token'/
);

assert.doesNotMatch(
  gate,
  /signInWithGoogle\(\{/
);
assert.doesNotMatch(
  page,
  /AtlasAccount\.signInWithGoogle\(/
);

console.log(
  'Atlas direct Google ID-token flow proof passed.'
);
