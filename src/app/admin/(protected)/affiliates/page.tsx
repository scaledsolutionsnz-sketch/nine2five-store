export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { AffiliatesClient } from "./affiliates-client";
import type { Affiliate } from "@/types/database";

export default async function AffiliatesPage() {
  const supabase = await createServiceClient();

  const { data: affiliates } = await supabase
    .from("affiliates")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937]">Affiliates</h1>
          <p className="text-[14px] text-[#64748B] mt-1">Manage referral partners and commissions.</p>
        </div>
      </div>
      <AffiliatesClient affiliates={(affiliates ?? []) as Affiliate[]} />
    </div>
  );
}
