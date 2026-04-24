import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const planName = session.metadata?.plan_name;
      const type = session.metadata?.type;

      if (userId) {
        await supabaseAdmin.from("orders").insert({
          user_id: userId,
          stripe_session_id: session.id,
          stripe_customer_id: session.customer as string,
          plan_name: planName || null,
          type: type || "payment",
          status: "completed",
          amount: session.amount_total,
          currency: session.currency,
        });

        if (type === "subscription") {
          await supabaseAdmin.from("profiles").upsert({
            id: userId,
            subscription_status: "active",
            plan_name: planName,
            stripe_customer_id: session.customer as string,
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      await supabaseAdmin
        .from("profiles")
        .update({ subscription_status: "cancelled", plan_name: null })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
