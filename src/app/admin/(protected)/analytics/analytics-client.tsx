"use client";

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DayRevenue { day: string; revenue_cents: number; order_count: number; }
export interface TopProduct  { product_name: string; revenue_cents: number; units_sold: number; }
export interface RegionRow   { region: string; revenue_cents: number; order_count: number; }

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

function RevenueChart({ data }: { data: DayRevenue[] }) {
  const W = 800, H = 200, PADX = 0, PADY = 24;
  const innerH = H - PADY;

  const values = data.map((d) => d.revenue_cents);
  const maxVal = Math.max(...values, 1);
  const step = W / Math.max(data.length - 1, 1);

  const toX = (i: number) => PADX + i * step;
  const toY = (v: number) => PADY + innerH - (v / maxVal) * innerH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.revenue_cents)}`).join(" ");
  const areaPoints = [
    `${toX(0)},${H}`,
    ...data.map((d, i) => `${toX(i)},${toY(d.revenue_cents)}`),
    `${toX(data.length - 1)},${H}`,
  ].join(" ");

  // X-axis labels: show every 5th day
  const labelIndices = data.reduce<number[]>((acc, _, i) => {
    if (i === 0 || i === data.length - 1 || i % 7 === 0) acc.push(i);
    return acc;
  }, []);

  const formatDay = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-NZ", { day: "numeric", month: "short" });
  };

  // Hover tooltip state — use a simple approach with SVG title
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal guide lines */}
        {[0.25, 0.5, 0.75, 1].map((pct) => (
          <line
            key={pct}
            x1={0} y1={PADY + innerH - pct * innerH}
            x2={W} y2={PADY + innerH - pct * innerH}
            stroke="#1e1e1e" strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#revenueGrad)" />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#16a34a"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={toX(i)} cy={toY(d.revenue_cents)}
              r="3" fill="#16a34a"
            />
            <title>${(d.revenue_cents / 100).toFixed(2)} NZD · {d.order_count} orders · {formatDay(d.day)}</title>
          </g>
        ))}

        {/* X-axis labels */}
        {labelIndices.map((i) => (
          <text
            key={i}
            x={toX(i)} y={H + 20}
            textAnchor="middle"
            fontSize="11"
            fill="#525252"
          >
            {formatDay(data[i].day)}
          </text>
        ))}

        {/* Y-axis labels */}
        {[0, 0.5, 1].map((pct) => (
          <text
            key={pct}
            x={0} y={PADY + innerH - pct * innerH - 5}
            textAnchor="start"
            fontSize="11"
            fill="#404040"
          >
            ${((maxVal * pct) / 100).toFixed(0)}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── Horizontal Bar Chart ─────────────────────────────────────────────────────

function HBarChart({
  rows,
  format,
}: {
  rows: { label: string; value: number }[];
  format: (v: number) => string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="space-y-3">
      {rows.map((row, i) => {
        const pct = (row.value / max) * 100;
        return (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#d4d4d4] truncate pr-2">{row.label}</span>
              <span className="text-[#737373] shrink-0">{format(row.value)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#1e1e1e] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#16a34a] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Pixel Status Card ────────────────────────────────────────────────────────

function PixelCard({
  name, configured, id, guide,
}: {
  name: string;
  configured: boolean;
  id: string;
  guide: string;
}) {
  return (
    <div className={cn(
      "p-4 rounded-xl border",
      configured ? "border-[#16a34a]/30 bg-[#16a34a]/5" : "border-[#262626] bg-[#141414]"
    )}>
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium text-sm">{name}</p>
        <span className={cn(
          "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
          configured ? "bg-[#16a34a]/15 text-[#16a34a]" : "bg-[#737373]/10 text-[#525252]"
        )}>
          {configured ? "Active" : "Not set"}
        </span>
      </div>
      {configured ? (
        <p className="text-xs text-[#525252] font-mono">{id}</p>
      ) : (
        <p className="text-xs text-[#525252]">{guide}</p>
      )}
    </div>
  );
}

// ─── Conversion Bar ───────────────────────────────────────────────────────────

function ConversionStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-4 rounded-xl bg-[#141414] border border-[#1e1e1e]">
      <p className="text-xs text-[#525252] mb-1">{label}</p>
      <p className="font-display font-bold text-xl text-white">{value}</p>
      {sub && <p className="text-xs text-[#737373] mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export interface AnalyticsPixelStatus {
  metaPixelId: string | null;
  ga4Id: string | null;
  tiktokPixelId: string | null;
}

export interface ConversionSummary {
  total_orders: number;
  total_revenue_cents: number;
  avg_order_cents: number;
  orders_with_discount: number;
  orders_with_affiliate: number;
  discount_savings_cents: number;
}

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

  return (
    <div className="space-y-8">
      {/* Conversion summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ConversionStat
          label="Total revenue (all time)"
          value={`$${(summary.total_revenue_cents / 100).toFixed(2)}`}
          sub="NZD · excl. cancelled"
        />
        <ConversionStat
          label="Total orders"
          value={summary.total_orders.toLocaleString()}
          sub={`Avg $${(summary.avg_order_cents / 100).toFixed(2)} per order`}
        />
        <ConversionStat
          label="Discount code usage"
          value={`${discountRate}%`}
          sub={`${summary.orders_with_discount} orders · saved $${(summary.discount_savings_cents / 100).toFixed(0)}`}
        />
        <ConversionStat
          label="Affiliate attribution"
          value={`${affiliateRate}%`}
          sub={`${summary.orders_with_affiliate} orders via referral`}
        />
      </div>

      {/* Revenue chart */}
      <div className="p-6 rounded-xl bg-[#141414] border border-[#1e1e1e]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-base">Revenue — last 30 days</h2>
            <p className="text-xs text-[#525252] mt-0.5">
              ${(chartData.reduce((s, d) => s + d.revenue_cents, 0) / 100).toFixed(2)} NZD ·{" "}
              {chartData.reduce((s, d) => s + d.order_count, 0)} orders
            </p>
          </div>
        </div>
        {chartData.length > 0 ? (
          <RevenueChart data={chartData} />
        ) : (
          <div className="h-40 flex items-center justify-center text-[#525252] text-sm">
            No order data yet
          </div>
        )}
      </div>

      {/* Products + Regions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-[#141414] border border-[#1e1e1e]">
          <h2 className="font-display font-bold text-base mb-5">Top Products</h2>
          {topProducts.length > 0 ? (
            <HBarChart
              rows={topProducts.map((p) => ({ label: p.product_name, value: p.revenue_cents }))}
              format={(v) => `$${(v / 100).toFixed(0)}`}
            />
          ) : (
            <p className="text-sm text-[#525252]">No sales yet</p>
          )}
        </div>

        <div className="p-6 rounded-xl bg-[#141414] border border-[#1e1e1e]">
          <h2 className="font-display font-bold text-base mb-5">Revenue by Region</h2>
          {byRegion.length > 0 ? (
            <HBarChart
              rows={byRegion.map((r) => ({ label: r.region, value: r.revenue_cents }))}
              format={(v) => `$${(v / 100).toFixed(0)}`}
            />
          ) : (
            <p className="text-sm text-[#525252]">No orders yet</p>
          )}
        </div>
      </div>

      {/* Pixel status */}
      <div className="p-6 rounded-xl bg-[#141414] border border-[#1e1e1e]">
        <h2 className="font-display font-bold text-base mb-1">Tracking Pixels</h2>
        <p className="text-xs text-[#525252] mb-5">
          Set pixel IDs as environment variables in Vercel. Purchase events fire automatically on order confirmation.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <PixelCard
            name="Meta Pixel"
            configured={!!pixels.metaPixelId}
            id={pixels.metaPixelId ?? ""}
            guide="Add NEXT_PUBLIC_META_PIXEL_ID to your Vercel env vars"
          />
          <PixelCard
            name="Google Analytics 4"
            configured={!!pixels.ga4Id}
            id={pixels.ga4Id ?? ""}
            guide="Add NEXT_PUBLIC_GA4_ID (e.g. G-XXXXXXXXXX) to your Vercel env vars"
          />
          <PixelCard
            name="TikTok Pixel"
            configured={!!pixels.tiktokPixelId}
            id={pixels.tiktokPixelId ?? ""}
            guide="Add NEXT_PUBLIC_TIKTOK_PIXEL_ID to your Vercel env vars"
          />
        </div>
        <div className="mt-4 pt-4 border-t border-[#1e1e1e]">
          <p className="text-xs text-[#525252]">
            Events fired: <span className="text-[#737373]">PageView</span> on every page ·{" "}
            <span className="text-[#737373]">Purchase</span> on order confirmation (value, currency, items)
          </p>
        </div>
      </div>
    </div>
  );
}
