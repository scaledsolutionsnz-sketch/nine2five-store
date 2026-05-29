export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { DiscountsClient } from "./discounts-client";
import type { DiscountCode } from "@/types/database";

export default async function DiscountsPage() {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div style={{ minHeight: "100vh", background: "#06150C", color: "#f8f8f2", padding: "32px 28px" }}>
      <DiscountsClient codes={(data ?? []) as DiscountCode[]} />
    </div>
  );
}
