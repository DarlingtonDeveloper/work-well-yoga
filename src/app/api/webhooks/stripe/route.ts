import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAdminSupabase } from "@/lib/admin";

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

  const supabase = getAdminSupabase();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const meta = session.metadata;
      const userId = meta?.supabase_user_id || meta?.user_id;

      if (!userId) break;

      // Handle subscription orders (pricing page plans)
      if (meta?.type === "subscription") {
        await supabase.from("orders").insert({
          user_id: userId,
          stripe_session_id: session.id,
          stripe_customer_id: session.customer as string,
          plan_name: meta.plan_name || null,
          type: "subscription",
          status: "completed",
          amount: session.amount_total,
          currency: session.currency,
        });

        await supabase.from("profiles").upsert({
          id: userId,
          subscription_status: "active",
          plan_name: meta.plan_name,
          stripe_customer_id: session.customer as string,
        });
        break;
      }

      // Handle product purchases (shop)
      if (meta?.product_id) {
        // Get user info for conversation
        const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);
        const userName = authUser?.user_metadata?.full_name || authUser?.email?.split("@")[0] || "Customer";
        const userEmail = authUser?.email || "";

        const { data: purchase } = await supabase.from("purchases").insert({
          user_id: userId,
          product_id: Number(meta.product_id),
          product_name: meta.product_name,
          category: meta.category,
          amount: session.amount_total,
          currency: session.currency,
          stripe_session_id: session.id,
          variant_id: meta.variant_id ? Number(meta.variant_id) : null,
          variant_name: meta.variant_name || null,
        }).select("id").single();

        // Auto-create order confirmation conversation
        if (purchase) {
          const amountStr = session.currency === "gbp"
            ? `£${((session.amount_total || 0) / 100).toFixed(2)}`
            : `${((session.amount_total || 0) / 100).toFixed(2)} ${(session.currency || "").toUpperCase()}`;
          const { data: convo } = await supabase.from("conversations").insert({
            subject: `Order confirmed — ${meta.product_name}`,
            category: "order",
            status: "closed",
            user_id: userId,
            user_name: userName,
            user_email: userEmail,
            product_id: Number(meta.product_id),
          }).select("id").single();

          if (convo) {
            await supabase.from("messages").insert({
              conversation_id: convo.id,
              sender_type: "system",
              body: `Your order for ${meta.product_name} has been confirmed. Amount: ${amountStr}.`,
              metadata: {
                purchase_id: purchase.id,
                stripe_session_id: session.id,
                amount: session.amount_total,
                currency: session.currency,
                product_name: meta.product_name,
                variant_name: meta.variant_name || null,
              },
            });
          }
        }

        // Create booking if this purchase is for a bookable event
        if (meta.event_id && purchase) {
          await supabase.from("bookings").insert({
            user_id: userId,
            event_id: Number(meta.event_id),
            purchase_id: purchase.id,
            status: "confirmed",
          });

          // Update event status if at capacity
          const { count } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("event_id", Number(meta.event_id))
            .eq("status", "confirmed");

          const { data: ev } = await supabase
            .from("events")
            .select("capacity")
            .eq("id", Number(meta.event_id))
            .single();

          if (ev && count && count >= ev.capacity) {
            await supabase.from("events").update({ status: "full" }).eq("id", Number(meta.event_id));
          }

          // Remove from waitlist if they were on it
          await supabase
            .from("waitlist")
            .delete()
            .eq("user_id", userId)
            .eq("event_id", Number(meta.event_id));
        }

        // Create booking for recurring cohort purchases (no event_id)
        if (meta.cohort_date && !meta.event_id && purchase) {
          await supabase.from("bookings").insert({
            user_id: userId,
            product_id: Number(meta.product_id),
            purchase_id: purchase.id,
            status: "confirmed",
            requested_at: meta.cohort_date + "T00:00:00Z",
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      await supabase
        .from("profiles")
        .update({ subscription_status: "cancelled", plan_name: null })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
