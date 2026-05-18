export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/database";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-white/[0.06] text-white/50 border border-white/[0.08]",
  processing: "bg-blue-400/10 text-blue-400 border border-blue-400/20",
  shipped:    "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20",
  delivered:  "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20",
  cancelled:  "bg-red-400/10 text-red-400 border border-red-400/20",
  refunded:   "bg-amber-400/10 text-amber-400 border border-amber-400/20",
};

export default async function OrdersPage() {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as Order[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-bold text-xl text-white">Orders</h1>
        <p className="text-sm text-white/45 mt-1">{orders.length} total orders</p>
      </div>

      <div className="bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04] bg-[#111113]">
              {["Order", "Customer", "Date", "Total", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const addr = order.shipping_address as { first_name?: string; last_name?: string };
              return (
                <tr key={order.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-white">#{order.order_number}</td>
                  <td className="px-4 py-3.5 text-white/70">
                    {addr?.first_name} {addr?.last_name}
                    {order.guest_email && <p className="text-xs text-white/30">{order.guest_email}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-white/40 text-xs">
                    {new Date(order.created_at).toLocaleDateString("en-NZ")}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-semibold text-white">
                    ${(order.total / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      STATUS_COLORS[order.status] ?? STATUS_COLORS.pending
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs text-[#4ade80] hover:text-[#86efac] font-medium transition-colors">
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
    </div>
  );
}
