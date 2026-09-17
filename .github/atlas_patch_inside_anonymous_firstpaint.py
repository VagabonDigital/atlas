from pathlib import Path


def replace_once(path, old, new, label):
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match in {path}, found {count}')
    file_path.write_text(text.replace(old, new, 1), encoding='utf-8')


# Inside Atlas: resolve the same cheap first-paint account hint used by the hubs
# before the visible page is released by the font gate.
replace_once(
    'tutors/index.html',
    '''  </script>\n  <link rel="stylesheet" href="/shared/atlas-account-chrome.css?v=20260916-accountchrome5"\n    data-atlas-account-chrome-styles>''',
    '''  </script>\n  <script>\n    (function () {\n      var hasAccount = false;\n      try {\n        hasAccount = Boolean(\n          localStorage.getItem('sb-jnhjfpagectprceswvqn-auth-token')\n        );\n      } catch (e) { }\n\n      document.documentElement.dataset.atlasAccountHint =\n        hasAccount ? 'account' : 'anonymous';\n    })();\n  </script>\n  <link rel="stylesheet" href="/shared/atlas-account-chrome.css?v=20260916-accountchrome6"\n    data-atlas-account-chrome-styles>''',
    'Inside Atlas synchronous account hint'
)

# The first-paint shell must contain both possible geometries. CSS + the hint
# decides which one is visible before access hydration begins.
replace_once(
    'tutors/index.html',
    '''        <button class="atlas-inside-account-action atlas-inside-account-sign-in" type="button"\n          data-atlas-inside-sign-in hidden>Sign in</button>\n        <button class="atlas-inside-account-action atlas-inside-account-create" type="button"\n          data-atlas-inside-create hidden>''',
    '''        <button class="atlas-inside-account-action atlas-inside-account-sign-in" type="button"\n          data-atlas-inside-sign-in>Sign in</button>\n        <button class="atlas-inside-account-action atlas-inside-account-create" type="button"\n          data-atlas-inside-create>''',
    'Inside Atlas anonymous first-paint controls'
)

replace_once(
    'tutors/index.html',
    '/shared/atlas-account-chrome.js?v=20260916-accountchrome5',
    '/shared/atlas-account-chrome.js?v=20260916-accountchrome6',
    'Inside Atlas account chrome cache version'
)

# Shared account CSS: pending Inside Atlas defaults to the compact account shell,
# but an anonymous first-paint hint swaps in the guest CTAs immediately.
replace_once(
    'shared/atlas-account-chrome.css',
    '''.atlas-inside-account-icon {\n    width: 36px;\n    min-width: 36px;\n    padding: 0;\n}\n''',
    '''.atlas-inside-account-icon {\n    width: 36px;\n    min-width: 36px;\n    padding: 0;\n}\n\n.atlas-inside-account-entry[data-account-state="pending"] .atlas-inside-account-sign-in,\n.atlas-inside-account-entry[data-account-state="pending"] .atlas-inside-account-create {\n    display: none;\n}\n\nhtml[data-atlas-account-hint="anonymous"]\n.atlas-inside-account-entry[data-account-state="pending"] .atlas-inside-account-sign-in,\nhtml[data-atlas-account-hint="anonymous"]\n.atlas-inside-account-entry[data-account-state="pending"] .atlas-inside-account-create {\n    display: inline-flex;\n}\n\nhtml[data-atlas-account-hint="anonymous"]\n.atlas-inside-account-entry[data-account-state="pending"] .atlas-inside-account-icon {\n    display: none;\n}\n''',
    'Inside Atlas pending first-paint CSS'
)

# Shared runtime: do not undo the anonymous first-paint shell while canonical
# access is still pending. Once access resolves, the normal presentation wins.
replace_once(
    'shared/atlas-account-chrome.js',
    "'/shared/atlas-account-chrome.css?v=20260916-accountchrome5'",
    "'/shared/atlas-account-chrome.css?v=20260916-accountchrome6'",
    'Shared account chrome CSS cache version'
)

replace_once(
    'shared/atlas-account-chrome.js',
    '''        const isAccount = presentation.kind === 'account';\n        const isPending = presentation.kind === 'pending';\n\n        if (signIn) {\n            signIn.hidden = isAccount || isPending;\n            signIn.disabled = false;\n        }\n\n        if (create) {\n            create.hidden = isAccount || isPending;\n            create.disabled = false;\n        }\n\n        if (account) {\n            account.hidden = presentation.kind === 'sign-in';''',
    '''        const isAccount = presentation.kind === 'account';\n        const isPending = presentation.kind === 'pending';\n        const pendingAnonymous =\n            isPending &&\n            document.documentElement.dataset.atlasAccountHint === 'anonymous';\n\n        if (signIn) {\n            signIn.hidden = isAccount || (isPending && !pendingAnonymous);\n            signIn.disabled = false;\n        }\n\n        if (create) {\n            create.hidden = isAccount || (isPending && !pendingAnonymous);\n            create.disabled = false;\n        }\n\n        if (account) {\n            account.hidden = presentation.kind === 'sign-in' || pendingAnonymous;''',
    'Inside Atlas pending anonymous hydration'
)

# Contract proof: Inside Atlas must keep its cache version, synchronous hint,
# static anonymous shell, pending runtime behavior, and CSS first-paint geometry.
test_path = Path('tests/atlas-account-chrome-contract.test.js')
test = test_path.read_text(encoding='utf-8')

for old, new, label in [
    (
        r'/atlas-account-chrome\\.js\\?v=20260916-accountchrome5/',
        r'/atlas-account-chrome\\.js\\?v=20260916-accountchrome6/',
        'Inside Atlas JS test version'
    ),
    (
        r'/atlas-account-chrome\\.css\\?v=20260916-accountchrome5[\\s\\S]*?data-atlas-account-chrome-styles/',
        r'/atlas-account-chrome\\.css\\?v=20260916-accountchrome6[\\s\\S]*?data-atlas-account-chrome-styles/',
        'Inside Atlas CSS test version'
    )
]:
    count = test.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    test = test.replace(old, new, 1)

old_shell_assert = '''    assert.match(\n        inside,\n        /data-atlas-account-entry data-account-state="pending"[\\s\\S]*?atlas-inside-account-explore[\\s\\S]*?data-atlas-inside-account/,\n        'Inside Atlas must ship a compact first-paint account shell in HTML.'\n    );\n'''
new_shell_assert = '''    assert.match(\n        inside,\n        /data-atlas-account-entry data-account-state="pending"[\\s\\S]*?atlas-inside-account-explore[\\s\\S]*?data-atlas-inside-sign-in>Sign in<\\/button>[\\s\\S]*?data-atlas-inside-create>[\\s\\S]*?Create free account[\\s\\S]*?data-atlas-inside-account/,\n        'Inside Atlas must ship both anonymous and account first-paint controls in HTML.'\n    );\n    assert.match(\n        inside,\n        /sb-jnhjfpagectprceswvqn-auth-token[\\s\\S]*?atlasAccountHint/,\n        'Inside Atlas must resolve first-paint account geometry synchronously.'\n    );\n'''
if test.count(old_shell_assert) != 1:
    raise SystemExit('Inside Atlas first-paint shell test anchor moved')
test = test.replace(old_shell_assert, new_shell_assert, 1)

old_runtime_assert = '''    assert.match(\n        chrome,\n        /signIn\\.hidden = isAccount \\|\\| isPending[\\s\\S]*?account\\.hidden = presentation\\.kind === 'sign-in'/,\n        'Inside Atlas pending state must keep the compact account shell instead of blanking the header.'\n    );\n'''
new_runtime_assert = '''    assert.match(\n        chrome,\n        /pendingAnonymous[\\s\\S]*?signIn\\.hidden = isAccount \\|\\| \\(isPending && !pendingAnonymous\\)[\\s\\S]*?account\\.hidden = presentation\\.kind === 'sign-in' \\|\\| pendingAnonymous/,\n        'Inside Atlas pending state must preserve the synchronous anonymous/account first-paint hint.'\n    );\n'''
if test.count(old_runtime_assert) != 1:
    raise SystemExit('Inside Atlas pending runtime test anchor moved')
test = test.replace(old_runtime_assert, new_runtime_assert, 1)

css_anchor = '''    assert.match(\n        chromeCss,\n        /\\.atlas-inside-account-action\\[hidden\\][\\s\\S]*?display: none !important/,\n        'Inside Atlas guest/account controls must obey hidden state without duplicates.'\n    );\n'''
css_extra = '''    assert.match(\n        chromeCss,\n        /data-atlas-account-hint="anonymous"[\\s\\S]*?data-account-state="pending"[\\s\\S]*?atlas-inside-account-create[\\s\\S]*?display: inline-flex[\\s\\S]*?atlas-inside-account-icon[\\s\\S]*?display: none/,\n        'Inside Atlas anonymous first paint must expose guest CTAs and suppress the pending account icon.'\n    );\n'''
if test.count(css_anchor) != 1:
    raise SystemExit('Inside Atlas CSS proof anchor moved')
test = test.replace(css_anchor, css_extra + css_anchor, 1)

test_path.write_text(test, encoding='utf-8')
print('Inside Atlas anonymous first-paint account shell updated.')
