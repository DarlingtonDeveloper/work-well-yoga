import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();

  // Fetch all purchases
  const { data: purchases } = await sb
    .from("purchases")
    .select("*")
    .order("created_at", { ascending: false });

  const allPurchases = purchases || [];

  // Date helpers
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  // Revenue calculations
  const completed = allPurchases.filter((p) => p.status === "completed");

  const revenueToday = completed
    .filter((p) => p.created_at?.startsWith(todayStr))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const revenueWeek = completed
    .filter((p) => new Date(p.created_at) >= weekAgo)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const revenueMonth = completed
    .filter((p) => new Date(p.created_at) >= monthAgo)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const revenueAllTime = completed.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Orders count
  const ordersToday = completed.filter((p) => p.created_at?.startsWith(todayStr)).length;
  const ordersWeek = completed.filter((p) => new Date(p.created_at) >= weekAgo).length;
  const ordersMonth = completed.filter((p) => new Date(p.created_at) >= monthAgo).length;
  const ordersAllTime = completed.length;

  // Revenue by category
  const revenueByCategory: Record<string, number> = {};
  completed.forEach((p) => {
    const cat = p.category || "other";
    revenueByCategory[cat] = (revenueByCategory[cat] || 0) + (p.amount || 0);
  });

  // Total users
  const { data: usersData } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const totalUsers = usersData?.users?.length || 0;

  // Recent orders (last 15)
  const recentOrders = allPurchases.slice(0, 15);

  return NextResponse.json({
    revenue: {
      today: revenueToday,
      week: revenueWeek,
      month: revenueMonth,
      allTime: revenueAllTime,
    },
    orders: {
      today: ordersToday,
      week: ordersWeek,
      month: ordersMonth,
      allTime: ordersAllTime,
    },
    revenueByCategory,
    totalUsers,
    recentOrders,
  });
}
