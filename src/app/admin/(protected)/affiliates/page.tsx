export const dynamic = "force-dynamic";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { AffiliatesClient } from "./affiliates-client";
import type { Affiliate } from "@/types/database";

export default async function AffiliatesPage() {
  const supabase = createServiceRoleClient();

  const { data: affiliates } = await supabase
    .from("affiliates")
    .select("*")
    .is("archived_at", null) // hide soft-deleted (archived) affiliates
    .order("created_at", { ascending: false });

  return <AffiliatesClient affiliates={(affiliates ?? []) as Affiliate[]} />;
}
