-- =============================================
-- Combined Migration: All new features
-- Run this once in the Supabase SQL Editor
-- =============================================

-- =============================================
-- 06: Product Images & Variants
-- =============================================

-- Product images (gallery for future product detail page)
CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read product images"
  ON product_images FOR SELECT USING (true);

GRANT SELECT ON product_images TO anon, authenticated;
GRANT ALL ON product_images TO service_role;

-- Product variants (e.g. colour options)
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

CREATE POLICY "Anyone can read product variants"
  ON product_variants FOR SELECT USING (true);

GRANT SELECT ON product_variants TO anon, authenticated;
GRANT ALL ON product_variants TO service_role;

-- Track variant on purchases
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS variant_id BIGINT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS variant_name TEXT;

-- =============================================
-- 07: Wishlists
-- =============================================

CREATE TABLE IF NOT EXISTS wishlists (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wishlist"
  ON wishlists FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist"
  ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist"
  ON wishlists FOR DELETE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON wishlists TO authenticated;
GRANT ALL ON wishlists TO service_role;

-- =============================================
-- 08: Coming Soon & Pre-order
-- =============================================

-- Add coming soon + pre-order fields to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS coming_soon BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_enabled BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_deposit TEXT;       -- e.g. "£10" (optional)
ALTER TABLE products ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_list_id INTEGER REFERENCES mailing_lists(id);

-- Pre-order interest tracking (no-deposit signups)
CREATE TABLE IF NOT EXISTS preorder_interest (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, user_id)
);
ALTER TABLE preorder_interest ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own interest" ON preorder_interest FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interest" ON preorder_interest FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 09: Booking Modes & Blocked Dates
-- =============================================

-- 1. Add booking mode columns to products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS booking_mode TEXT CHECK (booking_mode IN ('recurring', 'dated', 'request')),
  ADD COLUMN IF NOT EXISTS recurrence_anchor DATE,
  ADD COLUMN IF NOT EXISTS recurrence_interval_months INTEGER DEFAULT 2;

-- 2. Alter bookings: make event_id nullable, add product_id + requested_at, add 'pending' status
ALTER TABLE bookings ALTER COLUMN event_id DROP NOT NULL;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id),
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ;

-- Update status constraint to include 'pending'
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('confirmed', 'cancelled', 'no-show', 'pending'));

-- Replace unique constraint with partial index (event_id can now be null)
DROP INDEX IF EXISTS idx_bookings_user_event;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_event_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_user_event
  ON bookings(user_id, event_id) WHERE event_id IS NOT NULL;

-- 3. Create blocked_dates table
CREATE TABLE IF NOT EXISTS blocked_dates (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);

-- RLS for blocked_dates
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY blocked_dates_select ON blocked_dates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY blocked_dates_admin ON blocked_dates
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- 10: Threaded Messaging System
-- =============================================

-- 1. Conversations (threads)
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

-- 2. Messages (individual messages in a thread)
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

-- 3. RLS policies

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Service role: full access
CREATE POLICY conversations_service ON conversations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY messages_service ON messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users: read/insert own conversations
CREATE POLICY conversations_user_select ON conversations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY conversations_user_insert ON conversations
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Authenticated users: read messages in their conversations, insert replies
CREATE POLICY messages_user_select ON messages
  FOR SELECT TO authenticated
  USING (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));

CREATE POLICY messages_user_insert ON messages
  FOR INSERT TO authenticated
  WITH CHECK (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));

-- Anonymous: insert conversations + messages (contact form)
CREATE POLICY conversations_anon_insert ON conversations
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY messages_anon_insert ON messages
  FOR INSERT TO anon WITH CHECK (true);

-- 4. Table-level grants (required for roles to access tables at all)
GRANT ALL ON conversations TO service_role;
GRANT ALL ON messages TO service_role;
GRANT SELECT, INSERT ON conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
GRANT INSERT ON conversations TO anon;
GRANT INSERT ON messages TO anon;
GRANT USAGE, SELECT ON SEQUENCE conversations_id_seq TO service_role, authenticated, anon;
GRANT USAGE, SELECT ON SEQUENCE messages_id_seq TO service_role, authenticated, anon;

-- 5. Updated_at trigger
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
