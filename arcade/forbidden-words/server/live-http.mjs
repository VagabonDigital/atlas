import { GameError } from "./game.mjs";
import { bodyOf, supabaseRpc } from "./http.mjs";

// Staged behind an explicit, default-off Worker switch. The existing
// /forbidden-words/create and /session transport remains unchanged.
const LIVE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LIVE_CONTEXT = /^[a-zA-Z0-9_-]{1,160}$/;
const LIVE_CREDENTIAL = /^[0-9a-f]{64}$/;
const LIVE_TRANSPORT = "durable";
const liveReply = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, private",
      "Referrer-Policy": "no-referrer",
      ...headers,
    },
  });

export async function handleForbiddenWordsLive(request, env, {
  authenticate, rpc = supabaseRpc(env),
  namespace = env.FORBIDDEN_WORDS_LIVE,
}) {
  const origin = request.headers.get("Origin");
  const allowed = [env.ALLOWED_ORIGIN, env.ALLOWED_DEV_ORIGIN].filter(Boolean);
  const cors = {
    Vary: "Origin",
    ...(allowed.includes(origin) ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  try {
    // Browser origins are mandatory for both HTTP and WebSocket entry.
    if (!origin || !allowed.includes(origin))
      throw new GameError("Origin is not permitted.", 403);
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers: cors });
    if (!namespace) throw new GameError("Live rooms are unavailable.", 503);
    const pathname = new URL(request.url).pathname;
    const route = pathname.slice("/forbidden-words/live/".length);
    if (!["create", "ticket", "socket"].includes(route))
      throw new GameError("Not found.", 404);
    const isSocket = route === "socket";
    if (isSocket ? request.method !== "GET" : request.method !== "POST")
      throw new GameError("Method not allowed.", 405);
    let input;
    if (isSocket) {
      if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket")
        throw new GameError("WebSocket upgrade required.", 426);
      const url = new URL(request.url);
      input = { session: url.searchParams.get("session") };
      if (!/^fw-ticket\.[0-9a-f]{64}$/.test(request.headers.get("Sec-WebSocket-Protocol") || ""))
        throw new GameError("Connection ticket required.", 401);
    } else {
      input = await bodyOf(request);
    }
    if (!input || !LIVE_ID.test(input.session || ""))
      throw new GameError("Invalid game session.", 400);
    const stub = namespace.get(namespace.idFromName(input.session));
    if (isSocket) {
      // No credential or connection ticket is placed in the URL.
      return stub.fetch(new Request("https://live-room.internal/socket", {
        headers: {
          Upgrade: "websocket",
          "Sec-WebSocket-Protocol": request.headers.get("Sec-WebSocket-Protocol"),
        },
      }));
    }
    if (route === "create") {
      const auth = await authenticate(request, env);
      if (!auth.ok)
        throw new GameError("Sign in to Atlas to host this game.", auth.status || 401);
      if (!LIVE_CONTEXT.test(input.atlasSessionId || ""))
        throw new GameError("Select an Atlas learner to host this game.", 400);
      // This one-time metadata reservation shares the existing atomic
      // three-unfinished / twenty-retained per-tutor quotas with HTTP games.
      // Never create a second full game state in Supabase.
      const record = {
        transport: LIVE_TRANSPORT,
        phase: "waiting",
        atlasSessionId: input.atlasSessionId,
      };
      await rpc("forbidden_words_create", {
        p_id: input.session, p_owner: auth.userId, p_state: record,
      });
      const existing = await rpc("forbidden_words_read", { p_id: input.session });
      if (!existing || existing.owner !== auth.userId ||
          existing.state?.transport !== LIVE_TRANSPORT ||
          existing.state?.atlasSessionId !== input.atlasSessionId)
        throw new GameError("This room belongs to a different game or learner.", 409);
      const response = await stub.fetch(new Request("https://live-room.internal/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: auth.userId, atlasSessionId: input.atlasSessionId }),
      }));
      return liveReply(await response.json(), response.status, cors);
    }
    const actor = input.actor;
    let credential;
    if (actor === "tutor") {
      const auth = await authenticate(request, env);
      if (!auth.ok)
        throw new GameError("Sign in to Atlas to host this game.", auth.status || 401);
      if (!LIVE_CONTEXT.test(input.atlasSessionId || ""))
        throw new GameError("Invalid Atlas learner context.", 400);
      credential = { actor, owner: auth.userId, atlasSessionId: input.atlasSessionId };
    } else if (actor === "learner") {
      if (!LIVE_CREDENTIAL.test(input.credential || ""))
        throw new GameError("Invalid learner credential.", 403);
      credential = { actor, credential: input.credential, invite: input.invite };
    } else throw new GameError("Invalid game seat.", 400);
    const response = await stub.fetch(new Request("https://live-room.internal/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credential),
    }));
    return liveReply(await response.json(), response.status, cors);
  } catch (error) {
    if (!(error instanceof GameError))
      console.error("[Forbidden Words live gateway] Request failed:", error.name);
    return liveReply({
      ok: false,
      error: error instanceof GameError ? error.message : "Live game temporarily unavailable.",
    }, error instanceof GameError ? error.status : 503, cors);
  }
}
