import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");

  if (view === "summary") {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekStr = weekAgo.toISOString().split("T")[0];

    const { data: weekSessions } = await supabase
      .from("practice_sessions")
      .select("id, practiced_at, duration_minutes")
      .eq("user_id", user.id)
      .gte("practiced_at", weekStr)
      .order("practiced_at", { ascending: false });

    const { data: allDates } = await supabase
      .from("practice_sessions")
      .select("practiced_at")
      .eq("user_id", user.id)
      .order("practiced_at", { ascending: false });

    const streak = calcStreak(allDates?.map((d) => d.practiced_at) || []);
    const sessionsThisWeek = weekSessions?.length || 0;
    const minutesThisWeek = weekSessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;

    return NextResponse.json({ streak, sessionsThisWeek, minutesThisWeek });
  }

  const { data: sessions } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("practiced_at", { ascending: false })
    .limit(100);

  const { data: allDates } = await supabase
    .from("practice_sessions")
    .select("practiced_at")
    .eq("user_id", user.id)
    .order("practiced_at", { ascending: false });

  const { data: favourites } = await supabase
    .from("practice_favourites")
    .select("id, product_id, products(id, name, brand, category)")
    .eq("user_id", user.id);

  const { count: totalSessions } = await supabase
    .from("practice_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: totalMinData } = await supabase
    .from("practice_sessions")
    .select("duration_minutes")
    .eq("user_id", user.id);

  const totalMinutes = totalMinData?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekStr = weekAgo.toISOString().split("T")[0];

  const { data: weekSessions } = await supabase
    .from("practice_sessions")
    .select("duration_minutes")
    .eq("user_id", user.id)
    .gte("practiced_at", weekStr);

  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

  const { data: monthSessions } = await supabase
    .from("practice_sessions")
    .select("duration_minutes")
    .eq("user_id", user.id)
    .gte("practiced_at", monthStr);

  const typeCounts: Record<string, number> = {};
  sessions?.forEach((s) => {
    typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
  });

  const dates = allDates?.map((d) => d.practiced_at) || [];
  const streak = calcStreak(dates);
  const longestStreak = calcLongestStreak(dates);

  return NextResponse.json({
    sessions: sessions || [],
    favourites: favourites || [],
    stats: {
      totalSessions: totalSessions || 0,
      totalMinutes,
      sessionsThisWeek: weekSessions?.length || 0,
      minutesThisWeek: weekSessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0,
      sessionsThisMonth: monthSessions?.length || 0,
      minutesThisMonth: monthSessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0,
      streak,
      longestStreak,
      typeCounts,
    },
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();

  if (body.action === "log") {
    const { error } = await supabase.from("practice_sessions").insert({
      user_id: user.id,
      type: body.type || "meditation",
      duration_minutes: body.duration_minutes || 10,
      note: body.note || null,
      practiced_at: body.practiced_at || new Date().toISOString().split("T")[0],
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "favourite") {
    const { data: existing } = await supabase
      .from("practice_favourites")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", body.product_id)
      .maybeSingle();

    if (existing) {
      await supabase.from("practice_favourites").delete().eq("id", existing.id);
    } else {
      await supabase.from("practice_favourites").insert({
        user_id: user.id,
        product_id: body.product_id,
      });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await request.json();
  const { error } = await supabase
    .from("practice_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = [...new Set(dates)].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  if (unique[0] !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (unique[0] !== yesterday.toISOString().split("T")[0]) return 0;
  }
  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function calcLongestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = [...new Set(dates)].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}
