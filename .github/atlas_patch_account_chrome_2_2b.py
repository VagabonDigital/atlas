from pathlib import Path


def replace_once(path, old, new, label):
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one match in {path}, found {count}')
    file_path.write_text(text.replace(old, new, 1), encoding='utf-8')


# 1) Hub registry: cache-bust the 2.2A-capable access bootstrap and load
# shared account chrome only on hub surfaces.
registry_path = Path('shared/atlas-content-registry.js')
registry = registry_path.read_text(encoding='utf-8')

old_access_src = """        const src =
            '/shared/atlas-access-bootstrap.js?v=20260916-access1';
"""
new_access_src = """        const src =
            '/shared/atlas-access-bootstrap.js?v=20260916-access2';
"""
if registry.count(old_access_src) != 1:
    raise SystemExit(
        f'content registry access bootstrap source: expected one match, found {registry.count(old_access_src)}'
    )
registry = registry.replace(old_access_src, new_access_src, 1)

chrome_anchor = """        script.setAttribute(
            'data-atlas-access-bootstrap',
            'true'
        );
        document.head.appendChild(script);
    }

    function writeCloudAuthorityScripts() {
"""
chrome_insert = """        script.setAttribute(
            'data-atlas-access-bootstrap',
            'true'
        );
        document.head.appendChild(script);
    }

    function shouldLoadAtlasAccountChrome() {
        const surface = String(
            document.body?.dataset?.atlasSurface || ''
        );

        if (surface === 'hub') return true;

        const path = String(
            window.location.pathname || '/'
        ).replace(/index\\.html$/, '');

        return (
            path === '/' ||
            path === '/compass/' ||
            path === '/arcade/'
        );
    }

    function writeAtlasAccountChromeScript() {
        if (
            !shouldLoadAtlasAccountChrome() ||
            window.AtlasAccountChrome ||
            document.querySelector(
                'script[data-atlas-account-chrome]'
            )
        ) {
            return;
        }

        const src =
            '/shared/atlas-account-chrome.js?v=20260916-accountchrome1';

        if (document.readyState === 'loading') {
            document.write(
                `<script data-atlas-account-chrome=\"true\" src=\"${src}\"><\\/script>`
            );
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.setAttribute(
            'data-atlas-account-chrome',
            'true'
        );
        document.head.appendChild(script);
    }

    function writeCloudAuthorityScripts() {
"""
if registry.count(chrome_anchor) != 1:
    raise SystemExit(
        f'content registry chrome insertion anchor: expected one match, found {registry.count(chrome_anchor)}'
    )
registry = registry.replace(chrome_anchor, chrome_insert, 1)

bottom_anchor = """    writeAtlasRootRuntimeScript();
    writeCloudAuthorityScripts();
    writeAtlasAccessBootstrapScript();
    installTutorCreateHandoff();
"""
bottom_replacement = """    writeAtlasRootRuntimeScript();
    writeCloudAuthorityScripts();
    writeAtlasAccessBootstrapScript();
    writeAtlasAccountChromeScript();
    installTutorCreateHandoff();
"""
if registry.count(bottom_anchor) != 1:
    raise SystemExit(
        f'content registry loader invocation: expected one match, found {registry.count(bottom_anchor)}'
    )
registry = registry.replace(bottom_anchor, bottom_replacement, 1)
registry_path.write_text(registry, encoding='utf-8')


# 2) Inside Atlas: identify the surface, provide the explicit header mount,
# and load canonical access + shared account chrome.
inside_path = Path('tutors/index.html')
inside = inside_path.read_text(encoding='utf-8')

body_old = '<body id="top">'
body_new = '<body id="top" data-atlas-world="atlas" data-atlas-surface="inside-atlas">'
if inside.count(body_old) != 1:
    raise SystemExit(
        f'Inside Atlas body marker: expected one match, found {inside.count(body_old)}'
    )
inside = inside.replace(body_old, body_new, 1)

header_old = """      </nav>
      <button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch theme" title="Switch theme"><span
          aria-hidden="true">☼</span></button>
"""
header_new = """      </nav>
      <div data-atlas-account-entry aria-label="Atlas account actions"></div>
      <button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch theme" title="Switch theme"><span
          aria-hidden="true">☼</span></button>
"""
if inside.count(header_old) != 1:
    raise SystemExit(
        f'Inside Atlas account-entry mount: expected one match, found {inside.count(header_old)}'
    )
inside = inside.replace(header_old, header_new, 1)

script_block = """  <script src="/shared/atlas-access-bootstrap.js?v=20260916-access2"></script>
  <script src="/shared/atlas-account-chrome.js?v=20260916-accountchrome1"></script>
"""
if 'atlas-account-chrome.js?v=20260916-accountchrome1' in inside:
    raise SystemExit('Inside Atlas already contains the Batch 2.2B account chrome script.')

body_close = '</body>'
if inside.count(body_close) != 1:
    raise SystemExit(
        f'Inside Atlas body close: expected one match, found {inside.count(body_close)}'
    )
inside = inside.replace(body_close, script_block + body_close, 1)
inside_path.write_text(inside, encoding='utf-8')


# 3) Document the completed placement contract without pulling later Stage 2
# responsibilities into this batch.
readme_path = Path('README.md')
readme = readme_path.read_text(encoding='utf-8')
readme_anchor = """Batch 2.2A establishes the shared account UI contract only. Header placement and cross-world lifecycle proof belong to Batch 2.2B; return-to-intent belongs to Batch 2.3; protected-action interception belongs to Batch 2.4. The executable foundation proof lives at `tests/atlas-account-gate-contract.test.js`.

## Browser persistence trust
"""
readme_replacement = """Batch 2.2A establishes the shared account UI contract only. Header placement and cross-world lifecycle proof belong to Batch 2.2B; return-to-intent belongs to Batch 2.3; protected-action interception belongs to Batch 2.4. The executable foundation proof lives at `tests/atlas-account-gate-contract.test.js`.

Batch 2.2B places that contract into the public product without contaminating teaching canvases. Atlas, Compass and Arcade hubs receive one shared right-side account control: anonymous tutors see **Sign in**; authenticated tutors see a compact account icon opening the shared account menu. Atlas's pilot feedback button is removed from the prime desktop header slot while the secondary mobile-drawer contact remains available. Inside Atlas exposes **Explore Atlas**, **Sign in** and **Create free account** when anonymous, collapsing to Explore Atlas plus the account control when authenticated. Subject and game surfaces receive no promotional account chrome. The executable placement/state proof lives at `tests/atlas-account-chrome-contract.test.js`.

Return-to-intent is still intentionally deferred to Batch 2.3, and capability-driven protected-action interception remains Batch 2.4.

## Browser persistence trust
"""
if readme.count(readme_anchor) != 1:
    raise SystemExit(
        f'README Batch 2.2B anchor: expected one match, found {readme.count(readme_anchor)}'
    )
readme_path.write_text(
    readme.replace(readme_anchor, readme_replacement, 1),
    encoding='utf-8'
)

print('Batch 2.2B account chrome wiring applied.')
