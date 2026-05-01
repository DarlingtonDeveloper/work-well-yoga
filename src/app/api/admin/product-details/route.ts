import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

export async function GET(request: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id");
  if (!productId)
    return NextResponse.json({ error: "Missing product_id" }, { status: 400 });

  const sb = getAdminSupabase();
  const pid = parseInt(productId);

  const [{ data: images }, { data: variants }] = await Promise.all([
    sb
      .from("product_images")
      .select("*")
      .eq("product_id", pid)
      .order("sort_order"),
    sb
      .from("product_variants")
      .select("*")
      .eq("product_id", pid)
      .order("sort_order"),
  ]);

  return NextResponse.json({ images: images || [], variants: variants || [] });
}

export async function POST(request: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const sb = getAdminSupabase();

  if (body.type === "image") {
    const { count } = await sb
      .from("product_images")
      .select("*", { count: "exact", head: true })
      .eq("product_id", body.product_id);

    const { data, error } = await sb
      .from("product_images")
      .insert({
        product_id: body.product_id,
        image_url: body.image_url,
        sort_order: (count || 0),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  }

  if (body.type === "variant") {
    const { count } = await sb
      .from("product_variants")
      .select("*", { count: "exact", head: true })
      .eq("product_id", body.product_id);

    const { data, error } = await sb
      .from("product_variants")
      .insert({
        product_id: body.product_id,
        name: body.name,
        swatch: body.swatch || null,
        image_url: body.image_url || null,
        sort_order: (count || 0),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const sb = getAdminSupabase();

  if (body.type === "variant" && body.id) {
    const updates: Record<string, unknown> = {};
    if ("name" in body) updates.name = body.name;
    if ("swatch" in body) updates.swatch = body.swatch;
    if ("image_url" in body) updates.image_url = body.image_url;
    if ("sort_order" in body) updates.sort_order = body.sort_order;

    const { data, error } = await sb
      .from("product_variants")
      .update(updates)
      .eq("id", body.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const sb = getAdminSupabase();

  const table = body.type === "image" ? "product_images" : body.type === "variant" ? "product_variants" : null;
  if (!table || !body.id)
    return NextResponse.json({ error: "Invalid type or missing id" }, { status: 400 });

  const { error } = await sb.from(table).delete().eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
