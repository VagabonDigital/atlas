'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

async function testGateApi() {
    const source = fs.readFileSync('shared/atlas-account-gate.js', 'utf8');

    assert.match(
        source,
        /access\.tier === 'pro'[\s\S]*?\? 'Atlas Pro'[\s\S]*?access\.tier === 'free'[\s\S]*?\? 'Free account'/
    );
    const context = {
        console,
        window: {}
    };

    context.window.window = context.window;
    vm.runInNewContext(source, context, {
        filename: 'shared/atlas-account-gate.js'
    });

    const Gate = context.window.AtlasAccountGate;

    assert.ok(Gate, 'AtlasAccountGate should export a shared runtime.');

    [
        'open',
        'openSignIn',
        'openCreateAccount',
        'openAccountMenu',
        'close',
        'closeAccountMenu',
        'getState'
    ].forEach(name => {
        assert.equal(
            typeof Gate[name],
            'function',
            `AtlasAccountGate.${name} should be a function.`
        );
    });

    assert.deepEqual(
        JSON.parse(JSON.stringify(Gate.getState())),
        {
            gateOpen: false,
            gateMode: null,
            menuOpen: false
        }
    );
}

async function testOnDemandAccountUpgrade() {
    const source = fs.readFileSync('shared/atlas-access-bootstrap.js', 'utf8');
    let accountInitializations = 0;
    let accessInitializations = 0;

    const accountState = {
        ready: true,
        authenticated: false,
        userId: null,
        email: null,
        entitlementReady: true,
        planCode: null,
        capabilities: {},
        entitlementError: null
    };

    const accessState = {
        ready: true,
        status: 'ready',
        authenticated: false,
        tier: 'anonymous',
        capabilities: {},
        creationAllowance: {
            status: 'blocked',
            allowed: false,
            remaining: 0,
            limit: null,
            resetAt: null
        },
        error: null
    };

    const window = {
        location: {
            href: 'https://atlasfortutors.com/',
            origin: 'https://atlasfortutors.com'
        },
        AtlasCloud: {},
        AtlasAccount: {
            async initialize() {
                accountInitializations += 1;
                return accountState;
            },
            getState() {
                return accountState;
            }
        },
        AtlasAccess: {
            async initialize() {
                accessInitializations += 1;
                return accessState;
            },
            getState() {
                return accessState;
            },
            bootstrapAnonymous() {
                return accessState;
            }
        },
        addEventListener() {}
    };

    const context = {
        console,
        window,
        localStorage: {
            getItem() {
                return null;
            }
        },
        document: {
            querySelector() {
                return null;
            },
            scripts: [],
            head: {
                appendChild() {}
            },
            createElement() {
                return {
                    addEventListener() {},
                    setAttribute() {}
                };
            }
        },
        URL,
        setTimeout
    };

    vm.runInNewContext(source, context, {
        filename: 'shared/atlas-access-bootstrap.js'
    });

    assert.ok(
        window.AtlasAccessBootstrap,
        'AtlasAccessBootstrap should be available.'
    );
    assert.equal(
        typeof window.AtlasAccessBootstrap.prepareAccount,
        'function',
        'AtlasAccessBootstrap should expose the on-demand account upgrade.'
    );

    const result = await window.AtlasAccessBootstrap.prepareAccount();

    assert.ok(accountInitializations >= 1);
    assert.ok(accessInitializations >= 1);
    assert.equal(result.account.authenticated, false);
    assert.equal(result.access.tier, 'anonymous');
}

async function run() {
    await testGateApi();
    await testOnDemandAccountUpgrade();

    const css = fs.readFileSync('shared/atlas-account-gate.css', 'utf8');
    assert.match(css, /\.atlas-account-gate-layer/);
    assert.match(css, /\.atlas-account-menu/);

    console.log(
        'Atlas account gate foundation proof passed: shared API, account menu contract, and on-demand anonymous auth upgrade.'
    );
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
