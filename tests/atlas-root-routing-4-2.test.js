const assert = require('assert');
const fs = require('fs');

const root = fs.readFileSync('index.html', 'utf8');
const inside = fs.readFileSync('tutors/index.html', 'utf8');
const account = fs.readFileSync('account/index.html', 'utf8');
const returnIntent = fs.readFileSync(
  'shared/atlas-return-intent.js',
  'utf8'
);
const returnHandoff = fs.readFileSync(
  'shared/atlas-return-handoff.js',
  'utf8'
);
const accountRuntime = fs.readFileSync(
  'shared/atlas-account.js',
  'utf8'
);

// ---------------------------------------------------------------------------
// Anonymous root entry is a deterministic three-state acquisition path.
// ---------------------------------------------------------------------------

assert.match(
  root,
  /atlas::publicEntryStage:v1/
);

assert.match(
  root,
  /if \(publicEntryStage === 'inside'\)[\s\S]*?window\.location\.replace\([\s\S]*?'\.\/tutors\/'/
);

assert.match(
  root,
  /if \(publicEntryStage === 'product'\)[\s\S]*?dataset\.atlasWelcome =[\s\S]*?'seen'/
);

assert.match(
  root,
  /function enterAtlasFromWelcome\(\)[\s\S]*?atlas::publicEntryStage:v1'[\s\S]*?'inside'[\s\S]*?window\.location\.href = '\.\/tutors\/'/
);

// Legacy users must not be sent back through acquisition.
assert.match(
  root,
  /if \(welcomeSeen\)[\s\S]*?atlas::publicEntryStage:v1'[\s\S]*?'product'[\s\S]*?dataset\.atlasWelcome =[\s\S]*?'seen'/
);

// Authenticated root entry bypasses acquisition and normalizes to product.
assert.match(
  root,
  /if \(storedAccountSession\)[\s\S]*?atlas::publicEntryStage:v1'[\s\S]*?'product'[\s\S]*?dataset\.atlasWelcome =[\s\S]*?'seen'/
);

// Explicit Inside Atlas -> Hub entry is one-use URL intent and is scrubbed.
assert.match(
  root,
  /searchParams\.get\('entry'\) === 'product'[\s\S]*?atlas::publicEntryStage:v1'[\s\S]*?'product'[\s\S]*?searchParams\.delete\('entry'\)[\s\S]*?history\.replaceState/
);

// Every intentional product exit from Inside Atlas marks the product stage.
assert.match(
  inside,
  /function markProductEntered\(\)[\s\S]*?atlas::publicEntryStage:v1[\s\S]*?'product'/
);

assert.ok(
  (inside.match(/data-atlas-product-entry/g) || []).length >= 5,
  'Inside Atlas should mark Atlas, Compass and Arcade exits as deliberate product entry'
);

// ---------------------------------------------------------------------------
// Direct resource intent remains URL-owned, never root-acquisition-owned.
// ---------------------------------------------------------------------------

assert.match(
  returnIntent,
  /function normalizeDestination\(destination\)[\s\S]*?url\.origin !== window\.location\.origin[\s\S]*?const normalized =[\s\S]*?pathname \+ url\.search \+ url\.hash/
);

assert.match(
  returnHandoff,
  /window\.location\.replace\(intent\.destination\)/
);

// ---------------------------------------------------------------------------
// Auth return waits for a real authenticated state.
// Recovery return must finish recovery before any pending destination resumes.
// ---------------------------------------------------------------------------

assert.match(
  returnHandoff,
  /!accountState\?\.authenticated[\s\S]*?accountState\?\.recovery[\s\S]*?return null/
);

const recoveryBranch = account.indexOf(
  'if (state.authenticated && state.recovery)'
);
const resumeBranch = account.indexOf(
  'AtlasReturnHandoff.resumeIfAuthenticated(state)'
);

assert.ok(
  recoveryBranch >= 0 &&
  resumeBranch > recoveryBranch,
  'Recovery view must take precedence over return-intent resume'
);

assert.match(
  accountRuntime,
  /async function completePasswordRecovery\(password\)[\s\S]*?writeRecoveryHint\(false\)[\s\S]*?recovery: false/
);

assert.match(
  accountRuntime,
  /function accountReturnUrl\([\s\S]*?new URL\('\/account\/'[\s\S]*?url\.searchParams\.set\('ri', intentId\)/
);

// Unknown/stale return intent is scrubbed instead of creating a redirect loop.
assert.match(
  returnHandoff,
  /if \(!ReturnIntent\.isValidId\(id\)\)[\s\S]*?scrubIntentParameter\(\)/
);

assert.match(
  returnHandoff,
  /if \(!intent\)[\s\S]*?scrubIntentParameter\(\)/
);

console.log(
  'Stage 4.2 routing contract passed: root acquisition states are deterministic, returning/authenticated tutors bypass acquisition, and auth/recovery handoffs preserve known destinations.'
);
