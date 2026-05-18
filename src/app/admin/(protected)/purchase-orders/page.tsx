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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-[#1F2937]">Purchase Orders</h1>
      </div>
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
