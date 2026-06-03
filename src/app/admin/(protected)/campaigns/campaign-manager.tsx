"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Send, Plus, Loader2, Mail, Eye, EyeOff, MousePointerClick,
  Users, TrendingUp, ChevronDown,
} from "lucide-react";
import type { EmailCampaign, CampaignSegment } from "@/types/database";

const SEGMENTS: { value: CampaignSegment; label: string; desc: string }[] = [
  { value: "all",        label: "All customers",       desc: "Everyone who has placed an order" },
  { value: "subscribed", label: "Subscribed only",     desc: "Customers who opted in to marketing" },
  { value: "high_value", label: "High-value ($100+)",  desc: "Customers with lifetime spend over $100" },
];

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

  const selectedSegment = SEGMENTS.find((s) => s.value === segment)!;
  const recipientCount = segmentCounts[segment];

  const statCards = [
    { label: "All customers", value: customerCount,   icon: Users,      accent: "#4ade80", bg: "rgba(47,155,47,0.15)" },
    { label: "Subscribed",    value: subscribedCount, icon: Mail,       accent: "#4ade80", bg: "rgba(47,155,47,0.1)" },
    { label: "High-value",    value: highValueCount,  icon: TrendingUp, accent: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {statCards.map(({ label, value, icon: Icon, accent, bg }) => (
          <div key={label} style={{
            padding: 20,
            borderRadius: 14,
            background: "rgba(8,28,16,0.92)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}>
            <div style={{
              height: 32,
              width: 32,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: bg,
              marginBottom: 12,
            }}>
              <Icon style={{ width: 16, height: 16, color: accent }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: 24, color: "#ffffff", margin: 0 }}>{value}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Compose */}
      <div style={{
        padding: 24,
        borderRadius: 14,
        background: "rgba(8,28,16,0.92)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}>
        <h2 style={{
          fontWeight: 600,
          fontSize: 14,
          color: "#ffffff",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <Plus style={{ width: 16, height: 16 }} /> New Campaign
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            placeholder="Subject line"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={darkInput}
          />

          {/* Segment picker */}
          <div style={{ position: "relative" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <Users style={{ width: 16, height: 16, color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#ffffff", margin: 0 }}>{selectedSegment.label}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                  {recipientCount} recipients · {selectedSegment.desc}
                </p>
              </div>
              <ChevronDown style={{ width: 16, height: 16, color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as CampaignSegment)}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%" }}
              >
                {SEGMENTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label} ({segmentCounts[s.value]})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <textarea
              placeholder={`Write your message...\n\nTip: use {{first_name}} to personalise — e.g. "Kia ora {{first_name}}, we've just dropped..."`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              style={{
                ...darkInput,
                height: "auto",
                padding: "14px",
                resize: "none",
                fontFamily: "monospace",
                lineHeight: 1.6,
              }}
            />
            {body && (
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {preview
                  ? <EyeOff style={{ width: 13, height: 13 }} />
                  : <Eye style={{ width: 13, height: 13 }} />}
                {preview ? "Edit" : "Preview"}
              </button>
            )}
          </div>

          {/* Preview panel */}
          {preview && body && (
            <div style={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.09)",
              background: "rgba(255,255,255,0.04)",
              padding: "16px 20px",
              maxHeight: 256,
              overflowY: "auto",
            }}>
              <p style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.35)",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}>Preview</p>
              <div style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}>
                {body.replace(/\{\{first_name\}\}/g, "Aroha")}
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
              Will send to{" "}
              <span style={{ color: "#ffffff", fontWeight: 600 }}>{recipientCount}</span>{" "}
              customers
            </p>
            <button
              onClick={createCampaign}
              disabled={creating}
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
                cursor: creating ? "not-allowed" : "pointer",
                opacity: creating ? 0.5 : 1,
              }}
            >
              {creating ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Plus style={{ width: 16, height: 16 }} />}
              Save Draft
            </button>
          </div>
        </div>
      </div>

      {/* Campaign list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {campaigns.map((c) => {
          const count = segmentCounts[c.segment as CampaignSegment] ?? customerCount;
          const openRate = c.recipient_count ? Math.round((c.opens / c.recipient_count) * 100) : 0;
          const clickRate = c.recipient_count ? Math.round((c.clicks / c.recipient_count) * 100) : 0;
          const isSent = c.status === "sent";
          return (
            <div key={c.id} style={{
              padding: 20,
              borderRadius: 14,
              background: "rgba(8,28,16,0.92)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Mail style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
                    <p style={{ fontWeight: 500, fontSize: 14, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                      {c.subject}
                    </p>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "3px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      flexShrink: 0,
                      ...(isSent
                        ? { background: "rgba(47,155,47,0.2)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }
                        : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }),
                    }}>
                      {isSent ? "Sent" : "Draft"}
                    </span>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "3px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      flexShrink: 0,
                      background: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}>
                      {SEGMENTS.find((s) => s.value === c.segment)?.label ?? c.segment}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>
                    {isSent
                      ? `Sent ${new Date(c.sent_at!).toLocaleDateString("en-NZ")} · ${c.recipient_count} recipients`
                      : `Draft · ${count} recipients · Created ${new Date(c.created_at).toLocaleDateString("en-NZ")}`}
                  </p>
                </div>

                {c.status === "draft" && (
                  <button
                    onClick={() => sendCampaign(c.id, count)}
                    disabled={sending === c.id || count === 0}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      height: 36,
                      padding: "0 16px",
                      borderRadius: 9999,
                      background: "#2f9b2f",
                      border: "none",
                      color: "#ffffff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: (sending === c.id || count === 0) ? "not-allowed" : "pointer",
                      opacity: (sending === c.id || count === 0) ? 0.5 : 1,
                      flexShrink: 0,
                    }}
                  >
                    {sending === c.id
                      ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
                      : <Send style={{ width: 13, height: 13 }} />}
                    Send Now
                  </button>
                )}
              </div>

              {/* Engagement stats */}
              {isSent && (
                <div style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Eye style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>{c.opens}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>opens · {openRate}%</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MousePointerClick style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>{c.clicks}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>clicks · {clickRate}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {campaigns.length === 0 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "56px 0",
            borderRadius: 14,
            background: "rgba(8,28,16,0.92)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>No campaigns yet. Write one above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
