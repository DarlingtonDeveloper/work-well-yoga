-- =============================================
-- Booking Modes: recurring / dated / request
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
