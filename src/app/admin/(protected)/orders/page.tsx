export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/database";
import { ChevronDown, Filter, SlidersHorizontal, Search, Plus } from "lucide-react";

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
      className="inline-flex items-center px-2.5 py-1 rounded text-[13px] font-medium whitespace-nowrap"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}

type OrderWithCount = Order & { order_items: { quantity: number }[] };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createServiceClient();
  const { data, count } = await supabase
    .from("orders")
    .select("*, order_items(quantity)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const orders = (data ?? []) as OrderWithCount[];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const now = Date.now();

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937]">Orders</h1>
          <p className="text-[14px] text-[#64748B] mt-1">View and manage all customer orders.</p>
        </div>
        <button className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[#116DFF] hover:bg-[#0D5FE0] text-white text-[14px] font-semibold transition-colors shadow-sm">
          <Plus style={{ width: 16, height: 16 }} strokeWidth={2.5} />
          Add New Order
        </button>
      </div>

      {/* Orders card */}
      <div
        className="rounded-[14px] bg-white overflow-hidden"
        style={{ border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center justify-between gap-3 px-6 h-16"
          style={{ borderBottom: "1px solid #E2E8F0" }}
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
            <div className="relative hidden sm:flex items-center">
              <Search
                className="absolute left-3.5 pointer-events-none"
                style={{ width: 13, height: 13, color: "#9CA3AF" }}
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-[280px] pl-9 pr-4 text-[13px] rounded-full border border-[#D8E2F0] bg-white text-[#334155] placeholder:text-[#C4CAD4] focus:outline-none focus:border-[#116DFF]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 1100 }}>
            <thead>
              <tr style={{ backgroundColor: "#EAF2FF", borderBottom: "1px solid #BBD3FF" }}>
                <th
                  className="w-[52px] px-4 text-center"
                  style={{ height: 52, borderRight: "1px solid #C7DAF8" }}
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
                  { label: "Items",        w: 90  },
                  { label: "View",         w: 100 },
                ].map(({ label, w }, i, arr) => (
                  <th
                    key={label}
                    className="px-4 text-left text-[14px] font-medium text-[#1F2D3D] whitespace-nowrap"
                    style={{
                      height: 52,
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
                const totalPairs = order.order_items.reduce((s, i) => s + i.quantity, 0);
                const customerName = [addr?.first_name, addr?.last_name].filter(Boolean).join(" ");
                const isNew = now - new Date(order.created_at).getTime() < 24 * 60 * 60 * 1000;

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-[#F6FAFF] transition-colors duration-100"
                    style={{ borderBottom: "1px solid #E5EAF1" }}
                  >
                    <td className="w-[52px] px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded cursor-pointer accent-[#116DFF]"
                      />
                    </td>

                    {/* Order # */}
                    <td className="px-4 py-3.5" style={{ width: 120 }}>
                      <span className="text-[14px] font-medium text-[#3B4558]">
                        #{order.order_number}
                      </span>
                      {isNew && (
                        <div className="mt-1">
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
                    <td className="px-4 py-3.5" style={{ width: 200 }}>
                      <span className="text-[14px] text-[#4A5568] whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <p className="text-[14px] font-medium text-[#3F4A5F] whitespace-nowrap">
                        {customerName || <span className="text-[#9CA3AF]">Guest</span>}
                      </p>
                      {order.guest_email && (
                        <p className="text-[13px] text-[#8A94A6] mt-0.5 max-w-[200px] truncate">
                          {order.guest_email}
                        </p>
                      )}
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-3.5" style={{ width: 150 }}>
                      <StatusBadge {...payment} />
                    </td>

                    {/* Fulfillment */}
                    <td className="px-4 py-3.5" style={{ width: 160 }}>
                      <StatusBadge {...fulfillment} />
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3.5" style={{ width: 130 }}>
                      <span className="text-[14px] font-medium text-[#334155]">
                        NZ${(order.total / 100).toFixed(2)}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3.5 text-center" style={{ width: 90 }}>
                      {totalPairs > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[14px] font-medium text-[#116DFF]">
                          {totalPairs}
                          <ChevronDown style={{ width: 12, height: 12 }} strokeWidth={2.5} />
                        </span>
                      ) : (
                        <span className="text-[14px] text-[#C4CAD4]">—</span>
                      )}
                    </td>

                    {/* View */}
                    <td className="px-4 py-3.5 text-center" style={{ width: 100 }}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[14px] font-medium text-[#116DFF] hover:underline transition-colors"
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
                className="px-4 py-2 rounded-full text-[13px] font-medium bg-white hover:bg-[#F6FAFF] border border-[#E2E8F0] hover:border-[#C7DAF8] text-[#334155] transition-colors"
              >
                ← Previous
              </Link>
            )}
            <span
              className="px-4 py-2 rounded-full text-[13px] font-semibold text-[#116DFF]"
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
                className="px-4 py-2 rounded-full text-[13px] font-medium bg-white hover:bg-[#F6FAFF] border border-[#E2E8F0] hover:border-[#C7DAF8] text-[#334155] transition-colors"
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
