-- Run once in Supabase > SQL Editor. All tables are server-only: RLS is on with no public policies,
-- so the anon key can read nothing. The app reads/writes through server routes with the service-role key.

create table if not exists neighbourhoods (
  id text primary key, name text not null, city text not null, country text not null,
  lat double precision not null, lng double precision not null
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  neighbourhood_id text references neighbourhoods(id),
  category text not null check (category in ('blocked_drainage','flooding','tree_planting','cleanup','other')),
  description text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','registered')),
  evidence_path text, evidence_sha256 text,
  created_at timestamptz not null default now()
);

create table if not exists audit_events (
  id bigint generated always as identity primary key,
  report_id uuid references reports(id) on delete cascade,
  actor_role text not null, action text not null, note text,
  created_at timestamptz not null default now()
);

create table if not exists chain_records (
  report_id uuid primary key references reports(id) on delete cascade,
  network text not null, tx_hash text not null, block_number bigint,
  registered_at timestamptz not null default now()
);

alter table neighbourhoods enable row level security;
alter table reports enable row level security;
alter table audit_events enable row level security;
alter table chain_records enable row level security;

insert into neighbourhoods (id, name, city, country, lat, lng) values
  ('madina-town-faisalabad','Madina Town','Faisalabad','Pakistan',31.43,73.09),
  ('gulberg-lahore','Gulberg','Lahore','Pakistan',31.51,74.35),
  ('central-jakarta','Central Jakarta','Jakarta','Indonesia',-6.18,106.83)
on conflict (id) do nothing;
