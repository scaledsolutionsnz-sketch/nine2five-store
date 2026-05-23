export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { ShoppingBag, Package, TrendingUp, Users, Tag, Megaphone, ChevronRight } from "lucide-react";
import Link from "next/link";
import { LiveStats } from "./components/live-stats";
import { RefreshButton } from "./components/refresh-button";

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

// ─── Status map ──────────────────────────────────────────────────────────────

const STATUS: Record<string, { pay: string; fulfill: string; payStyle: React.CSSProperties; fulfillStyle: React.CSSProperties }> = {
  processing: {
    pay: "Paid",      fulfill: "Unfulfilled",
    payStyle: { background: "#dcfce7", color: "#166534" },
    fulfillStyle: { background: "#fef3c7", color: "#92400e" },
  },
  shipped: {
    pay: "Paid",      fulfill: "Fulfilled",
    payStyle: { background: "#dcfce7", color: "#166534" },
    fulfillStyle: { background: "#dbeafe", color: "#1e40af" },
  },
  delivered: {
    pay: "Paid",      fulfill: "Delivered",
    payStyle: { background: "#dcfce7", color: "#166534" },
    fulfillStyle: { background: "#dcfce7", color: "#166534" },
  },
  pending: {
    pay: "Unpaid",    fulfill: "Unfulfilled",
    payStyle: { background: "#fef3c7", color: "#92400e" },
    fulfillStyle: { background: "#fef3c7", color: "#92400e" },
  },
  cancelled: {
    pay: "Voided",    fulfill: "Cancelled",
    payStyle: { background: "#fee2e2", color: "#b91c1c" },
    fulfillStyle: { background: "#fee2e2", color: "#b91c1c" },
  },
  refunded: {
    pay: "Refunded",  fulfill: "Returned",
    payStyle: { background: "#f3f4f6", color: "#6b7280" },
    fulfillStyle: { background: "#f3f4f6", color: "#6b7280" },
  },
};

const BADGE_BASE: React.CSSProperties = {
  display: "inline-flex",
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const supabase = await createServiceClient();
  const now = new Date();

  const { data: authData } = await supabase.auth.getUser();
  const meta = authData?.user?.user_metadata;
  const firstName = (meta?.full_name ?? meta?.name ?? authData?.user?.email ?? "")
    .split(/[\s@]/)[0]
    .replace(/^./, (c: string) => c.toUpperCase());

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

  const metrics = [
    { label: "Revenue",       value: money(revMon),           change: revPct,  todayV: moneyShort(revToday), yestV: moneyShort(revYest) },
    { label: "Orders",        value: ordMon.toLocaleString(), change: ordPct,  todayV: todayOs.length.toString(), yestV: yestOs.length.toString() },
    { label: "Avg Order",     value: money(avgMon),           change: avgPct,  todayV: avgToday > 0 ? moneyShort(avgToday) : "—", yestV: avgYest > 0 ? moneyShort(avgYest) : "—" },
    { label: "New Customers", value: (newCust ?? 0).toLocaleString(), change: custPct, todayV: "—", yestV: "—" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#06150C", color: "#f8f8f2", padding: "32px 28px" }}>
      <style>{`
        @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px)  { .stats-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 900px)  { .main-grid  { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px)  { .actions-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px)  { .live-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 6, fontSize: 14 }}>
            {now.toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {(pending ?? 0) > 0 && (
              <span style={{ marginLeft: 8, color: "#fbbf24" }}>
                · {pending} order{pending !== 1 ? "s" : ""} pending
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <RefreshButton />
          <Link
            href="/admin/orders"
            style={{ height: 42, padding: "0 20px", borderRadius: 999, background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 700, fontSize: 13, border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
          >
            <ShoppingBag style={{ width: 14, height: 14 }} strokeWidth={1.8} />
            Orders
          </Link>
          <Link
            href="/admin/inventory"
            style={{ height: 42, padding: "0 20px", borderRadius: 999, background: "#2f9b2f", color: "#fff", fontWeight: 900, fontSize: 13, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", letterSpacing: "0.08em" }}
          >
            <Package style={{ width: 14, height: 14 }} strokeWidth={1.8} />
            Inventory
          </Link>
        </div>
      </div>

      {/* ── Live stats ── */}
      <LiveStats initialOrdersToday={todayOs.length} initialOrdersMonth={ordMon} />

      {/* ── Stat cards ── */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 18, marginBottom: 24 }}>
        {metrics.map(({ label, value, change, todayV, yestV }) => {
          const up = change >= 0;
          return (
            <div
              key={label}
              style={{ background: "#f7f8f4", color: "#111827", borderRadius: 18, padding: "20px 22px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
            >
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b" }}>{label}</p>
              <p style={{ fontSize: 30, fontWeight: 900, color: "#111827", marginTop: 8 }}>{value}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 800,
                  background: up ? "#dcfce7" : "#fee2e2",
                  color: up ? "#166534" : "#b91c1c",
                }}>
                  {up ? "▲" : "▼"} {Math.abs(change)}%
                </span>
                <span style={{ fontSize: 12, color: "#6b7280" }}>vs last month</span>
              </div>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                <span style={{ fontWeight: 700, color: "#334155" }}>{todayV}</span> today · {yestV} yesterday
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Orders + Low stock ── */}
      <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, marginBottom: 24 }}>

        {/* Recent Orders table */}
        <div style={{ background: "#f7f8f4", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>Recent Orders</p>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Last {orders.length} transactions</p>
            </div>
            <Link href="/admin/orders" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "#2f9b2f", fontWeight: 700, textDecoration: "none" }}>
              View all <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "#94a3b8", fontSize: 14 }}>No orders yet</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead style={{ background: "#eaf2fb" }}>
                  <tr>
                    {["Order", "Date", "Customer", "Payment", "Fulfillment", "Total"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 800, color: "#334155", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const name  = order.customers
                      ? `${order.customers.first_name} ${order.customers.last_name}`.trim()
                      : (order.guest_email?.split("@")[0] ?? "Guest");
                    const email = order.customers?.email ?? order.guest_email ?? "";
                    const st = STATUS[order.status] ?? STATUS.pending;
                    return (
                      <tr key={order.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                          <Link href={`/admin/orders/${order.id}`} style={{ color: "#111827", fontWeight: 800, fontSize: 13, textDecoration: "none", fontFamily: "monospace" }}>
                            #{order.order_number}
                          </Link>
                        </td>
                        <td style={{ padding: "13px 16px", color: "#6b7280", whiteSpace: "nowrap", verticalAlign: "middle", fontSize: 13 }}>
                          {new Date(order.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                        </td>
                        <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#334155", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                          <p style={{ fontSize: 12, color: "#9ca3af", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{email}</p>
                        </td>
                        <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                          <span style={{ ...BADGE_BASE, ...st.payStyle }}>{st.pay}</span>
                        </td>
                        <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                          <span style={{ ...BADGE_BASE, ...st.fulfillStyle }}>{st.fulfill}</span>
                        </td>
                        <td style={{ padding: "13px 16px", verticalAlign: "middle", fontFamily: "monospace", fontWeight: 800, color: "#111827" }}>
                          {money(order.total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low stock panel */}
        <div style={{ background: "#f7f8f4", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>Low Stock</p>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Below 10 units</p>
            </div>
            <Link href="/admin/inventory" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "#2f9b2f", fontWeight: 700, textDecoration: "none" }}>
              Manage <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
          {stocks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 24px" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Package style={{ width: 20, height: 20, color: "#166534" }} strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>All stock healthy</p>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>No variants below 10 units</p>
            </div>
          ) : (
            <div>
              {stocks.map((v, i) => (
                <div
                  key={v.id}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: i < stocks.length - 1 ? "1px solid #e5e7eb" : "none" }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.products?.name ?? "Unknown"}</p>
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Size {v.size}</p>
                  </div>
                  <span style={{
                    ...BADGE_BASE,
                    marginLeft: 12,
                    flexShrink: 0,
                    ...(v.stock_quantity === 0
                      ? { background: "#fee2e2", color: "#b91c1c" }
                      : { background: "#fef3c7", color: "#92400e" }),
                  }}>
                    {v.stock_quantity === 0 ? "Out of stock" : `${v.stock_quantity} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="actions-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        {[
          { href: "/admin/inventory", label: "Update inventory", sub: "Adjust stock levels",  icon: Package,   iconBg: "#1a3d25", iconColor: "#4ade80" },
          { href: "/admin/discounts", label: "Create discount",  sub: "New promo code",        icon: Tag,       iconBg: "#2d1d4a", iconColor: "#a78bfa" },
          { href: "/admin/campaigns", label: "Email campaign",   sub: "Send to customers",     icon: Megaphone, iconBg: "#3d2a0a", iconColor: "#fbbf24" },
        ].map(({ href, label, sub, icon: Icon, iconBg, iconColor }) => (
          <Link
            key={href}
            href={href}
            style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 16, background: "rgba(8,28,16,0.92)", border: "1px solid rgba(255,255,255,0.10)", textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
          >
            <div style={{ height: 40, width: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon style={{ width: 18, height: 18, color: iconColor }} strokeWidth={1.8} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>{label}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{sub}</p>
            </div>
            <ChevronRight style={{ width: 16, height: 16, color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
