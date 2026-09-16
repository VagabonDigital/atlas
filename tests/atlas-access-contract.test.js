'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const ACCESS_PATH = 'shared/atlas-access.js';

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function allCapabilitiesBlocked(state) {
    return Object.values(state.capabilities || {}).every(value => !value);
}

async function run() {
    const accessSource = fs.readFileSync(ACCESS_PATH, 'utf8');
    const accountListeners = new Set();
    const accessEvents = [];

    let accountState = {
        ready: true,
        authenticated: false,
        userId: null,
        email: null,
        recovery: false,
        entitlementReady: true,
        planCode: null,
        capabilities: {},
        entitlementError: null
    };

    function emitAccount(nextState) {
        accountState = clone(nextState);
        accountListeners.forEach(listener => listener(clone(accountState)));
    }

    global.window = global;
    global.CustomEvent = function CustomEvent(type, init = {}) {
        this.type = type;
        this.detail = init.detail;
    };

    window.dispatchEvent = event => {
        accessEvents.push(event);
        return true;
    };

    window.AtlasAccount = {
        async initialize() {
            return clone(accountState);
        },
        getState() {
            return clone(accountState);
        },
        subscribe(listener, { immediate = true } = {}) {
            accountListeners.add(listener);
            if (immediate) listener(clone(accountState));
            return () => accountListeners.delete(listener);
        }
    };

    vm.runInThisContext(accessSource, {
        filename: ACCESS_PATH
    });

    await window.AtlasAccess.initialize();

    let state = window.AtlasAccess.getState();
    assert.equal(state.ready, true);
    assert.equal(state.authenticated, false);
    assert.equal(state.tier, 'anonymous');
    assert.equal(state.creationAllowance.status, 'blocked');
    assert.equal(state.creationAllowance.allowed, false);
    assert.ok(allCapabilitiesBlocked(state));

    emitAccount({
        ready: true,
        authenticated: true,
        userId: 'account-a',
        email: 'a@example.com',
        recovery: false,
        entitlementReady: true,
        planCode: 'free',
        capabilities: {},
        entitlementError: null
    });

    state = window.AtlasAccess.getState();
    assert.equal(state.ready, true);
    assert.equal(state.authenticated, true);
    assert.equal(state.tier, 'free');
    assert.equal(state.capabilities.canSaveDurableWork, true);
    assert.equal(state.capabilities.canCreateLearner, true);
    assert.equal(state.capabilities.canCreateSubject, true);
    assert.equal(state.capabilities.canEditSubject, true);
    assert.equal(state.capabilities.canCreateWithAI, true);
    assert.equal(state.capabilities.canAccessAccountLibrary, true);
    assert.equal(state.creationAllowance.status, 'available');
    assert.equal(state.creationAllowance.allowed, true);

    emitAccount({
        ready: true,
        authenticated: true,
        userId: 'account-b',
        email: 'b@example.com',
        recovery: false,
        entitlementReady: false,
        planCode: null,
        capabilities: {},
        entitlementError: null
    });

    state = window.AtlasAccess.getState();
    assert.equal(state.ready, false);
    assert.equal(state.status, 'resolving');
    assert.equal(state.authenticated, true);
    assert.equal(state.tier, null);
    assert.ok(allCapabilitiesBlocked(state));
    assert.equal(state.creationAllowance.status, 'unknown');
    assert.equal(state.creationAllowance.allowed, false);

    emitAccount({
        ready: true,
        authenticated: true,
        userId: 'account-b',
        email: 'b@example.com',
        recovery: false,
        entitlementReady: true,
        planCode: 'free',
        capabilities: {
            canCreateWithAI: false
        },
        entitlementError: null
    });

    state = window.AtlasAccess.getState();
    assert.equal(state.ready, true);
    assert.equal(state.tier, 'free');
    assert.equal(state.capabilities.canCreateWithAI, false);
    assert.equal(state.creationAllowance.status, 'blocked');
    assert.equal(state.creationAllowance.allowed, false);
    assert.equal(state.capabilities.canCreateSubject, true);

    emitAccount({
        ready: true,
        authenticated: true,
        userId: 'account-b',
        email: 'b@example.com',
        recovery: false,
        entitlementReady: true,
        planCode: null,
        capabilities: {},
        entitlementError: 'Entitlement read failed'
    });

    state = window.AtlasAccess.getState();
    assert.equal(state.ready, false);
    assert.equal(state.status, 'error');
    assert.equal(state.authenticated, true);
    assert.equal(state.tier, null);
    assert.equal(state.error, 'Entitlement read failed');
    assert.ok(allCapabilitiesBlocked(state));
    assert.equal(state.creationAllowance.status, 'unknown');
    assert.equal(state.creationAllowance.allowed, false);

    emitAccount({
        ready: true,
        authenticated: true,
        userId: 'account-pro',
        email: 'pro@example.com',
        recovery: false,
        entitlementReady: true,
        planCode: 'pro',
        capabilities: {
            canCreateWithAI: true,
            creationAllowance: {
                allowed: true,
                remaining: 7,
                limit: 10,
                resetAt: '2026-10-01T00:00:00Z'
            }
        },
        entitlementError: null
    });

    state = window.AtlasAccess.getState();
    assert.equal(state.ready, true);
    assert.equal(state.authenticated, true);
    assert.equal(state.tier, 'pro');
    assert.equal(state.capabilities.canCreateWithAI, true);
    assert.equal(state.creationAllowance.status, 'limited');
    assert.equal(state.creationAllowance.allowed, true);
    assert.equal(state.creationAllowance.remaining, 7);
    assert.equal(state.creationAllowance.limit, 10);
    assert.equal(state.creationAllowance.resetAt, '2026-10-01T00:00:00.000Z');

    emitAccount({
        ready: true,
        authenticated: false,
        userId: null,
        email: null,
        recovery: false,
        entitlementReady: true,
        planCode: null,
        capabilities: {},
        entitlementError: null
    });

    state = window.AtlasAccess.getState();
    assert.equal(state.ready, true);
    assert.equal(state.authenticated, false);
    assert.equal(state.tier, 'anonymous');
    assert.ok(allCapabilitiesBlocked(state));

    assert.ok(
        accessEvents.some(event => event.type === 'atlas:access-change'),
        'AtlasAccess should emit access-change events during state transitions.'
    );

    window.AtlasAccess.destroy();

    console.log('AtlasAccess contract proof passed: anonymous, Free, account switch, entitlement failure, future Pro, and sign-out.');
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
