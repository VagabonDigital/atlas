'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const atlas = fs.readFileSync('index.html', 'utf8');
const compass = fs.readFileSync(
    'compass/index.html',
    'utf8'
);
const arcade = fs.readFileSync(
    'arcade/index.html',
    'utf8'
);

for (const [name, html] of [
    ['Atlas', atlas],
    ['Compass', compass],
    ['Arcade', arcade]
]) {
    assert.match(
        html,
        /data-atlas-local-presentation-ready/,
        name + ' must expose a local presentation readiness contract'
    );
    assert.match(
        html,
        /function isLocalPresentationScopeReady\(\)/
    );
    assert.match(
        html,
        /atlas::persistenceTrust::scopeOwner::v1/
    );
    assert.match(
        html,
        /atlas:persistence-scope-change/
    );
}

assert.match(
    atlas,
    /renderHome\(\);\s*markLocalPresentationReady\(\);/
);
assert.match(
    atlas,
    /html\[data-atlas-welcome="seen"\]:not\(\[data-atlas-local-presentation-ready="true"\]\) body/
);

assert.doesNotMatch(
    compass,
    /atlas-session-fonts-pending/
);
assert.doesNotMatch(
    arcade,
    /atlas-session-fonts-pending/
);
assert.doesNotMatch(
    compass,
    /document\.fonts\.load\('500 13px "DM Sans"'\)/
);
assert.doesNotMatch(
    arcade,
    /document\.fonts\.load\('500 13px "DM Sans"'\)/
);

assert.match(
    compass,
    /scopeOwner !== 'user:' \+ userId/
);
assert.match(
    compass,
    /hintedUserId !== storedUserId/
);
assert.match(
    compass,
    /function getCachedSessionSubjectRefs\(/
);
assert.match(
    compass,
    /async function renderHub\(\{\s*initialSnapshot = null,\s*diagnosticSource = 'direct'\s*\} = \{\}\)/
);
assert.match(
    compass,
    /if \(useInitialSnapshot\) \{\s*sessionSubjectRefs =\s*getCachedSessionSubjectRefs/
);
assert.match(
    compass,
    /if \(authenticated && !useInitialSnapshot\) \{\s*sessionSubjectRefs =\s*await syncAtlasOriginalSessionSubjects/
);
assert.match(
    compass,
    /await renderHub\(\{\s*initialSnapshot,\s*diagnosticSource: 'initial'\s*\}\);\s*\n\s*markLocalPresentationReady/
);

const snapshotStart =
    compass.indexOf(
        'function getCompassInitialAccountSnapshot()'
    );
const snapshotEnd =
    compass.indexOf(
        'function getCompassInitialLibraryState',
        snapshotStart
    );
const snapshotContract =
    compass.slice(snapshotStart, snapshotEnd);

assert.doesNotMatch(
    snapshotContract,
    /isCompassCloudAuthorityPending/,
    'initial snapshot validity must not depend on cloud-authority timing'
);

assert.match(
    arcade,
    /renderHub\(\);\s*markLocalPresentationReady\(\);/
);

console.log(
    'Atlas local-first Hub entry contract passed.'
);
