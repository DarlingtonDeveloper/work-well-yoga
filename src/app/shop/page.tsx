import { createClient } from "@/lib/supabase/server";
import { ShopClient } from "@/components/Shop";

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(*), product_variants(*)")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("sort_order", { referencedTable: "product_images", ascending: true })
    .order("sort_order", { referencedTable: "product_variants", ascending: true });

  // Check which course products the user already owns
  let ownedCourseIds: number[] = [];
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: purchases } = await supabase
      .from("purchases")
      .select("product_id")
      .eq("user_id", user.id)
      .eq("category", "course");
    ownedCourseIds = (purchases || []).map(p => p.product_id);
  }

  return <ShopClient products={products || []} ownedCourseIds={ownedCourseIds} />;
}
