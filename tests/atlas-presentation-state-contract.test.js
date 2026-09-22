'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const cache = fs.readFileSync(
    'shared/atlas-cloud-cache.js',
    'utf8'
);
const compass = fs.readFileSync(
    'compass/index.html',
    'utf8'
);
const atlas = fs.readFileSync(
    'index.html',
    'utf8'
);
const arcade = fs.readFileSync(
    'arcade/index.html',
    'utf8'
);
const trust = fs.readFileSync(
    'shared/atlas-persistence-trust.js',
    'utf8'
);

const cacheVersionMatch = cache.match(
    /const HUB_CACHE_VERSION = (\d+);/
);
const compassVersionMatch = compass.match(
    /var hubCacheVersion = (\d+);/
);

assert.ok(
    cacheVersionMatch,
    'Shared Compass hub cache version must remain inspectable.'
);
assert.ok(
    compassVersionMatch,
    'Compass first-paint hub cache version must remain inspectable.'
);
assert.equal(
    compassVersionMatch[1],
    cacheVersionMatch[1],
    'Compass first paint must accept the current shared hub cache version.'
);
assert.match(
    cache,
    /const HUB_CACHE_KIND = 'compass-hub-presentation';/
);
assert.match(
    cache,
    /!summariesLoaded \|\|\s*!libraryLoaded/
);
assert.match(
    cache,
    /kind: HUB_CACHE_KIND,\s*ready: true/
);
assert.match(
    cache,
    /function getCompassPresentationSnapshot\(\)/
);
assert.match(
    cache,
    /async function prepareCompassPresentation\(\)/
);
assert.match(
    cache,
    /getCompassPresentationSnapshot,\s*prepareCompassPresentation/
);

assert.match(
    compass,
    /cached\.kind !== hubCacheKind/
);
assert.match(
    compass,
    /cached\.ready !== true/
);
assert.match(
    compass,
    /function getCachedOwnedSubjectSessionIds\(/
);
assert.match(
    compass,
    /scopeOwner !== 'user:' \+ userId/
);

const cachedHomesBranch = compass.match(
    /if \(\s*useInitialSnapshot \|\|\s*cloudAuthorityPending\s*\) \{[\s\S]*?getCachedOwnedSubjectSessionIds[\s\S]*?\} else if \([\s\S]*?Subjects\.getSubjectSessionIds/
);
assert.ok(
    cachedHomesBranch,
    'cached Compass presentation must resolve session homes locally before live authority reads'
);
assert.match(
    cachedHomesBranch[0],
    /initialSnapshot \|\|\s*getCompassInitialAccountSnapshot\(\)/
);

assert.match(
    atlas,
    /function getRegistry\(\)[\s\S]*?Bridge\.readRegistry\(\)/
);
assert.match(
    atlas,
    /function getActiveSession\(\)[\s\S]*?Bridge\.readActiveSession\(\)/
);
assert.match(
    arcade,
    /function renderHub\(\)[\s\S]*?const session = getActiveSession\(\);[\s\S]*?const reg = getRegistry\(\);/
);

for (const key of [
    "'atlas::sessions'",
    "'atlas::handoffs'",
    "'atlas::registry'",
    "'learning::ledger'",
    "'atlas::tutorSubjects::library'"
]) {
    assert.ok(
        trust.includes(key),
        'Persistence Trust must scope ' + key
    );
}
assert.ok(
    trust.includes(
        "'atlas::tutorSubjects::sessionSubjects::'"
    ),
    'Persistence Trust must scope session-subject projections'
);

console.log(
    'Atlas presentation-state contract passed.'
);
