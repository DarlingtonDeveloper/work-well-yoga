-- =============================================
-- Threaded Messaging System
-- conversations + messages tables
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
