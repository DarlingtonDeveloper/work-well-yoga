import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();

  const { data: purchases, error } = await sb
    .from("purchases")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with user info
  const { data: usersData } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const usersMap = new Map(
    (usersData?.users || []).map((u) => [u.id, u])
  );

  const enriched = (purchases || []).map((p) => {
    const user = usersMap.get(p.user_id);
    return {
      ...p,
      user_email: user?.email || null,
      user_name: user?.user_metadata?.display_name || user?.user_metadata?.full_name || null,
    };
  });

  return NextResponse.json(enriched);
}
