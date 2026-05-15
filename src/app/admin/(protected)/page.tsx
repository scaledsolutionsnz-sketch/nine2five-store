export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Package,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/database";

function fmt(cents: number) {
  return `$${(cents / 100).toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pct(a: number, b: number) {
  if (b === 0) return a > 0 ? 100 : 0;
  return Math.round(((a - b) / b) * 100);
}

const STATUS_STYLES: Record<string, string> = {
  processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-[#1e1e1e] text-[#737373] border-[#262626]",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default async function AdminDashboard() {
  const supabase = await createClient();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const [
    { data: todayOrders },
    { data: monthOrders },
    { data: lastMonthOrders },
    { count: totalCustomers },
    { count: newCustomers },
    { count: pendingOrders },
    { data: recentOrders },
    { data: lowStock },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", todayStart)
      .not("status", "in", "(cancelled,refunded)"),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", monthStart)
      .not("status", "in", "(cancelled,refunded)"),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", lastMonthStart)
      .lte("created_at", lastMonthEnd)
      .not("status", "in", "(cancelled,refunded)"),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthStart),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "processing"),
    supabase
      .from("orders")
      .select("id, order_number, status, total, created_at, guest_email, customer_id, customers(first_name, last_name, email)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("product_variants")
      .select("id, size, stock_quantity, products(name)")
      .lt("stock_quantity", 10)
      .order("stock_quantity"),
  ]);

  const revenueToday = (todayOrders ?? []).reduce((s, o) => s + o.total, 0);
  const revenueMonth = (monthOrders ?? []).reduce((s, o) => s + o.total, 0);
  const revenueLastMonth = (lastMonthOrders ?? []).reduce((s, o) => s + o.total, 0);
  const ordersToday = (todayOrders ?? []).length;
  const monthPct = pct(revenueMonth, revenueLastMonth);

  const typedRecentOrders = (recentOrders ?? []) as unknown as (Order & {
    customers?: { first_name: string; last_name: string; email: string } | null;
  })[];

  const typedLowStock = (lowStock ?? []) as unknown as {
    id: string;
    size: string;
    stock_quantity: number;
    products: { name: string } | null;
  }[];

  const metrics = [
    {
      label: "Revenue Today",
      value: fmt(revenueToday),
      sub: `${ordersToday} order${ordersToday !== 1 ? "s" : ""}`,
      icon: DollarSign,
      accent: true,
      warn: false,
    },
    {
      label: "Revenue This Month",
      value: fmt(revenueMonth),
      sub: `${monthPct >= 0 ? "+" : ""}${monthPct}% vs last month`,
      up: monthPct >= 0,
      icon: TrendingUp,
      accent: false,
      warn: false,
    },
    {
      label: "Total Customers",
      value: (totalCustomers ?? 0).toLocaleString(),
      sub: `+${newCustomers ?? 0} this month`,
      icon: Users,
      accent: false,
      warn: false,
    },
    {
      label: "Pending Fulfilment",
      value: (pendingOrders ?? 0).toString(),
      sub: (pendingOrders ?? 0) > 0 ? "Needs action" : "All clear",
      icon: Clock,
      accent: false,
      warn: (pendingOrders ?? 0) > 0,
    },
  ];

  return (
    <div className="max-w-6xl space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-white">Dashboard</h1>
          <p className="text-[13px] text-[#555] mt-0.5">
            {new Date().toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Link href="/admin/orders" className="flex items-center gap-1.5 text-xs font-semibold text-[#16a34a] hover:text-[#4ade80] transition-colors">
          View all orders <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={cn(
              "p-5 rounded-xl border relative overflow-hidden",
              m.accent
                ? "bg-[#16a34a]/[0.07] border-[#16a34a]/20"
                : m.warn
                ? "bg-amber-500/[0.05] border-amber-500/20"
                : "bg-[#111] border-white/[0.06]"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center",
                m.accent ? "bg-[#16a34a]/15" : m.warn ? "bg-amber-500/10" : "bg-white/[0.04]"
              )}>
                <m.icon className={cn("h-4 w-4", m.accent ? "text-[#16a34a]" : m.warn ? "text-amber-400" : "text-[#444]")} />
              </div>
            </div>
            <p className="font-display font-bold text-2xl text-white tracking-tight">{m.value}</p>
            <p className="text-[11px] text-[#444] font-medium mt-0.5">{m.label}</p>
            <div className="flex items-center gap-1 mt-2">
              {"up" in m && m.up !== undefined && (
                m.up
                  ? <ArrowUpRight className="h-3 w-3 text-[#16a34a]" />
                  : <ArrowDownRight className="h-3 w-3 text-rose-400" />
              )}
              <p className={cn(
                "text-[11px] font-medium",
                m.accent ? "text-[#16a34a]" : m.warn ? "text-amber-400" : "text-[#555]"
              )}>
                {m.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Recent orders */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[#404040]" />
              <h2 className="font-display font-semibold text-sm text-white">Recent Orders</h2>
            </div>
            <Link href="/admin/orders" className="text-xs text-[#16a34a] hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {typedRecentOrders.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#525252]">No orders yet</div>
            ) : (
              typedRecentOrders.map((order) => {
                const name = order.customers
                  ? `${order.customers.first_name} ${order.customers.last_name}`.trim()
                  : (order.guest_email?.split("@")[0] ?? "Guest");
                return (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        #{order.order_number} · {name}
                      </p>
                      <p className="text-xs text-[#525252] mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-NZ", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        STATUS_STYLES[order.status] ?? STATUS_STYLES.pending
                      )}>
                        {order.status}
                      </span>
                      <p className="text-sm font-display font-semibold text-white w-20 text-right">
                        {fmt(order.total)}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h2 className="font-display font-semibold text-sm text-white">Low Stock</h2>
            </div>
            <Link href="/admin/inventory" className="text-xs text-[#16a34a] hover:underline">
              Manage →
            </Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {typedLowStock.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Package className="h-6 w-6 text-[#16a34a] mx-auto mb-2" />
                <p className="text-sm text-[#525252]">All stock healthy</p>
              </div>
            ) : (
              typedLowStock.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{v.products?.name ?? "Unknown"}</p>
                    <p className="text-xs text-[#525252]">Size {v.size}</p>
                  </div>
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full shrink-0",
                    v.stock_quantity === 0
                      ? "bg-red-500/10 text-red-400"
                      : "bg-amber-500/10 text-amber-400"
                  )}>
                    {v.stock_quantity === 0 ? "Out" : `${v.stock_quantity} left`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
