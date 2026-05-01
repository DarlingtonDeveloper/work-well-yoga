import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getAdminSupabase();
  const { data, error } = await sb
    .from("products")
    .select("*, product_images(*), product_variants(*)")
    .order("sort_order", { ascending: true })
    .order("sort_order", { referencedTable: "product_images", ascending: true })
    .order("sort_order", { referencedTable: "product_variants", ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getAdminSupabase();
  const body = await request.json();

  const { data, error } = await sb
    .from("products")
    .insert({
      category: body.category,
      kind: body.kind,
      brand: body.brand || "Work Well Yoga",
      name: body.name,
      price: body.price,
      meta: body.meta || null,
      blurb: body.blurb || null,
      swatch: body.swatch || null,
      image_url: body.image_url || null,
      badge: body.badge || null,
      sort_order: body.sort_order || 0,
      active: body.active !== false,
      coming_soon: body.coming_soon || false,
      preorder_enabled: body.preorder_enabled || false,
      preorder_deposit: body.preorder_deposit || null,
      release_date: body.release_date || null,
      preorder_list_id: body.preorder_list_id ? Number(body.preorder_list_id) : null,
      booking_mode: body.booking_mode || null,
      recurrence_anchor: body.recurrence_anchor || null,
      recurrence_interval_months: body.recurrence_interval_months ? Number(body.recurrence_interval_months) : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getAdminSupabase();
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const fields = ["category", "kind", "brand", "name", "price", "meta", "blurb", "swatch", "image_url", "badge", "sort_order", "active", "coming_soon", "preorder_enabled", "preorder_deposit", "release_date", "preorder_list_id", "booking_mode", "recurrence_anchor", "recurrence_interval_months"];
  const nullableFields = new Set(["meta", "blurb", "swatch", "image_url", "badge", "preorder_deposit", "release_date", "preorder_list_id", "booking_mode", "recurrence_anchor", "recurrence_interval_months"]);
  for (const f of fields) {
    if (!(f in body)) continue;
    const val = body[f];
    updates[f] = nullableFields.has(f) && (val === "" || val === undefined || val === null || val === 0) ? null : val;
  }

  const { data, error } = await sb
    .from("products")
    .update(updates)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getAdminSupabase();
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await sb.from("products").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
