'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
    return fs.readFileSync(path, 'utf8');
}

function functionBlock(source, signature) {
    const start = source.indexOf(signature);
    assert.notEqual(start, -1, `Missing function: ${signature}`);

    const nextFunction = source.indexOf('\n    function ', start + signature.length);
    const nextAsync = source.indexOf('\n    async function ', start + signature.length);
    const candidates = [nextFunction, nextAsync].filter(index => index !== -1);
    const end = candidates.length ? Math.min(...candidates) : source.length;

    return source.slice(start, end);
}

const hub = read('compass/index.html');
const engine = read('compass/shared/compass-engine.js');
const panel = read('shared/atlas-session-panel.js');
const gate = read('shared/atlas-capability-gate.js');
const access = read('shared/atlas-access.js');
const atlas = read('index.html');
const arcade = read('arcade/index.html');
const tutors = read('tutors/index.html');

[
    'async function openCreateCategoryDialog',
    'async function openRenameCategoryDialog',
    'async function moveLibraryCategory',
    'async function openDeleteCategoryDialog',
    'async function openMoveOwnedSubjectCategoryDialog',
    'async function archiveOwnedSubject',
    'async function openArchivedSubjectsDialog',
    'async function openOwnedSubjectLastHomeDialog'
].forEach(signature => {
    assert.match(
        functionBlock(hub, signature),
        /requireAccountLibraryAccess/
    );
});

assert.match(
    functionBlock(hub, 'async function moveShelfSubject'),
    /scope === 'category'[\s\S]*?requireAccountLibraryAccess/
);

[
    'async function openOwnedSubjectRenameDialog',
    'async function openOwnedSubjectDeleteDialog',
    'async function openSubjectArtworkStudio',
    'async function openAtlasSubjectRenameDialog',
    'async function openRestoreAtlasOriginalHubDialog'
].forEach(signature => {
    const block = functionBlock(hub, signature);
    assert.match(block, /canEditSubject/);
    assert.match(block, /edit-subject/);
});

assert.match(
    hub,
    /context\.operation === 'create-category'[\s\S]*?skipCapabilityGate: true/
);
assert.match(
    hub,
    /context\.operation === 'rename-owned-subject'[\s\S]*?skipCapabilityGate: true/
);
assert.match(
    hub,
    /context\.operation === 'restore-atlas-original-dialog'[\s\S]*?skipCapabilityGate: true/
);

// These are authority-readiness guards, not duplicated product policy.
assert.match(
    hub,
    /ensureAccountLibraryAuthorityReady[\s\S]*?access\?\.access\?\.authenticated/
);
assert.match(
    engine,
    /ensureDurableContinuityAuthorityReady[\s\S]*?access\?\.access\?\.authenticated/
);

// Feature surfaces do not invent plan/tier policy.
[hub, engine, panel].forEach(source => {
    assert.doesNotMatch(source, /\bisPro\s*\(/);
    assert.doesNotMatch(source, /\bplanCode\b/);
    assert.doesNotMatch(
        source,
        /\btier\s*===\s*['\"](?:free|pro)['\"]/
    );
});

// Anonymous public browsing remains ungated.
assert.doesNotMatch(
    functionBlock(hub, 'function navigateTo'),
    /requireCapability|requireAccountLibraryAccess|requireCompassSubjectCapability/
);

// Atlas, Arcade, and Inside Atlas still converge on the shared access stack.
assert.match(atlas, /atlas-content-registry\.js/);
assert.match(arcade, /atlas-content-registry\.js/);
assert.match(tutors, /atlas-access-bootstrap\.js/);
assert.match(gate, /OUTCOMES\.RESOLVING/);
assert.match(gate, /OUTCOMES\.UNAVAILABLE/);
assert.match(access, /normalizeTier/);
assert.match(access, /canCreateWithAI/);

console.log(
    'Stage 2.4D proof passed: secondary bypasses are closed, policy remains canonical, anonymous browsing stays open, and failure/resolution semantics are preserved.'
);
