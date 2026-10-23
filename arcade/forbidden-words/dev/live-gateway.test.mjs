import assert from "node:assert/strict";
import { database, OWNER } from "./database.mjs";
import { GameError } from "../server/game.mjs";
import { handleForbiddenWordsLive } from "../server/live-http.mjs";
import { handleForbiddenWords, token } from "../server/http.mjs";
import { ForbiddenWordsLiveRoomBase } from "../server/live-room.mjs";

const { db, rpc } = await database();
// Real Supabase HTTP RPC maps PostgreSQL's P0001 quota signal to HTTP 429.
// Keep the database real while modelling that existing transport boundary.
const quotaRpc = async (name, args) => {
  try { return await rpc(name, args); }
  catch (error) {
    if (error.code === "P0001")
      throw new GameError("Game limit reached. Finish an existing game, or try again later.", 429);
    throw error;
  }
};
const previousResponse = globalThis.Response;
class UpgradeResponse extends previousResponse {
  constructor(body, options = {}) {
    super(options.status === 101 ? null : body,
      options.status === 101 ? { status: 200, headers: options.headers } : options);
    if (options.status === 101) {
      this.upgraded = true;
      this.webSocket = options.webSocket;
    }
  }
}
class Socket {
  constructor() { this.readyState = 1; this.frames = []; }
  serializeAttachment(a) { this.attachment = structuredClone(a); }
  deserializeAttachment() { return structuredClone(this.attachment); }
  send(value) { this.frames.push(JSON.parse(value)); }
  close(code) { this.readyState = 3; this.code = code; }
  latest() { return this.frames.at(-1); }
}
class WebSocketPair {
  constructor() { this.client = new Socket(); this.server = new Socket(); }
}
globalThis.Response = UpgradeResponse;
globalThis.WebSocketPair = WebSocketPair;
const rooms = new Map(), contexts = new Map();
const env = { ALLOWED_ORIGIN: "https://atlas.test" };
const namespace = {
  idFromName(name) { return name; },
  get(name) {
    if (!rooms.has(name)) {
      const data = new Map(), connections = [];
      const storage = {
        async get(key) { return structuredClone(data.get(key)); },
        async put(key, value) { data.set(key, structuredClone(value)); },
        async delete(key) { data.delete(key); },
        async deleteAll() { data.clear(); },
        async transaction(action) { return action(this); },
        async setAlarm(at) { this.alarm = at; },
      };
      const ctx = {
        storage,
        acceptWebSocket(ws) { connections.push(ws); },
        getWebSockets() { return connections; },
      };
      const room = new ForbiddenWordsLiveRoomBase(ctx, env);
      room.rpc = quotaRpc;
      rooms.set(name, room);
      contexts.set(name, ctx);
    }
    return { fetch: request => rooms.get(name).fetch(request) };
  },
};
const authorize = async (request) => ({
  ok: request.headers.get("Authorization") === "Bearer tutor",
  userId: OWNER, status: 401,
});
async function gateway(route, body, expected, options = {}) {
  const headers = {
    Origin: options.origin ?? env.ALLOWED_ORIGIN,
    ...(options.tutor ? { Authorization: "Bearer tutor" } : {}),
    ...(!options.socket ? { "Content-Type": "application/json" } : {
      Upgrade: "websocket", "Sec-WebSocket-Protocol": "fw-ticket." + options.ticket,
    }),
  };
  const url = "https://api.test/forbidden-words/live/" + route +
    (options.socket ? "?session=" + body.session : "");
  const response = await handleForbiddenWordsLive(new Request(url, {
    method: options.socket ? "GET" : "POST", headers,
    ...(!options.socket ? { body: JSON.stringify(body) } : {}),
  }), env, { authenticate: authorize, rpc: quotaRpc, namespace });
  assert.equal(response.upgraded ? 101 : response.status, expected, route);
  if (response.upgraded) return response;
  return response.json();
}
const makeId = () => crypto.randomUUID();
try {
  // No dashboard rollout flag: the production Worker never exposes live rooms.
  const { default: worker } = await import("../../../shared/worker.js");
  const off = await worker.fetch(new Request("https://api.test/forbidden-words/live/create", {
    method: "POST",
    headers: { Origin: env.ALLOWED_ORIGIN, "Content-Type": "application/json" },
    body: JSON.stringify({ session: makeId(), atlasSessionId: "lesson-0" }),
  }), env);
  assert.equal(off.status, 404);

  const ids = [makeId(), makeId(), makeId(), makeId()];
  await gateway("create", { session: ids[0], atlasSessionId: "lesson-a" }, 401);
  await gateway("create", { session: ids[0], atlasSessionId: "lesson-a" }, 403, {
    tutor: true, origin: "https://untrusted.test",
  });
  await gateway("create", { session: ids[0], atlasSessionId: "../escape" }, 400, { tutor: true });
  for (let i = 0; i < 3; i++) {
    assert.equal((await gateway("create", {
      session: ids[i], atlasSessionId: "lesson-" + i,
    }, 200, { tutor: true })).created, true);
  }
  assert.equal((await gateway("create", {
    session: ids[0], atlasSessionId: "lesson-0",
  }, 200, { tutor: true })).created, false);
  await gateway("create", { session: ids[0], atlasSessionId: "lesson-other" }, 409, { tutor: true });
  await gateway("create", { session: ids[3], atlasSessionId: "lesson-3" }, 429, { tutor: true });

  // A live reservation may never be read and committed by the old HTTP game.
  const old = await handleForbiddenWords(
    new Request("https://api.test/forbidden-words/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Origin: env.ALLOWED_ORIGIN,
        Authorization: "Bearer tutor",
      },
      body: JSON.stringify({ session: ids[0], action: "poll", atlasSessionId: "lesson-0" }),
    }),
    env, { rpc: quotaRpc, authenticate: authorize },
  );
  assert.equal(old.status, 409);

  await gateway("ticket", {
    session: ids[0], actor: "tutor", atlasSessionId: "lesson-0",
  }, 401);
  await gateway("ticket", {
    session: ids[0], actor: "tutor", atlasSessionId: "lesson-other",
  }, 403, { tutor: true });
  const { ticket: tutorTicket, invite } = await gateway("ticket", {
    session: ids[0], actor: "tutor", atlasSessionId: "lesson-0",
  }, 200, { tutor: true });
  const credential = token();
  await gateway("ticket", { session: ids[0], actor: "learner", credential, invite: token() }, 403);
  const { ticket: learnerTicket } = await gateway("ticket", {
    session: ids[0], actor: "learner", credential, invite,
  }, 200);
  const tutorUpgrade = await gateway("socket", { session: ids[0] }, 101, {
    socket: true, ticket: tutorTicket,
  });
  assert.equal(tutorUpgrade.headers.get("Sec-WebSocket-Protocol"), "fw-ticket." + tutorTicket);
  const learnerUpgrade = await gateway("socket", { session: ids[0] }, 101, {
    socket: true, ticket: learnerTicket,
  });
  const tutor = contexts.get(ids[0]).getWebSockets()[0];
  const learner = contexts.get(ids[0]).getWebSockets()[1];
  assert.equal(tutor.latest().state.actor, "tutor");
  assert.equal(learner.latest().state.atlasSessionId, undefined);
  assert.equal(learner.latest().invite, undefined);
  await gateway("socket", { session: ids[0] }, 403, { socket: true, ticket: tutorTicket });

  const room = rooms.get(ids[0]);
  await room.webSocketMessage(tutor, JSON.stringify({
    action: "start", id: makeId(), round: 0, turn: 0,
  }));
  assert.equal(learner.latest().state.phase, "countdown");
  assert.ok(tutor.frames.filter(frame => frame.type === "state").at(-1).state.card.target);
  assert.deepEqual(Object.keys(learner.latest().state.card), ["nonce"]);

  // Closing a real socket does not burn the clock instantly: allow the
  // established twelve-second tolerance and pause when the alarm expires.
  learner.readyState = 3;
  await room.webSocketClose(learner);
  assert.equal((await contexts.get(ids[0]).storage.get("room")).game.paused, null);
  let stored = await contexts.get(ids[0]).storage.get("room");
  stored.game.seen.learner = Date.now() - 12050;
  await contexts.get(ids[0]).storage.put("room", stored);
  await room.alarm();
  assert.equal((await contexts.get(ids[0]).storage.get("room")).game.paused?.reason, "connection");

  // The same seat reconnects after object reconstruction without claiming
  // another learner or resetting the private card.
  const revive = new ForbiddenWordsLiveRoomBase(contexts.get(ids[0]), env);
  revive.rpc = quotaRpc;
  rooms.set(ids[0], revive);
  const { ticket: restoredTicket } = await gateway("ticket", {
    session: ids[0], actor: "learner", credential,
  }, 200);
  await gateway("socket", { session: ids[0] }, 101, { socket: true, ticket: restoredTicket });
  const restoredLearner = contexts.get(ids[0]).getWebSockets().at(-1);
  assert.equal(restoredLearner.latest().state.paused.reason, "connection");
  assert.deepEqual(Object.keys(restoredLearner.latest().state.card), ["nonce"]);

  // A finished game releases its shared three-room quota exactly once.
  await revive.webSocketMessage(tutor, JSON.stringify({
    action: "finish", id: makeId(), round: 1, turn: 1,
  }));
  const finishedRow = await rpc("forbidden_words_read", { p_id: ids[0] });
  assert.equal(finishedRow.state.phase, "finished");
  assert.equal(finishedRow.state.transport, "durable");
  assert.equal((await gateway("create", {
    session: ids[3], atlasSessionId: "lesson-3",
  }, 200, { tutor: true })).created, true);
  const alive = await db.query(
    "select count(*)::integer as count from public.forbidden_words_sessions where state->>'phase' <> 'finished'",
  );
  assert.equal(alive.rows[0].count, 3);
  console.log("Forbidden Words live gateway: auth, origin, quota, old-room exclusion, private cards, one-use socket tickets, grace, reconnect and release passed.");
} finally {
  globalThis.Response = previousResponse;
  delete globalThis.WebSocketPair;
}
