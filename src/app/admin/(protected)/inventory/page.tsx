export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { InventoryEditor } from "./inventory-editor";

export default async function InventoryPage() {
  const supabase = await createServiceClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, product_variants(id, size, stock_quantity)")
    .eq("active", true)
    .order("name");

  return (
    <div style={{ minHeight: "100vh", background: "#06150C", color: "#f8f8f2", padding: "32px 28px" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>Inventory</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 6, fontSize: 14 }}>Pairs in stock for each design and size.</p>
        </div>
      </div>
      <InventoryEditor initialProducts={products ?? []} />
    </div>
  );
}
