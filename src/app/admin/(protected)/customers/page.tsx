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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937]">Customers</h1>
          <p className="text-[14px] text-[#64748B] mt-1">All registered accounts and guest purchasers.</p>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-[14px] border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 h-[60px] border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[#1F2937]">All customers</span>
            <span className="text-[13px] text-[#94A3B8]">({customers.length})</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] text-[#64748B]">{customers.length} registered</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 700 }}>
            <thead>
              <tr className="bg-[#EAF2FF] border-b border-[#BBD3FF]">
                {["Name", "Email", "Phone", "Joined", "Orders"].map((h) => (
                  <th key={h} className="px-[18px] text-left text-[13px] font-medium text-[#1F2D3D] whitespace-nowrap h-[52px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-[#F6FAFF] transition-colors" style={{ borderBottom: "1px solid #E5EAF1" }}>
                  <td className="px-[18px] py-[14px] text-[13px] font-semibold text-[#1F2937]">{c.first_name} {c.last_name}</td>
                  <td className="px-[18px] py-[14px] text-[13px] text-[#64748B] max-w-[220px] truncate">{c.email}</td>
                  <td className="px-[18px] py-[14px] text-[13px] text-[#64748B]">{c.phone ?? "—"}</td>
                  <td className="px-[18px] py-[14px] text-[13px] text-[#94A3B8] font-mono">
                    {new Date(c.created_at).toLocaleDateString("en-NZ")}
                  </td>
                  <td className="px-[18px] py-[14px] text-[13px] text-[#94A3B8] text-center">—</td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && (
            <div className="text-center py-16 text-[#94A3B8] text-[14px]">No customers yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
