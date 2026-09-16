from pathlib import Path

bridge_path = Path('shared/atlas-bridge.js')
compass_path = Path('compass/index.html')

bridge = bridge_path.read_text()
compass = compass_path.read_text()


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 exact match, found {count}')
    return text.replace(old, new, 1)

bridge = replace_once(
    bridge,
    "    const APPEARANCE_TRANSITION_MS = 280;\n    let appearanceTransitionTimer = null;",
    "    const APPEARANCE_TRANSITION_MS = 280;\n    const APPEARANCE_TRANSITION_CLEANUP_BUFFER_MS = 100;\n    let appearanceTransitionTimer = null;",
    'appearance cleanup buffer constant'
)

bridge = replace_once(
    bridge,
    "        appearanceTransitionTimer = setTimeout(() => {\n            root.classList.remove('theme-changing');\n            appearanceTransitionTimer = null;\n        }, APPEARANCE_TRANSITION_MS);",
    "        // Keep the transition contract alive for a few compositor frames\n        // after the visible 280ms motion completes. Removing the class on\n        // the exact final frame can force a style reset before the last paint.\n        appearanceTransitionTimer = setTimeout(() => {\n            root.classList.remove('theme-changing');\n            appearanceTransitionTimer = null;\n        }, APPEARANCE_TRANSITION_MS + APPEARANCE_TRANSITION_CLEANUP_BUFFER_MS);",
    'appearance cleanup timing'
)

old_compass = '''    html.theme-changing :where(\n      .subject-library *,\n      .owned-subject-dialog-panel *,\n      .subject-artwork-studio *\n    ) {\n      transition:\n        color var(--hub-theme-motion),\n        border-color var(--hub-theme-motion),\n        opacity var(--hub-theme-motion),\n        fill var(--hub-theme-motion),\n        stroke var(--hub-theme-motion);\n    }\n'''

new_compass = '''    html.theme-changing :where(\n      .subject-library-title,\n      .subject-library-empty-note,\n      .subject-library-create-btn,\n      .subject-card-title,\n      .subject-card-version-badge,\n      .subject-card-hook,\n      .subject-card-progress-label,\n      .subject-card-menu-meta,\n      .subject-card-menu button\n    ) {\n      transition:\n        background-color var(--hub-theme-motion),\n        color var(--hub-theme-motion),\n        border-color var(--hub-theme-motion),\n        opacity var(--hub-theme-motion);\n    }\n\n    html.theme-changing :where(\n      .owned-subject-dialog-panel *,\n      .subject-artwork-studio *\n    ) {\n      transition:\n        color var(--hub-theme-motion),\n        border-color var(--hub-theme-motion),\n        opacity var(--hub-theme-motion),\n        fill var(--hub-theme-motion),\n        stroke var(--hub-theme-motion);\n    }\n'''

compass = replace_once(
    compass,
    old_compass,
    new_compass,
    'Compass library descendant transition scope'
)

bridge_path.write_text(bridge)
compass_path.write_text(compass)
