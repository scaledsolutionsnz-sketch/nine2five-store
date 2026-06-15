-- Soft-delete (archive) support for affiliates. Admin "delete" sets archived_at
-- instead of hard-deleting, because affiliate_clicks is ON DELETE CASCADE (a hard
-- delete would destroy the affiliate's tracked clicks) and affiliate_conversions /
-- affiliate_payouts are ON DELETE RESTRICT. Archiving preserves all tracking data
-- and just hides the affiliate from the admin list. Additive, non-destructive.

alter table affiliates add column if not exists archived_at timestamptz;

create index if not exists affiliates_archived_at_idx on affiliates (archived_at);
