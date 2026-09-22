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
    loader,
    /compass-engine\.js\?v=20260922-progress1/
);

console.log(
    'Atlas Discussion progress contract passed: language upgrades and Make It Real activities use separate counters while the 6 + 2 key-language caps remain unchanged.'
);
