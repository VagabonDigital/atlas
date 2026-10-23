import assert from "node:assert/strict";
import { ForbiddenWordsLiveRoomBase } from "../server/live-room.mjs";
import { token } from "../server/http.mjs";

const OriginalResponse = globalThis.Response;
class SocketResponse extends OriginalResponse {
  constructor(body, options = {}) {
    super(options.status === 101 ? null : body, options.status === 101 ? { status: 200 } : options);
    if (options.status === 101) {
      this.upgraded = true;
      this.webSocket = options.webSocket;
    }
  }
}
class FakeSocket {
  constructor() { this.readyState = 1; this.frames = []; this.attachment = null; }
  serializeAttachment(value) { this.attachment = structuredClone(value); }
  deserializeAttachment() { return structuredClone(this.attachment); }
  send(data) { this.frames.push(JSON.parse(data)); }
  close(code, reason) { this.readyState = 3; this.code = code; this.reason = reason; }
  latest() { return this.frames.at(-1); }
}
class WebSocketPair {
  constructor() { this.client = new FakeSocket(); this.server = new FakeSocket(); }
}
globalThis.Response = SocketResponse;
globalThis.WebSocketPair = WebSocketPair;

const values = new Map(), sockets = [];
const context = {
  storage: {
    async get(key) { return structuredClone(values.get(key)); },
    async put(key, value) { values.set(key, structuredClone(value)); },
    async delete(key) { values.delete(key); },
    async deleteAll() { values.clear(); },
    async transaction(work) { return work(this); },
    async setAlarm(value) { this.nextAlarm = value; },
  },
  acceptWebSocket(ws) { sockets.push(ws); },
  getWebSockets() { return sockets; },
};
const room = new ForbiddenWordsLiveRoomBase(context, {});
const owner = "00000000-0000-4000-8000-000000000001";
const learnerContext = "lesson-abc";
const sessionId = crypto.randomUUID();
const payload = (path, body) => new Request("https://room.test" + path, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
async function call(path, data, expected = 200, target = room) {
  const response = await target.fetch(payload(path, data));
  const result = await response.json();
  assert.equal(response.status, expected, JSON.stringify(result));
  return result;
}
async function connect(ticket, target = room, expected = 101) {
  const response = await target.fetch(new Request("https://room.test/socket", {
    headers: { Upgrade: "websocket", "Sec-WebSocket-Protocol": "fw-ticket." + ticket },
  }));
  assert.equal(response.upgraded ? 101 : response.status, expected);
  return expected === 101 ? sockets.at(-1) : response.json();
}
const action = (type, extra = {}, id = crypto.randomUUID()) => ({
  action: type, id, round: extra.round ?? 0, turn: extra.turn ?? 0, ...extra,
});
try {
  assert.equal((await call("/initialize", { session: sessionId, owner, atlasSessionId: learnerContext })).created, true);
  assert.equal((await call("/initialize", { session: sessionId, owner, atlasSessionId: learnerContext })).created, false);
  await call("/initialize", { session: sessionId, owner, atlasSessionId: "another-learner" }, 403);
  await call("/ticket", { actor: "tutor", owner, atlasSessionId: "another-learner" }, 403);
  await call("/ticket", { actor: "tutor", owner: crypto.randomUUID(), atlasSessionId: learnerContext }, 403);
  const { ticket: tutorTicket, invite } = await call("/ticket", {
    actor: "tutor", owner, atlasSessionId: learnerContext,
  });
  assert.match(invite, /^[0-9a-f]{64}$/);
  const credential = token();
  await call("/ticket", { actor: "learner", credential, invite: token() }, 403);
  const { ticket: learnerTicket } = await call("/ticket", {
    actor: "learner", credential, invite,
  });
  const tutor = await connect(tutorTicket);
  const learner = await connect(learnerTicket);
  assert.equal(tutor.latest().state.atlasSessionId, learnerContext);
  assert.equal(tutor.latest().state.actor, "tutor");
  assert.equal(learner.latest().state.actor, "learner");
  assert.equal(learner.latest().state.atlasSessionId, undefined);
  assert.equal(learner.latest().invite, undefined);
  assert.equal(tutor.latest().invite, invite);
  await connect(tutorTicket, room, 403); // Tickets cannot be replayed.
  assert.equal(sockets.filter(ws => ws.readyState === 1).length, 2);

  await room.webSocketMessage(tutor, JSON.stringify(action("start")));
  assert.equal(learner.latest().state.phase, "countdown");
  assert.equal(tutor.latest().state.card.target.length > 0, true);
  assert.deepEqual(Object.keys(learner.latest().state.card), ["nonce"]);
  assert.equal(context.storage.nextAlarm > Date.now(), true);
  let stored = await context.storage.get("room");
  stored.game.startsAt = Date.now() - 100;
  stored.game.deadline = Date.now() + 119900;
  await context.storage.put("room", stored);
  const card = stored.game.card.nonce;
  const correctId = crypto.randomUUID();
  await room.webSocketMessage(tutor, JSON.stringify(action("correct", { round: 1, turn: 1, card }, correctId)));
  assert.equal((await context.storage.get("room")).game.score, 1);
  assert.equal(learner.latest().state.score, 1);
  assert.equal(learner.latest().state.card.target, undefined);
  await room.webSocketMessage(tutor, JSON.stringify(action("correct", { round: 1, turn: 1, card }, correctId)));
  assert.equal((await context.storage.get("room")).game.score, 1);
  await room.webSocketMessage(learner, JSON.stringify(action("correct", {
    round: 1, turn: 1, card: (await context.storage.get("room")).game.card.nonce,
  })));
  assert.equal(learner.latest().type, "error");
  assert.equal((await context.storage.get("room")).game.score, 1);

  const restored = new ForbiddenWordsLiveRoomBase(context, {});
  await restored.webSocketMessage(learner, JSON.stringify({ action: "poll" }));
  assert.equal(learner.latest().state.score, 1);
  assert.equal(tutor.latest().state.score, 1);

  await restored.webSocketMessage(tutor, JSON.stringify(action("pause", { round: 1, turn: 1 })));
  assert.ok((await context.storage.get("room")).game.paused);
  await restored.webSocketMessage(tutor, JSON.stringify(action("replace-learner", { round: 1, turn: 1 })));
  assert.equal(learner.readyState, 3);
  assert.notEqual(tutor.latest().invite, invite);
  assert.equal((await context.storage.get("room")).game.learnerHash, null);
  // Cloudflare cannot deliver further messages to the already-closed seat.
  assert.equal(learner.code, 4003);
  await call("/ticket", { actor: "learner", credential: token(), invite }, 403, restored);
  const nextCredential = token(), nextInvite = tutor.latest().invite;
  const { ticket: nextTicket } = await call("/ticket", {
    actor: "learner", credential: nextCredential, invite: nextInvite,
  }, 200, restored);
  const newLearner = await connect(nextTicket, restored);
  assert.equal(newLearner.latest().state.score, 1);
  await restored.webSocketClose(newLearner);
  assert.ok((await context.storage.get("room")).game.seen.learner > 0);
  assert.ok((await context.storage.get("room")).game.paused);
  // A socket closure after the turn deadline must finish the turn, not freeze it.
  stored = await context.storage.get("room");
  stored.game.paused = null;
  stored.game.phase = "active";
  stored.game.deadline = Date.now() - 1;
  stored.game.startsAt = Date.now() - 4000;
  await context.storage.put("room", stored);
  await restored.webSocketClose(tutor);
  const deadlineResult = (await context.storage.get("room")).game;
  assert.equal(deadlineResult.paused, null);
  assert.equal(deadlineResult.phase, "switch");

  stored = await context.storage.get("room");
  stored.expiresAt = Date.now() - 1;
  await context.storage.put("room", stored);
  await call("/ticket", { actor: "tutor", owner, atlasSessionId: learnerContext }, 410, restored);
  await restored.alarm();
  assert.equal(await context.storage.get("room"), undefined);
  console.log("Forbidden Words live room: private tickets, both seats, state broadcast, secrecy, idempotence, hibernation, revocation and expiry passed.");
} finally {
  globalThis.Response = OriginalResponse;
  delete globalThis.WebSocketPair;
}
