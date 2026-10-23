-- Phase 11 (security hardening): run once in Supabase > SQL Editor, after schema.sql and phase4.sql.

-- 1. Reports remember which demo session created them, so only that session (and reviewers) can open the evidence photo.
alter table reports add column if not exists author_session text;
create index if not exists reports_author_session_idx on reports (author_session);

-- 2. Rate limiting: one row per key, fixed window, updated atomically in a single statement.
create table if not exists rate_limits (
  key text primary key,
  window_start timestamptz not null,
  hits int not null default 0
);
alter table rate_limits enable row level security;

create or replace function hit_rate_limit(p_key text, p_window_seconds int, p_limit int)
returns table (allowed boolean, retry_after int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_hits int;
  v_start timestamptz;
begin
  insert into rate_limits as r (key, window_start, hits) values (p_key, v_now, 1)
  on conflict (key) do update set
    window_start = case when r.window_start < v_now - make_interval(secs => p_window_seconds) then v_now else r.window_start end,
    hits         = case when r.window_start < v_now - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end
  returning r.hits, r.window_start into v_hits, v_start;
  allowed := v_hits <= p_limit;
  retry_after := greatest(0, ceil(extract(epoch from (v_start + make_interval(secs => p_window_seconds) - v_now)))::int);
  return next;
end;
$$;

revoke all on function hit_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function hit_rate_limit(text, int, int) to service_role;
grant select, insert, update, delete on rate_limits to service_role;
