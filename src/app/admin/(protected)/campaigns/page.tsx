export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { CampaignManager } from "./campaign-manager";
import type { EmailCampaign } from "@/types/database";

export default async function CampaignsPage() {
  const supabase = await createServiceClient();

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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937]">Email Campaigns</h1>
          <p className="text-[14px] text-[#64748B] mt-1">Send targeted campaigns to your customers.</p>
        </div>
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
