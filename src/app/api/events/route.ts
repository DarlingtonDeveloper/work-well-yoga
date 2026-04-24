import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: events, error } = await sb
    .from("events")
    .select("id, product_id, title, start_at, end_at, location, capacity, status")
    .neq("status", "cancelled")
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true });

  if (error) return NextResponse.json([]);

  const enriched = await Promise.all(
    (events || []).map(async (ev) => {
      const { count } = await sb
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
        booking_count: count || 0,
        waitlist_count: waitlistCount || 0,
      };
    })
  );

  return NextResponse.json(enriched);
}
