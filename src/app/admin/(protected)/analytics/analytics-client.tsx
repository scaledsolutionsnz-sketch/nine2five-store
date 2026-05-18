"use client";

import { cn } from "@/lib/utils";

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
  const W = 800, H = 300, PADX = 48, PADY = 16, PADB = 32;
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
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4ade80" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y-axis grid lines + labels */}
      {yTicks.map((t) => {
        const y = PADY + chartH - t * chartH;
        return (
          <g key={t}>
            <line x1={PADX} y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <text x={PADX - 8} y={y + 4} textAnchor="end" fontSize="11" fill="rgba(244,244,245,0.3)" fontFamily="ui-monospace, monospace">
              ${((maxVal * t) / 100).toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* Area */}
      <polygon points={areaPts} fill="url(#areaGrad)" />

      {/* Line */}
      <polyline
        points={linePts}
        fill="none"
        stroke="#4ade80"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Data points */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(d.revenue_cents)} r="3" fill="#4ade80" stroke="#111113" strokeWidth="1.5" />
          <title>${(d.revenue_cents / 100).toFixed(2)} · {d.order_count} orders · {formatDay(d.day)}</title>
        </g>
      ))}

      {/* X-axis labels */}
      {labelIdx.map((i) => (
        <text
          key={i}
          x={toX(i)} y={H - 4}
          textAnchor="middle"
          fontSize="11"
          fill="rgba(244,244,245,0.3)"
          fontFamily="ui-monospace, monospace"
        >
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
    <div className="flex flex-col gap-4">
      {rows.map((row, i) => {
        const pct = (row.value / max) * 100;
        return (
          <div key={i}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[13px] text-white/70 font-medium truncate pr-3">{row.label}</span>
              <span className="text-[13px] text-white/50 font-semibold shrink-0 font-mono">{format(row.value)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full bg-[#4ade80] transition-all duration-500" style={{ width: `${pct}%` }} />
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
    <div className={cn(
      "p-6 rounded-2xl border",
      configured
        ? "border-[#4ade80]/20 bg-[#4ade80]/[0.04]"
        : "border-white/[0.06] bg-white/[0.02]"
    )}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-[14px] text-white">{name}</p>
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
          configured
            ? "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20"
            : "bg-white/[0.06] text-white/50 border border-white/[0.08]"
        )}>
          {configured ? "Active" : "Not set"}
        </span>
      </div>
      {configured ? (
        <p className="text-[12px] text-white/40 font-mono bg-white/[0.04] px-3 py-2 rounded-lg border border-white/[0.06] mt-2">{id}</p>
      ) : (
        <p className="text-[12px] text-white/30 leading-relaxed">{guide}</p>
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
    <div className="flex flex-col gap-8">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-[#111113] border border-white/[0.06] rounded-xl p-7"
          >
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest leading-none mb-4">
              {s.label}
            </p>
            <p className="font-bold text-[30px] text-white tracking-tight leading-none mb-2 font-mono">
              {s.value}
            </p>
            <p className="text-[12px] text-white/40 font-medium leading-snug">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Revenue chart ── */}
      <div className="bg-[#111113] border border-white/[0.06] rounded-xl">
        <div className="flex items-start justify-between px-8 pt-7 pb-6 border-b border-white/[0.06]">
          <div>
            <h3 className="font-bold text-[17px] text-white leading-none">
              Revenue — last 30 days
            </h3>
            <p className="text-[13px] text-white/40 mt-2 font-medium font-mono">
              ${(chartData.reduce((s, d) => s + d.revenue_cents, 0) / 100).toFixed(2)} NZD total
              · {chartData.reduce((s, d) => s + d.order_count, 0)} orders
            </p>
          </div>
        </div>
        <div className="px-8 py-7">
          {chartData.length > 0 ? (
            <RevenueChart data={chartData} />
          ) : (
            <div className="h-40 flex items-center justify-center text-white/30 text-[13px]">
              No order data yet
            </div>
          )}
        </div>
      </div>

      {/* ── Top Products + Revenue by Region ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#111113] border border-white/[0.06] rounded-xl">
          <div className="px-7 pt-7 pb-5 border-b border-white/[0.06]">
            <h3 className="font-bold text-[17px] text-white leading-none">Top Products</h3>
            <p className="text-[12px] text-white/40 mt-1.5 font-medium">By revenue, all time</p>
          </div>
          <div className="px-7 py-6">
            {topProducts.length > 0 ? (
              <HBarChart
                rows={topProducts.map((p) => ({ label: p.product_name, value: p.revenue_cents }))}
                format={(v) => `$${(v / 100).toFixed(0)}`}
              />
            ) : (
              <p className="text-[13px] text-white/30 py-4">No sales yet</p>
            )}
          </div>
        </div>

        <div className="bg-[#111113] border border-white/[0.06] rounded-xl">
          <div className="px-7 pt-7 pb-5 border-b border-white/[0.06]">
            <h3 className="font-bold text-[17px] text-white leading-none">Revenue by Region</h3>
            <p className="text-[12px] text-white/40 mt-1.5 font-medium">Shipping destination breakdown</p>
          </div>
          <div className="px-7 py-6">
            {byRegion.length > 0 ? (
              <HBarChart
                rows={byRegion.map((r) => ({ label: r.region, value: r.revenue_cents }))}
                format={(v) => `$${(v / 100).toFixed(0)}`}
              />
            ) : (
              <p className="text-[13px] text-white/30 py-4">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Tracking pixels ── */}
      <div className="bg-[#111113] border border-white/[0.06] rounded-xl">
        <div className="px-8 pt-7 pb-5 border-b border-white/[0.06]">
          <h3 className="font-bold text-[17px] text-white leading-none">Tracking Pixels</h3>
          <p className="text-[13px] text-white/40 mt-2 font-medium">
            Set pixel IDs as environment variables in Vercel. Purchase events fire automatically on order confirmation.
          </p>
        </div>
        <div className="px-8 py-7">
          <div className="grid md:grid-cols-3 gap-5">
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
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <p className="text-[12px] text-white/30 font-medium">
              Events fired:{" "}
              <span className="text-white/50 font-semibold">PageView</span> on every page ·{" "}
              <span className="text-white/50 font-semibold">Purchase</span> on order confirmation (value, currency, items)
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
