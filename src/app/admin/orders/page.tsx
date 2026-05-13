export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Order } from "@/types/database";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-[#737373]/15 text-[#a3a3a3]",
  processing: "bg-blue-500/15 text-blue-400",
  shipped: "bg-[#16a34a]/15 text-[#16a34a]",
  delivered: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-rose-500/15 text-rose-400",
  refunded: "bg-amber-500/15 text-amber-400",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as Order[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl">Orders</h1>
        <p className="text-sm text-[#737373] mt-1">{orders.length} total orders</p>
      </div>

      <div className="rounded-xl bg-[#141414] border border-[#1e1e1e] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              {["Order", "Customer", "Date", "Items", "Total", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#525252]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const addr = order.shipping_address as { first_name?: string; last_name?: string };
              return (
                <tr key={order.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-display font-bold">#{order.order_number}</td>
                  <td className="px-4 py-3 text-[#a3a3a3]">
                    {addr?.first_name} {addr?.last_name}
                    {order.guest_email && <p className="text-xs text-[#525252]">{order.guest_email}</p>}
                  </td>
                  <td className="px-4 py-3 text-[#737373] text-xs">
                    {new Date(order.created_at).toLocaleDateString("en-NZ")}
                  </td>
                  <td className="px-4 py-3 text-[#737373]">—</td>
                  <td className="px-4 py-3 font-display font-bold">${(order.total / 100).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[order.status] ?? ""}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs text-[#16a34a] hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-16 text-[#525252]">
            <p>No orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
