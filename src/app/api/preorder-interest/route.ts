import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { product_id } = await request.json();
  if (!product_id) {
    return NextResponse.json({ error: "product_id required" }, { status: 400 });
  }

  const sb = getAdminSupabase();

  // Get product to check it's coming_soon and get mailing list
  const { data: product } = await sb
    .from("products")
    .select("id, coming_soon, preorder_list_id")
    .eq("id", product_id)
    .single();

  if (!product?.coming_soon) {
    return NextResponse.json({ error: "Product is not coming soon" }, { status: 400 });
  }

  // Record interest
  await sb
    .from("preorder_interest")
    .upsert({ product_id, user_id: user.id }, { onConflict: "product_id,user_id" });

  // Auto-add to mailing list if configured
  if (product.preorder_list_id) {
    await sb
      .from("mailing_list_members")
      .upsert(
        {
          list_id: product.preorder_list_id,
          user_id: user.id,
          email: user.email || "",
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
        },
        { onConflict: "list_id,user_id" }
      );
  }

  return NextResponse.json({ ok: true });
}
