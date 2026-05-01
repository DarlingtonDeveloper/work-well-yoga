import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sb = getAdminSupabase();
  const { data, error } = await sb
    .from("blocked_dates")
    .select("*")
    .order("date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { date, reason } = await request.json();
  if (!date) return NextResponse.json({ error: "Missing date" }, { status: 400 });

  const sb = getAdminSupabase();
  const { data, error } = await sb
    .from("blocked_dates")
    .insert({ date, reason: reason || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, date } = await request.json();
  const sb = getAdminSupabase();

  if (id) {
    const { error } = await sb.from("blocked_dates").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (date) {
    const { error } = await sb.from("blocked_dates").delete().eq("date", date);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ error: "Missing id or date" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
