from pathlib import Path

path = Path("compass/index.html")
text = path.read_text()

old = '''    /* ============================================================
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
'''

new = '''    /* ============================================================
       THEME MOTION
       Bridge owns theme state; the Hub owns surface interpolation.
       Theme changes are paint-only: geometry never participates.
       Keep expensive paint transitions on meaningful surfaces only.
       ============================================================ */

    html.theme-changing,
    html.theme-changing body,
    html.theme-changing body::before,
    html.theme-changing body::after,
    html.theme-changing .spine,
    html.theme-changing .spine-mark,
    html.theme-changing .spine-mark span,
    html.theme-changing .spine-worlds,
    html.theme-changing .spine-world-btn,
    html.theme-changing .spine-world-icon,
    html.theme-changing .spine-session-pill,
    html.theme-changing .spine-session-pill .pill-name,
    html.theme-changing .spine-btn,
    html.theme-changing .appearance-icon,
    html.theme-changing .mobile-header,
    html.theme-changing .mobile-header-mark,
    html.theme-changing .mobile-header-mark span,
    html.theme-changing .mobile-header-btn,
    html.theme-changing .mobile-session-pill,
    html.theme-changing .mobile-session-pill span,
    html.theme-changing .drawer-header,
    html.theme-changing .drawer-footer,
    html.theme-changing .drawer-title,
    html.theme-changing .drawer-title span,
    html.theme-changing .drawer-close,
    html.theme-changing .drawer-nav-label,
    html.theme-changing .drawer-nav-item,
    html.theme-changing .drawer-session-btn,
    html.theme-changing .drawer-appearance-btn,
    html.theme-changing .hub-intro,
    html.theme-changing .hub-title,
    html.theme-changing .hub-desc,
    html.theme-changing .subject-library,
    html.theme-changing .subject-library-header,
    html.theme-changing .subject-library-title,
    html.theme-changing .subject-card,
    html.theme-changing .subject-card-art,
    html.theme-changing .subject-card-manage-btn,
    html.theme-changing .subject-card-menu,
    html.theme-changing .subject-card-progress-track,
    html.theme-changing .subject-card-progress-fill,
    html.theme-changing .btn-launch,
    html.theme-changing .empty-library,
    html.theme-changing .bridge-error,
    html.theme-changing .btn-primary,
    html.theme-changing .btn-ghost,
    html.theme-changing .hub-toast,
    html.theme-changing .owned-subject-dialog-panel,
    html.theme-changing .subject-artwork-studio,
    html.theme-changing .subject-artwork-studio-preview,
    html.theme-changing .subject-artwork-studio-actions {
      transition:
        background-color var(--hub-theme-motion),
        color var(--hub-theme-motion),
        border-color var(--hub-theme-motion),
        box-shadow var(--hub-theme-motion),
        opacity var(--hub-theme-motion),
        fill var(--hub-theme-motion),
        stroke var(--hub-theme-motion);
    }

    html.theme-changing :where(
      .subject-library *,
      .owned-subject-dialog-panel *,
      .subject-artwork-studio *
    ) {
      transition:
        color var(--hub-theme-motion),
        border-color var(--hub-theme-motion),
        opacity var(--hub-theme-motion),
        fill var(--hub-theme-motion),
        stroke var(--hub-theme-motion);
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
'''

count = text.count(old)
if count != 1:
    raise SystemExit(f"theme motion block: expected 1 exact match, found {count}")

path.write_text(text.replace(old, new, 1))
