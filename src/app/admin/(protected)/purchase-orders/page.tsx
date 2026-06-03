export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { PurchaseOrdersClient } from "./purchase-orders-client";

export default async function PurchaseOrdersPage() {
  const supabase = await createServiceClient();

  const [{ data: orders }, { data: suppliers }, { data: variants }] = await Promise.all([
    supabase
      .from("purchase_orders")
      .select("*, suppliers(name), purchase_order_items(id, variant_id, quantity_ordered, quantity_received, unit_cost_cents, product_variants(size, products(name)))")
      .order("created_at", { ascending: false }),
    supabase.from("suppliers").select("id, name").eq("active", true).order("name"),
    supabase.from("product_variants").select("id, size, products(name)").order("id"),
  ]);

  return (
    <div style={{ minHeight: "100vh", background: "#06150C", color: "#f8f8f2", padding: "32px 28px" }}>
      <PurchaseOrdersClient
        initialOrders={orders ?? []}
        suppliers={suppliers ?? []}
        variants={(variants ?? []).map((v) => ({
          id: v.id,
          size: v.size,
          product: Array.isArray(v.products) ? v.products[0] ?? null : v.products,
        }))}
      />
    </div>
  );
}
