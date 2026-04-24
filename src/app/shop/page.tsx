import { createClient } from "@/lib/supabase/server";
import { ShopClient } from "@/components/Shop";

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  return <ShopClient products={products || []} />;
}
