'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const CHROME_PATH = 'shared/atlas-account-chrome.js';
const REGISTRY_PATH = 'shared/atlas-content-registry.js';
const INSIDE_PATH = 'tutors/index.html';

function read(path) {
    return fs.readFileSync(path, 'utf8');
}

function runPresentationProof() {
    const source = read(CHROME_PATH);

    global.window = global;
    delete global.document;
    delete window.AtlasAccountChrome;

    vm.runInThisContext(source, { filename: CHROME_PATH });

    const Chrome = window.AtlasAccountChrome;
    assert.ok(Chrome, 'AtlasAccountChrome should initialize its public contract.');

    let presentation = Chrome.getPresentation({
        ready: true,
        authenticated: false,
        tier: 'anonymous'
    });

    assert.equal(presentation.kind, 'sign-in');
    assert.equal(presentation.label, 'Sign in');
    assert.equal(presentation.disabled, false);

    presentation = Chrome.getPresentation({
        ready: false,
        authenticated: true,
        tier: null
    });

    assert.equal(
        presentation.kind,
        'account',
        'A known authenticated identity must render account chrome even while entitlement state resolves.'
    );
    assert.equal(presentation.disabled, false);

    presentation = Chrome.getPresentation({
        ready: true,
        authenticated: true,
        tier: 'free'
    });

    assert.equal(presentation.kind, 'account');
    assert.equal(presentation.label, 'Account');

    presentation = Chrome.getPresentation({
        ready: true,
        authenticated: false,
        tier: 'anonymous'
    });

    assert.equal(
        presentation.kind,
        'sign-in',
        'Sign-out must return persistent account chrome to the anonymous Sign in state.'
    );

    presentation = Chrome.getPresentation(null);
    assert.equal(presentation.kind, 'pending');
    assert.equal(presentation.disabled, true);
}

function runPlacementProof() {
    const chrome = read(CHROME_PATH);
    const registry = read(REGISTRY_PATH);
    const inside = read(INSIDE_PATH);
    const atlas = read('index.html');
    const compass = read('compass/index.html');
    const arcade = read('arcade/index.html');

    assert.match(
        chrome,
        /body\.dataset\.atlasSurface !== 'hub'/,
        'Hub mounting must be explicitly scoped to hub surfaces.'
    );
    assert.match(
        chrome,
        /data-atlas-account-entry/,
        'Inside Atlas must use the same shared account chrome module.'
    );
    assert.match(
        chrome,
        /pilotFeedback\?\.remove/,
        'The Atlas pilot feedback control should leave the prime desktop header slot.'
    );
    assert.match(
        registry,
        /atlas-account-chrome\.js/,
        'The shared registry must load account chrome for product hubs.'
    );
    assert.match(
        registry,
        /writeAtlasAccountChromeScript\(\)/,
        'The shared registry must invoke the account chrome loader.'
    );
    assert.match(
        registry,
        /atlas-access-bootstrap\.js\?v=20260916-access2/,
        'Hub access bootstrap must use the account-gate-capable cache version.'
    );

    [atlas, compass, arcade].forEach((source, index) => {
        assert.match(
            source,
            /data-atlas-surface="hub"/,
            `Product hub ${index + 1} must declare the hub surface contract.`
        );
        assert.match(
            source,
            /class="spine-actions"/,
            `Product hub ${index + 1} must expose the shared desktop utility zone.`
        );
        assert.match(
            source,
            /class="mobile-header-actions"/,
            `Product hub ${index + 1} must expose the shared mobile utility zone.`
        );
    });

    assert.match(
        inside,
        /data-atlas-surface="inside-atlas"/,
        'Inside Atlas must identify itself to shared account chrome.'
    );
    assert.match(
        inside,
        /data-atlas-account-entry/,
        'Inside Atlas must provide an explicit account-entry mount point.'
    );
    assert.match(
        inside,
        /atlas-access-bootstrap\.js\?v=20260916-access2/,
        'Inside Atlas must load canonical access state.'
    );
    assert.match(
        inside,
        /atlas-account-chrome\.js\?v=20260916-accountchrome1/,
        'Inside Atlas must load shared account chrome.'
    );
}

runPresentationProof();
runPlacementProof();

console.log(
    'Atlas account chrome proof passed: anonymous → account → sign-out presentation and hub/Inside Atlas placement contract.'
);
