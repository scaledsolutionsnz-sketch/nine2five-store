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

  return <AffiliatesClient affiliates={(affiliates ?? []) as Affiliate[]} />;
}
