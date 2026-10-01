import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
export const OWNER = "00000000-0000-4000-8000-000000000001";
export async function database(path) {
  const db = new PGlite(path);
  await db.waitReady;
  const exists = await db.query(
    "select to_regclass('public.forbidden_words_sessions') as present",
  );
  if (!exists.rows[0].present) {
    await db.exec(`create role anon; create role authenticated; create role service_role;
      create schema auth; create table auth.users(id uuid primary key);
      insert into auth.users values ('${OWNER}');`);
    await db.exec(
      await readFile(
        new URL(
          "../../../supabase/migrations/20261001025602_forbidden_words_sessions.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
  }
  // Fixed allow-list and positional values; no raw browser SQL or identifiers.
  const calls = {
    forbidden_words_create: ["p_id", "p_owner", "p_state"],
    forbidden_words_read: ["p_id"],
    forbidden_words_commit: ["p_id", "p_revision", "p_state", "p_deadline"],
  };
  const rpc = async (name, args) => {
    const keys = calls[name];
    if (!keys) throw new Error("Unknown RPC");
    const result = await db.query(
      `select public.${name}(${keys.map((_, i) => `$${i + 1}`).join(",")}) as result`,
      keys.map((k) => args[k]),
    );
    return result.rows[0].result;
  };
  return { db, rpc };
}
