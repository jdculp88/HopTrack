-- HopTrack Database Schema
-- Run this in your Supabase SQL editor

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- for fuzzy search

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  username      text unique not null,
  display_name  text not null,
  avatar_url    text,
  bio           text,
  home_city     text,
  total_checkins int default 0 not null,
  unique_beers  int default 0 not null,
  unique_breweries int default 0 not null,
  level         int default 1 not null,
  xp            int default 0 not null,
  is_public     boolean default true not null,
  created_at    timestamptz default now() not null
);

create index profiles_username_idx on public.profiles using gin (username gin_trgm_ops);

-- Trigger: auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- FRIENDSHIPS
-- ─────────────────────────────────────────────────────────────────────────────
create table public.friendships (
  id           uuid primary key default uuid_generate_v4(),
  requester_id uuid references public.profiles(id) on delete cascade not null,
  addressee_id uuid references public.profiles(id) on delete cascade not null,
  status       text check (status in ('pending', 'accepted', 'blocked')) not null default 'pending',
  created_at   timestamptz default now() not null,
  unique (requester_id, addressee_id)
);

create index friendships_requester_idx on public.friendships (requester_id);
create index friendships_addressee_idx on public.friendships (addressee_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- BREWERIES
-- ─────────────────────────────────────────────────────────────────────────────
create table public.breweries (
  id              uuid primary key default uuid_generate_v4(),
  external_id     text unique,
  name            text not null,
  brewery_type    text,
  street          text,
  city            text,
  state           text,
  postal_code     text,
  country         text,
  phone           text,
  website_url     text,
  latitude        numeric,
  longitude       numeric,
  description     text,
  cover_image_url text,
  verified        boolean default false not null,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz default now() not null
);

create index breweries_name_idx on public.breweries using gin (name gin_trgm_ops);
create index breweries_city_idx on public.breweries (city);
create index breweries_state_idx on public.breweries (state);
create index breweries_location_idx on public.breweries (latitude, longitude);

-- ─────────────────────────────────────────────────────────────────────────────
-- BEERS
-- ─────────────────────────────────────────────────────────────────────────────
create table public.beers (
  id              uuid primary key default uuid_generate_v4(),
  brewery_id      uuid references public.breweries(id) on delete cascade not null,
  name            text not null,
  style           text,
  abv             numeric,
  ibu             int,
  description     text,
  seasonal        boolean default false not null,
  is_active       boolean default true not null,
  cover_image_url text,
  avg_rating      numeric,
  total_ratings   int default 0 not null,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz default now() not null
);

create index beers_brewery_idx on public.beers (brewery_id);
create index beers_style_idx on public.beers (style);
create index beers_name_idx on public.beers using gin (name gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK-INS
-- ─────────────────────────────────────────────────────────────────────────────
create table public.checkins (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid references public.profiles(id) on delete cascade not null,
  brewery_id         uuid references public.breweries(id) on delete cascade not null,
  beer_id            uuid references public.beers(id) on delete cascade not null,
  rating             numeric check (rating >= 1 and rating <= 5),
  comment            text,
  flavor_tags        text[],
  serving_style      text check (serving_style in ('draft', 'bottle', 'can', 'cask')),
  photo_url          text,
  is_first_time      boolean default false not null,
  checked_in_with    uuid[],
  location_verified  boolean default false not null,
  share_to_feed      boolean default true not null,
  created_at         timestamptz default now() not null
);

create index checkins_user_idx on public.checkins (user_id);
create index checkins_brewery_idx on public.checkins (brewery_id);
create index checkins_beer_idx on public.checkins (beer_id);
create index checkins_created_idx on public.checkins (created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- ACHIEVEMENTS
-- ─────────────────────────────────────────────────────────────────────────────
create table public.achievements (
  id          uuid primary key default uuid_generate_v4(),
  key         text unique not null,
  name        text not null,
  description text not null,
  icon        text not null,
  xp_reward   int not null default 50,
  badge_color text not null,
  tier        text check (tier in ('bronze', 'silver', 'gold', 'platinum')) not null,
  category    text check (category in ('explorer', 'variety', 'quantity', 'social', 'time', 'quality')) not null
);

create table public.user_achievements (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references public.profiles(id) on delete cascade not null,
  achievement_id uuid references public.achievements(id) on delete cascade not null,
  earned_at      timestamptz default now() not null,
  checkin_id     uuid references public.checkins(id) on delete set null,
  unique (user_id, achievement_id)
);

create index user_achievements_user_idx on public.user_achievements (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- WISHLIST
-- ─────────────────────────────────────────────────────────────────────────────
create table public.wishlist (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  beer_id    uuid references public.beers(id) on delete cascade not null,
  note       text,
  created_at timestamptz default now() not null,
  unique (user_id, beer_id)
);

create index wishlist_user_idx on public.wishlist (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- BREWERY VISITS
-- ─────────────────────────────────────────────────────────────────────────────
create table public.brewery_visits (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references public.profiles(id) on delete cascade not null,
  brewery_id        uuid references public.breweries(id) on delete cascade not null,
  total_visits      int default 1 not null,
  unique_beers_tried int default 1 not null,
  first_visit_at    timestamptz default now() not null,
  last_visit_at     timestamptz default now() not null,
  unique (user_id, brewery_id)
);

create index brewery_visits_user_idx on public.brewery_visits (user_id);
create index brewery_visits_brewery_idx on public.brewery_visits (brewery_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────────────────────
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  type       text not null,
  title      text not null,
  body       text not null,
  data       jsonb,
  read       boolean default false not null,
  created_at timestamptz default now() not null
);

create index notifications_user_idx on public.notifications (user_id, read, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- REACTIONS
-- ─────────────────────────────────────────────────────────────────────────────
create table public.reactions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  checkin_id uuid references public.checkins(id) on delete cascade not null,
  type       text check (type in ('thumbs_up', 'flame', 'beer')) not null,
  created_at timestamptz default now() not null,
  unique (user_id, checkin_id, type)
);

create index reactions_checkin_idx on public.reactions (checkin_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.breweries enable row level security;
alter table public.beers enable row level security;
alter table public.checkins enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.wishlist enable row level security;
alter table public.brewery_visits enable row level security;
alter table public.notifications enable row level security;
alter table public.reactions enable row level security;

-- Profiles: public read, self write
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (is_public = true or auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Breweries: everyone can read, authenticated users can insert
create policy "Breweries are publicly readable" on public.breweries
  for select using (true);
create policy "Authenticated users can create breweries" on public.breweries
  for insert with check (auth.uid() is not null);
create policy "Creators can update their breweries" on public.breweries
  for update using (auth.uid() = created_by);

-- Beers: everyone can read, authenticated users can insert
create policy "Beers are publicly readable" on public.beers
  for select using (true);
create policy "Authenticated users can create beers" on public.beers
  for insert with check (auth.uid() is not null);

-- Check-ins: own + friends' check-ins (that are shared)
create policy "Users can read own checkins" on public.checkins
  for select using (auth.uid() = user_id or share_to_feed = true);
create policy "Users can create own checkins" on public.checkins
  for insert with check (auth.uid() = user_id);
create policy "Users can update own checkins" on public.checkins
  for update using (auth.uid() = user_id);
create policy "Users can delete own checkins" on public.checkins
  for delete using (auth.uid() = user_id);

-- Achievements: everyone can read definitions
create policy "Achievements are publicly readable" on public.achievements
  for select using (true);

-- User achievements: own + public
create policy "Users can read own achievements" on public.user_achievements
  for select using (auth.uid() = user_id);
create policy "Service role can insert achievements" on public.user_achievements
  for insert with check (auth.uid() = user_id);

-- Wishlist: private
create policy "Users can manage own wishlist" on public.wishlist
  for all using (auth.uid() = user_id);

-- Brewery visits: own + public stats
create policy "Brewery visits are publicly readable" on public.brewery_visits
  for select using (true);
create policy "Users can manage own visits" on public.brewery_visits
  for all using (auth.uid() = user_id);

-- Notifications: private
create policy "Users can read own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Reactions: public read, own write
create policy "Reactions are publicly readable" on public.reactions
  for select using (true);
create policy "Users can manage own reactions" on public.reactions
  for all using (auth.uid() = user_id);

-- Friendships
create policy "Users can read own friendships" on public.friendships
  for select using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "Users can create friendship requests" on public.friendships
  for insert with check (auth.uid() = requester_id);
create policy "Users can update their friendships" on public.friendships
  for update using (auth.uid() = addressee_id or auth.uid() = requester_id);
create policy "Users can delete their friendships" on public.friendships
  for delete using (auth.uid() = requester_id or auth.uid() = addressee_id);
