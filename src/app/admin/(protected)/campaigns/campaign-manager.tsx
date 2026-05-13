"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Plus, Loader2, Mail } from "lucide-react";
import type { EmailCampaign } from "@/types/database";

export function CampaignManager({
  initialCampaigns,
  customerCount,
}: {
  initialCampaigns: EmailCampaign[];
  customerCount: number;
}) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  async function createCampaign() {
    if (!subject.trim() || !body.trim()) { toast.error("Subject and body required"); return; }
    setCreating(true);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const data = await res.json();
    setCreating(false);
    if (data.error) { toast.error(data.error); return; }
    setCampaigns((prev) => [data.campaign, ...prev]);
    setSubject("");
    setBody("");
    toast.success("Campaign saved as draft");
  }

  async function sendCampaign(id: string) {
    if (!confirm(`Send to ${customerCount} customers?`)) return;
    setSending(id);
    const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
    const data = await res.json();
    setSending(null);
    if (data.error) { toast.error(data.error); return; }
    setCampaigns((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: "sent" as const, sent_at: new Date().toISOString(), recipient_count: customerCount } : c)
    );
    toast.success(`Sent to ${customerCount} customers`);
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#16a34a] transition-colors";

  return (
    <div className="space-y-6">
      {/* Compose */}
      <div className="p-6 rounded-xl bg-[#141414] border border-[#1e1e1e]">
        <h2 className="font-display font-bold text-base mb-5 flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Campaign
        </h2>
        <div className="space-y-3">
          <input
            placeholder="Subject line"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass}
          />
          <textarea
            placeholder={`Write your campaign email...\n\nExample:\nHey team!\n\nWe've just dropped the new Toa Whenua design — limited stock, grab yours before it's gone.\n\nShop now: nine2five.nz\n\n— Wiremu`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className={inputClass + " resize-none"}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#525252]">Will send to {customerCount} customers</p>
            <button
              onClick={createCampaign}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#16a34a] text-white text-sm font-semibold hover:bg-[#15803d] transition-colors disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save Draft
            </button>
          </div>
        </div>
      </div>

      {/* Campaign list */}
      <div className="space-y-3">
        {campaigns.map((c) => (
          <div key={c.id} className="p-5 rounded-xl bg-[#141414] border border-[#1e1e1e] flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-3.5 w-3.5 text-[#737373] shrink-0" />
                <p className="font-medium text-sm truncate">{c.subject}</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${c.status === "sent" ? "bg-[#16a34a]/15 text-[#16a34a]" : "bg-[#737373]/15 text-[#737373]"}`}>
                  {c.status}
                </span>
              </div>
              <p className="text-xs text-[#525252]">
                {c.status === "sent"
                  ? `Sent ${new Date(c.sent_at!).toLocaleDateString("en-NZ")} to ${c.recipient_count} customers`
                  : `Created ${new Date(c.created_at).toLocaleDateString("en-NZ")}`}
              </p>
            </div>
            {c.status === "draft" && (
              <button
                onClick={() => sendCampaign(c.id)}
                disabled={sending === c.id || customerCount === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16a34a] text-white text-xs font-semibold hover:bg-[#15803d] transition-colors disabled:opacity-50 shrink-0"
              >
                {sending === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                Send Now
              </button>
            )}
          </div>
        ))}
        {campaigns.length === 0 && (
          <p className="text-center py-10 text-[#525252] text-sm">No campaigns yet. Write one above.</p>
        )}
      </div>
    </div>
  );
}
