export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import {
  ArrowUpRight, ArrowDownRight, ShoppingBag, Users,
  DollarSign, Package, ChevronRight, TrendingUp,
  Tag, Megaphone,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function money(cents: number) {
  return `$${(cents / 100).toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function moneyShort(cents: number) {
  const v = cents / 100;
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return v > 0 ? `$${v.toFixed(0)}` : "$0";
}
function pct(a: number, b: number) {
  if (b === 0) return a > 0 ? 100 : 0;
  return Math.round(((a - b) / b) * 100);
}

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ data, up = true }: { data: number[]; up?: boolean }) {
  if (data.length < 2) return <div style={{ height: 48 }} />;
  const mx = Math.max(...data, 1), mn = Math.min(...data), rng = mx - mn || 1;
  const W = 180, H = 48, pad = 5;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - pad - ((v - mn) / rng) * (H - pad * 2),
  }));
  const line  = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area  = [`0,${H}`, ...pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`), `${W},${H}`].join(" ");
  const color = up ? "#116DFF" : "#EF4444";
  const fill  = up ? "rgba(17,109,255,0.06)" : "rgba(239,68,68,0.06)";
  const last  = pts[pts.length - 1];
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="overflow-visible">
      <polygon points={area} fill={fill} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="2.5" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  );
}

// ─── Status map ──────────────────────────────────────────────────────────────

const STATUS: Record<string, { pay: string; fulfill: string; payCls: string; fulfillCls: string }> = {
  processing: { pay: "Paid",      fulfill: "Unfulfilled", payCls: "bg-[#CDEEDC] text-[#166B3B]",     fulfillCls: "bg-[#FEF3C7] text-[#92400E]" },
  shipped:    { pay: "Paid",      fulfill: "Fulfilled",   payCls: "bg-[#CDEEDC] text-[#166B3B]",     fulfillCls: "bg-[#DBEAFE] text-[#1E40AF]" },
  delivered:  { pay: "Paid",      fulfill: "Delivered",   payCls: "bg-[#CDEEDC] text-[#166B3B]",     fulfillCls: "bg-[#CDEEDC] text-[#166B3B]" },
  pending:    { pay: "Unpaid",    fulfill: "Unfulfilled", payCls: "bg-[#FEF3C7] text-[#92400E]",     fulfillCls: "bg-[#FEF3C7] text-[#92400E]" },
  cancelled:  { pay: "Voided",   fulfill: "Cancelled",   payCls: "bg-[#FEE2E2] text-[#991B1B]",     fulfillCls: "bg-[#FEE2E2] text-[#991B1B]" },
  refunded:   { pay: "Refunded", fulfill: "Returned",    payCls: "bg-[#F3F4F6] text-[#6B7280]",     fulfillCls: "bg-[#F3F4F6] text-[#6B7280]" },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const supabase = await createServiceClient();
  const now = new Date();

  const todayStart     = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
  const monthStart     = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
  const thirtyDaysAgo  = new Date(now.getTime() - 30 * 86_400_000).toISOString();

  const [
    { data: raw30 },
    { data: lastMonthRaw },
    { count: newCust },
    { count: lastCust },
    { count: pending },
    { data: recent },
    { data: lowStock },
  ] = await Promise.all([
    supabase.from("orders").select("created_at, total, status").gte("created_at", thirtyDaysAgo).order("created_at"),
    supabase.from("orders").select("total").gte("created_at", lastMonthStart).lte("created_at", lastMonthEnd).not("status", "in", "(cancelled,refunded)"),
    supabase.from("customers").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
    supabase.from("customers").select("*", { count: "exact", head: true }).gte("created_at", lastMonthStart).lte("created_at", lastMonthEnd),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "processing"),
    supabase.from("orders").select("id, order_number, status, total, created_at, guest_email, customer_id, customers(first_name, last_name, email)").order("created_at", { ascending: false }).limit(10),
    supabase.from("product_variants").select("id, size, stock_quantity, products(name)").lt("stock_quantity", 10).order("stock_quantity"),
  ]);

  const valid30 = (raw30 ?? []).filter(o => o.status !== "cancelled" && o.status !== "refunded");

  // daily map for sparklines
  const daily = new Map<string, { rev: number; cnt: number }>();
  for (const o of valid30) {
    const d = o.created_at.slice(0, 10);
    const e = daily.get(d) ?? { rev: 0, cnt: 0 };
    e.rev += o.total; e.cnt += 1;
    daily.set(d, e);
  }
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now.getTime() - (13 - i) * 86_400_000);
    return daily.get(d.toISOString().slice(0, 10)) ?? { rev: 0, cnt: 0 };
  });

  const todayTs = new Date(todayStart).getTime();
  const yestTs  = new Date(yesterdayStart).getTime();
  const monTs   = new Date(monthStart).getTime();

  const todayOs = valid30.filter(o => new Date(o.created_at).getTime() >= todayTs);
  const yestOs  = valid30.filter(o => { const t = new Date(o.created_at).getTime(); return t >= yestTs && t < todayTs; });
  const monOs   = valid30.filter(o => new Date(o.created_at).getTime() >= monTs);

  const revToday = todayOs.reduce((s, o) => s + o.total, 0);
  const revYest  = yestOs.reduce((s, o) => s + o.total, 0);
  const revMon   = monOs.reduce((s, o) => s + o.total, 0);
  const revLast  = (lastMonthRaw ?? []).reduce((s, o) => s + o.total, 0);

  const ordMon  = monOs.length;
  const ordLast = (lastMonthRaw ?? []).length;
  const avgMon  = ordMon  > 0 ? Math.round(revMon  / ordMon)  : 0;
  const avgLast = ordLast > 0 ? Math.round(revLast / ordLast) : 0;
  const avgToday = todayOs.length > 0 ? Math.round(revToday / todayOs.length) : 0;
  const avgYest  = yestOs.length  > 0 ? Math.round(revYest  / yestOs.length)  : 0;

  const revPct  = pct(revMon, revLast);
  const ordPct  = pct(ordMon, ordLast);
  const avgPct  = pct(avgMon, avgLast);
  const custPct = pct(newCust ?? 0, lastCust ?? 0);

  type Order = {
    id: string; order_number: number; status: string; total: number;
    created_at: string; guest_email: string | null; customer_id: string | null;
    customers: { first_name: string; last_name: string; email: string } | null;
  };
  type Stock = { id: string; size: string; stock_quantity: number; products: { name: string } | null };

  const orders = (recent   ?? []) as unknown as Order[];
  const stocks = (lowStock ?? []) as unknown as Stock[];

  void pending;

  const metrics = [
    { label: "Revenue",       value: money(revMon),           change: revPct,  todayV: moneyShort(revToday),  yestV: moneyShort(revYest),  sparkline: last14.map(d => d.rev), icon: DollarSign, primary: true },
    { label: "Orders",        value: ordMon.toLocaleString(), change: ordPct,  todayV: todayOs.length.toString(), yestV: yestOs.length.toString(), sparkline: last14.map(d => d.cnt), icon: ShoppingBag, primary: false },
    { label: "Avg. Order",    value: money(avgMon),           change: avgPct,  todayV: avgToday > 0 ? moneyShort(avgToday) : "—", yestV: avgYest > 0 ? moneyShort(avgYest) : "—", sparkline: last14.map(d => d.cnt > 0 ? Math.round(d.rev / d.cnt) : 0), icon: TrendingUp, primary: false },
    { label: "New Customers", value: (newCust ?? 0).toLocaleString(), change: custPct, todayV: "—", yestV: "—", sparkline: [lastCust ?? 0, newCust ?? 0], icon: Users, primary: false },
  ];

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#1F2937] tracking-tight leading-none">
            Welcome back, Wiremu
          </h2>
          <p className="text-[14px] text-[#6B7280] mt-2 font-normal">
            {now.toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 h-9 px-4 rounded-full bg-white border border-[#E2E7EF] text-[#334155] text-[13px] font-medium hover:bg-[#F6FAFF] transition-all"
          >
            <ShoppingBag style={{ width: 14, height: 14 }} strokeWidth={1.8} />
            Orders
          </Link>
          <Link
            href="/admin/inventory"
            className="flex items-center gap-2 h-9 px-4 rounded-full text-[13px] font-semibold text-white bg-[#116DFF] hover:bg-[#0D5FE0] transition-all"
          >
            <Package style={{ width: 14, height: 14 }} strokeWidth={1.8} />
            Inventory
          </Link>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {metrics.map(({ label, value, change, todayV, yestV, sparkline, icon: Icon, primary }) => {
          const up = change >= 0;
          return (
            <div
              key={label}
              className="rounded-xl bg-white border border-[#E2E7EF] p-6"
              style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)", borderTop: primary ? "2px solid #116DFF" : undefined }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F3F5F8] flex items-center justify-center">
                    <Icon style={{ width: 13, height: 13, color: primary ? "#116DFF" : "#6B7280" }} strokeWidth={1.8} />
                  </div>
                  <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-widest">{label}</p>
                </div>
                <span className={cn(
                  "flex items-center gap-0.5 text-[11px] font-semibold px-2 py-1 rounded-lg",
                  up ? "bg-[#CDEEDC] text-[#166B3B]" : "bg-[#FEE2E2] text-[#991B1B]"
                )}>
                  {up ? <ArrowUpRight style={{ width: 12, height: 12 }} /> : <ArrowDownRight style={{ width: 12, height: 12 }} />}
                  {Math.abs(change)}%
                </span>
              </div>
              <p className="text-[28px] font-bold text-[#1F2937] tracking-tight leading-none mb-5 font-mono">
                {value}
              </p>
              <Sparkline data={sparkline} up={up} />
              <p className="text-[12px] text-[#6B7280] mt-3">
                <span className="font-semibold text-[#334155]">{todayV}</span> today
                &nbsp;·&nbsp;
                <span>{yestV}</span> yesterday
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Orders + Low stock ── */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">

        {/* Recent orders */}
        <div className="rounded-xl bg-white border border-[#E2E7EF] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E7EF]">
            <div>
              <h3 className="text-[15px] font-semibold text-[#1F2937] leading-none">Recent Orders</h3>
              <p className="text-[12px] text-[#6B7280] mt-1">Last {orders.length} transactions</p>
            </div>
            <Link href="/admin/orders" className="flex items-center gap-1 text-[13px] text-[#116DFF] hover:text-[#0D5FE0] font-semibold transition-colors">
              View all <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F3F5F8] border border-[#E2E7EF] flex items-center justify-center mb-4">
                <ShoppingBag style={{ width: 24, height: 24, color: "#C4CAD4" }} strokeWidth={1.5} />
              </div>
              <p className="text-[14px] font-medium text-[#6B7280]">No orders yet</p>
              <p className="text-[13px] text-[#8A94A6] mt-1">Orders will appear here as they come in</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: "#EAF2FF", borderBottom: "1px solid #BBD3FF" }}>
                  {[
                    { label: "Order",       cls: "pl-6 pr-4 h-[52px] text-left" },
                    { label: "Date",        cls: "px-4 h-[52px] text-left hidden sm:table-cell" },
                    { label: "Customer",    cls: "px-4 h-[52px] text-left" },
                    { label: "Payment",     cls: "px-4 h-[52px] text-left hidden lg:table-cell" },
                    { label: "Fulfillment", cls: "px-4 h-[52px] text-left hidden lg:table-cell" },
                    { label: "Total",       cls: "pl-4 pr-6 h-[52px] text-right" },
                  ].map(h => (
                    <th key={h.label} className={cn(h.cls, "text-[14px] font-medium text-[#1F2D3D] whitespace-nowrap")}>
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const name  = order.customers ? `${order.customers.first_name} ${order.customers.last_name}`.trim() : (order.guest_email?.split("@")[0] ?? "Guest");
                  const email = order.customers?.email ?? order.guest_email ?? "";
                  const st    = STATUS[order.status] ?? STATUS.pending;
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-[#E5EAF1] last:border-0 hover:bg-[#F6FAFF] transition-colors group relative"
                    >
                      <td className="pl-6 pr-4 py-4">
                        <Link href={`/admin/orders/${order.id}`} className="absolute inset-0 z-0" />
                        <span className="relative z-10 text-[14px] font-semibold text-[#1F2937] font-mono">
                          #{order.order_number}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell relative z-10">
                        <span className="text-[13px] text-[#6B7280] whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                        </span>
                      </td>
                      <td className="px-4 py-4 relative z-10">
                        <p className="text-[13px] font-medium text-[#334155] truncate max-w-[160px]">{name}</p>
                        <p className="text-[12px] text-[#8A94A6] truncate max-w-[160px] mt-0.5">{email}</p>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell relative z-10">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded text-[13px] font-medium", st.payCls)}>{st.pay}</span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell relative z-10">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded text-[13px] font-medium", st.fulfillCls)}>{st.fulfill}</span>
                      </td>
                      <td className="pl-4 pr-6 py-4 text-right relative z-10">
                        <span className="text-[14px] font-semibold text-[#1F2937] font-mono">{money(order.total)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Low stock */}
        <div className="rounded-xl bg-white border border-[#E2E7EF] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E7EF]">
            <div>
              <h3 className="text-[15px] font-semibold text-[#1F2937] leading-none">Low Stock</h3>
              <p className="text-[12px] text-[#6B7280] mt-1">Below 10 units</p>
            </div>
            <Link href="/admin/inventory" className="flex items-center gap-1 text-[13px] text-[#116DFF] hover:text-[#0D5FE0] font-semibold transition-colors">
              Manage <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {stocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-[#CDEEDC] flex items-center justify-center mb-3">
                <Package style={{ width: 20, height: 20, color: "#166B3B" }} strokeWidth={1.5} />
              </div>
              <p className="text-[14px] font-medium text-[#334155]">All stock healthy</p>
              <p className="text-[13px] text-[#6B7280] mt-1">No variants below 10 units</p>
            </div>
          ) : (
            <div>
              {stocks.map((v, i) => (
                <div
                  key={v.id}
                  className={cn(
                    "flex items-center justify-between px-6 py-4 hover:bg-[#F6FAFF] transition-colors",
                    i < stocks.length - 1 && "border-b border-[#E5EAF1]"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[#334155] truncate">{v.products?.name ?? "Unknown"}</p>
                    <p className="text-[12px] text-[#6B7280] mt-0.5">Size {v.size}</p>
                  </div>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded text-[13px] font-medium ml-4 shrink-0",
                    v.stock_quantity === 0
                      ? "bg-[#FEE2E2] text-[#991B1B]"
                      : "bg-[#FEF3C7] text-[#92400E]"
                  )}>
                    {v.stock_quantity === 0 ? "Out of stock" : `${v.stock_quantity} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { href: "/admin/inventory", label: "Update inventory", sub: "Adjust stock levels",  icon: Package,   iconColor: "#116DFF",  iconBg: "bg-[#EAF2FF]" },
          { href: "/admin/discounts", label: "Create discount",  sub: "New promo code",        icon: Tag,       iconColor: "#7C3AED",  iconBg: "bg-[#EDE9FE]" },
          { href: "/admin/campaigns", label: "Email campaign",   sub: "Send to customers",     icon: Megaphone, iconColor: "#D97706",  iconBg: "bg-[#FEF3C7]" },
        ].map(({ href, label, sub, icon: Icon, iconColor, iconBg }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 p-5 rounded-xl bg-white border border-[#E2E7EF] hover:border-[#116DFF]/30 hover:bg-[#F6FAFF] transition-all duration-150"
            style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
          >
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
              <Icon style={{ width: 18, height: 18, color: iconColor }} strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#334155] group-hover:text-[#1F2937] transition-colors">{label}</p>
              <p className="text-[12px] text-[#6B7280] mt-0.5">{sub}</p>
            </div>
            <ChevronRight className="text-[#C4CAD4] group-hover:text-[#6B7280] transition-colors shrink-0" style={{ width: 16, height: 16 }} />
          </Link>
        ))}
      </div>

    </div>
  );
}
