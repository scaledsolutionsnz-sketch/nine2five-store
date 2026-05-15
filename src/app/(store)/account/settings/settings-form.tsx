"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer } from "@/types/database";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputClass = "w-full h-11 px-4 rounded-xl bg-[#141414] border border-[#262626] text-white text-sm placeholder-[#525252] focus:outline-none focus:border-[#16a34a] transition-colors";

export function SettingsForm({ customer, email }: { customer: Customer | null; email: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: customer?.first_name ?? "",
    last_name: customer?.last_name ?? "",
    phone: customer?.phone ?? "",
    accepts_marketing: customer?.accepts_marketing ?? true,
  });
  const [saving, setSaving] = useState(false);

  // Password change
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { toast.success("Profile updated"); router.refresh(); }
    else toast.error("Failed to update");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (passwordForm.next !== passwordForm.confirm) {
      setPwError("Passwords don't match");
      return;
    }
    if (passwordForm.next.length < 6) {
      setPwError("Password must be at least 6 characters");
      return;
    }
    setPwSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: passwordForm.next });
    setPwSaving(false);
    if (error) { setPwError(error.message); return; }
    toast.success("Password updated");
    setPasswordForm({ current: "", next: "", confirm: "" });
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <form onSubmit={saveProfile} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 space-y-4">
        <h2 className="font-display font-semibold text-sm text-white">Personal Details</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#737373] mb-1.5">First Name</label>
            <input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-[#737373] mb-1.5">Last Name</label>
            <input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#737373] mb-1.5">Email</label>
          <input value={email} disabled className={inputClass + " opacity-50 cursor-not-allowed"} />
        </div>
        <div>
          <label className="block text-xs text-[#737373] mb-1.5">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+64 21 000 0000" className={inputClass} />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={form.accepts_marketing}
              onChange={(e) => setForm((f) => ({ ...f, accepts_marketing: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-[#262626] peer-checked:bg-[#16a34a] rounded-full transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm text-[#737373]">Receive marketing emails from Nine2Five</span>
        </label>
        <button
          type="submit" disabled={saving}
          className="h-11 px-6 rounded-xl bg-[#16a34a] text-white font-display font-semibold text-sm hover:bg-[#15803d] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Changes"}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={changePassword} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 space-y-4">
        <h2 className="font-display font-semibold text-sm text-white">Change Password</h2>
        <div>
          <label className="block text-xs text-[#737373] mb-1.5">New Password</label>
          <input type="password" required minLength={6} value={passwordForm.next} onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))} placeholder="Minimum 6 characters" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-[#737373] mb-1.5">Confirm New Password</label>
          <input type="password" required value={passwordForm.confirm} onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))} className={inputClass} />
        </div>
        {pwError && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{pwError}</p>}
        <button
          type="submit" disabled={pwSaving}
          className="h-11 px-6 rounded-xl border border-[#262626] text-white text-sm font-semibold hover:border-[#404040] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {pwSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : "Update Password"}
        </button>
      </form>
    </div>
  );
}
