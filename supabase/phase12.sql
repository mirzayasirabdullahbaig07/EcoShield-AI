-- Phase 12: "needs more information" review state. Run once in the Supabase SQL Editor (safe to run twice).
alter table reports drop constraint if exists reports_status_check;
alter table reports add constraint reports_status_check
  check (status in ('pending', 'needs_info', 'approved', 'rejected', 'registered'));
