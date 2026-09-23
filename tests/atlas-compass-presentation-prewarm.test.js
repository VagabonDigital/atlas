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
const ownedSubject = fs.readFileSync(
    'compass/subject/index.html',
    'utf8'
);
const atlasOriginalEntry = fs.readFileSync(
    'compass/shared/atlas-original-entry.js',
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
assert.doesNotMatch(
    root,
    /Cache\.getCompassPresentationSnapshot/,
    'Atlas root must not read Compass presentation snapshots just to warm images.'
);
assert.doesNotMatch(
    root,
    /prewarmCompassCoverImages/,
    'Atlas root must not warm Compass cover images.'
);
assert.match(
    registry,
    /const COMPASS_COVER_PREWARM_CONCURRENCY = 3;/
);
assert.match(
    registry,
    /function prewarmCompassCoverImages\(/
);
assert.match(
    registry,
    /navigator\.connection\?\.saveData === true/
);
assert.match(
    registry,
    /image\.decode\(\)/
);
assert.doesNotMatch(
    registry,
    /scheduleCompassCoverPrewarm/,
    'Content Registry must not schedule Atlas-wide cover warming.'
);
assert.doesNotMatch(
    registry,
    /getCompassCatalogCoverSources/,
    'Cover warming must not implicitly pull the Compass catalog.'
);
assert.match(
    registry,
    /const urls = extras\s*\.map\(resolveCompassCoverPrewarmUrl\)/,
    'Shared cover warming must operate only on URLs explicitly supplied by Compass.'
);
assert.match(
    compass,
    /prewarmCompassCoverImages\?\.\(/
);

const initialBootstrapStart = root.indexOf(
    'function startInitialRootCloudBootstrap(userId)'
);
const initialBootstrapEnd = root.indexOf(
    'function scheduleInitialRootCloudBootstrap(userId)',
    initialBootstrapStart
);
assert.notEqual(initialBootstrapStart, -1);
assert.notEqual(initialBootstrapEnd, -1);
const initialBootstrap = root.slice(
    initialBootstrapStart,
    initialBootstrapEnd
);
assert.match(
    initialBootstrap,
    /writeRootCloudAuthorityScripts\(\)/
);
assert.match(
    initialBootstrap,
    /prewarmCompassPresentation\(id\)/
);
assert.ok(
    initialBootstrap.indexOf('writeRootCloudAuthorityScripts()') <
        initialBootstrap.indexOf('prewarmCompassPresentation(id)'),
    'initial account authorities must load before Compass presentation prewarm'
);

const scheduleStart = root.indexOf(
    'function scheduleInitialRootCloudBootstrap(userId)'
);
const scheduleEnd = root.indexOf(
    'function prewarmCompassPresentation(userId)',
    scheduleStart
);
const schedule = root.slice(scheduleStart, scheduleEnd);
assert.match(
    schedule,
    /atlas:local-presentation-ready/
);
assert.match(
    schedule,
    /window\.requestAnimationFrame\(\(\) => \{[\s\S]*?window\.setTimeout\(\(\) => \{[\s\S]*?startInitialRootCloudBootstrap/
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

assert.doesNotMatch(
    root,
    /bypassAuthenticatedEmptySetup|startWithDefault/,
    'retired learner-first root compatibility must stay removed'
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
            /atlas-root-runtime\.js\?v=20260923-compasslocalwarm1/g
        ) || []
    ).length,
    2,
    'both Root Runtime loader paths must use the Compass-local warming asset revision'
);
assert.equal(
    (
        registry.match(
            /atlas-cloud-cache\.js\?v=20260922-order1/g
        ) || []
    ).length,
    2,
    'both Cloud Cache loader paths must use the current ordered-cache revision'
);

assert.match(
    atlas,
    /atlas-content-registry\.js\?v=20260923-compasslocalwarm1/,
    'Atlas must load the Compass-local warming Content Registry revision'
);
assert.match(
    compass,
    /atlas-content-registry\.js\?v=20260923-compasslocalwarm1/,
    'Compass must load the Compass-local warming Content Registry revision'
);
assert.match(
    arcade,
    /atlas-content-registry\.js\?v=20260923-compasslocalwarm1/,
    'Arcade must load the Compass-local warming Content Registry revision'
);
assert.match(
    ownedSubject,
    /atlas-content-registry\.js\?v=20260923-compasslocalwarm1/,
    'Owned subject pages must load the Compass-local warming Content Registry revision'
);
assert.match(
    atlasOriginalEntry,
    /atlas-content-registry\.js\?v=20260923-compasslocalwarm1/,
    'Atlas Original pages must load the Compass-local warming Content Registry revision'
);

console.log(
    'Atlas Compass presentation prewarm contract passed.'
);
