import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/admin";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rl = rateLimit(`notify:${user.id}`, 10, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { product_id } = await request.json();
  if (!product_id) {
    return NextResponse.json({ error: "product_id required" }, { status: 400 });
  }

  const sb = getAdminSupabase();

  // Get product
  const { data: product } = await sb
    .from("products")
    .select("id, name, brand, preorder_list_id")
    .eq("id", product_id)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const userEmail = user.email || "";

  // Add to mailing list if configured
  if (product.preorder_list_id) {
    await sb
      .from("mailing_list_members")
      .upsert(
        { list_id: product.preorder_list_id, user_id: user.id, email: userEmail, name: userName },
        { onConflict: "list_id,user_id" }
      );
  }

  // Create conversation thread
  const { data: convo } = await sb.from("conversations").insert({
    subject: `Notify me — ${product.name}`,
    category: "notify",
    status: "open",
    user_id: user.id,
    user_name: userName,
    user_email: userEmail,
    product_id: product.id,
  }).select("id").single();

  if (convo) {
    await sb.from("messages").insert({
      conversation_id: convo.id,
      sender_type: "system",
      body: `${userName} wants to be notified when dates are available for ${product.name}.`,
      metadata: { product_id: product.id, product_name: product.name },
    });
  }

  return NextResponse.json({ ok: true });
}
