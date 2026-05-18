export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { InventoryEditor } from "./inventory-editor";

export default async function InventoryPage() {
  const supabase = await createServiceClient();

  const [{ data: products }, { data: lowStock }] = await Promise.all([
    supabase.from("products").select("id, name, product_variants(id, size, stock_quantity)").eq("active", true).order("name"),
    supabase.from("low_stock_view").select("*"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937]">Inventory</h1>
          <p className="text-[14px] text-[#64748B] mt-1">Manage stock levels and variants.</p>
        </div>
      </div>
      <InventoryEditor
        initialProducts={products ?? []}
        lowStock={lowStock ?? []}
      />
    </div>
  );
}
