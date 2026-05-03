-- =============================================================
-- Nine2Rise — Complete Database Setup (idempotent mega query)
-- Safe to run even if any/all parts have already been applied.
-- Run this once in the Supabase SQL Editor.
-- =============================================================

-- =============================================================
-- 01: Profiles & Products & Purchases (core tables)
-- =============================================================

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  kind TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'Nine2Rise',
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  meta TEXT,
  blurb TEXT,
  swatch TEXT,
  badge TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active products" ON products;
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  USING (active = TRUE);

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  category TEXT,
  amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'gbp',
  stripe_session_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own purchases" ON purchases;
CREATE POLICY "Users can read own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Grants (01)
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

GRANT SELECT ON products TO anon;
GRANT SELECT ON products TO authenticated;
GRANT ALL ON products TO service_role;
GRANT USAGE, SELECT ON SEQUENCE products_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE products_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE products_id_seq TO service_role;

GRANT SELECT ON purchases TO authenticated;
GRANT ALL ON purchases TO service_role;
GRANT USAGE, SELECT ON SEQUENCE purchases_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE purchases_id_seq TO service_role;


-- =============================================================
-- 02: Account / Profile extensions
-- =============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_booking_confirm BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_event_reminder BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_newsletter BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_marketing BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- =============================================================
-- 03: Events, Bookings, Waitlist, Mailing & Email
-- =============================================================

-- Events
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  location TEXT,
  capacity INTEGER NOT NULL DEFAULT 20,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read open events" ON events;
CREATE POLICY "Anyone can read open events"
  ON events FOR SELECT
  USING (status != 'cancelled');

GRANT SELECT ON events TO anon;
GRANT SELECT ON events TO authenticated;
GRANT ALL ON events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE events_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE events_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE events_id_seq TO service_role;

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  purchase_id INTEGER REFERENCES purchases(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'no-show')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ
);

-- Note: the original UNIQUE(user_id, event_id) is replaced with a partial
-- index in section 09 below (event_id becomes nullable).

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
CREATE POLICY "Users can read own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON bookings TO authenticated;
GRANT ALL ON bookings TO service_role;
GRANT USAGE, SELECT ON SEQUENCE bookings_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE bookings_id_seq TO service_role;

-- Waitlist
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own waitlist entries" ON waitlist;
CREATE POLICY "Users can read own waitlist entries"
  ON waitlist FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON waitlist TO authenticated;
GRANT ALL ON waitlist TO service_role;
GRANT USAGE, SELECT ON SEQUENCE waitlist_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE waitlist_id_seq TO service_role;

-- Mailing lists
CREATE TABLE IF NOT EXISTS mailing_lists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  auto_subscribe_on TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mailing_lists ENABLE ROW LEVEL SECURITY;

GRANT ALL ON mailing_lists TO service_role;
GRANT USAGE, SELECT ON SEQUENCE mailing_lists_id_seq TO service_role;

-- Mailing list members
CREATE TABLE IF NOT EXISTS mailing_list_members (
  id SERIAL PRIMARY KEY,
  list_id INTEGER NOT NULL REFERENCES mailing_lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  subscribed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, user_id)
);

ALTER TABLE mailing_list_members ENABLE ROW LEVEL SECURITY;

GRANT ALL ON mailing_list_members TO service_role;
GRANT USAGE, SELECT ON SEQUENCE mailing_list_members_id_seq TO service_role;

-- Mailing list member policies (from 02)
DROP POLICY IF EXISTS "Users can read own mailing list memberships" ON mailing_list_members;
CREATE POLICY "Users can read own mailing list memberships"
  ON mailing_list_members FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own mailing list memberships" ON mailing_list_members;
CREATE POLICY "Users can update own mailing list memberships"
  ON mailing_list_members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON mailing_list_members TO authenticated;
GRANT UPDATE ON mailing_list_members TO authenticated;
GRANT SELECT ON mailing_lists TO authenticated;

-- Email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES mailing_lists(id) ON DELETE SET NULL,
  event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  from_name TEXT DEFAULT 'Nine2Rise',
  from_email TEXT DEFAULT 'hello@nine2rise.com',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  recipient_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

GRANT ALL ON email_campaigns TO service_role;
GRANT USAGE, SELECT ON SEQUENCE email_campaigns_id_seq TO service_role;

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

GRANT ALL ON email_templates TO service_role;
GRANT USAGE, SELECT ON SEQUENCE email_templates_id_seq TO service_role;

-- Seed default mailing lists
INSERT INTO mailing_lists (name, description, auto_subscribe_on) VALUES
  ('Everyone', 'All registered users', 'signup'),
  ('Newsletter', 'Monthly newsletter subscribers', NULL),
  ('Workshop attendees', 'Anyone who has booked a workshop', 'workshop'),
  ('Intensive members', 'Anyone who has joined an intensive', 'intensive'),
  ('Retreat guests', 'Anyone who has booked a retreat', 'retreat')
ON CONFLICT DO NOTHING;

-- Seed default email templates
INSERT INTO email_templates (slug, name, subject, body) VALUES
  ('booking-confirmed', 'Booking Confirmed', 'Your booking is confirmed — {{event_title}}',
   '<h2>You''re in, {{name}}.</h2><p>Your spot for <strong>{{event_title}}</strong> is confirmed.</p><p><strong>When:</strong> {{event_date}}<br/><strong>Where:</strong> {{event_location}}</p><p>We''ll send a reminder closer to the date.</p><p>See you there,<br/>Nine2Rise</p>'),
  ('waitlist-joined', 'Waitlist Confirmation', 'You''re on the waitlist — {{event_title}}',
   '<h2>You''re on the list, {{name}}.</h2><p>You''re #{{position}} on the waitlist for <strong>{{event_title}}</strong>.</p><p>We''ll let you know the moment a spot opens up.</p><p>Nine2Rise</p>'),
  ('waitlist-promoted', 'A spot opened up!', 'A spot opened up — {{event_title}}',
   '<h2>Good news, {{name}}.</h2><p>A spot has opened up for <strong>{{event_title}}</strong> and it''s yours.</p><p><strong>When:</strong> {{event_date}}<br/><strong>Where:</strong> {{event_location}}</p><p>See you there,<br/>Nine2Rise</p>'),
  ('booking-cancelled', 'Booking Cancelled', 'Your booking has been cancelled — {{event_title}}',
   '<h2>Booking cancelled</h2><p>Hi {{name}}, your booking for <strong>{{event_title}}</strong> has been cancelled.</p><p>If you think this is a mistake, please reply to this email.</p><p>Nine2Rise</p>'),
  ('event-reminder', 'Event Reminder', 'Reminder: {{event_title}} is coming up',
   '<h2>See you soon, {{name}}.</h2><p><strong>{{event_title}}</strong> is happening tomorrow.</p><p><strong>When:</strong> {{event_date}}<br/><strong>Where:</strong> {{event_location}}</p><p>Nine2Rise</p>')
ON CONFLICT (slug) DO NOTHING;

-- Indexes (03)
CREATE INDEX IF NOT EXISTS idx_events_product ON events(product_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_event ON waitlist(event_id);
CREATE INDEX IF NOT EXISTS idx_mailing_list_members_list ON mailing_list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_mailing_list_members_user ON mailing_list_members(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_list ON email_campaigns(list_id);


-- =============================================================
-- 04: Courses — modules, lessons, resources & progress
-- =============================================================

CREATE TABLE IF NOT EXISTS course_modules (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_lessons (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  duration_minutes INT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(module_id, slug)
);

CREATE TABLE IF NOT EXISTS course_resources (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lesson_id BIGINT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_progress (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id BIGINT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_course_modules_product ON course_modules(product_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_lesson ON course_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_user ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_lesson ON course_progress(lesson_id);

ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read course modules" ON course_modules;
CREATE POLICY "Anyone can read course modules"
  ON course_modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read course lessons" ON course_lessons;
CREATE POLICY "Anyone can read course lessons"
  ON course_lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read course resources" ON course_resources;
CREATE POLICY "Anyone can read course resources"
  ON course_resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can read own progress" ON course_progress;
CREATE POLICY "Users can read own progress"
  ON course_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON course_progress;
CREATE POLICY "Users can insert own progress"
  ON course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own progress" ON course_progress;
CREATE POLICY "Users can delete own progress"
  ON course_progress FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT ON course_modules TO anon, authenticated;
GRANT SELECT ON course_lessons TO anon, authenticated;
GRANT SELECT ON course_resources TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON course_progress TO authenticated;


-- =============================================================
-- 05: Practice — sessions, streaks & favourites
-- =============================================================

CREATE TABLE IF NOT EXISTS practice_sessions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'meditation',
  duration_minutes INT NOT NULL DEFAULT 10,
  note TEXT,
  practiced_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS practice_favourites (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_date ON practice_sessions(user_id, practiced_at);
CREATE INDEX IF NOT EXISTS idx_practice_favourites_user ON practice_favourites(user_id);

ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_favourites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own sessions" ON practice_sessions;
CREATE POLICY "Users can read own sessions"
  ON practice_sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON practice_sessions;
CREATE POLICY "Users can insert own sessions"
  ON practice_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON practice_sessions;
CREATE POLICY "Users can update own sessions"
  ON practice_sessions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON practice_sessions;
CREATE POLICY "Users can delete own sessions"
  ON practice_sessions FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own favourites" ON practice_favourites;
CREATE POLICY "Users can read own favourites"
  ON practice_favourites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favourites" ON practice_favourites;
CREATE POLICY "Users can insert own favourites"
  ON practice_favourites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favourites" ON practice_favourites;
CREATE POLICY "Users can delete own favourites"
  ON practice_favourites FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON practice_sessions TO authenticated;
GRANT SELECT, INSERT, DELETE ON practice_favourites TO authenticated;


-- =============================================================
-- 06: Product Images & Variants
-- =============================================================

CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read product images" ON product_images;
CREATE POLICY "Anyone can read product images"
  ON product_images FOR SELECT USING (true);

GRANT SELECT ON product_images TO anon, authenticated;
GRANT ALL ON product_images TO service_role;

CREATE TABLE IF NOT EXISTS product_variants (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  swatch TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read product variants" ON product_variants;
CREATE POLICY "Anyone can read product variants"
  ON product_variants FOR SELECT USING (true);

GRANT SELECT ON product_variants TO anon, authenticated;
GRANT ALL ON product_variants TO service_role;

ALTER TABLE purchases ADD COLUMN IF NOT EXISTS variant_id BIGINT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS variant_name TEXT;


-- =============================================================
-- 07: Wishlists
-- =============================================================

CREATE TABLE IF NOT EXISTS wishlists (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own wishlist" ON wishlists;
CREATE POLICY "Users can read own wishlist"
  ON wishlists FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to own wishlist" ON wishlists;
CREATE POLICY "Users can add to own wishlist"
  ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove from own wishlist" ON wishlists;
CREATE POLICY "Users can remove from own wishlist"
  ON wishlists FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON wishlists TO authenticated;
GRANT ALL ON wishlists TO service_role;


-- =============================================================
-- 08: Coming Soon & Pre-order
-- =============================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS coming_soon BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_enabled BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_deposit TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_list_id INTEGER REFERENCES mailing_lists(id);

CREATE TABLE IF NOT EXISTS preorder_interest (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, user_id)
);

ALTER TABLE preorder_interest ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own interest" ON preorder_interest;
CREATE POLICY "Users can view own interest" ON preorder_interest FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own interest" ON preorder_interest;
CREATE POLICY "Users can insert own interest" ON preorder_interest FOR INSERT WITH CHECK (auth.uid() = user_id);


-- =============================================================
-- 09: Booking Modes & Blocked Dates
-- =============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS booking_mode TEXT CHECK (booking_mode IN ('recurring', 'dated', 'request')),
  ADD COLUMN IF NOT EXISTS recurrence_anchor DATE,
  ADD COLUMN IF NOT EXISTS recurrence_interval_months INTEGER DEFAULT 2;

ALTER TABLE bookings ALTER COLUMN event_id DROP NOT NULL;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id),
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('confirmed', 'cancelled', 'no-show', 'pending'));

DROP INDEX IF EXISTS idx_bookings_user_event;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_event_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_user_event
  ON bookings(user_id, event_id) WHERE event_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS blocked_dates (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);

ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS blocked_dates_select ON blocked_dates;
CREATE POLICY blocked_dates_select ON blocked_dates
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS blocked_dates_admin ON blocked_dates;
CREATE POLICY blocked_dates_admin ON blocked_dates
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- =============================================================
-- 10: Threaded Messaging System
-- =============================================================

CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'read', 'replied', 'archived', 'closed')),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  product_id INTEGER REFERENCES products(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_category ON conversations(category);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin', 'system')),
  sender_id UUID,
  body TEXT NOT NULL,
  metadata JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversations_service ON conversations;
CREATE POLICY conversations_service ON conversations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS messages_service ON messages;
CREATE POLICY messages_service ON messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS conversations_user_select ON conversations;
CREATE POLICY conversations_user_select ON conversations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS conversations_user_insert ON conversations;
CREATE POLICY conversations_user_insert ON conversations
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS messages_user_select ON messages;
CREATE POLICY messages_user_select ON messages
  FOR SELECT TO authenticated
  USING (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS messages_user_insert ON messages;
CREATE POLICY messages_user_insert ON messages
  FOR INSERT TO authenticated
  WITH CHECK (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS conversations_anon_insert ON conversations;
CREATE POLICY conversations_anon_insert ON conversations
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS messages_anon_insert ON messages;
CREATE POLICY messages_anon_insert ON messages
  FOR INSERT TO anon WITH CHECK (true);

GRANT ALL ON conversations TO service_role;
GRANT ALL ON messages TO service_role;
GRANT SELECT, INSERT ON conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
GRANT INSERT ON conversations TO anon;
GRANT INSERT ON messages TO anon;
GRANT USAGE, SELECT ON SEQUENCE conversations_id_seq TO service_role, authenticated, anon;
GRANT USAGE, SELECT ON SEQUENCE messages_id_seq TO service_role, authenticated, anon;

CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_conversation_timestamp ON messages;
CREATE TRIGGER trg_update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();


-- =============================================================
-- 11: Set admin users
-- =============================================================

-- Ensure the is_admin column exists (safe if already present)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Flag admins
UPDATE profiles
SET is_admin = true
WHERE id IN (
  '42076b26-b8fc-4d83-b024-3d76a4748cb0',
  'fb1975d7-b60a-475c-a689-1e58a5b3406e'
);


-- =============================================================
-- 12: Seed sample products
-- =============================================================

-- Courses
INSERT INTO products (category, kind, brand, name, price, blurb, swatch, badge, sort_order, active) VALUES
  ('course', 'digital', 'Nine2Rise', 'Morning Flow Foundations',  '£49', 'A 4-week video course covering sun salutations, standing sequences, and breathwork — perfect for building a consistent home practice.',                    'linear-gradient(135deg,#f6d365,#fda085)', 'New',        1, true),
  ('course', 'digital', 'Nine2Rise', 'Breath & Balance Masterclass', '£29', 'Deep-dive into pranayama techniques and balancing poses. Three modules, lifetime access, downloadable guides.',                                        'linear-gradient(135deg,#a1c4fd,#c2e9fb)', NULL,         2, true)
ON CONFLICT DO NOTHING;

-- Workshops
INSERT INTO products (category, kind, brand, name, price, blurb, swatch, badge, sort_order, active) VALUES
  ('workshop', 'event', 'Nine2Rise', 'Yin & Restore Saturday',    '£25', 'A 2-hour slow-flow workshop blending yin holds with restorative props. Leave feeling completely unwound.',                                               'linear-gradient(135deg,#d4fc79,#96e6a1)', NULL,         3, true),
  ('workshop', 'event', 'Nine2Rise', 'Desk Worker Reset',         '£20', '90-minute workshop targeting hips, shoulders, and wrists — designed for anyone who sits at a desk all day.',                                                'linear-gradient(135deg,#fbc2eb,#a6c1ee)', NULL,         4, true)
ON CONFLICT DO NOTHING;

-- Intensives / Cohorts
INSERT INTO products (category, kind, brand, name, price, blurb, swatch, badge, sort_order, active) VALUES
  ('intensive', 'cohort', 'Nine2Rise', '8-Week Vinyasa Intensive', '£199', 'Twice-weekly live classes, video replays, weekly check-ins, and a private community. Transform your practice over eight weeks.',                        'linear-gradient(135deg,#667eea,#764ba2)', 'Popular',    5, true),
  ('intensive', 'cohort', 'Nine2Rise', 'Mindful Movement Cohort',  '£149', 'A 6-week small-group programme combining meditation, gentle yoga, and journaling. Limited to 12 participants per cohort.',                                'linear-gradient(135deg,#f093fb,#f5576c)', NULL,         6, true)
ON CONFLICT DO NOTHING;

-- Retreats
INSERT INTO products (category, kind, brand, name, price, blurb, swatch, badge, sort_order, active) VALUES
  ('retreat', 'event', 'Nine2Rise', 'Weekend Countryside Retreat', '£350', 'Two nights in the Cotswolds with daily yoga, breathwork sessions, nourishing meals, and guided nature walks.',                                           'linear-gradient(135deg,#43e97b,#38f9d7)', NULL,         7, true),
  ('retreat', 'event', 'Nine2Rise', 'Bali Immersion Retreat',      '£1,200', 'A week-long retreat in Ubud — twice-daily practice, sound healing, waterfall hikes, and traditional Balinese spa treatments. Flights not included.', 'linear-gradient(135deg,#fa709a,#fee140)', 'Limited',    8, true)
ON CONFLICT DO NOTHING;


-- =============================================================
-- Done!
-- =============================================================
