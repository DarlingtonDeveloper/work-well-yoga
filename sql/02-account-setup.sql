-- ==========================================================
-- Nine2Rise — Account / Profile Setup
-- Run this in Supabase SQL Editor (all at once)
-- ==========================================================

-- 1. Extend profiles table with account fields
-- ---------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_booking_confirm BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_event_reminder BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_newsletter BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_marketing BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Allow users to update their own profile
-- ---------------------------------------------------------
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Allow users to read their own mailing list memberships
-- ---------------------------------------------------------
CREATE POLICY "Users can read own mailing list memberships"
  ON mailing_list_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own mailing list memberships"
  ON mailing_list_members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON mailing_list_members TO authenticated;
GRANT UPDATE ON mailing_list_members TO authenticated;
GRANT SELECT ON mailing_lists TO authenticated;
