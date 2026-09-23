'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const engine = fs.readFileSync(
    'compass/shared/compass-engine.js',
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
    engine,
    /const operationTotals = operations\.reduce\([\s\S]*?totals\[operation\.kind\]/
);

assert.match(
    engine,
    /completedByKind\[operation\.kind\][\s\S]*?current:[\s\S]*?completedByKind[\s\S]*?total:[\s\S]*?operationTotals/
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
    /getMyVersionDiscussionEnrichmentLabel[\s\S]*?mode === 'key'[\s\S]*?'Choosing key Discussion language'[\s\S]*?'Adding Discussion language'[\s\S]*?'Adding key Discussion language'/
);

assert.match(
    engine,
    /getMyVersionCulturalLensEnrichmentLabel[\s\S]*?mode === 'key'[\s\S]*?'Choosing key Cultural Lens language'[\s\S]*?'Adding Cultural Lens language'[\s\S]*?'Adding key Cultural Lens language'/
);

assert.match(
    engine,
    /progress\?\.kind === 'make-it-real'[\s\S]*?'Adding Discussion activities'/
);

assert.match(
    loader,
    /compass-engine\.js\?v=20260923-languagemode1/
);

assert.match(
    subjectPage,
    /compass-subject-loader\.js\?v=20260923-languagemode1/
);

console.log(
    'Atlas language progress contract passed: Key and All have distinct user-facing messaging while language and activity counters remain separate.'
);
