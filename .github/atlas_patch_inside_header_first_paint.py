from pathlib import Path


def replace_once(path, old, new, label):
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one match in {path}, found {count}')
    file_path.write_text(text.replace(old, new, 1), encoding='utf-8')


# 1) Load account chrome CSS in the head so the header can never expose raw
#    auth markup before the shared stylesheet arrives.
replace_once(
    'tutors/index.html',
    '''    rel="stylesheet">\n\n  <style>''',
    '''    rel="stylesheet">\n  <link rel="stylesheet" href="/shared/atlas-account-chrome.css?v=20260916-accountchrome4"\n    data-atlas-account-chrome-styles>\n\n  <style>''',
    'Inside Atlas early account stylesheet'
)

# 2) Give Inside Atlas a real first-paint account shell. It matches the signed-in
#    geometry (Explore Atlas + account circle), which is stable for returning
#    tutors and can expand naturally into Sign in/Create for anonymous visitors.
old_mount = '''      <div data-atlas-account-entry aria-label="Atlas account actions"></div>'''
new_mount = '''      <div class="atlas-inside-account-entry" data-atlas-account-entry data-account-state="pending"\n        aria-label="Atlas account actions">\n        <a class="atlas-inside-account-action atlas-inside-account-explore" href="/">Explore Atlas</a>\n        <button class="atlas-inside-account-action atlas-inside-account-sign-in" type="button"\n          data-atlas-inside-sign-in hidden>Sign in</button>\n        <button class="atlas-inside-account-action atlas-inside-account-create" type="button"\n          data-atlas-inside-create hidden>\n          <span class="atlas-account-create-label-full">Create free account</span>\n          <span class="atlas-account-create-label-short">Create account</span>\n        </button>\n        <button class="atlas-inside-account-action atlas-inside-account-icon" type="button"\n          data-atlas-inside-account aria-haspopup="dialog" aria-expanded="false" aria-label="Atlas account"\n          title="Atlas account">\n          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">\n            <circle cx="8" cy="8" r="6.15" stroke="currentColor" stroke-width="1.15" />\n            <circle cx="8" cy="6.05" r="1.95" stroke="currentColor" stroke-width="1.15" />\n            <path d="M4.65 11.85c.52-1.72 1.8-2.68 3.35-2.68s2.83.96 3.35 2.68" stroke="currentColor"\n              stroke-width="1.15" stroke-linecap="round" />\n          </svg>\n        </button>\n      </div>'''
replace_once('tutors/index.html', old_mount, new_mount, 'Inside Atlas static account shell')

# 3) Inside Atlas should use the new chrome runtime. Hubs remain on their existing
#    cache key because this JS change is Inside-Atlas-specific.
replace_once(
    'tutors/index.html',
    '/shared/atlas-account-chrome.js?v=20260916-accountchrome3',
    '/shared/atlas-account-chrome.js?v=20260916-accountchrome4',
    'Inside Atlas account chrome cache key'
)

# 4) Shared chrome must hydrate a pre-rendered shell instead of replacing it.
chrome_path = Path('shared/atlas-account-chrome.js')
chrome = chrome_path.read_text(encoding='utf-8')
chrome = chrome.replace(
    "'/shared/atlas-account-chrome.css?v=20260916-accountchrome3'",
    "'/shared/atlas-account-chrome.css?v=20260916-accountchrome4'",
    1
)

old_create_start = '''    function createInsideAtlasEntry(container) {\n        if (!container || container.dataset.accountEntryReady === 'true') {\n            return;\n        }\n\n        container.classList.add('atlas-inside-account-entry');\n        container.innerHTML = `'''
new_create_start = '''    function createInsideAtlasEntry(container) {\n        if (!container) return;\n\n        container.classList.add('atlas-inside-account-entry');\n\n        if (!container.querySelector('[data-atlas-inside-account]')) {\n            container.innerHTML = `'''
if chrome.count(old_create_start) != 1:
    raise SystemExit(f'Inside Atlas hydration start: expected one match, found {chrome.count(old_create_start)}')
chrome = chrome.replace(old_create_start, new_create_start, 1)

old_template_end = '''            </button>\n        `;\n\n        container.querySelector('[data-atlas-inside-sign-in]')'''
new_template_end = '''            </button>\n        `;\n        }\n\n        if (container.dataset.accountEntryReady === 'true') return;\n\n        container.querySelector('[data-atlas-inside-sign-in]')'''
if chrome.count(old_template_end) != 1:
    raise SystemExit(f'Inside Atlas hydration template end: expected one match, found {chrome.count(old_template_end)}')
chrome = chrome.replace(old_template_end, new_template_end, 1)

# 5) Pending Inside Atlas state is now the compact account shell rather than a
#    hidden auth block. This removes the blank middle phase and preserves header
#    geometry for signed-in tutors.
old_render = '''        if (signIn) {\n            signIn.hidden = isAccount;\n            signIn.disabled = isPending;\n        }\n\n        if (create) {\n            create.hidden = isAccount;\n            create.disabled = isPending;\n        }\n\n        if (account) {\n            account.hidden = !isAccount;\n            account.disabled = false;\n        }\n\n        container.dataset.accountState = presentation.kind;\n\n        if (presentation.kind === 'pending') {\n            document.body?.removeAttribute('data-atlas-account-ready');\n        } else {\n            document.body?.setAttribute('data-atlas-account-ready', 'true');\n        }'''
new_render = '''        if (signIn) {\n            signIn.hidden = isAccount || isPending;\n            signIn.disabled = false;\n        }\n\n        if (create) {\n            create.hidden = isAccount || isPending;\n            create.disabled = false;\n        }\n\n        if (account) {\n            account.hidden = presentation.kind === 'sign-in';\n            account.disabled = false;\n            account.title = isPending\n                ? 'Checking Atlas account'\n                : 'Atlas account';\n            account.setAttribute(\n                'aria-label',\n                isPending ? 'Checking Atlas account' : 'Atlas account'\n            );\n        }\n\n        container.dataset.accountState = presentation.kind;\n        document.body?.setAttribute('data-atlas-account-ready', 'true');'''
if chrome.count(old_render) != 1:
    raise SystemExit(f'Inside Atlas pending render: expected one match, found {chrome.count(old_render)}')
chrome = chrome.replace(old_render, new_render, 1)
chrome_path.write_text(chrome, encoding='utf-8')

# 6) Remove the old rule that deliberately blanked the entire account area while
#    access resolved. The static shell now owns that first-paint state.
replace_once(
    'shared/atlas-account-chrome.css',
    '''body[data-atlas-surface="inside-atlas"]:not([data-atlas-account-ready="true"])\n[data-atlas-account-entry] {\n    visibility: hidden;\n}\n\n''',
    '',
    'Inside Atlas pending visibility rule'
)

# 7) Permanent proof: preserve hub cache expectations, but require the new
#    Inside Atlas first-paint contract and runtime version.
test_path = Path('tests/atlas-account-chrome-contract.test.js')
test = test_path.read_text(encoding='utf-8')
old_inside_version = '''        /atlas-account-chrome\\.js\\?v=20260916-accountchrome3/,\n        'Inside Atlas must load shared account chrome.'\n    );'''
new_inside_version = '''        /atlas-account-chrome\\.js\\?v=20260916-accountchrome4/,\n        'Inside Atlas must load shared account chrome.'\n    );\n    assert.match(\n        inside,\n        /atlas-account-chrome\\.css\\?v=20260916-accountchrome4[\\s\\S]*?data-atlas-account-chrome-styles/,\n        'Inside Atlas must load account chrome styles in the document head before hydration.'\n    );\n    assert.match(\n        inside,\n        /data-atlas-account-entry data-account-state="pending"[\\s\\S]*?atlas-inside-account-explore[\\s\\S]*?data-atlas-inside-account/,\n        'Inside Atlas must ship a compact first-paint account shell in HTML.'\n    );'''
if test.count(old_inside_version) != 1:
    raise SystemExit(f'Inside Atlas test version anchor: expected one match, found {test.count(old_inside_version)}')
test = test.replace(old_inside_version, new_inside_version, 1)

anchor = '''    assert.match(\n        chrome,\n        /MutationObserver/,\n        'Account chrome must mount as soon as the header mount point exists, not wait for DOMContentLoaded.'\n    );'''
extra = '''    assert.match(\n        chrome,\n        /if \(!container\\.querySelector\\('\[data-atlas-inside-account\]'\)\)/,\n        'Inside Atlas hydration must preserve a server-rendered first-paint account shell.'\n    );\n    assert.match(\n        chrome,\n        /signIn\\.hidden = isAccount \\|\\| isPending[\\s\\S]*?account\\.hidden = presentation\\.kind === 'sign-in'/,\n        'Inside Atlas pending state must keep the compact account shell instead of blanking the header.'\n    );\n\n'''
if test.count(anchor) != 1:
    raise SystemExit(f'Inside Atlas test hydration anchor: expected one match, found {test.count(anchor)}')
test = test.replace(anchor, extra + anchor, 1)
test_path.write_text(test, encoding='utf-8')

print('Inside Atlas first-paint header stabilization applied.')
