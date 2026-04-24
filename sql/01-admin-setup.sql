-- ==========================================================
-- Work Well Yoga — Admin Setup
-- Run this in Supabase SQL Editor (all at once)
-- ==========================================================

-- 1. Profiles table
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 2. Auto-create profile on signup
-- ---------------------------------------------------------
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

-- 3. Products table
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  kind TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'Work Well Yoga',
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

CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  USING (active = TRUE);

-- 4. Purchases table
-- ---------------------------------------------------------
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

CREATE POLICY "Users can read own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Grants
-- ---------------------------------------------------------
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
