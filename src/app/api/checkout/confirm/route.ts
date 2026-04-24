import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { session_id } = await request.json();
    if (!session_id) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Not paid" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if order already exists (from webhook)
    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session.id)
      .single();

    if (!existing) {
      const { error: insertError } = await supabase.from("orders").insert({
        user_id: user.id,
        stripe_session_id: session.id,
        stripe_customer_id: (session.customer as string) || null,
        plan_name: session.metadata?.plan_name || null,
        type: session.metadata?.type || "payment",
        status: "completed",
        amount: session.amount_total,
        currency: session.currency,
      });
      if (insertError) {
        console.error("Insert order error:", insertError);
        return NextResponse.json({ error: insertError.message, code: insertError.code, details: insertError.details }, { status: 500 });
      }
    }

    if (session.metadata?.type === "subscription") {
      await supabase.from("profiles").upsert({
        id: user.id,
        subscription_status: "active",
        plan_name: session.metadata?.plan_name,
        stripe_customer_id: (session.customer as string) || null,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Confirm error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
