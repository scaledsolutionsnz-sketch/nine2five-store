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
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4ade80] mb-1">Growth</p>
          <h1 className="font-bold text-xl text-white">Affiliates</h1>
          <p className="text-sm text-white/45 mt-1">
            Manage referral partners and track commissions
          </p>
        </div>
      </div>
      <AffiliatesClient affiliates={(affiliates ?? []) as Affiliate[]} />
    </div>
  );
}
