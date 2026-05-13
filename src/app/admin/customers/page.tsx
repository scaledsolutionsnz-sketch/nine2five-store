export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/types/database";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  const customers = (data ?? []) as Customer[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl">Customers</h1>
        <p className="text-sm text-[#737373] mt-1">{customers.length} registered customers</p>
      </div>

      <div className="rounded-xl bg-[#141414] border border-[#1e1e1e] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              {["Name", "Email", "Phone", "Joined", "Orders"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#525252]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-medium">{c.first_name} {c.last_name}</td>
                <td className="px-4 py-3 text-[#737373]">{c.email}</td>
                <td className="px-4 py-3 text-[#737373]">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-[#737373] text-xs">
                  {new Date(c.created_at).toLocaleDateString("en-NZ")}
                </td>
                <td className="px-4 py-3 text-[#737373]">—</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <div className="text-center py-16 text-[#525252]">No customers yet.</div>
        )}
      </div>
    </div>
  );
}
