'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const compass = fs.readFileSync('compass/index.html', 'utf8');
const ai = fs.readFileSync('shared/atlas-ai.js', 'utf8');
const worker = fs.readFileSync('shared/worker.js', 'utf8');
const authority = fs.readFileSync(
    'shared/atlas-compass-suggestion-history.js',
    'utf8'
);
const migration = fs.readFileSync(
    'supabase/migrations/030_compass_suggestion_state.sql',
    'utf8'
);

assert.match(
    compass,
    /AtlasCompassSuggestionHistory/
);
assert.doesNotMatch(
    compass,
    /const compassSuggestionHistory = new Map/
);
assert.doesNotMatch(
    compass,
    /getCompassSuggestionHistoryKey/
);
assert.match(
    compass,
    /SuggestionHistory\.getTitles\(\s*selectedMode\.id/
);
assert.match(
    compass,
    /SuggestionHistory\.remember\(\s*selectedMode\.id/
);

assert.match(
    authority,
    /const MAX_TITLES = 36;/
);
assert.match(
    authority,
    /const anonymousHistory = new Map\(\);/
);
assert.match(
    authority,
    /historyByMode/
);
assert.doesNotMatch(
    authority,
    /topicFocus/
);
assert.doesNotMatch(
    authority,
    /sessionId/
);

assert.match(
    authority,
    /const CLOUD_SCRIPT_PATH = '\/shared\/atlas-cloud\.js';/
);
assert.doesNotMatch(
    authority,
    /if \(!window\.AtlasCloud\) \{[\s\S]*?return;[\s\S]*?const TABLE/
);
assert.match(
    authority,
    /function mergeStates\(base, incoming\)/
);
assert.match(
    authority,
    /function mergeAndRetry\(/
);
assert.match(
    authority,
    /const DIRTY_OWNER_KEY = 'atlas::compassSuggestionHistoryDirtyOwner::v1';/
);
assert.match(
    authority,
    /function writeDirtyOwner\(userId\)/
);
assert.match(
    authority,
    /writeDirtyOwner\(\s*currentUserId\s*\)/
);
assert.match(
    authority,
    /hasMeaningfulState\(\s*localBefore\s*\)/
);

assert.match(
    compass,
    /function syncCompassTopicFocus\(/
);
assert.match(
    compass,
    /function refineCompassSuggestions\(/
);
assert.match(
    compass,
    /data-compass-refine/
);
assert.match(
    compass,
    /oninput="syncCompassTopicFocus\(this\)"/
);
assert.match(
    compass,
    />Refine ideas<\/button>/
);

assert.match(
    ai,
    /candidate\.recentSuggestions[\s\S]*?\.slice\(-36\)/
);
assert.match(
    worker,
    /body\?\.recentSuggestions[\s\S]*?\.slice\(-36\)/
);
assert.doesNotMatch(
    worker,
    /body\?\.recentSuggestions[\s\S]*?reason:[\s\S]*?modeInstructions/
);

assert.match(
    migration,
    /create table if not exists public\.compass_suggestion_state/
);
assert.match(
    migration,
    /enable row level security/
);
assert.match(
    migration,
    /revoke all on table public\.compass_suggestion_state from anon/
);
assert.match(
    migration,
    /\(select auth\.uid\(\)\) = owner_user_id/
);

console.log('Atlas Compass suggestion memory contract: OK');
