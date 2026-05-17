"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Send, Plus, Loader2, Mail, Eye, EyeOff, MousePointerClick,
  Users, TrendingUp, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmailCampaign, CampaignSegment } from "@/types/database";

const SEGMENTS: { value: CampaignSegment; label: string; desc: string }[] = [
  { value: "all",        label: "All customers",       desc: "Everyone who has placed an order" },
  { value: "subscribed", label: "Subscribed only",     desc: "Customers who opted in to marketing" },
  { value: "high_value", label: "High-value ($100+)",  desc: "Customers with lifetime spend over $100" },
];

export function CampaignManager({
  initialCampaigns,
  customerCount,
  subscribedCount,
  highValueCount,
}: {
  initialCampaigns: EmailCampaign[];
  customerCount: number;
  subscribedCount: number;
  highValueCount: number;
}) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [segment, setSegment] = useState<CampaignSegment>("all");
  const [preview, setPreview] = useState(false);

  const segmentCounts: Record<CampaignSegment, number> = {
    all: customerCount,
    subscribed: subscribedCount,
    high_value: highValueCount,
  };

  async function createCampaign() {
    if (!subject.trim() || !body.trim()) { toast.error("Subject and body required"); return; }
    setCreating(true);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, segment }),
    });
    const data = await res.json();
    setCreating(false);
    if (data.error) { toast.error(data.error); return; }
    setCampaigns((prev) => [data.campaign, ...prev]);
    setSubject("");
    setBody("");
    setSegment("all");
    toast.success("Campaign saved as draft");
  }

  async function sendCampaign(id: string, recipientCount: number) {
    if (!confirm(`Send to ${recipientCount} customers?`)) return;
    setSending(id);
    const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
    const data = await res.json();
    setSending(null);
    if (data.error) { toast.error(data.error); return; }
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: "sent" as const, sent_at: new Date().toISOString(), recipient_count: data.count }
          : c
      )
    );
    toast.success(`Sent to ${data.count} customers`);
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#16a34a] transition-colors";
  const selectedSegment = SEGMENTS.find((s) => s.value === segment)!;
  const recipientCount = segmentCounts[segment];

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "All customers", value: customerCount,   icon: Users },
          { label: "Subscribed",    value: subscribedCount, icon: Mail },
          { label: "High-value",    value: highValueCount,  icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
              <Icon className="h-4 w-4 text-gray-400" />
            </div>
            <p className="font-display font-bold text-2xl text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Compose */}
      <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
        <h2 className="font-display font-semibold text-sm text-gray-900 mb-5 flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Campaign
        </h2>
        <div className="space-y-3">
          <input
            placeholder="Subject line"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass}
          />

          {/* Segment picker */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
              <Users className="h-4 w-4 text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{selectedSegment.label}</p>
                <p className="text-[11px] text-gray-400">{recipientCount} recipients · {selectedSegment.desc}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as CampaignSegment)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
              >
                {SEGMENTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label} ({segmentCounts[s.value]})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <textarea
              placeholder={`Write your message...\n\nTip: use {{first_name}} to personalise — e.g. "Kia ora {{first_name}}, we've just dropped..."`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className={inputClass + " resize-none font-mono text-[13px]"}
            />
            {body && (
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 text-xs transition-colors"
              >
                {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {preview ? "Edit" : "Preview"}
              </button>
            )}
          </div>

          {/* Preview panel */}
          {preview && body && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 max-h-64 overflow-y-auto">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-widest">Preview</p>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                {body.replace(/\{\{first_name\}\}/g, "Aroha")}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Will send to <span className="text-gray-900 font-semibold">{recipientCount}</span> customers
            </p>
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
        {campaigns.map((c) => {
          const count = segmentCounts[c.segment as CampaignSegment] ?? customerCount;
          const openRate = c.recipient_count ? Math.round((c.opens / c.recipient_count) * 100) : 0;
          const clickRate = c.recipient_count ? Math.round((c.clicks / c.recipient_count) * 100) : 0;
          return (
            <div key={c.id} className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <p className="font-medium text-sm text-gray-900 truncate">{c.subject}</p>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0",
                      c.status === "sent"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    )}>
                      {c.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 shrink-0">
                      {SEGMENTS.find((s) => s.value === c.segment)?.label ?? c.segment}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {c.status === "sent"
                      ? `Sent ${new Date(c.sent_at!).toLocaleDateString("en-NZ")} · ${c.recipient_count} recipients`
                      : `Draft · ${count} recipients · Created ${new Date(c.created_at).toLocaleDateString("en-NZ")}`}
                  </p>
                </div>

                {c.status === "draft" && (
                  <button
                    onClick={() => sendCampaign(c.id, count)}
                    disabled={sending === c.id || count === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16a34a] text-white text-xs font-semibold hover:bg-[#15803d] transition-colors disabled:opacity-50 shrink-0"
                  >
                    {sending === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    Send Now
                  </button>
                )}
              </div>

              {/* Engagement stats */}
              {c.status === "sent" && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">{c.opens}</span>
                    <span className="text-xs text-gray-400">opens · {openRate}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MousePointerClick className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">{c.clicks}</span>
                    <span className="text-xs text-gray-400">clicks · {clickRate}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {campaigns.length === 0 && (
          <p className="text-center py-10 text-gray-400 text-sm">No campaigns yet. Write one above.</p>
        )}
      </div>
    </div>
  );
}
