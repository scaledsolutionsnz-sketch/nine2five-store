"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2, Pencil, X, Check, Warehouse } from "lucide-react";
import type { Supplier } from "@/types/database";

const inputClass =
  "w-full h-10 px-3 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#16a34a] transition-colors";

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
    <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
      <h3 className="font-display font-semibold text-sm text-gray-900 mb-2">{initial?.id ? "Edit Supplier" : "New Supplier"}</h3>
      <input placeholder="Company name *" value={form.name} onChange={set("name")} className={inputClass} />
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Contact name" value={form.contact_name} onChange={set("contact_name")} className={inputClass} />
        <input placeholder="Email" type="email" value={form.email} onChange={set("email")} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Phone" value={form.phone} onChange={set("phone")} className={inputClass} />
        <input placeholder="Address" value={form.address} onChange={set("address")} className={inputClass} />
      </div>
      <textarea
        placeholder="Notes"
        value={form.notes}
        onChange={set("notes")}
        rows={2}
        className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#16a34a] resize-none"
      />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="h-9 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 hover:text-gray-900 transition-colors">
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] disabled:opacity-50 transition-colors"
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
      {/* Create */}
      <div className="flex justify-end">
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Supplier
        </button>
      </div>

      {creating && (
        <SupplierForm onSave={handleSaved} onCancel={() => setCreating(false)} />
      )}

      {/* Active suppliers */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Supplier", "Contact", "Email", "Phone", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gray-400">{h}</th>
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
                <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3.5 text-gray-500">{s.contact_name ?? "—"}</td>
                  <td className="px-4 py-3.5 text-gray-500">{s.email ?? "—"}</td>
                  <td className="px-4 py-3.5 text-gray-500">{s.phone ?? "—"}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing(s.id)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deactivate(s.id)}
                        disabled={deactivating === s.id}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
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
            <Warehouse className="h-8 w-8 text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">No suppliers yet. Add one above.</p>
          </div>
        )}
      </div>

      {/* Inactive */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Inactive</p>
          <div className="space-y-1">
            {inactive.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-100 opacity-50">
                <p className="text-sm text-gray-500 line-through">{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
