import { test } from "node:test";
import assert from "node:assert/strict";
import { database, OWNER } from "./database.mjs";
import { handleTwoKeys, token } from "../server/http.mjs";
test("real PostgreSQL private grants, ownership, seat racing, CAS, persistence and retries", async () => {
  const { db, rpc } = await database();
  try {
    const auth = async (r) =>
      r.headers.get("Authorization") === "Bearer owner"
        ? { ok: true, userId: OWNER }
        : { ok: false, status: 401 };
    const session = crypto.randomUUID();
    const call = async (route, body = {}, as = "owner") => {
      const r = await handleTwoKeys(
        new Request("http://localhost/two-keys/" + route, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(as ? { Authorization: "Bearer " + as } : {}),
          },
          body: JSON.stringify({ session, ...body }),
        }),
        {},
        { rpc, authenticate: auth },
      );
      return { status: r.status, ...(await r.json()) };
    };
    assert.equal((await call("create", {}, "")).status, 401);
    const created = await call("create");
    assert.equal(created.status, 200);
    const invite = created.state.invite,
      c1 = token(),
      c2 = token();
    const claims = await Promise.all([
      call("session", { action: "join", credential: c1, invite }, ""),
      call("session", { action: "join", credential: c2, invite }, ""),
    ]);
    assert.deepEqual(claims.map((x) => x.status).sort(), [200, 403]);
    const credential = claims[0].status === 200 ? c1 : c2;
    const joined = await call(
      "session",
      { action: "join", credential, invite },
      "",
    );
    assert.equal(joined.status, 200);
    assert.equal(joined.state.invite, undefined);
    let a = await call("session", {
      action: "select",
      id: "select",
      version: joined.state.version,
      mission: "vault",
    });
    assert.equal(a.state.phase, "briefing");
    a = await call("session", {
      action: "ready",
      id: "r1",
      version: a.state.version,
    });
    let b = await call(
      "session",
      { credential, action: "ready", id: "r2", version: a.state.version },
      "",
    );
    assert.equal(b.state.phase, "active");
    const body = {
      credential,
      action: "pulse",
      id: "retry",
      version: b.state.version,
      index: 1,
    };
    const retries = await Promise.all([
      call("session", body, ""),
      call("session", body, ""),
    ]);
    assert.ok(retries.every((x) => x.status === 200));
    assert.equal(retries[0].state.version, retries[1].state.version);
    const restored = await call("session", { credential, action: "poll" }, "");
    assert.equal(restored.state.world.pulse, 1);
    assert.equal(restored.state.world.emblems, undefined);
    const av = await call("session", { action: "poll" });
    assert.equal(av.state.world.order, undefined);
    assert.equal(
      (
        await call(
          "session",
          {
            credential,
            action: "finish",
            id: "bad",
            version: av.state.version,
          },
          "",
        )
      ).status,
      409,
    );
    const row = await rpc("two_keys_read", { p_id: session });
    assert.equal(
      await rpc("two_keys_commit", {
        p_id: session,
        p_revision: row.revision - 1,
        p_state: row.state,
        p_deadline: null,
      }),
      false,
    );
    assert.equal(
      await rpc("two_keys_commit", {
        p_id: session,
        p_revision: row.revision,
        p_state: row.state,
        p_deadline: row.now - 1,
      }),
      false,
    );
    const access = await db.query(
      "select relrowsecurity as rls from pg_class where oid='public.two_keys_sessions'::regclass",
    );
    assert.equal(access.rows[0].rls, true);
    for (const role of ["anon", "authenticated"]) {
      const grants = await db.query(
        `select has_table_privilege('${role}','public.two_keys_sessions','SELECT') as t, has_function_privilege('${role}','public.two_keys_read(uuid)','EXECUTE') as f`,
      );
      assert.deepEqual(grants.rows[0], { t: false, f: false });
    }
    await db.query(
      "update public.two_keys_sessions set state=jsonb_set(state,'{seen,tutor}','0') where id=$1",
      [session],
    );
    b = await call("session", { credential, action: "poll" }, "");
    assert.equal(b.state.connected, false);
    assert.equal(
      (
        await call(
          "session",
          {
            credential,
            action: "pulse",
            id: "paused",
            version: b.state.version,
            index: 2,
          },
          "",
        )
      ).status,
      409,
    );
    const back = await call("session", { action: "poll" });
    assert.equal(back.state.connected, true);
    assert.equal(back.state.phase, "active");
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (url, options) => {
        if (String(url).endsWith("/auth/v1/user"))
          return Response.json({ id: OWNER });
        return Response.json(
          await rpc(String(url).split("/").at(-1), JSON.parse(options.body)),
        );
      };
      const { default: worker } = await import("../../../shared/worker.js");
      const response = await worker.fetch(
        new Request("https://api.test/two-keys/session", {
          method: "POST",
          headers: {
            Origin: "https://atlas.test",
            "Content-Type": "application/json",
            Authorization: "Bearer verified-tutor",
          },
          body: JSON.stringify({ session, action: "poll" }),
        }),
        {
          ALLOWED_ORIGIN: "https://atlas.test",
          ATLAS_SUPABASE_URL: "https://supabase.test",
          ATLAS_SUPABASE_SECRET_KEY: "verification-only",
        },
      );
      assert.equal(response.status, 200);
      assert.equal((await response.json()).state.role, "A");
    } finally {
      globalThis.fetch = originalFetch;
    }
    const denied = await handleTwoKeys(
      new Request("https://api.test/two-keys/session", {
        method: "POST",
        headers: { Origin: "https://untrusted.test" },
      }),
      { ALLOWED_ORIGIN: "https://atlas.test" },
      { rpc, authenticate: auth },
    );
    assert.equal(denied.status, 403);
    await db.query(
      "update public.two_keys_sessions set expires_at=clock_timestamp()-interval '1 second' where id=$1",
      [session],
    );
    assert.equal(
      (await call("session", { credential, action: "poll" }, "")).status,
      410,
    );
  } finally {
    await db.close();
  }
});
