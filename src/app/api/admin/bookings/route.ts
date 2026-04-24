import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();

  const { data: bookings, error } = await sb
    .from("bookings")
    .select("*, events(*, products(id, name))")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with user info
  const { data: usersData } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const usersMap = new Map(
    (usersData?.users || []).map((u) => [u.id, u])
  );

  const enriched = (bookings || []).map((b) => {
    const user = usersMap.get(b.user_id);
    return {
      ...b,
      user_email: user?.email || null,
      user_name: user?.user_metadata?.display_name || user?.user_metadata?.full_name || null,
    };
  });

  return NextResponse.json(enriched);
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();
  const body = await request.json();
  const { id, ...updates } = body;

  // If cancelling, set cancelled_at
  if (updates.status === "cancelled") {
    updates.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await sb
    .from("bookings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();
  const body = await request.json();

  // Check capacity
  const { data: event } = await sb
    .from("events")
    .select("capacity")
    .eq("id", body.event_id)
    .single();

  if (event?.capacity) {
    const { count } = await sb
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("event_id", body.event_id)
      .eq("status", "confirmed");

    if ((count || 0) >= event.capacity) {
      return NextResponse.json({ error: "Event is at full capacity" }, { status: 400 });
    }
  }

  const { data, error } = await sb
    .from("bookings")
    .insert({
      user_id: body.user_id,
      event_id: body.event_id,
      status: "confirmed",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
