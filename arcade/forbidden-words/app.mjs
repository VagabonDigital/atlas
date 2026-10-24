import { ForbiddenWordsLiveClient } from "./live-client.mjs";

const learner = document.body.dataset.player === "learner";
const app = document.querySelector("#app");
const params = new URLSearchParams(location.search);
const fragment = new URLSearchParams(location.hash.slice(1));
const API =
  document.querySelector('meta[name="fw-api"]')?.content ||
  "https://atlas-ai.savvy989.workers.dev/forbidden-words/";
const LOCAL =
  document.querySelector('meta[name="fw-local-verification"]')?.content ===
  "true";
const REGISTRY_ID = "arcade:forbidden-words";
// Live WebSockets are the default only for newly created production rooms.
// ?fw-live=0 is an emergency opt-out for a NEW game; remembered rooms retain
// their original transport so reconnecting never switches game authority.
const LIVE_NEW_ROOMS = !LOCAL && params.get("fw-live") !== "0";
const liveRoomKey = (roomId) => `fw:transport:${roomId}`;
const THEME_TRANSITION_MS = 280;
const uuid = () => crypto.randomUUID();
const randomToken = () =>
  [...crypto.getRandomValues(new Uint8Array(32))]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const storage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Tab still works without storage. */
    }
  },
};
let session = learner ? params.get("session") : null;
let liveMode = learner && params.get("live") === "1";
let liveClient = null;
let credential,
  invite = fragment.get("invite"),
  state,
  offset = 0,
  busy = false,
  pending = null;
let lastKey = "",
  lastContinuityKey = "",
  lastNonce,
  lastPhase,
  lastFeedback,
  failed = false,
  lastSync = 0,
  pollTimer,
  owner,
  atlasSession,
  gameLearnerId = null,
  roomEpoch = 0,
  replacementInvite = null,
  playingChromeMounted = false;
let sound = storage.get("fw:sound") === "on",
  audio,
  retryDelay = 650,
  themeTransitionTimer = null,
  themeSyncing = false,
  queuedTheme = null;
const brand = '<span class="brand">Forbidden <em>Words</em><sup>✦</sup></span>';
const rings = '<span class="rings" aria-hidden="true"><i></i><i></i></span>';
const back = `<div class="card-back">${rings}</div>`;
const deck = `<div class="deck-object" aria-hidden="true"><div class="deck-shadow"></div><div class="deck-layer layer-two">${back}</div><div class="deck-layer layer-one">${back}</div><div class="deck-top">${back}</div><div class="deck-tray"></div></div>`;
const button = (action, label, cls = "", disabled = false) => {
  const shortcut = { correct: "1", skip: "2", oops: "3" }[action];
  return `<button class="${cls}" data-action="${action}" ${shortcut ? `aria-keyshortcuts="${shortcut}"` : ""} ${disabled ? "disabled" : ""}>${label}</button>`;
};
let noticeTimeout;
let noticePersistent = false;
function notify(message, { persistent = false, duration = 3000 } = {}) {
  const notice = document.querySelector("#notice");
  // Connection and presence notices can be evaluated every tick. Do not
  // repeatedly re-render an unchanged persistent warning.
  if (persistent && noticePersistent && notice.textContent === message) return;
  clearTimeout(noticeTimeout);
  noticeTimeout = null;
  noticePersistent = persistent && Boolean(message);
  notice.textContent = message;
  if (message && !persistent) {
    noticeTimeout = setTimeout(() => {
      notice.textContent = "";
      noticeTimeout = null;
    }, duration);
  }
}
function normalizeTheme(mode) {
  return mode === "night" ? "night" : "light";
}
function applyGameTheme(mode, animate = true) {
  const next = normalizeTheme(mode);
  const html = document.documentElement;
  if (html.dataset.theme === next) return next;

  const apply = () => {
    html.dataset.theme = next;
  };

  if (
    animate &&
    typeof document.startViewTransition === "function" &&
    !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ) {
    document.startViewTransition(apply);
    return next;
  }

  if (animate) {
    html.classList.remove("theme-changing");
    void html.offsetWidth;
    html.classList.add("theme-changing");
  }
  apply();

  if (animate) {
    clearTimeout(themeTransitionTimer);
    themeTransitionTimer = setTimeout(() => {
      html.classList.remove("theme-changing");
      themeTransitionTimer = null;
    }, THEME_TRANSITION_MS + 100);
  }

  return next;
}
function tutorTheme() {
  return normalizeTheme(
    window.AtlasBridge?.readAppearanceMode?.() ||
      document.documentElement.dataset.theme,
  );
}
async function syncTutorTheme(mode) {
  if (learner || LOCAL || !state) return;
  const next = normalizeTheme(mode);
  if (state.theme === next && !themeSyncing) return;

  if (themeSyncing) {
    queuedTheme = next;
    return;
  }

  themeSyncing = true;
  try {
    await request("theme", {
      theme: next,
      round: state.round,
      turn: state.turn,
    });
  } catch (error) {
    console.warn("[Forbidden Words] theme sync failed:", error);
  } finally {
    themeSyncing = false;
    const queued = queuedTheme;
    queuedTheme = null;
    if (queued && queued !== state?.theme) {
      syncTutorTheme(queued);
    }
  }
}
function script(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = resolve;
    el.onerror = reject;
    document.head.append(el);
  });
}
function showTutorLandingChrome() {
  if (learner) return;
  const landingChrome = document.querySelector("#landing-chrome");
  const playingChrome = document.querySelector("#playing-chrome");
  if (landingChrome) landingChrome.hidden = false;
  if (playingChrome) playingChrome.hidden = true;
}
// Only the selected Atlas learner may own this tab's tutor room. Room IDs
// are browser bookmarks, not authorization: the Worker enforces the bound ID.
const roomKey = (ownerId, learnerId) =>
  `fw:tutor:${ownerId}:atlas:${learnerId}`;
function selectedAtlasLearner() {
  return window.AtlasBridge?.readActiveSession?.() || null;
}
function showNoLearnerRoom() {
  showTutorLandingChrome();
  app.innerHTML = `<section class="landing"><div class="landing-identity">${brand}<p class="premise">Describe the word. <br>Lose the obvious language.</p><div class="hero-deck">${deck}</div><p class="caption">Two voices. One clock. Find another way.</p></div><div class="invitation panel"><p class="eyebrow">NEW GAME</p><h1>Ready to play?</h1><p>Create a private game, then invite your learner to join.</p>${button("new-session", "Create Game", "primary start-button")}</div></section>`;
}
function stopLive() {
  const client = liveClient;
  liveClient = null;
  client?.close();
}
function selectTutorRoom(next) {
  if (!owner || learner || !next?.id) return;
  if (next.id === gameLearnerId) {
    atlasSession = next; // Rename/refresh; never reassign the room.
    return;
  }
  roomEpoch++;
  stopLive();
  replacementInvite = null;
  clearTimeout(pollTimer);
  pending = null;
  busy = false;
  failed = false;
  retryDelay = 650;
  state = null;
  lastKey = "";
  lastNonce = null;
  lastPhase = null;
  lastFeedback = null;
  notify("");
  atlasSession = next;
  gameLearnerId = next.id;
  session = storage.get(roomKey(owner, gameLearnerId));
  liveMode = !!session && storage.get(liveRoomKey(session)) === "live";
  if (session) void boot();
  else showNoLearnerRoom();
}
class RoomChanged extends Error {}

function syncAtlasContinuity(s) {
  if (learner || LOCAL || !s || !window.AtlasBridge || !gameLearnerId) return;
  try {
    if (window.AtlasBridge.readActiveSession?.()?.id !== gameLearnerId) return;
    const started = s.phase !== "waiting";
    const finished = s.phase === "finished";
    const round = Math.max(1, Number(s.round) || 1);
    const launchUrl = new URL("./index.html", location.href).href;
    // Live state is pushed frequently (including presence transitions).
    // Atlas progress only changes when its learner/room, round or status does.
    const status = finished ? "complete" : started ? "in-progress" : "available";
    const continuityKey = JSON.stringify([gameLearnerId, session, status, round]);
    if (continuityKey === lastContinuityKey) return;
    window.AtlasBridge.upsertSessionState(gameLearnerId, REGISTRY_ID, {
      world: "arcade",
      status,
      launchUrl,
      currentLabel: started ? `Round ${round}` : null,
      progress: started
        ? { covered: round, openEnded: true }
        : { covered: 0 },
      lastTouchedAt: Date.now(),
    });
    if (started) {
      window.AtlasBridge.touchRecentActivity({
        sessionId: gameLearnerId,
        registryId: REGISTRY_ID,
        title: "Forbidden Words",
        launchUrl,
      });
    }
    lastContinuityKey = continuityKey;
  } catch {
    /* Continuity must never interrupt live play. */
  }
}
function ensurePlayingChrome() {
  if (learner || playingChromeMounted || !window.ArcadeGameChrome) return;
  window.ArcadeGameChrome.mountGame({
    root: "#playing-chrome",
    returnRoot: "#arcade-game-return-root",
    actionsRoot: "#arcade-game-actions-root",
    session: false,
    search: false,
    appearance: true,
    mobileMenu: true,
  });
  setupTutorMobileUtilities();
  playingChromeMounted = true;
}
async function setupTutor() {
  for (const src of [
    "atlas-bridge",
    "atlas-cloud",
    "atlas-access-bootstrap",
    "arcade-catalog-data",
    "atlas-resource-share",
    "atlas-session-panel",
    "compass-catalog-data",
    "atlas-content-registry",
    "atlas-search",
  ]) {
    if (src === "atlas-bridge" && window.AtlasBridge) continue;
    if (LOCAL && ["atlas-cloud", "atlas-access-bootstrap"].includes(src))
      continue;
    await script(`/shared/${src}.js`);
  }
  await script("/arcade/shared/arcade-public-access.js");
  await script("/arcade/shared/arcade-game-chrome.js");
  if (window.AtlasSessionPanel) {
    window.AtlasSessionPanel.mount({
      root: "#atlas-session-panel-root",
      initialView: "manage",
    });
  }
  window.ArcadeGameChrome.mountLanding({ root: "#landing-chrome" });
  if (!LOCAL) {
    await window.AtlasAccessBootstrap.prepareAccount();
    const auth = await window.AtlasCloud.getSession();
    if (!auth) {
      showTutorLandingChrome();
      landing(null);
      window.ArcadePublicAccess.subscribeGameResume(
        "arcade:forbidden-words",
        () => location.reload(),
      );
      return false;
    }
    owner = auth.user.id;
  } else owner = "local-verification";
  // The session panel can select learners during setup; resolve the final
  // selection only after Atlas account and session chrome are ready.
  atlasSession = selectedAtlasLearner();
  if (!atlasSession?.id) throw new Error("Select an Atlas learner to host a game.");
  gameLearnerId = atlasSession.id;
  session = storage.get(roomKey(owner, gameLearnerId));
  liveMode = !!session && storage.get(liveRoomKey(session)) === "live";
  return true;
}
async function request(action, extra = {}, commandId) {
  if (liveMode) {
    if (action === "poll") return liveClient?.heartbeat();
    if (!liveClient) throw new Error("Live room is reconnecting.");
    return liveClient.command(action, extra, commandId || uuid());
  }
  const requestSession = session;
  const requestEpoch = roomEpoch;
  let auth = "";
  if (!learner) {
    if (LOCAL) auth = "local-verification";
    else {
      const current = await window.AtlasCloud.getSession();
      if (!current || current.user.id !== owner)
        throw new Error("Your Atlas account changed. Reload to continue.");
      auth = current.access_token;
    }
  }
  if (requestSession !== session || requestEpoch !== roomEpoch)
    throw new RoomChanged();
  const start = performance.now();
  const response = await fetch(
    `${API}${action === "create" ? "create" : "session"}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
      body: JSON.stringify({
        session: requestSession,
        action,
        id: commandId || uuid(),
        ...(!learner && gameLearnerId ? { atlasSessionId: gameLearnerId } : {}),
        ...(learner ? { credential } : {}),
        ...extra,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    },
  );
  const data = await response.json();
  if (requestSession !== session || requestEpoch !== roomEpoch)
    throw new RoomChanged();
  if (!response.ok) {
    const e = new Error(data.error || "Could not reach the game.");
    e.status = response.status;
    throw e;
  }
  // Never show or record an old, unassigned or mislabelled room as the
  // selected Atlas learner, even if a stale browser bookmark points to it.
  if (!learner && gameLearnerId &&
      data.state.atlasSessionId !== gameLearnerId)
    throw new Error("This room is not linked to the selected Atlas learner.");
  offset = data.state.serverNow + (performance.now() - start) / 2 - Date.now();
  lastSync = Date.now();
  failed = false;
  retryDelay = 650;
  if (!state || data.state.revision >= state.revision) {
    state = data.state;
    render();
    if (learner) applyGameTheme(state.theme);
  }
  if (!learner && !["poll", "theme"].includes(action)) syncAtlasContinuity(state);
  return state;
}
function headerUtilities() {
  const soundLabel = sound ? "Sound on" : "Sound off";
  const soundAction = sound ? "Turn sound off" : "Turn sound on";
  return `<button class="game-utility-button sound-button arcade-game-chrome-utility" type="button" data-action="sound" aria-label="Sound" aria-pressed="${sound}" title="${soundAction}"><span class="utility-label">${soundLabel}</span></button><button class="game-utility-button help-button" data-action="rules" aria-label="How to play" title="How to play"><span class="utility-icon" aria-hidden="true">?</span><span class="utility-label utility-rule-label">How to play</span></button>`;
}
function headerPause(s) {
  if (!["active", "countdown"].includes(s.phase)) return "";
  return button(
    s.paused ? "resume" : "pause",
    s.paused ? "▶ Resume" : "Ⅱ Pause",
    "pause-button",
  );
}
function closeTutorMobileMenu() {
  const menu = document.querySelector(".arcade-game-chrome-game-menu");
  const toggle = document.querySelector(".arcade-game-chrome-game-menu-toggle");
  const restoreFocus = menu?.contains(document.activeElement);
  if (menu) menu.hidden = true;
  if (toggle) toggle.setAttribute("aria-expanded", "false");
  if (restoreFocus) toggle?.focus();
}
function setupTutorMobileUtilities() {
  const utilities = document.querySelector("#fw-header-utilities");
  const menu = document.querySelector(".arcade-game-chrome-game-menu");
  if (!utilities || !menu || utilities.dataset.mobileMenuReady === "true") return;

  utilities.dataset.mobileMenuReady = "true";
  const home = utilities.parentNode;
  const marker = document.createComment("Forbidden Words utility home");
  home.insertBefore(marker, utilities);
  const media = window.matchMedia("(max-width: 820px)");

  const sync = () => {
    if (media.matches) {
      menu.insertBefore(utilities, menu.firstChild);
      utilities.classList.add("mobile-menu-utilities");
    } else {
      marker.after(utilities);
      utilities.classList.remove("mobile-menu-utilities");
      closeTutorMobileMenu();
    }
  };

  media.addEventListener("change", sync);
  utilities.addEventListener("click", (event) => {
    if (event.target.closest("button") && media.matches) closeTutorMobileMenu();
  });
  sync();
}
function learnerHeader(s) {
  if (!learner) return "";
  return `<header class="learner-game-heading">
    <div class="learner-game-brand">${brand}</div>
    <div class="round-label">ROUND ${s.round || 1}</div>
    <div class="learner-game-actions"><div class="utilities learner-utilities">${headerUtilities()}</div></div>
  </header>`;
}
function updateTutorHeader(s) {
  if (learner) return;
  const landingChrome = document.querySelector("#landing-chrome");
  const playingChrome = document.querySelector("#playing-chrome");
  const waiting = s.phase === "waiting";
  if (landingChrome) landingChrome.hidden = !waiting;
  if (playingChrome) playingChrome.hidden = waiting;
  if (waiting) return;
  ensurePlayingChrome();
  const brandRoot = document.querySelector("#fw-header-brand");
  const roundRoot = document.querySelector("#fw-header-round");
  const utilitiesRoot = document.querySelector("#fw-header-utilities");
  const pauseRoot = document.querySelector("#fw-header-pause");
  if (brandRoot) brandRoot.innerHTML = brand;
  if (roundRoot) {
    roundRoot.textContent = `ROUND ${s.round || 1}`;
    roundRoot.dataset.round = String(s.round || 1);
  }
  if (utilitiesRoot && utilitiesRoot.innerHTML !== headerUtilities()) {
    const focusedAction = utilitiesRoot.contains(document.activeElement)
      ? document.activeElement.dataset.action : null;
    utilitiesRoot.innerHTML = headerUtilities();
    if (focusedAction) utilitiesRoot.querySelector(`[data-action="${focusedAction}"]`)?.focus({ preventScroll: true });
  }
  // Heartbeats/state pushes must not replace the focused Pause/Resume DOM.
  if (pauseRoot) {
    const nextAction = ["active", "countdown"].includes(s.phase)
      ? (s.paused ? "resume" : "pause")
      : null;
    const currentAction = pauseRoot.querySelector("[data-action]")?.dataset.action || null;
    if (currentAction !== nextAction) {
      const focused = pauseRoot.contains(document.activeElement);
      pauseRoot.innerHTML = headerPause(s);
      if (focused) pauseRoot.querySelector("button")?.focus({ preventScroll: true });
    }
  }
}
function replacementReady() {
  return !!replacementInvite && replacementInvite === state?.invite;
}
function invitationLink() {
  const fresh = replacementReady();
  const label = fresh ? "Replacement link" : "Private game link";
  const copyLabel = fresh ? "Copy new link" : "Copy link";
  return `<div class="link-row invite-link-row"><span class="invite-link-label" aria-hidden="true">↗ &nbsp; ${label}</span><input id="invite-link" class="invite-link-input" aria-label="${label}" aria-hidden="true" tabindex="-1" readonly value="${escape(joinUrl())}">${button("copy", copyLabel, "primary")}</div>${fresh ? '<p class="replacement-note" role="status">Previous invitation disabled. Share this new link to reconnect.</p>' : ""}`;
}
function landing(s) {
  const joined = s?.connected.learner;
  app.innerHTML = `<section class="landing"><div class="landing-identity">${brand}<p class="premise">Describe the word. <br>Lose the obvious language.</p><div class="hero-deck">${deck}<span class="spark one">✦</span><span class="spark two">✧</span></div><p class="caption">Two voices. One clock. Find another way.</p></div>
    <div class="invitation panel"><p class="eyebrow">${learner ? "YOU’RE IN" : "BETTER TOGETHER"}</p><h1>${learner ? "Your partner goes first." : joined ? "Ready to play?" : "Invite your learner"}</h1>
    <p>${learner ? "Listen to the clues and guess aloud." : joined ? "Both of you are connected." : "Send a private game invitation to your learner."}</p>
    ${!learner && s && !joined ? invitationLink() : ""}
    <div class="connection"><span class="connection-dot ${joined ? "online" : ""}"></span><div><strong>${learner ? "Connected to the game" : joined ? "Your learner is here" : s ? "Waiting for your learner…" : "Ready for a live lesson?"}</strong><p>${learner ? "Your tutor will start the round." : joined ? "You can start the first round." : s ? "They’ll appear here when connected." : "Sign in to create your private game."}</p></div></div>
    ${learner ? "" : !s ? button("sign-in", "Sign in to host", "primary start-button") : joined ? button("start", "▶ Start Round", "primary start-button") : ""}
    ${learner
      ? `<div class="entry-footer learner-entry-footer">
          ${button("rules", "How to play", "entry-footer-action")}
        </div>`
      : `<div class="entry-footer tutor-entry-footer">
          <div class="entry-footer-actions">
            ${button("rules", "How to play", "entry-footer-action")}
            ${s ? '<span class="entry-footer-separator" aria-hidden="true">·</span>' : ""}
            ${s && !joined ? button("replace-learner", "Reset invitation", "entry-footer-action entry-footer-maintenance") + '<span class="entry-footer-separator" aria-hidden="true">·</span>' : ""}${s ? button("finish", "Cancel game", "entry-footer-action end-game-action") : ""}
          </div>
        </div>`}
    </div></section>`;
}
function joinUrl() {
  const url = new URL("./join.html", location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("session", session);
  if (liveMode) url.searchParams.set("live", "1");
  const shared = window.AtlasResourceShare?.buildShareUrl({
    world: "arcade",
    resourceId: "arcade:forbidden-words",
    launchUrl: url.href,
  });
  const result = new URL(shared || url);
  result.hash = `invite=${state.invite}`;
  return result.href;
}
function cardFace(s) {
  if (!s.card?.target)
    return `${back}<span class="sr-only">Concealed card. Listen and guess aloud.</span>`;
  const longestWord = Math.max(
    ...s.card.target.trim().split(/\s+/).map((word) => word.length),
  );
  const targetClass =
    longestWord >= 12
      ? "extra-long-target"
      : longestWord >= 9
        ? "long-target"
        : "";
  return `<div class="card-face"><p class="eyebrow">DESCRIBE THIS</p><h1 class="${targetClass}">${escape(s.card.target)}</h1><div class="card-divider"></div><p class="avoid-label">WITHOUT SAYING</p><ul>${s.card.forbidden.map((w) => `<li>${escape(w)}</li>`).join("")}</ul></div>`;
}
function pile(s) {
  return `<div class="pile" aria-hidden="true">${Array.from({ length: Math.min(7, Math.max(1, s.score)) }, (_, i) => `<div style="--i:${i};--n:${Math.min(7, Math.max(1, s.score))}">${back}</div>`).join("")}</div>`;
}
function board(s) {
  const describer = s.role === "Describer";
  const waitingForPartner = !!s.paused && (!s.connected.tutor || !s.connected.learner);
  const connectionPaused = s.paused?.reason === "connection";
  const pauseTitle = waitingForPartner ? "Partner disconnected." :
    connectionPaused ? "Both players are back." : "Turn paused.";
  const pauseDescription = waitingForPartner
    ? "The clock is stopped. Resume when both players are connected."
    : connectionPaused ? "The clock is safe. Your tutor can resume when ready."
      : "The clock is safe. Pick up when you’re ready.";
  return `${learnerHeader(s)}<section class="board"><aside class="deck-area">${deck}<p>${s.remaining} cards in the deck</p></aside>
    <div class="card-area"><div class="active-card ${s.card?.nonce !== lastNonce ? "dealing" : ""} ${describer ? "face-up" : "face-down"}">${cardFace(s)}</div>
    <div class="role-caption"><p class="eyebrow"><span>TURN ${s.turn} OF 2</span> · ${describer ? "YOU’RE DESCRIBING" : "YOUR PARTNER IS DESCRIBING"}</p><p>${describer ? "Find another way to say it." : "Guess the word out loud."}</p></div></div>
    <aside class="dashboard panel"><div class="timer" role="timer" aria-label="Turn time remaining"><svg viewBox="0 0 220 220" aria-hidden="true"><circle class="timer-track" cx="110" cy="110" r="96"/><circle class="timer-progress" cx="110" cy="110" r="96"/></svg><div><span class="timer-symbol">◴</span><strong id="clock">02:00</strong><span id="timer-label">TIME TO TALK</span></div></div>
      <div class="score-area"><div class="score-label"><span>SHARED SCORE</span><strong>${s.score}<small> ${s.score === 1 ? "point" : "points"}</small></strong></div>${pile(s)}<span class="played-count">${s.played} ${s.played === 1 ? "card" : "cards"} played</span></div>
      ${describer ? `<div class="resolutions">${button("correct", "Correct", "correct")}${button("skip", "Skip", "skip")}${button("oops", "I said one!", "oops")}</div>` : '<div class="guesser-note"><span>◌</span><div><strong>GUESSER</strong><p>Listen. Ask questions. <br>Follow the clues.</p></div></div>'}
    </aside></section><div class="feedback" aria-live="polite">${feedbackText(s)}</div>
    ${s.phase === "countdown" ? '<div class="countdown-overlay"><div><p class="eyebrow">GET READY</p><strong id="countdown-number">3</strong><p>Your card. Your voice. Go.</p></div></div>' : ""}
    ${s.paused ? `<div class="pause-overlay"><div class="panel"><p class="eyebrow">TAKE YOUR TIME</p><h2>${pauseTitle}</h2><p>${pauseDescription}</p>${!learner ? `<div class="pause-actions">${button("resume", "▶ Resume turn", "primary", !s.connected.tutor || !s.connected.learner)}${button("finish", "End game", "secondary end-game-button")}</div>${!s.connected.learner ? `<details class="pause-invitation" ${replacementReady() ? "open" : ""}><summary>Invitation &amp; reconnect</summary><div class="pause-invitation-content">${invitationLink()}${button("replace-learner", "Reset invitation", "text-button pause-replace-link")}</div></details>` : ""}` : "<p>Your tutor will resume the game.</p>"}</div></div>` : ""}`;
}
function feedbackText(s) {
  return !s.feedback
    ? ""
    : s.feedback.result === "correct"
      ? `✓ ${escape(s.feedback.target)} · +1 together`
      : s.feedback.result === "skip"
        ? "↠ Next idea."
        : s.feedback.result === "oops"
          ? "Oops! Fresh card, fresh start."
          : "";
}
function between(s) {
  const switching = s.phase === "switch",
    finished = s.phase === "finished";
  const ready = s.ready.includes(s.actor);
  return `${learnerHeader(s)}<section class="between"><div class="results-deck">${deck}</div><div class="result-panel panel ${switching ? "switch-panel" : ""}"><p class="eyebrow">${finished ? "THANKS FOR PLAYING" : switching ? "TIME’S UP · SWAP ROLES" : "TWO VOICES. ONE GREAT ROUND."}</p>
    <h1>${finished ? "That’s a wrap!" : switching ? (s.role === "Describer" ? "Your turn to describe." : "Your turn to guess.") : "Look what you cleared."}</h1>
    <div class="result-score"><strong>${s.score}</strong><span>shared ${s.score === 1 ? "point" : "points"}${switching ? " so far" : ""}</span></div>
    ${s.best !== null ? `<p class="best">Session best <strong>${s.best}</strong>${!switching && s.score === s.best ? " ✦" : ""}</p>` : ""}
    ${s.finalCard && !finished ? `<div class="final-card"><span>At the horn</span><strong>${escape(s.finalCard.target)}</strong>${s.finalCard.credited ? "<small>✓ Credited</small>" : s.canCredit ? button("late-correct", "They said it before the horn · +1", "text-button") : ""}</div>` : ""}
    ${switching ? `<p class="switch-copy">${ready ? "Waiting for your partner to get ready." : "Take a breath. Both of you tap ready to begin."}</p><div class="switch-actions">${button("ready", ready ? "✓ Ready" : "I’m ready", "primary", ready)}${!learner ? button("finish", "End game", "secondary end-game-button") : ""}</div>` : finished ? (!learner ? button("new-session", "Start a new game", "primary") : "") : `<div class="result-actions">${!learner ? button("replay", "▶ Play Another Round", "primary", !s.connected.learner) + button("finish", "End game", "secondary end-game-button") : "<p>Your partner can start another round or finish.</p>"}</div>`}
    ${!switching && s.review.length ? `<details class="review"><summary>Talk through ${s.review.length} unresolved ${s.review.length === 1 ? "card" : "cards"} <span>Optional</span></summary><div>${s.review.map((c) => `<article><strong>${escape(c.target)}</strong><small>${c.result === "oops" ? "Oops" : c.result === "skip" ? "Skipped" : "At the horn"}</small><p>${c.forbidden.map(escape).join(" · ")}</p></article>`).join("")}</div></details>` : ""}
    ${!learner && switching && !s.connected.learner ? `<div class="switch-maintenance">${button("replace-learner", "Reset invitation", "text-button small")}${invitationLink()}</div>` : ""}</div></section>`;
}
function render() {
  const s = state;
  updateTutorHeader(s);
  const key = JSON.stringify({ ...s, serverNow: 0, revision: 0 });
  if (key === lastKey) {
    updateControls();
    return;
  }
  const focused = document.activeElement?.dataset?.action;
  const reviewOpen = document.querySelector(".review")?.open;
  const pauseInviteOpen = document.querySelector(".pause-invitation")?.open;
  if (
    lastNonce &&
    s.card?.nonce &&
    lastNonce !== s.card.nonce &&
    document.querySelector(".active-card") &&
    s.feedback
  ) {
    const original = document.querySelector(".active-card");
    const rect = original.getBoundingClientRect();
    const ghost = original.cloneNode(true);
    ghost.className = `flying-card ${s.feedback.result}`;
    Object.assign(ghost.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    ghost.setAttribute("aria-hidden", "true");
    document.body.append(ghost);
    setTimeout(() => ghost.remove(), 350);
  }
  if (s.phase === "waiting") landing(s);
  else
    app.innerHTML = ["countdown", "active"].includes(s.phase)
      ? board(s)
      : between(s);
  if (reviewOpen && document.querySelector(".review"))
    document.querySelector(".review").open = true;
  if (pauseInviteOpen && document.querySelector(".pause-invitation"))
    document.querySelector(".pause-invitation").open = true;
  if (focused)
    document
      .querySelector(`[data-action="${focused}"]`)
      ?.focus({ preventScroll: true });
  if (
    lastPhase &&
    lastPhase !== s.phase &&
    ["switch", "results"].includes(s.phase)
  ) {
    tone(180, 0.5);
  }
  if (
    s.feedback?.nonce &&
    s.feedback.nonce !== lastFeedback &&
    s.feedback.result !== "unfinished"
  ) {
    tone(
      s.feedback.result === "correct"
        ? 660
        : s.feedback.result === "oops"
          ? 230
          : 360,
      0.12,
    );
    lastFeedback = s.feedback.nonce;
  }
  lastKey = key;
  lastNonce = s.card?.nonce;
  lastPhase = s.phase;
  updateControls();
  tick();
}
function updateControls() {
  document.body.classList.toggle("disconnected", failed);
  for (const el of document.querySelectorAll(
    '[data-action="correct"],[data-action="skip"],[data-action="oops"]',
  )) {
    el.disabled =
      busy ||
      failed ||
      state?.phase !== "active" ||
      !!state?.paused ||
      !state?.connected?.tutor ||
      !state?.connected?.learner ||
      Date.now() + offset >= state?.deadline;
  }
  for (const el of document.querySelectorAll(
    '[data-action="start"],[data-action="replay"],[data-action="ready"],[data-action="late-correct"],[data-action="finish"],[data-action="replace-learner"],[data-action="resume"]',
  )) {
    if (["finish", "replace-learner", "resume"].includes(el.dataset.action))
      el.disabled = busy || failed ||
        (el.dataset.action === "resume" &&
          (!state?.connected?.tutor || !state?.connected?.learner));
    else if (busy) el.disabled = true;
  }
  const partnerDisconnected =
    state &&
    !failed &&
    !state.connected[learner ? "tutor" : "learner"];
  const timedPlay = state && ["countdown", "active"].includes(state.phase);

  if (partnerDisconnected && timedPlay && !state.paused) {
    notify("Your partner is reconnecting. The clock will pause automatically.", {
      persistent: true,
    });
  } else if (
    !failed &&
    document
      .querySelector("#notice")
      .textContent.startsWith("Your partner is reconnecting")
  ) {
    notify("");
  }
}
let lastCount;
function tick() {
  if (!state) return;
  const now = Date.now() + offset;
  let ms = state.paused
    ? state.paused.remaining
    : Math.max(0, state.deadline - now);
  const turnMs = state.turnMs || 120000;
  if (state.phase === "countdown") ms = turnMs;
  const seconds = Math.ceil(ms / 1000);
  const clock = document.querySelector("#clock");
  if (clock)
    clock.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const pressure =
    state.phase === "active"
      ? Math.max(0, Math.min(1, (35 - ms / 1000) / 35))
      : 0;
  document.documentElement.style.setProperty("--pressure", pressure.toFixed(3));
  document.documentElement.style.setProperty(
    "--heat",
    (pressure ** 2).toFixed(3),
  );
  document.documentElement.style.setProperty(
    "--timer-hue",
    String(210 - pressure * 205),
  );
  document
    .querySelector(".timer-progress")
    ?.style.setProperty(
      "stroke-dashoffset",
      String(603.2 * (1 - Math.min(1, ms / turnMs))),
    );
  const label = document.querySelector("#timer-label");
  if (label)
    label.textContent = state.paused
      ? "PAUSED"
      : ms <= 0
        ? "TIME’S UP"
        : seconds <= 10
          ? "KEEP TALKING!"
          : "TIME TO TALK";
  const countdown = document.querySelector("#countdown-number");
  if (countdown) {
    const count = Math.max(
      0,
      Math.ceil(
        (state.paused ? state.paused.countdown : state.startsAt - now) / 1000,
      ),
    );
    countdown.textContent = count || "GO";
    if (count !== lastCount && count > 0 && !state.paused)
      tone(440 + count * 70, 0.08);
    lastCount = count;
  }
  if (
    Date.now() - lastSync > (liveMode ? 12000 : 4000) &&
    (!liveMode || !liveClient?.connected) &&
    ["active", "countdown"].includes(state.phase)
  ) {
    failed = true;
    notify(
      "Connection lost. Reconnecting to check the turn.",
      { persistent: true },
    );
  }
  updateControls();
}
function unlockSound() {
  if (!sound) return;
  try {
    audio ||= new AudioContext();
    if (audio.state === "suspended") void audio.resume().catch(() => {});
  } catch { /* This device can continue playing silently. */ }
}
function tone(frequency, duration) {
  if (!sound || !audio) return;
  const oscillator = audio.createOscillator(),
    gain = audio.createGain();
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.06, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
}
function confirmLearnerReplacement() {
  const dialog = document.querySelector("#replace-learner-confirm");
  if (!dialog || dialog.open) return Promise.resolve(false);
  dialog.returnValue = "";
  return new Promise((resolve) => {
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "replace"), { once: true });
    dialog.showModal();
  });
}
function confirmEndGame() {
  const dialog = document.querySelector("#end-game-confirm");
  if (!dialog || dialog.open) return Promise.resolve(false);
  dialog.returnValue = "";
  const waiting = state?.phase === "waiting";
  dialog.querySelector("#end-game-eyebrow").textContent = waiting ? "CANCEL INVITATION" : "END SHARED GAME";
  dialog.querySelector("#end-game-title").textContent = waiting ? "Cancel this game?" : "End this game for both players?";
  dialog.querySelector("#end-game-description").textContent = waiting
    ? "This invitation will stop working. You can create another game whenever you like."
    : "This closes the game for both players. It cannot be resumed.";
  dialog.querySelector('[value="cancel"]').textContent = waiting ? "Keep invitation" : "Keep playing";
  dialog.querySelector('[value="end"]').textContent = waiting ? "Cancel game" : "End game";
  return new Promise((resolve) => {
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "end"), { once: true });
    dialog.showModal();
  });
}
async function act(action) {
  // A remembered preference still needs a user gesture after reloading.
  if (action !== "sound") unlockSound();
  if (action === "rules") {
    closeTutorMobileMenu();
    const rules = document.querySelector("#rules");
    rules.showModal();
    requestAnimationFrame(syncRulesScrollbar);
    return;
  }
  if (action === "close-rules") return document.querySelector("#rules").close();
  if (action === "sound") {
    closeTutorMobileMenu();
    sound = !sound;
    storage.set("fw:sound", sound ? "on" : "off");
    lastKey = "";
    render();
    // Preference and accessible state still update if audio is unavailable.
    unlockSound();
    return;
  }
  if (action === "copy") {
    try {
      await navigator.clipboard.writeText(joinUrl());
      notify("Learner link copied.");
    } catch {
      const input = document.querySelector("#invite-link");
      input?.closest(".invite-link-row")?.classList.add("manual-copy");
      input?.removeAttribute("aria-hidden");
      input?.removeAttribute("tabindex");
      input?.select();
      notify("Copy unavailable automatically. Select the link and press Ctrl+C (or Command+C).", { duration: 7000 });
    }
    return;
  }
  if (action === "sign-in")
    return window.ArcadePublicAccess.requestGameAccess(
      "arcade:forbidden-words",
    );
  if (action === "new-session") {
    if (learner || !owner || !gameLearnerId) return;
    const nextLive = LIVE_NEW_ROOMS;
    roomEpoch++;
    stopLive();
    replacementInvite = null;
    clearTimeout(pollTimer);
    session = uuid();
    liveMode = nextLive;
    if (liveMode) storage.set(liveRoomKey(session), "live");
    storage.set(roomKey(owner, gameLearnerId), session);
    state = null;
    pending = null;
    lastKey = "";
    lastNonce = null;
    await boot();
    return;
  }
  if (busy) return;
  if (action === "retry") {
    if (pending) return sendPending();
    return boot();
  }
  if (action === "replace-learner") {
    if (!(await confirmLearnerReplacement())) return;
    if (busy) return;
  }
  if (action === "finish") {
    if (learner || !(await confirmEndGame())) return;
    if (busy) return;
  }
  pending = {
    action,
    id: uuid(),
    card: action === "late-correct" ? state.finalNonce : state.card?.nonce,
    round: state.round,
    turn: state.turn,
  };
  await sendPending();
}
async function sendPending() {
  if (!pending) return;
  const pendingEpoch = roomEpoch;
  busy = true;
  updateControls();
  const operation = pending;
  try {
    await request(
      operation.action,
      { card: operation.card, round: operation.round, turn: operation.turn },
      operation.id,
    );
    if (pendingEpoch !== roomEpoch) return;
    pending = null;
    if (operation.action === "replace-learner") replacementInvite = state?.invite || null;
    notify(
      operation.action === "replace-learner"
        ? "Previous invitation disabled. Copy the new link to reconnect."
        : "",
    );
  } catch (error) {
    if (pendingEpoch !== roomEpoch || error instanceof RoomChanged) return;
    notify(error.message, {
      persistent: !error.status || error.status >= 500,
      duration: 5000,
    });
    if (error.status && error.status < 500) pending = null;
    else {
      failed = true;
    }
  } finally {
    if (pendingEpoch === roomEpoch) {
      busy = false;
      lastKey = "";
      if (state) render();
      schedulePoll();
    }
  }
}
function schedulePoll() {
  clearTimeout(pollTimer);
  if (!session || liveMode) return;
  pollTimer = setTimeout(poll, state?.phase === "finished" ? 3000 : retryDelay);
}
function showEntryError(error) {
  // A claimed, replaced or expired learner seat cannot be repaired by
  // resubmitting the same invitation. HTTP and WebSocket servers use different
  // wording, so rely on the status instead of matching an exact sentence.
  const unavailableSeat = learner && (error.status === 403 || error.status === 410);
  const claimedSeat =
    learner && error.status === 403 &&
    /learner seat is already in use/i.test(error.message || "");
  const message = claimedSeat
    ? "Ask your tutor to send you a new link."
    : learner && error.status === 410
      ? "This game has expired. Ask your tutor to start a new game and share a new invitation."
      : unavailableSeat
        ? "This invitation can no longer be used. Ask your tutor to reset the invitation and send a new link."
        : error.message;
  state = null;
  lastKey = "";
  lastNonce = null;
  pending = null;
  failed = true;
  clearTimeout(pollTimer);
  stopLive();
  document.documentElement.style.setProperty("--heat", "0");
  app.innerHTML = `<section class="entry-error panel">${brand}<h1>${claimedSeat ? "This invitation is already in use." : "Let’s get you connected."}</h1><p>${escape(message)}</p>${unavailableSeat ? "" : button("retry", "Try again", "primary")}${!learner && owner ? button("new-session", "Create a fresh game", "text-button") : ""}</section>`;
  notify("");
}
async function poll() {
  if (!session) return;
  const pollEpoch = roomEpoch;
  if (busy) return schedulePoll();
  try {
    if (pending) {
      await sendPending();
      return;
    }
    const wasDisconnected = failed;
    await request("poll");
    if (pollEpoch !== roomEpoch) return;
    const partnerMissing =
      state &&
      ["countdown", "active"].includes(state.phase) &&
      !state.connected[learner ? "tutor" : "learner"];
    if (wasDisconnected && !partnerMissing) notify("Connected again.");
  } catch (error) {
    if (pollEpoch !== roomEpoch || error instanceof RoomChanged) return;
    if ([401, 403, 410].includes(error.status)) {
      showEntryError(error);
      return;
    }
    failed = true;
    retryDelay = Math.min(5000, retryDelay * 2);
    notify(error.message, { persistent: true });
    updateControls();
  }
  if (pollEpoch === roomEpoch) schedulePoll();
}
function receiveLiveState(frame, epoch, selectedSession) {
  if (epoch !== roomEpoch || selectedSession !== session || !liveMode) return;
  const next = {
    ...frame.state,
    ...(!learner ? { invite: frame.invite } : {}),
  };
  if (!learner && next.atlasSessionId !== gameLearnerId) {
    showEntryError(new Error("This room belongs to a different Atlas learner."));
    return;
  }
  offset = next.serverNow - Date.now();
  lastSync = Date.now();
  failed = false;
  if (!state || next.revision >= state.revision) {
    state = next;
    render();
    if (learner) applyGameTheme(state.theme);
    else syncAtlasContinuity(state);
  }
}
async function startLiveRoom(epoch) {
  stopLive();
  if (LOCAL) throw new Error("Live rooms require the Atlas backend.");
  const selectedSession = session;
  const client = new ForbiddenWordsLiveClient({
    api: API, session: selectedSession,
    actor: learner ? "learner" : "tutor",
    getAuthorization: async () => {
      if (learner) return "";
      const current = await window.AtlasCloud.getSession();
      if (!current || current.user.id !== owner)
        throw new Error("Your Atlas account changed. Reload to continue.");
      return current.access_token;
    },
    getTicketPayload: async () => learner
      ? { credential, invite }
      : { atlasSessionId: gameLearnerId },
    onState: frame => receiveLiveState(frame, epoch, selectedSession),
    onHeartbeat: serverNow => {
      if (epoch !== roomEpoch || selectedSession !== session) return;
      lastSync = Date.now();
      if (typeof serverNow === "number") offset = serverNow - Date.now();
      // A healthy reply must clear a stale warning after a background tab
      // wakes up; otherwise controls can remain disabled indefinitely.
      if (failed && liveClient?.connected) {
        failed = false;
        notify("");
        if (state) updateControls();
      }
    },
    onStatus: connected => {
      if (epoch !== roomEpoch || selectedSession !== session) return;
      failed = !connected;
      if (connected) {
        notify("");
        if (!learner && state && state.theme !== tutorTheme())
          void syncTutorTheme(tutorTheme());
        // Preserve uncertain actions and their IDs through a reconnect.
        if (pending && !busy) void sendPending();
      } else {
        notify("Connection interrupted. Reconnecting…", { persistent: true });
      }
      if (state) updateControls();
    },
    onFatal: error => {
      if (epoch === roomEpoch && selectedSession === session)
        showEntryError(error);
    },
  });
  liveClient = client;
  if (!learner) {
    await client.initialize({ atlasSessionId: gameLearnerId });
    if (epoch !== roomEpoch || selectedSession !== session) return;
  }
  client.connect();
}
async function boot() {
  clearTimeout(pollTimer);
  stopLive();
  const bootEpoch = roomEpoch;
  try {
    if (learner) {
      if (!session)
        throw new Error("Open the game link your tutor shared with you.");
      credential = storage.get(`fw:learner:${session}`) || randomToken();
      storage.set(`fw:learner:${session}`, credential);
      invite ||= storage.get(`fw:invite:${session}`);
      if (invite) storage.set(`fw:invite:${session}`, invite);
      // Invite secrets never enter query strings, referrers or network request URLs.
      history.replaceState(null, "", `${location.pathname}${location.search}`);
      if (liveMode) await startLiveRoom(bootEpoch);
      else await request("join", { invite });
    } else {
      if (!owner && !(await setupTutor())) return;
      if (bootEpoch !== roomEpoch) return;
      if (!session) return showNoLearnerRoom();
      if (liveMode) await startLiveRoom(bootEpoch);
      else await request("create", { theme: tutorTheme() });
    }
    if (bootEpoch === roomEpoch) schedulePoll();
  } catch (error) {
    if (bootEpoch !== roomEpoch || error instanceof RoomChanged) return;
    showEntryError(error);
  }
}
const rulesDialog = document.querySelector("#rules");
const rulesScroller = rulesDialog?.querySelector(".rules-scroll");
let rulesScrollbar;
let rulesScrollbarThumb;

function ensureRulesScrollbar() {
  if (!rulesDialog || !rulesScroller || rulesScrollbar) return;
  rulesScrollbar = document.createElement("div");
  rulesScrollbar.className = "rules-scrollbar";
  rulesScrollbar.setAttribute("aria-hidden", "true");
  rulesScrollbarThumb = document.createElement("div");
  rulesScrollbarThumb.className = "rules-scrollbar-thumb";
  rulesScrollbar.append(rulesScrollbarThumb);
  rulesDialog.append(rulesScrollbar);
  rulesScroller.addEventListener("scroll", syncRulesScrollbar, { passive: true });
}

function syncRulesScrollbar() {
  ensureRulesScrollbar();
  if (!rulesScroller || !rulesScrollbar || !rulesScrollbarThumb) return;

  const viewport = rulesScroller.clientHeight;
  const content = rulesScroller.scrollHeight;
  const overflow = content - viewport;

  if (overflow <= 1) {
    rulesScrollbar.classList.remove("is-visible");
    return;
  }

  const track = rulesScrollbar.clientHeight;
  const thumb = Math.max(34, track * (viewport / content));
  const travel = Math.max(0, track - thumb);
  const offset = overflow > 0 ? travel * (rulesScroller.scrollTop / overflow) : 0;

  rulesScrollbarThumb.style.height = `${thumb}px`;
  rulesScrollbarThumb.style.transform = `translateY(${offset}px)`;
  rulesScrollbar.classList.add("is-visible");
}

ensureRulesScrollbar();
window.addEventListener("resize", () => requestAnimationFrame(syncRulesScrollbar));

document.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action]");
  if (el && !el.disabled)
    act(el.dataset.action).catch((e) => notify(e.message));
});
document.querySelector("#rules")?.addEventListener("click", (event) => {
  const dialog = event.currentTarget;
  const rect = dialog.getBoundingClientRect();
  const inside =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;
  if (!inside) dialog.close();
});
document.addEventListener("keydown", (event) => {
  if (
    event.repeat ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) ||
    document.querySelector("dialog[open]")
  )
    return;
  const action = { 1: "correct", 2: "skip", 3: "oops" }[event.key];
  const el = action && document.querySelector(`[data-action="${action}"]`);
  if (el && !el.disabled) {
    event.preventDefault();
    act(action);
  }
});
// Chrome can park a page with active WebSockets in the back-forward cache.
// Stop the old socket on pagehide; reconnect to the SAME room on restore.
window.addEventListener("pagehide", () => {
  if (liveMode) liveClient?.suspend();
});
window.addEventListener("pageshow", (event) => {
  if (liveMode && event.persisted) liveClient?.resume();
});
window.addEventListener("online", () => {
  if (liveMode) liveClient?.connect();
  else {
    clearTimeout(pollTimer);
    poll();
  }
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && state) {
    if (liveMode) {
      liveClient?.connect();
      liveClient?.heartbeat();
    } else {
      clearTimeout(pollTimer);
      poll();
    }
  }
});
window.addEventListener("atlas:session-change", (event) => {
  if (learner) return;
  const next = window.AtlasBridge?.readActiveSession?.() || event.detail?.session;
  if (owner) selectTutorRoom(next);
  else atlasSession = next;
});
window.addEventListener("atlas:appearance-change", (event) => {
  if (learner || LOCAL || !state) return;
  syncTutorTheme(event.detail?.mode || tutorTheme());
});
setInterval(tick, 100);
boot();
