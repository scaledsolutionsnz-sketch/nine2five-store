-- 016_affiliate_payout_methods.sql
-- Multi-method ambassador payouts: NZ bank transfer, PayPal, or Wise, plus a
-- country field so the portal can default the method (NZ -> bank, else PayPal/Wise).
-- Idempotent (add column if not exists) so it is safe to re-run.

-- Country (drives the default payout method in the portal).
alter table affiliates add column if not exists country text not null default 'NZ';

-- Legacy NZ bank fields already exist on prod (they were added outside the
-- migrations). Declared here so the schema is reproducible from migrations alone.
alter table affiliates add column if not exists payout_bank_name text;
alter table affiliates add column if not exists payout_bank_account text;

-- Chosen payout method.
alter table affiliates add column if not exists payout_method text
  check (payout_method in ('bank_nz', 'paypal', 'wise'));

-- PayPal / Wise fields.
alter table affiliates add column if not exists paypal_email text;
alter table affiliates add column if not exists wise_email text;
alter table affiliates add column if not exists wise_account_ref text;

-- Migrate anyone who already entered NZ bank details into the new structure.
update affiliates
set payout_method = 'bank_nz'
where payout_method is null
  and (payout_bank_account is not null or nullif(payout_bank_name, '') is not null);

-- Note: RLS is unchanged. affiliates keeps admin_all (is_admin()) + self_read
-- (SELECT where user_id = auth.uid()). Ambassadors still WRITE only via the
-- scoped /api/affiliates/settings route (service role, .eq user_id = auth.uid()),
-- so no self-UPDATE policy is added and no ambassador can write another's row.
