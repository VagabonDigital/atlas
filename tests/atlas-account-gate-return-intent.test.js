'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(
    'shared/atlas-account-gate.js',
    'utf8'
);

class FakeClassList {
    toggle() {}
    add() {}
    remove() {}
    contains() { return false; }
}

class FakeElement {
    constructor(name = 'element') {
        this.name = name;
        this.hidden = false;
        this.disabled = false;
        this.dataset = {};
        this.classList = new FakeClassList();
        this.listeners = new Map();
        this.attributes = new Map();
        this.children = [];
        this.textContent = '';
        this.style = {};
        this._innerHTML = '';
        this.queryMap = new Map();
        this.queryAllMap = new Map();
    }

    set innerHTML(value) {
        this._innerHTML = String(value || '');

        if (this.className === 'atlas-account-gate-layer') {
            setupGateDescendants(this);
        } else if (this.className === 'atlas-account-menu') {
            setupMenuDescendants(this);
        }
    }

    get innerHTML() {
        return this._innerHTML;
    }

    addEventListener(type, handler) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        this.listeners.get(type).push(handler);
    }

    querySelector(selector) {
        return this.queryMap.get(selector) || null;
    }

    querySelectorAll(selector) {
        return this.queryAllMap.get(selector) || [];
    }

    appendChild(child) {
        this.children.push(child);
        return child;
    }

    setAttribute(name, value) {
        this.attributes.set(name, String(value));
    }

    getAttribute(name) {
        return this.attributes.get(name) || null;
    }

    focus() {}
    contains() { return false; }
    getBoundingClientRect() {
        return { right: 100, bottom: 50 };
    }
}

function setupGateDescendants(layer) {
    const close = new FakeElement('close');
    const signInMode = new FakeElement('sign-in-mode');
    signInMode.dataset.accountMode = 'sign-in';
    const createMode = new FakeElement('create-mode');
    createMode.dataset.accountMode = 'create';
    const forgot = new FakeElement('forgot');
    const back = new FakeElement('back');
    const messageClose = new FakeElement('message-close');
    const signInForm = new FakeElement('sign-in-form');
    signInForm.dataset.accountForm = 'sign-in';
    const createForm = new FakeElement('create-form');
    createForm.dataset.accountForm = 'create';
    const forgotForm = new FakeElement('forgot-form');
    forgotForm.dataset.accountForm = 'forgot';
    const tabs = new FakeElement('tabs');
    const message = new FakeElement('message');
    const copy = new FakeElement('copy');
    const status = new FakeElement('status');
    const messageTitle = new FakeElement('message-title');
    const messageCopy = new FakeElement('message-copy');

    const map = {
        '[data-account-close]': close,
        '[data-account-forgot]': forgot,
        '[data-account-back-sign-in]': back,
        '[data-account-message-close]': messageClose,
        '[data-account-form="sign-in"]': signInForm,
        '[data-account-form="create"]': createForm,
        '[data-account-form="forgot"]': forgotForm,
        '[data-account-tabs]': tabs,
        '[data-account-message]': message,
        '[data-account-copy]': copy,
        '[data-account-status]': status,
        '[data-account-message-title]': messageTitle,
        '[data-account-message-copy]': messageCopy,
        '[data-account-form="sign-in"] input': new FakeElement('sign-in-input'),
        '[data-account-form="create"] input': new FakeElement('create-input'),
        '[data-account-form="forgot"] input': new FakeElement('forgot-input')
    };

    Object.entries(map).forEach(([selector, element]) => {
        layer.queryMap.set(selector, element);
    });

    layer.queryAllMap.set('[data-account-mode]', [signInMode, createMode]);
    layer.queryAllMap.set(
        '[data-account-form]',
        [signInForm, createForm, forgotForm]
    );
    layer.queryAllMap.set('button, input', []);
    layer.queryAllMap.set(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        []
    );
}

function setupMenuDescendants(menu) {
    menu.queryMap.set(
        '[data-account-menu-sign-out]',
        new FakeElement('menu-sign-out')
    );
    menu.queryMap.set(
        '[data-account-menu-email]',
        new FakeElement('menu-email')
    );
    menu.queryMap.set(
        '[data-account-menu-plan]',
        new FakeElement('menu-plan')
    );
    menu.queryMap.set(
        '[data-account-menu-status]',
        new FakeElement('menu-status')
    );
    menu.queryMap.set('a, button', new FakeElement('menu-first'));
}

function firstListener(element, type) {
    const listeners = element.listeners.get(type) || [];
    assert.ok(listeners.length, `${element.name} should have ${type} listener.`);
    return listeners[0];
}

function makeHarness({ signInFails = false, confirmationRequired = false } = {}) {
    const events = [];
    let consumed = 0;
    let authenticated = false;
    let shouldFail = signInFails;

    const intent = Object.freeze({
        version: 1,
        id: 'ri_123456789012345678901234',
        action: 'create-subject',
        destination: '/compass/?create=subject#top',
        context: Object.freeze({ source: 'proof' }),
        createdAt: 1,
        expiresAt: 9999999999999
    });

    const body = new FakeElement('body');
    body.classList = new FakeClassList();
    const head = new FakeElement('head');

    const document = {
        body,
        head,
        scripts: [],
        activeElement: null,
        querySelector() { return null; },
        createElement(name) { return new FakeElement(name); },
        addEventListener() {},
        removeEventListener() {}
    };

    const window = {
        window: null,
        document,
        location: {
            href: 'https://atlasfortutors.com/compass/',
            origin: 'https://atlasfortutors.com',
            pathname: '/compass/'
        },
        innerWidth: 1200,
        innerHeight: 800,
        AtlasReturnIntent: {
            get(id) {
                return id === intent.id ? intent : null;
            },
            consume(id) {
                if (id !== intent.id) return null;
                consumed += 1;
                return consumed === 1 ? intent : null;
            }
        },
        AtlasAccessBootstrap: {
            async prepareAccount() {
                return {
                    account: { authenticated },
                    access: {
                        ready: true,
                        authenticated,
                        tier: authenticated ? 'free' : 'anonymous'
                    }
                };
            }
        },
        AtlasAccount: {
            getState() {
                return {
                    ready: true,
                    authenticated,
                    email: authenticated ? 'tutor@example.com' : null
                };
            },
            async signIn() {
                if (shouldFail) {
                    shouldFail = false;
                    throw new Error('Invalid login credentials');
                }
                authenticated = true;
            },
            async createAccount() {
                if (confirmationRequired) {
                    return {
                        confirmationRequired: true,
                        email: 'tutor@example.com'
                    };
                }
                authenticated = true;
                return {
                    confirmationRequired: false,
                    email: 'tutor@example.com'
                };
            }
        },
        AtlasAccess: {
            getState() {
                return {
                    ready: true,
                    authenticated,
                    tier: authenticated ? 'free' : 'anonymous'
                };
            }
        },
        dispatchEvent(event) {
            events.push(event);
            return true;
        },
        addEventListener() {},
        removeEventListener() {},
        setTimeout(fn) { fn(); },
        matchMedia() { return { matches: false }; }
    };
    window.window = window;

    class FakeCustomEvent {
        constructor(type, options = {}) {
            this.type = type;
            this.detail = options.detail;
        }
    }

    class FakeFormData {
        constructor(form) {
            this.form = form;
        }
        get(name) {
            const values = {
                email: 'tutor@example.com',
                password: 'password123',
                confirm: 'password123'
            };
            return values[name] || '';
        }
    }

    const context = {
        console,
        window,
        document,
        URL,
        CustomEvent: FakeCustomEvent,
        FormData: FakeFormData,
        setTimeout: fn => fn()
    };

    vm.runInNewContext(source, context, {
        filename: 'shared/atlas-account-gate.js'
    });

    return {
        window,
        document,
        events,
        intent,
        get consumed() { return consumed; },
        setAuthenticated(value) { authenticated = Boolean(value); }
    };
}

async function submitGateForm(harness, selector) {
    const gate = harness.document.body.children.find(
        child => child.className === 'atlas-account-gate-layer'
    );
    assert.ok(gate, 'Account gate layer should mount.');
    const form = gate.querySelector(selector);
    const handler = firstListener(form, 'submit');
    await handler({
        preventDefault() {},
        currentTarget: form
    });
}

async function testSuccessfulSignInConsumesAndPublishes() {
    const harness = makeHarness();
    const Gate = harness.window.AtlasAccountGate;

    await Gate.open({
        mode: 'sign-in',
        returnIntentId: harness.intent.id
    });

    assert.equal(harness.consumed, 0);

    await submitGateForm(
        harness,
        '[data-account-form="sign-in"]'
    );

    assert.equal(
        harness.consumed,
        1,
        'Successful authentication should consume the bound intent exactly once.'
    );

    const resume = harness.events.find(
        event => event.type === 'atlas:return-intent-resume'
    );
    assert.ok(resume, 'Successful authentication should publish a resume event.');
    assert.equal(resume.detail.intent.id, harness.intent.id);
    assert.equal(resume.detail.source, 'account-gate');

    const authenticated = harness.events.find(
        event => event.type === 'atlas:account-gate-authenticated'
    );
    assert.ok(authenticated);
    assert.equal(
        authenticated.detail.returnIntent.id,
        harness.intent.id,
        'The existing authenticated event should also carry the resumed intent.'
    );
}

async function testFailedSignInDoesNotConsume() {
    const harness = makeHarness({ signInFails: true });
    const Gate = harness.window.AtlasAccountGate;

    await Gate.open({
        mode: 'sign-in',
        returnIntentId: harness.intent.id
    });

    await submitGateForm(
        harness,
        '[data-account-form="sign-in"]'
    );

    assert.equal(
        harness.consumed,
        0,
        'Failed authentication must leave the return intent untouched.'
    );
    assert.equal(
        harness.events.some(event => event.type === 'atlas:return-intent-resume'),
        false
    );

    await submitGateForm(
        harness,
        '[data-account-form="sign-in"]'
    );

    assert.equal(
        harness.consumed,
        1,
        'A retry that succeeds should still resume the original intent.'
    );
}

async function testCloseDoesNotConsume() {
    const harness = makeHarness();
    const Gate = harness.window.AtlasAccountGate;

    await Gate.open({
        returnIntentId: harness.intent.id
    });
    Gate.close();

    assert.equal(
        harness.consumed,
        0,
        'Closing the gate must not consume stored intent state.'
    );
}

async function testConfirmationRequiredDoesNotConsume() {
    const harness = makeHarness({ confirmationRequired: true });
    const Gate = harness.window.AtlasAccountGate;

    await Gate.open({
        mode: 'create',
        returnIntentId: harness.intent.id
    });

    await submitGateForm(
        harness,
        '[data-account-form="create"]'
    );

    assert.equal(
        harness.consumed,
        0,
        'Email-confirmation signup must preserve the intent for Batch 2.3C.'
    );
    assert.equal(
        harness.events.some(event => event.type === 'atlas:return-intent-resume'),
        false
    );
}

async function testAlreadyAuthenticatedResumesImmediately() {
    const harness = makeHarness();
    harness.setAuthenticated(true);
    const Gate = harness.window.AtlasAccountGate;

    await Gate.open({
        returnIntentId: harness.intent.id
    });

    assert.equal(harness.consumed, 1);
    assert.equal(
        harness.events.some(event => event.type === 'atlas:return-intent-resume'),
        true,
        'A gate opened after another auth path succeeded should resume immediately.'
    );
}

async function run() {
    await testSuccessfulSignInConsumesAndPublishes();
    await testFailedSignInDoesNotConsume();
    await testCloseDoesNotConsume();
    await testConfirmationRequiredDoesNotConsume();
    await testAlreadyAuthenticatedResumesImmediately();

    console.log(
        'Atlas same-page auth resume proof passed: success consumes once; failure, close, and confirmation preserve intent.'
    );
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
