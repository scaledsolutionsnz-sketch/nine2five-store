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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-[#1F2937]">Accounting</h1>
      </div>
      <AccountingClient monthlyData={(data ?? []) as MonthlyRow[]} />
    </div>
  );
}
