export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/database";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-gray-100 text-gray-500 border-gray-200",
  processing: "bg-blue-50 text-blue-600 border-blue-100",
  shipped:    "bg-green-50 text-green-600 border-green-100",
  delivered:  "bg-emerald-50 text-emerald-600 border-emerald-100",
  cancelled:  "bg-red-50 text-red-500 border-red-100",
  refunded:   "bg-amber-50 text-amber-600 border-amber-100",
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
        <h1 className="font-display font-bold text-2xl text-gray-900">Orders</h1>
        <p className="text-sm text-gray-400 mt-1">{orders.length} total orders</p>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Order", "Customer", "Date", "Total", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const addr = order.shipping_address as { first_name?: string; last_name?: string };
              return (
                <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 font-display font-bold text-gray-900">#{order.order_number}</td>
                  <td className="px-4 py-3.5 text-gray-700">
                    {addr?.first_name} {addr?.last_name}
                    {order.guest_email && <p className="text-xs text-gray-400">{order.guest_email}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs">
                    {new Date(order.created_at).toLocaleDateString("en-NZ")}
                  </td>
                  <td className="px-4 py-3.5 font-display font-semibold text-gray-900">
                    ${(order.total / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                      STATUS_COLORS[order.status] ?? STATUS_COLORS.pending
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs text-[#16a34a] hover:underline font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">No orders yet.</div>
        )}
      </div>
    </div>
  );
}
