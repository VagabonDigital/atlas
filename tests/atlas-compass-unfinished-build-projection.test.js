'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const lifecycleSource = fs.readFileSync(
    'shared/atlas-ai-subject-build-lifecycle.js',
    'utf8'
);

const hub = fs.readFileSync(
    'compass/index.html',
    'utf8'
);

const cloudCache = fs.readFileSync(
    'shared/atlas-cloud-cache.js',
    'utf8'
);

const loader = fs.readFileSync(
    'compass/shared/compass-subject-loader.js',
    'utf8'
);

const subjectPage = fs.readFileSync(
    'compass/subject/index.html',
    'utf8'
);

const sandbox = {
    window: {}
};

vm.runInNewContext(
    lifecycleSource,
    sandbox
);

const Lifecycle =
    sandbox.window
        .AtlasAiSubjectBuildLifecycle;

assert.ok(Lifecycle);
assert.equal(
    Lifecycle.classify({
        provenance: {
            kind: 'ai-subject-build'
        },
        metadata: {
            aiBuildStatus: 'building'
        }
    }).incomplete,
    true
);

assert.equal(
    Lifecycle.classify({
        provenance: {
            kind: 'ai-subject-build'
        },
        metadata: {
            aiBuildStatus: 'paused'
        }
    }).incomplete,
    true
);

assert.equal(
    Lifecycle.classify({
        provenance: {
            kind: 'ai-subject-build'
        },
        metadata: {
            aiBuildStatus: 'complete',
            legacyAiBuildRecovery: true
        }
    }).incomplete,
    false,
    'complete must win over legacy recovery markers'
);

assert.equal(
    Lifecycle.classify({
        provenance: {
            kind: 'blank-structured'
        },
        metadata: {}
    }).incomplete,
    false
);

assert.equal(
    Lifecycle.classify({
        provenance: {
            kind: 'blank-structured'
        },
        metadata: {
            legacyAiBuildRecovery: true
        }
    }).incomplete,
    true
);

assert.match(
    loader,
    /AtlasAiSubjectBuildLifecycle[\s\S]*?Lifecycle\.classify\(record\)/
);

assert.match(
    subjectPage,
    /atlas-ai-subject-build-lifecycle\.js\?v=20260923-buildprojection1/
);

assert.match(
    hub,
    /atlas-ai-subject-build-lifecycle\.js\?v=20260923-buildprojection1/
);

assert.match(
    hub,
    /aiBuildIncomplete === true[\s\S]*?aiBuildLive === true[\s\S]*?actionLabel: 'Open'/
);

assert.match(
    hub,
    /mode: 'unfinished'[\s\S]*?actionLabel: 'Continue building'/
);

assert.match(
    hub,
    /workingDraftCovers[\s\S]*?draft\?\.document\?\.module\?\.bgImage/
);

assert.match(
    hub,
    /workingDraftCovers\.get\(id\)[\s\S]*?metadata\.coverImage[\s\S]*?module\.bgImage/
);

assert.match(
    hub,
    /subject-card-build-state[\s\S]*?subject-card-build-dot[\s\S]*?Building/
);

assert.match(
    hub,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.subject-card-build-dot[\s\S]*?animation: none/
);

assert.match(
    hub,
    /atlas:subject-runtime-message[\s\S]*?build-heartbeat[\s\S]*?build-stop[\s\S]*?subject-changed/
);

assert.match(
    hub,
    /refreshOwnedSubjectSummaries[\s\S]*?requestHubRender\(event\)/
);

assert.match(
    hub,
    /atlas:compass-hub-cache-refreshed[\s\S]*?requestHubRender/
);

assert.match(
    cloudCache,
    /async function refreshOwnedSubjectSummaries\(\)[\s\S]*?markHubMutation\(\)[\s\S]*?fetchFreshSummaries\(userId\)[\s\S]*?clearSubjectCache\(\)[\s\S]*?storeSummaryList\(summaries\)/
);

assert.match(
    cloudCache,
    /prepareCompassPresentation,[\s\S]*?refreshOwnedSubjectSummaries/
);

assert.doesNotMatch(
    hub,
    /\.subject-card--building\s+\.subject-card-cover\s+img\s*\{/
);

console.log(
    'Atlas Batch 2 unfinished-subject projection contract passed: shared lifecycle semantics drive truthful Building/Continue cards, unfinished drafts project their latest cover, and cross-tab changes force fresh Hub data without touching card hover geometry.'
);
