import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();

  const { data: lists, error } = await sb
    .from("mailing_lists")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with member counts
  const enriched = await Promise.all(
    (lists || []).map(async (list) => {
      const { count: totalMembers } = await sb
        .from("mailing_list_members")
        .select("*", { count: "exact", head: true })
        .eq("list_id", list.id);

      const { count: subscribedMembers } = await sb
        .from("mailing_list_members")
        .select("*", { count: "exact", head: true })
        .eq("list_id", list.id)
        .eq("subscribed", true);

      return {
        ...list,
        total_members: totalMembers || 0,
        subscribed_members: subscribedMembers || 0,
      };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();
  const body = await request.json();

  const { data, error } = await sb
    .from("mailing_lists")
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();
  const body = await request.json();
  const { action } = body;

  if (action === "update") {
    const { id, name, description } = body;
    const { data, error } = await sb
      .from("mailing_lists")
      .update({ name, description })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (action === "add-members") {
    const { list_id, user_ids } = body;

    // Get existing members to avoid duplicates
    const { data: existing } = await sb
      .from("mailing_list_members")
      .select("user_id")
      .eq("list_id", list_id);

    const existingIds = new Set((existing || []).map((e) => e.user_id));
    const newUserIds = (user_ids as string[]).filter((id) => !existingIds.has(id));

    if (newUserIds.length > 0) {
      const { error } = await sb.from("mailing_list_members").insert(
        newUserIds.map((uid) => ({
          list_id,
          user_id: uid,
          subscribed: true,
        }))
      );

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, added: newUserIds.length });
  }

  if (action === "remove-member") {
    const { member_id } = body;
    const { error } = await sb
      .from("mailing_list_members")
      .delete()
      .eq("id", member_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "toggle-subscribe") {
    const { member_id, subscribed } = body;
    const { error } = await sb
      .from("mailing_list_members")
      .update({ subscribed })
      .eq("id", member_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "add-event-attendees") {
    const { list_id, event_id } = body;

    // Get all confirmed bookings for the event
    const { data: bookings } = await sb
      .from("bookings")
      .select("user_id")
      .eq("event_id", event_id)
      .eq("status", "confirmed");

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ ok: true, added: 0 });
    }

    // Get existing members to avoid duplicates
    const { data: existing } = await sb
      .from("mailing_list_members")
      .select("user_id")
      .eq("list_id", list_id);

    const existingIds = new Set((existing || []).map((e) => e.user_id));
    const newUserIds = bookings
      .map((b) => b.user_id)
      .filter((uid) => !existingIds.has(uid));

    if (newUserIds.length > 0) {
      const { error } = await sb.from("mailing_list_members").insert(
        newUserIds.map((uid) => ({
          list_id,
          user_id: uid,
          subscribed: true,
        }))
      );

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, added: newUserIds.length });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();
  const { id } = await request.json();

  // Delete members first, then the list
  await sb.from("mailing_list_members").delete().eq("list_id", id);
  const { error } = await sb.from("mailing_lists").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
