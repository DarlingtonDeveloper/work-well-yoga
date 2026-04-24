import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id");
  const enrolled = searchParams.get("enrolled");

  const supabase = await createClient();

  if (enrolled === "true") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { data: purchases } = await supabase
      .from("purchases")
      .select("product_id, product_name, created_at")
      .eq("user_id", user.id)
      .eq("category", "course")
      .eq("status", "completed");

    if (!purchases || purchases.length === 0) return NextResponse.json([]);

    const courseIds = purchases.map((p) => p.product_id);

    const { data: modules } = await supabase
      .from("course_modules")
      .select("id, product_id, course_lessons(id)")
      .in("product_id", courseIds)
      .order("sort_order");

    const { data: progress } = await supabase
      .from("course_progress")
      .select("lesson_id")
      .eq("user_id", user.id);

    const progressSet = new Set((progress || []).map((p) => p.lesson_id));

    const courses = purchases.map((purchase) => {
      const courseMods = (modules || []).filter((m) => m.product_id === purchase.product_id);
      const totalLessons = courseMods.reduce(
        (sum, m) => sum + ((m.course_lessons as { id: number }[])?.length || 0),
        0
      );
      const completedLessons = courseMods.reduce(
        (sum, m) =>
          sum +
          ((m.course_lessons as { id: number }[])?.filter((l) => progressSet.has(l.id)).length || 0),
        0
      );

      return {
        product_id: purchase.product_id,
        product_name: purchase.product_name,
        enrolled_at: purchase.created_at,
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
      };
    });

    return NextResponse.json(courses);
  }

  if (productId) {
    const { data: modules, error } = await supabase
      .from("course_modules")
      .select("id, title, sort_order, course_lessons(id, title, slug, video_url, duration_minutes, sort_order, course_resources(id, name, url, file_type, sort_order))")
      .eq("product_id", parseInt(productId))
      .order("sort_order")
      .order("sort_order", { referencedTable: "course_lessons" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: { user } } = await supabase.auth.getUser();
    let owned = false;
    let progressIds: number[] = [];

    if (user) {
      const { data: purchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", parseInt(productId))
        .eq("category", "course")
        .eq("status", "completed")
        .limit(1)
        .maybeSingle();

      owned = !!purchase;

      if (owned) {
        const { data: progress } = await supabase
          .from("course_progress")
          .select("lesson_id")
          .eq("user_id", user.id);
        progressIds = (progress || []).map((p) => p.lesson_id);
      }
    }

    return NextResponse.json({ modules: modules || [], owned, progressIds });
  }

  return NextResponse.json({ error: "Missing product_id or enrolled param" }, { status: 400 });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { lesson_id, completed } = body;

  if (completed) {
    const { error } = await supabase
      .from("course_progress")
      .upsert({ user_id: user.id, lesson_id }, { onConflict: "user_id,lesson_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from("course_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lesson_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
