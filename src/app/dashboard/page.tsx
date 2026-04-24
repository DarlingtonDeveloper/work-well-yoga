import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/Dashboard";

export interface Purchase {
  id: number;
  product_id: number;
  product_name: string;
  category: string;
  amount: number;
  currency: string;
  created_at: string;
}

export interface CourseEnrollment {
  product_id: number;
  product_name: string;
  total_lessons: number;
  completed_lessons: number;
}

export interface UserBooking {
  id: number;
  status: string;
  created_at: string;
  events: {
    id: number;
    title: string;
    start_at: string;
    end_at: string | null;
    location: string | null;
    status: string;
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: purchases } = await supabase
    .from("purchases")
    .select("id, product_id, product_name, category, amount, currency, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, status, created_at, events(id, title, start_at, end_at, location, status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Get course enrollments with progress
  const coursePurchases = (purchases || []).filter((p) => p.category === "course");
  let enrollments: CourseEnrollment[] = [];

  if (coursePurchases.length > 0) {
    const courseIds = coursePurchases.map((p) => p.product_id);

    const { data: modules } = await supabase
      .from("course_modules")
      .select("id, product_id, course_lessons(id)")
      .in("product_id", courseIds);

    const { data: progress } = await supabase
      .from("course_progress")
      .select("lesson_id")
      .eq("user_id", user.id);

    const progressSet = new Set((progress || []).map((p) => p.lesson_id));

    enrollments = coursePurchases.map((purchase) => {
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
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
      };
    });
  }

  return (
    <DashboardShell
      user={user}
      purchases={purchases || []}
      bookings={(bookings as unknown as UserBooking[]) || []}
      enrollments={enrollments}
      isAdmin={profile?.is_admin || false}
    />
  );
}
