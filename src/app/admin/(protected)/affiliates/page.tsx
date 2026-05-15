export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { AffiliatesClient } from "./affiliates-client";
import type { Affiliate } from "@/types/database";

export default async function AffiliatesPage() {
  const supabase = await createClient();

  const { data: affiliates } = await supabase
    .from("affiliates")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-6xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16a34a] mb-1">Growth</p>
          <h1 className="font-display font-bold text-2xl text-white">Affiliates</h1>
          <p className="text-sm text-[#737373] mt-1">
            Manage referral partners and track commissions
          </p>
        </div>
      </div>
      <AffiliatesClient affiliates={(affiliates ?? []) as Affiliate[]} />
    </div>
  );
}
