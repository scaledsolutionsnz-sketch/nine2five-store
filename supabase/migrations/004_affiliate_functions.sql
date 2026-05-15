-- Affiliate helper functions

-- Atomically increment click counter
create or replace function increment_affiliate_clicks(p_affiliate_id uuid)
returns void language sql security definer as $$
  update affiliates
  set total_clicks = total_clicks + 1
  where id = p_affiliate_id;
$$;

-- Record a conversion and update affiliate totals
create or replace function record_affiliate_conversion(
  p_affiliate_id uuid,
  p_order_id uuid,
  p_order_total_cents int
)
returns uuid language plpgsql security definer as $$
declare
  v_rate int;
  v_commission int;
  v_conversion_id uuid;
begin
  select commission_rate into v_rate
  from affiliates
  where id = p_affiliate_id;

  if not found then
    raise exception 'Affiliate not found: %', p_affiliate_id;
  end if;

  v_commission := (p_order_total_cents * v_rate / 100)::int;

  insert into affiliate_conversions (
    affiliate_id, order_id, order_total_cents, commission_cents, status
  )
  values (p_affiliate_id, p_order_id, p_order_total_cents, v_commission, 'pending')
  returning id into v_conversion_id;

  update affiliates set
    total_conversions = total_conversions + 1,
    total_commission_cents = total_commission_cents + v_commission
  where id = p_affiliate_id;

  return v_conversion_id;
end;
$$;

-- Get affiliate stats for dashboard
create or replace function get_affiliate_stats(p_affiliate_id uuid)
returns table (
  clicks_7d int,
  clicks_30d int,
  conversions_7d int,
  conversions_30d int,
  commission_pending_cents int,
  commission_approved_cents int
)
language sql security definer as $$
  select
    (select count(*)::int from affiliate_clicks
     where affiliate_id = p_affiliate_id and created_at >= now() - interval '7 days'),
    (select count(*)::int from affiliate_clicks
     where affiliate_id = p_affiliate_id and created_at >= now() - interval '30 days'),
    (select count(*)::int from affiliate_conversions
     where affiliate_id = p_affiliate_id and created_at >= now() - interval '7 days'),
    (select count(*)::int from affiliate_conversions
     where affiliate_id = p_affiliate_id and created_at >= now() - interval '30 days'),
    (select coalesce(sum(commission_cents), 0)::int from affiliate_conversions
     where affiliate_id = p_affiliate_id and status = 'pending'),
    (select coalesce(sum(commission_cents), 0)::int from affiliate_conversions
     where affiliate_id = p_affiliate_id and status = 'approved');
$$;
