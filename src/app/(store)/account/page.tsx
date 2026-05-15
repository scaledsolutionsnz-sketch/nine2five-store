import { createClient } from "@/lib/supabase/server";
import { ShoppingBag, Heart, Package } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/database";

const STATUS_STYLES: Record<string, string> = {
  processing: "bg-amber-500/10 text-amber-400",
  shipped: "bg-blue-500/10 text-blue-400",
  delivered: "bg-green-500/10 text-green-400",
  pending: "bg-[#1e1e1e] text-[#737373]",
  cancelled: "bg-red-500/10 text-red-400",
  refunded: "bg-purple-500/10 text-purple-400",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: customerRows }, { data: ordersData }, { count: wishlistCount }] = await Promise.all([
    supabase.rpc("get_my_customer"),
    supabase.rpc("get_my_orders"),
    supabase.from("wishlists").select("*", { count: "exact", head: true })
      .eq("customer_id", supabase.rpc("get_my_customer").then(() => "")),
  ]);

  // Fetch customer and orders properly
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("email", user!.email!)
    .single();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .eq("customer_id", customer?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: wlCount } = await supabase
    .from("wishlists")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", customer?.id ?? "");

  const recentOrders = (orders ?? []) as Order[];
  const firstName = customer?.first_name || user?.email?.split("@")[0] || "there";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">
          Kia ora, {firstName}
        </h1>
        <p className="text-sm text-[#737373] mt-1">Manage your orders, wishlist, and account details</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Orders", value: (orders ?? []).length, icon: ShoppingBag, href: "/account/orders" },
          { label: "Wishlist", value: wlCount ?? 0, icon: Heart, href: "/account/wishlist" },
          { label: "Lifetime Spend", value: `$${((customer?.lifetime_value_cents ?? 0) / 100).toFixed(0)}`, icon: Package, href: "/account/orders" },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="p-4 rounded-xl bg-[#141414] border border-[#1e1e1e] hover:border-[#16a34a]/30 transition-colors group"
          >
            <Icon className="h-4 w-4 text-[#404040] group-hover:text-[#16a34a] mb-2 transition-colors" />
            <p className="font-display font-bold text-xl text-white">{value}</p>
            <p className="text-xs text-[#525252] mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-base text-white">Recent Orders</h2>
          <Link href="/account/orders" className="text-xs text-[#16a34a] hover:underline">View all →</Link>
        </div>
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <ShoppingBag className="h-8 w-8 text-[#262626] mx-auto mb-3" />
              <p className="text-sm text-[#525252]">No orders yet</p>
              <Link href="/shop" className="inline-block mt-3 text-sm text-[#16a34a] hover:underline">
                Shop the collection →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#1a1a1a]">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">Order #{order.order_number}</p>
                    <p className="text-xs text-[#525252] mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-NZ", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
                    )}>
                      {order.status}
                    </span>
                    <p className="text-sm font-display font-semibold text-white">
                      ${(order.total / 100).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
