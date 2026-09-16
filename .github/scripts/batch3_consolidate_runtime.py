from pathlib import Path
import hashlib
import re
import subprocess

ROOT = Path('.')
RUNTIME_VERSION = '20260916-runtime3'


def read(path):
    return Path(path).read_text(encoding='utf-8')


def write(path, text):
    Path(path).write_text(text, encoding='utf-8')


def git_blob_sha(path):
    return subprocess.check_output(['git', 'hash-object', path], text=True).strip()


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one literal match, found {count}')
    return text.replace(old, new, 1)


def sub_once(text, pattern, repl, label, flags=re.S):
    new, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one regex match, found {count}')
    return new


# ---------------------------------------------------------------------------
# Preflight: refuse to consolidate if the runtime changed underneath this pass.
# ---------------------------------------------------------------------------
expected = {
    'shared/atlas-content-registry.js': '4bc097d535cb04468af7b1134a454d6d10bb0d46',
    'shared/atlas-content-registry-core.js': '64f7c228c9427df487cf58f61884caa9ee0a9633',
    'shared/atlas-session-panel.js': 'e24d81c1a1d52658ba1adfd785a2834f068d2ada',
    'shared/atlas-session-panel-core.js': 'f376b15f516bc3ad9c799f134e5ff2f0547178bc',
    'shared/atlas-tutor-content-cloud-authority.js': '507a291d8b62195217760869653b5e7f1a2bb0a7',
    'shared/atlas-tutor-content-cloud-authority-core.js': '60b915e82e5628d75b1a8fc0cbe0b170d30d51f2',
    'shared/atlas-tutor-content-cloud-sync.js': 'd75ec930fcbe829f72a02d1df4c91d031de0a3dd',
    'shared/atlas-learner-sessions-cloud-authority.js': '96aa2c704902c284319d95912937c52fb32ff1cc',
    'shared/atlas-original-curation-cloud-authority.js': '011aefa1022a2345601ff463547dd373029aa3c7',
    'shared/atlas-original-curation.js': '3896efc62fb11fb82ce129da8d5b5190b7b88d75',
    'compass/index.html': 'ef81d73c4b6701677bcdca882cba1821b9486552',
}

for path, sha in expected.items():
    if not Path(path).exists():
        raise RuntimeError(f'Batch 3 preflight missing expected file: {path}')
    actual = git_blob_sha(path)
    if actual != sha:
        raise RuntimeError(f'Batch 3 preflight changed file: {path}\nexpected {sha}\nactual   {actual}')


# ---------------------------------------------------------------------------
# 1) Content registry: promote the proven core to the canonical file and fold
# the cloud-cache refresh adapter directly into it. No nested core loader.
# ---------------------------------------------------------------------------
registry_core_path = Path('shared/atlas-content-registry-core.js')
registry = read(registry_core_path)
registry = registry.replace('20260915-root2', RUNTIME_VERSION)
registry = registry.replace('20260915-production2', RUNTIME_VERSION)
registry = registry.replace('20260915-performance2', RUNTIME_VERSION)

registry_marker = '''    window.AtlasContentRegistry = {
        registerAll,
        registerCompass
    };'''
registry_replacement = '''    function requestCompassHubRefresh(source = 'content-registry') {
        try {
            window.dispatchEvent(
                new CustomEvent(
                    'atlas:compass-hub-refresh-request',
                    { detail: { source } }
                )
            );
        } catch { }
    }

    window.addEventListener(
        'atlas:compass-hub-cache-refreshed',
        () => requestCompassHubRefresh('cloud-cache')
    );

    window.AtlasContentRegistry = {
        registerAll,
        registerCompass,
        requestCompassHubRefresh
    };'''
registry = replace_once(
    registry,
    registry_marker,
    registry_replacement,
    'content registry canonical refresh boundary'
)
write('shared/atlas-content-registry.js', registry)
registry_core_path.unlink()


# ---------------------------------------------------------------------------
# 2) Session panel: promote the core to the canonical file, then fold the live
# learner refresh integration into the same file. Background refresh requests
# use the canonical Compass scheduler rather than calling renderHub directly.
# ---------------------------------------------------------------------------
session_core_path = Path('shared/atlas-session-panel-core.js')
session_panel = read(session_core_path).replace(
    '20260915-learner1',
    RUNTIME_VERSION
)

session_live_integration = r'''

/* ============================================================
   ATLAS SESSION PANEL — LIVE LEARNER CLOUD REFRESH
   Account-owned learners refresh when a tab becomes active again. Active
   learner selection remains tab-local. Compass repainting is requested
   through the single coalesced hub refresh boundary.
   ============================================================ */
(function () {
    'use strict';

    let learnerRefreshPromise = null;
    let lastRefreshAt = 0;

    function requestCompassHubRefresh() {
        try {
            window.dispatchEvent(
                new CustomEvent(
                    'atlas:compass-hub-refresh-request',
                    { detail: { source: 'learner-cloud' } }
                )
            );
        } catch { }
    }

    function refreshLearnersFromCloud() {
        const Authority =
            window.AtlasLearnerSessionsCloudAuthority || null;

        if (
            !Authority ||
            typeof Authority.initialize !== 'function'
        ) {
            return Promise.resolve(null);
        }

        const now = Date.now();

        if (learnerRefreshPromise) {
            return learnerRefreshPromise;
        }

        if (now - lastRefreshAt < 750) {
            return Promise.resolve(null);
        }

        lastRefreshAt = now;

        learnerRefreshPromise = Promise.resolve()
            .then(() => Authority.initialize({ force: true }))
            .then(result => {
                window.AtlasSessionPanel?.refresh?.();
                window.renderHome?.();
                requestCompassHubRefresh();
                return result;
            })
            .catch(error => {
                console.warn(
                    '[AtlasSessionPanel] Learner cloud refresh failed:',
                    error
                );
                return null;
            })
            .finally(() => {
                learnerRefreshPromise = null;
            });

        return learnerRefreshPromise;
    }

    function refreshWhenVisible() {
        if (!document.hidden) {
            void refreshLearnersFromCloud();
        }
    }

    function patchOpen() {
        const Panel = window.AtlasSessionPanel;

        if (!Panel || Panel.__atlasLearnerLiveRefreshPatched) {
            return;
        }

        const originalOpen = Panel.open;

        if (typeof originalOpen === 'function') {
            Panel.open = function (...args) {
                void refreshLearnersFromCloud();
                return originalOpen.apply(this, args);
            };
        }

        Panel.__atlasLearnerLiveRefreshPatched = true;
    }

    window.addEventListener('focus', refreshWhenVisible);
    window.addEventListener('pageshow', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    patchOpen();
})();
'''

write(
    'shared/atlas-session-panel.js',
    session_panel.rstrip() + session_live_integration
)
session_core_path.unlink()


# ---------------------------------------------------------------------------
# 3) Tutor Content: one canonical cloud authority file. Keep the proven cloud
# authority first, then its cross-browser registry projection. Remove direct
# Compass rendering from projection; it requests the canonical hub refresh.
# ---------------------------------------------------------------------------
tutor_core_path = Path('shared/atlas-tutor-content-cloud-authority-core.js')
tutor_projection_path = Path('shared/atlas-tutor-content-cloud-sync.js')
tutor_core = read(tutor_core_path)
tutor_projection = read(tutor_projection_path)

tutor_projection = sub_once(
    tutor_projection,
    r'''    function refreshVisibleSurfaces\(\) \{.*?\n    \}\n\n    async function refreshProjection''',
    '''    function refreshVisibleSurfaces() {\n        window.requestAnimationFrame(() => {\n            try {\n                window.renderHome?.();\n            } catch { }\n\n            try {\n                window.dispatchEvent(\n                    new CustomEvent(\n                        'atlas:compass-hub-refresh-request',\n                        { detail: { source: 'tutor-content' } }\n                    )\n                );\n            } catch { }\n        });\n    }\n\n    async function refreshProjection''',
    'Tutor Content canonical refresh boundary'
)

write(
    'shared/atlas-tutor-content-cloud-authority.js',
    tutor_core.rstrip() + '\n\n' + tutor_projection.lstrip()
)
tutor_core_path.unlink()
tutor_projection_path.unlink()


# ---------------------------------------------------------------------------
# 4) Make the Compass refresh scheduler the one external repaint API and make
# it awaitable so user-action modules can preserve their sequencing.
# ---------------------------------------------------------------------------
path = 'compass/index.html'
compass = read(path)
old_scheduler = '''    let hubRenderQueued = false;

    function requestHubRender() {
      if (!Bridge || hubRenderQueued) return;

      hubRenderQueued = true;

      window.requestAnimationFrame(() => {
        hubRenderQueued = false;
        void renderHub();
      });
    }
'''
new_scheduler = '''    let hubRenderQueued = false;
    let hubRenderPromise = Promise.resolve();

    function requestHubRender() {
      if (!Bridge) return Promise.resolve();
      if (hubRenderQueued) return hubRenderPromise;

      hubRenderQueued = true;

      let resolveRender;
      hubRenderPromise = new Promise(resolve => {
        resolveRender = resolve;
      });

      window.requestAnimationFrame(async () => {
        hubRenderQueued = false;

        try {
          await renderHub();
        } finally {
          resolveRender();
        }
      });

      return hubRenderPromise;
    }

    window.requestCompassHubRender = requestHubRender;
'''
compass = replace_once(
    compass,
    old_scheduler,
    new_scheduler,
    'Compass coalesced render scheduler'
)
write(path, compass)


# ---------------------------------------------------------------------------
# 5) Cloud/background authorities request Compass repaint through the boundary.
# ---------------------------------------------------------------------------
path = 'shared/atlas-learner-sessions-cloud-authority.js'
text = read(path)
old = '''        window.requestAnimationFrame(() => {
            if (
                typeof window.renderHub ===
                'function'
            ) {
                void window.renderHub();
            }
        });'''
new = '''        window.requestAnimationFrame(() => {
            try {
                window.dispatchEvent(
                    new CustomEvent(
                        'atlas:compass-hub-refresh-request',
                        { detail: { source: 'learner-cloud' } }
                    )
                );
            } catch { }
        });'''
text = replace_once(text, old, new, 'learner cloud repaint boundary')
write(path, text)

path = 'shared/atlas-original-curation-cloud-authority.js'
text = read(path)
old = '''    function refreshCompass() {
        window.requestAnimationFrame(() => {
            if (typeof window.renderHub === 'function') {
                void window.renderHub();
            }
        });
    }'''
new = '''    function refreshCompass() {
        window.requestAnimationFrame(() => {
            try {
                window.dispatchEvent(
                    new CustomEvent(
                        'atlas:compass-hub-refresh-request',
                        { detail: { source: 'original-curation-cloud' } }
                    )
                );
            } catch { }
        });
    }'''
text = replace_once(text, old, new, 'curation cloud repaint boundary')
write(path, text)


# ---------------------------------------------------------------------------
# 6) External Compass user-action integration also uses the awaitable scheduler
# rather than owning a second rendering path.
# ---------------------------------------------------------------------------
path = 'shared/atlas-original-curation.js'
text = read(path)
count = text.count('            await window.renderHub();')
if count != 5:
    raise RuntimeError(f'Expected 5 direct awaited curation hub renders, found {count}')
text = text.replace(
    '            await window.renderHub();',
    '            await (window.requestCompassHubRender?.() || Promise.resolve());'
)
text = replace_once(
    text,
    '        Promise.resolve(window.renderHub())',
    '        Promise.resolve(window.requestCompassHubRender?.())',
    'initial curation hub render boundary'
)
write(path, text)


# ---------------------------------------------------------------------------
# 7) Canonical runtime references get one cache-bust generation. Do not touch
# prose/error messages or content structure.
# ---------------------------------------------------------------------------
reference_files = [
    'compass/shared/atlas-original-entry.js',
    'compass/subject/index.html',
    'compass/index.html',
    'index.html',
    'arcade/index.html',
    'arcade/would-you-rather/index.html',
    'arcade/truth-trap/index.html',
    'arcade/tomorrow-got-weird/index.html',
    'arcade/shared-plan-under-pressure/index.html',
]

for rel in reference_files:
    text = read(rel)
    text = re.sub(
        r'atlas-content-registry\.js(?:\?v=[A-Za-z0-9._-]+)?',
        f'atlas-content-registry.js?v={RUNTIME_VERSION}',
        text
    )
    text = re.sub(
        r'atlas-session-panel\.js(?:\?v=[A-Za-z0-9._-]+)?',
        f'atlas-session-panel.js?v={RUNTIME_VERSION}',
        text
    )
    write(rel, text)

# Canonical registry dynamically loads the Tutor Content authority.
path = 'shared/atlas-content-registry.js'
text = read(path)
text = re.sub(
    r'atlas-tutor-content-cloud-authority\.js(?:\?v=[A-Za-z0-9._-]+)?',
    f'atlas-tutor-content-cloud-authority.js?v={RUNTIME_VERSION}',
    text
)
write(path, text)


# ---------------------------------------------------------------------------
# 8) Document the final runtime organization.
# ---------------------------------------------------------------------------
path = 'README.md'
text = read(path)
addition = '''\n\n## Runtime organization\n\nShared production modules use canonical single-entry files rather than wrapper/core/sync chains. `atlas-content-registry.js`, `atlas-session-panel.js`, and `atlas-tutor-content-cloud-authority.js` each own their complete runtime behavior. Compass background and cross-module repaint requests flow through the coalesced `atlas:compass-hub-refresh-request` boundary; rendering itself stays read-only.\n'''
if '## Runtime organization' not in text:
    text = text.rstrip() + addition
write(path, text)


# ---------------------------------------------------------------------------
# Final static invariants before the workflow is allowed to commit.
# ---------------------------------------------------------------------------
for obsolete in (
    'shared/atlas-content-registry-core.js',
    'shared/atlas-session-panel-core.js',
    'shared/atlas-tutor-content-cloud-authority-core.js',
    'shared/atlas-tutor-content-cloud-sync.js',
):
    if Path(obsolete).exists():
        raise RuntimeError(f'Obsolete runtime layer still exists: {obsolete}')

for path in ROOT.rglob('*'):
    if not path.is_file() or '.git' in path.parts:
        continue
    if path.as_posix().startswith('.github/'):
        continue
    try:
        content = path.read_text(encoding='utf-8')
    except (UnicodeDecodeError, OSError):
        continue

    for forbidden in (
        'atlas-content-registry-core.js',
        'atlas-session-panel-core.js',
        'atlas-tutor-content-cloud-authority-core.js',
        'atlas-tutor-content-cloud-sync.js',
    ):
        if forbidden in content:
            raise RuntimeError(f'Obsolete runtime reference remains in {path}: {forbidden}')

shared_direct = []
for path in Path('shared').glob('*.js'):
    content = path.read_text(encoding='utf-8')
    if re.search(r'window\.renderHub\s*\(', content):
        shared_direct.append(path.as_posix())

if shared_direct:
    raise RuntimeError(
        'Shared runtime still owns direct Compass render calls:\n' +
        '\n'.join(shared_direct)
    )

print('Batch 3 runtime consolidation prepared successfully.')
