export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { CampaignManager } from "./campaign-manager";
import type { EmailCampaign } from "@/types/database";

export default async function CampaignsPage() {
  const supabase = await createClient();

  const [
    { data: campaigns },
    { count: customerCount },
    { count: subscribedCount },
    { count: highValueCount },
  ] = await Promise.all([
    supabase.from("email_campaigns").select("*").order("created_at", { ascending: false }),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("customers").select("*", { count: "exact", head: true }).eq("accepts_marketing", true),
    supabase.from("customers").select("*", { count: "exact", head: true }).gte("lifetime_value_cents", 10000),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl">Email Campaigns</h1>
        <p className="text-sm text-[#737373] mt-1">Segment, personalise, and track your emails</p>
      </div>
      <CampaignManager
        initialCampaigns={(campaigns ?? []) as EmailCampaign[]}
        customerCount={customerCount ?? 0}
        subscribedCount={subscribedCount ?? 0}
        highValueCount={highValueCount ?? 0}
      />
    </div>
  );
}
