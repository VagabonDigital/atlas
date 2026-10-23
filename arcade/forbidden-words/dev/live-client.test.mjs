import assert from "node:assert/strict";
import fs from "node:fs";
import { ForbiddenWordsLiveClient } from "../live-client.mjs";

const session = "00000000-0000-4000-8000-000000000123";
const tickets = [], calls = [], sockets = [], received = [], changes = [], errors = [];
let disconnectOnNextCommand = false;
const api = "https://atlas-ai.example.test/forbidden-words/";
const originalFetch = async (url, init) => {
  const body = JSON.parse(init.body);
  calls.push({ url, body, headers: init.headers });
  assert.equal(body.session, session);
  assert.match(init.headers.Authorization, /^Bearer test-user-token$/);
  if (url.endsWith("/ticket")) {
    const ticket = (tickets.length + 1).toString(16).padStart(64, "0");
    tickets.push(ticket);
    return new Response(JSON.stringify({ ok: true, ticket }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  }
  throw new Error("Unexpected route " + url);
};
class FakeWebSocket {
  constructor(url, protocols) {
    this.url = new URL(url);
    this.protocols = protocols;
    this.readyState = 0;
    this.sent = [];
    sockets.push(this);
    queueMicrotask(() => {
      if (this.readyState === 3) return;
      this.readyState = 1;
      this.onopen?.();
      this.deliver({ type: "state", state: {
        actor: "tutor", phase: "waiting", revision: sockets.length,
        serverNow: Date.now(), connected: { tutor: true, learner: false },
      }, invite: "a".repeat(64) });
    });
  }
  deliver(frame) { this.onmessage?.({ data: JSON.stringify(frame) }); }
  send(json) {
    assert.equal(this.readyState, 1);
    const frame = JSON.parse(json);
    this.sent.push(frame);
    if (frame.action === "poll") {
      this.deliver({ type: "heartbeat", serverNow: Date.now() });
    } else if (disconnectOnNextCommand) {
      disconnectOnNextCommand = false;
      this.close();
    } else {
      this.deliver({ type: "state", state: {
        actor: "tutor", phase: "active", revision: sockets.length + 1,
        serverNow: Date.now(), connected: { tutor: true, learner: true },
      }, invite: "a".repeat(64) });
      this.deliver({ type: "ack", id: frame.id });
    }
  }
  close() {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.onclose?.();
  }
}
const client = new ForbiddenWordsLiveClient({
  api, session, actor: "tutor",
  getTicketPayload: async () => ({ atlasSessionId: "atlas-student" }),
  getAuthorization: async () => "test-user-token",
  fetchImpl: originalFetch,
  WebSocketImpl: FakeWebSocket,
  onState: frame => received.push(frame),
  onStatus: connected => changes.push(connected),
  onHeartbeat: now => assert.ok(now > 0),
  onFatal: error => errors.push(error),
});
const wait = async condition => {
  for (let i = 0; i < 100; i++) {
    if (condition()) return;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error("Live transport did not reach expected condition");
};
try {
  client.connect();
  await wait(() => client.connected);
  assert.equal(received.length, 1);
  assert.deepEqual(changes, [true]);
  assert.equal(tickets.length, 1);
  assert.equal(sockets[0].url.search, "?session=" + session);
  assert.equal(sockets[0].url.protocol, "wss:");
  assert.deepEqual(sockets[0].protocols, ["fw-ticket." + tickets[0]]);
  assert.equal(sockets[0].url.href.includes(tickets[0]), false);
  assert.equal(sockets[0].url.href.includes("atlas-student"), false);
  assert.equal(sockets[0].sent[0].action, "poll");

  const id = "same-action-across-reconnect";
  await client.command("correct", { round: 1, turn: 1, card: "card-nonce" }, id);
  assert.equal(sockets[0].sent.at(-1).id, id);
  assert.equal(received.at(-1).state.phase, "active");

  disconnectOnNextCommand = true;
  client.reconnectDelay = 1;
  await assert.rejects(
    client.command("skip", { round: 1, turn: 1, card: "next-card" }, id + "-2"),
    /Connection interrupted/,
  );
  await wait(() => client.connected && sockets.length === 2);
  assert.ok(changes.includes(false));
  await client.command("skip", { round: 1, turn: 1, card: "next-card" }, id + "-2");
  assert.equal(sockets[1].sent.at(-1).id, id + "-2");
  assert.equal(tickets.length, 2);
  assert.deepEqual(errors, []);
  assert.ok(received.length >= 3);

  // The old polling path and WebSocket path remain independently gated.
  const app = fs.readFileSync(new URL("../app.mjs", import.meta.url), "utf8");
  assert.match(app, /if \(!session \|\| liveMode\) return;/);
  assert.match(app, /if \(liveMode\) url\.searchParams\.set\("live", "1"\)/);
  assert.match(app, /storage\.get\(liveRoomKey\(session\)\) === "live"/);
  assert.match(app, /if \(liveMode\) await startLiveRoom\(bootEpoch\)/);
  assert.match(app, /if \(liveMode\) storage\.set\(liveRoomKey\(session\), "live"\)/);
  console.log("Forbidden Words browser transport: gated sessions, private ticket protocol, push, acknowledgements, retry with same ID and legacy isolation passed.");
} finally {
  client.close();
}

// Reproduce Chrome's native fetch receiver constraint on a fresh live room.
// The default fetch implementation must call globalThis.fetch as a method of
// globalThis, not with the live-client object as its receiver.
const savedGlobalFetch = globalThis.fetch;
let nativeCalls = 0;
try {
  globalThis.fetch = function(url, init) {
    assert.equal(this, globalThis, "Native Window.fetch must keep its Window receiver");
    assert.ok(url.endsWith("/live/create"));
    const input = JSON.parse(init.body);
    assert.equal(input.session, session);
    assert.equal(input.atlasSessionId, "atlas-student");
    nativeCalls++;
    return Promise.resolve(new Response(JSON.stringify({ ok: true, created: true }), {
      status: 200, headers: { "Content-Type": "application/json" },
    }));
  };
  const freshRoom = new ForbiddenWordsLiveClient({
    api, session, actor: "tutor",
    getTicketPayload: async () => ({ atlasSessionId: "atlas-student" }),
    getAuthorization: async () => "test-user-token",
    WebSocketImpl: FakeWebSocket,
  });
  try {
    const result = await freshRoom.initialize({ atlasSessionId: "atlas-student" });
    assert.equal(result.created, true);
    assert.equal(nativeCalls, 1);
  } finally {
    freshRoom.close();
  }
} finally {
  globalThis.fetch = savedGlobalFetch;
}
console.log("Forbidden Words browser native fetch receiver: fresh room creation passed.");
