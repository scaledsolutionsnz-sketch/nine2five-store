export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/database";
import { Filter, SlidersHorizontal, Search, Plus, ChevronDown } from "lucide-react";

const PAGE_SIZE = 50;

const PAYMENT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  paid:      { bg: "#CDEEDC", color: "#166B3B", label: "Paid" },
  pending:   { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
  refunded:  { bg: "#F3F4F6", color: "#6B7280", label: "Refunded" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" },
};

const FULFILLMENT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  unfulfilled: { bg: "#FAD6D2", color: "#8A3A35", label: "Unfulfilled" },
  shipped:     { bg: "#DBEAFE", color: "#1E40AF", label: "Shipped" },
  fulfilled:   { bg: "#CDEEDC", color: "#166B3B", label: "Fulfilled" },
  cancelled:   { bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" },
  returned:    { bg: "#F3F4F6", color: "#6B7280", label: "Returned" },
};

function getPayment(status: string): string {
  if (status === "cancelled") return "cancelled";
  if (status === "refunded") return "refunded";
  if (status === "pending") return "pending";
  return "paid";
}

function getFulfillment(status: string): string {
  if (status === "pending" || status === "processing") return "unfulfilled";
  if (status === "shipped") return "shipped";
  if (status === "delivered") return "fulfilled";
  if (status === "cancelled") return "cancelled";
  if (status === "refunded") return "returned";
  return "unfulfilled";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function StatusBadge({ bg, color, label }: { bg: string; color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium whitespace-nowrap"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}

type OrderWithCount = Order & { order_items: { quantity: number }[] };
// order_items used only for the join; quantity is not displayed

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
    .select("*, order_items(quantity)", { count: "exact" })
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937]">Orders</h1>
          <p className="text-[14px] text-[#64748B] mt-1">View and manage all customer orders.</p>
        </div>
        <Link href="/admin/pos" className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#116DFF] hover:bg-[#0D5FE0] text-white text-[13px] font-semibold transition-colors">
          <Plus style={{ width: 15, height: 15 }} strokeWidth={2.5} />
          Add New Order
        </Link>
      </div>

      {/* Orders card */}
      <div
        className="rounded-[14px] bg-white overflow-hidden border border-[#E2E8F0]"
        style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center justify-between gap-3 px-6 h-16 border-b border-[#E2E8F0]"
        >
          {/* Left */}
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-[#D8E2F0] bg-white hover:bg-[#F4F8FF] text-[#27364A] text-[13px] font-medium transition-colors">
              All items
              <ChevronDown style={{ width: 14, height: 14, color: "#6B7280" }} />
            </button>
            <span className="text-[13px] text-[#8A94A6]">({count ?? 0})</span>
            <button className="text-[13px] font-medium ml-1 text-[#116DFF] hover:underline transition-colors">
              Manage View
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2.5">
            <button className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-[#D8E2F0] bg-white hover:bg-[#F4F8FF] text-[#116DFF] text-[13px] font-medium transition-colors">
              <Filter style={{ width: 13, height: 13 }} strokeWidth={2} />
              Filter
            </button>
            <button className="h-9 w-9 rounded-full border border-[#D8E2F0] bg-white hover:bg-[#F4F8FF] flex items-center justify-center text-[#6B7280] transition-colors">
              <SlidersHorizontal style={{ width: 14, height: 14 }} strokeWidth={2} />
            </button>
            <form action="/admin/orders" method="get" className="hidden sm:flex items-center gap-2 h-10 px-3.5 w-[280px] bg-white border border-[#E2E8F0] rounded-lg transition-colors focus-within:border-[#116DFF]/50">
              <Search
                className="pointer-events-none shrink-0"
                style={{ width: 13, height: 13, color: "#9CA3AF" }}
                strokeWidth={2}
              />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search orders or email…"
                className="flex-1 text-[13px] bg-transparent text-[#334155] placeholder:text-[#C4CAD4] focus:outline-none min-w-0"
              />
            </form>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 1100 }}>
            <thead>
              <tr className="bg-[#EAF2FF] border-b border-[#BBD3FF]">
                <th
                  className="w-[52px] px-4 text-center h-[52px]"
                  style={{ borderRight: "1px solid #C7DAF8" }}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded cursor-pointer accent-[#116DFF]"
                  />
                </th>
                {[
                  { label: "Order",        w: 120 },
                  { label: "Date created", w: 200 },
                  { label: "Customer",     w: 0   },
                  { label: "Payment",      w: 150 },
                  { label: "Fulfillment",  w: 160 },
                  { label: "Total",        w: 130 },
                  { label: "View",         w: 100 },
                ].map(({ label, w }, i, arr) => (
                  <th
                    key={label}
                    className="px-[18px] text-left text-[13px] font-medium text-[#1F2D3D] whitespace-nowrap h-[52px]"
                    style={{
                      width: w || undefined,
                      borderRight: i < arr.length - 1 ? "1px solid #C7DAF8" : undefined,
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const addr = order.shipping_address as { first_name?: string; last_name?: string };
                const paymentKey = getPayment(order.status);
                const fulfillmentKey = getFulfillment(order.status);
                const payment = PAYMENT_BADGE[paymentKey];
                const fulfillment = FULFILLMENT_BADGE[fulfillmentKey];
                const customerName = [addr?.first_name, addr?.last_name].filter(Boolean).join(" ");
                const isNew = now - new Date(order.created_at).getTime() < 24 * 60 * 60 * 1000;

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-[#F6FAFF] transition-colors duration-100 cursor-pointer"
                    style={{ borderBottom: "1px solid #E5EAF1", position: "relative" }}
                  >
                    {/* Checkbox — above overlay */}
                    <td className="w-[52px] px-4 py-[14px] text-center" style={{ position: "relative", zIndex: 1 }}>
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded cursor-pointer accent-[#116DFF]"
                      />
                    </td>

                    {/* Order # — contains the full-row overlay link */}
                    <td className="px-[18px] py-[14px]" style={{ width: 120, position: "relative" }}>
                      <Link href={`/admin/orders/${order.id}`} className="absolute inset-0" aria-label={`View order #${order.order_number}`} style={{ zIndex: 0 }} />
                      <span className="relative text-[13px] font-medium text-[#3B4558]" style={{ zIndex: 1 }}>
                        #{order.order_number}
                      </span>
                      {isNew && (
                        <div className="mt-1 relative" style={{ zIndex: 1 }}>
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-semibold text-white"
                            style={{ backgroundColor: "#116DFF", borderRadius: 4 }}
                          >
                            NEW
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-[18px] py-[14px]" style={{ width: 200 }}>
                      <span className="text-[13px] text-[#4A5568] whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-[18px] py-[14px]">
                      <p className="text-[13px] font-medium text-[#3F4A5F] whitespace-nowrap">
                        {customerName || <span className="text-[#9CA3AF]">Guest</span>}
                      </p>
                      {order.guest_email && (
                        <p className="text-[13px] text-[#8A94A6] mt-0.5 max-w-[200px] truncate">
                          {order.guest_email}
                        </p>
                      )}
                    </td>

                    {/* Payment */}
                    <td className="px-[18px] py-[14px]" style={{ width: 150 }}>
                      <StatusBadge {...payment} />
                    </td>

                    {/* Fulfillment */}
                    <td className="px-[18px] py-[14px]" style={{ width: 160 }}>
                      <StatusBadge {...fulfillment} />
                    </td>

                    {/* Total */}
                    <td className="px-[18px] py-[14px]" style={{ width: 130 }}>
                      <span className="text-[13px] font-medium text-[#334155]">
                        NZ${(order.total / 100).toFixed(2)}
                      </span>
                    </td>

                    {/* View */}
                    <td className="px-[18px] py-[14px] text-center" style={{ width: 100, position: "relative", zIndex: 1 }}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[13px] font-medium text-[#116DFF] hover:underline transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-20 text-[14px] text-[#9CA3AF]">
            No orders found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-1">
          <p className="text-[13px] text-[#6B7280]">
            Showing {from + 1}–{Math.min(to + 1, count ?? 0)} of {count ?? 0} orders
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/admin/orders?page=${page - 1}`}
                className="h-9 px-4 rounded-full text-[13px] font-medium bg-white hover:bg-[#F6FAFF] border border-[#E2E8F0] hover:border-[#C7DAF8] text-[#334155] transition-colors inline-flex items-center"
              >
                ← Previous
              </Link>
            )}
            <span
              className="px-4 h-9 rounded-full text-[13px] font-semibold text-[#116DFF] inline-flex items-center"
              style={{
                backgroundColor: "rgba(17,109,255,0.08)",
                border: "1px solid rgba(17,109,255,0.2)",
              }}
            >
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/admin/orders?page=${page + 1}`}
                className="h-9 px-4 rounded-full text-[13px] font-medium bg-white hover:bg-[#F6FAFF] border border-[#E2E8F0] hover:border-[#C7DAF8] text-[#334155] transition-colors inline-flex items-center"
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
