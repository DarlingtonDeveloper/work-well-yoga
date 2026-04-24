import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, phone, bio, notify_booking_confirm, notify_event_reminder, notify_newsletter, notify_marketing")
    .eq("id", user.id)
    .single();

  const { data: subscriptions } = await supabase
    .from("mailing_list_members")
    .select("id, list_id, subscribed, mailing_lists(id, name, description)")
    .eq("user_id", user.id);

  return NextResponse.json({
    profile: profile || {},
    subscriptions: subscriptions || [],
  });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  if (body.action === "update-profile") {
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: body.display_name ?? null,
        phone: body.phone ?? null,
        bio: body.bio ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "update-notifications") {
    const { error } = await supabase
      .from("profiles")
      .update({
        notify_booking_confirm: body.notify_booking_confirm,
        notify_event_reminder: body.notify_event_reminder,
        notify_newsletter: body.notify_newsletter,
        notify_marketing: body.notify_marketing,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "toggle-subscription") {
    const { error } = await supabase
      .from("mailing_list_members")
      .update({ subscribed: body.subscribed })
      .eq("id", body.member_id)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
