'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const engine = fs.readFileSync(
    'compass/shared/compass-engine.js',
    'utf8'
);

/*
 * Regression for worker -> foreground handoff coherence.
 *
 * The worker may finish an atomic generation operation after the subject page
 * first loads. Once foreground ownership is granted, the page must adopt the
 * newer checkpoint document as well as its completedStep. Keeping the older
 * in-memory document while accepting the newer step can silently skip generated
 * content and force later AI operations to be regenerated.
 */
assert.match(
    engine,
    /async function loadTutorContentState\(\{ forceOwnedWorkingDraft = false \} = \{\}\)/
);

assert.match(
    engine,
    /workingDraft &&[\s\S]*?!myVersionEditing[\s\S]*?forceOwnedWorkingDraft === true[\s\S]*?resumeMyVersionWorkingDraft\(workingDraft\)/
);

assert.match(
    engine,
    /await awaitMyVersionForegroundBuildHandoff\(\);[\s\S]*?await loadTutorContentState\(\{[\s\S]*?forceOwnedWorkingDraft:[\s\S]*?true[\s\S]*?\}\);[\s\S]*?getBuildState\([\s\S]*?acquireMyVersionForegroundBuildHandoffLease\(\)/
);

console.log(
    'Atlas handoff document coherence passed: recovery explicitly rehydrates the newest checkpoint document after worker ownership is granted, before foreground generation resumes.'
);
