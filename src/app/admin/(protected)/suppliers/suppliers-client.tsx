"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2, Pencil, X, Check, Warehouse } from "lucide-react";
import type { Supplier } from "@/types/database";

const darkInput: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 14px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

const darkTextarea: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  fontSize: 13,
  outline: "none",
  resize: "none" as const,
  boxSizing: "border-box" as const,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "rgba(255,255,255,0.55)",
  marginBottom: 6,
};

function SupplierForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Supplier>;
  onSave: (s: Supplier) => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    contact_name: initial?.contact_name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
    notes: initial?.notes ?? "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    const url = initial?.id ? `/api/admin/suppliers/${initial.id}` : "/api/admin/suppliers";
    const method = initial?.id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (data.error) { toast.error(data.error); return; }
    onSave(data.supplier);
    toast.success(initial?.id ? "Supplier updated" : "Supplier added");
  }

  return (
    <div style={{
      padding: 24,
      background: "rgba(8,28,16,0.92)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 14,
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", marginBottom: 16 }}>
        {initial?.id ? "Edit Supplier" : "New Supplier"}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>Company name</label>
          <input placeholder="Acme Socks Ltd" value={form.name} onChange={set("name")} style={darkInput} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Contact name</label>
            <input placeholder="Jane Smith" value={form.contact_name} onChange={set("contact_name")} style={darkInput} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input placeholder="jane@example.com" type="email" value={form.email} onChange={set("email")} style={darkInput} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Phone</label>
            <input placeholder="+64 9 000 0000" value={form.phone} onChange={set("phone")} style={darkInput} />
          </div>
          <div>
            <label style={labelStyle}>Address</label>
            <input placeholder="123 Main St, Auckland" value={form.address} onChange={set("address")} style={darkInput} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea
            placeholder="Any notes about this supplier…"
            value={form.notes}
            onChange={set("notes")}
            rows={2}
            style={darkTextarea}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 4 }}>
          <button
            onClick={onCancel}
            style={{
              height: 36,
              padding: "0 16px",
              borderRadius: 9999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 20px",
              borderRadius: 9999,
              background: "#2f9b2f",
              border: "none",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Check style={{ width: 14, height: 14 }} />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function SuppliersClient({ initialSuppliers }: { initialSuppliers: Supplier[] }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<string | null>(null);

  function handleSaved(supplier: Supplier) {
    setSuppliers((prev) => {
      const exists = prev.find((s) => s.id === supplier.id);
      return exists ? prev.map((s) => (s.id === supplier.id ? supplier : s)) : [supplier, ...prev];
    });
    setCreating(false);
    setEditing(null);
  }

  async function deactivate(id: string) {
    if (!confirm("Deactivate this supplier?")) return;
    setDeactivating(id);
    await fetch(`/api/admin/suppliers/${id}`, { method: "DELETE" });
    setDeactivating(null);
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, active: false } : s)));
    toast.success("Supplier deactivated");
  }

  const active = suppliers.filter((s) => s.active);
  const inactive = suppliers.filter((s) => !s.active);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>Suppliers</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 6, fontSize: 14 }}>Manage your sock suppliers and contact details.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 40,
            padding: "0 20px",
            borderRadius: 9999,
            background: "#2f9b2f",
            border: "none",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus style={{ width: 16, height: 16 }} /> Add Supplier
        </button>
      </div>

      {creating && (
        <SupplierForm onSave={handleSaved} onCancel={() => setCreating(false)} />
      )}

      {/* Active suppliers */}
      <div style={{
        borderRadius: 14,
        background: "rgba(8,28,16,0.92)",
        border: "1px solid rgba(255,255,255,0.09)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", lineHeight: 1 }}>Active Suppliers</h3>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
            {active.length} supplier{active.length !== 1 ? "s" : ""}
          </p>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Supplier", "Contact", "Email", "Phone", ""].map((h) => (
                <th key={h} style={{
                  textAlign: "left",
                  padding: "0 18px",
                  height: 44,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.map((s) => (
              editing === s.id ? (
                <tr key={s.id}>
                  <td colSpan={5} style={{ padding: 16 }}>
                    <SupplierForm initial={s} onSave={handleSaved} onCancel={() => setEditing(null)} />
                  </td>
                </tr>
              ) : (
                <tr
                  key={s.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 18px", fontSize: 13, fontWeight: 500, color: "#ffffff" }}>{s.name}</td>
                  <td style={{ padding: "14px 18px", fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{s.contact_name ?? "—"}</td>
                  <td style={{ padding: "14px 18px", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{s.email ?? "—"}</td>
                  <td style={{ padding: "14px 18px", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{s.phone ?? "—"}</td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                      <button
                        onClick={() => setEditing(s.id)}
                        style={{
                          height: 28,
                          width: 28,
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "transparent",
                          border: "none",
                          color: "rgba(255,255,255,0.35)",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)";
                        }}
                      >
                        <Pencil style={{ width: 13, height: 13 }} />
                      </button>
                      <button
                        onClick={() => deactivate(s.id)}
                        disabled={deactivating === s.id}
                        style={{
                          height: 28,
                          width: 28,
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "transparent",
                          border: "none",
                          color: "rgba(255,255,255,0.35)",
                          cursor: deactivating === s.id ? "not-allowed" : "pointer",
                          opacity: deactivating === s.id ? 0.4 : 1,
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (deactivating !== s.id) {
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.15)";
                            (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
                          }
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)";
                        }}
                      >
                        {deactivating === s.id
                          ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
                          : <X style={{ width: 13, height: 13 }} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
        {active.length === 0 && !creating && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", textAlign: "center" }}>
            <Warehouse style={{ width: 32, height: 32, color: "rgba(255,255,255,0.15)", marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>No suppliers yet. Add one above.</p>
          </div>
        )}
      </div>

      {/* Inactive */}
      {inactive.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>Inactive</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {inactive.map((s) => (
              <div key={s.id} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                opacity: 0.5,
              }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "line-through" }}>{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
