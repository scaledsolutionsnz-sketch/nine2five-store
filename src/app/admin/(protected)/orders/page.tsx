export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Order } from "@/types/database";
import { Plus, ShoppingCart, DollarSign, PackageCheck, Clock } from "lucide-react";
import { OrdersTableClient } from "./orders-table-client";
import { OrdersSearchClient } from "./orders-search-client";

const PAGE_SIZE = 50;

type OrderRow = Order & { order_items: { quantity: number; product_name: string; size: string }[] };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page: pageParam, search: rawSearch } = await searchParams;
  const search = rawSearch?.trim() ?? "";
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createServiceClient();

  let query = supabase
    .from("orders")
    .select("*, order_items(quantity, product_name, size)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    const num = parseInt(search.replace(/^#/, ""), 10);
    if (!isNaN(num)) {
      query = query.eq("order_number", num);
    } else {
      query = query.ilike("guest_email", `%${search}%`);
    }
  }

  const { data, count } = await query.range(from, to);
  const orders = (data ?? []) as OrderRow[];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const now = Date.now();

  // Stats — fetch all orders (not paginated) for cards
  const { data: allStats } = await supabase
    .from("orders")
    .select("total, status, created_at")
    .not("status", "in", '("cancelled","refunded")');

  const totalRevenue = (allStats ?? []).reduce((s, o) => s + (o.total ?? 0), 0);
  const unfulfilledCount = (allStats ?? []).filter(o => o.status === "pending" || o.status === "processing").length;
  const todayOrders = (allStats ?? []).filter(o => now - new Date(o.created_at).getTime() < 86_400_000).length;
  const avgOrder = (allStats ?? []).length > 0 ? Math.round(totalRevenue / (allStats ?? []).length) : 0;

  const CARD: React.CSSProperties = {
    padding: "20px 22px", borderRadius: 16,
    background: "rgba(8,28,16,0.92)",
    border: "1px solid rgba(255,255,255,0.09)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#06150C", color: "#f8f8f2", padding: "32px 28px" }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>Orders</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 6, fontSize: 14 }}>
            View and manage all customer orders.
          </p>
        </div>
        <Link
          href="/admin/pos"
          style={{ height: 42, padding: "0 20px", borderRadius: 999, background: "#2f9b2f", color: "#fff", fontWeight: 900, fontSize: 13, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", letterSpacing: "0.08em", flexShrink: 0 }}
        >
          <Plus style={{ width: 15, height: 15 }} strokeWidth={2.5} />
          Add New Order
        </Link>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { label: "Total Orders",   value: (count ?? 0).toLocaleString(),          icon: ShoppingCart,  color: "#60A5FA" },
          { label: "Total Revenue",  value: `$${(totalRevenue / 100).toFixed(2)}`,  icon: DollarSign,    color: "#FBBF24" },
          { label: "Unfulfilled",    value: unfulfilledCount.toLocaleString(),       icon: Clock,         color: "#F87171" },
          { label: "Avg Order",      value: `$${(avgOrder / 100).toFixed(2)}`,       icon: PackageCheck,  color: "#2f9b2f" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={CARD}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{label}</p>
              <Icon style={{ width: 14, height: 14, color }} strokeWidth={1.8} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ borderRadius: 18, overflow: "hidden", background: "rgba(8,28,16,0.92)", border: "1px solid rgba(255,255,255,0.09)", marginBottom: 24 }}>
        {/* Toolbar */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>All Orders</p>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>({count ?? 0})</span>
            {todayOrders > 0 && (
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", background: "rgba(47,155,47,0.2)", color: "#4ade80", border: "1px solid rgba(47,155,47,0.3)", borderRadius: 9999, padding: "2px 8px" }}>
                +{todayOrders} TODAY
              </span>
            )}
          </div>
          <OrdersSearchClient defaultValue={search} />
        </div>

        <OrdersTableClient orders={orders} now={now} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            Showing {from + 1}–{Math.min(to + 1, count ?? 0)} of {count ?? 0} orders
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {page > 1 && (
              <Link href={`/admin/orders?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                style={{ height: 38, padding: "0 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                ← Previous
              </Link>
            )}
            <span style={{ padding: "0 16px", height: 38, borderRadius: 999, fontSize: 13, fontWeight: 800, background: "rgba(47,155,47,0.15)", color: "#4ade80", border: "1px solid rgba(47,155,47,0.3)", display: "inline-flex", alignItems: "center" }}>
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link href={`/admin/orders?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                style={{ height: 38, padding: "0 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
