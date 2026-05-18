export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { SuppliersClient } from "./suppliers-client";
import type { Supplier } from "@/types/database";

export default async function SuppliersPage() {
  const supabase = await createServiceClient();
  const { data } = await supabase.from("suppliers").select("*").order("name");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-[#1F2937]">Suppliers</h1>
      </div>
      <SuppliersClient initialSuppliers={(data ?? []) as Supplier[]} />
    </div>
  );
}
