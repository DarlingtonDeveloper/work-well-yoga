import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const sk = process.env.STRIPE_SECRET_KEY;
    if (!sk) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY is not set" }, { status: 500 });
    }

    const stripe = new Stripe(sk);
    const { origin } = new URL(request.url);
    const body = await request.json();
    const { mode, items, planName } = body as {
      mode: "payment" | "subscription";
      items: { name: string; price: number; quantity?: number }[];
      planName?: string;
    };

    // Get current user if logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "gbp",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
        ...(mode === "subscription" ? { recurring: { interval: "month" as const } } : {}),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      ...(user?.email ? { customer_email: user.email } : {}),
      metadata: {
        user_id: user?.id || "",
        plan_name: planName || "",
        type: mode,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
