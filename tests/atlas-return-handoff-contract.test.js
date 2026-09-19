'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(
    'shared/atlas-return-handoff.js',
    'utf8'
);

function makeHarness({
    href = 'https://atlasfortutors.com/account/?ri=ri_abcdefghijklmnopqrstuvwx',
    stored = true,
    queueSucceeds = true
} = {}) {
    const intent = {
        id: 'ri_abcdefghijklmnopqrstuvwx',
        action: 'create-subject',
        destination: '/compass/subject.html?id=marine-biology#teach',
        context: { subjectId: 'marine-biology' }
    };
    let queued = 0;
    const replacements = [];
    const historyUrls = [];

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
            queueResume(id) {
                if (
                    !queueSucceeds ||
                    !stored ||
                    id !== intent.id
                ) {
                    return null;
                }
                queued += 1;
                return intent;
            }
        }
    };
    window.window = window;

    const context = {
        console,
        window,
        document: { title: 'Atlas Account' },
        URL
    };

    vm.runInNewContext(source, context, {
        filename: 'shared/atlas-return-handoff.js'
    });

    return {
        Handoff: window.AtlasReturnHandoff,
        intent,
        replacements,
        historyUrls,
        get queued() { return queued; }
    };
}

function testAuthenticatedConfirmationQueuesThenNavigates() {
    const harness = makeHarness();
    harness.Handoff.initialize();

    const resumed = harness.Handoff.resumeIfAuthenticated({
        ready: true,
        authenticated: true,
        recovery: false
    });

    assert.equal(resumed.destination, harness.intent.destination);
    assert.equal(harness.queued, 1);
    assert.deepEqual(
        harness.replacements,
        [harness.intent.destination]
    );

    assert.equal(
        harness.Handoff.resumeIfAuthenticated({
            ready: true,
            authenticated: true,
            recovery: false
        }),
        null,
        'Queued confirmation handoff must not navigate twice.'
    );
}

function testQueueFailureDoesNotNavigateOrLosePendingId() {
    const harness = makeHarness({ queueSucceeds: false });
    harness.Handoff.initialize();

    assert.equal(
        harness.Handoff.resumeIfAuthenticated({
            ready: true,
            authenticated: true,
            recovery: false
        }),
        null
    );
    assert.equal(harness.replacements.length, 0);
    assert.equal(
        harness.Handoff.getPendingId(),
        harness.intent.id
    );
}

function testUnauthenticatedAndRecoveryDoNotQueue() {
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
    assert.equal(harness.queued, 0);

    assert.equal(
        harness.Handoff.resumeIfAuthenticated({
            ready: true,
            authenticated: true,
            recovery: true
        }),
        null
    );
    assert.equal(harness.queued, 0);
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
    const account = fs.readFileSync(
        'shared/atlas-account.js',
        'utf8'
    );
    const gate = fs.readFileSync(
        'shared/atlas-account-gate.js',
        'utf8'
    );
    const page = fs.readFileSync(
        'account/index.html',
        'utf8'
    );

    assert.match(
        account,
        /searchParams\.set\('ri', intentId\)/
    );

    assert.match(
        account,
        /createAccount\([\s\S]*?accountReturnUrl\(\{ returnIntentId \}\)/
    );

    assert.match(
        account,
        /requestPasswordReset\([\s\S]*?\{ returnIntentId = null \}[\s\S]*?accountReturnUrl\(\{ returnIntentId \}\)/
    );

    assert.match(
        gate,
        /requestPasswordReset\([\s\S]*?returnIntentId:[\s\S]*?activeReturnIntentId/
    );

    assert.match(
        page,
        /requestPasswordReset\([\s\S]*?returnIntentId:[\s\S]*?AtlasReturnHandoff\.getPendingId\(\)/
    );

    assert.match(
        page,
        /atlas-return-handoff\.js\?v=20260917-capability1/
    );

    assert.match(
        page,
        /state\.authenticated && state\.recovery[\s\S]*?AtlasReturnHandoff\.resumeIfAuthenticated\(state\)/
    );

    assert.doesNotMatch(
        page,
        /new URLSearchParams[\s\S]*?window\.location\.href\s*=\s*.*ri/
    );
}

testAuthenticatedConfirmationQueuesThenNavigates();
testQueueFailureDoesNotNavigateOrLosePendingId();
testUnauthenticatedAndRecoveryDoNotQueue();
testInvalidAndMissingIdsFailClosed();
testDirectAccountVisitIsUnchanged();
testIntegrationBoundaries();

console.log(
    'Atlas confirmation handoff proof passed: opaque callback ID queues before navigation, recovery takes precedence, queue failure stays safe, and direct account visits remain unchanged.'
);
