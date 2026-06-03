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
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>Discounts</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 6, fontSize: 14 }}>Manage discount codes and promotions.</p>
        </div>
      </div>
      <DiscountsClient codes={(data ?? []) as DiscountCode[]} />
    </div>
  );
}
