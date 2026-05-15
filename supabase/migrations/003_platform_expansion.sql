-- Stage 1: Platform expansion — new tables, indexes, policies

-- ─────────────────────────────────────────────
-- DISCOUNT CODES
-- ─────────────────────────────────────────────
create table discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  value int not null,              -- percentage (0-100) or cents
  min_order_cents int default 0,
  max_uses int,                    -- null = unlimited
  uses int not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz default now()
);

create index discount_codes_code_idx on discount_codes (lower(code));

-- ─────────────────────────────────────────────
-- AFFILIATES
-- ─────────────────────────────────────────────
create table affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null unique,
  name text not null,
  referral_code text not null unique,
  commission_rate int not null default 10,  -- percentage 0-100
  status text not null default 'pending'
    check (status in ('pending', 'active', 'suspended')),
  stripe_account_id text,
  total_clicks int not null default 0,
  total_conversions int not null default 0,
  total_commission_cents int not null default 0,
  total_paid_cents int not null default 0,
  notes text,
  created_at timestamptz default now(),
  approved_at timestamptz
);

create index affiliates_referral_code_idx on affiliates (referral_code);
create index affiliates_user_id_idx on affiliates (user_id);
create index affiliates_status_idx on affiliates (status);

-- ─────────────────────────────────────────────
-- AFFILIATE CLICKS
-- ─────────────────────────────────────────────
create table affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete cascade,
  ip_address text,
  user_agent text,
  referrer text,
  landing_page text,
  created_at timestamptz default now()
);

create index affiliate_clicks_affiliate_id_idx on affiliate_clicks (affiliate_id);
create index affiliate_clicks_created_at_idx on affiliate_clicks (created_at);

-- ─────────────────────────────────────────────
-- AFFILIATE CONVERSIONS
-- ─────────────────────────────────────────────
create table affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete restrict,
  order_id uuid references orders(id) on delete set null,
  order_total_cents int not null,
  commission_cents int not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'paid', 'reversed')),
  created_at timestamptz default now()
);

create index affiliate_conversions_affiliate_id_idx on affiliate_conversions (affiliate_id);
create index affiliate_conversions_order_id_idx on affiliate_conversions (order_id);
create index affiliate_conversions_status_idx on affiliate_conversions (status);

-- ─────────────────────────────────────────────
-- AFFILIATE PAYOUTS
-- ─────────────────────────────────────────────
create table affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references affiliates(id) on delete restrict,
  amount_cents int not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  stripe_transfer_id text,
  period_start date,
  period_end date,
  notes text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create index affiliate_payouts_affiliate_id_idx on affiliate_payouts (affiliate_id);
create index affiliate_payouts_status_idx on affiliate_payouts (status);

-- ─────────────────────────────────────────────
-- CART SESSIONS (abandoned cart + reservation tracking)
-- ─────────────────────────────────────────────
create table cart_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  email text,
  items jsonb not null default '[]',
  affiliate_code text,
  discount_code text,
  country text not null default 'NZ',
  recovery_sent_at timestamptz,
  converted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index cart_sessions_session_id_idx on cart_sessions (session_id);
create index cart_sessions_email_idx on cart_sessions (email);
create index cart_sessions_expires_at_idx on cart_sessions (expires_at);

-- ─────────────────────────────────────────────
-- CUSTOMER ACCOUNTS (link shoppers to auth.users)
-- ─────────────────────────────────────────────
alter table customers
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists accepts_marketing boolean not null default true,
  add column if not exists default_shipping_address jsonb,
  add column if not exists lifetime_value_cents int not null default 0;

create index if not exists customers_user_id_idx on customers (user_id);
create index if not exists customers_email_idx on customers (email);

-- ─────────────────────────────────────────────
-- WISHLIST
-- ─────────────────────────────────────────────
create table wishlists (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (customer_id, product_id)
);

create index wishlists_customer_id_idx on wishlists (customer_id);

-- ─────────────────────────────────────────────
-- BACK IN STOCK NOTIFICATIONS
-- ─────────────────────────────────────────────
create table back_in_stock_notifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete cascade,
  notified_at timestamptz,
  created_at timestamptz default now(),
  unique (email, variant_id)
);

create index back_in_stock_email_idx on back_in_stock_notifications (email);
create index back_in_stock_variant_idx on back_in_stock_notifications (variant_id);

-- ─────────────────────────────────────────────
-- STOCK MOVEMENTS
-- ─────────────────────────────────────────────
create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id) on delete cascade,
  type text not null check (type in (
    'sale', 'restock', 'damaged', 'returned', 'adjustment', 'reserved', 'reservation_released'
  )),
  quantity int not null,           -- positive = in, negative = out
  reference_id uuid,               -- order_id or purchase_order_id
  note text,
  created_by text,                 -- admin email
  created_at timestamptz default now()
);

create index stock_movements_variant_id_idx on stock_movements (variant_id);
create index stock_movements_created_at_idx on stock_movements (created_at);
create index stock_movements_type_idx on stock_movements (type);

-- ─────────────────────────────────────────────
-- CUSTOMER TAGS
-- ─────────────────────────────────────────────
create table customer_tags (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  tag text not null,
  created_at timestamptz default now(),
  unique (customer_id, tag)
);

create index customer_tags_customer_id_idx on customer_tags (customer_id);
create index customer_tags_tag_idx on customer_tags (tag);

-- ─────────────────────────────────────────────
-- CUSTOMER NOTES
-- ─────────────────────────────────────────────
create table customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  note text not null,
  created_by text not null,        -- admin email
  created_at timestamptz default now()
);

create index customer_notes_customer_id_idx on customer_notes (customer_id);

-- ─────────────────────────────────────────────
-- AUDIT LOGS
-- ─────────────────────────────────────────────
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity text not null,
  entity_id text,
  actor text,                      -- email of who did it
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create index audit_logs_actor_idx on audit_logs (actor);
create index audit_logs_entity_idx on audit_logs (entity, entity_id);
create index audit_logs_created_at_idx on audit_logs (created_at);
create index audit_logs_action_idx on audit_logs (action);

-- ─────────────────────────────────────────────
-- SUPPLIERS
-- ─────────────────────────────────────────────
create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  notes text,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- PURCHASE ORDERS
-- ─────────────────────────────────────────────
create table purchase_orders (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'ordered', 'in_transit', 'received', 'cancelled')),
  expected_at date,
  received_at date,
  notes text,
  total_cost_cents int default 0,
  created_by text,
  created_at timestamptz default now()
);

create index purchase_orders_status_idx on purchase_orders (status);
create index purchase_orders_supplier_id_idx on purchase_orders (supplier_id);

create table purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  variant_id uuid not null references product_variants(id),
  quantity_ordered int not null,
  quantity_received int not null default 0,
  unit_cost_cents int,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- INDEXES ON EXISTING TABLES (performance)
-- ─────────────────────────────────────────────
create index if not exists admin_users_email_idx on admin_users (email);
create index if not exists orders_customer_id_idx on orders (customer_id);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_created_at_idx on orders (created_at);
create index if not exists orders_stripe_pi_idx on orders (stripe_payment_intent_id);
create index if not exists order_items_order_id_idx on order_items (order_id);
create index if not exists order_items_variant_id_idx on order_items (variant_id);
create index if not exists products_active_idx on products (active);
create index if not exists products_slug_idx on products (slug);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table discount_codes enable row level security;
alter table affiliates enable row level security;
alter table affiliate_clicks enable row level security;
alter table affiliate_conversions enable row level security;
alter table affiliate_payouts enable row level security;
alter table cart_sessions enable row level security;
alter table wishlists enable row level security;
alter table back_in_stock_notifications enable row level security;
alter table stock_movements enable row level security;
alter table customer_tags enable row level security;
alter table customer_notes enable row level security;
alter table audit_logs enable row level security;
alter table suppliers enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;

-- Admin-only tables
create policy "admin_all" on discount_codes using (is_admin());
create policy "admin_all" on stock_movements using (is_admin());
create policy "admin_all" on customer_tags using (is_admin());
create policy "admin_all" on customer_notes using (is_admin());
create policy "admin_all" on audit_logs using (is_admin());
create policy "admin_all" on suppliers using (is_admin());
create policy "admin_all" on purchase_orders using (is_admin());
create policy "admin_all" on purchase_order_items using (is_admin());
create policy "admin_all" on affiliate_payouts using (is_admin());

-- Affiliates: admin all + self read
create policy "admin_all" on affiliates using (is_admin());
create policy "self_read" on affiliates for select using (user_id = auth.uid());

create policy "admin_all" on affiliate_clicks using (is_admin());
create policy "admin_all" on affiliate_conversions using (is_admin());

-- Public insert for affiliate clicks (tracked server-side)
create policy "public_insert" on affiliate_clicks for insert with check (true);

-- Cart sessions: anyone can insert/update their own session
create policy "session_access" on cart_sessions using (true) with check (true);

-- Back in stock: anyone can subscribe
create policy "public_insert" on back_in_stock_notifications for insert with check (true);
create policy "admin_all" on back_in_stock_notifications using (is_admin());

-- Wishlists: customer can manage their own, admin sees all
create policy "admin_all" on wishlists using (is_admin());

-- ─────────────────────────────────────────────
-- FIX: tighten order_items insert policy (was too open)
-- ─────────────────────────────────────────────
drop policy if exists "guest_insert" on order_items;
create policy "service_insert" on order_items for insert with check (false);
-- Order items are now only created via the service role in the webhook

-- ─────────────────────────────────────────────
-- ORDERS: add discount tracking columns
-- ─────────────────────────────────────────────
alter table orders
  add column if not exists discount_code text,
  add column if not exists discount_amount_cents int not null default 0,
  add column if not exists affiliate_code text,
  add column if not exists affiliate_conversion_id uuid references affiliate_conversions(id);

-- ─────────────────────────────────────────────
-- HELPER FUNCTIONS
-- ─────────────────────────────────────────────

-- Recalculate customer lifetime value
create or replace function update_customer_ltv(p_customer_id uuid)
returns void language plpgsql security definer as $$
begin
  update customers
  set lifetime_value_cents = (
    select coalesce(sum(total), 0)
    from orders
    where customer_id = p_customer_id
      and status not in ('cancelled', 'refunded')
  )
  where id = p_customer_id;
end;
$$;

-- Validate discount code and return discount amount
create or replace function apply_discount_code(
  p_code text,
  p_subtotal_cents int
)
returns table (
  discount_cents int,
  code_id uuid,
  error text
)
language plpgsql security definer as $$
declare
  v_code discount_codes;
begin
  select * into v_code
  from discount_codes
  where lower(code) = lower(p_code)
    and active = true
    and (expires_at is null or expires_at > now())
    and (max_uses is null or uses < max_uses);

  if not found then
    return query select 0::int, null::uuid, 'Invalid or expired discount code'::text;
    return;
  end if;

  if p_subtotal_cents < v_code.min_order_cents then
    return query select 0::int, null::uuid,
      format('Minimum order of $%s required', (v_code.min_order_cents / 100.0)::text)::text;
    return;
  end if;

  if v_code.type = 'percentage' then
    return query select
      ((p_subtotal_cents * v_code.value / 100))::int,
      v_code.id,
      null::text;
  else
    return query select
      least(v_code.value, p_subtotal_cents)::int,
      v_code.id,
      null::text;
  end if;
end;
$$;
