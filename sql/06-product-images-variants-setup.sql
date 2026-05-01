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
