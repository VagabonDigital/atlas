'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const hub = fs.readFileSync(
    'compass/index.html',
    'utf8'
);

const engine = fs.readFileSync(
    'compass/shared/compass-engine.js',
    'utf8'
);

const recovery = fs.readFileSync(
    'compass/shared/compass-generation-recovery.js',
    'utf8'
);

const runtime = fs.readFileSync(
    'shared/atlas-subject-runtime-channel.js',
    'utf8'
);

const lifecycle = fs.readFileSync(
    'shared/atlas-ai-subject-build-lifecycle.js',
    'utf8'
);

// The Hub is event-driven. There must be no periodic global unfinished-build
// scanner in Compass: entry/render probes unfinished subjects, then runtime
// messages, focus/pageshow and visibility changes keep state current.
assert.doesNotMatch(
    hub,
    /setInterval\([\s\S]{0,500}(unfinished|aiBuild|BuildLive|probeActiveBuild)/i
);

assert.match(
    hub,
    /resolveOwnedSubjectBuildLive\([\s\S]*?probeActiveBuild/
);

assert.match(
    hub,
    /window\.addEventListener\([\s\S]*?'atlas:subject-runtime-message'[\s\S]*?handleSubjectRuntimeMessage/
);

assert.match(
    hub,
    /window\.addEventListener\('focus', refresh\)/
);

assert.match(
    hub,
    /window\.addEventListener\('pageshow', refresh\)/
);

assert.match(
    hub,
    /visibilitychange[\s\S]*?!document\.hidden[\s\S]*?refresh/
);

// Truthful card states: a genuinely live generator is informational;
// an unfinished subject without a live generator is actionable.
assert.match(
    hub,
    /aiBuildIncomplete === true[\s\S]*?aiBuildLive === true[\s\S]*?mode: 'building'[\s\S]*?actionLabel: 'Open'/
);

assert.match(
    hub,
    /mode: 'unfinished'[\s\S]*?actionLabel: 'Continue building'/
);

assert.match(
    hub,
    /subject\.aiBuildLive === true[\s\S]*?subject-card-build-state[\s\S]*?Building/
);

// Even if the shared lifecycle helper is lost to a stale/partial browser
// deploy, the Hub must fail safe and still recognise durable unfinished rows.
assert.match(
    hub,
    /Fail-safe only for a partially cached deploy[\s\S]*?provenanceKind === 'ai-subject-build'/
);

assert.match(
    hub,
    /status === 'complete'[\s\S]*?\? false/
);

// Opening an unfinished subject remains automatic recovery. It does not ask
// the tutor to manually start generation again.
assert.match(
    engine,
    /const recoveringOwnedSubjectBuild =[\s\S]*?incompleteOwnedSubjectBuild/
);

assert.match(
    engine,
    /resumeFromStep:[\s\S]*?resumableFullSubjectBuild[\s\S]*?\.completedStep[\s\S]*?: 0/
);

assert.match(
    recovery,
    /void generator\(\{[\s\S]*?resumeFromStep: completedStep/
);

// A second live subject tab cannot become another writer for the same build.
assert.match(
    engine,
    /acquireBuildLease\([\s\S]*?MODULE\.id/
);

assert.match(
    engine,
    /acquired === false[\s\S]*?already building in another tab/
);

assert.match(
    runtime,
    /navigator\.locks\.request[\s\S]*?ifAvailable:\s*true/
);

// Closing/killing the builder does not require a server runner. Durable state
// stays unfinished; liveness is explicitly ephemeral and stops with the page.
assert.match(
    runtime,
    /pagehide[\s\S]*?publishLifecycleSignal/
);

assert.match(
    lifecycle,
    /status === 'complete'[\s\S]*?\? false[\s\S]*?legacyRecovery \|\|[\s\S]*?knownAiLifecycle/
);

// Completed subjects return to the ordinary card path; build progress never
// hijacks the existing lesson-progress treatment or protected cover geometry.
assert.doesNotMatch(
    hub,
    /\.subject-card--building\s+\.subject-card-cover\s+img\s*\{/
);

assert.match(
    hub,
    /\.subject-card--cover:is\(:hover, :has\(:focus-visible\)\)[\s\S]*?\.subject-card-cover img[\s\S]*?transform: scale\(1\)/
);

console.log(
    'Atlas Batch 3 lifecycle contract passed: Compass is event-driven, Building is live-only, Continue building is recovery-only, duplicate generators are blocked, and finished subjects return to the normal card path.'
);
