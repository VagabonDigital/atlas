from pathlib import Path

path = Path("compass/index.html")
text = path.read_text()

def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exact match once, found {count}")
    text = text.replace(old, new, 1)

replace_once(
    "      --dialog-border: 0 solid transparent;",
    "      --dialog-border: 1px solid transparent;",
    "day dialog geometry"
)
replace_once(
    "      --library-border-width: 1.5px;",
    "      --library-border-width: 1px;",
    "night library geometry"
)
replace_once(
    "      --card-border-width: 1.5px;",
    "      --card-border-width: 1px;",
    "night card geometry"
)

root_motion = "      --hub-theme-motion: 280ms cubic-bezier(0.4, 0, 0.2, 1);"
replace_once(
    root_motion,
    root_motion + """
      --subject-art-hover-opacity: 0.16;
      --subject-art-preview-opacity: 0.18;
      --subject-art-touch-opacity: 0.14;
      --appearance-moon-opacity: 1;
      --appearance-sun-opacity: 0;""",
    "day theme paint variables"
)

night_anchor = "      --dialog-border: 1px solid var(--border-faint);"
replace_once(
    night_anchor,
    night_anchor + """
      --subject-art-hover-opacity: 0.23;
      --subject-art-preview-opacity: 0.25;
      --subject-art-touch-opacity: 0.22;
      --appearance-moon-opacity: 0;
      --appearance-sun-opacity: 1;""",
    "night theme paint variables"
)

theme_start = """    html.theme-changing body::before,
    html.theme-changing body::after {
"""
desktop_heading = "       DESKTOP SPINE AND WORLD NAVIGATION\n"
start_count = text.count(theme_start)
heading_count = text.count(desktop_heading)
if start_count != 1 or heading_count != 1:
    raise SystemExit(f"theme motion markers: start={start_count}, heading={heading_count}")
start = text.index(theme_start)
heading = text.index(desktop_heading, start)
end = text.rfind("    /*", start, heading)
if end < 0:
    raise SystemExit("theme motion marker: desktop comment opener not found")
theme_motion = """    /* ============================================================
       THEME MOTION
       Bridge owns theme state; the Hub owns surface interpolation.
       Theme changes are paint-only: geometry never participates.
       ============================================================ */

    html.theme-changing,
    html.theme-changing body,
    html.theme-changing body::before,
    html.theme-changing body::after,
    html.theme-changing body *,
    html.theme-changing body *::before,
    html.theme-changing body *::after {
      transition:
        background-color var(--hub-theme-motion),
        color var(--hub-theme-motion),
        border-color var(--hub-theme-motion),
        box-shadow var(--hub-theme-motion),
        opacity var(--hub-theme-motion),
        fill var(--hub-theme-motion),
        stroke var(--hub-theme-motion),
        outline-color var(--hub-theme-motion),
        text-decoration-color var(--hub-theme-motion),
        caret-color var(--hub-theme-motion);
    }

    html.theme-changing .drawer {
      transition:
        transform var(--hub-theme-motion),
        background-color var(--hub-theme-motion),
        color var(--hub-theme-motion),
        border-color var(--hub-theme-motion),
        box-shadow var(--hub-theme-motion),
        opacity var(--hub-theme-motion);
    }

"""
text = text[:start] + theme_motion + text[end:]

replace_once(
    """    .spine-btn {
      display: inline-flex;
""",
    """    .spine-btn {
      position: relative;
      display: inline-flex;
""",
    "appearance button positioning"
)

replace_once(
    """    .appearance-icon {
      display: block;
      flex-shrink: 0;
    }

    .appearance-icon--sun {
      display: none;
    }

    html[data-theme="night"] .appearance-icon--moon {
      display: none;
    }

    html[data-theme="night"] .appearance-icon--sun {
      display: block;
    }
""",
    """    .appearance-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      display: block;
      flex-shrink: 0;
      pointer-events: none;
      transform: translate(-50%, -50%);
    }

    .appearance-icon--moon {
      opacity: var(--appearance-moon-opacity);
    }

    .appearance-icon--sun {
      opacity: var(--appearance-sun-opacity);
    }
""",
    "appearance icon crossfade"
)

replace_once(
    """    .drawer-appearance-btn {
      width: 44px;
""",
    """    .drawer-appearance-btn {
      position: relative;
      width: 44px;
""",
    "drawer appearance button positioning"
)

replace_once(
    """    .subject-card:is(:hover, :focus-visible) .subject-card-art {
      opacity: 0.16;
      transform: translate3d(0, 0, 0) scale(1);
    }

    html[data-theme="night"]
    .subject-card:is(:hover, :focus-visible)
    .subject-card-art {
      opacity: 0.23;
    }
""",
    """    .subject-card:is(:hover, :focus-visible) .subject-card-art {
      opacity: var(--subject-art-hover-opacity);
      transform: translate3d(0, 0, 0) scale(1);
    }
""",
    "desktop artwork theme opacity"
)

replace_once(
    """    .subject-artwork-preview-card .subject-card-art {
      opacity: 0.18;
      transform: none;
    }

    html[data-theme="night"]
    .subject-artwork-preview-card
    .subject-card-art {
      opacity: 0.25;
    }
""",
    """    .subject-artwork-preview-card .subject-card-art {
      opacity: var(--subject-art-preview-opacity);
      transform: none;
    }
""",
    "studio artwork theme opacity"
)

replace_once(
    """      .subject-card--has-art .subject-card-art {
        display: flex;
        opacity: 0.14;
        transform: none;
      }

      html[data-theme="night"]
      .subject-card--has-art
      .subject-card-art {
        opacity: 0.22;
      }

      .subject-artwork-preview-card .subject-card-art {
        opacity: 0.18;
      }

      html[data-theme="night"]
      .subject-artwork-preview-card
      .subject-card-art {
        opacity: 0.25;
      }
""",
    """      .subject-card--has-art .subject-card-art {
        display: flex;
        opacity: var(--subject-art-touch-opacity);
        transform: none;
      }

      .subject-artwork-preview-card .subject-card-art {
        opacity: var(--subject-art-preview-opacity);
      }
""",
    "touch artwork theme opacity"
)

path.write_text(text)
