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
    <div style={{ minHeight: "100vh", background: "#06150C", color: "#f8f8f2", padding: "32px 28px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>Email Campaigns</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 6, fontSize: 14 }}>Send targeted campaigns to your customers.</p>
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
