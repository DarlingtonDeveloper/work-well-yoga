import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/admin";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const rl = rateLimit(`booking-req:${user.id}`, 10, 15 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { product_id, requested_at } = await request.json();

    if (!product_id || !requested_at) {
      return NextResponse.json({ error: "Missing product_id or requested_at" }, { status: 400 });
    }

    const sb = getAdminSupabase();

    // Validate product exists and has request booking mode
    const { data: product } = await sb
      .from("products")
      .select("id, booking_mode")
      .eq("id", product_id)
      .single();

    if (!product || product.booking_mode !== "request") {
      return NextResponse.json({ error: "Product not available for date requests" }, { status: 400 });
    }

    // Check date is not blocked
    const requestedDate = requested_at.split("T")[0];
    const { data: blocked } = await sb
      .from("blocked_dates")
      .select("id")
      .eq("date", requestedDate)
      .maybeSingle();

    if (blocked) {
      return NextResponse.json({ error: "This date is not available" }, { status: 400 });
    }

    // Check date is in the future
    if (new Date(requested_at) <= new Date()) {
      return NextResponse.json({ error: "Please choose a future date" }, { status: 400 });
    }

    // Get product name for the message
    const { data: prod } = await sb
      .from("products")
      .select("name")
      .eq("id", product_id)
      .single();

    const productName = prod?.name || "your session";
    const dt = new Date(requested_at);
    const dateStr = dt.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const timeStr = dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    // Create pending booking
    const { error } = await sb.from("bookings").insert({
      user_id: user.id,
      product_id,
      requested_at,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create conversation thread visible to both user and admin
    const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer";
    const userEmail = user.email || "";

    const { data: convo } = await sb.from("conversations").insert({
      subject: `Date request — ${productName}`,
      category: "booking",
      status: "open",
      user_id: user.id,
      user_name: userName,
      user_email: userEmail,
      product_id,
    }).select("id").single();

    if (convo) {
      await sb.from("messages").insert({
        conversation_id: convo.id,
        sender_type: "system",
        body: `You've requested ${productName} on ${dateStr} at ${timeStr}. We'll confirm your booking shortly.`,
        metadata: { product_id, requested_at },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
