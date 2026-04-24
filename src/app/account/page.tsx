import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountShell } from "@/components/Account";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, phone, bio, notify_booking_confirm, notify_event_reminder, notify_newsletter, notify_marketing")
    .eq("id", user.id)
    .single();

  const { data: subscriptions } = await supabase
    .from("mailing_list_members")
    .select("id, list_id, subscribed, mailing_lists(id, name, description)")
    .eq("user_id", user.id);

  return (
    <AccountShell
      user={user}
      profile={profile || {}}
      subscriptions={(subscriptions || []) as never[]}
    />
  );
}
