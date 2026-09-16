from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 exact match, found {count}")
    return text.replace(old, new, 1)


# 1) Compass: keep render read-only and coalesce background repaint requests.
path = Path('compass/index.html')
text = path.read_text()

text = replace_once(
    text,
    "      registerWithBridge();\n\n      const main = document.getElementById('hub-main');",
    "      const main = document.getElementById('hub-main');",
    'remove registration side effect from renderHub'
)

old_live_refresh = """    /* ================================================================
       LIVE REFRESH
       ================================================================ */

    function refresh() {
      if (!Bridge) return;
      const mode = Bridge.applyAppearanceMode(Bridge.readAppearanceMode());
      updateAppearanceButtons(mode);
      renderHub();
    }
"""

new_live_refresh = """    /* ================================================================
       LIVE REFRESH
       Background state notifications share one repaint path. Rendering is
       deliberately read-only: it must never register/write persistent state.
       ================================================================ */

    let hubRenderQueued = false;

    function requestHubRender() {
      if (!Bridge || hubRenderQueued) return;

      hubRenderQueued = true;

      window.requestAnimationFrame(() => {
        hubRenderQueued = false;
        void renderHub();
      });
    }

    window.addEventListener(
      'atlas:compass-hub-refresh-request',
      requestHubRender
    );

    function refresh() {
      if (!Bridge) return;
      const mode = Bridge.applyAppearanceMode(Bridge.readAppearanceMode());
      updateAppearanceButtons(mode);
      requestHubRender();
    }
"""

text = replace_once(
    text,
    old_live_refresh,
    new_live_refresh,
    'install canonical Compass refresh scheduler'
)

text = replace_once(
    text,
    "    function init() {\n      if (!Bridge) return;\n\n      const mode = Bridge.readAppearanceMode();",
    "    function init() {\n      if (!Bridge) return;\n\n      // Registration belongs to startup, not rendering. The registry layer is\n      // idempotent, so this is a safe fallback if its own bootstrap ran early.\n      registerWithBridge();\n\n      const mode = Bridge.readAppearanceMode();",
    'move registry registration to init'
)

path.write_text(text)


# 2) Registry: make registration storage-idempotent.
path = Path('shared/atlas-content-registry-core.js')
text = path.read_text()

anchor = """    function getCategoryTitleMap(categories) {
        return (Array.isArray(categories) ? categories : []).reduce((map, category) => {
            if (category && category.id) {
                map[category.id] = category.title || 'Compass';
            }

            return map;
        }, {});
    }
"""

helper = anchor + """

    function registryProjectionMatches(existing, next) {
        if (!existing || !next) return false;

        return Object.keys(next).every(key =>
            JSON.stringify(existing[key]) === JSON.stringify(next[key])
        );
    }
"""

text = replace_once(
    text,
    anchor,
    helper,
    'add registry projection equality helper'
)

text = replace_once(
    text,
    "        Bridge.upsertWorld(COMPASS_WORLD);\n\n        const { categories, subjects } = getCompassCatalogData();",
    "        const existingRegistry =\n            typeof Bridge.readRegistry === 'function'\n                ? Bridge.readRegistry()\n                : { worlds: {}, items: {} };\n\n        if (\n            !registryProjectionMatches(\n                existingRegistry.worlds?.[COMPASS_WORLD.registryId],\n                COMPASS_WORLD\n            )\n        ) {\n            Bridge.upsertWorld(COMPASS_WORLD);\n        }\n\n        const { categories, subjects } = getCompassCatalogData();",
    'make Compass world registration idempotent'
)

text = replace_once(
    text,
    "            validIds.add(item.registryId);\n            Bridge.upsertItem(item);",
    "            validIds.add(item.registryId);\n\n            if (\n                !registryProjectionMatches(\n                    existingRegistry.items?.[item.registryId],\n                    item\n                )\n            ) {\n                Bridge.upsertItem(item);\n            }",
    'make Compass item registration idempotent'
)

path.write_text(text)


# 3) Cloud-cache bridge: request the canonical Compass repaint path.
path = Path('shared/atlas-content-registry.js')
text = path.read_text()

old_wrapper = """    let renderQueued = false;

    function repaintCompassHub() {
        if (renderQueued) return;

        renderQueued = true;

        window.requestAnimationFrame(() => {
            renderQueued = false;

            if (typeof window.renderHub === 'function') {
                void window.renderHub();
            }
        });
    }

    window.addEventListener(
        'atlas:compass-hub-cache-refreshed',
        repaintCompassHub
    );
"""

new_wrapper = """    function requestCompassHubRefresh() {
        try {
            window.dispatchEvent(
                new CustomEvent(
                    'atlas:compass-hub-refresh-request',
                    { detail: { source: 'cloud-cache' } }
                )
            );
        } catch { }
    }

    window.addEventListener(
        'atlas:compass-hub-cache-refreshed',
        requestCompassHubRefresh
    );
"""

text = replace_once(
    text,
    old_wrapper,
    new_wrapper,
    'route cloud-cache repaint through Compass scheduler'
)

path.write_text(text)


# Shared helper for continuity authorities.
def replace_render_call(file_path, source_name):
    path = Path(file_path)
    text = path.read_text()
    text = replace_once(
        text,
        "                window.renderHub?.();",
        "                window.dispatchEvent(\n                    new CustomEvent(\n                        'atlas:compass-hub-refresh-request',\n                        { detail: { source: '" + source_name + "' } }\n                    )\n                );",
        f'route {source_name} refresh through Compass scheduler'
    )
    path.write_text(text)


# 4) Named learner continuity.
replace_render_call(
    'shared/atlas-learner-continuity-cloud-authority.js',
    'learner-continuity'
)

# 5) Shared continuity.
replace_render_call(
    'shared/atlas-shared-continuity-cloud-authority.js',
    'shared-continuity'
)

# 6) Shared Session Subjects continuity.
path = Path('shared/atlas-shared-session-subjects-cloud-authority.js')
text = path.read_text()
text = replace_once(
    text,
    """                if (typeof window.renderHub === 'function') {
                    void window.renderHub();
                }
""",
    """                window.dispatchEvent(
                    new CustomEvent(
                        'atlas:compass-hub-refresh-request',
                        { detail: { source: 'shared-session-subjects' } }
                    )
                );
""",
    'route Shared Session Subjects refresh through Compass scheduler'
)
path.write_text(text)
