import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

// GET — list all conversations with latest message preview + unread count
export async function GET(request: Request) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const url = new URL(request.url);
    const filter = url.searchParams.get("filter");

    const sb = getAdminSupabase();

    let query = sb
      .from("conversations")
      .select("*, messages(id, body, sender_type, read_at, created_at)")
      .order("updated_at", { ascending: false });

    if (filter === "unread") {
      query = query.in("status", ["open"]);
    } else if (filter === "contact") {
      query = query.like("category", "contact-%");
    } else if (filter && filter !== "all") {
      query = query.eq("category", filter);
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ conversations: [], totalUnread: 0 });

    const conversations = (data || []).map((c: Record<string, unknown>) => {
      const msgs = (c.messages as Array<{ id: number; body: string; sender_type: string; read_at: string | null; created_at: string }>) || [];
      const sorted = msgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const unread = msgs.filter(m => m.sender_type === "user" && !m.read_at).length;
      const latest = sorted[0] || null;
      const { messages: _, ...rest } = c as Record<string, unknown>;
      return { ...rest, latest_message: latest, unread_count: unread };
    });

    const totalUnread = conversations.reduce((sum: number, c: { unread_count: number }) => sum + c.unread_count, 0);

    return NextResponse.json({ conversations, totalUnread });
  } catch {
    return NextResponse.json({ conversations: [], totalUnread: 0 });
  }
}

// POST — admin sends a reply or creates a new conversation
export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { conversation_id, body, user_id, user_name, user_email, subject } = await request.json();
  const sb = getAdminSupabase();

  // New conversation from admin
  if (!conversation_id) {
    if (!user_id || !subject || !body) {
      return NextResponse.json({ error: "Missing user_id, subject, or body" }, { status: 400 });
    }

    const { data: convo, error: convoErr } = await sb
      .from("conversations")
      .insert({
        subject,
        category: "admin",
        status: "replied",
        user_id,
        user_name: user_name || "User",
        user_email: user_email || "",
      })
      .select("id")
      .single();

    if (convoErr) return NextResponse.json({ error: convoErr.message }, { status: 500 });

    const { error: msgErr } = await sb.from("messages").insert({
      conversation_id: convo.id,
      sender_type: "admin",
      sender_id: user.id,
      body,
    });

    if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });
    return NextResponse.json({ conversation_id: convo.id }, { status: 201 });
  }

  // Reply to existing conversation
  if (!body) return NextResponse.json({ error: "Missing body" }, { status: 400 });

  const { error: msgErr } = await sb.from("messages").insert({
    conversation_id,
    sender_type: "admin",
    sender_id: user.id,
    body,
  });

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  // Update conversation status to replied
  await sb.from("conversations").update({ status: "replied" }).eq("id", conversation_id);

  return NextResponse.json({ ok: true });
}

// PUT — update conversation status
export async function PUT(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { conversation_id, status } = await request.json();
  if (!conversation_id || !status) {
    return NextResponse.json({ error: "Missing conversation_id or status" }, { status: 400 });
  }

  const sb = getAdminSupabase();
  const { error } = await sb
    .from("conversations")
    .update({ status })
    .eq("id", conversation_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
