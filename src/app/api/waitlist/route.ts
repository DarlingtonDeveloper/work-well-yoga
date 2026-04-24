import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { event_id } = await request.json();

  const sb = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if already on waitlist
  const { data: existing } = await sb
    .from("waitlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("event_id", event_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "You're already on the waitlist" }, { status: 400 });
  }

  // Check if already booked
  const { data: booked } = await sb
    .from("bookings")
    .select("id")
    .eq("user_id", user.id)
    .eq("event_id", event_id)
    .eq("status", "confirmed")
    .single();

  if (booked) {
    return NextResponse.json({ error: "You already have a booking for this event" }, { status: 400 });
  }

  // Get current max position
  const { data: maxEntry } = await sb
    .from("waitlist")
    .select("position")
    .eq("event_id", event_id)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const position = (maxEntry?.position || 0) + 1;

  const { error } = await sb
    .from("waitlist")
    .insert({
      user_id: user.id,
      event_id,
      position,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, position });
}
