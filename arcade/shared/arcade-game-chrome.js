/* ============================================================
   ARCADE GAME CHROME
   Shared landing-screen navigation and utility controls for
   standalone Arcade games.

   Owns:
   - contextual return control
   - session control
   - appearance control
   - session and appearance display updates

   Does not own game layout, content, progress, or internal headers.
   ============================================================ */

(function () {
  'use strict';

  const VALID_SOURCES = ['atlas', 'compass', 'arcade'];
  const mountedRoots = new WeakSet();

  function getBridge() {
    return window.AtlasBridge || null;
  }

  function getLaunchSource() {
    const source = new URLSearchParams(window.location.search).get('from');

    return VALID_SOURCES.includes(source)
      ? source
      : 'arcade';
  }

  function getReturnDestination() {
    const destinations = {
      atlas: {
        label: 'Back to Atlas',
        url: new URL('../../index.html', window.location.href).href
      },

      compass: {
        label: 'Back to Compass',
        url: new URL('../../compass/index.html', window.location.href).href
      },

      arcade: {
        label: 'Back to Arcade',
        url: new URL('../index.html', window.location.href).href
      }
    };

    return destinations[getLaunchSource()];
  }

  function getRoot(root) {
    if (root instanceof HTMLElement) {
      return root;
    }

    if (typeof root === 'string') {
      return document.querySelector(root);
    }

    return null;
  }

  function getSessionDisplayName() {
    const Bridge = getBridge();

    if (!Bridge) {
      return 'Shared';
    }

    const session = Bridge.readActiveSession();

    if (
      window.AtlasSessionPanel &&
      typeof window.AtlasSessionPanel.getSessionDisplayName === 'function'
    ) {
      return window.AtlasSessionPanel.getSessionDisplayName(session);
    }

    return session && session.name
      ? session.name
      : 'Shared';
  }

  function updateSessionDisplay(root) {
    const name = root.querySelector(
      '.arcade-game-chrome-session-name'
    );

    const button = root.querySelector(
      '.arcade-game-chrome-session'
    );

    const display = getSessionDisplayName();

    if (name) {
      name.textContent = display;
    }

    if (button) {
      button.setAttribute(
        'aria-label',
        'Open session panel. Working with ' + display
      );

      button.title = 'Working with ' + display;
    }
  }

  function updateAppearanceDisplay(root) {
    const Bridge = getBridge();

    const button = root.querySelector(
      '.arcade-game-chrome-appearance'
    );

    if (!button) {
      return;
    }

    const mode = Bridge
      ? Bridge.readAppearanceMode()
      : document.documentElement.dataset.theme || 'light';

    const label = mode === 'night'
      ? 'Switch to day mode'
      : 'Switch to night mode';

    button.setAttribute('aria-label', label);
    button.title = label;
  }

  function returnToSource() {
    window.location.href = getReturnDestination().url;
  }

  function openSessionPanel(trigger) {
    if (
      window.AtlasSessionPanel &&
      typeof window.AtlasSessionPanel.open === 'function'
    ) {
      window.AtlasSessionPanel.open(trigger);
    }
  }

  function toggleAppearance(root) {
    const Bridge = getBridge();

    if (!Bridge) {
      return;
    }

    const html = document.documentElement;
    const current = Bridge.readAppearanceMode();
    const next = current === 'night' ? 'light' : 'night';

    html.classList.add('theme-changing');
    Bridge.setAppearanceMode(next);
    html.dataset.theme = next;
    updateAppearanceDisplay(root);

    window.setTimeout(function () {
      html.classList.remove('theme-changing');
    }, 320);
  }

  function getMarkup() {
    const destination = getReturnDestination();

    return `
      <div class="arcade-game-chrome">
        <button
          class="arcade-game-chrome-back"
          type="button"
          aria-label="${destination.label}"
          title="${destination.label}"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7.5 2L3.5 6l4 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <span class="arcade-game-chrome-back-label">
            ${destination.label}
          </span>
        </button>

        <div class="arcade-game-chrome-actions">
          <button
            class="arcade-game-chrome-icon-btn arcade-game-chrome-appearance"
            type="button"
            aria-label="Toggle appearance"
          >
            <svg
              class="arcade-game-chrome-appearance-icon arcade-game-chrome-appearance-icon--moon"
              width="13"
              height="13"
              viewBox="0 0 17 17"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M14.5 10.2A7 7 0 0 1 6.8 2.5a7 7 0 1 0 7.7 7.7Z"
                stroke="currentColor"
                stroke-width="1.35"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            <svg
              class="arcade-game-chrome-appearance-icon arcade-game-chrome-appearance-icon--sun"
              width="13"
              height="13"
              viewBox="0 0 17 17"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="8.5"
                cy="8.5"
                r="3"
                stroke="currentColor"
                stroke-width="1.35"
              />

              <path
                d="M8.5 1.5v2M8.5 13.5v2M1.5 8.5h2M13.5 8.5h2M3.7 3.7l1.4 1.4M11.9 11.9l1.4 1.4M11.9 5.1l1.4-1.4M3.7 13.3l1.4-1.4"
                stroke="currentColor"
                stroke-width="1.35"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <button
            class="arcade-game-chrome-session"
            type="button"
            aria-label="Open session panel"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="6"
                cy="4"
                r="2.2"
                stroke="currentColor"
                stroke-width="1.2"
              />

              <path
                d="M1.5 10.5c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
              />
            </svg>

            <span class="arcade-game-chrome-session-name">
              Shared
            </span>
          </button>
        </div>
      </div>
    `;
  }

  function mountLanding(options) {
    const settings = options || {};
    const root = getRoot(settings.root);

    if (!root) {
      console.warn(
        'ArcadeGameChrome could not find its landing root.'
      );
      return;
    }

    if (mountedRoots.has(root)) {
      return;
    }

    const host = document.createElement('div');
    host.innerHTML = getMarkup().trim();

    const chrome = host.firstElementChild;

    if (!chrome) {
      return;
    }

    root.insertBefore(chrome, root.firstChild);
    mountedRoots.add(root);

    const backButton = chrome.querySelector(
      '.arcade-game-chrome-back'
    );

    const sessionButton = chrome.querySelector(
      '.arcade-game-chrome-session'
    );

    const appearanceButton = chrome.querySelector(
      '.arcade-game-chrome-appearance'
    );

    if (backButton) {
      backButton.addEventListener('click', returnToSource);
    }

    if (sessionButton) {
      sessionButton.addEventListener('click', function () {
        openSessionPanel(sessionButton);
      });
    }

    if (appearanceButton) {
      appearanceButton.addEventListener('click', function () {
        toggleAppearance(chrome);
      });
    }

    updateSessionDisplay(chrome);
    updateAppearanceDisplay(chrome);

    window.addEventListener('atlas:session-change', function () {
      updateSessionDisplay(chrome);
    });

    window.addEventListener('atlas:appearance-change', function () {
      updateAppearanceDisplay(chrome);
    });
  }

  window.ArcadeGameChrome = Object.freeze({
    mountLanding
  });
})();
