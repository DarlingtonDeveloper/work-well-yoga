-- ============================================================
-- Work Well Yoga — Courses: modules, lessons, resources & progress
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Course modules (grouped lessons within a course/product)
create table if not exists course_modules (
  id          bigint generated always as identity primary key,
  product_id  bigint not null references products(id) on delete cascade,
  title       text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- 2. Course lessons (individual content pages)
create table if not exists course_lessons (
  id               bigint generated always as identity primary key,
  module_id        bigint not null references course_modules(id) on delete cascade,
  title            text not null,
  slug             text not null,
  content_html     text not null default '',
  video_url        text,
  duration_minutes int,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  unique(module_id, slug)
);

-- 3. Course resources (downloadable files per lesson)
create table if not exists course_resources (
  id          bigint generated always as identity primary key,
  lesson_id   bigint not null references course_lessons(id) on delete cascade,
  name        text not null,
  url         text not null,
  file_type   text not null default 'pdf',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- 4. Course progress (per-user lesson completion)
create table if not exists course_progress (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_id    bigint not null references course_lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_course_modules_product on course_modules(product_id);
create index if not exists idx_course_lessons_module on course_lessons(module_id);
create index if not exists idx_course_resources_lesson on course_resources(lesson_id);
create index if not exists idx_course_progress_user on course_progress(user_id);
create index if not exists idx_course_progress_lesson on course_progress(lesson_id);

-- ============================================================
-- RLS
-- ============================================================
alter table course_modules enable row level security;
alter table course_lessons enable row level security;
alter table course_resources enable row level security;
alter table course_progress enable row level security;

-- Modules & lessons: anyone can read (needed for course pages)
create policy "Anyone can read course modules"
  on course_modules for select using (true);

create policy "Anyone can read course lessons"
  on course_lessons for select using (true);

create policy "Anyone can read course resources"
  on course_resources for select using (true);

-- Progress: users can read and insert/update their own
create policy "Users can read own progress"
  on course_progress for select using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on course_progress for insert with check (auth.uid() = user_id);

create policy "Users can delete own progress"
  on course_progress for delete using (auth.uid() = user_id);

-- ============================================================
-- Grants
-- ============================================================
grant select on course_modules to anon, authenticated;
grant select on course_lessons to anon, authenticated;
grant select on course_resources to anon, authenticated;
grant select, insert, delete on course_progress to authenticated;
