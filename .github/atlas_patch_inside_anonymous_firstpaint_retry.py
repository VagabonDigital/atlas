from pathlib import Path


def replace_once(path, old, new, label):
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match in {path}, found {count}')
    file_path.write_text(text.replace(old, new, 1), encoding='utf-8')


replace_once(
    'tutors/index.html',
    '''  </script>\n  <link rel="stylesheet" href="/shared/atlas-account-chrome.css?v=20260916-accountchrome5"\n    data-atlas-account-chrome-styles>''',
    '''  </script>\n  <script>\n    (function () {\n      var hasAccount = false;\n      try {\n        hasAccount = Boolean(\n          localStorage.getItem('sb-jnhjfpagectprceswvqn-auth-token')\n        );\n      } catch (e) { }\n\n      document.documentElement.dataset.atlasAccountHint =\n        hasAccount ? 'account' : 'anonymous';\n    })();\n  </script>\n  <link rel="stylesheet" href="/shared/atlas-account-chrome.css?v=20260916-accountchrome6"\n    data-atlas-account-chrome-styles>''',
    'Inside Atlas synchronous account hint'
)

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

replace_once(
    'shared/atlas-account-chrome.css',
    '''.atlas-inside-account-icon {\n    width: 36px;\n    min-width: 36px;\n    padding: 0;\n}\n''',
    '''.atlas-inside-account-icon {\n    width: 36px;\n    min-width: 36px;\n    padding: 0;\n}\n\n.atlas-inside-account-entry[data-account-state="pending"] .atlas-inside-account-sign-in,\n.atlas-inside-account-entry[data-account-state="pending"] .atlas-inside-account-create {\n    display: none;\n}\n\nhtml[data-atlas-account-hint="anonymous"]\n.atlas-inside-account-entry[data-account-state="pending"] .atlas-inside-account-sign-in,\nhtml[data-atlas-account-hint="anonymous"]\n.atlas-inside-account-entry[data-account-state="pending"] .atlas-inside-account-create {\n    display: inline-flex;\n}\n\nhtml[data-atlas-account-hint="anonymous"]\n.atlas-inside-account-entry[data-account-state="pending"] .atlas-inside-account-icon {\n    display: none;\n}\n''',
    'Inside Atlas pending first-paint CSS'
)

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

# Update the permanent proof without depending on escaped-regex source spelling.
test_path = Path('tests/atlas-account-chrome-contract.test.js')
lines = test_path.read_text(encoding='utf-8').splitlines(keepends=True)

js_version_done = False
css_version_done = False
runtime_done = False
for i, line in enumerate(lines):
    if 'Inside Atlas must load shared account chrome.' in line:
        if i == 0 or '20260916-accountchrome5' not in lines[i - 1]:
            raise SystemExit('Inside Atlas JS version proof moved')
        lines[i - 1] = lines[i - 1].replace(
            '20260916-accountchrome5',
            '20260916-accountchrome6'
        )
        js_version_done = True

    if 'Inside Atlas must load account chrome styles in the document head before hydration.' in line:
        if i == 0 or '20260916-accountchrome5' not in lines[i - 1]:
            raise SystemExit('Inside Atlas CSS version proof moved')
        lines[i - 1] = lines[i - 1].replace(
            '20260916-accountchrome5',
            '20260916-accountchrome6'
        )
        css_version_done = True

    if 'Inside Atlas pending state must keep the compact account shell instead of blanking the header.' in line:
        if i == 0:
            raise SystemExit('Inside Atlas pending proof moved')
        lines[i - 1] = '        /pendingAnonymous/,\n'
        lines[i] = "        'Inside Atlas pending state must preserve the synchronous first-paint account hint.'\n"
        runtime_done = True

if not (js_version_done and css_version_done and runtime_done):
    raise SystemExit(
        f'Proof update incomplete: js={js_version_done} css={css_version_done} runtime={runtime_done}'
    )

test = ''.join(lines)
anchor = '''    [atlas, compass, arcade].forEach((source, index) => {\n'''
extra = '''    assert.match(\n        inside,\n        /atlasAccountHint/,\n        'Inside Atlas must resolve anonymous/account first-paint geometry synchronously.'\n    );\n    assert.doesNotMatch(\n        inside,\n        /data-atlas-inside-create hidden/,\n        'Inside Atlas must not hide Create free account in its static first-paint shell.'\n    );\n    assert.match(\n        chromeCss,\n        /data-atlas-account-hint="anonymous"/,\n        'Inside Atlas account CSS must honor the synchronous anonymous first-paint hint.'\n    );\n\n'''
if test.count(anchor) != 1:
    raise SystemExit(f'Hub proof anchor: expected 1 match, found {test.count(anchor)}')
test = test.replace(anchor, extra + anchor, 1)
test_path.write_text(test, encoding='utf-8')

print('Inside Atlas anonymous first-paint account shell updated.')
