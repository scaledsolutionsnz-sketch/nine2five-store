export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { ShoppingCart, Users, Package, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalOrders },
    { count: totalCustomers },
    { data: recentOrders },
    { data: lowStock },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, order_number, status, total, created_at, shipping_address")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("product_variants")
      .select("id, size, stock_quantity, product:product_id(name)")
      .lt("stock_quantity", 10)
      .order("stock_quantity", { ascending: true }),
  ]);

  const { data: revenueData } = await supabase
    .from("orders")
    .select("total")
    .in("status", ["processing", "shipped", "delivered"]);

  const totalRevenue = (revenueData ?? []).reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: "Total Orders", value: String(totalOrders ?? 0), icon: ShoppingCart, color: "text-[#16a34a]" },
    { label: "Customers", value: String(totalCustomers ?? 0), icon: Users, color: "text-blue-400" },
    { label: "Revenue", value: `$${(totalRevenue / 100).toFixed(2)}`, icon: TrendingUp, color: "text-amber-400" },
    { label: "Low Stock", value: String(lowStock?.length ?? 0), icon: Package, color: "text-rose-400" },
  ];

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-[#737373]/15 text-[#a3a3a3]",
    processing: "bg-blue-500/15 text-blue-400",
    shipped: "bg-[#16a34a]/15 text-[#16a34a]",
    delivered: "bg-emerald-500/15 text-emerald-400",
    cancelled: "bg-rose-500/15 text-rose-400",
    refunded: "bg-amber-500/15 text-amber-400",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl">Dashboard</h1>
        <p className="text-sm text-[#737373] mt-1">Welcome back, Wiremu.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-xl bg-[#141414] border border-[#1e1e1e]">
            <Icon className={`h-5 w-5 mb-3 ${color}`} />
            <p className="font-display font-bold text-2xl">{value}</p>
            <p className="text-xs text-[#737373] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="p-6 rounded-xl bg-[#141414] border border-[#1e1e1e]">
          <h2 className="font-display font-bold text-base mb-5">Recent Orders</h2>
          {(recentOrders ?? []).length === 0 ? (
            <p className="text-sm text-[#525252]">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {(recentOrders ?? []).map((order) => {
                const addr = order.shipping_address as { first_name?: string; last_name?: string };
                return (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                    <div>
                      <p className="text-sm font-medium">#{order.order_number} — {addr?.first_name} {addr?.last_name}</p>
                      <p className="text-xs text-[#525252]">{new Date(order.created_at).toLocaleDateString("en-NZ")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[order.status] ?? ""}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-display font-bold">${(order.total / 100).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="p-6 rounded-xl bg-[#141414] border border-[#1e1e1e]">
          <h2 className="font-display font-bold text-base mb-5">Low Stock Alerts</h2>
          {(lowStock ?? []).length === 0 ? (
            <p className="text-sm text-[#16a34a]">All stock levels OK</p>
          ) : (
            <div className="space-y-3">
              {(lowStock ?? []).map((v) => {
                const product = v.product as unknown as { name: string } | null;
                return (
                  <div key={v.id} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                    <div>
                      <p className="text-sm font-medium">{product?.name}</p>
                      <p className="text-xs text-[#525252]">Size {v.size}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${v.stock_quantity === 0 ? "bg-rose-500/15 text-rose-400" : "bg-amber-500/15 text-amber-400"}`}>
                      {v.stock_quantity} left
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
