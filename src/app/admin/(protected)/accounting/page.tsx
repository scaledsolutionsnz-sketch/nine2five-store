export const dynamic = "force-dynamic";

import { createServiceClient, createClient } from "@/lib/supabase/server";
import { AccountingClient } from "./accounting-client";
import type { MonthlyRow } from "./accounting-client";

export default async function AccountingPage() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return null;

  const supabase = await createServiceClient();
  const { data } = await supabase.rpc("get_monthly_revenue", { p_months: 12 });

  return (
    <div style={{ minHeight: "100vh", background: "#06150C", color: "#f8f8f2", padding: "32px 28px" }}>
      <h1 style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>Accounting</h1>
      <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 6, fontSize: 14, marginBottom: 32 }}>
        Revenue, GST reports, and Stripe balance.
      </p>
      <AccountingClient monthlyData={(data ?? []) as MonthlyRow[]} />
    </div>
  );
}
