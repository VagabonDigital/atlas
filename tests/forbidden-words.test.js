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
  assert.ok(CARDS.length >= 100);
  assert.equal(new Set(CARDS.map((c) => c.target)).size, CARDS.length);
  for (const c of CARDS) {
    assert.equal(c.forbidden.length, 4);
    assert.equal(new Set(c.forbidden).size, 4);
    assert.ok(!c.forbidden.includes(c.target));
  }
  act("tutor", "start", now);
  assert.equal(s.startsAt, now + 3000);
  assert.equal(s.deadline, now + 63000);
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
  assert.equal(s.deadline, now + 63000);
  act("tutor", "correct", now + 3501, { card: original }, id);
  assert.equal(s.score, 1);
  assert.throws(() => act("tutor", "correct", now + 3502, { card: original }));
  for (const action of ["skip", "oops"]) {
    const old = s.card;
    act("tutor", action, now + 4000, { card: old.nonce });
    assert.notEqual(s.card.nonce, old.nonce);
    assert.equal(s.score, 1);
    assert.ok(
      !JSON.stringify(view(s, "learner", now + 4000, 5)).includes(
        CARDS[old.index].target,
      ),
    );
  }
  assert.throws(() => act("learner", "pause", now + 4500));
  act("tutor", "pause", now + 5000);
  advance(s, now + 90000);
  assert.equal(s.phase, "active");
  act("tutor", "resume", now + 90000);
  assert.equal(s.deadline, now + 148000);
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
  assert.ok(client.includes('returnRoot: "#arcade-game-return-root"'));
  assert.ok(client.includes('actionsRoot: "#arcade-game-actions-root"'));
  assert.ok(!learnerPage.includes("arcade-game-chrome"));
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
