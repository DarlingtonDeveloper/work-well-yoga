-- ============================================================
-- Nine2Rise — Practice: session logging, streaks & favourites
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Practice sessions (user-logged practice entries)
create table if not exists practice_sessions (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  type            text not null default 'meditation',
  duration_minutes int not null default 10,
  note            text,
  practiced_at    date not null default current_date,
  created_at      timestamptz not null default now()
);

-- 2. Practice favourites (bookmarked products)
create table if not exists practice_favourites (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  bigint not null references products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(user_id, product_id)
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_practice_sessions_user on practice_sessions(user_id);
create index if not exists idx_practice_sessions_date on practice_sessions(user_id, practiced_at);
create index if not exists idx_practice_favourites_user on practice_favourites(user_id);

-- ============================================================
-- RLS
-- ============================================================
alter table practice_sessions enable row level security;
alter table practice_favourites enable row level security;

-- Sessions: users can CRUD their own
create policy "Users can read own sessions"
  on practice_sessions for select using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on practice_sessions for insert with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on practice_sessions for update using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on practice_sessions for delete using (auth.uid() = user_id);

-- Favourites: users can CRUD their own
create policy "Users can read own favourites"
  on practice_favourites for select using (auth.uid() = user_id);

create policy "Users can insert own favourites"
  on practice_favourites for insert with check (auth.uid() = user_id);

create policy "Users can delete own favourites"
  on practice_favourites for delete using (auth.uid() = user_id);

-- ============================================================
-- Grants
-- ============================================================
grant select, insert, update, delete on practice_sessions to authenticated;
grant select, insert, delete on practice_favourites to authenticated;
