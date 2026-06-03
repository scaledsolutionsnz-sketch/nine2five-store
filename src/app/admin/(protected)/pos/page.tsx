export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { POSClient } from "./pos-client";

export default async function POSPage() {
  const supabase = await createServiceClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, image_urls, product_variants(id, size, stock_quantity)")
    .eq("active", true)
    .order("name");

  return (
    <div style={{ background: "#06150C", minHeight: "100vh", padding: "0" }}>
      <POSClient products={products ?? []} />
    </div>
  );
}
