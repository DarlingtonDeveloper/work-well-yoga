import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id");

  if (productId) {
    // Return modules + lessons for a specific course
    const { data: modules, error } = await sb
      .from("course_modules")
      .select("id, title, sort_order, course_lessons(id, title, slug, video_url, duration_minutes, sort_order, course_resources(id, name, url, file_type, sort_order))")
      .eq("product_id", parseInt(productId))
      .order("sort_order")
      .order("sort_order", { referencedTable: "course_lessons" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(modules || []);
  }

  // Return all course products with module/lesson counts
  const { data: products, error } = await sb
    .from("products")
    .select("*")
    .eq("category", "course")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enriched = await Promise.all(
    (products || []).map(async (p) => {
      const { data: modules } = await sb
        .from("course_modules")
        .select("id, course_lessons(id)")
        .eq("product_id", p.id);

      const moduleCount = modules?.length || 0;
      const lessonCount = (modules || []).reduce(
        (sum, m) => sum + ((m.course_lessons as { id: number }[])?.length || 0),
        0
      );

      return { ...p, module_count: moduleCount, lesson_count: lessonCount };
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
  const { type, ...payload } = body;

  if (type === "module") {
    const { data, error } = await sb
      .from("course_modules")
      .insert(payload)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (type === "lesson") {
    const { data, error } = await sb
      .from("course_lessons")
      .insert(payload)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (type === "resource") {
    const { data, error } = await sb
      .from("course_resources")
      .insert(payload)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();
  const body = await request.json();
  const { type, id, ...updates } = body;

  if (type === "module") {
    const { data, error } = await sb
      .from("course_modules")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (type === "lesson") {
    const { data, error } = await sb
      .from("course_lessons")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (type === "resource") {
    const { data, error } = await sb
      .from("course_resources")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();
  const body = await request.json();
  const { type, id } = body;

  if (type === "module") {
    const { error } = await sb.from("course_modules").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (type === "lesson") {
    const { error } = await sb.from("course_lessons").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (type === "resource") {
    const { error } = await sb.from("course_resources").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
