export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import { SuppliersClient } from "./suppliers-client";
import type { Supplier } from "@/types/database";

export default async function SuppliersPage() {
  const supabase = await createServiceClient();
  const { data } = await supabase.from("suppliers").select("*").order("name");

  return (
    <div style={{ minHeight: "100vh", background: "#06150C", color: "#f8f8f2", padding: "32px 28px" }}>
      <SuppliersClient initialSuppliers={(data ?? []) as Supplier[]} />
    </div>
  );
}
