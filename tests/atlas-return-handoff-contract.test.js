'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('shared/atlas-return-handoff.js', 'utf8');

function makeHarness({
    href = 'https://atlasfortutors.com/account/?ri=ri_abcdefghijklmnopqrstuvwx',
    stored = true
} = {}) {
    const intent = {
        id: 'ri_abcdefghijklmnopqrstuvwx',
        action: 'create-subject',
        destination: '/compass/subject.html?id=marine-biology#teach',
        context: { subjectId: 'marine-biology' }
    };
    let consumed = 0;
    const replacements = [];
    const historyUrls = [];
    const events = [];

    const location = {
        href,
        origin: 'https://atlasfortutors.com',
        replace(value) {
            replacements.push(value);
        }
    };

    const window = {
        location,
        history: {
            replaceState(_state, _title, value) {
                historyUrls.push(value);
            }
        },
        AtlasReturnIntent: {
            isValidId(id) {
                return /^ri_[A-Za-z0-9_-]{20,80}$/.test(String(id || ''));
            },
            get(id) {
                return stored && id === intent.id ? intent : null;
            },
            consume(id) {
                if (!stored || id !== intent.id || consumed > 0) return null;
                consumed += 1;
                return intent;
            }
        },
        dispatchEvent(event) {
            events.push(event);
            return true;
        }
    };
    window.window = window;

    class FakeCustomEvent {
        constructor(type, options = {}) {
            this.type = type;
            this.detail = options.detail;
        }
    }

    const context = {
        console,
        window,
        document: { title: 'Atlas Account' },
        URL,
        CustomEvent: FakeCustomEvent
    };

    vm.runInNewContext(source, context, {
        filename: 'shared/atlas-return-handoff.js'
    });

    return {
        Handoff: window.AtlasReturnHandoff,
        intent,
        replacements,
        historyUrls,
        events,
        get consumed() { return consumed; }
    };
}

function testAuthenticatedConfirmationReturnsExactlyOnce() {
    const harness = makeHarness();
    harness.Handoff.initialize();

    const resumed = harness.Handoff.resumeIfAuthenticated({
        ready: true,
        authenticated: true,
        recovery: false
    });

    assert.equal(resumed.destination, harness.intent.destination);
    assert.equal(harness.consumed, 1);
    assert.deepEqual(harness.replacements, [harness.intent.destination]);
    assert.equal(
        harness.events.find(event => event.type === 'atlas:return-intent-resume')
            .detail.source,
        'account-confirmation'
    );

    assert.equal(
        harness.Handoff.resumeIfAuthenticated({
            ready: true,
            authenticated: true,
            recovery: false
        }),
        null,
        'Consumed confirmation intent must not resume twice.'
    );
}

function testUnauthenticatedAndRecoveryDoNotConsume() {
    const harness = makeHarness();
    harness.Handoff.initialize();

    assert.equal(
        harness.Handoff.resumeIfAuthenticated({
            ready: true,
            authenticated: false,
            recovery: false
        }),
        null
    );
    assert.equal(harness.consumed, 0);

    assert.equal(
        harness.Handoff.resumeIfAuthenticated({
            ready: true,
            authenticated: true,
            recovery: true
        }),
        null,
        'Password recovery must take precedence over return navigation.'
    );
    assert.equal(harness.consumed, 0);
}

function testInvalidAndMissingIdsFailClosed() {
    const invalid = makeHarness({
        href: 'https://atlasfortutors.com/account/?ri=https://evil.example/steal'
    });
    assert.equal(invalid.Handoff.initialize(), null);
    assert.equal(invalid.replacements.length, 0);
    assert.ok(invalid.historyUrls.length >= 1);

    const missing = makeHarness({ stored: false });
    assert.equal(missing.Handoff.initialize(), null);
    assert.equal(missing.replacements.length, 0);
    assert.ok(missing.historyUrls.length >= 1);
}

function testDirectAccountVisitIsUnchanged() {
    const harness = makeHarness({
        href: 'https://atlasfortutors.com/account/'
    });
    assert.equal(harness.Handoff.initialize(), null);
    assert.equal(harness.historyUrls.length, 0);
    assert.equal(harness.replacements.length, 0);
}

function testIntegrationBoundaries() {
    const account = fs.readFileSync('shared/atlas-account.js', 'utf8');
    const gate = fs.readFileSync('shared/atlas-account-gate.js', 'utf8');
    const page = fs.readFileSync('account/index.html', 'utf8');

    assert.match(account, /searchParams\.set\('ri', intentId\)/);
    assert.match(account, /accountReturnUrl\(\{ returnIntentId \}\)/);
    assert.match(
        account,
        /requestPasswordReset\([\s\S]*?accountReturnUrl\(\)/,
        'Password recovery callback must remain independent of return intent.'
    );
    assert.match(gate, /returnIntentId: activeReturnIntentId/);
    assert.match(page, /atlas-return-handoff\.js\?v=20260916-returnhandoff1/);
    assert.match(page, /AtlasReturnHandoff\.resumeIfAuthenticated\(state\)/);
    assert.doesNotMatch(
        page,
        /new URLSearchParams[\s\S]*?window\.location\.href\s*=\s*.*ri/,
        'Account page must never turn raw query data into a redirect.'
    );
}

testAuthenticatedConfirmationReturnsExactlyOnce();
testUnauthenticatedAndRecoveryDoNotConsume();
testInvalidAndMissingIdsFailClosed();
testDirectAccountVisitIsUnchanged();
testIntegrationBoundaries();

console.log(
    'Atlas confirmation handoff proof passed: opaque callback ID, exact deep-link return, recovery precedence, safe fallback, and consume-once navigation.'
);
