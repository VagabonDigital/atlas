'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const migration017 = fs.readFileSync(
    'supabase/migrations/017_ai_subject_creation_enforcement.sql',
    'utf8'
);

const migration018 = fs.readFileSync(
    'supabase/migrations/018_ai_subject_creation_hardening.sql',
    'utf8'
);

const accountCloud = fs.readFileSync(
    'shared/atlas-account-cloud.js',
    'utf8'
);

const access = fs.readFileSync(
    'shared/atlas-access.js',
    'utf8'
);

const gate = fs.readFileSync(
    'shared/atlas-capability-gate.js',
    'utf8'
);

const hub = fs.readFileSync(
    'compass/index.html',
    'utf8'
);

const engine = fs.readFileSync(
    'compass/shared/compass-engine.js',
    'utf8'
);

// Launch policy is server-owned and centrally configurable.
assert.match(
    migration017,
    /free_lifetime_limit[\s\S]*?pro_period_limit/
);

assert.match(
    migration017,
    /values \(\s*'default',\s*8,\s*100,/m
);

// Usage state and reservation events are not browser-writable tables.
assert.match(
    migration017,
    /revoke all privileges on table[\s\S]*?ai_subject_creation_policy[\s\S]*?account_ai_subject_usage_state[\s\S]*?ai_subject_creation_events[\s\S]*?from public, anon, authenticated/
);

// Canonical account access reads the computed server allowance.
assert.match(
    accountCloud,
    /client\.rpc\(\s*'atlas_get_account_access_v1'/
);

assert.match(
    access,
    /creationAllowance/
);

assert.match(
    gate,
    /allowance\.status === 'exhausted'/
);

// Fresh generated subjects enter a server-enforced build lifecycle.
assert.match(
    hub,
    /aiBuildStatus:\s*'building'/
);

assert.match(
    hub,
    /\? 'ai-subject-build'/
);

assert.match(
    engine,
    /async function setMyVersionAiBuildStatus/
);

assert.match(
    engine,
    /aiBuildStatus:\s*'complete'/
);

assert.match(
    engine,
    /setMyVersionAiBuildStatus\(\s*'paused'/
);

// The server-owned event survives client marker tampering and completion is
// single-consumption rather than a browser-side counter.
assert.match(
    migration018,
    /ATLAS_AI_CREATION_PROVENANCE_IMMUTABLE/
);

assert.match(
    migration018,
    /ATLAS_AI_CREATION_COMMIT_REQUIRED/
);

assert.match(
    migration018,
    /v_event_status = 'completed'/
);

console.log(
    'Atlas 6.2 AI subject quota contract passed: server-owned policy, usage state, lifecycle enforcement, canonical allowance projection, and Compass wiring are present.'
);
