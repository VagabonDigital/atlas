'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const migration = fs.readFileSync(
    'supabase/migrations/019_authenticated_ai_operation_guardrails.sql',
    'utf8'
);

const atlasAI = fs.readFileSync(
    'shared/atlas-ai.js',
    'utf8'
);

const worker = fs.readFileSync(
    'shared/worker.js',
    'utf8'
);

const access = fs.readFileSync(
    'shared/atlas-access.js',
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

// Hidden launch guardrails are centralized server policy, not feature-local
// counters or tutor-facing credits.
assert.match(
    migration,
    /'default',\s*60,\s*100,\s*500,\s*30,\s*150,\s*200,\s*30,\s*60,\s*180/m
);

assert.match(
    migration,
    /usage_class in \(\s*'subject_build_internal',\s*'subject_shape',\s*'web_action',\s*'cover_search'/m
);

assert.match(
    migration,
    /current_affairs_reading[\s\S]*?one_shot_used/
);

assert.match(
    migration,
    /event\.status = 'succeeded'[\s\S]*?event\.status = 'reserved'/
);

assert.match(
    migration,
    /grant execute on function public\.atlas_begin_ai_operation_v1[\s\S]*?to service_role/
);

assert.match(
    migration,
    /grant execute on function public\.atlas_finish_ai_operation_v1[\s\S]*?to service_role/
);

assert.doesNotMatch(
    migration,
    /grant execute on function public\.atlas_(?:begin|finish)_ai_operation_v1[\s\S]*?to authenticated/
);

// One browser AI action gets one stable request id across automatic retries,
// and authenticated requests carry their owned subject id when one exists.
assert.match(
    atlasAI,
    /createAtlasAIRequestId\(\)/
);

assert.match(
    atlasAI,
    /Cloud\.getSession\(\)/
);

assert.match(
    atlasAI,
    /headers\.set\(\s*'Authorization',[\s\S]*?Bearer/
);

assert.match(
    atlasAI,
    /'X-Atlas-Request-Id'/
);

assert.match(
    atlasAI,
    /'X-Atlas-Subject-Id'/
);

assert.match(
    atlasAI,
    /const requestId =\s*createAtlasAIRequestId\(\);[\s\S]*?for \(/
);

// The Worker verifies account identity before cost-bearing work, then reserves
// and finalizes usage centrally rather than trusting browser counters.
assert.match(
    worker,
    /\/auth\/v1\/user/
);

assert.match(
    worker,
    /ATLAS_SUPABASE_SERVICE_ROLE_KEY/
);

assert.match(
    worker,
    /atlas_begin_ai_operation_v1/
);

assert.match(
    worker,
    /atlas_finish_ai_operation_v1/
);

assert.match(
    worker,
    /X-Atlas-Request-Id, X-Atlas-Subject-Id/
);

assert.match(
    worker,
    /aiUsageContext[\s\S]*?body\?\.ok === true/
);

// Fresh creation capacity and ordinary AI shaping are deliberately different
// product capabilities. Exhausting 8/100 may stop new AI subjects without
// disabling the tutor's existing owned material and AI shaping.
assert.match(
    access,
    /'canCreateWithAI',[\s\S]*?'canUseAI'/
);

assert.match(
    hub,
    /generateFullSubject[\s\S]*?'canCreateWithAI'[\s\S]*?'create-subject-ai'/
);

assert.match(
    hub,
    /askCompassForSubjects[\s\S]*?'canUseAI'[\s\S]*?'suggest-subject-ideas'/
);

assert.match(
    engine,
    /installSubjectAuthoringAIGuard[\s\S]*?'canUseAI'[\s\S]*?'ai-authoring'/
);

assert.doesNotMatch(
    hub,
    /const anonymousSuggestionPreview =/
);

console.log(
    'Atlas 6.2B AI operation guardrail contract passed: authenticated Worker requests, centralized hidden abuse policy, one-shot Current Affairs Read More, and creation/shaping capability separation are present.'
);
