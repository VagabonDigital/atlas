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
    const chromeCss = read('shared/atlas-account-chrome.css');
    const gate = read('shared/atlas-account-gate.js');
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
        /atlas-access-bootstrap\.js\?v=20260917-capability1/,
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
        assert.match(
            source,
            /atlas-content-registry\.js\?v=[A-Za-z0-9_-]+/,
            `Product hub ${index + 1} must cache-bust the account-chrome registry version.`
        );
    });

    assert.doesNotMatch(
        atlas,
        /class="spine-btn" data-atlas-feedback/,
        'Atlas desktop header must not retain the pilot feedback control.'
    );
    assert.match(
        atlas,
        /class="drawer-nav-item" data-atlas-feedback/,
        'Atlas should retain the secondary mobile-drawer contact path for now.'
    );

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
        /atlas-access-bootstrap\.js\?v=20260917-capability1/,
        'Inside Atlas must load canonical access state.'
    );
    assert.match(
        inside,
        /atlas-account-chrome\.js\?v=20260916-accountchrome6/,
        'Inside Atlas must load shared account chrome.'
    );
    assert.match(
        inside,
        /atlas-account-chrome\.css\?v=20260916-accountchrome6[\s\S]*?data-atlas-account-chrome-styles/,
        'Inside Atlas must load account chrome styles in the document head before hydration.'
    );
    assert.match(
        inside,
        /data-atlas-account-entry data-account-state="pending"[\s\S]*?atlas-inside-account-explore[\s\S]*?data-atlas-inside-account/,
        'Inside Atlas must ship a compact first-paint account shell in HTML.'
    );

    assert.match(
        chrome,
        /variant === 'mobile'[\s\S]*?'mobile-header-btn'[\s\S]*?'spine-btn'/,
        'Hub account controls must inherit the hubs’ native utility-button classes.'
    );
    assert.match(
        chrome,
        /if \(!container\.querySelector\('\[data-atlas-inside-account\]'\)\)/,
        'Inside Atlas hydration must preserve a server-rendered first-paint account shell.'
    );
    assert.match(
        chrome,
        /pendingAnonymous/,
        'Inside Atlas pending state must preserve the synchronous first-paint account hint.'
    );

    [atlas, compass, arcade].forEach((source, index) => {
        assert.match(source, /data-atlas-account-control="desktop"[\s\S]*?data-account-state="pending"/, `Product hub ${index + 1} must ship a desktop first-paint account shell.`);
        assert.match(source, /data-atlas-account-control="mobile"[\s\S]*?data-account-state="pending"/, `Product hub ${index + 1} must ship a mobile first-paint account shell.`);
        assert.match(source, /sb-jnhjfpagectprceswvqn-auth-token[\s\S]*?atlasAccountHint/, `Product hub ${index + 1} must resolve first-paint account geometry synchronously.`);
    });
    assert.match(chrome, /if \(presentation\.kind === 'pending'\) return;/, 'Account chrome must preserve the first-paint shell while access resolves.');
    assert.match(inside, /appearance-icon appearance-icon--moon[\s\S]*?appearance-icon appearance-icon--sun/, 'Inside Atlas must use deterministic SVG appearance icons.');

    assert.match(
        chrome,
        /MutationObserver/,
        'Account chrome must mount as soon as the header mount point exists, not wait for DOMContentLoaded.'
    );
    assert.match(
        chrome,
        /if \(gateState\.menuOpen\)[\s\S]*?Gate\.closeAccountMenu\(\)/,
        'The signed-in account control must toggle its menu closed on a second click.'
    );
    assert.match(
        chrome,
        /ensureGateStyles/,
        'Account chrome must wait for gate/menu styles before opening account UI.'
    );
    assert.match(
        chromeCss,
        /\.atlas-inside-account-action\[hidden\][\s\S]*?display: none !important/,
        'Inside Atlas guest/account controls must obey hidden state without duplicates.'
    );
    assert.match(
        gate,
        /focus\(\{ preventScroll: true \}\)/,
        'Account gate/menu focus must not scroll the underlying page.'
    );
    assert.match(
        inside,
        /atlasAccountHint/,
        'Inside Atlas must resolve anonymous/account first-paint geometry synchronously.'
    );
    assert.doesNotMatch(
        inside,
        /data-atlas-inside-create hidden/,
        'Inside Atlas must not hide Create free account in its static first-paint shell.'
    );
    assert.match(
        chromeCss,
        /data-atlas-account-hint="anonymous"/,
        'Inside Atlas account CSS must honor the synchronous anonymous first-paint hint.'
    );
}

runPresentationProof();
runPlacementProof();

console.log(
    'Atlas account chrome proof passed: anonymous → account → sign-out presentation and hub/Inside Atlas placement contract.'
);
