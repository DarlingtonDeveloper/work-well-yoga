import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile (subscription info)
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, plan_name")
    .eq("id", user.id)
    .single();

  // Fetch orders
  const { data: orders } = await supabase
    .from("orders")
    .select("id, plan_name, type, status, amount, currency, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <DashboardClient
      name={user.user_metadata?.full_name || user.email?.split("@")[0] || "Member"}
      email={user.email || ""}
      avatar={user.user_metadata?.avatar_url || ""}
      subscriptionStatus={profile?.subscription_status || null}
      planName={profile?.plan_name || null}
      orders={orders || []}
    />
  );
}
