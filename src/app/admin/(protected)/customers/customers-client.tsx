"use client";

import { useState, useMemo } from "react";
import { Users, TrendingUp, Mail, RotateCcw, Search } from "lucide-react";

export interface CustomerRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  accepts_marketing: boolean;
  order_count: number;
  last_order_at: string | null;
  ltv_cents: number;
  created_at: string;
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

type Segment = "all" | "repeat" | "subscribed" | "lapsed";

export function CustomersClient({ customers }: { customers: CustomerRow[] }) {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<Segment>("all");

  const repeatCount     = customers.filter(c => c.order_count > 1).length;
  const subscribedCount = customers.filter(c => c.accepts_marketing).length;
  const lapsedCount     = customers.filter(c => c.last_order_at && daysSince(c.last_order_at) > 60).length;
  const totalLtv        = customers.reduce((s, c) => s + c.ltv_cents, 0);
  const repeatRate      = customers.length > 0 ? Math.round((repeatCount / customers.length) * 100) : 0;

  const filtered = useMemo(() => {
    let list = customers;
    if (segment === "repeat")     list = list.filter(c => c.order_count > 1);
    if (segment === "subscribed") list = list.filter(c => c.accepts_marketing);
    if (segment === "lapsed")     list = list.filter(c => c.last_order_at && daysSince(c.last_order_at) > 60);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.email.toLowerCase().includes(q) ||
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [customers, segment, search]);

  const CARD: React.CSSProperties = {
    padding: "20px 22px", borderRadius: 16,
    background: "rgba(8,28,16,0.92)",
    border: "1px solid rgba(255,255,255,0.09)",
  };

  const TABS: { key: Segment; label: string; count: number; color: string }[] = [
    { key: "all",        label: "All",        count: customers.length, color: "#6B7280" },
    { key: "repeat",     label: "Repeat",     count: repeatCount,      color: "#2f9b2f" },
    { key: "subscribed", label: "Subscribed", count: subscribedCount,  color: "#3B82F6" },
    { key: "lapsed",     label: "Lapsed 60d", count: lapsedCount,      color: "#F59E0B" },
  ];

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { label: "Total Customers", value: customers.length.toLocaleString(), icon: Users,       color: "#60A5FA" },
          { label: "Repeat Rate",     value: `${repeatRate}%`,                  icon: RotateCcw,   color: "#2f9b2f" },
          { label: "Subscribed",      value: subscribedCount.toLocaleString(),  icon: Mail,        color: "#A78BFA" },
          { label: "Total Revenue",   value: fmt(totalLtv),                     icon: TrendingUp,  color: "#FBBF24" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={CARD}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{label}</p>
              <Icon style={{ width: 14, height: 14, color }} strokeWidth={1.8} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Segments + Search */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setSegment(t.key)}
              style={{
                height: 32, padding: "0 14px", borderRadius: 9999, fontSize: 12, fontWeight: 700,
                border: "1px solid",
                borderColor: segment === t.key ? t.color : "rgba(255,255,255,0.1)",
                background: segment === t.key ? `${t.color}22` : "transparent",
                color: segment === t.key ? t.color : "rgba(255,255,255,0.45)",
                cursor: "pointer", transition: "all 0.15s",
              }}>
              {t.label} <span style={{ opacity: 0.7 }}>({t.count})</span>
            </button>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email…"
            style={{
              height: 34, paddingLeft: 34, paddingRight: 14, borderRadius: 9999, fontSize: 13,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", outline: "none", width: 220,
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ borderRadius: 18, overflow: "hidden", background: "rgba(8,28,16,0.92)", border: "1px solid rgba(255,255,255,0.09)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Customer", "Email", "Orders", "Lifetime Value", "Last Order", "Subscribed"].map(h => (
                  <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "48px 18px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No customers found.</td></tr>
              )}
              {filtered.map((c, i) => {
                const isLapsed = c.last_order_at && daysSince(c.last_order_at) > 60;
                const isRepeat = c.order_count > 1;
                return (
                  <tr key={c.id} style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.06)" : undefined }}>
                    <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(47,155,47,0.15)", border: "1px solid rgba(47,155,47,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#2f9b2f", flexShrink: 0 }}>
                          {c.first_name?.[0]?.toUpperCase()}{c.last_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: "#fff" }}>{c.first_name} {c.last_name}</p>
                          {isRepeat && <span style={{ fontSize: 10, fontWeight: 700, color: "#2f9b2f", letterSpacing: "0.1em" }}>REPEAT</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px", color: "rgba(255,255,255,0.6)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</td>
                    <td style={{ padding: "14px 18px", textAlign: "center", fontFamily: "monospace", color: c.order_count > 0 ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: 700 }}>{c.order_count}</td>
                    <td style={{ padding: "14px 18px", fontFamily: "monospace", fontWeight: 700, color: c.ltv_cents > 0 ? "#2f9b2f" : "rgba(255,255,255,0.3)" }}>{fmt(c.ltv_cents)}</td>
                    <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                      {c.last_order_at ? (
                        <span style={{ color: isLapsed ? "#F59E0B" : "rgba(255,255,255,0.55)", fontSize: 12 }}>
                          {new Date(c.last_order_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
                          {isLapsed && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: "#F59E0B" }}>LAPSED</span>}
                        </span>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "center" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 9999,
                        fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                        background: c.accepts_marketing ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)",
                        color: c.accepts_marketing ? "#60A5FA" : "rgba(255,255,255,0.25)",
                      }}>
                        {c.accepts_marketing ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{filtered.length} of {customers.length} customers</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Repeat rate: <span style={{ color: "#2f9b2f", fontWeight: 700 }}>{repeatRate}%</span></p>
        </div>
      </div>
    </div>
  );
}
