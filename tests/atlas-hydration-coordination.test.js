'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const account = fs.readFileSync('shared/atlas-account.js', 'utf8');
const panel = fs.readFileSync('shared/atlas-session-panel.js', 'utf8');
const learners = fs.readFileSync(
    'shared/atlas-learner-sessions-cloud-authority.js',
    'utf8'
);
const learnerContinuity = fs.readFileSync(
    'shared/atlas-learner-continuity-cloud-authority.js',
    'utf8'
);
const sharedContinuity = fs.readFileSync(
    'shared/atlas-shared-continuity-cloud-authority.js',
    'utf8'
);
const sharedSubjects = fs.readFileSync(
    'shared/atlas-shared-session-subjects-cloud-authority.js',
    'utf8'
);
const curation = fs.readFileSync(
    'shared/atlas-original-curation-cloud-authority.js',
    'utf8'
);
const personalization = fs.readFileSync(
    'shared/atlas-hub-personalization-cloud-authority.js',
    'utf8'
);
const root = fs.readFileSync('shared/atlas-root-runtime.js', 'utf8');

assert.match(account, /entitlementPromiseUserId === userId/);
assert.match(account, /if \(entitlementPromise === trackedPromise\)/);

assert.match(panel, /storedAtlasAccountUserId/);
assert.match(panel, /refreshAfterPageRestore\(event\)/);
assert.match(panel, /event\?\.persisted === true/);
assert.doesNotMatch(
    panel,
    /window\.addEventListener\('pageshow', refreshWhenVisible\)/
);

assert.match(learners, /function queueForcedInitialize\(\)/);
assert.match(learners, /storedAccountUserId\(\) !== userId/);
assert.match(learners, /userId: currentUserId \|\| null/);

for (const [name, source] of [
    ['learner continuity', learnerContinuity],
    ['shared continuity', sharedContinuity],
    ['shared subjects', sharedSubjects],
    ['original curation', curation],
    ['hub personalization', personalization]
]) {
    assert.match(
        source,
        /let queuedInitializePromise = null;/,
        name + ' must queue identity-changing forced initialization'
    );
    assert.match(
        source,
        /const identityChanged = Boolean\(/,
        name + ' must distinguish identity changes from same-account refreshes'
    );
    assert.match(
        source,
        /generation !== initializeGeneration/,
        name + ' must reject superseded hydration responses'
    );
    assert.match(
        source,
        /if \(initializePromise === trackedPromise\)/,
        name + ' must release the active single-flight promise'
    );
}

assert.match(
    learnerContinuity,
    /authenticated &&\s*currentUserId === learnerUserId/
);
assert.match(sharedSubjects, /event\?\.persisted === true/);
assert.match(sharedSubjects, /if \(refreshPromise\) \{/);

assert.match(root, /hydrateRootAuthoritiesAfterLiveSignIn/);
assert.match(root, /'atlas:account-change'/);
assert.match(root, /renderArchivedSubjectsSettings/);

console.log('Atlas hydration coordination contract passed.');
