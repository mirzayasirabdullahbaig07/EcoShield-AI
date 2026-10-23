-- Phase 4: run once in Supabase > SQL Editor (after schema.sql).
alter table reports add column if not exists author_name text;
alter table reports add column if not exists duplicate_flags jsonb not null default '[]';
alter table reports add column if not exists reviewer_note text;
alter table reports add column if not exists reviewed_at timestamptz;

create sequence if not exists report_seq;
alter table reports alter column public_id set default ('CS-2026-' || lpad(nextval('report_seq')::text, 4, '0'));
grant usage, select on sequence report_seq to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;

-- Private bucket for evidence photos: 4 MB max (Vercel request limit is 4.5 MB), images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidence', 'evidence', false, 4194304, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set file_size_limit = 4194304, allowed_mime_types = array['image/jpeg','image/png','image/webp'];
