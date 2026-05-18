export const dynamic = "force-dynamic";

import { createServiceClient } from "@/lib/supabase/server";
import type { Customer } from "@/types/database";

export default async function CustomersPage() {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  const customers = (data ?? []) as Customer[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-bold text-xl text-white">Customers</h1>
        <p className="text-sm text-white/45 mt-1">{customers.length} registered customers</p>
      </div>

      <div className="bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04] bg-[#111113]">
              {["Name", "Email", "Phone", "Joined", "Orders"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3.5 font-medium text-white">{c.first_name} {c.last_name}</td>
                <td className="px-4 py-3.5 text-white/50">{c.email}</td>
                <td className="px-4 py-3.5 text-white/50">{c.phone ?? "—"}</td>
                <td className="px-4 py-3.5 text-white/40 text-xs font-mono">
                  {new Date(c.created_at).toLocaleDateString("en-NZ")}
                </td>
                <td className="px-4 py-3.5 text-white/40">—</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <div className="text-center py-16 text-white/30 text-sm">No customers yet.</div>
        )}
      </div>
    </div>
  );
}
