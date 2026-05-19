"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2, Pencil, X, Check, Warehouse } from "lucide-react";
import type { Supplier } from "@/types/database";

const inputClass =
  "w-full h-10 px-3.5 rounded-lg bg-white border border-[#E2E8F0] text-[13px] text-[#334155] placeholder:text-[#C4CAD4] focus:outline-none focus:border-[#116DFF]/50 transition-colors";

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
    <div className="p-6 bg-white border border-[#E2E8F0] rounded-[14px] space-y-4" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
      <h3 className="text-[14px] font-semibold text-[#1F2937]">{initial?.id ? "Edit Supplier" : "New Supplier"}</h3>
      <div>
        <label className="block text-[12px] font-medium text-[#374151] mb-1.5">Company name</label>
        <input placeholder="Acme Socks Ltd" value={form.name} onChange={set("name")} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1.5">Contact name</label>
          <input placeholder="Jane Smith" value={form.contact_name} onChange={set("contact_name")} className={inputClass} />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1.5">Email</label>
          <input placeholder="jane@example.com" type="email" value={form.email} onChange={set("email")} className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1.5">Phone</label>
          <input placeholder="+64 9 000 0000" value={form.phone} onChange={set("phone")} className={inputClass} />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1.5">Address</label>
          <input placeholder="123 Main St, Auckland" value={form.address} onChange={set("address")} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-[12px] font-medium text-[#374151] mb-1.5">Notes</label>
        <textarea
          placeholder="Any notes about this supplier…"
          value={form.notes}
          onChange={set("notes")}
          rows={2}
          className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E2E8F0] text-[13px] text-[#334155] placeholder:text-[#C4CAD4] focus:outline-none focus:border-[#116DFF]/50 resize-none transition-colors"
        />
      </div>
      <div className="flex justify-end gap-3 pt-1">
        <button onClick={onCancel} className="h-9 px-4 rounded-full bg-white border border-[#D8E2F0] hover:bg-[#F4F8FF] text-[#27364A] text-[13px] font-medium transition-colors">
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 h-10 px-5 rounded-full bg-[#116DFF] text-white text-[13px] font-semibold hover:bg-[#0D5FE0] disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Save
        </button>
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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1F2937]">Suppliers</h1>
          <p className="text-[14px] text-[#64748B] mt-1">Manage your sock suppliers and contact details.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 h-10 px-5 rounded-full bg-[#116DFF] text-white text-[13px] font-semibold hover:bg-[#0D5FE0] transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Supplier
        </button>
      </div>

      {creating && (
        <SupplierForm onSave={handleSaved} onCancel={() => setCreating(false)} />
      )}

      {/* Active suppliers */}
      <div className="rounded-[14px] bg-white border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-[14px] font-semibold text-[#1F2937] leading-none">Active Suppliers</h3>
          <p className="text-[12px] text-[#6B7280] mt-1">{active.length} supplier{active.length !== 1 ? "s" : ""}</p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#EAF2FF", borderBottom: "1px solid #BBD3FF" }}>
              {["Supplier", "Contact", "Email", "Phone", ""].map((h) => (
                <th key={h} className="text-left px-[18px] h-[52px] text-[13px] font-medium text-[#1F2D3D] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.map((s) => (
              editing === s.id ? (
                <tr key={s.id}>
                  <td colSpan={5} className="p-4">
                    <SupplierForm initial={s} onSave={handleSaved} onCancel={() => setEditing(null)} />
                  </td>
                </tr>
              ) : (
                <tr key={s.id} className="border-b border-[#E5EAF1] last:border-0 hover:bg-[#F6FAFF] transition-colors">
                  <td className="px-[18px] py-[14px] text-[13px] font-medium text-[#1F2937]">{s.name}</td>
                  <td className="px-[18px] py-[14px] text-[13px] text-[#334155]">{s.contact_name ?? "—"}</td>
                  <td className="px-[18px] py-[14px] text-[13px] text-[#6B7280]">{s.email ?? "—"}</td>
                  <td className="px-[18px] py-[14px] text-[13px] text-[#6B7280]">{s.phone ?? "—"}</td>
                  <td className="px-[18px] py-[14px]">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing(s.id)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#334155] hover:bg-[#F3F5F8] transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deactivate(s.id)}
                        disabled={deactivating === s.id}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#991B1B] hover:bg-[#FEE2E2] transition-colors disabled:opacity-40"
                      >
                        {deactivating === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
        {active.length === 0 && !creating && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Warehouse className="h-8 w-8 text-[#C4CAD4] mb-3" />
            <p className="text-[13px] text-[#6B7280]">No suppliers yet. Add one above.</p>
          </div>
        )}
      </div>

      {/* Inactive */}
      {inactive.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#8A94A6] mb-3">Inactive</p>
          <div className="space-y-1">
            {inactive.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#F3F5F8] border border-[#E2E8F0] opacity-50">
                <p className="text-[13px] text-[#6B7280] line-through">{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
