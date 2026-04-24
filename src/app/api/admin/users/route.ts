import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();

  // Get all users from auth
  const { data: usersData } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const users = usersData?.users || [];

  // Get all purchases for enrichment
  const { data: purchases } = await sb
    .from("purchases")
    .select("user_id, amount, status");

  // Get admin flags from profiles
  const { data: profiles } = await sb
    .from("profiles")
    .select("id, is_admin, display_name");

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, p])
  );

  const purchasesByUser: Record<string, { count: number; total: number }> = {};
  (purchases || []).forEach((p) => {
    if (p.status === "completed") {
      if (!purchasesByUser[p.user_id]) {
        purchasesByUser[p.user_id] = { count: 0, total: 0 };
      }
      purchasesByUser[p.user_id].count++;
      purchasesByUser[p.user_id].total += p.amount || 0;
    }
  });

  const enriched = users.map((u) => {
    const profile = profileMap.get(u.id);
    const stats = purchasesByUser[u.id] || { count: 0, total: 0 };
    return {
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      display_name: profile?.display_name || u.user_metadata?.display_name || u.user_metadata?.full_name || null,
      is_admin: profile?.is_admin || false,
      purchase_count: stats.count,
      purchase_total: stats.total,
    };
  });

  return NextResponse.json(enriched);
}
