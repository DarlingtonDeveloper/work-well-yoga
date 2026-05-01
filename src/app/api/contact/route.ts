import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimit(`contact:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const { category, name, email, fields } = await request.json();

    if (!category || !name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sb = getAdminSupabase();

    // Check if sender is a logged-in user
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // Not logged in — that's fine
    }

    // Build message body from form fields
    const bodyParts: string[] = [];
    if (fields && typeof fields === "object") {
      for (const [key, value] of Object.entries(fields)) {
        if (value) bodyParts.push(`**${key}:** ${value}`);
      }
    }
    const body = bodyParts.length > 0 ? bodyParts.join("\n") : "(No details provided)";

    // Create conversation
    const { data: convo, error: convoErr } = await sb
      .from("conversations")
      .insert({
        subject: `Contact — ${category}`,
        category: `contact-${category}`,
        status: "open",
        user_id: userId,
        user_name: name,
        user_email: email,
        product_id: null,
      })
      .select("id")
      .single();

    if (convoErr) {
      return NextResponse.json({ error: convoErr.message }, { status: 500 });
    }

    // Create first message
    const { error: msgErr } = await sb.from("messages").insert({
      conversation_id: convo.id,
      sender_type: "user",
      sender_id: userId,
      body,
      metadata: { form_category: category, form_fields: fields },
    });

    if (msgErr) {
      return NextResponse.json({ error: msgErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
