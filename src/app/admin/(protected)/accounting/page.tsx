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
    <div>
      <div className="mb-8">
        <h1 className="font-bold text-xl text-white">Accounting</h1>
        <p className="text-sm text-white/45 mt-1">
          Revenue, GST, and exports for MYOB, Xero, or your accountant.
        </p>
      </div>
      <AccountingClient monthlyData={(data ?? []) as MonthlyRow[]} />
    </div>
  );
}
