export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { DiscountsClient } from "./discounts-client";
import type { DiscountCode } from "@/types/database";

export default async function DiscountsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16a34a] mb-1">Commerce</p>
        <h1 className="font-display font-bold text-2xl text-white">Discount Codes</h1>
        <p className="text-sm text-[#737373] mt-1">Create and manage promo codes for your campaigns</p>
      </div>
      <DiscountsClient codes={(data ?? []) as DiscountCode[]} />
    </div>
  );
}
