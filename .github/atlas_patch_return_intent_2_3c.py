from pathlib import Path


def replace_once(path, old, new, label):
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one match in {path}, found {count}')
    file_path.write_text(text.replace(old, new, 1), encoding='utf-8')


# ---------------------------------------------------------------------------
# 1) AtlasAccount: allow signup confirmation to carry only an opaque return
#    intent ID. Password recovery remains on the plain /account/ callback.
# ---------------------------------------------------------------------------
account_path = Path('shared/atlas-account.js')
account = account_path.read_text(encoding='utf-8')

old_return = """    function accountReturnUrl() {\n        return new URL('/account/', window.location.origin).href;\n    }\n"""
new_return = """    function normalizeReturnIntentId(value) {\n        const id = String(value || '').trim();\n        if (!id) return null;\n\n        if (!/^ri_[A-Za-z0-9_-]{20,80}$/.test(id)) {\n            throw new Error('Atlas return intent ID is invalid.');\n        }\n\n        return id;\n    }\n\n    function accountReturnUrl({ returnIntentId = null } = {}) {\n        const url = new URL('/account/', window.location.origin);\n        const intentId = normalizeReturnIntentId(returnIntentId);\n\n        if (intentId) {\n            url.searchParams.set('ri', intentId);\n        }\n\n        return url.href;\n    }\n"""
if account.count(old_return) != 1:
    raise SystemExit(f'account return URL: expected one match, found {account.count(old_return)}')
account = account.replace(old_return, new_return, 1)

old_create = """    async function createAccount(email, password) {\n        await initialize();\n        const AccountCloud = await ensureAccountCloud();\n        const data = await AccountCloud.signUpWithPassword(\n            email,\n            password,\n            accountReturnUrl()\n        );\n"""
new_create = """    async function createAccount(\n        email,\n        password,\n        { returnIntentId = null } = {}\n    ) {\n        await initialize();\n        const AccountCloud = await ensureAccountCloud();\n        const data = await AccountCloud.signUpWithPassword(\n            email,\n            password,\n            accountReturnUrl({ returnIntentId })\n        );\n"""
if account.count(old_create) != 1:
    raise SystemExit(f'account create signature: expected one match, found {account.count(old_create)}')
account = account.replace(old_create, new_create, 1)
account_path.write_text(account, encoding='utf-8')


# ---------------------------------------------------------------------------
# 2) Account gate: pass the already-validated bound opaque ID into signup so
#    the email confirmation callback can recover it. Same-page semantics stay
#    unchanged.
# ---------------------------------------------------------------------------
gate_path = Path('shared/atlas-account-gate.js')
gate = gate_path.read_text(encoding='utf-8')
old_gate_create = """            const result = await window.AtlasAccount.createAccount(\n                email,\n                password\n            );\n"""
new_gate_create = """            const result = await window.AtlasAccount.createAccount(\n                email,\n                password,\n                {\n                    returnIntentId: activeReturnIntentId\n                }\n            );\n"""
if gate.count(old_gate_create) != 1:
    raise SystemExit(f'gate create account call: expected one match, found {gate.count(old_gate_create)}')
gate_path.write_text(gate.replace(old_gate_create, new_gate_create, 1), encoding='utf-8')


# ---------------------------------------------------------------------------
# 3) Dedicated account-surface handoff runtime. It never trusts a destination
#    from the URL: the URL may carry only an opaque ID, which must resolve to
#    an existing canonical AtlasReturnIntent record before navigation.
# ---------------------------------------------------------------------------
handoff_path = Path('shared/atlas-return-handoff.js')
if handoff_path.exists():
    raise SystemExit('shared/atlas-return-handoff.js already exists')

handoff_path.write_text(r'''/* ============================================================
   ATLAS RETURN HANDOFF
   Account-surface bridge for cross-page authentication return.

   The URL may carry only an opaque return-intent ID (`ri`). The destination
   always comes from a validated AtlasReturnIntent record in browser storage.

   Owns:
   - resolving /account/?ri=<opaque-id>
   - removing invalid/stale return references from the account URL
   - consume-once navigation after authentication is established

   Does NOT own:
   - protected-action interception
   - same-page account-gate resume
   - arbitrary redirect URLs
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasReturnHandoff) return;

    const PARAM = 'ri';
    let initialized = false;
    let pendingId = null;
    let navigating = false;

    function accountUrlWithoutIntent() {
        const url = new URL(window.location.href);
        url.searchParams.delete(PARAM);
        return url.pathname + url.search + url.hash;
    }

    function scrubIntentParameter() {
        try {
            window.history.replaceState(
                null,
                document.title,
                accountUrlWithoutIntent()
            );
        } catch {
            // Failure to cosmetically scrub the account URL is non-fatal.
        }
    }

    function initialize() {
        if (initialized) return getPendingIntent();
        initialized = true;

        const ReturnIntent = window.AtlasReturnIntent;
        if (!ReturnIntent) {
            throw new Error('AtlasReturnHandoff requires AtlasReturnIntent.');
        }

        let id = '';

        try {
            id = String(
                new URL(window.location.href).searchParams.get(PARAM) || ''
            ).trim();
        } catch {
            id = '';
        }

        if (!id) return null;

        if (!ReturnIntent.isValidId(id)) {
            scrubIntentParameter();
            return null;
        }

        const intent = ReturnIntent.get(id);

        if (!intent) {
            scrubIntentParameter();
            return null;
        }

        pendingId = intent.id;
        return intent;
    }

    function getPendingId() {
        if (!initialized) initialize();
        return pendingId;
    }

    function getPendingIntent() {
        if (!pendingId) return null;
        return window.AtlasReturnIntent?.get?.(pendingId) || null;
    }

    function resumeIfAuthenticated(accountState) {
        if (!initialized) initialize();

        if (
            navigating ||
            !pendingId ||
            !accountState?.ready ||
            !accountState?.authenticated ||
            accountState?.recovery
        ) {
            return null;
        }

        const id = pendingId;
        const intent = window.AtlasReturnIntent.consume(id);
        pendingId = null;
        scrubIntentParameter();

        if (!intent) return null;

        navigating = true;

        try {
            window.dispatchEvent(new CustomEvent(
                'atlas:return-intent-resume',
                {
                    detail: {
                        intent,
                        source: 'account-confirmation'
                    }
                }
            ));
        } catch { }

        window.location.replace(intent.destination);
        return intent;
    }

    window.AtlasReturnHandoff = Object.freeze({
        initialize,
        getPendingId,
        getPendingIntent,
        resumeIfAuthenticated
    });
})();
''', encoding='utf-8')


# ---------------------------------------------------------------------------
# 4) Account page: load the canonical intent + handoff runtimes, preserve the
#    opaque ID when creating an account from this surface, and resume before
#    rendering normal signed-in account UI. Recovery always wins.
# ---------------------------------------------------------------------------
account_page = Path('account/index.html')
page = account_page.read_text(encoding='utf-8')

old_scripts = """  <script src=\"../shared/atlas-cloud.js?v=20260916-account1\"></script>\n  <script src=\"../shared/atlas-account.js?v=20260916-stage1close1\"></script>\n"""
new_scripts = """  <script src=\"../shared/atlas-cloud.js?v=20260916-account1\"></script>\n  <script src=\"../shared/atlas-account.js?v=20260916-returnintent2\"></script>\n  <script src=\"../shared/atlas-return-intent.js?v=20260916-returnintent1\"></script>\n  <script src=\"../shared/atlas-return-handoff.js?v=20260916-returnhandoff1\"></script>\n"""
if page.count(old_scripts) != 1:
    raise SystemExit(f'account page script block: expected one match, found {page.count(old_scripts)}')
page = page.replace(old_scripts, new_scripts, 1)

old_state_vars = """    let guestMode = 'sign-in';\n    let transientStatus = false;\n"""
new_state_vars = """    let guestMode = 'sign-in';\n    let transientStatus = false;\n\n    AtlasReturnHandoff.initialize();\n"""
if page.count(old_state_vars) != 1:
    raise SystemExit(f'account page state vars: expected one match, found {page.count(old_state_vars)}')
page = page.replace(old_state_vars, new_state_vars, 1)

old_authenticated = """      if (state.authenticated) {\n        showOnly(AccountView);\n"""
new_authenticated = """      if (state.authenticated) {\n        if (AtlasReturnHandoff.resumeIfAuthenticated(state)) {\n          return;\n        }\n\n        showOnly(AccountView);\n"""
if page.count(old_authenticated) != 1:
    raise SystemExit(f'account page authenticated render: expected one match, found {page.count(old_authenticated)}')
page = page.replace(old_authenticated, new_authenticated, 1)

old_page_create = """        const result = await AtlasAccount.createAccount(email, password);\n"""
new_page_create = """        const result = await AtlasAccount.createAccount(\n          email,\n          password,\n          {\n            returnIntentId: AtlasReturnHandoff.getPendingId()\n          }\n        );\n"""
if page.count(old_page_create) != 1:
    raise SystemExit(f'account page create call: expected one match, found {page.count(old_page_create)}')
page = page.replace(old_page_create, new_page_create, 1)

old_confirmation_copy = """            'Check your email to confirm your Atlas account. After confirmation, you’ll return here.',\n"""
new_confirmation_copy = """            AtlasReturnHandoff.getPendingId()\n              ? 'Check your email to confirm your Atlas account. After confirmation, Atlas will take you back to what you were doing.'\n              : 'Check your email to confirm your Atlas account. After confirmation, you’ll return here.',\n"""
if page.count(old_confirmation_copy) != 1:
    raise SystemExit(f'account page confirmation copy: expected one match, found {page.count(old_confirmation_copy)}')
page = page.replace(old_confirmation_copy, new_confirmation_copy, 1)
account_page.write_text(page, encoding='utf-8')


# ---------------------------------------------------------------------------
# 5) Cache-bust account.js wherever the shared runtime can be loaded directly.
# ---------------------------------------------------------------------------
for path in [
    'shared/atlas-access-bootstrap.js',
    'shared/atlas-root-runtime.js',
]:
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    changed = text.replace(
        '/shared/atlas-account.js?v=20260916-access1',
        '/shared/atlas-account.js?v=20260916-returnintent2'
    ).replace(
        '/shared/atlas-account.js?v=20260916-stage1close1',
        '/shared/atlas-account.js?v=20260916-returnintent2'
    )
    if changed == text:
        raise SystemExit(f'{path}: no account cache key updated')
    file_path.write_text(changed, encoding='utf-8')


# ---------------------------------------------------------------------------
# 6) Permanent executable proof.
# ---------------------------------------------------------------------------
test_path = Path('tests/atlas-return-handoff-contract.test.js')
if test_path.exists():
    raise SystemExit('tests/atlas-return-handoff-contract.test.js already exists')

test_path.write_text(r'''\'use strict\';

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
''', encoding='utf-8')


# ---------------------------------------------------------------------------
# 7) Documentation: close Batch 2.3 without pulling 2.4 feature interception
#    into this work.
# ---------------------------------------------------------------------------
readme_path = Path('README.md')
readme = readme_path.read_text(encoding='utf-8')
old_readme = """Cross-page email confirmation, account callback state and destination navigation remain Batch 2.3C. Protected product actions still do not create or invoke return intents until Batch 2.4.\n\n## Browser persistence trust\n"""
new_readme = """Batch 2.3C completes cross-page authentication return. Signup confirmation carries only the validated opaque return-intent ID on `/account/?ri=…`; no destination is accepted from the callback URL. `AtlasReturnHandoff` resolves that ID back to the canonical browser-stored intent, waits for an authenticated non-recovery account state, consumes the intent once, removes the temporary callback parameter, and returns with `location.replace()` to the exact stored path/query/hash. Invalid, stale, tampered or same-browser-missing intent records fail closed to the ordinary account page. Opening the confirmation email on another device therefore authenticates normally but cannot invent or trust a destination that is absent from that browser. Password recovery remains independent and takes precedence over return navigation. The executable cross-page proof lives at `tests/atlas-return-handoff-contract.test.js`.\n\nBatch 2.3 is now complete: Atlas can preserve intent through same-page authentication and email-confirmation round trips without yet deciding which product actions require authentication. Capability-driven feature interception and the actual Add Learner/save/create/edit/My Subjects call sites remain Batch 2.4.\n\n## Browser persistence trust\n"""
if readme.count(old_readme) != 1:
    raise SystemExit(f'README 2.3C anchor: expected one match, found {readme.count(old_readme)}')
readme_path.write_text(readme.replace(old_readme, new_readme, 1), encoding='utf-8')

print('Batch 2.3C confirmation handoff patch applied.')
