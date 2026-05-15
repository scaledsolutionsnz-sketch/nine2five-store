export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsClient } from "./analytics-client";
import type { DayRevenue, TopProduct, RegionRow, ConversionSummary } from "./analytics-client";

export default async function AnalyticsPage() {
  // Auth check (layout already validates, but we need service client for data)
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return null;

  const supabase = await createServiceClient();

  const [chartRes, productsRes, regionsRes, summaryRes] = await Promise.all([
    supabase.rpc("get_revenue_chart", { p_days: 30 }),
    supabase.rpc("get_top_products", { p_limit: 6 }),
    supabase.rpc("get_revenue_by_region", { p_limit: 8 }),
    supabase.rpc("get_conversion_summary"),
  ]);

  const emptySummary: ConversionSummary = {
    total_orders: 0,
    total_revenue_cents: 0,
    avg_order_cents: 0,
    orders_with_discount: 0,
    orders_with_affiliate: 0,
    discount_savings_cents: 0,
  };

  const summaryRow = Array.isArray(summaryRes.data) ? summaryRes.data[0] : summaryRes.data;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl">Analytics</h1>
        <p className="text-sm text-[#737373] mt-1">Revenue, conversions, and tracking pixel status.</p>
      </div>
      <AnalyticsClient
        chartData={(chartRes.data ?? []) as DayRevenue[]}
        topProducts={(productsRes.data ?? []) as TopProduct[]}
        byRegion={(regionsRes.data ?? []) as RegionRow[]}
        summary={(summaryRow as ConversionSummary) ?? emptySummary}
        pixels={{
          metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? null,
          ga4Id: process.env.NEXT_PUBLIC_GA4_ID ?? null,
          tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? null,
        }}
      />
    </div>
  );
}
