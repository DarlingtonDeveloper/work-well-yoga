import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

// GET — full conversation thread
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const sb = getAdminSupabase();

  const { data: conversation, error: convoErr } = await sb
    .from("conversations")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (convoErr || !conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data: messages, error: msgErr } = await sb
    .from("messages")
    .select("*")
    .eq("conversation_id", Number(id))
    .order("created_at", { ascending: true });

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  // Mark all user messages as read
  await sb
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", Number(id))
    .eq("sender_type", "user")
    .is("read_at", null);

  // Update conversation status if it was 'open'
  if (conversation.status === "open") {
    await sb.from("conversations").update({ status: "read" }).eq("id", Number(id));
  }

  return NextResponse.json({ conversation, messages });
}
