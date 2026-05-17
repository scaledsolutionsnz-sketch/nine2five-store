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
        <h1 className="font-display font-bold text-2xl text-gray-900">Customers</h1>
        <p className="text-sm text-gray-400 mt-1">{customers.length} registered customers</p>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Name", "Email", "Phone", "Joined", "Orders"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3.5 font-medium text-gray-900">{c.first_name} {c.last_name}</td>
                <td className="px-4 py-3.5 text-gray-500">{c.email}</td>
                <td className="px-4 py-3.5 text-gray-500">{c.phone ?? "—"}</td>
                <td className="px-4 py-3.5 text-gray-400 text-xs">
                  {new Date(c.created_at).toLocaleDateString("en-NZ")}
                </td>
                <td className="px-4 py-3.5 text-gray-400">—</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">No customers yet.</div>
        )}
      </div>
    </div>
  );
}
