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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-[#1F2937]">Customers</h1>
        <span className="text-[14px] text-[#6B7280]">{customers.length} registered</span>
      </div>

      <div className="rounded-xl bg-white border border-[#E2E7EF] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#EAF2FF", borderBottom: "1px solid #BBD3FF" }}>
              {["Name", "Email", "Phone", "Joined", "Orders"].map((h) => (
                <th key={h} className="text-left px-4 h-[52px] text-[14px] font-medium text-[#1F2D3D] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-[#E5EAF1] last:border-0 hover:bg-[#F6FAFF] transition-colors">
                <td className="px-4 py-3.5 font-medium text-[#1F2937]">{c.first_name} {c.last_name}</td>
                <td className="px-4 py-3.5 text-[#334155]">{c.email}</td>
                <td className="px-4 py-3.5 text-[#6B7280]">{c.phone ?? "—"}</td>
                <td className="px-4 py-3.5 text-[#6B7280] text-xs font-mono">
                  {new Date(c.created_at).toLocaleDateString("en-NZ")}
                </td>
                <td className="px-4 py-3.5 text-[#6B7280]">—</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <div className="text-center py-16 text-[#8A94A6] text-sm">No customers yet.</div>
        )}
      </div>
    </div>
  );
}
