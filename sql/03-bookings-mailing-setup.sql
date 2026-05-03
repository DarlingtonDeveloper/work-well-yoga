-- ==========================================================
-- Nine2Rise — Bookings & Mailing Setup
-- Run this in Supabase SQL Editor (all at once)
-- ==========================================================

-- 1. Events table — scheduled instances of bookable products
-- ---------------------------------------------------------
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

CREATE POLICY "Anyone can read open events"
  ON events FOR SELECT
  USING (status != 'cancelled');

GRANT SELECT ON events TO anon;
GRANT SELECT ON events TO authenticated;
GRANT ALL ON events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE events_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE events_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE events_id_seq TO service_role;

-- 2. Bookings table — user reservations for events
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  purchase_id INTEGER REFERENCES purchases(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'no-show')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  UNIQUE(user_id, event_id)
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON bookings TO authenticated;
GRANT ALL ON bookings TO service_role;
GRANT USAGE, SELECT ON SEQUENCE bookings_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE bookings_id_seq TO service_role;

-- 3. Waitlist table — ordered queue per event
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own waitlist entries"
  ON waitlist FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON waitlist TO authenticated;
GRANT ALL ON waitlist TO service_role;
GRANT USAGE, SELECT ON SEQUENCE waitlist_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE waitlist_id_seq TO service_role;

-- 4. Mailing lists table
-- ---------------------------------------------------------
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

-- 5. Mailing list members
-- ---------------------------------------------------------
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

-- 6. Email campaigns
-- ---------------------------------------------------------
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

-- 7. Email templates (transactional)
-- ---------------------------------------------------------
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

-- 8. Seed default mailing lists
-- ---------------------------------------------------------
INSERT INTO mailing_lists (name, description, auto_subscribe_on) VALUES
  ('Everyone', 'All registered users', 'signup'),
  ('Newsletter', 'Monthly newsletter subscribers', NULL),
  ('Workshop attendees', 'Anyone who has booked a workshop', 'workshop'),
  ('Intensive members', 'Anyone who has joined an intensive', 'intensive'),
  ('Retreat guests', 'Anyone who has booked a retreat', 'retreat')
ON CONFLICT DO NOTHING;

-- 9. Seed default email templates
-- ---------------------------------------------------------
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

-- 10. Indexes for performance
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_events_product ON events(product_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_event ON waitlist(event_id);
CREATE INDEX IF NOT EXISTS idx_mailing_list_members_list ON mailing_list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_mailing_list_members_user ON mailing_list_members(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_list ON email_campaigns(list_id);
