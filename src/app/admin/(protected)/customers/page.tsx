export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { CustomersClient } from "./customers-client";
import type { CustomerRow } from "./customers-client";

export default async function CustomersPage() {
  const supabase = await createServiceClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("id, email, first_name, last_name, accepts_marketing, created_at")
    .order("created_at", { ascending: false });

  // Real order counts + LTV from paid orders
  const { data: orderStats } = await supabase
    .from("orders")
    .select("customer_id, total")
    .not("customer_id", "is", null)
    .in("status", ["processing", "shipped", "delivered"]);

  const statsByCustomer = new Map<string, { count: number; ltv: number }>();
  for (const o of orderStats ?? []) {
    if (!o.customer_id) continue;
    const cur = statsByCustomer.get(o.customer_id) ?? { count: 0, ltv: 0 };
    statsByCustomer.set(o.customer_id, { count: cur.count + 1, ltv: cur.ltv + (o.total ?? 0) });
  }

  // Last order date per customer
  const { data: lastOrders } = await supabase
    .from("orders")
    .select("customer_id, created_at")
    .not("customer_id", "is", null)
    .order("created_at", { ascending: false });

  const lastOrderByCustomer = new Map<string, string>();
  for (const o of lastOrders ?? []) {
    if (!o.customer_id) continue;
    if (!lastOrderByCustomer.has(o.customer_id)) {
      lastOrderByCustomer.set(o.customer_id, o.created_at);
    }
  }

  const rows: CustomerRow[] = (customers ?? []).map(c => ({
    id: c.id,
    email: c.email,
    first_name: c.first_name,
    last_name: c.last_name,
    phone: null,
    accepts_marketing: c.accepts_marketing,
    order_count: statsByCustomer.get(c.id)?.count ?? 0,
    last_order_at: lastOrderByCustomer.get(c.id) ?? null,
    ltv_cents: statsByCustomer.get(c.id)?.ltv ?? 0,
    created_at: c.created_at,
  }));

  rows.sort((a, b) => b.ltv_cents - a.ltv_cents);

  return (
    <div style={{ minHeight: "100vh", background: "#06150C", color: "#f8f8f2", padding: "32px 28px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>Customers</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 6, fontSize: 14 }}>
          {rows.length} customers · sorted by lifetime value
        </p>
      </div>
      <CustomersClient customers={rows} />
    </div>
  );
}
