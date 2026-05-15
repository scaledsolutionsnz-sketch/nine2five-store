-- Atomically increment discount code usage count
create or replace function increment_discount_uses(p_code text)
returns void language sql security definer as $$
  update discount_codes
  set uses = uses + 1
  where lower(code) = lower(p_code);
$$;
