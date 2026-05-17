"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer, ShippingAddress } from "@/types/database";
import { NZ_REGIONS } from "@/lib/shipping";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTRIES = [{ code: "NZ", label: "New Zealand" }, { code: "AU", label: "Australia" }];

export function AddressForm({ customer }: { customer: Customer | null }) {
  const router = useRouter();
  const existing = customer?.default_shipping_address as ShippingAddress | null;
  const [form, setForm] = useState<ShippingAddress>({
    first_name: existing?.first_name ?? customer?.first_name ?? "",
    last_name: existing?.last_name ?? customer?.last_name ?? "",
    line1: existing?.line1 ?? "",
    line2: existing?.line2 ?? "",
    city: existing?.city ?? "",
    region: existing?.region ?? "",
    postcode: existing?.postcode ?? "",
    country: existing?.country ?? "NZ",
    phone: existing?.phone ?? customer?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full h-12 px-4 rounded-xl bg-[#111] border border-white/[0.1] text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#4ade80]/50 transition-colors";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ default_shipping_address: form }),
    });
    setSaving(false);
    if (res.ok) { toast.success("Address saved"); router.refresh(); }
    else toast.error("Failed to save");
  }

  return (
    <form onSubmit={save}>
      <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8 space-y-4">
        <h2 className="font-display font-semibold text-sm text-white mb-2">Default Shipping Address</h2>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Country</label>
          <select
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value, region: "" }))}
            className={cn(inputClass, "appearance-none")}
          >
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">First Name</label>
            <input required value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Last Name</label>
            <input required value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Address Line 1</label>
          <input required value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} placeholder="Street address" className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Address Line 2 <span className="text-white/25">(optional)</span></label>
          <input value={form.line2 ?? ""} onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))} placeholder="Apartment, unit, etc." className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">City / Town</label>
            <input required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Postcode</label>
            <input required value={form.postcode} onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Region</label>
          {form.country === "NZ" ? (
            <select
              required value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              className={cn(inputClass, "appearance-none")}
            >
              <option value="" disabled>Select region</option>
              {NZ_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          ) : (
            <input required value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} placeholder="State / Region" className={inputClass} />
          )}
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Phone <span className="text-white/25">(optional)</span></label>
          <input type="tel" value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+64 21 000 0000" className={inputClass} />
        </div>

        <button
          type="submit" disabled={saving}
          className="bg-[#4ade80] text-black font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#86efac] transition-all duration-300 w-full disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Address"}
        </button>
      </div>
    </form>
  );
}
