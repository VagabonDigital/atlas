from pathlib import Path


def replace_once(path, old, new, label):
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one match in {path}, found {count}')
    file_path.write_text(text.replace(old, new, 1), encoding='utf-8')


# ---------------------------------------------------------------------------
# 1) AtlasAccountGate: bind an optional existing return-intent ID to the gate.
#    The intent remains durable until authentication actually succeeds.
# ---------------------------------------------------------------------------
gate_path = Path('shared/atlas-account-gate.js')
gate = gate_path.read_text(encoding='utf-8')

replace_pairs = []

old_header = """   AtlasAccess owns semantic access state.\n   AtlasAccount owns account lifecycle.\n   AtlasAccessBootstrap owns loading the heavy auth stack on demand.\n\n   This module does NOT own:\n   - header placement\n   - return-to-intent routing\n   - feature interception\n"""
new_header = """   AtlasAccess owns semantic access state.\n   AtlasAccount owns account lifecycle.\n   AtlasAccessBootstrap owns loading the heavy auth stack on demand.\n   AtlasReturnIntent owns temporary interrupted-action records.\n\n   This module owns same-page authentication resume publication only.\n\n   This module does NOT own:\n   - header placement\n   - cross-page confirmation/deep-link return routing\n   - feature interception\n"""
if gate.count(old_header) != 1:
    raise SystemExit(f'gate header: expected one match, found {gate.count(old_header)}')
gate = gate.replace(old_header, new_header, 1)

old_constants = """    const STYLE_HREF =\n        '/shared/atlas-account-gate.css?v=20260916-accountgate1';\n\n    let gateLayer = null;\n"""
new_constants = """    const STYLE_HREF =\n        '/shared/atlas-account-gate.css?v=20260916-accountgate1';\n    const RETURN_INTENT_SRC =\n        '/shared/atlas-return-intent.js?v=20260916-returnintent1';\n\n    let gateLayer = null;\n"""
if gate.count(old_constants) != 1:
    raise SystemExit(f'gate constants: expected one match, found {gate.count(old_constants)}')
gate = gate.replace(old_constants, new_constants, 1)

old_vars = """    let menuAnchor = null;\n    let busy = false;\n\n    const state = {\n"""
new_vars = """    let menuAnchor = null;\n    let busy = false;\n    let returnIntentPromise = null;\n    let activeReturnIntentId = null;\n\n    const state = {\n"""
if gate.count(old_vars) != 1:
    raise SystemExit(f'gate variables: expected one match, found {gate.count(old_vars)}')
gate = gate.replace(old_vars, new_vars, 1)

prepare_anchor = """    async function prepareAccount() {\n"""
return_intent_helpers = r'''    function existingScriptFor(src) {
        const pathname = String(src || '').split('?')[0];

        return Array.from(document.scripts || []).find(script => {
            try {
                return new URL(script.src, window.location.href)
                    .pathname === pathname;
            } catch {
                return false;
            }
        }) || null;
    }

    function ensureReturnIntent() {
        if (window.AtlasReturnIntent) {
            return Promise.resolve(window.AtlasReturnIntent);
        }

        if (returnIntentPromise) return returnIntentPromise;

        returnIntentPromise = new Promise((resolve, reject) => {
            const existing = existingScriptFor(RETURN_INTENT_SRC);

            function complete() {
                if (window.AtlasReturnIntent) {
                    resolve(window.AtlasReturnIntent);
                } else {
                    returnIntentPromise = null;
                    reject(new Error(
                        'Atlas could not preserve what you were doing.'
                    ));
                }
            }

            if (existing) {
                existing.addEventListener('load', complete, { once: true });
                existing.addEventListener(
                    'error',
                    () => {
                        returnIntentPromise = null;
                        reject(new Error(
                            'Atlas could not load return-intent support.'
                        ));
                    },
                    { once: true }
                );
                return;
            }

            const script = document.createElement('script');
            script.src = RETURN_INTENT_SRC;
            script.async = false;
            script.setAttribute(
                'data-atlas-return-intent-runtime',
                'true'
            );
            script.addEventListener('load', complete, { once: true });
            script.addEventListener(
                'error',
                () => {
                    returnIntentPromise = null;
                    reject(new Error(
                        'Atlas could not load return-intent support.'
                    ));
                },
                { once: true }
            );
            document.head.appendChild(script);
        });

        return returnIntentPromise;
    }

    async function bindReturnIntent(returnIntentId) {
        activeReturnIntentId = null;

        const id = String(returnIntentId || '').trim();
        if (!id) return null;

        const ReturnIntent = await ensureReturnIntent();
        const intent = ReturnIntent.get(id);

        if (!intent) {
            throw new Error(
                'That Atlas action can no longer be resumed. Close this window and try the action again.'
            );
        }

        activeReturnIntentId = intent.id;
        return intent;
    }

'''
if gate.count(prepare_anchor) != 1:
    raise SystemExit(f'gate prepare anchor: expected one match, found {gate.count(prepare_anchor)}')
gate = gate.replace(prepare_anchor, return_intent_helpers + prepare_anchor, 1)

old_open = """    async function open({ mode = 'sign-in', trigger = null } = {}) {\n        ensureGate();\n        closeAccountMenu({ restoreFocus: false });\n        rememberTrigger(trigger);\n\n        gateLayer.hidden = false;\n        document.body.classList.add('atlas-account-gate-open');\n        state.gateOpen = true;\n        setGateMode(mode);\n        setBusy(true);\n        setGateStatus('Preparing your Atlas account…');\n\n        try {\n            await prepareAccount();\n            const account = window.AtlasAccount?.getState?.() || null;\n\n            if (account?.authenticated) {\n                close({ restoreFocus: false });\n                await openAccountMenu(trigger || activeTrigger || previousFocus);\n                return snapshot();\n            }\n\n            setGateStatus('');\n            setBusy(false);\n            setGateMode(mode);\n            return snapshot();\n        } catch (error) {\n            setBusy(false);\n            setGateStatus(humanizeError(error), 'error');\n            return snapshot();\n        }\n    }\n"""
new_open = """    async function open({\n        mode = 'sign-in',\n        trigger = null,\n        returnIntentId = null\n    } = {}) {\n        ensureGate();\n        closeAccountMenu({ restoreFocus: false });\n        rememberTrigger(trigger);\n\n        gateLayer.hidden = false;\n        document.body.classList.add('atlas-account-gate-open');\n        state.gateOpen = true;\n        setGateMode(mode);\n        setBusy(true);\n        setGateStatus('Preparing your Atlas account…');\n\n        try {\n            const returnIntent =\n                await bindReturnIntent(returnIntentId);\n\n            await prepareAccount();\n            const account = window.AtlasAccount?.getState?.() || null;\n\n            if (account?.authenticated) {\n                if (returnIntent) {\n                    await completeAuthenticatedFlow();\n                    return snapshot();\n                }\n\n                close({ restoreFocus: false });\n                await openAccountMenu(trigger || activeTrigger || previousFocus);\n                return snapshot();\n            }\n\n            setGateStatus('');\n            setBusy(false);\n            setGateMode(mode);\n            return snapshot();\n        } catch (error) {\n            setBusy(false);\n            setGateStatus(humanizeError(error), 'error');\n            return snapshot();\n        }\n    }\n"""
if gate.count(old_open) != 1:
    raise SystemExit(f'gate open function: expected one match, found {gate.count(old_open)}')
gate = gate.replace(old_open, new_open, 1)

old_close_tail = """        activeTrigger = null;\n        previousFocus = null;\n    }\n\n    function dispatchAuthenticated() {\n"""
new_close_tail = """        activeTrigger = null;\n        previousFocus = null;\n        activeReturnIntentId = null;\n    }\n\n    function dispatchAuthenticated(returnIntent = null) {\n"""
if gate.count(old_close_tail) != 1:
    raise SystemExit(f'gate close/dispatch boundary: expected one match, found {gate.count(old_close_tail)}')
gate = gate.replace(old_close_tail, new_close_tail, 1)

old_dispatch_detail = """                    detail: {\n                        account: window.AtlasAccount?.getState?.() || null,\n                        access: window.AtlasAccess?.getState?.() || null\n                    }\n"""
new_dispatch_detail = """                    detail: {\n                        account: window.AtlasAccount?.getState?.() || null,\n                        access: window.AtlasAccess?.getState?.() || null,\n                        returnIntent\n                    }\n"""
if gate.count(old_dispatch_detail) != 1:
    raise SystemExit(f'gate authenticated detail: expected one match, found {gate.count(old_dispatch_detail)}')
gate = gate.replace(old_dispatch_detail, new_dispatch_detail, 1)

old_dispatch_end = """        } catch {\n            // Access/account subscriptions remain the canonical state path.\n        }\n    }\n\n    async function handleSignIn(event) {\n"""
new_dispatch_end = """        } catch {\n            // Access/account subscriptions remain the canonical state path.\n        }\n    }\n\n    function dispatchReturnIntentResume(intent) {\n        if (!intent) return;\n\n        try {\n            window.dispatchEvent(new CustomEvent(\n                'atlas:return-intent-resume',\n                {\n                    detail: {\n                        intent,\n                        source: 'account-gate'\n                    }\n                }\n            ));\n        } catch {\n            // Consumers can still inspect their own canonical state.\n        }\n    }\n\n    async function completeAuthenticatedFlow() {\n        const account = window.AtlasAccount?.getState?.() || null;\n        const intentId = activeReturnIntentId;\n        let returnIntent = null;\n\n        if (account?.authenticated && intentId) {\n            try {\n                const ReturnIntent = await ensureReturnIntent();\n                returnIntent = ReturnIntent.consume(intentId);\n            } catch (error) {\n                console.error(\n                    '[AtlasAccountGate] return intent resume failed:',\n                    error\n                );\n            }\n        }\n\n        close({\n            restoreFocus: !returnIntent\n        });\n        dispatchAuthenticated(returnIntent);\n        dispatchReturnIntentResume(returnIntent);\n\n        return returnIntent;\n    }\n\n    async function handleSignIn(event) {\n"""
if gate.count(old_dispatch_end) != 1:
    raise SystemExit(f'gate dispatch end: expected one match, found {gate.count(old_dispatch_end)}')
gate = gate.replace(old_dispatch_end, new_dispatch_end, 1)

old_signin_success = """            await prepareAccount();\n            await window.AtlasAccount.signIn(email, password);\n            dispatchAuthenticated();\n            close();\n"""
new_signin_success = """            await prepareAccount();\n            await window.AtlasAccount.signIn(email, password);\n            await completeAuthenticatedFlow();\n"""
if gate.count(old_signin_success) != 1:
    raise SystemExit(f'gate sign-in success: expected one match, found {gate.count(old_signin_success)}')
gate = gate.replace(old_signin_success, new_signin_success, 1)

old_create_success = """            dispatchAuthenticated();\n            close();\n"""
new_create_success = """            await completeAuthenticatedFlow();\n"""
if gate.count(old_create_success) != 1:
    raise SystemExit(f'gate create success: expected one match, found {gate.count(old_create_success)}')
gate = gate.replace(old_create_success, new_create_success, 1)

gate_path.write_text(gate, encoding='utf-8')


# ---------------------------------------------------------------------------
# 2) Cache-bust the gate loader used by the shared account chrome.
# ---------------------------------------------------------------------------
replace_once(
    'shared/atlas-account-chrome.js',
    "'/shared/atlas-account-gate.js?v=20260916-accountgate1'",
    "'/shared/atlas-account-gate.js?v=20260916-accountgate2'",
    'account chrome gate cache version'
)


# ---------------------------------------------------------------------------
# 3) Permanent executable proof for same-page return-intent semantics.
# ---------------------------------------------------------------------------
test = r'''\'use strict\';

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
'''
Path('tests/atlas-account-gate-return-intent.test.js').write_text(
    test,
    encoding='utf-8'
)


# ---------------------------------------------------------------------------
# 4) Document the exact 2.3B boundary.
# ---------------------------------------------------------------------------
readme_path = Path('README.md')
readme = readme_path.read_text(encoding='utf-8')
anchor = """Batch 2.3A establishes storage and validation only. It does not wire the account gate, add auth callback/query parameters, navigate to destinations or intercept protected features. Same-page authentication resume belongs to Batch 2.3B; confirmation/deep-link handoff belongs to Batch 2.3C; feature actions begin creating return intents in Batch 2.4. The executable contract proof lives at `tests/atlas-return-intent-contract.test.js`.\n\n## Browser persistence trust\n"""
replacement = """Batch 2.3A establishes storage and validation only. It does not wire the account gate, add auth callback/query parameters, navigate to destinations or intercept protected features. Same-page authentication resume belongs to Batch 2.3B; confirmation/deep-link handoff belongs to Batch 2.3C; feature actions begin creating return intents in Batch 2.4. The executable contract proof lives at `tests/atlas-return-intent-contract.test.js`.\n\nBatch 2.3B teaches `AtlasAccountGate` to accept an optional existing return-intent ID without changing generic account entry. The gate validates that intent when it opens, preserves it through failed authentication, cancellation, password-reset entry and email-confirmation-required signup, and consumes it only after Atlas has an authenticated account. Successful same-page authentication publishes `atlas:return-intent-resume` with the consumed intent and `source: 'account-gate'`; the existing `atlas:account-gate-authenticated` event also carries the resumed intent. The gate never navigates to the stored destination itself. A gate opened with a still-valid intent after another auth path has already authenticated the tutor resumes immediately rather than opening the account menu. The executable same-page proof lives at `tests/atlas-account-gate-return-intent.test.js`.\n\nCross-page email confirmation, account callback state and destination navigation remain Batch 2.3C. Protected product actions still do not create or invoke return intents until Batch 2.4.\n\n## Browser persistence trust\n"""
if readme.count(anchor) != 1:
    raise SystemExit(
        f'README 2.3B anchor: expected one match, found {readme.count(anchor)}'
    )
readme_path.write_text(
    readme.replace(anchor, replacement, 1),
    encoding='utf-8'
)

print('Batch 2.3B same-page auth resume patch applied.')
