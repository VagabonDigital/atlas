from pathlib import Path
import re
V='20260916-accountchrome5'
p=Path('tutors/index.html'); s=p.read_text()
s=re.sub(r'(atlas-account-chrome\.css\?v=)20260916-accountchrome\d+',rf'\g<1>{V}',s,count=1)
s=re.sub(r'(atlas-account-chrome\.js\?v=)20260916-accountchrome\d+',rf'\g<1>{V}',s,count=1)
old='''<button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch theme" title="Switch theme"><span\n          aria-hidden="true">☼</span></button>'''
new='''<button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch theme" title="Switch theme">\n        <svg class="appearance-icon appearance-icon--moon" width="16" height="16" viewBox="0 0 17 17" fill="none" aria-hidden="true"><path d="M14.5 10.2A7 7 0 0 1 6.8 2.5a7 7 0 1 0 7.7 7.7Z" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>\n        <svg class="appearance-icon appearance-icon--sun" width="16" height="16" viewBox="0 0 17 17" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="3" stroke="currentColor" stroke-width="1.35"/><path d="M8.5 1.5v2M8.5 13.5v2M1.5 8.5h2M13.5 8.5h2M3.7 3.7l1.4 1.4M11.9 11.9l1.4 1.4M11.9 5.1l1.4-1.4M3.7 13.3l1.4-1.4" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg>\n      </button>'''
if old not in s: raise SystemExit('theme markup moved')
s=s.replace(old,new,1)
a='''      box-shadow: var(--shadow-sm);\n    }\n\n    .hero {'''
b='''      box-shadow: var(--shadow-sm);\n      position: relative;\n    }\n\n    .theme-toggle .appearance-icon { position: absolute; top: 50%; left: 50%; display: block; pointer-events: none; transform: translate(-50%, -50%); transition: opacity var(--motion); }\n    html[data-theme="light"] .theme-toggle .appearance-icon--moon { opacity: 1; }\n    html[data-theme="light"] .theme-toggle .appearance-icon--sun { opacity: 0; }\n    html[data-theme="dark"] .theme-toggle .appearance-icon--moon { opacity: 0; }\n    html[data-theme="dark"] .theme-toggle .appearance-icon--sun { opacity: 1; }\n\n    .hero {'''
if a not in s: raise SystemExit('theme css moved')
s=s.replace(a,b,1)
s=s.replace('''      var themeToggle = document.getElementById("themeToggle");\n      var themeIcon = themeToggle.querySelector("span");\n      var stored = null;''','''      var themeToggle = document.getElementById("themeToggle");\n      var stored = null;''',1)
s=s.replace('''      function syncTheme() { var dark = root.dataset.theme === "dark"; themeIcon.textContent = dark ? "☾" : "☼"; themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode"); }''','''      function syncTheme() { var dark = root.dataset.theme === "dark"; themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode"); }''',1)
p.write_text(s)

p=Path('tests/atlas-account-chrome-contract.test.js'); t=p.read_text(); t=re.sub(r'20260916-accountchrome[34]',V,t)
a='''    assert.match(\n        chrome,\n        /MutationObserver/,\n        'Account chrome must mount as soon as the header mount point exists, not wait for DOMContentLoaded.'\n    );'''
e='''    [atlas, compass, arcade].forEach((source, index) => {\n        assert.match(source, /data-atlas-account-control="desktop"[\\s\\S]*?data-account-state="pending"/, `Product hub ${index + 1} must ship a desktop first-paint account shell.`);\n        assert.match(source, /data-atlas-account-control="mobile"[\\s\\S]*?data-account-state="pending"/, `Product hub ${index + 1} must ship a mobile first-paint account shell.`);\n        assert.match(source, /atlasAccountHint[\\s\\S]*?sb-jnhjfpagectprceswvqn-auth-token/, `Product hub ${index + 1} must resolve first-paint account geometry synchronously.`);\n    });\n    assert.match(chrome, /if \\(presentation\\.kind === 'pending'\\) return;/, 'Account chrome must preserve the first-paint shell while access resolves.');\n    assert.match(inside, /appearance-icon appearance-icon--moon[\\s\\S]*?appearance-icon appearance-icon--sun/, 'Inside Atlas must use deterministic SVG appearance icons.');\n\n'''
if a not in t: raise SystemExit('test anchor moved')
t=t.replace(a,e+a,1); p.write_text(t)
print('inside theme + proof patched')