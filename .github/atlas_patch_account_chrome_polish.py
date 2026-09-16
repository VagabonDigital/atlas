from pathlib import Path
import re


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one match, found {count}')
    return text.replace(old, new, 1)


def regex_once(text, pattern, replacement, label, flags=0):
    next_text, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f'{label}: expected one regex match, found {count}')
    return next_text


# ---------------------------------------------------------------------------
# 1) Shared account chrome: native hub geometry, early mount, safe gate-style
#    readiness, toggle semantics, and a distinct account glyph.
# ---------------------------------------------------------------------------
chrome_path = Path('shared/atlas-account-chrome.js')
chrome = chrome_path.read_text(encoding='utf-8')

chrome = replace_once(
    chrome,
    "    const STYLE_HREF =\n        '/shared/atlas-account-chrome.css?v=20260916-accountchrome1';\n    const GATE_SRC =\n        '/shared/atlas-account-gate.js?v=20260916-accountgate2';\n",
    "    const STYLE_HREF =\n        '/shared/atlas-account-chrome.css?v=20260916-accountchrome2';\n    const GATE_STYLE_HREF =\n        '/shared/atlas-account-gate.css?v=20260916-accountgate2';\n    const GATE_SRC =\n        '/shared/atlas-account-gate.js?v=20260916-accountgate3';\n",
    'account chrome runtime versions'
)

chrome = replace_once(
    chrome,
    "    let gatePromise = null;\n    let accessUnsubscribe = null;\n",
    "    let gatePromise = null;\n    let gateStylePromise = null;\n    let accessUnsubscribe = null;\n",
    'account chrome gate style promise'
)

chrome = regex_once(
    chrome,
    r"    const ACCOUNT_ICON = `.*?`;\n\n    const SIGN_IN_ICON = `.*?`;",
    """    const ACCOUNT_ICON = `
        <svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" aria-hidden=\"true\">
            <circle cx=\"8\" cy=\"8\" r=\"6.15\" stroke=\"currentColor\" stroke-width=\"1.15\" />
            <circle cx=\"8\" cy=\"6.05\" r=\"1.95\" stroke=\"currentColor\" stroke-width=\"1.15\" />
            <path d=\"M4.65 11.85c.52-1.72 1.8-2.68 3.35-2.68s2.83.96 3.35 2.68\" stroke=\"currentColor\" stroke-width=\"1.15\" stroke-linecap=\"round\" />
        </svg>
    `;""",
    'account chrome account glyph',
    re.S
)

old_existing_and_gate = """    function existingScriptFor(src) {
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

    function ensureGate() {
        if (window.AtlasAccountGate) {
            return Promise.resolve(window.AtlasAccountGate);
        }

        if (gatePromise) return gatePromise;

        gatePromise = new Promise((resolve, reject) => {
            const existing = existingScriptFor(GATE_SRC);

            function complete() {
                if (window.AtlasAccountGate) {
                    resolve(window.AtlasAccountGate);
                } else {
                    gatePromise = null;
                    reject(new Error('Atlas account UI could not initialize.'));
                }
            }

            if (existing) {
                existing.addEventListener('load', complete, { once: true });
                existing.addEventListener('error', reject, { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = GATE_SRC;
            script.async = false;
            script.setAttribute('data-atlas-account-gate-runtime', 'true');
            script.addEventListener('load', complete, { once: true });
            script.addEventListener('error', () => {
                gatePromise = null;
                reject(new Error('Atlas account UI could not load.'));
            }, { once: true });
            document.head.appendChild(script);
        });

        return gatePromise;
    }
"""

new_existing_and_gate = """    function existingScriptFor(src) {
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

    function ensureGateStyles() {
        if (gateStylePromise) return gateStylePromise;

        gateStylePromise = new Promise((resolve, reject) => {
            let link = document.querySelector(
                'link[data-atlas-account-gate-styles]'
            );

            function complete() {
                resolve(true);
            }

            function fail() {
                gateStylePromise = null;
                reject(new Error('Atlas account styles could not load.'));
            }

            if (link) {
                try {
                    if (link.sheet) {
                        complete();
                        return;
                    }
                } catch { }

                link.addEventListener('load', complete, { once: true });
                link.addEventListener('error', fail, { once: true });
                return;
            }

            link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = GATE_STYLE_HREF;
            link.setAttribute('data-atlas-account-gate-styles', 'true');
            link.addEventListener('load', complete, { once: true });
            link.addEventListener('error', fail, { once: true });
            document.head.appendChild(link);
        });

        return gateStylePromise;
    }

    function ensureGate() {
        if (window.AtlasAccountGate) {
            return ensureGateStyles().then(() => window.AtlasAccountGate);
        }

        if (gatePromise) return gatePromise;

        gatePromise = ensureGateStyles().then(() => new Promise((resolve, reject) => {
            const existing = existingScriptFor(GATE_SRC);

            function complete() {
                if (window.AtlasAccountGate) {
                    resolve(window.AtlasAccountGate);
                } else {
                    gatePromise = null;
                    reject(new Error('Atlas account UI could not initialize.'));
                }
            }

            if (existing) {
                existing.addEventListener('load', complete, { once: true });
                existing.addEventListener('error', reject, { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = GATE_SRC;
            script.async = false;
            script.setAttribute('data-atlas-account-gate-runtime', 'true');
            script.addEventListener('load', complete, { once: true });
            script.addEventListener('error', () => {
                gatePromise = null;
                reject(new Error('Atlas account UI could not load.'));
            }, { once: true });
            document.head.appendChild(script);
        })).catch(error => {
            gatePromise = null;
            throw error;
        });

        return gatePromise;
    }
"""
chrome = replace_once(
    chrome,
    old_existing_and_gate,
    new_existing_and_gate,
    'account chrome gate loader'
)

chrome = replace_once(
    chrome,
    """    function createHubControl(variant) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `atlas-account-control atlas-account-control--${variant}`;
""",
    """    function createHubControl(variant) {
        const button = document.createElement('button');
        const nativeClass = variant === 'mobile'
            ? 'mobile-header-btn'
            : 'spine-btn';

        button.type = 'button';
        button.className = `${nativeClass} atlas-account-control atlas-account-control--${variant}`;
""",
    'account chrome native hub class'
)

chrome = replace_once(
    chrome,
    "            button.innerHTML = `${SIGN_IN_ICON}<span>Sign in</span>`;\n",
    "            button.innerHTML = '<span>Sign in</span>';\n",
    'account chrome sign-in label'
)

chrome = replace_once(
    chrome,
    """        container.dataset.accountState = presentation.kind;
        document.body?.setAttribute('data-atlas-account-ready', 'true');
""",
    """        container.dataset.accountState = presentation.kind;

        if (presentation.kind === 'pending') {
            document.body?.removeAttribute('data-atlas-account-ready');
        } else {
            document.body?.setAttribute('data-atlas-account-ready', 'true');
        }
""",
    'inside Atlas ready state'
)

old_handlers = """    async function handleSignIn(trigger) {
        try {
            const Gate = await ensureGate();
            await Gate.openSignIn(trigger);
        } catch (error) {
            console.error('[AtlasAccountChrome] sign-in UI failed:', error);
        }
    }

    async function handleCreateAccount(trigger) {
        try {
            const Gate = await ensureGate();
            await Gate.openCreateAccount(trigger);
        } catch (error) {
            console.error('[AtlasAccountChrome] create-account UI failed:', error);
        }
    }

    async function handleAccountAction(trigger) {
        const presentation = getPresentation(
            window.AtlasAccess?.getState?.() || null
        );

        if (presentation.kind === 'account') {
            try {
                const Gate = await ensureGate();
                await Gate.openAccountMenu(trigger);
            } catch (error) {
                console.error('[AtlasAccountChrome] account menu failed:', error);
            }
            return;
        }

        if (presentation.kind === 'sign-in') {
            await handleSignIn(trigger);
        }
    }
"""

new_handlers = """    async function handleSignIn(trigger) {
        try {
            const Gate = await ensureGate();
            const gateState = Gate.getState?.() || {};

            if (gateState.gateOpen && gateState.gateMode === 'sign-in') {
                Gate.close();
                return;
            }

            await Gate.openSignIn(trigger);
        } catch (error) {
            console.error('[AtlasAccountChrome] sign-in UI failed:', error);
        }
    }

    async function handleCreateAccount(trigger) {
        try {
            const Gate = await ensureGate();
            const gateState = Gate.getState?.() || {};

            if (gateState.gateOpen && gateState.gateMode === 'create') {
                Gate.close();
                return;
            }

            await Gate.openCreateAccount(trigger);
        } catch (error) {
            console.error('[AtlasAccountChrome] create-account UI failed:', error);
        }
    }

    async function handleAccountAction(trigger) {
        const presentation = getPresentation(
            window.AtlasAccess?.getState?.() || null
        );

        if (presentation.kind === 'account') {
            try {
                const Gate = await ensureGate();
                const gateState = Gate.getState?.() || {};

                if (gateState.menuOpen) {
                    Gate.closeAccountMenu();
                    return;
                }

                if (gateState.gateOpen) {
                    Gate.close();
                    return;
                }

                await Gate.openAccountMenu(trigger);
            } catch (error) {
                console.error('[AtlasAccountChrome] account menu failed:', error);
            }
            return;
        }

        if (presentation.kind === 'sign-in') {
            await handleSignIn(trigger);
        }
    }
"""
chrome = replace_once(
    chrome,
    old_handlers,
    new_handlers,
    'account chrome toggle handlers'
)

old_boot = """    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener(
                'DOMContentLoaded',
                () => initialize(),
                { once: true }
            );
        } else {
            initialize();
        }
    }
"""

new_boot = """    function surfaceMountReady() {
        const body = document.body;
        if (!body) return false;

        if (body.dataset.atlasSurface === 'hub') {
            return Boolean(
                document.querySelector('.spine-actions') ||
                document.querySelector('.mobile-header-actions')
            );
        }

        if (body.dataset.atlasSurface === 'inside-atlas') {
            return Boolean(
                document.querySelector('[data-atlas-account-entry]')
            );
        }

        return true;
    }

    function startWhenMountReady() {
        if (surfaceMountReady()) {
            initialize();
            return;
        }

        if (typeof MutationObserver !== 'function') {
            document.addEventListener(
                'DOMContentLoaded',
                () => initialize(),
                { once: true }
            );
            return;
        }

        const observer = new MutationObserver(() => {
            if (!surfaceMountReady()) return;
            observer.disconnect();
            initialize();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    if (typeof document !== 'undefined') {
        startWhenMountReady();
    }
"""
chrome = replace_once(chrome, old_boot, new_boot, 'account chrome early mount')
chrome_path.write_text(chrome, encoding='utf-8')


# ---------------------------------------------------------------------------
# 2) Shared account chrome CSS: let hub-native classes own 38x38 / 12px
#    geometry, keep Sign in as a text variant, and enforce hidden semantics.
# ---------------------------------------------------------------------------
css_path = Path('shared/atlas-account-chrome.css')
css = css_path.read_text(encoding='utf-8')

css = regex_once(
    css,
    r"\.atlas-account-control,\n\.atlas-inside-account-action \{.*?\.mobile-header-actions \.atlas-account-control\[data-account-state=\"pending\"\] \{\n    width: 36px;\n    min-width: 36px;\n\}\n",
    """.atlas-account-control,
.atlas-inside-account-action {
    font: inherit;
}

.atlas-account-control {
    flex-shrink: 0;
}

.spine-btn.atlas-account-control,
.mobile-header-btn.atlas-account-control {
    padding: 0;
}

.spine-btn.atlas-account-control[data-account-state=\"sign-in\"],
.mobile-header-btn.atlas-account-control[data-account-state=\"sign-in\"] {
    width: auto;
    min-width: 38px;
    padding-inline: 0.72rem;
    gap: 0.34rem;
    white-space: nowrap;
    color: var(--control-text, var(--text-body, #504b43));
}

.mobile-header-btn.atlas-account-control[data-account-state=\"sign-in\"] {
    color: var(--text-muted, #7b7469);
}

.atlas-account-control:disabled {
    opacity: 0.52;
    cursor: wait;
}

.atlas-account-control svg {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
}

.atlas-account-control span {
    line-height: 1;
}
""",
    'account chrome hub CSS',
    re.S
)

css = replace_once(
    css,
    """.atlas-inside-account-action {
    min-height: 36px;
    display: inline-flex;
""",
    """.atlas-inside-account-action {
    min-height: 36px;
    display: inline-flex;
""",
    'inside Atlas action anchor'
)

hidden_rule = """
.atlas-inside-account-action[hidden] {
    display: none !important;
}
"""
anchor = """.atlas-inside-account-action:disabled {
    opacity: 0.5;
    cursor: wait;
    transform: none;
}
"""
if hidden_rule.strip() not in css:
    css = replace_once(
        css,
        anchor,
        anchor + hidden_rule,
        'inside Atlas hidden rule'
    )
css_path.write_text(css, encoding='utf-8')


# ---------------------------------------------------------------------------
# 3) Account gate: cache-bust the polished stylesheet and make all programmatic
#    focus restoration/opening scroll-safe.
# ---------------------------------------------------------------------------
gate_path = Path('shared/atlas-account-gate.js')
gate = gate_path.read_text(encoding='utf-8')

gate = replace_once(
    gate,
    "        '/shared/atlas-account-gate.css?v=20260916-accountgate1';",
    "        '/shared/atlas-account-gate.css?v=20260916-accountgate2';",
    'account gate CSS version'
)

gate = replace_once(
    gate,
    """    function snapshot() {
        return { ...state };
    }

""",
    """    function snapshot() {
        return { ...state };
    }

    function focusWithoutScroll(target) {
        if (!target || typeof target.focus !== 'function') return;

        try {
            target.focus({ preventScroll: true });
        } catch {
            target.focus();
        }
    }

""",
    'account gate focus helper'
)

gate = gate.replace("            target?.focus?.();", "            focusWithoutScroll(target);")
gate = gate.replace("            anchor?.focus?.();", "            focusWithoutScroll(anchor);")
gate = gate.replace(
    "            accountMenu.querySelector('a, button')?.focus?.();",
    "            focusWithoutScroll(accountMenu.querySelector('a, button'));"
)
gate = gate.replace(
    "            target?.focus?.();\n        }, 0);",
    "            focusWithoutScroll(target);\n        }, 0);"
)
gate = gate.replace(
    "            gateLayer.querySelector('[data-account-message-close]')?.focus?.();",
    "            focusWithoutScroll(\n                gateLayer.querySelector('[data-account-message-close]')\n            );"
)

if 'focus({ preventScroll: true })' not in gate:
    raise SystemExit('account gate focus helper was not installed')

gate_path.write_text(gate, encoding='utf-8')


# ---------------------------------------------------------------------------
# 4) Cache rollout: hubs must fetch the polished registry/runtime; Inside Atlas
#    must fetch the polished chrome runtime directly.
# ---------------------------------------------------------------------------
registry_path = Path('shared/atlas-content-registry.js')
registry = registry_path.read_text(encoding='utf-8')
registry = replace_once(
    registry,
    "'/shared/atlas-account-chrome.js?v=20260916-accountchrome1'",
    "'/shared/atlas-account-chrome.js?v=20260916-accountchrome2'",
    'registry account chrome version'
)
registry_path.write_text(registry, encoding='utf-8')

for hub_path in ['index.html', 'compass/index.html', 'arcade/index.html']:
    path = Path(hub_path)
    text = path.read_text(encoding='utf-8')
    text = replace_once(
        text,
        'atlas-content-registry.js?v=20260916-accountchrome1',
        'atlas-content-registry.js?v=20260916-accountchrome2',
        f'{hub_path} registry cache version'
    )
    path.write_text(text, encoding='utf-8')

inside_path = Path('tutors/index.html')
inside = inside_path.read_text(encoding='utf-8')
inside = replace_once(
    inside,
    'atlas-account-chrome.js?v=20260916-accountchrome1',
    'atlas-account-chrome.js?v=20260916-accountchrome2',
    'Inside Atlas account chrome version'
)
inside_path.write_text(inside, encoding='utf-8')


# ---------------------------------------------------------------------------
# 5) Extend the permanent account-chrome proof around the polish regressions.
# ---------------------------------------------------------------------------
test_path = Path('tests/atlas-account-chrome-contract.test.js')
test = test_path.read_text(encoding='utf-8')

test = replace_once(
    test,
    "    const inside = read(INSIDE_PATH);\n    const atlas = read('index.html');\n",
    "    const inside = read(INSIDE_PATH);\n    const chromeCss = read('shared/atlas-account-chrome.css');\n    const gate = read('shared/atlas-account-gate.js');\n    const atlas = read('index.html');\n",
    'account chrome proof support files'
)

test = test.replace('atlas-content-registry\\.js\\?v=20260916-accountchrome1', 'atlas-content-registry\\.js\\?v=20260916-accountchrome2')
test = test.replace('atlas-account-chrome\\.js\\?v=20260916-accountchrome1', 'atlas-account-chrome\\.js\\?v=20260916-accountchrome2')

proof_anchor = """    assert.match(
        inside,
        /atlas-account-chrome\\.js\\?v=20260916-accountchrome2/,
        'Inside Atlas must load shared account chrome.'
    );
"""
proof_extra = proof_anchor + """
    assert.match(
        chrome,
        /variant === 'mobile'[\\s\\S]*?'mobile-header-btn'[\\s\\S]*?'spine-btn'/,
        'Hub account controls must inherit the hubs’ native utility-button classes.'
    );
    assert.match(
        chrome,
        /MutationObserver/,
        'Account chrome must mount as soon as the header mount point exists, not wait for DOMContentLoaded.'
    );
    assert.match(
        chrome,
        /if \(gateState\.menuOpen\)[\\s\\S]*?Gate\.closeAccountMenu\(\)/,
        'The signed-in account control must toggle its menu closed on a second click.'
    );
    assert.match(
        chrome,
        /ensureGateStyles/,
        'Account chrome must wait for gate/menu styles before opening account UI.'
    );
    assert.match(
        chromeCss,
        /\.atlas-inside-account-action\[hidden\][\\s\\S]*?display: none !important/,
        'Inside Atlas guest/account controls must obey hidden state without duplicates.'
    );
    assert.match(
        gate,
        /focus\(\{ preventScroll: true \}\)/,
        'Account gate/menu focus must not scroll the underlying page.'
    );
"""
test = replace_once(
    test,
    proof_anchor,
    proof_extra,
    'account chrome polish proof assertions'
)
test_path.write_text(test, encoding='utf-8')

print('Account chrome polish patch applied.')
