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
    <div style={{ minHeight: "100vh", background: "#06150C", color: "#f8f8f2", padding: "32px 28px" }}>
      {/* Page header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>Customers</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 6, fontSize: 14 }}>
            {customers.length} registered account{customers.length !== 1 ? "s" : ""} and guest purchasers.
          </p>
        </div>
      </div>

      {/* Table card */}
      <div style={{ background: "#f7f8f4", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>All Customers</p>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{customers.length} registered</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 700 }}>
            <thead style={{ background: "#eaf2fb" }}>
              <tr>
                {["Name", "Email", "Phone", "Joined", "Orders"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontWeight: 800, color: "#334155", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "13px 16px", color: "#111827", fontWeight: 700, verticalAlign: "middle" }}>
                    {c.first_name} {c.last_name}
                  </td>
                  <td style={{ padding: "13px 16px", color: "#334155", verticalAlign: "middle", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.email}
                  </td>
                  <td style={{ padding: "13px 16px", color: "#64748b", verticalAlign: "middle" }}>
                    {c.phone ?? "—"}
                  </td>
                  <td style={{ padding: "13px 16px", color: "#94a3b8", verticalAlign: "middle", fontFamily: "monospace" }}>
                    {new Date(c.created_at).toLocaleDateString("en-NZ")}
                  </td>
                  <td style={{ padding: "13px 16px", color: "#94a3b8", verticalAlign: "middle", textAlign: "center" }}>
                    —
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "#94a3b8", fontSize: 14 }}>No customers yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
