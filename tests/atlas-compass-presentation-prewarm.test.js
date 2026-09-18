'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const root = fs.readFileSync(
    'shared/atlas-root-runtime.js',
    'utf8'
);
const registry = fs.readFileSync(
    'shared/atlas-content-registry.js',
    'utf8'
);
const cache = fs.readFileSync(
    'shared/atlas-cloud-cache.js',
    'utf8'
);
const atlas = fs.readFileSync('index.html', 'utf8');
const compass = fs.readFileSync(
    'compass/index.html',
    'utf8'
);
const arcade = fs.readFileSync(
    'arcade/index.html',
    'utf8'
);

assert.match(
    root,
    /let compassPresentationPrewarmPromise = null;/
);
assert.match(
    root,
    /function prewarmCompassPresentation\(userId\)/
);
assert.match(
    root,
    /storedSessionUserId\(\) !== id/
);
assert.match(
    root,
    /compassPresentationPrewarmUserId === id/
);
assert.match(
    root,
    /Cache\.prepareCompassPresentation\(\)/
);
assert.match(
    root,
    /const rootCloudAuthorityBootstrapPromise =\s*writeRootCloudAuthorityScripts\(\);/
);
assert.match(
    root,
    /rootCloudAuthorityBootstrapPromise[\s\S]{0,260}prewarmCompassPresentation\(\s*initialUserId/
);
assert.match(
    root,
    /const compassPresentationPromise =\s*prewarmCompassPresentation\(id\);/
);
assert.match(
    root,
    /await compassPresentationPromise;/
);

const installMatch = root.match(
    /function install\(\) \{[\s\S]*?\n    \}\n\n    if \(isAtlasRoot\(\)\)/
);
assert.ok(installMatch, 'install() contract must remain inspectable');
assert.doesNotMatch(
    installMatch[0],
    /prewarmCompassPresentation/,
    'Atlas first-paint release must not wait on Compass prewarm'
);

assert.match(
    cache,
    /async function prepareCompassPresentation\(\)/
);
assert.match(
    cache,
    /getCompassPresentationSnapshot,\s*prepareCompassPresentation/
);

assert.equal(
    (
        registry.match(
            /atlas-root-runtime\.js\?v=20260917-presentation2/g
        ) || []
    ).length,
    2,
    'both Root Runtime loader paths must use the 4B asset revision'
);
assert.equal(
    (
        registry.match(
            /atlas-cloud-cache\.js\?v=20260917-presentation2/g
        ) || []
    ).length,
    2,
    'both Cloud Cache loader paths must use the 4B asset revision'
);

for (const [name, html] of [
    ['Atlas', atlas],
    ['Compass', compass],
    ['Arcade', arcade]
]) {
    assert.match(
        html,
        /atlas-content-registry\.js\?v=20260917-presentation2/,
        name + ' must load the updated presentation-aware Content Registry'
    );
}

console.log(
    'Atlas Compass presentation prewarm contract passed.'
);
