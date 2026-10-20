-- Visitor/session tracking table. The analytics ping endpoint
-- (api/analytics/ping) upserts visits here and the admin live-stats endpoint
-- (api/admin/live-stats) reads counts from it — but the table was never created
-- by a migration, so every ping 500'd ("Could not find the table
-- 'public.site_sessions'") and the dashboard showed 0 live / 0 today.
-- Additive, non-destructive.

create table if not exists site_sessions (
  session_id text primary key,                    -- ping upsert onConflict target
  page       text,
  last_seen  timestamptz not null default now(),
  created_at timestamptz not null default now()   -- ping does not set this; needed for visitors-today/month
);

-- live count filters on last_seen; visitors-today / month filter on created_at
create index if not exists site_sessions_last_seen_idx  on site_sessions (last_seen);
create index if not exists site_sessions_created_at_idx on site_sessions (created_at);
