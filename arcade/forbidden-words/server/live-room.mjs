import { initialState, command, view, advance, pauseOnDisconnect, GameError, PRESENCE_MS } from "./game.mjs";
import { token, hash, same } from "./http.mjs";

// Private Durable Object transport. No public Worker route may forward
// /initialize or /ticket until the rollout owns quota and account checks.
// Its state belongs to one named game, not a globally shared multiplayer engine.
const ROOM_MS = 6 * 60 * 60 * 1000;
const TICKET_MS = 30 * 1000;
const CONTEXT = /^[a-zA-Z0-9_-]{1,160}$/;
const HEX = /^[0-9a-f]{64}$/;
const ROOM_OWNER_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store, private" },
});
const errorResponse = (error) => json({
  ok: false, error: error instanceof GameError ? error.message : "Game service temporarily unavailable.",
}, error instanceof GameError ? error.status : 503);

export class ForbiddenWordsLiveRoomBase {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async load() {
    const room = await this.ctx.storage.get("room");
    if (!room || room.expiresAt <= Date.now()) {
      throw new GameError("This game has expired. Ask your tutor for a new link.", 410);
    }
    return room;
  }

  // The alarm is the only background timer. No setInterval or per-frame DB writes.
  async schedule(room, now) {
    const events = [room.expiresAt];
    const s = room.game;
    if (!s.paused && ["countdown", "active"].includes(s.phase)) {
      if (s.startsAt > now && s.phase === "countdown") events.push(s.startsAt);
      if (s.deadline > now) events.push(s.deadline);
      if (s.learnerHash) {
        for (const seen of [s.seen.tutor, s.seen.learner]) {
          if (seen > 0 && seen + PRESENCE_MS > now)
            events.push(seen + PRESENCE_MS);
        }
      }
    }
    await this.ctx.storage.setAlarm(Math.max(now + 1, Math.min(...events)));
  }

  async persist(room, now) {
    room.revision++;
    await this.ctx.storage.put("room", room);
    await this.schedule(room, now);
  }

  send(ws, frame) {
    if (ws.readyState === 1) ws.send(JSON.stringify(frame));
  }

  publish(room, now) {
    for (const ws of this.ctx.getWebSockets()) {
      const attachment = ws.deserializeAttachment();
      if (!attachment || (attachment.actor === "learner" &&
          attachment.seat !== room.game.learnerHash)) {
        if (ws.readyState === 1) ws.close(4003, "Seat replaced");
        continue;
      }
      this.send(ws, { type: "state", state: view(room.game, attachment.actor, now, room.revision),
        ...(attachment.actor === "tutor" ? { invite: room.game.invite } : {}) });
    }
  }

  async fetch(request) {
    try {
      const { pathname } = new URL(request.url);
      if (pathname === "/initialize" && request.method === "POST") {
        const input = await request.json();
        if (!ROOM_OWNER_UUID.test(input.owner || "") || !CONTEXT.test(input.atlasSessionId || ""))
          throw new GameError("Invalid tutor context.", 400);
        const present = await this.ctx.storage.get("room");
        if (present) {
          if (present.owner !== input.owner || present.game.atlasSessionId !== input.atlasSessionId)
            throw new GameError("This game belongs to another tutor or learner.", 403);
          if (present.expiresAt <= Date.now()) throw new GameError("This game has expired.", 410);
          return json({ ok: true, created: false });
        }
        const now = Date.now(), s = initialState(now);
        s.atlasSessionId = input.atlasSessionId;
        s.invite = token();
        const room = { owner: input.owner, expiresAt: now + ROOM_MS, revision: 0, game: s };
        await this.ctx.storage.put("room", room);
        await this.schedule(room, now);
        return json({ ok: true, created: true });
      }
      if (pathname === "/ticket" && request.method === "POST") {
        const input = await request.json(), room = await this.load();
        let actor, seat = null;
        if (input.actor === "tutor") {
          if (room.owner !== input.owner || room.game.atlasSessionId !== input.atlasSessionId)
            throw new GameError("This game belongs to another tutor or learner.", 403);
          actor = "tutor";
        } else if (input.actor === "learner") {
          if (!HEX.test(input.credential || ""))
            throw new GameError("Invalid learner credential.", 403);
          const candidate = await hash(input.credential);
          if (room.game.learnerHash) {
            if (!(await same(room.game.learnerHash, candidate)))
              throw new GameError("This learner seat is already in use.", 403);
          } else {
            if (room.game.phase === "finished" || !HEX.test(input.invite || "") ||
                !(await same(room.game.invite, input.invite)))
              throw new GameError("This invitation is no longer available.", 403);
            room.game.learnerHash = candidate;
            await this.persist(room, Date.now());
          }
          actor = "learner";
          seat = candidate;
        } else throw new GameError("Invalid seat.", 400);
        const ticket = token();
        await this.ctx.storage.put("ticket:" + await hash(ticket), {
          actor, seat, expiresAt: Date.now() + TICKET_MS,
        });
        return json({ ok: true, ticket, ...(actor === "tutor" ? { invite: room.game.invite } : {}) });
      }
      if (pathname === "/socket" && request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
        const subprotocol = request.headers.get("Sec-WebSocket-Protocol") || "";
        const match = /^fw-ticket\.([0-9a-f]{64})$/.exec(subprotocol);
        if (!match) throw new GameError("Connection ticket required.", 401);
        const digest = await hash(match[1]), key = "ticket:" + digest;
        const ticket = await this.ctx.storage.get(key);
        if (!ticket || ticket.expiresAt <= Date.now()) throw new GameError("Connection ticket expired.", 403);
        await this.ctx.storage.delete(key); // One-use even after hibernation/reconnect.
        const room = await this.load();
        if (ticket.actor === "learner" && ticket.seat !== room.game.learnerHash)
          throw new GameError("This learner seat has been replaced.", 403);
        const now = Date.now();
        // Preserve the timeout pause before accepting a returning presence.
        pauseOnDisconnect(room.game, now);
        advance(room.game, now);
        for (const old of this.ctx.getWebSockets()) {
          if (old.deserializeAttachment()?.actor === ticket.actor && old.readyState === 1)
            old.close(4000, "Seat reconnected");
        }
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);
        this.ctx.acceptWebSocket(server);
        server.serializeAttachment({ actor: ticket.actor, seat: ticket.seat });
        room.game.seen[ticket.actor] = now;
        await this.persist(room, now);
        this.publish(room, now);
        return new Response(null, { status: 101, webSocket: client });
      }
      throw new GameError("Not found.", 404);
    } catch (error) {
      if (!(error instanceof GameError)) console.error("[Forbidden Words live room] Request failed:", error.name);
      return errorResponse(error);
    }
  }

  async webSocketMessage(ws, message) {
    try {
      if (typeof message !== "string" || message.length > 4096)
        throw new GameError("Invalid command.", 400);
      const input = JSON.parse(message);
      const auth = ws.deserializeAttachment();
      const room = await this.load();
      if (!auth || (auth.actor === "learner" && auth.seat !== room.game.learnerHash))
        throw new GameError("This seat is no longer valid.", 403);
      const now = Date.now();
      if (input.action === "poll") {
        command(room.game, auth.actor, { action: "poll" }, now);
      } else {
        const wasSeen = room.game.receipts.includes(`${auth.actor}:${input.id}`);
        command(room.game, auth.actor, input, now);
        if (input.action === "replace-learner" && !wasSeen) room.game.invite = token();
      }
      await this.persist(room, now);
      this.publish(room, now);
    } catch (error) {
      this.send(ws, { type: "error", error: error instanceof GameError ? error.message : "Invalid command." });
    }
  }

  async disconnected(ws) {
    const auth = ws.deserializeAttachment();
    if (!auth) return;
    const room = await this.ctx.storage.get("room");
    if (!room || room.expiresAt <= Date.now()) return;
    // An older socket must never disconnect a newer replacement of the seat.
    if (this.ctx.getWebSockets().some(other =>
      other !== ws && other.readyState === 1 &&
      other.deserializeAttachment()?.actor === auth.actor)) return;
    const now = Date.now(), s = room.game;
    if (["countdown", "active"].includes(s.phase) && !s.paused && now < s.deadline) {
      s.paused = {
        at: now, remaining: s.deadline - now,
        countdown: Math.max(0, s.startsAt - now), reason: "connection",
      };
    } else {
      // A completed deadline wins over a late close notification.
      advance(s, now);
    }
    s.seen[auth.actor] = 0;
    await this.persist(room, now);
    this.publish(room, now);
  }

  async webSocketClose(ws) {
    await this.disconnected(ws);
  }

  async webSocketError(ws) {
    await this.disconnected(ws);
  }

  async alarm() {
    const room = await this.ctx.storage.get("room");
    if (!room) return;
    const now = Date.now();
    if (room.expiresAt <= now) {
      for (const ws of this.ctx.getWebSockets()) if (ws.readyState === 1) ws.close(4001, "Game expired");
      await this.ctx.storage.deleteAll();
      return;
    }
    pauseOnDisconnect(room.game, now);
    advance(room.game, now);
    await this.persist(room, now);
    this.publish(room, now);
  }
}
