import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/database";

const STATUS_STYLES: Record<string, string> = {
  processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-white/[0.05] text-white/40 border-white/[0.08]",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: customer } = await supabase
    .from("customers").select("id").eq("email", user!.email!).single();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, subtotal, shipping_cost, created_at, tracking_number")
    .eq("customer_id", customer?.id ?? "")
    .order("created_at", { ascending: false });

  const typedOrders = (orders ?? []) as Order[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl text-white mb-8">Order History</h1>
        <p className="text-white/40 text-sm -mt-6">{typedOrders.length} order{typedOrders.length !== 1 ? "s" : ""}</p>
      </div>

      {typedOrders.length === 0 ? (
        <div className="bg-[#192d1e] border border-white/[0.08] rounded-2xl px-5 py-16 text-center">
          <ShoppingBag className="h-10 w-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-4">You haven&apos;t placed any orders yet</p>
          <Link
            href="/shop"
            className="bg-[#3a7722] text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#4d9e2e] transition-all duration-300 inline-block"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {typedOrders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block bg-[#192d1e] border border-white/[0.08] rounded-2xl px-5 py-4 hover:border-[#3a7722]/20 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-semibold text-white group-hover:text-[#3a7722] transition-colors">
                    Order #{order.order_number}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {new Date(order.created_at).toLocaleDateString("en-NZ", {
                      weekday: "short", day: "numeric", month: "long", year: "numeric"
                    })}
                  </p>
                  {order.tracking_number && (
                    <p className="text-xs text-[#3a7722] mt-1">
                      Tracking: {order.tracking_number}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-white">${(order.total / 100).toFixed(2)}</p>
                  <span className={cn(
                    "inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
                  )}>
                    {order.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
