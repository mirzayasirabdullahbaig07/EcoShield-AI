// Runs the REAL SQL files in an in-process Postgres (PGlite). Supabase-only parts (roles, storage schema) are stubbed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const sql = (f: string) => readFileSync(new URL(`../supabase/${f}`, import.meta.url), "utf8");

(async () => {
  const db = new PGlite();
  await db.exec(`create role service_role; create role anon; create role authenticated;
    create schema storage; create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);`);
  for (const f of ["schema.sql", "phase4.sql", "phase11.sql", "phase12.sql"]) await db.exec(sql(f));
  await db.exec(sql("phase11.sql")); await db.exec(sql("phase12.sql")); // migrations must be safe to run twice

  const q = async <T = Record<string, unknown>>(text: string, params: unknown[] = []) => (await db.query<T>(text, params)).rows;

  // schema and seed
  assert.equal((await q("select count(*)::int n from neighbourhoods"))[0].n as number, 3);
  const bucket = await q<{ file_size_limit: string }>("select * from storage.buckets where id='evidence'");
  assert.equal(Number(bucket[0].file_size_limit), 4194304, "4 MB evidence bucket");

  // row level security is on for every table (the anon key can read nothing)
  const rls = await q<{ relname: string; relrowsecurity: boolean }>("select relname, relrowsecurity from pg_class where relname in ('neighbourhoods','reports','audit_events','chain_records','rate_limits')");
  assert.equal(rls.length, 5); assert.ok(rls.every((r) => r.relrowsecurity), "RLS enabled on all tables");

  // report numbering and constraints
  const a = await q<{ public_id: string }>("insert into reports (neighbourhood_id, category, description, author_session) values ('gulberg-lahore','flooding','x','s1') returning public_id");
  const b = await q<{ public_id: string }>("insert into reports (neighbourhood_id, category, description) values ('gulberg-lahore','cleanup','y') returning public_id");
  assert.equal(a[0].public_id, "CS-2026-0001"); assert.equal(b[0].public_id, "CS-2026-0002");
  await assert.rejects(db.query("insert into reports (category, description) values ('nonsense','z')"), "bad category rejected");
  await assert.rejects(db.query("insert into reports (category, description, status) values ('flooding','z','hacked')"), "bad status rejected");
  assert.equal((await q("select count(*)::int n from reports where author_session='s1'"))[0].n, 1);
  // phase12: the new review state is accepted, nothing else slips through
  await db.query("update reports set status='needs_info' where public_id='CS-2026-0001'");
  assert.equal((await q("select status from reports where public_id='CS-2026-0001'"))[0].status, "needs_info");
  await assert.rejects(db.query("update reports set status='needs-info' where public_id='CS-2026-0001'"), "misspelt status still rejected");
  for (const s of ["pending", "approved", "rejected", "registered"]) await db.query("update reports set status=$1 where public_id='CS-2026-0001'", [s]);

  // rate limiter
  const hit = async (k: string, w = 60, l = 3) => (await q<{ allowed: boolean; retry_after: number }>("select * from hit_rate_limit($1,$2,$3)", [k, w, l]))[0];
  const seq = [await hit("a"), await hit("a"), await hit("a"), await hit("a"), await hit("a")];
  assert.deepEqual(seq.map((s) => s.allowed), [true, true, true, false, false], "blocks after the limit");
  assert.ok(seq[3].retry_after >= 1 && seq[3].retry_after <= 60, `retry_after is sensible (${seq[3].retry_after})`);
  assert.equal((await hit("b")).allowed, true, "other keys are independent");
  const fast = [await hit("c", 1, 1), await hit("c", 1, 1)];
  assert.deepEqual(fast.map((s) => s.allowed), [true, false]);
  await new Promise((r) => setTimeout(r, 1200));
  const again = await hit("c", 1, 1);
  assert.equal(again.allowed, true, "window resets after it expires");
  assert.equal((await q("select hits from rate_limits where key='c'"))[0].hits, 1);
  console.log("sql: all assertions passed (real Postgres via PGlite)");
  await db.close();
})().catch((e) => { console.error(e); process.exit(1); });
