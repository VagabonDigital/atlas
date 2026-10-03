/* ============================================================
   ARCADE GAME CHROME
   Shared navigation and utility controls for standalone
   Arcade games.

   Owns:
   - contextual landing-screen return control
   - fixed in-game Arcade return control
   - landing-screen session control
   - landing-screen appearance control
   - session and appearance display updates
   - responsive slot classes for mounted in-game headers

   Does not own game content, progress, or state.
   ============================================================ */

(function () {
  'use strict';

  const VALID_SOURCES = ['atlas', 'compass', 'arcade'];
  const mountedLandingRoots = new WeakSet();
  const mountedGameRoots = new WeakSet();

  function getBridge() {
    return window.AtlasBridge || null;
  }

  function getLaunchSource() {
    const source = new URLSearchParams(window.location.search).get('from');

    return VALID_SOURCES.includes(source)
      ? source
      : 'arcade';
  }

  function getLandingReturnDestination(returnTo) {
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

    return destinations[VALID_SOURCES.includes(returnTo) ? returnTo : getLaunchSource()];
  }

  function getArcadeDestination() {
    return new URL('../index.html', window.location.href).href;
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

  function runBeforeReturn(callback) {
    if (typeof callback !== 'function') {
      return;
    }

    try {
      callback();
    } catch (error) {
      console.warn(
        'ArcadeGameChrome could not complete the pre-return callback.',
        error
      );
    }
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

  function updateGameSessionDisplay(root) {
    const display = getSessionDisplayName();

    root.querySelectorAll(
      '.arcade-game-chrome-game-session-name, ' +
      '.arcade-game-chrome-game-menu-session-name'
    ).forEach(function (name) {
      name.textContent = display;
    });

    root.querySelectorAll(
      '.arcade-game-chrome-game-session, ' +
      '.arcade-game-chrome-game-menu-session'
    ).forEach(function (button) {
      button.setAttribute(
        'aria-label',
        'Open session panel. Working with ' + display
      );

      button.title = 'Working with ' + display;
    });
  }

  function updateGameAppearanceDisplay(root) {
    const Bridge = getBridge();

    const buttons = root.querySelectorAll(
      '.arcade-game-chrome-game-appearance, ' +
      '.arcade-game-chrome-game-menu-appearance'
    );

    if (!buttons.length) {
      return;
    }

    const mode = Bridge
      ? Bridge.readAppearanceMode()
      : document.documentElement.dataset.theme || 'light';

    const label = mode === 'night'
      ? 'Switch to day mode'
      : 'Switch to night mode';

    buttons.forEach(function (button) {
      button.setAttribute('aria-label', label);
      button.title = label;

      const text = button.querySelector(
        '.arcade-game-chrome-game-menu-appearance-label'
      );

      if (text) {
        text.textContent = mode === 'night'
          ? 'Day mode'
          : 'Night mode';
      }
    });
  }

  function getDirectHeaderChild(root, target) {
    let current = target;

    while (current && current.parentElement !== root) {
      current = current.parentElement;
    }

    return current && current.parentElement === root
      ? current
      : null;
  }

  function markGameHeaderSlots(root, returnTarget, actionsTarget) {
    root.classList.add('arcade-game-chrome-host');

    const left = getDirectHeaderChild(root, returnTarget);
    const actions = getDirectHeaderChild(root, actionsTarget);

    if (left) {
      left.classList.add('arcade-game-chrome-host-left');
    }

    if (actions) {
      actions.classList.add('arcade-game-chrome-host-actions');
    }

    Array.from(root.children).forEach(function (child) {
      if (child !== left && child !== actions) {
        child.classList.add('arcade-game-chrome-host-context');
      }
    });
  }

  function closeGameMenu(root) {
    const toggle = root.querySelector(
      '.arcade-game-chrome-game-menu-toggle'
    );

    const menu = root.querySelector(
      '.arcade-game-chrome-game-menu'
    );

    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    }

    if (menu) {
      menu.hidden = true;
    }
  }

  function toggleGameMenu(root) {
    const toggle = root.querySelector(
      '.arcade-game-chrome-game-menu-toggle'
    );

    const menu = root.querySelector(
      '.arcade-game-chrome-game-menu'
    );

    if (!toggle || !menu) {
      return;
    }

    const open = menu.hidden;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
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

    const current = Bridge.readAppearanceMode();
    const next = current === 'night' ? 'light' : 'night';
    const apply = function () {
      Bridge.setAppearanceMode(next);
      updateAppearanceDisplay(root);
    };

    if (
      typeof document.startViewTransition === 'function' &&
      !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      document.startViewTransition(apply);
      return;
    }

    apply();
  }

  function getLandingMarkup(settings = {}) {
    const destination = getLandingReturnDestination(settings.returnTo);

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

  function getGameMarkup() {
    return `
      <div class="arcade-game-chrome-game-controls">
        <button
          class="arcade-game-chrome-game-return"
          type="button"
          aria-label="Back to Arcade"
          title="Back to Arcade"
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

          <span>Arcade</span>
        </button>

        <div class="arcade-game-chrome-game-actions">
          <button
            class="arcade-game-chrome-game-session arcade-game-chrome-game-direct"
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

            <span class="arcade-game-chrome-game-session-name">
              Shared
            </span>
          </button>

          <button
            class="arcade-game-chrome-game-icon-btn arcade-game-chrome-game-search arcade-game-chrome-game-direct"
            type="button"
            data-atlas-search
            aria-label="Atlas Search"
            title="Atlas Search"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="7"
                cy="7"
                r="4.5"
                stroke="currentColor"
                stroke-width="1.3"
              />

              <path
                d="M10.5 10.5l3 3"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <button
            class="arcade-game-chrome-game-icon-btn arcade-game-chrome-game-appearance arcade-game-chrome-game-direct"
            type="button"
            aria-label="Toggle appearance"
          >
            <svg
              class="arcade-game-chrome-appearance-icon arcade-game-chrome-appearance-icon--moon"
              width="15"
              height="15"
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
              width="15"
              height="15"
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
            class="arcade-game-chrome-game-icon-btn arcade-game-chrome-game-menu-toggle"
            type="button"
            aria-label="More game controls"
            title="More"
            aria-haspopup="menu"
            aria-expanded="false"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 5h11M3 8.5h11M3 12h11"
                stroke="currentColor"
                stroke-width="1.45"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <div
            class="arcade-game-chrome-game-menu"
            role="menu"
            hidden
          >
            <button
              class="arcade-game-chrome-game-menu-item arcade-game-chrome-game-menu-session"
              type="button"
              role="menuitem"
            >
              <svg
                width="15"
                height="15"
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
              <span>Session</span>
              <span class="arcade-game-chrome-game-menu-session-name">Shared</span>
            </button>

            <button
              class="arcade-game-chrome-game-menu-item arcade-game-chrome-game-menu-search"
              type="button"
              role="menuitem"
              data-atlas-search
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="4.5"
                  stroke="currentColor"
                  stroke-width="1.3"
                />
                <path
                  d="M10.5 10.5l3 3"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                />
              </svg>
              <span>Search Atlas</span>
            </button>

            <button
              class="arcade-game-chrome-game-menu-item arcade-game-chrome-game-menu-appearance"
              type="button"
              role="menuitem"
            >
              <svg
                class="arcade-game-chrome-appearance-icon arcade-game-chrome-appearance-icon--moon"
                width="15"
                height="15"
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
                width="15"
                height="15"
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
              <span class="arcade-game-chrome-game-menu-appearance-label">Night mode</span>
            </button>
          </div>
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

    if (mountedLandingRoots.has(root)) {
      return;
    }

    const host = document.createElement('div');
    host.innerHTML = getLandingMarkup(settings).trim();

    const chrome = host.firstElementChild;

    if (!chrome) {
      return;
    }

    // Opt-outs preserve the established default for existing games.
    if (settings.appearance === false) chrome.querySelector('.arcade-game-chrome-appearance')?.remove();
    if (settings.session === false) chrome.querySelector('.arcade-game-chrome-session')?.remove();
    root.insertBefore(chrome, root.firstChild);
    mountedLandingRoots.add(root);

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
      backButton.addEventListener('click', function () {
        runBeforeReturn(settings.onBeforeReturn);
        window.location.href = getLandingReturnDestination(settings.returnTo).url;
      });
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

  function mountGame(options) {
    const settings = options || {};
    const root = getRoot(settings.root);

    if (!root) {
      console.warn(
        'ArcadeGameChrome could not find its in-game header root.'
      );
      return;
    }

    if (mountedGameRoots.has(root)) {
      return;
    }

    const host = document.createElement('div');
    host.innerHTML = getGameMarkup().trim();

    const controls = host.firstElementChild;

    if (!controls) {
      return;
    }

    // Remove disabled controls from both direct and compact presentations.
    ['session', 'search', 'appearance'].forEach(function (control) {
      if (settings[control] === false) {
        controls.querySelectorAll(
          '.arcade-game-chrome-game-' + control + ', ' +
          '.arcade-game-chrome-game-menu-' + control
        ).forEach(function (node) { node.remove(); });
      }
    });
    if (!controls.querySelector('.arcade-game-chrome-game-menu-item')) {
      controls.querySelector('.arcade-game-chrome-game-actions')?.remove();
    }

    const returnTarget = getRoot(settings.returnRoot) || root;
    const actionsTarget = getRoot(settings.actionsRoot) || root;

    const returnButton = controls.querySelector(
      '.arcade-game-chrome-game-return'
    );

    const actions = controls.querySelector(
      '.arcade-game-chrome-game-actions'
    );

    if (returnButton) {
      returnTarget.insertBefore(
        returnButton,
        returnTarget.firstChild
      );
    }

    if (actions) {
      actionsTarget.appendChild(actions);
    }

    markGameHeaderSlots(root, returnTarget, actionsTarget);
    mountedGameRoots.add(root);

    const sessionButtons = actions
      ? actions.querySelectorAll(
          '.arcade-game-chrome-game-session, ' +
          '.arcade-game-chrome-game-menu-session'
        )
      : [];

    const appearanceButtons = actions
      ? actions.querySelectorAll(
          '.arcade-game-chrome-game-appearance, ' +
          '.arcade-game-chrome-game-menu-appearance'
        )
      : [];

    const menuToggle = actions && actions.querySelector(
      '.arcade-game-chrome-game-menu-toggle'
    );

    const menuSearch = actions && actions.querySelector(
      '.arcade-game-chrome-game-menu-search'
    );

    if (returnButton) {
      returnButton.addEventListener('click', function () {
        runBeforeReturn(settings.onBeforeReturn);
        window.location.href = getArcadeDestination();
      });
    }

    sessionButtons.forEach(function (sessionButton) {
      sessionButton.addEventListener('click', function () {
        closeGameMenu(root);
        openSessionPanel(sessionButton);
      });
    });

    appearanceButtons.forEach(function (appearanceButton) {
      appearanceButton.addEventListener('click', function () {
        toggleAppearance(root);
        updateGameAppearanceDisplay(root);
        closeGameMenu(root);
      });
    });

    if (menuToggle) {
      menuToggle.addEventListener('click', function (event) {
        event.stopPropagation();
        toggleGameMenu(root);
      });
    }

    if (menuSearch) {
      menuSearch.addEventListener('click', function () {
        closeGameMenu(root);
      });
    }

    document.addEventListener('click', function (event) {
      if (!actions || actions.contains(event.target)) {
        return;
      }

      closeGameMenu(root);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeGameMenu(root);
      }
    });

    updateGameSessionDisplay(root);
    updateGameAppearanceDisplay(root);

    window.addEventListener('atlas:session-change', function () {
      updateGameSessionDisplay(root);
    });

    window.addEventListener('atlas:appearance-change', function () {
      updateGameAppearanceDisplay(root);
    });
  }

  window.ArcadeGameChrome = Object.freeze({
    mountLanding,
    mountGame
  });
})();
