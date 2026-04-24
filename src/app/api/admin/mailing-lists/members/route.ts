import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getAdminSupabase();
  const { searchParams } = new URL(request.url);
  const listId = searchParams.get("list_id");

  if (!listId) {
    return NextResponse.json({ error: "Missing list_id" }, { status: 400 });
  }

  const { data: members, error } = await sb
    .from("mailing_list_members")
    .select("*")
    .eq("list_id", parseInt(listId))
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with user info
  const { data: usersData } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const usersMap = new Map(
    (usersData?.users || []).map((u) => [u.id, u])
  );

  const enriched = (members || []).map((m) => {
    const user = usersMap.get(m.user_id);
    return {
      ...m,
      user_email: user?.email || null,
      user_name: user?.user_metadata?.display_name || user?.user_metadata?.full_name || null,
    };
  });

  return NextResponse.json(enriched);
}
