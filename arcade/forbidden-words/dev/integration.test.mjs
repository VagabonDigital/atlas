import assert from "node:assert/strict";
import { database, OWNER } from "./database.mjs";
import { handleForbiddenWords, token } from "../server/http.mjs";
const { db, rpc } = await database();
const env = { ALLOWED_ORIGIN: "https://atlas.test" };
const session = crypto.randomUUID(),
  credential = token();
let responseCount = 0;
let scope = { round: 0, turn: 0 };
async function call(body, expected = 200, tutor = false, route = "session") {
  const response = await handleForbiddenWords(
    new Request(`https://api.test/forbidden-words/${route}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: env.ALLOWED_ORIGIN,
        ...(tutor ? { Authorization: "Bearer tutor" } : {}),
      },
      body: JSON.stringify({ session, id: crypto.randomUUID(), ...scope, ...body }),
    }),
    env,
    {
      rpc,
      authenticate: async (r) => ({
        ok: r.headers.get("Authorization") === "Bearer tutor",
        userId: OWNER,
        status: 401,
      }),
    },
  );
  const value = await response.json();
  if (value.state) scope = { round: value.state.round, turn: value.state.turn };
  responseCount++;
  assert.equal(response.status, expected, JSON.stringify(value));
  assert.equal(response.headers.get("Cache-Control"), "no-store, private");
  return value.state;
}
try {
  await call({ action: "create" }, 401, false, "create");
  let tutor = await call({ action: "create" }, 200, true, "create");
  const invite = tutor.invite;
  await call({ action: "poll", credential }, 403);
  let learner = await call({ action: "join", credential, invite });
  assert.equal(learner.invite, undefined);
  await call({ action: "join", credential: token(), invite }, 403);
  tutor = await call({ action: "start" }, 200, true);
  assert.equal(tutor.deadline - tutor.startsAt, 60000);
  assert.equal(tutor.startsAt - tutor.serverNow, 3000);
  learner = await call({ action: "poll", credential });
  assert.deepEqual(Object.keys(learner.card), ["nonce"]);
  assert.equal(learner.card.nonce, tutor.card.nonce);
  assert.equal(learner.deadline, tutor.deadline);
  await call({ action: "correct", credential, card: tutor.card.nonce }, 403);
  // Move only this isolated test database's deadline; browser testing uses real time.
  await db.query(
    "update public.forbidden_words_sessions set state=jsonb_set(state,'{startsAt}',to_jsonb((extract(epoch from clock_timestamp())*1000-100)::bigint)) where id=$1",
    [session],
  );
  const id = crypto.randomUUID();
  const simultaneous = await Promise.all(
    Array.from({ length: 5 }, () =>
      call({ action: "correct", card: tutor.card.nonce, id }, 200, true),
    ),
  );
  for (const s of simultaneous) assert.equal(s.score, 1);
  tutor = simultaneous.at(-1);
  await call({ action: "correct", card: learner.card.nonce }, 409, true);
  for (const action of ["skip", "oops"]) {
    const previous = tutor.card;
    tutor = await call({ action, card: tutor.card.nonce }, 200, true);
    learner = await call({ action: "poll", credential });
    assert.equal(learner.score, 1);
    assert.ok(!JSON.stringify(learner).includes(previous.target));
    assert.equal(learner.review.length, 0);
  }
  await call({ action: "pause", credential }, 409);
  tutor = await call({ action: "pause" }, 200, true);
  const frozen = tutor.paused.remaining;
  learner = await call({ action: "poll", credential });
  assert.equal(learner.paused.remaining, frozen);
  await call({ action: "correct", card: tutor.card.nonce }, 409, true);
  tutor = await call({ action: "resume" }, 200, true);
  assert.ok(Math.abs(tutor.deadline - tutor.serverNow - frozen) < 10);
  const final = tutor.card.nonce;
  await db.query(
    "update public.forbidden_words_sessions set state=jsonb_set(state,'{deadline}',to_jsonb((extract(epoch from clock_timestamp())*1000-100)::bigint)) where id=$1",
    [session],
  );
  tutor = await call({ action: "poll" }, 200, true);
  assert.equal(tutor.phase, "switch");
  assert.equal(tutor.card, null);
  await call({ action: "late-correct", credential, card: final }, 409);
  tutor = await call({ action: "late-correct", card: final }, 200, true);
  assert.equal(tutor.score, 2);
  await call({ action: "ready", round: 1 }, 200, true);
  learner = await call({ action: "ready", credential, round: 1 });
  assert.equal(learner.turn, 2);
  assert.ok(learner.card.target);
  tutor = await call({ action: "poll" }, 200, true);
  assert.equal(tutor.card.target, undefined);
  // Reload/reconnect returns the same card and deadline without any reset.
  const reconnect = await call({ action: "join", credential, invite });
  assert.equal(reconnect.card.nonce, learner.card.nonce);
  assert.equal(reconnect.deadline, learner.deadline);
  await db.query(
    "update public.forbidden_words_sessions set state=jsonb_set(jsonb_set(state,'{startsAt}','0'),'{deadline}','1') where id=$1",
    [session],
  );
  learner = await call({ action: "poll", credential });
  assert.equal(learner.phase, "results");
  assert.equal(learner.best, 2);
  assert.equal(learner.review.length, 3);
  tutor = await call({ action: "replay" }, 200, true);
  assert.equal(tutor.describer, "learner");
  assert.equal(tutor.score, 0);
  assert.equal(tutor.best, 2);
  await call({ action: "replace-learner" }, 409, true);
  await call({ action: "pause" }, 200, true);
  const rotateId = crypto.randomUUID();
  tutor = await call({ action: "replace-learner", id: rotateId }, 200, true);
  const rotated = tutor.invite;
  assert.notEqual(rotated, invite);
  assert.equal(
    (await call({ action: "replace-learner", id: rotateId }, 200, true)).invite,
    rotated,
  );
  await call({ action: "poll", credential }, 403);
  await call({ action: "join", credential, invite }, 403);
  learner = await call({
    action: "join",
    credential: token(),
    invite: rotated,
  });
  assert.equal(learner.paused !== null, true);
  // RPC compare-and-swap rejects a stale writer and a resolution past its deadline.
  const raw = await rpc("forbidden_words_read", { p_id: session });
  assert.equal(
    await rpc("forbidden_words_commit", {
      p_id: session,
      p_revision: raw.revision - 1,
      p_state: raw.state,
      p_deadline: null,
    }),
    false,
  );
  assert.equal(
    await rpc("forbidden_words_commit", {
      p_id: session,
      p_revision: raw.revision,
      p_state: raw.state,
      p_deadline: 1,
    }),
    false,
  );
  for (const role of ["anon", "authenticated"]) {
    await db.exec(`set role ${role}`);
    await assert.rejects(
      () => db.query("select state from public.forbidden_words_sessions"),
      /permission denied/,
    );
    await assert.rejects(
      () => db.query("select public.forbidden_words_read($1)", [session]),
      /permission denied/,
    );
    await db.exec("reset role");
  }
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      if (String(url).endsWith("/auth/v1/user"))
        return new Response(JSON.stringify({ id: OWNER }), { status: 200 });
      const name = String(url).split("/").at(-1);
      return new Response(
        JSON.stringify(await rpc(name, JSON.parse(options.body))),
        { status: 200 },
      );
    };
    const { default: worker } = await import("../../../shared/worker.js");
    const workerEnv = {
      ...env,
      ATLAS_SUPABASE_URL: "https://supabase.test",
      ATLAS_SUPABASE_SECRET_KEY: "verification-only",
    };
    const dispatched = await worker.fetch(
      new Request("https://api.test/forbidden-words/session", {
        method: "POST",
        headers: {
          Origin: env.ALLOWED_ORIGIN,
          "Content-Type": "application/json",
          Authorization: "Bearer verified-tutor",
        },
        body: JSON.stringify({ session, action: "poll" }),
      }),
      workerEnv,
    );
    assert.equal(dispatched.status, 200);
    assert.equal((await dispatched.json()).state.actor, "tutor");
  } finally {
    globalThis.fetch = originalFetch;
  }
  const denied = await handleForbiddenWords(
    new Request("https://api.test/forbidden-words/session", {
      method: "POST",
      headers: { Origin: "https://evil.test" },
    }),
    env,
    { rpc, authenticate: async () => ({ ok: true, userId: OWNER }) },
  );
  assert.equal(denied.status, 403);
  await db.query(
    "update public.forbidden_words_sessions set expires_at=clock_timestamp()-interval '1 second' where id=$1",
    [session],
  );
  await call({ action: "poll" }, 410, true);
  console.log(
    `Passed ${responseCount} real-handler requests; PostgreSQL migration, authorization, seat claims, private projections, duplicate/concurrent scoring, deadlines, role reversal, recovery, replay, RLS/EXECUTE denial and expiry verified.`,
  );
} finally {
  await db.close();
}
