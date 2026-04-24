import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseShell } from "@/components/Course";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) redirect("/dashboard");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .eq("category", "course")
    .eq("status", "completed")
    .limit(1)
    .maybeSingle();

  if (!purchase) redirect("/shop");

  const { data: product } = await supabase
    .from("products")
    .select("id, name, brand, blurb, meta")
    .eq("id", productId)
    .single();

  if (!product) redirect("/dashboard");

  const { data: modules } = await supabase
    .from("course_modules")
    .select("id, title, sort_order, course_lessons(id, title, slug, video_url, duration_minutes, sort_order, course_resources(id, name, url, file_type))")
    .eq("product_id", productId)
    .order("sort_order")
    .order("sort_order", { referencedTable: "course_lessons" });

  const { data: progress } = await supabase
    .from("course_progress")
    .select("lesson_id")
    .eq("user_id", user.id);

  return (
    <CourseShell
      product={product}
      modules={(modules || []) as never[]}
      progressIds={(progress || []).map((p) => p.lesson_id)}
    />
  );
}
