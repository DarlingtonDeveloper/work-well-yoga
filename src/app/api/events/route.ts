import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin";

function getNextCohortDates(anchor: string, intervalMonths: number, count: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  const anchorDate = new Date(anchor + "T00:00:00");
  let current = new Date(anchorDate);

  while (current <= now) {
    const next = new Date(current);
    next.setMonth(next.getMonth() + intervalMonths);
    current = next;
  }

  for (let i = 0; i < count; i++) {
    dates.push(current.toISOString().split("T")[0]);
    const next = new Date(current);
    next.setMonth(next.getMonth() + intervalMonths);
    current = next;
  }

  return dates;
}

export async function GET() {
  const sb = getAdminSupabase();

  // Fetch events, recurring products, and blocked dates in parallel
  const [eventsRes, recurringRes, blockedRes] = await Promise.all([
    sb
      .from("events")
      .select("id, product_id, title, start_at, end_at, location, capacity, status")
      .neq("status", "cancelled")
      .gte("start_at", new Date().toISOString())
      .order("start_at", { ascending: true }),
    sb
      .from("products")
      .select("id, name, brand, recurrence_anchor, recurrence_interval_months")
      .eq("booking_mode", "recurring")
      .eq("active", true)
      .not("recurrence_anchor", "is", null),
    sb
      .from("blocked_dates")
      .select("id, date, reason")
      .order("date", { ascending: true }),
  ]);

  const events = eventsRes.data || [];
  const recurringProducts = recurringRes.data || [];
  const blockedDates = blockedRes.data || [];

  // Enrich events with booking counts
  const enriched = await Promise.all(
    events.map(async (ev) => {
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

  // Compute recurring cohort dates
  const recurring: Record<number, string[]> = {};
  for (const p of recurringProducts) {
    if (p.recurrence_anchor) {
      recurring[p.id] = getNextCohortDates(
        p.recurrence_anchor,
        p.recurrence_interval_months || 2,
        3
      );
    }
  }

  return NextResponse.json({
    events: enriched,
    recurring,
    blocked_dates: blockedDates.map((d) => d.date),
  });
}
