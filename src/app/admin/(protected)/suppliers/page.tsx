export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { SuppliersClient } from "./suppliers-client";
import type { Supplier } from "@/types/database";

export default async function SuppliersPage() {
  const supabase = await createServiceClient();
  const { data } = await supabase.from("suppliers").select("*").order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937]">Suppliers</h1>
          <p className="text-[14px] text-[#64748B] mt-1">Manage your product suppliers and contacts.</p>
        </div>
      </div>
      <SuppliersClient initialSuppliers={(data ?? []) as Supplier[]} />
    </div>
  );
}
