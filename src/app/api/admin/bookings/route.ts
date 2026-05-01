import { NextResponse } from "next/server";
import { requireAdmin, getAdminSupabase } from "@/lib/admin";

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("event_id");

  const sb = getAdminSupabase();
  let query = sb
    .from("bookings")
    .select("*, events(id, title, start_at, location, products(name, brand))")
    .order("created_at", { ascending: false });

  if (eventId) {
    query = query.eq("event_id", Number(eventId));
  }

  const { data: bookings, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach user info via auth admin
  const { data: { users } } = await sb.auth.admin.listUsers({ perPage: 1000 });

  const userMap = new Map(
    users.map((u) => [
      u.id,
      {
        email: u.email || "",
        name: u.user_metadata?.full_name || u.email?.split("@")[0] || "",
        avatar: u.user_metadata?.avatar_url || null,
      },
    ])
  );

  const enriched = (bookings || []).map((b) => ({
    ...b,
    user_email: userMap.get(b.user_id)?.email || "",
    user_name: userMap.get(b.user_id)?.name || "",
    user_avatar: userMap.get(b.user_id)?.avatar || null,
  }));

  return NextResponse.json(enriched);
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, status } = await request.json();
  const sb = getAdminSupabase();

  // Get booking details before update (for auto-message)
  const { data: booking } = await sb
    .from("bookings")
    .select("*, events(title, start_at, location), products:product_id(id, name, price, category)")
    .eq("id", id)
    .single();

  const update: Record<string, unknown> = { status };
  if (status === "cancelled") {
    update.cancelled_at = new Date().toISOString();
  }

  const { error } = await sb.from("bookings").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-create booking confirmation/rejection message
  if (booking && (status === "confirmed" || status === "cancelled")) {
    const { data: { user: authUser } } = await sb.auth.admin.getUserById(booking.user_id);
    const userName = authUser?.user_metadata?.full_name || authUser?.email?.split("@")[0] || "Customer";
    const userEmail = authUser?.email || "";

    const eventData = booking.events as { title: string; start_at: string; location: string | null } | null;
    const productData = booking.products as { id: number; name: string; price: string; category: string } | null;
    const itemName = eventData?.title || productData?.name || "your session";
    const rawDate = booking.requested_at || eventData?.start_at;
    const parsedDate = rawDate ? new Date(rawDate) : null;
    const dateStr = parsedDate
      ? parsedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
      : "";
    const timeStr = parsedDate
      ? parsedDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      : "";

    const isConfirmed = status === "confirmed";
    const whenStr = dateStr ? ` on ${dateStr}${timeStr ? ` at ${timeStr}` : ""}` : "";
    const subject = isConfirmed
      ? `Session confirmed — ${itemName}`
      : `Session request update — ${itemName}`;
    const locationNote = eventData?.location ? ` Location: ${eventData.location}.` : "";
    const priceNote = productData?.price ? `\n\nComplete your booking by paying below.` : "";
    const msgBody = isConfirmed
      ? `Your request for ${itemName}${whenStr} has been confirmed.${locationNote}${priceNote}`
      : `Unfortunately we couldn't accommodate your request for ${itemName}${whenStr}. Please try another date or get in touch.`;

    // Try to find the existing booking request conversation to reply in the same thread
    let convoId: number | null = null;
    const { data: existingConvo } = await sb
      .from("conversations")
      .select("id")
      .eq("user_id", booking.user_id)
      .eq("category", "booking")
      .eq("product_id", booking.product_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingConvo) {
      convoId = existingConvo.id;
      await sb.from("conversations").update({
        status: isConfirmed ? "closed" : "open",
        subject,
      }).eq("id", convoId);
    } else {
      const { data: newConvo } = await sb.from("conversations").insert({
        subject,
        category: "booking",
        status: isConfirmed ? "closed" : "open",
        user_id: booking.user_id,
        user_name: userName,
        user_email: userEmail,
        product_id: booking.product_id || (eventData ? booking.event_id : null),
      }).select("id").single();
      convoId = newConvo?.id || null;
    }

    if (convoId) {
      await sb.from("messages").insert({
        conversation_id: convoId,
        sender_type: "system",
        body: msgBody,
        metadata: {
          booking_id: id,
          status,
          event: eventData,
          requested_at: booking.requested_at,
          ...(isConfirmed && productData ? {
            pay: {
              product_id: productData.id,
              product_name: productData.name,
              price: productData.price,
              category: productData.category,
            },
          } : {}),
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { user_id, event_id } = await request.json();
  const sb = getAdminSupabase();

  const { data, error } = await sb
    .from("bookings")
    .insert({ user_id, event_id, status: "confirmed" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update event status if at capacity
  const { count } = await sb
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event_id)
    .eq("status", "confirmed");

  const { data: ev } = await sb
    .from("events")
    .select("capacity")
    .eq("id", event_id)
    .single();

  if (ev && count && count >= ev.capacity) {
    await sb.from("events").update({ status: "full" }).eq("id", event_id);
  }

  return NextResponse.json(data);
}
