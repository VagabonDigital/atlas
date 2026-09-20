'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const bootstrap = fs.readFileSync(
  'shared/atlas-access-bootstrap.js',
  'utf8'
);
const registry = fs.readFileSync(
  'shared/atlas-content-registry.js',
  'utf8'
);
const atlas = fs.readFileSync('index.html', 'utf8');
const compass = fs.readFileSync(
  'compass/index.html',
  'utf8'
);
const arcade = fs.readFileSync(
  'arcade/index.html',
  'utf8'
);
const tutors = fs.readFileSync(
  'tutors/index.html',
  'utf8'
);

assert.match(
  bootstrap,
  /function hasOAuthSessionInUrl\(\)/
);
assert.match(
  bootstrap,
  /params\.get\('access_token'\)[\s\S]*params\.get\('refresh_token'\)/
);
assert.match(
  bootstrap,
  /!hasStoredAccountSession\(\)[\s\S]*!hasOAuthSessionInUrl\(\)[\s\S]*Access\.bootstrapAnonymous\(\)/
);
assert.match(
  registry,
  /atlas-access-bootstrap\.js\?v=20260920-googleid1/
);

[atlas, compass, arcade, tutors].forEach((source, index) => {
  assert.match(
    source,
    /access_token[\s\S]*refresh_token[\s\S]*atlasAccountHint/,
    `Surface ${index + 1} must treat an OAuth return as pending account state before first paint.`
  );
});

console.log(
  'Atlas OAuth return proof passed: callback tokens force account bootstrap and avoid anonymous first-paint state.'
);
