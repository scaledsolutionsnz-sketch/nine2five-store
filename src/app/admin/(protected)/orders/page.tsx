export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Order } from "@/types/database";
import { Plus } from "lucide-react";
import { OrdersTableClient } from "./orders-table-client";
import { OrdersSearchClient } from "./orders-search-client";

const PAGE_SIZE = 50;

type OrderWithCount = Order & { order_items: { quantity: number; product_name: string; size: string }[] };

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

  const orders = (data ?? []) as OrderWithCount[];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const now = Date.now();

  const BADGE_BASE: React.CSSProperties = {
    display: "inline-flex", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#06150C", color: "#f8f8f2", padding: "32px 28px" }}>
      {/* Page header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
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

      {/* Orders card */}
      <div style={{ background: "#f7f8f4", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", marginBottom: 24 }}>
        {/* Toolbar */}
        <div style={{ padding: "14px 22px", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <p style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>All Orders</p>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>({count ?? 0})</span>
          </div>
          <OrdersSearchClient defaultValue={search} />
        </div>

        {/* Table — client component handles checkboxes + bulk print */}
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
              <Link
                href={`/admin/orders?page=${page - 1}`}
                style={{ height: 38, padding: "0 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", display: "inline-flex", alignItems: "center", textDecoration: "none" }}
              >
                ← Previous
              </Link>
            )}
            <span style={{ padding: "0 16px", height: 38, borderRadius: 999, fontSize: 13, fontWeight: 800, background: "rgba(47,155,47,0.15)", color: "#4ade80", border: "1px solid rgba(47,155,47,0.3)", display: "inline-flex", alignItems: "center" }}>
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/admin/orders?page=${page + 1}`}
                style={{ height: 38, padding: "0 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", display: "inline-flex", alignItems: "center", textDecoration: "none" }}
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
