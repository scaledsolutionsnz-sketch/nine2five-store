export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { SuppliersClient } from "./suppliers-client";
import type { Supplier } from "@/types/database";

export default async function SuppliersPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("suppliers").select("*").order("name");

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl">Suppliers</h1>
        <p className="text-sm text-[#737373] mt-1">Manage your stock suppliers and contacts.</p>
      </div>
      <SuppliersClient initialSuppliers={(data ?? []) as Supplier[]} />
    </div>
  );
}
