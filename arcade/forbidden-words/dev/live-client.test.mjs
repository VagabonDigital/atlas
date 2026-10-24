import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
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

  // Browser back/forward cache: park the socket, do not open duplicates while
  // frozen, and reconnect to the SAME room when pageshow restores the page.
  const beforePark = sockets.at(-1);
  client.suspend();
  assert.equal(client.connected, false);
  assert.equal(beforePark.readyState, 3);
  const parkedCount = sockets.length;
  client.connect();
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(sockets.length, parkedCount, "A parked page must not connect");
  client.resume();
  await wait(() => client.connected && sockets.length === parkedCount + 1);
  assert.equal(sockets.at(-1).url.search, "?session=" + session);
  assert.equal(client.connected, true);
  client.resume();
  client.connect();
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(sockets.length, parkedCount + 1, "Restoration must open only one socket");

  // A suspended page can have an unfinished ticket fetch. Any old response
  // must be ignored even if it arrives after the newer connection is ready.
  const outstanding = [];
  const backgroundClient = new ForbiddenWordsLiveClient({
    api, session, actor: "tutor",
    getTicketPayload: async () => ({ atlasSessionId: "atlas-student" }),
    getAuthorization: async () => "test-user-token",
    fetchImpl: () => new Promise(resolve => outstanding.push(resolve)),
    WebSocketImpl: FakeWebSocket,
    onState: () => {},
    onStatus: () => {},
    onFatal: error => { throw error; },
  });
  try {
    backgroundClient.connect();
    await wait(() => outstanding.length === 1);
    backgroundClient.suspend();
    backgroundClient.resume();
    await wait(() => outstanding.length === 2);
    const beforeTicket = sockets.length;
    const ticketResponse = () => new Response(JSON.stringify({
      ok: true, ticket: "b".repeat(64),
    }), { status: 200, headers: { "Content-Type": "application/json" } });
    outstanding[0](ticketResponse());
    await new Promise(resolve => setTimeout(resolve, 5));
    assert.equal(sockets.length, beforeTicket, "Old ticket must never create a socket");
    outstanding[1](ticketResponse());
    await wait(() => backgroundClient.connected);
    assert.equal(sockets.length, beforeTicket + 1);
  } finally {
    backgroundClient.close();
  }

  // New production rooms default to live, explicit emergency opt-out stays
  // HTTP, and local/offline test rooms never require the Cloudflare gateway.
  // Evaluate the ACTUAL expression from app.mjs, not a duplicate policy.
  const app = fs.readFileSync(new URL("../app.mjs", import.meta.url), "utf8");
  const defaultExpr = app.match(/^const LIVE_NEW_ROOMS = ([^;]+);$/m)?.[1];
  assert.ok(defaultExpr, "Missing transport default policy");
  const defaultMode = (search, local = false) => vm.runInNewContext(
    `(() => {
      const LOCAL = ${JSON.stringify(local)};
      const params = new URLSearchParams(${JSON.stringify(search)});
      return ${defaultExpr};
    })()`, { URLSearchParams },
  );
  assert.equal(defaultMode(""), true, "Regular production URL creates live rooms");
  assert.equal(defaultMode("?fw-live=1"), true, "Existing live preview URL still works");
  assert.equal(defaultMode("?fw-live=0"), false, "Emergency opt-out creates HTTP rooms");
  assert.equal(defaultMode("", true), false, "Local verification stays on HTTP");
  assert.match(app, /const nextLive = LIVE_NEW_ROOMS;/);
  assert.match(app, /liveMode = !!session && storage\.get\(liveRoomKey\(session\)\) === "live";/);
  // Both legacy and live room IDs preserve their original transport on reload.
  assert.match(app, /if \(!session \|\| liveMode\) return;/);
  assert.match(app, /if \(liveMode\) url\.searchParams\.set\("live", "1"\)/);
  assert.match(app, /storage\.get\(liveRoomKey\(session\)\) === "live"/);
  assert.match(app, /if \(liveMode\) await startLiveRoom\(bootEpoch\)/);
  assert.match(app, /if \(liveMode\) storage\.set\(liveRoomKey\(session\), "live"\)/);
  const lifecycleSource = app.slice(
    app.indexOf('window.addEventListener("pagehide"'),
    app.indexOf('window.addEventListener("online"'),
  );
  assert.ok(lifecycleSource.includes('window.addEventListener("pageshow"'));
  const lifecycleCallbacks = {};
  let parked = 0, restored = 0;
  vm.runInNewContext(lifecycleSource, {
    liveMode: true,
    liveClient: { suspend: () => parked++, resume: () => restored++ },
    window: { addEventListener: (type, callback) => {
      lifecycleCallbacks[type] = callback;
    } },
  });
  lifecycleCallbacks.pagehide();
  lifecycleCallbacks.pageshow({ persisted: false });
  lifecycleCallbacks.pageshow({ persisted: true });
  assert.equal(parked, 1);
  assert.equal(restored, 1, "Only BFCache page restoration reopens the socket");

  console.log("Forbidden Words browser transport: live session recovery, BFCache lifecycle, acknowledgements and legacy isolation passed.");
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

// Background timers can wake with a stale OPEN socket. A close handshake may
// remain CLOSING while offline; recovery must not depend on its close event.
const realInterval = globalThis.setInterval;
const realNow = Date.now;
const watchdogs = new Map();
let recoveryClock = realNow();
const pair = [];
const recoveryStates = [];
try {
  Date.now = () => recoveryClock;
  globalThis.setInterval = (callback, delay) => {
    const timer = realInterval(callback, delay);
    watchdogs.set(timer, callback);
    return timer;
  };
  for (const actor of ["tutor", "learner"]) {
    const states = [];
    recoveryStates.push(states);
    const recovering = new ForbiddenWordsLiveClient({
      api, session, actor,
      getTicketPayload: async () => ({ atlasSessionId: "atlas-student" }),
      getAuthorization: async () => "test-user-token",
      fetchImpl: originalFetch, WebSocketImpl: FakeWebSocket,
      onState: frame => states.push(frame), onStatus: () => {}, onFatal: error => { throw error; },
    });
    recovering.reconnectDelay = 1;
    pair.push(recovering);
    recovering.connect();
  }
  await wait(() => pair.every(seat => seat.connected));
  // A responsive existing socket after a 13-second background interval is
  // retained: the established server presence timeout remains 12 seconds.
  recoveryClock += 13000;
  for (const seat of pair) {
    const socket = seat.socket;
    seat.connect();
    seat.heartbeat();
    assert.equal(seat.socket, socket);
    assert.equal(seat.lastReply, recoveryClock);
  }
  const oldSockets = pair.map(seat => seat.socket);
  for (const socket of oldSockets) {
    socket.close = () => { socket.readyState = 2; }; // No close event yet.
  }
  recoveryClock += 17000;
  // Tutor's watchdog wakes first; learner subsequently returns to foreground.
  watchdogs.get(pair[0].watchdogTimer)();
  assert.equal(pair[0].connected, false, "Watchdog must detach a stale socket without waiting for onclose");
  await wait(() => pair[0].connected && pair[0].socket !== oldSockets[0]);
  recoveryClock += 4000;
  pair[1].connect(); // Actual foreground/online handler calls connect().
  assert.equal(pair[1].connected, false, "Foreground recovery must not retain a stale connected guard");
  await wait(() => pair[1].connected && pair[1].socket !== oldSockets[1]);
  for (let i = 0; i < pair.length; i++) {
    const replacement = pair[i].socket;
    const stateCount = recoveryStates[i].length;
    assert.equal(replacement.url.search, "?session=" + session);
    oldSockets[i].onclose?.();
    oldSockets[i].deliver({ type: "state", state: { phase: "finished" } });
    assert.equal(pair[i].socket, replacement, "Late events must not disrupt the recovered seat");
    assert.equal(pair[i].connected, true);
    assert.equal(recoveryStates[i].length, stateCount, "Old socket messages must not reach the game UI");
  }
  console.log("Forbidden Words two-seat background recovery: existing sockets, stalled close, watchdog and foreground reconnect passed.");
} finally {
  for (const seat of pair) seat.close();
  globalThis.setInterval = realInterval;
  Date.now = realNow;
}
