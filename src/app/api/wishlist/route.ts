import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", user.id);

  return NextResponse.json((data || []).map((w) => w.product_id));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { product_id } = await request.json();
  if (!product_id) return NextResponse.json({ error: "Missing product_id" }, { status: 400 });

  // Toggle: if exists remove, otherwise add
  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", product_id)
    .single();

  if (existing) {
    await supabase.from("wishlists").delete().eq("id", existing.id);
    return NextResponse.json({ wishlisted: false });
  }

  await supabase.from("wishlists").insert({ user_id: user.id, product_id });
  return NextResponse.json({ wishlisted: true });
}
