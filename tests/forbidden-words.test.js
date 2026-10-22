const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const { initialState, command, view, advance } = await import(
    "../arcade/forbidden-words/server/game.mjs"
  );
  const { CARDS } = await import("../arcade/forbidden-words/server/cards.mjs");
  const now = 100000;
  let s = initialState(now);
  s.learnerHash = "test";
  s.seen.learner = now;
  const act = (actor, action, time, extra = {}, id = crypto.randomUUID()) =>
    command(s, actor, { action, id, round: s.round, turn: s.turn, ...extra }, time);
  assert.equal(s.theme, "light");
  assert.throws(() => act("learner", "theme", now, { theme: "night" }), /Only the tutor/);
  act("tutor", "theme", now, { theme: "night" });
  assert.equal(s.theme, "night");
  assert.equal(view(s, "learner", now, 1).theme, "night");
  act("tutor", "theme", now, { theme: "light" });
  assert.equal(s.theme, "light");
  assert.ok(CARDS.length >= 100);
  assert.equal(new Set(CARDS.map((c) => c.target)).size, CARDS.length);
  for (const c of CARDS) {
    assert.equal(c.forbidden.length, 4);
    assert.equal(new Set(c.forbidden).size, 4);
    assert.ok(!c.forbidden.includes(c.target));
  }
  act("tutor", "start", now);
  assert.equal(s.startsAt, now + 3000);
  assert.equal(s.deadline, now + 123000);
  assert.equal(view(s, "tutor", now, 1).turnMs, 120000);
  let secret = CARDS[s.card.index];
  let guessed = JSON.stringify(view(s, "learner", now, 1));
  assert.ok(!guessed.includes(secret.target));
  for (const w of secret.forbidden) assert.ok(!guessed.includes(`"${w}"`));
  assert.deepEqual(Object.keys(view(s, "learner", now, 1).card), ["nonce"]);
  assert.throws(() =>
    act("tutor", "correct", now + 2000, { card: s.card.nonce }),
  );
  assert.throws(() =>
    act("learner", "correct", now + 3000, { card: s.card.nonce }),
  );
  const original = s.card.nonce,
    id = crypto.randomUUID();
  act("tutor", "correct", now + 3500, { card: original }, id);
  assert.equal(s.score, 1);
  assert.notEqual(s.card.nonce, original);
  assert.equal(s.deadline, now + 123000);
  act("tutor", "correct", now + 3501, { card: original }, id);
  assert.equal(s.score, 1);
  assert.throws(() => act("tutor", "correct", now + 3502, { card: original }));
  for (const action of ["skip", "oops"]) {
    const old = s.card;
    act("tutor", action, now + 4000, { card: old.nonce });
    assert.notEqual(s.card.nonce, old.nonce);
    assert.equal(s.score, 1);
    const learnerView = view(s, "learner", now + 4000, 5);
    assert.deepEqual(Object.keys(learnerView.card), ["nonce"]);
    assert.equal(learnerView.feedback?.target, undefined);
  }
  assert.throws(() => act("learner", "pause", now + 4500));
  act("tutor", "pause", now + 5000);
  advance(s, now + 90000);
  assert.equal(s.phase, "active");
  act("tutor", "resume", now + 90000);
  assert.equal(s.deadline, now + 208000);
  const final = s.card.nonce;
  advance(s, s.deadline);
  assert.equal(s.phase, "switch");
  assert.equal(s.card, null);
  assert.equal(s.describer, "learner");
  act("tutor", "late-correct", s.deadline + 1, { card: final });
  assert.equal(s.score, 2);
  assert.throws(() =>
    act("tutor", "late-correct", s.deadline + 2, { card: final }),
  );
  act("tutor", "ready", s.deadline + 3);
  act("learner", "ready", s.deadline + 4);
  assert.equal(s.turn, 2);
  assert.equal(s.phase, "countdown");
  assert.equal(view(s, "tutor", s.startsAt, 10).card.target, undefined);
  assert.equal(view(s, "learner", s.startsAt, 10).card.forbidden.length, 4);
  act("learner", "correct", s.startsAt + 1, { card: s.card.nonce });
  advance(s, s.deadline);
  assert.equal(s.phase, "results");
  assert.equal(s.score, 3);
  assert.equal(s.best, 3);
  assert.ok(view(s, "tutor", s.deadline, 11).review.length > 0);
  s.seen.learner = s.deadline;
  act("tutor", "replay", s.deadline + 1);
  assert.equal(s.round, 2);
  assert.equal(s.describer, "learner");
  assert.equal(s.score, 0);
  assert.equal(s.best, 3);
  assert.throws(
    () => act("tutor", "pause", s.startsAt + 1, { round: 1, turn: 2 }),
    /moved to another turn/,
  );
  assert.equal(s.paused, null);
  advance(s, s.deadline);
  const switchAt = s.deadline;
  act("tutor", "ready", switchAt + 1);
  act("learner", "ready", switchAt + 13000);
  assert.equal(s.phase, "switch");
  assert.equal(s.ready.length, 2);
  act("tutor", "poll", switchAt + 13001);
  assert.equal(s.phase, "countdown");
  assert.equal(s.turn, 2);
  assert.equal(s.startsAt, switchAt + 16001);
  assert.throws(
    () => act("tutor", "pause", s.startsAt + 1, { turn: 1 }),
    /moved to another turn/,
  );
  assert.equal(s.paused, null);
  advance(s, s.deadline);
  act("tutor", "finish", s.deadline + 1);
  assert.equal(s.phase, "finished");
  // End Game is a tutor-only room termination. Live play must be paused first.
  for (const phase of ["waiting", "countdown", "active"]) {
    const at = 200000;
    const game = initialState(at);
    game.learnerHash = "existing-learner";
    game.seen.learner = at;
    const endAction = (actor, action, when) =>
      command(game, actor, {
        action, id: crypto.randomUUID(), round: game.round, turn: game.turn,
      }, when);
    if (phase !== "waiting") {
      endAction("tutor", "start", at);
      if (phase === "active") advance(game, at + 3001);
      assert.throws(
        () => endAction("tutor", "finish", at + 3100),
        /End the game while waiting/,
      );
      endAction("tutor", "pause", at + 3101);
      assert.ok(game.paused);
    }
    assert.throws(() => endAction("learner", "finish", at + 3102));
    endAction("tutor", "finish", at + 3103);
    assert.equal(game.phase, "finished");
    assert.equal(game.card, null);
    assert.equal(game.paused, null);
    assert.equal(game.late, null);
    assert.deepEqual(game.ready, []);
    assert.equal(view(game, "learner", at + 3104, 1).phase, "finished");
    assert.equal(view(game, "learner", at + 3104, 1).card, null);
    advance(game, at + 200000);
    assert.equal(game.phase, "finished");
    assert.throws(() => endAction("tutor", "finish", at + 200001));
  }
  const tutorPage = fs.readFileSync(
    "arcade/forbidden-words/index.html",
    "utf8",
  );
  const learnerPage = fs.readFileSync(
    "arcade/forbidden-words/join.html",
    "utf8",
  );
  const client = fs.readFileSync(
    "arcade/forbidden-words/app.mjs",
    "utf8",
  );
  const gameCss = fs.readFileSync(
    "arcade/forbidden-words/game.css",
    "utf8",
  );
  const nightArtwork = fs.readFileSync(
    "arcade/forbidden-words/night-atmosphere.svg",
    "utf8",
  );
  assert.ok(nightArtwork.includes('viewBox="0 0 1728 862"'));
  assert.ok(nightArtwork.includes('<path'));
  assert.ok(!/<script\b|https?:\/\//i.test(nightArtwork.replace('http://www.w3.org/2000/svg', '')));
  assert.ok(gameCss.includes('background: url("./night-atmosphere.svg") center / cover no-repeat;'));
  assert.ok(gameCss.includes("@keyframes fw-rim-orbit"));
  assert.ok(gameCss.includes('html[data-theme="night"] .active-card::before {'));
  assert.ok(gameCss.includes('html[data-theme="night"] .active-card::after {'));
  assert.ok(gameCss.includes("-webkit-mask-composite: xor;"));
  assert.ok(gameCss.includes("mask-composite: exclude;"));
  assert.ok(gameCss.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(gameCss.includes(".dealing {\n  animation: deal"));
  // The animated border must not override .dealing on the card itself.
  const nightCardRule = gameCss.match(/html\[data-theme="night"\] \.active-card \{([^}]*)\}/);
  assert.ok(nightCardRule && !nightCardRule[1].includes("animation:"));
  // Exercise the actual browser notice helper with controlled timeouts.
  const noticeSource = client.slice(
    client.indexOf("let noticeTimeout;"),
    client.indexOf("function normalizeTheme(mode)"),
  );
  assert.ok(noticeSource.startsWith("let noticeTimeout;"));
  const noticeEl = { textContent: "" };
  const noticeTimers = new Map();
  let nextNoticeTimerId = 0;
  const notice = new Function("document", "setTimeout", "clearTimeout",
    `${noticeSource}\nreturn notify;`)(
    { querySelector: () => noticeEl },
    (callback, duration) => {
      const id = ++nextNoticeTimerId;
      noticeTimers.set(id, { callback, duration });
      return id;
    },
    (id) => noticeTimers.delete(id),
  );
  notice("Learner link copied.");
  assert.equal(noticeEl.textContent, "Learner link copied.");
  assert.equal([...noticeTimers.values()][0].duration, 3000);
  const firstNoticeTimerId = [...noticeTimers.keys()][0];
  const firstNoticeTimer = noticeTimers.get(firstNoticeTimerId);
  noticeTimers.delete(firstNoticeTimerId);
  firstNoticeTimer.callback();
  assert.equal(noticeEl.textContent, "");
  notice("Reconnecting…", { persistent: true });
  assert.equal(noticeTimers.size, 0);
  assert.equal(noticeEl.textContent, "Reconnecting…");
  notice("Reconnecting…", { persistent: true });
  assert.equal(noticeTimers.size, 0);
  notice("Connected again.");
  assert.equal(noticeEl.textContent, "Connected again.");
  assert.equal([...noticeTimers.values()][0].duration, 3000);
  notice("Manual copying needed", { duration: 7000 });
  assert.equal([...noticeTimers.values()][0].duration, 7000);
  notice("");
  assert.equal(noticeEl.textContent, "");
  assert.equal(noticeTimers.size, 0);
  assert.ok(!client.includes('notify("Time’s up!")'));
  assert.ok(
    tutorPage.includes(
      'data-player="tutor" data-atlas-world="arcade" data-atlas-surface="content"',
    ),
  );
  assert.ok(!/^button\s*\{/m.test(gameCss));
  assert.ok(!/^button:hover/m.test(gameCss));
  assert.ok(tutorPage.includes('id="atlas-session-panel-root"'));
  assert.ok(tutorPage.includes('id="arcade-game-return-root"'));
  assert.ok(tutorPage.includes('id="arcade-game-actions-root"'));
  assert.ok(client.includes("window.AtlasSessionPanel.mount"));
  const setupTutorBlock = client.slice(
    client.indexOf("async function setupTutor()"),
    client.indexOf("async function request("),
  );
  assert.ok(!setupTutorBlock.includes("  window.ArcadeGameChrome.mountGame({\n    root: \"#playing-chrome\",\n    returnRoot: \"#arcade-game-return-root\",\n    actionsRoot: \"#arcade-game-actions-root\",\n  });\n  setupTutorMobileUtilities();\n"));
  assert.ok(client.includes('returnRoot: "#arcade-game-return-root"'));
  assert.ok(client.includes('actionsRoot: "#arcade-game-actions-root"'));
  assert.ok(tutorPage.includes('id="fw-header-pause"'));
  assert.ok(client.includes("setupTutorMobileUtilities"));
  assert.ok(client.includes("function ensurePlayingChrome()"));
  assert.ok(client.includes("if (waiting) return;\n  ensurePlayingChrome();"));
  assert.ok(client.includes("playingChromeMounted = true;"));
  assert.ok(gameCss.includes("#landing-chrome[hidden],\n#playing-chrome[hidden] {\n  display: none !important;"));
  assert.ok(client.includes("closeTutorMobileMenu"));
  assert.ok(client.includes('document.querySelector("#rules")?.addEventListener("click"'));

  assert.ok(client.includes('window.matchMedia("(max-width: 820px)")'));
  assert.ok(client.includes("roundRoot.textContent = `ROUND ${s.round || 1}`"));
  assert.ok(client.includes("<span>TURN ${s.turn} OF 2</span> · ${describer ?"));
  assert.ok(gameCss.includes("#chrome {\n  z-index: 100;"));
  assert.ok(gameCss.includes(".arcade-game-chrome-game-menu #fw-header-utilities"));
  assert.ok(!gameCss.includes("#playing-chrome.arcade-game-chrome-host"));
  const baseGameHeading = gameCss.match(/\.game-heading \{([\s\S]*?)\n\}/);
  assert.ok(baseGameHeading);
  assert.ok(!baseGameHeading[1].includes("grid-template-columns"));
  assert.ok(gameCss.includes("@media (min-width: 821px)"));
  assert.ok(gameCss.includes("grid-template-columns: 20px minmax(0, 1fr);"));
  assert.ok(client.includes('class="utility-icon"'));
  assert.ok(client.includes('class="utility-label"'));
  assert.ok(gameCss.includes("#fw-header-round {"));
  assert.ok(gameCss.includes(".rules-scroll"));
  assert.ok(gameCss.includes("scrollbar-width: none;"));
  assert.ok(gameCss.includes(".rules-scroll::-webkit-scrollbar"));
  assert.ok(gameCss.includes(".rules-scrollbar-thumb"));
  assert.ok(gameCss.includes("var(--atlas-modal-scrollbar"));
  assert.ok(!gameCss.includes("::-webkit-scrollbar-button"));
  const rulesScrollBlock = gameCss.match(/\.rules-scroll \{([\s\S]*?)\n\}/);
  assert.ok(rulesScrollBlock);
  assert.ok(!rulesScrollBlock[1].includes("scrollbar-color:"));
  assert.ok(client.includes("function syncRulesScrollbar()"));
  assert.ok(client.includes('rulesScrollbar.className = "rules-scrollbar"'));
  assert.ok(client.includes('rulesScrollbarThumb.className = "rules-scrollbar-thumb"'));
  assert.ok(client.includes("requestAnimationFrame(syncRulesScrollbar)"));
  assert.ok(tutorPage.includes('class="atlas-modal-close rules-close"'));
  assert.ok(tutorPage.includes('id="replace-learner-confirm"'));
  assert.ok(tutorPage.includes('id="end-game-confirm"'));
  assert.ok(tutorPage.includes('value="end"'));
  assert.ok(!learnerPage.includes('id="end-game-confirm"'));
  assert.ok(client.includes("function confirmEndGame()"));
  assert.ok(client.includes('dialog.returnValue === "end"'));
  assert.ok(client.includes('button("finish", "End game", "entry-footer-action end-game-action")'));
  assert.ok(client.includes('button("finish", "End game", "secondary end-game-button")'));
  assert.ok(client.includes('class="pause-invitation"'));
  assert.ok(client.includes('id="invite-link" class="invite-link-input"'));
  assert.ok(gameCss.includes(".pause-actions {"));
  assert.ok(gameCss.includes(".pause-invitation {"));
  assert.ok(gameCss.includes("#end-game-confirm {"));

  assert.ok(tutorPage.includes('method="dialog" class="fw-confirm-actions"'));
  assert.ok(tutorPage.includes('value="cancel" autofocus'));
  assert.ok(tutorPage.includes('value="replace"'));
  assert.ok(!learnerPage.includes('id="replace-learner-confirm"'));
  assert.ok(client.includes('function confirmLearnerReplacement()'));
  assert.ok(client.includes('dialog.returnValue === "replace"'));
  assert.ok(!client.includes('!confirm('));
  assert.ok(gameCss.includes("#replace-learner-confirm {"));
  assert.ok(learnerPage.includes('class="atlas-modal-close rules-close"'));
  assert.ok(gameCss.includes("background: rgba(49, 90, 134, 0.07);"));
  assert.ok(learnerPage.includes("../../shared/atlas-modal-theme.css"));
  assert.ok(learnerPage.includes('data-atlas-world="arcade"'));
  assert.ok(learnerPage.includes('<html lang="en" data-theme="light">'));
  assert.ok(!learnerPage.includes('<script src="../../shared/atlas-bridge.js"></script>'));
  assert.ok(client.includes("const THEME_TRANSITION_MS = 280;"));
  assert.ok(client.includes("function applyGameTheme(mode, animate = true)"));
  assert.ok(client.includes('document.startViewTransition(apply)'));
  assert.ok(client.includes('request("theme", {'));
  assert.ok(client.includes('window.addEventListener("atlas:appearance-change"'));
  assert.ok(gameCss.includes("--fw-theme-motion: 280ms"));
  assert.ok(gameCss.includes("::view-transition-old(root)"));
  assert.ok(gameCss.includes("html.theme-changing body *"));
  assert.ok(gameCss.includes("FORBIDDEN WORDS · NIGHT"));
  assert.ok(gameCss.includes('html[data-theme="night"] body {'));
  assert.ok(gameCss.includes('html[data-theme="night"] .panel {'));
  assert.ok(gameCss.includes('html[data-theme="night"] .active-card,'));
  assert.ok(gameCss.includes('html[data-theme="night"] .card-face {'));
  assert.ok(gameCss.includes('html[data-theme="night"] .timer > div {'));
  assert.ok(gameCss.includes('html[data-theme="night"] .game-heading,'));
  assert.ok(gameCss.includes('html[data-theme="night"] dialog {'));
  assert.ok(gameCss.includes("background: var(--atlas-modal-surface);"));
  assert.ok(!gameCss.includes("linear-gradient(125deg, #b7cce2, #e3edf8 65%, #aec2db)"));
  const modalTheme = fs.readFileSync("shared/atlas-modal-theme.css", "utf8");
  assert.ok(modalTheme.includes(".atlas-modal-close:hover,"));
  assert.ok(modalTheme.includes(".atlas-modal-close:focus-visible,"));
  assert.ok(tutorPage.includes('id="landing-chrome" hidden'));
  const faviconHref = (html) =>
    html.match(/<link rel="icon" type="image\/svg\+xml"\s+href="([^"]+)"/)?.[1];
  const arcadeFavicon = faviconHref(fs.readFileSync("arcade/index.html", "utf8"));
  assert.ok(arcadeFavicon);
  assert.equal(faviconHref(tutorPage), arcadeFavicon);
  assert.equal(faviconHref(learnerPage), arcadeFavicon);
  assert.ok(client.includes("showTutorLandingChrome"));
  assert.ok(!gameCss.includes("position: absolute;\n    left: 50%;\n    top: 50%;\n    grid-area: auto !important;"));
  assert.ok(!learnerPage.includes("arcade-game-chrome"));
  assert.ok(client.includes('class="learner-game-heading"'));
  assert.ok(client.includes('class="learner-game-actions"'));
  assert.ok(gameCss.includes("width: min(100%, 330px);"));
  assert.ok(!gameCss.includes("max-height: 475px"));
  assert.ok(!gameCss.includes("max-height: 430px"));
  assert.ok(client.includes('class="game-utility-button sound-button"'));
  assert.ok(client.includes('class="game-utility-button help-button"'));
  assert.ok(client.includes('class="utilities learner-utilities"'));
  assert.ok(gameCss.includes("#app button:not(.game-utility-button):not(.entry-footer-action),"));
  assert.ok(gameCss.includes(".learner-game-heading > .round-label {"));
  assert.ok(gameCss.includes("left: 50%;"));
  assert.ok(gameCss.includes("transform: translateX(-50%);"));
  assert.ok(gameCss.includes("grid-template-columns: minmax(0, 1fr) auto auto;"));
  assert.ok(gameCss.includes("position: static;\n    grid-column: 2;"));
  assert.ok(gameCss.includes("left: auto;\n    margin: 0;\n    transform: none;"));
  assert.ok(gameCss.includes(".learner-game-actions {\n    grid-column: 3;"));
  assert.ok(!gameCss.includes(".learner-game-actions .game-utility-button {"));
  assert.ok(!gameCss.includes(".learner-game-actions .help-button {"));
  assert.ok(client.includes('"pause-button"'));
  assert.ok(client.includes('aria-label="How to play"'));
  assert.ok(client.includes('class="entry-footer learner-entry-footer"'));
  assert.ok(client.includes('class="entry-footer tutor-entry-footer"'));
  assert.ok(client.includes('class="entry-footer-actions"'));
  assert.ok(client.includes('class="entry-footer-separator"'));
  assert.ok(gameCss.includes("justify-content: center;"));
  assert.ok(gameCss.includes(".entry-footer-separator {"));
  assert.ok(gameCss.includes(".learner-entry-footer {"));
  assert.ok(gameCss.includes(".tutor-entry-footer {"));
  assert.ok(gameCss.includes(".entry-footer-actions {"));
  assert.ok(client.includes('button("rules", "How to play", "entry-footer-action")'));
  assert.ok(!client.includes('class="entry-rules"'));
  assert.ok(client.includes('class="invite-link-row"') || client.includes('class="link-row invite-link-row"'));
  assert.ok(client.includes('class="invite-link-label"'));
  assert.ok(!client.includes("Link options"));
  assert.ok(!client.includes('class="invite-tools"'));
  assert.ok(!gameCss.includes(".invite-tools {"));
  assert.ok(client.includes('joined ? button("start", "▶ Start Round"'));
  assert.ok(gameCss.includes("min-height: calc(100svh - 72px);"));
  assert.ok(gameCss.includes(".landing .invite-link-input {"));
  assert.ok(client.includes('entry-footer-action entry-footer-maintenance'));
  assert.ok(!client.includes("ⓘ How to Play"));
  assert.ok(!client.includes('class="waiting-label"'));
  assert.ok(!gameCss.includes(".waiting-label {"));
  assert.ok(!gameCss.includes(".small-note {"));
  assert.ok(gameCss.includes(".entry-footer {"));
  assert.ok(gameCss.includes(".entry-footer-action {"));
  assert.ok(gameCss.includes(".learner-entry-footer {"));
  assert.ok(gameCss.includes(".tutor-entry-footer {"));
  assert.ok(gameCss.includes(".game-utility-button:hover:not(:disabled)"));
  assert.ok(gameCss.includes("#app button:not(.game-utility-button)"));
  assert.ok(gameCss.includes(".pause-button:hover:not(:disabled)"));
  assert.ok(!gameCss.includes(".quiet {"));
  assert.ok(!client.includes('"quiet pause-button"'));
  assert.ok(!client.includes("<kbd>"));
  assert.ok(!client.includes('class="deal-arrow"'));
  assert.ok(gameCss.includes(".deck-area {"));
  assert.ok(gameCss.includes("row-gap: 66px;"));
  assert.ok(gameCss.includes(".hero-deck {"));
  assert.ok(gameCss.includes("padding-bottom: clamp(68px, 8.5svh, 82px);"));
  assert.ok(!gameCss.includes("height: 385px;"));
  assert.ok(gameCss.includes(".deck-area .deck-object {"));
  assert.ok(gameCss.includes("margin: 0;"));
  assert.ok(client.includes('{ correct: "1", skip: "2", oops: "3" }'));
  assert.ok(client.includes('aria-keyshortcuts="${shortcut}"'));
  assert.ok(tutorPage.includes("Keyboard shortcuts: 1 = Correct"));
  assert.ok(learnerPage.includes("Keyboard shortcuts: 1 = Correct"));
  assert.ok(gameCss.includes("justify-content: center;"));
  assert.ok(!gameCss.includes(".resolutions button > span {"));
  assert.ok(!gameCss.includes(".skip > span {"));
  assert.ok(!client.includes("<span>✓</span> Correct"));
  assert.ok(!client.includes("<span>↠</span> Skip"));
  assert.ok(!client.includes("<span>!</span> I said one!"));
  assert.ok(client.includes('button("correct", "Correct", "correct")'));
  assert.ok(client.includes('button("skip", "Skip", "skip")'));
  assert.ok(client.includes('button("oops", "I said one!", "oops")'));
  assert.ok(client.includes("longestWord >= 12"));
  assert.ok(client.includes("longestWord >= 9"));
  assert.ok(client.includes('"extra-long-target"'));
  assert.ok(gameCss.includes(".card-face h1.long-target {"));
  assert.ok(gameCss.includes(".card-face h1.extra-long-target {"));
  assert.ok(gameCss.includes("overflow-wrap: normal;"));
  assert.ok(gameCss.includes("word-break: normal;"));
  assert.ok(!gameCss.includes("overflow-wrap: anywhere;"));
  assert.ok(client.includes("<h2>Turn paused.</h2>"));
  assert.ok(client.includes('id="clock">02:00</strong>'));
  assert.ok(client.includes("const turnMs = state.turnMs || 120000;"));
  assert.ok(client.includes("ms / turnMs"));
  assert.ok(tutorPage.includes("Clear cards for 2 minutes"));
  assert.ok(learnerPage.includes("You each describe for 2 minutes."));
  assert.ok(!client.includes("Conversation paused."));
  assert.ok(gameCss.includes('.pause-overlay h2 {\n  font-family: "Manrope", Arial, sans-serif;'));
  assert.ok(gameCss.includes(".switch-panel {"));
  assert.ok(gameCss.includes("padding-block: 30px;"));
  assert.ok(gameCss.includes("font-size: 70px;"));
  assert.ok(gameCss.includes("border-top: 1px solid #e0e9f3;"));
  assert.ok(!gameCss.includes("padding-block: 22px;"));
  assert.ok(client.includes('class="switch-actions"'));
  assert.ok(client.includes('ready ? "✓ Ready" : "I’m ready"'));
  assert.ok(client.includes('ready ? "Waiting for your partner to get ready."'));
  assert.ok(!client.includes("✓ You’re ready — waiting for your partner"));
  assert.ok(client.includes('class="switch-maintenance"'));
  assert.ok(gameCss.includes("#notice:not(:empty) {"));
  assert.ok(gameCss.includes("left: 50%;"));
  assert.ok(gameCss.includes("body:has(#notice:not(:empty)) .feedback"));
  assert.ok(client.includes('["countdown", "active"].includes(state.phase)'));
  assert.ok(client.includes("The turn is paused."));
  assert.ok(gameCss.includes("width: max-content;"));
  assert.ok(gameCss.includes("max-width: min(680px, calc(100vw - 32px));"));
  const excludes = fs.readFileSync(".assetsignore", "utf8");
  assert.ok(excludes.includes("arcade/forbidden-words/server/"));
  const sql = fs.readFileSync(
    "supabase/migrations/20261001201937_forbidden_words_sessions.sql",
    "utf8",
  );
  assert.ok(sql.includes("enable row level security"));
  assert.ok(sql.includes("from public, anon, authenticated"));
  console.log(
    "Forbidden Words: rules, roles, timing, pause, retries, review, replay and private projections passed.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
