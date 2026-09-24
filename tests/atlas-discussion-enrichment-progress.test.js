'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const engine = fs.readFileSync(
    'compass/shared/compass-engine.js',
    'utf8'
);

const operations = fs.readFileSync(
    'shared/atlas-subject-build-document-operations.js',
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

assert.match(
    engine,
    /FULL_SUBJECT_KEY_LANGUAGE_LIMITS[\s\S]*?standard:\s*\{[\s\S]*?discussion:\s*6,[\s\S]*?culturalLens:\s*2/
);

assert.match(
    operations,
    /const operationTotals =[\s\S]*?operations\.reduce\([\s\S]*?totals\[[\s\S]*?operation\.kind/
);

assert.match(
    operations,
    /completedByKind\[[\s\S]*?operation\.kind[\s\S]*?current:[\s\S]*?completedByKind[\s\S]*?total:[\s\S]*?operationTotals/
);

assert.match(
    engine,
    /event\?\.type ===[\s\S]*?'operations-start'[\s\S]*?event[\s\S]*?\.operationTotals[\s\S]*?event\?\.type ===[\s\S]*?'operation-start'/
);

assert.doesNotMatch(
    engine,
    /myVersionDiscussionEnrichmentProgress = \{\s*current: index \+ 1,\s*total: operations\.length/
);

assert.match(
    engine,
    /myVersionDiscussionEnrichmentProgress = \{[\s\S]*?phase: 'selecting-key',[\s\S]*?mode[\s\S]*?\}/
);

assert.match(
    engine,
    /myVersionCulturalLensEnrichmentProgress = \{[\s\S]*?phase: 'selecting-key',[\s\S]*?mode[\s\S]*?\}/
);

assert.match(
    engine,
    /getMyVersionDiscussionEnrichmentLabel[\s\S]*?mode === 'key'[\s\S]*?'Choosing key Discussion language'[\s\S]*?'Preparing Discussion language'[\s\S]*?'Adding key Discussion language'[\s\S]*?'Adding Discussion language'/
);

assert.match(
    engine,
    /getMyVersionCulturalLensEnrichmentLabel[\s\S]*?mode === 'key'[\s\S]*?'Choosing key Cultural Lens language'[\s\S]*?'Preparing Cultural Lens language'[\s\S]*?'Adding key Cultural Lens language'[\s\S]*?'Adding Cultural Lens language'/
);

assert.match(
    engine,
    /progress\?\.kind === 'make-it-real'[\s\S]*?'Adding Discussion activities'/
);

assert.match(
    loader,
    /atlas-subject-build-document-operations\.js\?v=20260924-revisionguard1/
);

assert.match(
    loader,
    /compass-engine\.js\?v=20260924-revisionguard1/
);

assert.match(
    subjectPage,
    /compass-subject-loader\.js\?v=20260924-revisionguard1/
);

console.log(
    'Atlas language progress contract passed: Key and All have distinct user-facing messaging while language and activity counters remain separate.'
);
