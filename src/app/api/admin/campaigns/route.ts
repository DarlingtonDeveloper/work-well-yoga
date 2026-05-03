import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();

  const { data: campaigns, error } = await sb
    .from("email_campaigns")
    .select("*, mailing_lists(id, name), events(id, title)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(campaigns || []);
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();
  const body = await request.json();

  const { data, error } = await sb
    .from("email_campaigns")
    .insert({
      ...body,
      status: "draft",
    })
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
  const { id, action, ...updates } = body;

  if (action === "send") {
    // Mark campaign as sent
    // TODO: Implement actual email sending via Resend/SendGrid
    const { data: campaign } = await sb
      .from("email_campaigns")
      .select("list_id")
      .eq("id", id)
      .single();

    let recipientCount = 0;
    if (campaign?.list_id) {
      const { count } = await sb
        .from("mailing_list_members")
        .select("*", { count: "exact", head: true })
        .eq("list_id", campaign.list_id)
        .eq("subscribed", true);
      recipientCount = count || 0;
    }

    const { data, error } = await sb
      .from("email_campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        recipient_count: recipientCount,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await sb
    .from("email_campaigns")
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

  const { error } = await sb.from("email_campaigns").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
