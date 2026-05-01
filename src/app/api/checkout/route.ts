import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { origin } = new URL(request.url);

    // Subscription mode (pricing page plans)
    if (body.mode === "subscription") {
      const { items, planName } = body as {
        mode: "subscription";
        items: { name: string; price: number; quantity?: number }[];
        planName?: string;
      };

      const lineItems = items.map((item) => ({
        price_data: {
          currency: "gbp",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
          recurring: { interval: "month" as const },
        },
        quantity: item.quantity || 1,
      }));

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: lineItems,
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout/cancel`,
        customer_email: user.email,
        metadata: {
          user_id: user.id,
          supabase_user_id: user.id,
          plan_name: planName || "",
          type: "subscription",
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // Product payment mode (shop purchases)
    const { name, price, productId, category, eventId, variantId, variantName, isPreorder, depositPrice, cohortDate } = body;

    // Parse price string like "£48" or "£2,180 / guest" to cents
    const chargePrice = isPreorder && depositPrice ? depositPrice : price;
    const numericPrice = Math.round(
      parseFloat(chargePrice.replace(/[^0-9.]/g, "")) * 100
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      metadata: {
        supabase_user_id: user.id,
        product_id: String(productId),
        product_name: name,
        category,
        ...(eventId ? { event_id: String(eventId) } : {}),
        ...(variantId ? { variant_id: String(variantId) } : {}),
        ...(variantName ? { variant_name: variantName } : {}),
        ...(isPreorder ? { is_preorder: "true" } : {}),
        ...(cohortDate ? { cohort_date: cohortDate } : {}),
      },
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: isPreorder ? `Pre-order: ${variantName ? `${name} — ${variantName}` : name}` : variantName ? `${name} — ${variantName}` : name },
            unit_amount: numericPrice,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Checkout API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
