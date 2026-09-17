from pathlib import Path
import re

V='20260916-accountchrome5'
KEY='sb-jnhjfpagectprceswvqn-auth-token'
ICON='''<svg class="atlas-account-firstpaint-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.15" stroke="currentColor" stroke-width="1.15"/><circle cx="8" cy="6.05" r="1.95" stroke="currentColor" stroke-width="1.15"/><path d="M4.65 11.85c.52-1.72 1.8-2.68 3.35-2.68s2.83.96 3.35 2.68" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/></svg>'''
D=f'''<button class="spine-btn atlas-account-control atlas-account-control--desktop" type="button" data-atlas-account-control="desktop" data-account-state="pending" aria-haspopup="dialog" aria-expanded="false" aria-label="Atlas account" title="Atlas account" disabled><span class="atlas-account-firstpaint-sign-in">Sign in</span>{ICON}</button>'''
M=f'''<button class="mobile-header-btn atlas-account-control atlas-account-control--mobile" type="button" data-atlas-account-control="mobile" data-account-state="pending" aria-haspopup="dialog" aria-expanded="false" aria-label="Atlas account" title="Atlas account" disabled><span class="atlas-account-firstpaint-sign-in">Sign in</span>{ICON}</button>'''
H=f'''<script>(function(){{var h=false;try{{h=Boolean(localStorage.getItem('{KEY}'));}}catch(e){{}}document.documentElement.dataset.atlasAccountHint=h?'account':'anonymous';}})();</script>'''

def one(s,p,r,n):
    x,c=re.subn(p,r,s,count=1,flags=re.S)
    if c!=1: raise SystemExit(f'{n}: {c}')
    return x

def hub(path,prefix):
    p=Path(path); s=p.read_text()
    if 'data-atlas-account-chrome-styles' not in s:
        s=one(s,rf'(<link rel="stylesheet" href="{re.escape(prefix)}shared/atlas-session-panel\.css[^\"]*">)',rf'\1\n  <link rel="stylesheet" href="{prefix}shared/atlas-account-chrome.css?v={V}" data-atlas-account-chrome-styles>',path+' css')
    if 'atlasAccountHint' not in s:
        a=f'<script src="{prefix}shared/atlas-bridge.js"></script>'
        if a not in s: raise SystemExit(path+' bridge')
        s=s.replace(a,a+'\n  '+H,1)
    if 'data-atlas-account-control="desktop"' not in s:
        s=one(s,r'(<button class="spine-btn" id="spine-appearance-btn"[\s\S]*?</button>)(\s*</div>\s*</header>)',lambda m:m.group(1)+'\n      '+D+m.group(2),path+' desktop')
    if 'data-atlas-account-control="mobile"' not in s:
        s=one(s,r'(<button class="mobile-header-btn"[^>]*onclick="openDrawer\(\)"[^>]*aria-label="Menu")',M+'\n      '+r'\1',path+' mobile')
    s=re.sub(r'(atlas-content-registry\.js\?v=)20260916-accountchrome\d+',rf'\g<1>{V}',s)
    p.write_text(s)

for a,b in [('index.html','./'),('compass/index.html','../'),('arcade/index.html','../')]: hub(a,b)

p=Path('shared/atlas-account-chrome.js'); s=p.read_text()
s=re.sub(r"('/shared/atlas-account-chrome\.css\?v=)20260916-accountchrome\d+(')",rf"\g<1>{V}\2",s,count=1)
s=s.replace("button.addEventListener('click', () => handleAccountAction(button));\n        return button;","button.addEventListener('click', () => handleAccountAction(button));\n        button.dataset.accountControlReady = 'true';\n        return button;",1)
s=s.replace("button.setAttribute('aria-label', presentation.title);\n\n        if (presentation.kind === 'sign-in') {","button.setAttribute('aria-label', presentation.title);\n\n        if (presentation.kind === 'pending') return;\n\n        if (presentation.kind === 'sign-in') {",1)
s=s.replace("            mounted.push(control);\n        }\n\n        const mobileActions","            if (control.dataset.accountControlReady !== 'true') { control.addEventListener('click', () => handleAccountAction(control)); control.dataset.accountControlReady = 'true'; }\n            mounted.push(control);\n        }\n\n        const mobileActions",1)
s=s.replace("            mounted.push(control);\n        }\n\n        return mounted;","            if (control.dataset.accountControlReady !== 'true') { control.addEventListener('click', () => handleAccountAction(control)); control.dataset.accountControlReady = 'true'; }\n            mounted.push(control);\n        }\n\n        return mounted;",1)
p.write_text(s)

p=Path('shared/atlas-account-chrome.css'); s=p.read_text()
s=s.replace('.mobile-header-btn.atlas-account-control[data-account-state="sign-in"] {','.mobile-header-btn.atlas-account-control[data-account-state="sign-in"],\nhtml[data-atlas-account-hint="anonymous"] .spine-btn.atlas-account-control[data-account-state="pending"],\nhtml[data-atlas-account-hint="anonymous"] .mobile-header-btn.atlas-account-control[data-account-state="pending"] {',1)
a='.atlas-account-control span {\n    line-height: 1;\n}\n'
e='''\n.atlas-account-firstpaint-sign-in { display: none; }\n.atlas-account-firstpaint-icon { display: block; }\nhtml[data-atlas-account-hint="anonymous"] .atlas-account-control[data-account-state="pending"] .atlas-account-firstpaint-sign-in { display: inline; }\nhtml[data-atlas-account-hint="anonymous"] .atlas-account-control[data-account-state="pending"] .atlas-account-firstpaint-icon { display: none; }\n'''
if a not in s: raise SystemExit('css anchor')
s=s.replace(a,a+e,1); p.write_text(s)

p=Path('shared/atlas-content-registry.js'); s=p.read_text(); s,c=re.subn(r'(/shared/atlas-account-chrome\.js\?v=)20260916-accountchrome\d+',rf'\g<1>{V}',s,count=1)
if c!=1: raise SystemExit('registry version')
p.write_text(s)
print('hub account shells patched')