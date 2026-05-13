export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { InventoryEditor } from "./inventory-editor";

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("active", true)
    .order("name");

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl">Inventory</h1>
        <p className="text-sm text-[#737373] mt-1">Manage stock levels per product and size.</p>
      </div>
      <InventoryEditor initialProducts={data ?? []} />
    </div>
  );
}
