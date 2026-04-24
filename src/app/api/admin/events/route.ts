import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();

  const { data: events, error } = await sb
    .from("events")
    .select("*, products(id, name, brand)")
    .order("start_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with booking and waitlist counts
  const enriched = await Promise.all(
    (events || []).map(async (ev) => {
      const { count: bookingCount } = await sb
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("event_id", ev.id)
        .eq("status", "confirmed");

      const { count: waitlistCount } = await sb
        .from("waitlist")
        .select("*", { count: "exact", head: true })
        .eq("event_id", ev.id);

      return {
        ...ev,
        booking_count: bookingCount || 0,
        waitlist_count: waitlistCount || 0,
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
    .from("events")
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
  const { id, ...updates } = body;

  const { data, error } = await sb
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();
  const { id } = await request.json();

  const { error } = await sb.from("events").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
