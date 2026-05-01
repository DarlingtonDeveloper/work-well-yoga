import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/admin";
import { rateLimit } from "@/lib/rate-limit";

// GET — user's own conversations with latest message + unread count
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const sb = getAdminSupabase();

  const { data, error } = await sb
    .from("conversations")
    .select("*, messages(id, body, sender_type, read_at, created_at, metadata)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ conversations: [], totalUnread: 0 });

  const conversations = (data || []).map((c: Record<string, unknown>) => {
    const msgs = (c.messages as Array<{ id: number; body: string; sender_type: string; read_at: string | null; created_at: string }>) || [];
    const sorted = msgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const unread = msgs.filter(m => m.sender_type !== "user" && !m.read_at).length;
    const latest = sorted[0] || null;
    const { messages: _, ...rest } = c as Record<string, unknown>;
    return { ...rest, latest_message: latest, unread_count: unread, messages: sorted };
  });

  const totalUnread = conversations.reduce((sum: number, c: { unread_count: number }) => sum + c.unread_count, 0);

  return NextResponse.json({ conversations, totalUnread });
}

// POST — user replies to a conversation
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const rl = rateLimit(`msg:${user.id}`, 20, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many messages. Please wait a few minutes." }, { status: 429 });
  }

  const { conversation_id, body } = await request.json();
  if (!conversation_id || !body) {
    return NextResponse.json({ error: "Missing conversation_id or body" }, { status: 400 });
  }

  const sb = getAdminSupabase();

  // Verify user owns this conversation
  const { data: convo } = await sb
    .from("conversations")
    .select("id, user_id")
    .eq("id", conversation_id)
    .single();

  if (!convo || convo.user_id !== user.id) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { error: msgErr } = await sb.from("messages").insert({
    conversation_id,
    sender_type: "user",
    sender_id: user.id,
    body,
  });

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  // Set conversation back to open so admin sees it
  await sb.from("conversations").update({ status: "open" }).eq("id", conversation_id);

  return NextResponse.json({ ok: true });
}

// PUT — mark messages as read
export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { conversation_id } = await request.json();
  if (!conversation_id) {
    return NextResponse.json({ error: "Missing conversation_id" }, { status: 400 });
  }

  const sb = getAdminSupabase();

  // Verify user owns this conversation
  const { data: convo } = await sb
    .from("conversations")
    .select("id, user_id")
    .eq("id", conversation_id)
    .single();

  if (!convo || convo.user_id !== user.id) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  // Mark non-user messages as read
  await sb
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversation_id)
    .neq("sender_type", "user")
    .is("read_at", null);

  return NextResponse.json({ ok: true });
}
