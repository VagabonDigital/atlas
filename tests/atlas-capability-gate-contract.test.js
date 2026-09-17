'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(
    'shared/atlas-capability-gate.js',
    'utf8'
);

function makeHarness(initialState) {
    let state = { ...initialState };
    const created = [];
    const opened = [];
    const listeners = new Map();
    const subscribers = new Set();

    const intent = {
        id: 'ri_123456789012345678901234',
        action: 'create-subject',
        destination: '/compass/',
        context: { capability: 'canCreateSubject' }
    };

    const window = {
        window: null,
        location: {
            href: 'https://atlasfortutors.com/compass/',
            origin: 'https://atlasfortutors.com',
            pathname: '/compass/'
        },
        AtlasAccessBootstrap: {
            async initialize() {
                return state;
            }
        },
        AtlasAccess: {
            CAPABILITY_NAMES: [
                'canSaveDurableWork',
                'canCreateLearner',
                'canCreateSubject',
                'canEditSubject',
                'canCreateWithAI',
                'canAccessAccountLibrary'
            ],
            getState() {
                return { ...state };
            },
            can(name) {
                return Boolean(
                    state.ready &&
                    state.capabilities?.[name]
                );
            },
            getCreationAllowance() {
                return {
                    ...(state.creationAllowance || {
                        status: 'blocked',
                        allowed: false
                    })
                };
            },
            subscribe(listener) {
                subscribers.add(listener);
                return () => subscribers.delete(listener);
            }
        },
        AtlasReturnIntent: {
            ACTION_TYPES: { CAPABILITY: 'capability' },
            create(input) {
                created.push(input);
                return {
                    ...intent,
                    action: input.action,
                    destination: '/compass/',
                    context: input.context
                };
            },
            discard() {},
            consumeQueuedResume() {
                return null;
            }
        },
        AtlasAccountGate: {
            async open(input) {
                opened.push(input);
                return {};
            }
        },
        addEventListener(type, handler) {
            if (!listeners.has(type)) {
                listeners.set(type, []);
            }
            listeners.get(type).push(handler);
        },
        dispatchEvent(event) {
            (listeners.get(event.type) || [])
                .forEach(handler => handler(event));
            return true;
        },
        setTimeout(fn) {
            fn();
            return 1;
        },
        clearTimeout() {}
    };
    window.window = window;

    const document = {
        readyState: 'loading',
        scripts: [],
        head: {
            appendChild() {}
        },
        createElement() {
            return {
                setAttribute() {},
                addEventListener() {}
            };
        }
    };

    class FakeCustomEvent {
        constructor(type, options = {}) {
            this.type = type;
            this.detail = options.detail;
        }
    }

    vm.runInNewContext(
        source,
        {
            console,
            window,
            document,
            URL,
            CustomEvent: FakeCustomEvent
        },
        { filename: 'shared/atlas-capability-gate.js' }
    );

    return {
        window,
        created,
        opened,
        setState(next) {
            state = { ...next };
            subscribers.forEach(listener => listener({ ...state }));
        }
    };
}

async function testAllowedPassesWithoutAuthUI() {
    const harness = makeHarness({
        ready: true,
        status: 'ready',
        authenticated: true,
        tier: 'free',
        capabilities: { canCreateSubject: true }
    });

    const result = await harness.window.AtlasCapabilityGate
        .requireCapability('canCreateSubject');

    assert.equal(result.outcome, 'allowed');
    assert.equal(harness.created.length, 0);
    assert.equal(harness.opened.length, 0);
}

async function testAnonymousCreatesIntentAndOpensGate() {
    const harness = makeHarness({
        ready: true,
        status: 'ready',
        authenticated: false,
        tier: 'anonymous',
        capabilities: { canCreateSubject: false }
    });

    const result = await harness.window.AtlasCapabilityGate
        .requireCapability(
            'canCreateSubject',
            {
                action: 'create-subject',
                context: { source: 'proof' }
            }
        );

    assert.equal(result.outcome, 'auth-required');
    assert.equal(harness.created.length, 1);
    assert.equal(
        harness.created[0].context.capability,
        'canCreateSubject'
    );
    assert.equal(harness.created[0].context.source, 'proof');
    assert.equal(harness.opened.length, 1);
    assert.equal(
        harness.opened[0].returnIntentId,
        result.returnIntentId
    );
}

async function testAuthenticatedDenialDoesNotShowLogin() {
    const harness = makeHarness({
        ready: true,
        status: 'ready',
        authenticated: true,
        tier: 'free',
        capabilities: { canEditSubject: false }
    });

    const result = await harness.window.AtlasCapabilityGate
        .requireCapability('canEditSubject');

    assert.equal(result.outcome, 'blocked');
    assert.equal(harness.created.length, 0);
    assert.equal(harness.opened.length, 0);
}

async function testAiExhaustionNormalizesAsLimited() {
    const harness = makeHarness({
        ready: true,
        status: 'ready',
        authenticated: true,
        tier: 'free',
        capabilities: { canCreateWithAI: false },
        creationAllowance: {
            status: 'exhausted',
            allowed: false,
            remaining: 0,
            limit: 10
        }
    });

    const result = await harness.window.AtlasCapabilityGate
        .requireCapability('canCreateWithAI');

    assert.equal(result.outcome, 'limited');
    assert.equal(result.reason, 'exhausted');
    assert.equal(result.allowance.remaining, 0);
    assert.equal(harness.opened.length, 0);
}

function testResumeReplayClosesSamePageRace() {
    const harness = makeHarness({
        ready: true,
        status: 'ready',
        authenticated: false,
        tier: 'anonymous',
        capabilities: {}
    });

    const intent = {
        id: 'ri_123456789012345678901234',
        action: 'create-subject',
        destination: '/compass/',
        context: {}
    };

    harness.window.dispatchEvent(new CustomEvent(
        'atlas:return-intent-resume',
        {
            detail: {
                intent,
                source: 'account-gate'
            }
        }
    ));

    let replayed = null;

    harness.window.AtlasCapabilityGate.subscribeResume(
        value => {
            replayed = value;
        },
        { action: 'create-subject' }
    );

    assert.ok(replayed);
    assert.equal(replayed.intent.id, intent.id);
    assert.equal(replayed.source, 'account-gate');
}

async function testUnknownCapabilityFailsClosed() {
    const harness = makeHarness({
        ready: true,
        status: 'ready',
        authenticated: true,
        tier: 'free',
        capabilities: {}
    });

    await assert.rejects(
        () => harness.window.AtlasCapabilityGate
            .requireCapability('isDefinitelyPro'),
        /supported capability/
    );
}

async function run() {
    await testAllowedPassesWithoutAuthUI();
    await testAnonymousCreatesIntentAndOpensGate();
    await testAuthenticatedDenialDoesNotShowLogin();
    await testAiExhaustionNormalizesAsLimited();
    testResumeReplayClosesSamePageRace();
    await testUnknownCapabilityFailsClosed();

    const bootstrap = fs.readFileSync(
        'shared/atlas-access-bootstrap.js',
        'utf8'
    );
    const registry = fs.readFileSync(
        'shared/atlas-content-registry.js',
        'utf8'
    );

    assert.match(
        bootstrap,
        /atlas-capability-gate\.js\?v=20260917-capability1/
    );
    assert.match(bootstrap, /prepareCapabilityGate/);
    assert.match(
        registry,
        /atlas-access-bootstrap\.js\?v=20260917-capability1/
    );

    console.log(
        'Atlas capability gate proof passed: action-time allow/auth/block/limit outcomes, resume replay, and cross-world bootstrap contract.'
    );
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
