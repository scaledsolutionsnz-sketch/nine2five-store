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

  return <DiscountsClient codes={(data ?? []) as DiscountCode[]} />;
}
