import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PracticeShell } from "@/components/Practice";

export default async function PracticePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <PracticeShell />;
}
