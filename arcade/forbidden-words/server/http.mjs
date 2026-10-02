import { initialState, command, view, GameError } from "./game.mjs";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN = /^[0-9a-f]{64}$/;
export function token() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (n) =>
    n.toString(16).padStart(2, "0"),
  ).join("");
}
export async function hash(value) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
    (n) => n.toString(16).padStart(2, "0"),
  ).join("");
}
async function same(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  // HMAC verification provides constant-time comparison in both Workers and Node.
  const key = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(32),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(a),
  );
  return crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    new TextEncoder().encode(b),
  );
}
export function supabaseRpc(env) {
  const base = String(env.ATLAS_SUPABASE_URL || "").replace(/\/+$/, "");
  const key =
    env.ATLAS_SUPABASE_SECRET_KEY || env.ATLAS_SUPABASE_SERVICE_ROLE_KEY;
  return async (name, args) => {
    if (!base || !key)
      throw new GameError("Game service is not configured.", 503);
    const response = await fetch(`${base}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (error.code === "P0001")
        throw new GameError(
          "Game limit reached. Finish an existing game, or try again later.",
          429,
        );
      throw new GameError(
        "Game service is temporarily unavailable. Please retry.",
        503,
      );
    }
    return response.status === 204 ? null : response.json();
  };
}
async function bodyOf(request) {
  if (!request.headers.get("Content-Type")?.startsWith("application/json"))
    throw new GameError("JSON required.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new GameError("Request required.", 400);
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 4096) {
      await reader.cancel();
      throw new GameError("Request too large.", 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    bytes.set(c, at);
    at += c.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new GameError("Invalid JSON.", 400);
  }
}

// Dependencies are supplied by Atlas's existing Worker. The local verifier uses
// the identical handler and actual PostgreSQL functions, with an isolated database.
export async function handleForbiddenWords(
  request,
  env,
  { authenticate, rpc = supabaseRpc(env) },
) {
  const origin = request.headers.get("Origin");
  const allowed = [env.ALLOWED_ORIGIN, env.ALLOWED_DEV_ORIGIN].filter(Boolean);
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, private",
    "Referrer-Policy": "no-referrer",
    Vary: "Origin",
    ...(allowed.includes(origin)
      ? { "Access-Control-Allow-Origin": origin }
      : {}),
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  const reply = (body, status = 200) =>
    new Response(JSON.stringify(body), { status, headers });
  try {
    if (origin && !allowed.includes(origin))
      throw new GameError("Origin is not permitted.", 403);
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (request.method !== "POST")
      throw new GameError("Method not allowed.", 405);
    const route = new URL(request.url).pathname.slice(
      "/forbidden-words/".length,
    );
    if (!["create", "session"].includes(route))
      throw new GameError("Not found.", 404);
    const body = await bodyOf(request);
    if (!body || !UUID.test(body.session || ""))
      throw new GameError("Invalid session.", 400);
    const learner = typeof body.credential === "string";
    let owner = null;
    if (!learner) {
      const auth = await authenticate(request, env);
      if (!auth.ok)
        throw new GameError(
          "Sign in to Atlas to host this game.",
          auth.status || 401,
        );
      owner = auth.userId;
    } else if (!TOKEN.test(body.credential))
      throw new GameError("Invalid learner credential.", 403);
    const credentialHash = learner ? await hash(body.credential) : null;
    if (route === "create") {
      if (learner) throw new GameError("Only a tutor can create a game.", 403);
      const state = initialState(0);
      state.theme = body.theme === "night" ? "night" : "light";
      state.invite = token();
      await rpc("forbidden_words_create", {
        p_id: body.session,
        p_owner: owner,
        p_state: state,
      });
    }
    for (let attempt = 0; attempt < 8; attempt++) {
      const row = await rpc("forbidden_words_read", { p_id: body.session });
      if (!row)
        throw new GameError(
          "This game has expired. Ask your tutor for a new link.",
          410,
        );
      const s = row.state;
      const now = Number(row.now);
      const actor = learner ? "learner" : "tutor";
      if (learner) {
        if (s.learnerHash) {
          if (!(await same(s.learnerHash, credentialHash)))
            throw new GameError(
              "This learner seat is already in use. Ask your tutor for a replacement link.",
              403,
            );
        } else {
          if (
            body.action !== "join" ||
            !TOKEN.test(body.invite || "") ||
            !(await same(s.invite, body.invite)) ||
            s.phase === "finished"
          ) {
            throw new GameError(
              "This invite is no longer available. Ask your tutor for a new link.",
              403,
            );
          }
          s.learnerHash = credentialHash;
        }
      } else if (row.owner !== owner)
        throw new GameError("This game belongs to another tutor.", 403);
      const input =
        route === "create" || body.action === "join"
          ? { action: "poll" }
          : body;
      const duplicate = s.receipts.includes(`${actor}:${input.id}`);
      command(s, actor, input, now);
      if (input.action === "replace-learner" && !duplicate) s.invite = token();
      // Resolution must still be before the deadline at the atomic DB commit.
      const isResolution =
        !duplicate && ["correct", "skip", "oops"].includes(input.action);
      const committed = await rpc("forbidden_words_commit", {
        p_id: body.session,
        p_revision: row.revision,
        p_state: s,
        p_deadline: isResolution && s.phase === "active" ? s.deadline : null,
      });
      if (!committed) continue;
      const projection = view(s, actor, now, row.revision + 1);
      if (!learner) projection.invite = s.invite;
      return reply({ ok: true, state: projection });
    }
    throw new GameError("The game is busy. Please retry.", 409);
  } catch (error) {
    // Do not log bodies, card content, tokens or raw database errors.
    if (!(error instanceof GameError))
      console.error("[Forbidden Words] Request failed:", error.name);
    return reply(
      {
        ok: false,
        error:
          error instanceof GameError
            ? error.message
            : "Connection interrupted. Please retry.",
      },
      error.status || 503,
    );
  }
}
