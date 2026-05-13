-- Nine2Five Store — Initial Schema

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price int not null, -- NZD cents
  compare_at_price int,
  image_urls text[] default '{}',
  active boolean default true,
  created_at timestamptz default now()
);

-- Product variants (per size)
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null check (size in ('6-9', '10-13')),
  stock_quantity int not null default 0,
  sku text,
  unique (product_id, size)
);

-- Customers (public shoppers)
create table customers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  created_at timestamptz default now()
);

-- Orders
create sequence order_number_seq start 1000;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number int not null default nextval('order_number_seq') unique,
  customer_id uuid references customers(id),
  guest_email text,
  status text not null default 'pending' check (status in (
    'pending','processing','shipped','delivered','cancelled','refunded'
  )),
  subtotal int not null, -- cents
  shipping_cost int not null default 0, -- cents
  total int not null, -- cents
  shipping_address jsonb not null,
  stripe_payment_intent_id text,
  tracking_number text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order items
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  product_name text not null,
  size text not null,
  quantity int not null default 1,
  unit_price int not null -- cents
);

-- Admin users (allowed to access dashboard)
create table admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now()
);

insert into admin_users (email) values ('nine2five.co.nz@gmail.com');

-- Email campaigns
create table email_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body_html text not null default '',
  status text not null default 'draft' check (status in ('draft','sent')),
  sent_at timestamptz,
  recipient_count int,
  created_at timestamptz default now()
);

-- RLS
alter table products enable row level security;
alter table product_variants enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table admin_users enable row level security;
alter table email_campaigns enable row level security;

-- Helper
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (select 1 from admin_users where email = auth.email());
$$;

-- Products: public read, admin write
create policy "public_read" on products for select using (active = true);
create policy "admin_all" on products using (is_admin());

create policy "public_read" on product_variants for select using (true);
create policy "admin_all" on product_variants using (is_admin());

-- Customers: admin only
create policy "admin_all" on customers using (is_admin());

-- Orders: admin all, guest can insert
create policy "admin_all" on orders using (is_admin());
create policy "guest_insert" on orders for insert with check (true);

create policy "admin_all" on order_items using (is_admin());
create policy "guest_insert" on order_items for insert with check (true);

create policy "admin_all" on admin_users using (is_admin());
create policy "admin_all" on email_campaigns using (is_admin());

-- Realtime
alter publication supabase_realtime add table orders;

-- Seed products
insert into products (name, slug, description, price, compare_at_price, image_urls) values
('Black Kahotea',         'black-kahotea',         'Our best-selling Māori inspired grip sock. Bold black design with Kahotea pattern — built for rugby, training, and the turf.',  2000, 2500, array['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80']),
('Grey Kahotea',          'grey-kahotea',           'Clean grey colourway with the iconic Kahotea Māori pattern. Versatile for the gym, the field, or the street.',                 2000, 2500, array['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80']),
('White Kahotea',         'white-kahotea',          'Crisp white with the Kahotea pattern. A fan favourite for Pilates, gym sessions, and light training.',                         2000, 2500, array['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80']),
('Pink Kahotea',          'pink-kahotea',           'Bold pink with Kahotea Māori detailing. Designed for performance, worn for style.',                                            2000, 2500, array['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80']),
('Toa Whenua',            'toa-whenua',             'New design. Toa Whenua — Warrior of the Land. Premium grip sock honouring the connection to whenua through Māori design.',     2000, 2500, array['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80']),
('Pasifika',              'pasifika',               'Limited edition. Pacific inspired design celebrating Polynesian culture and sport. Get them while they last.',                 2000, 2500, array['https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800&q=80']),
('Basic',                 'basic',                  'No frills. Pure performance. The Basic grip sock — reliable traction, compression fit, built to last.',                        2000, 2500, array['https://images.unsplash.com/photo-1582897085656-c636d006a246?w=800&q=80']),
('Tino Rangatiratanga',   'tino-rangatiratanga',    'Casual wear. Tino Rangatiratanga — sovereignty, pride, identity. Everyday socks that carry meaning.',                         1500, null, array['https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&q=80']);

-- Seed variants (30 stock each by default)
insert into product_variants (product_id, size, stock_quantity)
select id, s.size, 30
from products
cross join (values ('6-9'), ('10-13')) as s(size);
