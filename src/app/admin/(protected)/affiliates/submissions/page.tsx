export const dynamic = "force-dynamic";

import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Affiliate } from "@/types/database";
import { SubmissionsClient } from "./submissions-client";

// Admin-only (enforced by the (protected) layout: user must be in admin_users).
// Reads via the true service-role client so RLS doesn't hide anyone.
export default async function AffiliateSubmissionsPage() {
  const service = createServiceRoleClient();

  const [{ data: affiliates }, { data: discountCodes }] = await Promise.all([
    service.from("affiliates").select("*").is("archived_at", null).order("created_at", { ascending: false }),
    service.from("discount_codes").select("code").eq("active", true),
  ]);

  // Map an ambassador's referral_code -> their live discount code (same name by convention).
  const codeSet = new Set((discountCodes ?? []).map((d) => d.code.toLowerCase()));
  const rows = ((affiliates ?? []) as Affiliate[]).map((a) => ({
    affiliate: a,
    discountCode: codeSet.has(a.referral_code.toLowerCase()) ? a.referral_code.toUpperCase() : null,
  }));

  return <SubmissionsClient rows={rows} />;
}
