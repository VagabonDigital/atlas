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
let credential,
  invite = fragment.get("invite"),
  state,
  offset = 0,
  busy = false,
  pending = null;
let lastKey = "",
  lastNonce,
  lastPhase,
  lastFeedback,
  failed = false,
  lastSync = 0,
  pollTimer,
  owner,
  atlasSession;
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
function notify(message) {
  document.querySelector("#notice").textContent = message;
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
function syncAtlasContinuity(s) {
  if (learner || LOCAL || !s || !window.AtlasBridge) return;
  try {
    atlasSession = window.AtlasBridge.readActiveSession?.() || atlasSession;
    if (!atlasSession?.id) return;
    const started = s.phase !== "waiting";
    const finished = s.phase === "finished";
    const round = Math.max(1, Number(s.round) || 1);
    const launchUrl = new URL("./index.html", location.href).href;
    window.AtlasBridge.upsertSessionState(atlasSession.id, REGISTRY_ID, {
      world: "arcade",
      status: finished ? "complete" : started ? "in-progress" : "available",
      launchUrl,
      currentLabel: started ? `Round ${round}` : null,
      progress: started
        ? { covered: round, openEnded: true }
        : { covered: 0 },
      lastTouchedAt: Date.now(),
    });
    if (started) {
      window.AtlasBridge.touchRecentActivity({
        sessionId: atlasSession.id,
        registryId: REGISTRY_ID,
        title: "Forbidden Words",
        launchUrl,
      });
    }
  } catch {
    /* Continuity must never interrupt live play. */
  }
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
  window.ArcadeGameChrome.mountGame({
    root: "#playing-chrome",
    returnRoot: "#arcade-game-return-root",
    actionsRoot: "#arcade-game-actions-root",
  });
  setupTutorMobileUtilities();
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
  if (!LOCAL) atlasSession = window.AtlasBridge?.readActiveSession?.() || null;
  session = storage.get(`fw:tutor:${owner}`) || uuid();
  storage.set(`fw:tutor:${owner}`, session);
  return true;
}
async function request(action, extra = {}, commandId) {
  const requestSession = session;
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
        ...(learner ? { credential } : {}),
        ...extra,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    },
  );
  const data = await response.json();
  if (requestSession !== session) return state;
  if (!response.ok) {
    const e = new Error(data.error || "Could not reach the game.");
    e.status = response.status;
    throw e;
  }
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
  return `<button class="game-utility-button sound-button" data-action="sound" aria-label="${soundAction}" title="${soundAction}"><span class="utility-icon" aria-hidden="true">♪</span><span class="utility-label">${soundLabel}</span></button><button class="game-utility-button help-button" data-action="rules" aria-label="How to play" title="How to play"><span class="utility-icon" aria-hidden="true">?</span><span class="utility-label utility-rule-label">How to play</span></button>`;
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
  if (menu) menu.hidden = true;
  if (toggle) toggle.setAttribute("aria-expanded", "false");
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
      utilities.querySelectorAll("button").forEach((el) => el.setAttribute("role", "menuitem"));
    } else {
      marker.after(utilities);
      utilities.classList.remove("mobile-menu-utilities");
      utilities.querySelectorAll("button").forEach((el) => el.removeAttribute("role"));
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
  const brandRoot = document.querySelector("#fw-header-brand");
  const roundRoot = document.querySelector("#fw-header-round");
  const utilitiesRoot = document.querySelector("#fw-header-utilities");
  const pauseRoot = document.querySelector("#fw-header-pause");
  if (brandRoot) brandRoot.innerHTML = brand;
  if (roundRoot) roundRoot.textContent = `ROUND ${s.round || 1}`;
  if (utilitiesRoot) utilitiesRoot.innerHTML = headerUtilities();
  if (pauseRoot) pauseRoot.innerHTML = headerPause(s);
}
function landing(s) {
  const joined = s?.connected.learner;
  app.innerHTML = `<section class="landing"><div class="landing-identity">${brand}<p class="premise">Describe the word. <br>Lose the obvious language.</p><div class="hero-deck">${deck}<span class="spark one">✦</span><span class="spark two">✧</span></div><p class="caption">Two voices. One clock. Find another way.</p></div>
    <div class="invitation panel"><p class="eyebrow">${learner ? "YOU’RE IN" : "BETTER TOGETHER"}</p><h1>${learner ? "Your partner goes first." : "Invite your learner"}</h1>
    <p>${learner ? "Keep your lesson call open. Listen to the clues and guess out loud." : "Share a private link. Keep the conversation in your lesson call."}</p>
    ${!learner && s ? `<div class="link-row"><input id="invite-link" aria-label="Learner invite link" readonly value="${escape(joinUrl())}">${button("copy", "Copy link", "primary")}</div>` : ""}
    <div class="connection"><span class="connection-dot ${joined ? "online" : ""}"></span><div><strong>${learner ? "Connected to the game" : joined ? "Your learner is here" : s ? "Waiting for your learner…" : "Ready for a live lesson?"}</strong><p>${learner ? "Your partner will start the round." : joined ? "You describe first. Your learner guesses." : s ? "They can join on a phone or laptop." : "Sign in to Atlas to host your game."}</p></div></div>
    ${learner ? "" : button(s ? "start" : "sign-in", s ? "▶ Start Round" : "Sign in to host", "primary start-button", s && !joined)}
    ${learner
      ? `<div class="entry-footer learner-entry-footer">
          ${button("rules", "How to play", "entry-footer-action")}
          <p class="entry-rules">60 seconds each · Four forbidden words · Shared score</p>
        </div>`
      : `<div class="entry-footer tutor-entry-footer">
          <div class="entry-footer-actions">
            ${button("rules", "How to play", "entry-footer-action")}
            ${s ? '<span class="entry-footer-separator" aria-hidden="true">·</span>' : ""}
            ${s ? button("replace-learner", "Replace learner link", "entry-footer-action entry-footer-maintenance") : ""}
          </div>
          <p class="entry-rules">60 seconds each · Four forbidden words · Shared score</p>
        </div>`}
    </div></section>`;
}
function joinUrl() {
  const url = new URL("./join.html", location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("session", session);
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
  return `${learnerHeader(s)}<section class="board"><aside class="deck-area">${deck}<p>${s.remaining} cards in the deck</p></aside>
    <div class="card-area"><div class="active-card ${s.card?.nonce !== lastNonce ? "dealing" : ""} ${describer ? "face-up" : "face-down"}">${cardFace(s)}</div>
    <div class="role-caption"><p class="eyebrow"><span>TURN ${s.turn} OF 2</span> · ${describer ? "YOU’RE DESCRIBING" : "YOUR PARTNER IS DESCRIBING"}</p><p>${describer ? "Find another way to say it." : "Guess the word out loud."}</p></div></div>
    <aside class="dashboard panel"><div class="timer" role="timer" aria-label="Turn time remaining"><svg viewBox="0 0 220 220" aria-hidden="true"><circle class="timer-track" cx="110" cy="110" r="96"/><circle class="timer-progress" cx="110" cy="110" r="96"/></svg><div><span class="timer-symbol">◴</span><strong id="clock">01:00</strong><span id="timer-label">TIME TO TALK</span></div></div>
      <div class="score-area"><div class="score-label"><span>SHARED SCORE</span><strong>${s.score}<small> ${s.score === 1 ? "point" : "points"}</small></strong></div>${pile(s)}<span class="played-count">${s.played} ${s.played === 1 ? "card" : "cards"} played</span></div>
      ${describer ? `<div class="resolutions">${button("correct", "Correct", "correct")}${button("skip", "Skip", "skip")}${button("oops", "I said one!", "oops")}</div>` : '<div class="guesser-note"><span>◌</span><div><strong>GUESSER</strong><p>Listen. Ask questions. <br>Follow the clues.</p></div></div>'}
    </aside></section><div class="feedback" aria-live="polite">${feedbackText(s)}</div>
    ${s.phase === "countdown" ? '<div class="countdown-overlay"><div><p class="eyebrow">GET READY</p><strong id="countdown-number">3</strong><p>Your card. Your voice. Go.</p></div></div>' : ""}
    ${s.paused ? `<div class="pause-overlay"><div class="panel"><p class="eyebrow">TAKE YOUR TIME</p><h2>Turn paused.</h2><p>The clock is safe. Pick up when you’re ready.</p>${!learner ? button("resume", "▶ Resume turn", "primary") + button("replace-learner", "Replace learner link", "text-button") + `<input aria-label="Learner invite link" readonly value="${escape(joinUrl())}">` : "<p>Your tutor will resume the game.</p>"}</div></div>` : ""}`;
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
    <h1>${finished ? "Keep the conversation going." : switching ? (s.role === "Describer" ? "Your turn to describe." : "Your turn to guess.") : "Look what you cleared."}</h1>
    <div class="result-score"><strong>${s.score}</strong><span>shared ${s.score === 1 ? "point" : "points"}${switching ? " so far" : ""}</span></div>
    ${s.best !== null ? `<p class="best">Session best <strong>${s.best}</strong>${!switching && s.score === s.best ? " ✦" : ""}</p>` : ""}
    ${s.finalCard && !finished ? `<div class="final-card"><span>At the horn</span><strong>${escape(s.finalCard.target)}</strong>${s.finalCard.credited ? "<small>✓ Credited</small>" : s.canCredit ? button("late-correct", "They said it before the horn · +1", "text-button") : ""}</div>` : ""}
    ${switching ? `<p class="switch-copy">${ready ? "Waiting for your partner to get ready." : "Take a breath. Both of you tap ready to begin."}</p><div class="switch-actions">${button("ready", ready ? "✓ Ready" : "I’m ready", "primary", ready)}${!learner ? button("finish", "Finish", "secondary") : ""}</div>` : finished ? `<p>Your lesson call stays open. Take those new ways of saying things with you.</p>${!learner ? button("new-session", "Start a new game", "primary") : ""}` : `<div class="result-actions">${!learner ? button("replay", "▶ Play Another Round", "primary", !s.connected.learner) + button("finish", "Finish", "secondary") : "<p>Your partner can start another round or finish.</p>"}</div>`}
    ${!switching && s.review.length ? `<details class="review"><summary>Talk through ${s.review.length} unresolved ${s.review.length === 1 ? "card" : "cards"} <span>Optional</span></summary><div>${s.review.map((c) => `<article><strong>${escape(c.target)}</strong><small>${c.result === "oops" ? "Oops" : c.result === "skip" ? "Skipped" : "At the horn"}</small><p>${c.forbidden.map(escape).join(" · ")}</p></article>`).join("")}</div></details>` : ""}
    ${!learner && switching ? `<div class="switch-maintenance">${button("replace-learner", "Replace learner link", "text-button small")}${!s.connected.learner ? `<div class="link-row"><input id="invite-link" aria-label="Learner invite link" readonly value="${escape(joinUrl())}">${button("copy", "Copy link", "primary")}</div>` : ""}</div>` : ""}</div></section>`;
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
    notify("Time’s up!");
  }
  if (
    ["countdown", "active", "finished"].includes(s.phase) &&
    document.querySelector("#notice").textContent === "Time’s up!"
  )
    notify("");
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
      Date.now() + offset >= state?.deadline;
  }
  for (const el of document.querySelectorAll(
    '[data-action="start"],[data-action="replay"],[data-action="ready"],[data-action="late-correct"]',
  )) {
    if (busy) el.disabled = true;
  }
  const partnerDisconnected =
    state &&
    !failed &&
    !state.connected[learner ? "tutor" : "learner"];
  const timedPlay = state && ["countdown", "active"].includes(state.phase);

  if (partnerDisconnected && timedPlay) {
    notify(
      state.paused
        ? "Your partner is reconnecting. The turn is paused."
        : "Your partner is reconnecting. The clock continues unless the tutor pauses.",
    );
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
  if (state.phase === "countdown") ms = 60000;
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
      String(603.2 * (1 - Math.min(1, ms / 60000))),
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
    Date.now() - lastSync > 4000 &&
    ["active", "countdown"].includes(state.phase)
  ) {
    failed = true;
    notify(
      "Reconnecting… Your turn clock continues. Actions will return when connected.",
    );
  }
  updateControls();
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
async function act(action) {
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
    audio ||= new AudioContext();
    await audio.resume();
    lastKey = "";
    render();
    return;
  }
  if (action === "copy") {
    try {
      await navigator.clipboard.writeText(joinUrl());
      notify("Learner link copied.");
    } catch {
      document.querySelector("#invite-link")?.select();
      notify("Select and copy the learner link.");
    }
    return;
  }
  if (action === "sign-in")
    return window.ArcadePublicAccess.requestGameAccess(
      "arcade:forbidden-words",
    );
  if (action === "new-session") {
    session = uuid();
    storage.set(`fw:tutor:${owner}`, session);
    state = null;
    lastKey = "";
    await request("create", { theme: tutorTheme() });
    schedulePoll();
    return;
  }
  if (busy) return;
  if (action === "retry") {
    if (pending) return sendPending();
    return boot();
  }
  if (
    action === "replace-learner" &&
    !confirm(
      "Replace the learner link? The previous learner will lose access. Share the new link with your learner.",
    )
  )
    return;
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
  busy = true;
  updateControls();
  const operation = pending;
  try {
    await request(
      operation.action,
      { card: operation.card, round: operation.round, turn: operation.turn },
      operation.id,
    );
    pending = null;
    notify(
      operation.action === "replace-learner"
        ? "New learner link ready. Copy it and share it with your learner."
        : "",
    );
  } catch (error) {
    notify(error.message);
    if (error.status && error.status < 500) pending = null;
    else {
      failed = true;
    }
  } finally {
    busy = false;
    lastKey = "";
    if (state) render();
    schedulePoll();
  }
}
function schedulePoll() {
  clearTimeout(pollTimer);
  pollTimer = setTimeout(poll, state?.phase === "finished" ? 3000 : retryDelay);
}
function showEntryError(error) {
  state = null;
  lastKey = "";
  lastNonce = null;
  pending = null;
  failed = true;
  clearTimeout(pollTimer);
  document.documentElement.style.setProperty("--heat", "0");
  app.innerHTML = `<section class="entry-error panel">${brand}<h1>Let’s get you connected.</h1><p>${escape(error.message)}</p>${button("retry", "Try again", "primary")}${!learner && owner ? button("new-session", "Create a fresh game", "text-button") : ""}</section>`;
  notify("");
}
async function poll() {
  if (busy) return schedulePoll();
  try {
    if (pending) {
      await sendPending();
      return;
    }
    await request("poll");
    if (
      document.querySelector("#notice").textContent.startsWith("Reconnecting")
    )
      notify("Connected again.");
  } catch (error) {
    if ([401, 403, 410].includes(error.status)) {
      showEntryError(error);
      return;
    }
    failed = true;
    retryDelay = Math.min(5000, retryDelay * 2);
    notify(error.message);
    updateControls();
  }
  schedulePoll();
}
async function boot() {
  clearTimeout(pollTimer);
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
      await request("join", { invite });
    } else {
      if (!owner && !(await setupTutor())) return;
      await request("create", { theme: tutorTheme() });
    }
    schedulePoll();
  } catch (error) {
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
window.addEventListener("online", () => {
  clearTimeout(pollTimer);
  poll();
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && state) {
    clearTimeout(pollTimer);
    poll();
  }
});
window.addEventListener("atlas:session-change", (event) => {
  if (learner || LOCAL) return;
  atlasSession =
    event.detail?.session || window.AtlasBridge?.readActiveSession?.() || null;
  if (state) syncAtlasContinuity(state);
});
window.addEventListener("atlas:appearance-change", (event) => {
  if (learner || LOCAL || !state) return;
  syncTutorTheme(event.detail?.mode || tutorTheme());
});
setInterval(tick, 100);
boot();
