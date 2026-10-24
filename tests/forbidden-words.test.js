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
  const learnerProjection = view(s, "learner", now, 1);
  // Inspect the private-card projection, not unrelated public strings such as
  // the selected UI theme ("light") that may also appear on a forbidden card.
  assert.deepEqual(Object.keys(learnerProjection.card), ["nonce"]);
  assert.equal(learnerProjection.card.nonce, s.card.nonce);
  assert.equal(learnerProjection.atlasSessionId, undefined);
  assert.equal(learnerProjection.history, undefined);
  assert.equal(learnerProjection.pool, undefined);
  assert.equal(learnerProjection.cursor, undefined);
  assert.deepEqual(learnerProjection.review, []);
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
  // The tutor cannot resume until both seats are present again.
  assert.throws(() => act("tutor", "resume", now + 90000), /both players reconnect/);
  act("learner", "poll", now + 89999);
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
    let actionTime = at + 100;
    if (phase !== "waiting") {
      endAction("tutor", "start", at);
      if (phase === "active") {
        actionTime = at + 3100;
        advance(game, actionTime);
      }
      assert.throws(
        () => endAction("tutor", "finish", actionTime),
        /End the game while waiting/,
      );
      endAction("tutor", "pause", actionTime + 1);
      assert.ok(game.paused);
    }
    assert.throws(() => endAction("learner", "finish", actionTime + 2));
    endAction("tutor", "finish", actionTime + 3);
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
  // An abandoned participant freezes the clock on the server and the
  // original time is restored only after both reconnect. No scores can change.
  const disconnected = initialState(300000);
  disconnected.learnerHash = "connected-learner";
  disconnected.seen.learner = 300000;
  const dact = (actor, action, at, extra = {}) => command(
    disconnected, actor, {
      action, id: crypto.randomUUID(),
      round: disconnected.round, turn: disconnected.turn, ...extra,
    }, at,
  );
  dact("tutor", "start", 300000);
  dact("learner", "poll", 303100);
  dact("tutor", "poll", 303100);
  const expectedDeadline = disconnected.deadline;
  const offlineAt = 303100 + 12001;
  dact("tutor", "poll", offlineAt);
  assert.equal(disconnected.phase, "active");
  assert.equal(disconnected.paused.reason, "connection");
  assert.equal(disconnected.paused.at, 303100);
  assert.equal(disconnected.paused.remaining, expectedDeadline - 303100);
  const frozenCard = disconnected.card.nonce;
  const frozenScore = disconnected.score;
  assert.throws(
    () => dact("tutor", "correct", offlineAt + 1, { card: frozenCard }),
    /paused/,
  );
  assert.equal(disconnected.card.nonce, frozenCard);
  assert.equal(disconnected.score, frozenScore);
  assert.throws(() => dact("tutor", "resume", offlineAt + 2), /both players reconnect/);
  dact("learner", "poll", offlineAt + 3);
  assert.equal(disconnected.paused.reason, "connection");
  const returned = offlineAt + 4;
  dact("tutor", "resume", returned);
  assert.equal(disconnected.paused, null);
  assert.equal(disconnected.deadline, returned + expectedDeadline - 303100);

  // Losing the tutor also freezes a learner's visible turn, including when
  // the tutor browser is closed entirely.
  const tutorLost = returned + 12001;
  dact("learner", "poll", tutorLost);
  assert.equal(disconnected.paused.reason, "connection");
  assert.equal(view(disconnected, "learner", tutorLost, 10).connected.tutor, false);
  assert.throws(() => dact("learner", "resume", tutorLost + 1), /Only the tutor/);
  dact("tutor", "poll", tutorLost + 2);
  dact("tutor", "resume", tutorLost + 3);
  assert.equal(disconnected.paused, null);

  // Countdown also freezes rather than slipping into active play while
  // the learner is absent, with the countdown restored on reconnection.
  const countdownRoom = initialState(500000);
  countdownRoom.learnerHash = "connected";
  countdownRoom.seen.learner = 500000;
  const cact = (actor, action, at) => command(countdownRoom, actor, {
    action, id: crypto.randomUUID(), round: countdownRoom.round,
    turn: countdownRoom.turn,
  }, at);
  cact("tutor", "start", 500000);
  cact("tutor", "poll", 515000);
  assert.equal(countdownRoom.phase, "countdown");
  assert.equal(countdownRoom.paused.reason, "connection");
  assert.equal(countdownRoom.paused.countdown, 3000);
  cact("learner", "poll", 515001);
  cact("tutor", "resume", 515002);
  assert.equal(countdownRoom.startsAt, 518002);
  assert.equal(countdownRoom.deadline, 638002);

  // Ownership is established at creation, never changed through game commands.
  const scopedGame = initialState(40000);
  scopedGame.atlasSessionId = "session-alex";
  assert.equal(view(scopedGame, "tutor", 40010, 1).atlasSessionId, "session-alex");
  assert.equal(view(scopedGame, "learner", 40010, 1).atlasSessionId, undefined);
  assert.throws(() => command(scopedGame, "tutor", {
    action: "bind-learner", id: crypto.randomUUID(),
    round: 0, turn: 0, atlasSessionId: "session-blair",
  }, 40010), /Unknown action/);
  assert.equal(scopedGame.atlasSessionId, "session-alex");

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
  // Exercise room selection with a fake Atlas Bridge; no network required.
  const vm = require("node:vm");
  const ownershipSnippet = client.slice(
    client.indexOf("// Only the selected Atlas learner may own"),
    client.indexOf("function syncAtlasContinuity(s)"),
  );
  assert.ok(ownershipSnippet.startsWith("// Only"));
  const bookmarks = new Map([["fw:tutor:test-owner:atlas:session-alex", "room-alex"]]);
  const selected = { id: "session-alex", name: "Alex" };
  const harness = {
    owner: "test-owner", learner: false, gameLearnerId: "session-alex",
    session: "room-alex", atlasSession: selected, roomEpoch: 0,
    state: { phase: "active" }, pending: { action: "skip" }, busy: true,
    failed: false, retryDelay: 650, lastKey: "cached",
    liveClient: null, liveMode: false, liveRoomKey: id => `fw:transport:${id}`,
    lastNonce: "secret", lastPhase: "active", lastFeedback: null,
    pollTimer: 1, app: { innerHTML: "" }, brand: "Brand", deck: "Deck",
    window: { AtlasBridge: { readActiveSession: () => selected } },
    storage: {
      get: key => bookmarks.get(key) || null,
      set: (key, value) => bookmarks.set(key, value),
    },
    clearTimeout: () => {}, notify: () => {}, showTutorLandingChrome: () => {},
    escape: value => String(value), button: (_action, label) => label,
    boot: () => { harness.boots++; }, boots: 0,
  };
  vm.runInNewContext(ownershipSnippet + ";this.change = selectTutorRoom;", harness);
  harness.change({ id: "session-blair", name: "Blair" });
  assert.equal(harness.session, null);
  assert.equal(harness.pending, null);
  assert.equal(harness.state, null);
  assert.equal(harness.boots, 0);
  assert.equal(harness.roomEpoch, 1);
  assert.ok(harness.app.innerHTML.includes("Ready to play?"));
  assert.ok(harness.app.innerHTML.includes("Create Game"));
  assert.ok(!harness.app.innerHTML.includes("Blair"));
  assert.ok(!harness.app.innerHTML.includes("Played before this update"));
  assert.equal(bookmarks.get("fw:tutor:test-owner:atlas:session-alex"), "room-alex");
  harness.change({ id: "session-alex", name: "Alex" });
  assert.equal(harness.session, "room-alex");
  assert.equal(harness.boots, 1);
  assert.equal(harness.roomEpoch, 2);
  harness.change({ id: "session-alex", name: "Alex renamed" });
  assert.equal(harness.roomEpoch, 2);
  assert.equal(harness.boots, 1);
  assert.ok(!client.includes("storage.set(\`fw:tutor:\${owner}\`, session)"));
  assert.ok(client.includes('if (requestSession !== session || requestEpoch !== roomEpoch)'));
  assert.ok(client.includes("if (window.AtlasBridge.readActiveSession?.()?.id !== gameLearnerId) return;"));
  assert.ok(!tutorPage.includes('id="recover-legacy-confirm"'));
  assert.ok(!learnerPage.includes('id="recover-legacy-confirm"'));
  assert.ok(!client.includes("recover-legacy"));
  assert.ok(!client.includes('extra.atlasSessionId === null'));
  assert.ok(client.includes('data.state.atlasSessionId !== gameLearnerId'));
  assert.ok(!client.includes("No Forbidden Words game is linked"));
  assert.ok(!client.includes("Played before this update"));
  assert.ok(!gameCss.includes(".room-recovery"));


  // Invitations rotate on a confirmed server reply; show persistent replacement
  // feedback only for the matching token, never for a different room/invite.
  const inviteSnippet = client.slice(
    client.indexOf("function replacementReady()"),
    client.indexOf("function landing(s)"),
  );
  assert.ok(inviteSnippet.includes("function invitationLink()"));
  const inviteHarness = {
    state: { invite: "original" },
    replacementInvite: null,
    escape: x => String(x),
    joinUrl: () => "https://example.test/join",
    button: (_action, label) => label,
  };
  vm.runInNewContext(inviteSnippet + ";this.makeInvite = invitationLink;", inviteHarness);
  assert.ok(inviteHarness.makeInvite().includes("Private game link"));
  assert.ok(inviteHarness.makeInvite().includes("Copy link"));
  assert.ok(!inviteHarness.makeInvite().includes("Previous invitation disabled"));
  inviteHarness.replacementInvite = "replacement";
  inviteHarness.state.invite = "replacement";
  assert.ok(inviteHarness.makeInvite().includes("Replacement link"));
  assert.ok(inviteHarness.makeInvite().includes("Copy new link"));
  assert.ok(inviteHarness.makeInvite().includes("Previous invitation disabled"));
  inviteHarness.state.invite = "other-session-token";
  assert.ok(inviteHarness.makeInvite().includes("Private game link"));
  assert.ok(!inviteHarness.makeInvite().includes("Previous invitation disabled"));

  // Invite/replacement controls belong to connection recovery, not play.
  // Test the actual waiting, paused, and role-swap render functions against
  // connected and disconnected states for the tutor.
  const phaseRender = (start, end, name) => {
    const app = { innerHTML: "" };
    const context = {
      learner: false, app, brand: "Forbidden Words", deck: "DECK",
      escape: x => String(x), lastNonce: null,
      button: (action, label) => `BUTTON:${action}:${label}`,
      invitationLink: () => "PRIVATE-LINK-MARKER",
      replacementReady: () => false,
      learnerHeader: () => "", pile: () => "", cardFace: () => "",
      feedbackText: () => "",
    };
    const snippet = client.slice(client.indexOf(start), client.indexOf(end));
    assert.ok(snippet.startsWith(start), "Could not locate " + name);
    vm.runInNewContext(snippet + ";this.display = " + name + ";", context);
    return { display: context.display, app };
  };
  const waitingView = phaseRender("function landing(s)", "function joinUrl()", "landing");
  const waiting = { connected: { tutor: true, learner: false }, invite: "token" };
  waitingView.display(waiting);
  assert.ok(waitingView.app.innerHTML.includes("Invite your learner"));
  assert.ok(waitingView.app.innerHTML.includes("PRIVATE-LINK-MARKER"));
  assert.ok(waitingView.app.innerHTML.includes("Reset invitation"));
  waitingView.display({ ...waiting, connected: { tutor: true, learner: true } });
  assert.ok(waitingView.app.innerHTML.includes("Ready to play?"));
  assert.ok(waitingView.app.innerHTML.includes("Start Round"));
  assert.ok(waitingView.app.innerHTML.includes("Cancel game"));
  assert.ok(!waitingView.app.innerHTML.includes("PRIVATE-LINK-MARKER"));
  assert.ok(!waitingView.app.innerHTML.includes("Reset invitation"));

  const pausedState = {
    phase: "active", paused: { reason: "connection", remaining: 60000 },
    connected: { tutor: true, learner: true },
    role: "Describer", card: { nonce: "card" },
    score: 1, remaining: 130, played: 1, turn: 1, round: 1,
  };
  const renderPaused = s => {
    // board(s) returns markup rather than writing into the app root.
    const local = {
      learner: false, deck: "DECK", lastNonce: null,
      button: (action, label) => `BUTTON:${action}:${label}`,
      invitationLink: () => "PRIVATE-LINK-MARKER",
      replacementReady: () => false, learnerHeader: () => "",
      pile: () => "", cardFace: () => "", feedbackText: () => "",
    };
    const snippet = client.slice(client.indexOf("function board(s)"), client.indexOf("function feedbackText(s)"));
    vm.runInNewContext(snippet + ";this.boardView = board;", local);
    return local.boardView(s);
  };
  const resumed = renderPaused(pausedState);
  assert.ok(resumed.includes("Resume turn"));
  assert.ok(resumed.includes("End game"));
  assert.ok(!resumed.includes("PRIVATE-LINK-MARKER"));
  assert.ok(!resumed.includes("Reset invitation"));
  assert.ok(!resumed.includes("Invitation &amp; reconnect"));
  const missing = renderPaused({ ...pausedState, connected: { tutor: true, learner: false } });
  assert.ok(missing.includes("Partner disconnected."));
  assert.ok(missing.includes("Invitation &amp; reconnect"));
  assert.ok(missing.includes("PRIVATE-LINK-MARKER"));
  assert.ok(missing.includes("Reset invitation"));

  const betweenContext = {
    learner: false, deck: "DECK", learnerHeader: () => "",
    button: (action, label) => `BUTTON:${action}:${label}`,
    invitationLink: () => "PRIVATE-LINK-MARKER",
    escape: x => String(x),
  };
  const betweenSnippet = client.slice(
    client.indexOf("function between(s)"),
    client.indexOf("function render()"),
  );
  vm.runInNewContext(betweenSnippet + ";this.betweenView = between;", betweenContext);
  const swapState = {
    phase: "switch", role: "Guesser", actor: "tutor", ready: [],
    score: 2, best: null, finalCard: null, review: [],
    connected: { tutor: true, learner: true },
  };
  const normalSwap = betweenContext.betweenView(swapState);
  assert.ok(normalSwap.includes("I’m ready"));
  assert.ok(!normalSwap.includes("PRIVATE-LINK-MARKER"));
  assert.ok(!normalSwap.includes("Reset invitation"));
  const recoverySwap = betweenContext.betweenView({
    ...swapState, connected: { tutor: true, learner: false },
  });
  assert.ok(recoverySwap.includes("PRIVATE-LINK-MARKER"));
  assert.ok(recoverySwap.includes("Reset invitation"));

  // The learner sees actionable recovery for both the old HTTP and new
  // live-room errors, never an endless retry for a claimed/replaced seat.
  const entrySnippet = client.slice(
    client.indexOf("function showEntryError(error)"),
    client.indexOf("async function poll()"),
  );
  const entryHarness = {
    learner: true, state: {}, lastKey: "", lastNonce: "", pending: null,
    failed: false, pollTimer: 1, app: { innerHTML: "" },
    document: { documentElement: { style: { setProperty: () => {} } } },
    brand: "Forbidden Words", owner: null,
    escape: value => String(value),
    button: (_action, label) => label,
    clearTimeout: () => {}, notify: () => {}, stopLive: () => {},
  };
  vm.runInNewContext(entrySnippet + ";this.displayEntryError = showEntryError;", entryHarness);
  for (const claimedSeatMessage of [
    "This learner seat is already in use. Ask your tutor for a replacement link.",
    "This learner seat is already in use.",
  ]) {
    entryHarness.displayEntryError({ status: 403, message: claimedSeatMessage });
    assert.ok(entryHarness.app.innerHTML.includes("<h1>This invitation is already in use.</h1>"));
    assert.ok(entryHarness.app.innerHTML.includes("<p>Ask your tutor to send you a new link.</p>"));
    assert.ok(!entryHarness.app.innerHTML.includes("Reopen the original learner window"));
    assert.ok(!entryHarness.app.innerHTML.includes("Try again"));
  }
  for (const invalidInviteMessage of [
    "This invitation is no longer available.",
    "This learner seat has been replaced.",
    "This invite is no longer available. Ask your tutor for a new link.",
  ]) {
    entryHarness.displayEntryError({ status: 403, message: invalidInviteMessage });
    assert.ok(entryHarness.app.innerHTML.includes("reset the invitation"));
    assert.ok(!entryHarness.app.innerHTML.includes("Try again"));
  }
  entryHarness.displayEntryError({ status: 410, message: "This game has expired." });
  assert.ok(entryHarness.app.innerHTML.includes("start a new game"));
  assert.ok(!entryHarness.app.innerHTML.includes("Try again"));
  entryHarness.displayEntryError({ status: 503, message: "Connection failed." });
  assert.ok(entryHarness.app.innerHTML.includes("Connection failed."));
  assert.ok(entryHarness.app.innerHTML.includes("Try again"));
  assert.ok(client.includes('finished ? "That’s a wrap!"'));
  assert.ok(!client.includes("Your lesson call stays open."));
  assert.ok(!client.includes("Take those new ways of saying things with you."));

  // Repeated pushed state must not rebuild the header's Pause/Resume
  // button; replacing it made the control flash and lose focus mid-play.
  const headerSnippet = client.slice(
    client.indexOf("function updateTutorHeader(s)"),
    client.indexOf("function replacementReady()"),
  );
  let pauseRenders = 0;
  const pauseRoot = {
    node: null,
    querySelector: () => pauseRoot.node,
    contains: () => false,
    set innerHTML(value) {
      pauseRenders++;
      this.node = value ? {
        dataset: { action: value.includes('data-action="resume"') ? "resume" : "pause" },
      } : null;
    },
  };
  const headerHarness = {
    learner: false, brand: "", ensurePlayingChrome: () => {},
    headerPause: s => '<button data-action="' + (s.paused ? "resume" : "pause") + '"></button>',
    headerUtilities: () => "",
    document: {
      activeElement: null,
      querySelector: selector => selector === "#fw-header-pause" ? pauseRoot : null,
    },
  };
  vm.runInNewContext(headerSnippet + ";this.updateHeader = updateTutorHeader;", headerHarness);
  const activeState = { phase: "active", round: 1, paused: null };
  headerHarness.updateHeader(activeState);
  headerHarness.updateHeader({ ...activeState });
  assert.equal(pauseRenders, 1, "Pushed state cannot flash the Pause button");
  headerHarness.updateHeader({ ...activeState, paused: { reason: "connection" } });
  assert.equal(pauseRenders, 2, "A real pause must switch to Resume");
  headerHarness.updateHeader({ ...activeState, paused: { reason: "connection" } });
  assert.equal(pauseRenders, 2, "Repeated connection state cannot flash Resume");

  // A four-second heartbeat/state push is not new tutor progress. Only
  // room/round/status changes should write to Atlas cloud continuity.
  const continuitySnippet = client.slice(
    client.indexOf("function syncAtlasContinuity(s)"),
    client.indexOf("function ensurePlayingChrome()"),
  );
  const continuityWrites = [];
  const continuityHarness = {
    learner: false, LOCAL: false, gameLearnerId: "lesson-1",
    session: "room-1", lastContinuityKey: "",
    REGISTRY_ID: "arcade:forbidden-words", URL,
    location: { href: "https://atlasfortutors.com/arcade/forbidden-words/" },
    window: { AtlasBridge: {
      readActiveSession: () => ({ id: "lesson-1" }),
      upsertSessionState: (...args) => continuityWrites.push(args),
      touchRecentActivity: () => {},
    } },
  };
  vm.runInNewContext(continuitySnippet + ";this.sync = syncAtlasContinuity;", continuityHarness);
  continuityHarness.sync({ phase: "waiting", round: 0 });
  continuityHarness.sync({ phase: "waiting", round: 0 });
  continuityHarness.sync({ phase: "active", round: 1 });
  continuityHarness.sync({ phase: "active", round: 1 });
  continuityHarness.sync({ phase: "results", round: 1 });
  continuityHarness.sync({ phase: "finished", round: 1 });
  assert.equal(continuityWrites.length, 3,
    "Repeated live state updates should not flood Supabase continuity saves");

  // Visible background-tab wakeups rely on socket liveness rather than the
  // frozen JavaScript timer's stale timestamp.
  assert.match(client, /\(!liveMode \|\| !liveClient\?\.connected\)/);
  assert.match(client, /if \(failed && liveClient\?\.connected\)/);

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
  assert.ok(client.includes('button("finish", "Cancel game", "entry-footer-action end-game-action")'));
  assert.ok(client.includes('dialog.querySelector("#end-game-title").textContent = waiting ? "Cancel this game?"'));
  assert.ok(tutorPage.includes('id="end-game-eyebrow"'));
  assert.ok(client.includes('button("finish", "End game", "secondary end-game-button")'));
  assert.ok(client.includes('<details class="pause-invitation"'));
  assert.ok(client.includes("Invitation &amp; reconnect"));
  assert.ok(client.includes('button("replace-learner", "Reset invitation"'));
  assert.ok(client.includes("replacementInvite = state?.invite || null"));
  assert.ok(tutorPage.includes("Reset invitation?"));
  assert.ok(gameCss.includes(".pause-invitation summary:focus-visible {"));
  assert.ok(client.includes('id="invite-link" class="invite-link-input"'));
  assert.ok(gameCss.includes(".pause-actions {"));
  assert.ok(gameCss.includes(".pause-invitation {"));
  assert.ok(!client.includes("Current learner link"));
  assert.ok(!client.includes("Replace learner link"));
  assert.ok(tutorPage.includes('method="dialog" class="fw-confirm-actions"'));
  assert.ok(tutorPage.includes('value="cancel" autofocus'));
  assert.ok(tutorPage.includes('value="replace"'));
  assert.ok(!learnerPage.includes('id="replace-learner-confirm"'));
  assert.ok(client.includes('function confirmLearnerReplacement()'));
  assert.ok(client.includes('dialog.returnValue === "replace"'));
  assert.ok(!client.includes('!confirm('));
  assert.ok(gameCss.includes("#replace-learner-confirm,\n#end-game-confirm {"));
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
  assert.ok(client.includes('class="game-utility-button sound-button arcade-game-chrome-utility"'));
  assert.ok(client.includes('aria-label="Sound" aria-pressed="${sound}"'));
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
  assert.ok(gameCss.includes(".landing .invite-link-input,\n.pause-overlay .invite-link-input,\n.switch-maintenance .invite-link-input {"));
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
  assert.ok(client.includes('connectionPaused ? "Both players are back." : "Turn paused."'));
  assert.ok(client.includes('waitingForPartner ? "Partner disconnected."'));
  assert.ok(client.includes('!s.connected.tutor || !s.connected.learner'));
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
  assert.ok(client.includes("The clock is stopped. Resume when both players are connected."));
  assert.ok(!client.includes("The clock continues unless the tutor pauses."));
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
