'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const atlas = fs.readFileSync('index.html', 'utf8');
const compass = fs.readFileSync('compass/index.html', 'utf8');
const arcade = fs.readFileSync('arcade/index.html', 'utf8');

assert.match(atlas, /let lastCommittedHomeMarkup = null;/);
assert.match(atlas, /if \(nextHomeMarkup === lastCommittedHomeMarkup\) \{\s*return;\s*\}/);
assert.match(atlas, /lastCommittedHomeMarkup = null;\s*main\.innerHTML =/);
assert.match(atlas, /main\.innerHTML = nextHomeMarkup;\s*lastCommittedHomeMarkup = nextHomeMarkup;/);

assert.match(compass, /let lastCommittedHubContentMarkup = null;/);
assert.match(compass, /const nextHubContentMarkup =/);
assert.match(compass, /nextHubContentMarkup ===\s*lastCommittedHubContentMarkup/);
assert.doesNotMatch(compass, /nextHubMarkup === lastCommittedHubMarkup/);
assert.match(compass, /renderIntro\(session\) \+\s*nextHubContentMarkup/);

assert.match(arcade, /let lastCommittedArcadeContentMarkup = null;/);
assert.match(arcade, /const nextArcadeContentMarkup =/);
assert.match(arcade, /nextArcadeContentMarkup ===\s*lastCommittedArcadeContentMarkup/);
assert.match(arcade, /lastCommittedArcadeContentMarkup =\s*nextArcadeContentMarkup/);

console.log('Atlas Hub render-stability contract passed.');
