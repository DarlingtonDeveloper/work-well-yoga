import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();

  const { data: entries, error } = await sb
    .from("waitlist")
    .select("*, events(id, title, start_at, capacity)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with user info
  const { data: usersData } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const usersMap = new Map(
    (usersData?.users || []).map((u) => [u.id, u])
  );

  const enriched = (entries || []).map((e) => {
    const user = usersMap.get(e.user_id);
    return {
      ...e,
      user_email: user?.email || null,
      user_name: user?.user_metadata?.display_name || user?.user_metadata?.full_name || null,
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();
  const { waitlist_id } = await request.json();

  // Get waitlist entry
  const { data: entry, error: fetchError } = await sb
    .from("waitlist")
    .select("*, events(capacity)")
    .eq("id", waitlist_id)
    .single();

  if (fetchError || !entry) {
    return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 });
  }

  // Check capacity before promoting
  if (entry.events?.capacity) {
    const { count } = await sb
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("event_id", entry.event_id)
      .eq("status", "confirmed");

    if ((count || 0) >= entry.events.capacity) {
      return NextResponse.json({ error: "Event is at full capacity" }, { status: 400 });
    }
  }

  // Create booking
  const { error: bookingError } = await sb
    .from("bookings")
    .insert({
      user_id: entry.user_id,
      event_id: entry.event_id,
      status: "confirmed",
    });

  if (bookingError) {
    return NextResponse.json({ error: bookingError.message }, { status: 500 });
  }

  // Remove from waitlist
  const { error: deleteError } = await sb
    .from("waitlist")
    .delete()
    .eq("id", waitlist_id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Re-order remaining positions
  const { data: remaining } = await sb
    .from("waitlist")
    .select("id")
    .eq("event_id", entry.event_id)
    .order("position", { ascending: true });

  if (remaining && remaining.length > 0) {
    await Promise.all(
      remaining.map((r, i) =>
        sb.from("waitlist").update({ position: i + 1 }).eq("id", r.id)
      )
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();
  const { id } = await request.json();

  // Get entry before deleting (for re-ordering)
  const { data: entry } = await sb
    .from("waitlist")
    .select("event_id")
    .eq("id", id)
    .single();

  const { error } = await sb.from("waitlist").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Re-order remaining positions
  if (entry) {
    const { data: remaining } = await sb
      .from("waitlist")
      .select("id")
      .eq("event_id", entry.event_id)
      .order("position", { ascending: true });

    if (remaining && remaining.length > 0) {
      await Promise.all(
        remaining.map((r, i) =>
          sb.from("waitlist").update({ position: i + 1 }).eq("id", r.id)
        )
      );
    }
  }

  return NextResponse.json({ ok: true });
}
