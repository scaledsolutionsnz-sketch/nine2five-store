export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/database";

const PAGE_SIZE = 50;

const PAYMENT_COLORS: Record<string, string> = {
  paid:      "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20",
  pending:   "bg-amber-400/10 text-amber-400 border border-amber-400/20",
  refunded:  "bg-white/[0.06] text-white/50 border border-white/[0.08]",
  cancelled: "bg-red-400/10 text-red-400 border border-red-400/20",
};

const FULFILLMENT_COLORS: Record<string, string> = {
  unfulfilled: "bg-amber-400/10 text-amber-400 border border-amber-400/20",
  shipped:     "bg-blue-400/10 text-blue-400 border border-blue-400/20",
  fulfilled:   "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20",
  cancelled:   "bg-red-400/10 text-red-400 border border-red-400/20",
  returned:    "bg-white/[0.06] text-white/50 border border-white/[0.08]",
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

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-white">Orders</h1>
          <p className="text-sm text-white/45 mt-1">
            {count ?? 0} total orders
            {totalPages > 1 && (
              <span className="ml-2 text-white/25">· Page {page} of {totalPages}</span>
            )}
          </p>
        </div>
      </div>

      <div className="bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Order", "Date Created", "Customer", "Payment", "Fulfillment", "Total", "Items"].map((h) => (
                <th key={h} className="text-left px-6 py-5 text-white/40 text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
              <th className="px-6 py-5" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const addr = order.shipping_address as { first_name?: string; last_name?: string };
              const payment = getPayment(order.status);
              const fulfillment = getFulfillment(order.status);
              const totalPairs = order.order_items.reduce((s, i) => s + i.quantity, 0);
              return (
                <tr key={order.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-16 font-mono font-bold text-white text-base whitespace-nowrap">
                    #{order.order_number}
                  </td>
                  <td className="px-6 py-16 text-white/40 text-sm whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString("en-NZ")}
                  </td>
                  <td className="px-6 py-16 text-white/80 text-sm">
                    {addr?.first_name} {addr?.last_name}
                    {order.guest_email && <p className="text-base text-white/30 mt-1">{order.guest_email}</p>}
                  </td>
                  <td className="px-6 py-16">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                      PAYMENT_COLORS[payment]
                    )}>
                      {payment}
                    </span>
                  </td>
                  <td className="px-6 py-16">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                      FULFILLMENT_COLORS[fulfillment]
                    )}>
                      {fulfillment}
                    </span>
                  </td>
                  <td className="px-6 py-16 font-mono font-semibold text-white text-base whitespace-nowrap">
                    ${(order.total / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-16 font-mono text-white/60 text-sm">
                    {totalPairs > 0 ? `${totalPairs} ${totalPairs === 1 ? "pair" : "pairs"}` : <span className="text-white/20">—</span>}
                  </td>
                  <td className="px-6 py-16">
                    <Link href={`/admin/orders/${order.id}`} className="text-sm text-[#4ade80] hover:text-[#86efac] font-medium transition-colors whitespace-nowrap">
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-16 text-white/30 text-sm">No orders yet.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-white/30">
            Showing {from + 1}–{Math.min(to + 1, count ?? 0)} of {count ?? 0} orders
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/admin/orders?page=${page - 1}`}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-white/70 border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
              >
                ← Previous
              </Link>
            )}
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/admin/orders?page=${page + 1}`}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-white/70 border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
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
