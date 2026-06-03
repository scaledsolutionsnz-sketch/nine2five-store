create table if not exists ambassador_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  -- personal
  name text,
  email text,
  phone text,
  city text,
  age int,
  story text,

  -- platforms (jsonb array: [{platform, handle, followers, avg_views}])
  platforms jsonb default '[]',

  -- content
  content_types text[],
  posting_frequency text,
  best_post_link text,

  -- audience
  audience_ages text[],
  audience_gender_male_pct int,
  audience_locations text,

  -- athlete
  is_athlete boolean default false,
  sports text[],
  athlete_level text,
  current_team text,
  highest_achievement text,

  -- commitment
  posts_per_month int,
  can_attend_events boolean default false,
  can_do_video boolean default false,
  has_camera_setup boolean default false,
  skills text[],

  -- brand fit
  why_n2f text,
  worn_before boolean default false,
  current_brands text,
  anything_else text,

  -- admin
  status text default 'new' check (status in ('new','reviewing','approved','rejected','waitlist')),
  admin_notes text
);

alter table ambassador_applications enable row level security;

-- public can insert (submit application)
create policy "anyone can apply"
  on ambassador_applications for insert
  with check (true);

-- only authenticated admins can read/update
create policy "admins can read"
  on ambassador_applications for select
  using (auth.role() = 'authenticated');

create policy "admins can update"
  on ambassador_applications for update
  using (auth.role() = 'authenticated');
