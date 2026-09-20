/* ============================================================
   ATLAS LEGAL APPEARANCE
   Lightweight appearance bridge for public legal documents.

   Shares Atlas's canonical appearance storage contract without loading
   teaching/session runtime that legal pages do not need.
   ============================================================ */

(function () {
  'use strict';

  const KEYS = Object.freeze({
    sessions: 'atlas::sessions',
    activeSessionId: 'atlas::activeSessionId',
    appearance: 'atlas::appearanceMode',
    appearanceBySession: 'atlas::appearanceBySession'
  });

  const DEFAULT_SESSION_ID = 'default';
  const TRANSITION_MS = 280;
  const CLEANUP_BUFFER_MS = 100;
  let transitionTimer = null;

  function readJson(storage, key, fallback) {
    try {
      const value = storage.getItem(key);
      return value == null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function activeSessionId() {
    let storedId = '';

    try {
      storedId = String(
        sessionStorage.getItem(KEYS.activeSessionId) || ''
      ).trim();
    } catch { }

    const sessions = readJson(
      localStorage,
      KEYS.sessions,
      []
    );

    if (
      storedId &&
      Array.isArray(sessions) &&
      sessions.some(session =>
        String(session?.id || '').trim() === storedId
      )
    ) {
      return storedId;
    }

    return DEFAULT_SESSION_ID;
  }

  function readMode() {
    const sessionId = activeSessionId();
    const modes = readJson(
      localStorage,
      KEYS.appearanceBySession,
      {}
    );

    if (
      modes &&
      typeof modes === 'object' &&
      !Array.isArray(modes) &&
      (modes[sessionId] === 'light' ||
        modes[sessionId] === 'night')
    ) {
      return modes[sessionId];
    }

    try {
      return localStorage.getItem(KEYS.appearance) === 'night'
        ? 'night'
        : 'light';
    } catch {
      return 'light';
    }
  }

  function applyMode(mode) {
    const normalized = mode === 'night'
      ? 'night'
      : 'light';

    document.documentElement.dataset.theme =
      normalized;

    document.documentElement.style.colorScheme =
      normalized === 'night' ? 'dark' : 'light';

    updateControl(normalized);
    return normalized;
  }

  function beginTransition() {
    const root = document.documentElement;

    root.classList.remove('theme-changing');
    void root.offsetWidth;
    root.classList.add('theme-changing');

    if (transitionTimer !== null) {
      window.clearTimeout(transitionTimer);
    }

    transitionTimer = window.setTimeout(() => {
      root.classList.remove('theme-changing');
      transitionTimer = null;
    }, TRANSITION_MS + CLEANUP_BUFFER_MS);
  }

  function writeMode(mode) {
    const normalized = mode === 'night'
      ? 'night'
      : 'light';
    const sessionId = activeSessionId();
    const modes = readJson(
      localStorage,
      KEYS.appearanceBySession,
      {}
    );
    const nextModes =
      modes &&
      typeof modes === 'object' &&
      !Array.isArray(modes)
        ? { ...modes }
        : {};

    nextModes[sessionId] = normalized;

    try {
      localStorage.setItem(
        KEYS.appearanceBySession,
        JSON.stringify(nextModes)
      );
    } catch { }

    return normalized;
  }

  function updateControl(mode) {
    const button = document.querySelector(
      '[data-legal-appearance]'
    );

    if (!button) return;

    const label = mode === 'night'
      ? 'Switch to day mode'
      : 'Switch to night mode';

    button.setAttribute('aria-label', label);
    button.title = label;
  }

  function toggle() {
    const previous = readMode();
    const next = previous === 'night'
      ? 'light'
      : 'night';

    beginTransition();
    writeMode(next);
    applyMode(next);

    try {
      window.dispatchEvent(
        new CustomEvent('atlas:appearance-change', {
          detail: {
            mode: next,
            sessionId: activeSessionId()
          }
        })
      );
    } catch { }
  }

  function refresh() {
    applyMode(readMode());
  }

  function init() {
    refresh();

    document
      .querySelector('[data-legal-appearance]')
      ?.addEventListener('click', toggle);

    window.addEventListener(
      'storage',
      event => {
        if (
          event.key === KEYS.appearance ||
          event.key === KEYS.appearanceBySession
        ) {
          refresh();
        }
      }
    );

    window.addEventListener(
      'pageshow',
      refresh
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      { once: true }
    );
  } else {
    init();
  }
})();