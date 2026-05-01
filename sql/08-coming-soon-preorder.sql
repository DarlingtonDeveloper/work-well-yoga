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
