const assert = require('assert');
const fs = require('fs');

const analytics = fs.readFileSync(
  'shared/atlas-analytics.js',
  'utf8'
);
const accountGate = fs.readFileSync(
  'shared/atlas-account-gate.js',
  'utf8'
);
const sessionPanel = fs.readFileSync(
  'shared/atlas-session-panel.js',
  'utf8'
);
const capabilityGate = fs.readFileSync(
  'shared/atlas-capability-gate.js',
  'utf8'
);
const account = fs.readFileSync(
  'account/index.html',
  'utf8'
);
const atlas = fs.readFileSync(
  'index.html',
  'utf8'
);
const compass = fs.readFileSync(
  'compass/index.html',
  'utf8'
);
const engine = fs.readFileSync(
  'compass/shared/compass-engine.js',
  'utf8'
);
const originalEntry = fs.readFileSync(
  'compass/shared/atlas-original-entry.js',
  'utf8'
);
const ownedSubject = fs.readFileSync(
  'compass/subject/index.html',
  'utf8'
);
const arcade = fs.readFileSync(
  'arcade/index.html',
  'utf8'
);
const inside = fs.readFileSync(
  'tutors/index.html',
  'utf8'
);
const tgw = fs.readFileSync(
  'arcade/tomorrow-got-weird/index.html',
  'utf8'
);
const truthTrap = fs.readFileSync(
  'arcade/truth-trap/index.html',
  'utf8'
);
const wyr = fs.readFileSync(
  'arcade/would-you-rather/index.html',
  'utf8'
);

assert.doesNotMatch(
  analytics,
  /G-[A-Z0-9]{6,}|gtag\(['"]config['"]/,
  'AtlasAnalytics must not own the GA4 measurement ID/config'
);

for (const forbidden of [
  "'email'",
  "'password'",
  "'prompt'",
  "'content'",
  "'user_id'",
  "'learner_name'",
  "'student_name'",
  "'subject_title'"
]) {
  assert.ok(
    analytics.includes(forbidden),
    'Analytics privacy blocklist should include ' + forbidden
  );
}

for (const eventName of [
  'atlas_product_entry',
  'atlas_resource_open',
  'atlas_resource_begin',
  'atlas_account_gate',
  'atlas_signup_start',
  'atlas_signup_created',
  'sign_up',
  'atlas_learner_added',
  'atlas_durable_save',
  'atlas_subject_create_attempt',
  'atlas_subject_create',
  'atlas_teaching_use',
  'atlas_auth_failure',
  'atlas_persistence_failure',
  'atlas_capability_failure',
  'atlas_restore_failure'
]) {
  assert.ok(
    analytics.includes(eventName),
    'Missing analytics event ' + eventName
  );
}

assert.ok(
  analytics.includes('atlas:persistence-failure')
);
assert.ok(
  analytics.includes('atlas:account-session-ended')
);
assert.ok(
  analytics.includes('getDebugState')
);

for (const surface of [
  atlas,
  compass,
  arcade,
  inside,
  account,
  ownedSubject,
  tgw,
  truthTrap,
  wyr
]) {
  assert.match(
    surface,
    /atlas-analytics\.js\?v=20260919-observability1/
  );
}

assert.match(
  originalEntry,
  /atlas-analytics\.js\?v=20260919-observability1/
);

assert.match(
  accountGate,
  /AtlasAnalytics\?\.accountGate/
);
assert.match(
  accountGate,
  /AtlasAnalytics\?\.signupStart/
);
assert.match(
  accountGate,
  /AtlasAnalytics\?\.signupCreated/
);
assert.match(
  accountGate,
  /AtlasAnalytics\?\.signupComplete/
);
assert.match(
  accountGate,
  /AtlasAnalytics\?\.authFailure/
);

assert.match(
  account,
  /authReturnType === 'signup'[\s\S]*?signupComplete/
);
assert.match(
  sessionPanel,
  /AtlasAnalytics\?\.learnerAdded/
);
assert.match(
  compass,
  /AtlasAnalytics\?\.subjectCreateAttempt/
);
assert.match(
  compass,
  /AtlasAnalytics\?\.subjectCreate/
);
assert.match(
  engine,
  /AtlasAnalytics\?\.resourceOpen/
);
assert.match(
  engine,
  /AtlasAnalytics\?\.compassLessonBegin/
);
assert.match(
  engine,
  /AtlasAnalytics\?\.teachingUse/
);
assert.match(
  engine,
  /AtlasAnalytics\?\.durableSave/
);
assert.match(
  capabilityGate,
  /AtlasAnalytics\?\.capabilityFailure/
);
assert.match(
  atlas,
  /AtlasAnalytics\?\.restoreFailure/
);

for (const game of [tgw, truthTrap, wyr]) {
  assert.match(
    game,
    /AtlasAnalytics\?\.resourceOpen/
  );
  assert.match(
    game,
    /AtlasAnalytics\?\.arcadeGameStart/
  );
}

console.log(
  'Stage 5.2 product observability contract passed: GA4 remains the transport/config owner, Atlas emits the decision-grade acquisition, activation, teaching and normalized failure events, and analytics code explicitly blocks high-risk PII/content parameters.'
);
