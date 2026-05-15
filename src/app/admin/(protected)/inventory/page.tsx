export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { InventoryEditor } from "./inventory-editor";

export default async function InventoryPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: lowStock }] = await Promise.all([
    supabase.from("products").select("id, name, product_variants(id, size, stock_quantity)").eq("active", true).order("name"),
    supabase.from("low_stock_view").select("*"),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl">Inventory</h1>
        <p className="text-sm text-[#737373] mt-1">Manage stock, log adjustments, and track movements.</p>
      </div>
      <InventoryEditor
        initialProducts={products ?? []}
        lowStock={lowStock ?? []}
      />
    </div>
  );
}
