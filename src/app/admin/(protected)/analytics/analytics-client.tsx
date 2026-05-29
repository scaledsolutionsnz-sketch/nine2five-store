"use client";

export interface DayRevenue    { day: string; revenue_cents: number; order_count: number; }
export interface TopProduct    { product_name: string; revenue_cents: number; units_sold: number; }
export interface RegionRow     { region: string; revenue_cents: number; order_count: number; }
export interface ConversionSummary {
  total_orders: number;
  total_revenue_cents: number;
  avg_order_cents: number;
  orders_with_discount: number;
  orders_with_affiliate: number;
  discount_savings_cents: number;
}
export interface AnalyticsPixelStatus {
  metaPixelId: string | null;
  ga4Id: string | null;
  tiktokPixelId: string | null;
}

// ─── Revenue Line Chart ───────────────────────────────────────────────────────

function RevenueChart({ data }: { data: DayRevenue[] }) {
  const W = 800, H = 300, PADX = 56, PADY = 16, PADB = 32;
  const chartW = W - PADX;
  const chartH = H - PADY - PADB;

  const values = data.map((d) => d.revenue_cents);
  const maxVal = Math.max(...values, 1);
  const step   = chartW / Math.max(data.length - 1, 1);

  const toX = (i: number) => PADX + i * step;
  const toY = (v: number) => PADY + chartH - (v / maxVal) * chartH;

  const linePts = data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.revenue_cents).toFixed(1)}`).join(" ");
  const areaPts = [
    `${toX(0).toFixed(1)},${(PADY + chartH).toFixed(1)}`,
    ...data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.revenue_cents).toFixed(1)}`),
    `${toX(data.length - 1).toFixed(1)},${(PADY + chartH).toFixed(1)}`,
  ].join(" ");

  const labelStep = Math.ceil(data.length / 6);
  const labelIdx  = data.reduce<number[]>((acc, _, i) => {
    if (i === 0 || i === data.length - 1 || i % labelStep === 0) acc.push(i);
    return acc;
  }, []);

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const formatDay = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-NZ", { day: "numeric", month: "short" });
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", overflow: "visible" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2f9b2f" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2f9b2f" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((t) => {
        const y = PADY + chartH - t * chartH;
        return (
          <g key={t}>
            <line x1={PADX} y1={y} x2={W} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={PADX - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8" fontFamily="ui-monospace, monospace">
              ${((maxVal * t) / 100).toFixed(0)}
            </text>
          </g>
        );
      })}

      <polygon points={areaPts} fill="url(#areaGrad)" />
      <polyline points={linePts} fill="none" stroke="#2f9b2f" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {data.map((d, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(d.revenue_cents)} r="3" fill="#2f9b2f" stroke="#FFFFFF" strokeWidth="1.5" />
          <title>${(d.revenue_cents / 100).toFixed(2)} · {d.order_count} orders · {formatDay(d.day)}</title>
        </g>
      ))}

      {labelIdx.map((i) => (
        <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize="11" fill="#64748b" fontFamily="ui-monospace, monospace">
          {formatDay(data[i].day)}
        </text>
      ))}
    </svg>
  );
}

// ─── Horizontal bar chart ─────────────────────────────────────────────────────

function HBarChart({ rows, format }: { rows: { label: string; value: number }[]; format: (v: number) => string }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {rows.map((row, i) => {
        const p = (row.value / max) * 100;
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#334155", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>{row.label}</span>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 700, flexShrink: 0, fontFamily: "monospace" }}>{format(row.value)}</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "#e5e7eb", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, background: "#2f9b2f", width: `${p}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Pixel card ───────────────────────────────────────────────────────────────

function PixelCard({ name, configured, id, guide }: { name: string; configured: boolean; id: string; guide: string }) {
  return (
    <div style={{
      padding: 20,
      borderRadius: 14,
      border: configured ? "1px solid rgba(47,155,47,0.4)" : "1px solid rgba(255,255,255,0.10)",
      background: configured ? "rgba(47,155,47,0.08)" : "rgba(8,28,16,0.6)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: "#ffffff" }}>{name}</p>
        <span style={{
          display: "inline-flex", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800,
          background: configured ? "#dcfce7" : "rgba(255,255,255,0.08)",
          color: configured ? "#166534" : "rgba(255,255,255,0.5)",
        }}>
          {configured ? "Active" : "Not set"}
        </span>
      </div>
      {configured ? (
        <p style={{ fontSize: 12, color: "#86efac", fontFamily: "monospace", background: "rgba(0,0,0,0.3)", padding: "8px 12px", borderRadius: 8, marginTop: 8 }}>{id}</p>
      ) : (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{guide}</p>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AnalyticsClient({
  chartData,
  topProducts,
  byRegion,
  pixels,
  summary,
}: {
  chartData: DayRevenue[];
  topProducts: TopProduct[];
  byRegion: RegionRow[];
  pixels: AnalyticsPixelStatus;
  summary: ConversionSummary;
}) {
  const discountRate = summary.total_orders
    ? Math.round((summary.orders_with_discount / summary.total_orders) * 100)
    : 0;
  const affiliateRate = summary.total_orders
    ? Math.round((summary.orders_with_affiliate / summary.total_orders) * 100)
    : 0;

  const statCards = [
    {
      label: "Total Revenue",
      value: `$${(summary.total_revenue_cents / 100).toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: "NZD · excl. cancelled",
    },
    {
      label: "Total Orders",
      value: summary.total_orders.toLocaleString(),
      sub: `Avg $${(summary.avg_order_cents / 100).toFixed(2)} per order`,
    },
    {
      label: "Discount Usage",
      value: `${discountRate}%`,
      sub: `${summary.orders_with_discount} orders · $${(summary.discount_savings_cents / 100).toFixed(0)} saved`,
    },
    {
      label: "Affiliate Rate",
      value: `${affiliateRate}%`,
      sub: `${summary.orders_with_affiliate} referred orders`,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @media (max-width: 1100px) { .analytics-stats { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px)  { .analytics-stats { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px)  { .analytics-two-col { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px)  { .pixels-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ── Stat cards ── */}
      <div className="analytics-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 18 }}>
        {statCards.map((s) => (
          <div
            key={s.label}
            style={{ background: "#f7f8f4", color: "#111827", borderRadius: 18, padding: "20px 22px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
          >
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b" }}>{s.label}</p>
            <p style={{ fontSize: 30, fontWeight: 900, color: "#111827", marginTop: 8 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Revenue chart ── */}
      <div style={{ background: "#f7f8f4", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>Revenue — last 30 days</p>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4, fontFamily: "monospace" }}>
              ${(chartData.reduce((s, d) => s + d.revenue_cents, 0) / 100).toFixed(2)} NZD total
              &nbsp;·&nbsp; {chartData.reduce((s, d) => s + d.order_count, 0)} orders
            </p>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          {chartData.length > 0 ? (
            <RevenueChart data={chartData} />
          ) : (
            <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>
              No order data yet
            </div>
          )}
        </div>
      </div>

      {/* ── Top Products + Revenue by Region ── */}
      <div className="analytics-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#f7f8f4", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <p style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>Top Products</p>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>By revenue, all time</p>
          </div>
          <div style={{ padding: 22 }}>
            {topProducts.length > 0 ? (
              <HBarChart
                rows={topProducts.map((p) => ({ label: p.product_name, value: p.revenue_cents }))}
                format={(v) => `$${(v / 100).toFixed(0)}`}
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120, fontSize: 13, color: "#94a3b8" }}>No sales yet</div>
            )}
          </div>
        </div>

        <div style={{ background: "#f7f8f4", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <p style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>Revenue by Region</p>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Shipping destination breakdown</p>
          </div>
          <div style={{ padding: 22 }}>
            {byRegion.length > 0 ? (
              <HBarChart
                rows={byRegion.map((r) => ({ label: r.region, value: r.revenue_cents }))}
                format={(v) => `$${(v / 100).toFixed(0)}`}
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120, fontSize: 13, color: "#94a3b8" }}>No orders yet</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tracking pixels ── */}
      <div style={{ background: "rgba(8,28,16,0.92)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: "#ffffff" }}>Tracking Pixels</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
            Set pixel IDs as environment variables in Vercel. Purchase events fire automatically on order confirmation.
          </p>
        </div>
        <div className="pixels-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <PixelCard
            name="Meta Pixel"
            configured={!!pixels.metaPixelId}
            id={pixels.metaPixelId ?? ""}
            guide="Add NEXT_PUBLIC_META_PIXEL_ID to your Vercel environment variables"
          />
          <PixelCard
            name="Google Analytics 4"
            configured={!!pixels.ga4Id}
            id={pixels.ga4Id ?? ""}
            guide="Add NEXT_PUBLIC_GA4_ID (e.g. G-XXXXXXXXXX) to your Vercel environment variables"
          />
          <PixelCard
            name="TikTok Pixel"
            configured={!!pixels.tiktokPixelId}
            id={pixels.tiktokPixelId ?? ""}
            guide="Add NEXT_PUBLIC_TIKTOK_PIXEL_ID to your Vercel environment variables"
          />
        </div>
        <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            Events fired:{" "}
            <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>PageView</span> on every page ·{" "}
            <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>Purchase</span> on order confirmation (value, currency, items)
          </p>
        </div>
      </div>
    </div>
  );
}
