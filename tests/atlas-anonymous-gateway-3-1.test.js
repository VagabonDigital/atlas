'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
    return fs.readFileSync(path, 'utf8');
}

function between(source, start, end) {
    const startIndex = source.indexOf(start);
    const endIndex = source.indexOf(
        end,
        startIndex + start.length
    );

    assert.notEqual(
        startIndex,
        -1,
        `Missing start marker: ${start}`
    );
    assert.notEqual(
        endIndex,
        -1,
        `Missing end marker: ${end}`
    );

    return source.slice(startIndex, endIndex);
}

const atlas = read('index.html');
const panel = read('shared/atlas-session-panel.js');

assert.doesNotMatch(
    atlas,
    /Who is this lesson with\?/,
    'anonymous Atlas must not begin with learner setup'
);
assert.doesNotMatch(
    atlas,
    /function renderEmptyState\(/,
    'legacy anonymous learner-first home must be removed'
);

const anonymousGateway = between(
    atlas,
    '    function renderAnonymousGateway(',
    '    function renderGateway('
);

assert.match(
    anonymousGateway,
    /Choose a world\./
);
assert.match(
    anonymousGateway,
    /Start with a subject in Compass or a game in Arcade\./
);
assert.match(
    anonymousGateway,
    /renderDoors\(\)/
);
assert.match(
    anonymousGateway,
    /renderTutorEntry\(\)/
);
assert.doesNotMatch(
    anonymousGateway,
    /requireCapability|requestCreateLearner|sign in|create account/i,
    'anonymous world choice must not front-load authentication'
);

const home = between(
    atlas,
    '    function renderHome() {',
    '    function renderAnonymousGateway('
);

assert.match(
    home,
    /const authenticated =\s*hasAuthenticatedAccountContext\(\);/
);
assert.match(
    home,
    /atlasGatewayState =\s*authenticated \? 'authenticated' : 'anonymous'/
);
assert.match(
    home,
    /const nextHomeMarkup = authenticated[\s\S]*?renderGateway\([\s\S]*?: renderAnonymousGateway\(/
);
assert.doesNotMatch(
    home,
    /renderEmptyState|defaultSetupDismissed/
);

const sessionLabels = between(
    atlas,
    '    function setSessionLabels() {',
    '    function hasAuthenticatedAccountContext()'
);

assert.match(
    sessionLabels,
    /authenticated[\s\S]*?\? AtlasSessionPanel\.getSessionDisplayName\(session\)[\s\S]*?: 'Add learner'/
);
assert.match(
    sessionLabels,
    /A free account keeps learner progress and continuity\./
);
assert.match(
    sessionLabels,
    /dataset\.atlasLearnerEntry/
);

const sessionEntry = between(
    atlas,
    '    function openSessionPanel(',
    '    // ================================================================\n    // MOBILE DRAWER'
);

assert.match(
    sessionEntry,
    /!hasAuthenticatedAccountContext\(\)/
);
assert.match(
    sessionEntry,
    /Panel\.openCreateLearner\(trigger\)/
);
assert.match(
    sessionEntry,
    /Panel\.open\(trigger\)/
);

const panelCreateEntry = between(
    panel,
    '    function openCreateLearner(',
    '    async function runSessionAction('
);

assert.match(
    panelCreateEntry,
    /initialView: 'manage'/
);
assert.match(
    panelCreateEntry,
    /setCreateExpanded\([\s\S]*?true[\s\S]*?focus: true/
);
assert.match(
    panel,
    /\+ Add learner/
);
assert.match(
    panel,
    /Learner name/
);
assert.match(
    panel,
    /openCreateLearner,[\s\S]*?requestCreateLearner/
);
assert.match(
    panel,
    /requireCapability\(\s*'canCreateLearner'[\s\S]*?action:\s*'create-learner'/
);

const authenticatedGateway = between(
    atlas,
    '    function renderGateway(',
    '    function getContinueItemArt('
);

assert.match(
    authenticatedGateway,
    /Welcome back/
);
assert.match(
    authenticatedGateway,
    /renderContinueCard/
);
assert.match(
    authenticatedGateway,
    /renderReviewRow/
);

assert.match(
    atlas,
    /Welcome to Atlas/
);
assert.match(
    atlas,
    /Enter Atlas/
);

console.log(
    'Stage 3.1 anonymous Atlas gateway contract passed.'
);
