export const dynamic = "force-dynamic";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AffiliateDashboardClient } from "./dashboard-client";
import type { Affiliate, AffiliateConversion } from "@/types/database";

export default async function AffiliateDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/affiliate/login");

  const service = await createServiceClient();

  const { data: affiliate } = await service
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!affiliate) redirect("/affiliate/login");

  const { data: conversions } = await service
    .from("affiliate_conversions")
    .select("*, orders(order_number)")
    .eq("affiliate_id", affiliate.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <AffiliateDashboardClient
      affiliate={affiliate as Affiliate}
      conversions={(conversions ?? []) as (AffiliateConversion & { orders: { order_number: number } | null })[]}
    />
  );
}
