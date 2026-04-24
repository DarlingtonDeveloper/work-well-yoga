import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sb = getAdminSupabase();
    const { id } = await request.json();

    // Get purchase
    const { data: purchase, error: fetchError } = await sb
      .from("purchases")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    if (!purchase.stripe_session_id) {
      return NextResponse.json({ error: "No Stripe session associated with this purchase" }, { status: 400 });
    }

    // Retrieve the Stripe session to get the payment intent
    const session = await stripe.checkout.sessions.retrieve(purchase.stripe_session_id);

    if (!session.payment_intent) {
      return NextResponse.json({ error: "No payment intent found for this session" }, { status: 400 });
    }

    // Create the refund
    await stripe.refunds.create({
      payment_intent: session.payment_intent as string,
    });

    // Update purchase status
    const { error: updateError } = await sb
      .from("purchases")
      .update({ status: "refunded" })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Refund error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
