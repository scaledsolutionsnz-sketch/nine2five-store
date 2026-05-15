-- Stage 3: Customer account RLS + helpers

-- ─────────────────────────────────────────────
-- CUSTOMERS: allow self-read and self-update via auth.uid()
-- ─────────────────────────────────────────────
create policy "customer_self_read" on customers
  for select using (user_id = auth.uid());

create policy "customer_self_update" on customers
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- ORDERS: customer can read their own orders
-- ─────────────────────────────────────────────
create policy "customer_read_own" on orders
  for select using (
    customer_id in (
      select id from customers where user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- ORDER_ITEMS: customer can read items for their orders
-- ─────────────────────────────────────────────
create policy "customer_read_own" on order_items
  for select using (
    order_id in (
      select o.id from orders o
      join customers c on c.id = o.customer_id
      where c.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- WISHLISTS: customer manages their own
-- ─────────────────────────────────────────────
create policy "customer_manage_own" on wishlists
  using (
    customer_id in (select id from customers where user_id = auth.uid())
  )
  with check (
    customer_id in (select id from customers where user_id = auth.uid())
  );

-- Allow customer to read products in their wishlist (products already have public_read)
-- Already covered by existing public_read policy on products

-- ─────────────────────────────────────────────
-- FUNCTION: link or create customer record on auth sign-in
-- Called from auth callback after session is established
-- ─────────────────────────────────────────────
create or replace function link_customer_account()
returns void language plpgsql security definer as $$
declare
  v_user_id uuid := auth.uid();
  v_email   text := auth.email();
begin
  if v_user_id is null or v_email is null then
    return;
  end if;

  insert into customers (email, user_id, first_name, last_name)
  values (v_email, v_user_id, '', '')
  on conflict (email) do update
    set user_id = v_user_id
    where customers.user_id is null;
end;
$$;

-- ─────────────────────────────────────────────
-- FUNCTION: get current customer record
-- ─────────────────────────────────────────────
create or replace function get_my_customer()
returns setof customers language sql security definer as $$
  select * from customers where user_id = auth.uid() limit 1;
$$;

-- ─────────────────────────────────────────────
-- FUNCTION: get current customer's orders
-- ─────────────────────────────────────────────
create or replace function get_my_orders()
returns setof orders language sql security definer as $$
  select o.* from orders o
  join customers c on c.id = o.customer_id
  where c.user_id = auth.uid()
  order by o.created_at desc;
$$;
