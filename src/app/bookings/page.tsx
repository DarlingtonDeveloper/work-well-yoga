import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingsShell } from "@/components/Bookings";

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <BookingsShell />;
}
