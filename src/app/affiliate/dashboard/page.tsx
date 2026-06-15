export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { AffiliateDashboardClient } from "./dashboard-client";
import type { Affiliate, AffiliateConversion } from "@/types/database";

export default async function AffiliateDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/affiliate/login");

  // True service-role client (NO cookies). @supabase/ssr's createServiceClient
  // inherits the logged-in user's JWT when a session cookie is present, so its
  // reads run under RLS as that user — and affiliate_clicks/affiliate_conversions
  // have no SELECT policy for a regular affiliate, which made the counts return 0.
  const service = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: affiliate } = await service
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!affiliate) redirect("/affiliate/login");

  // Authoritative stats from source rows (read via service role so RLS doesn't hide them).
  const [{ count: clicksCount }, { data: convStatRows }, { data: conversions }] = await Promise.all([
    service.from("affiliate_clicks").select("*", { count: "exact", head: true }).eq("affiliate_id", affiliate.id),
    service.from("affiliate_conversions").select("commission_cents, status").eq("affiliate_id", affiliate.id),
    service
      .from("affiliate_conversions")
      .select("*, orders(order_number)")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  const liveConv = (convStatRows ?? []).filter((c) => c.status !== "reversed");
  affiliate.total_clicks = clicksCount ?? 0;
  affiliate.total_conversions = liveConv.length;
  affiliate.total_commission_cents = liveConv.reduce((s, c) => s + (c.commission_cents ?? 0), 0);

  return (
    <AffiliateDashboardClient
      affiliate={affiliate as Affiliate}
      conversions={(conversions ?? []) as (AffiliateConversion & { orders: { order_number: number } | null })[]}
    />
  );
}
