"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PlatformEntry = { platform: string; handle: string; followers: number; avgViews: number };

type Application = {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  age: number | null;
  story: string | null;
  platforms: PlatformEntry[] | null;
  content_types: string[] | null;
  posting_frequency: string | null;
  best_post_link: string | null;
  audience_ages: string[] | null;
  audience_gender_male_pct: number | null;
  audience_locations: string | null;
  is_athlete: boolean | null;
  sports: string[] | null;
  athlete_level: string | null;
  current_team: string | null;
  highest_achievement: string | null;
  posts_per_month: number | null;
  can_attend_events: boolean | null;
  can_do_video: boolean | null;
  has_camera_setup: boolean | null;
  skills: string[] | null;
  why_n2f: string | null;
  worn_before: boolean | null;
  current_brands: string | null;
  anything_else: string | null;
  status: string;
  admin_notes: string | null;
  tags: string[] | null;
};

const ALL_TAGS = [
  { value: "athlete",     label: "Athlete",      color: "#f59e0b" },
  { value: "creator",     label: "Creator",      color: "#3b82f6" },
  { value: "local",       label: "Local",        color: "#10b981" },
  { value: "high-reach",  label: "High Reach",   color: "#8b5cf6" },
  { value: "micro",       label: "Micro",        color: "#06b6d4" },
  { value: "fashion",     label: "Fashion",      color: "#ec4899" },
  { value: "sport",       label: "Sport",        color: "#f97316" },
  { value: "priority",    label: "Priority",     color: "#ef4444" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  new:       { bg: "rgba(59,130,246,0.15)", text: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  reviewing: { bg: "rgba(234,179,8,0.15)",  text: "#facc15", border: "rgba(234,179,8,0.3)"  },
  approved:  { bg: "rgba(46,139,40,0.2)",   text: "#4ade80", border: "rgba(74,222,128,0.4)" },
  rejected:  { bg: "rgba(239,68,68,0.15)",  text: "#f87171", border: "rgba(239,68,68,0.3)"  },
  waitlist:  { bg: "rgba(168,85,247,0.15)", text: "#c084fc", border: "rgba(168,85,247,0.3)" },
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n}`;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

function Badge({ text }: { text: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99,
      background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)",
      border: "1px solid rgba(255,255,255,0.1)",
    }}>{text}</span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.new;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      textTransform: "capitalize",
    }}>{status}</span>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null | boolean | number }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", minWidth: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#fff", lineHeight: 1.5 }}>
        {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
      </span>
    </div>
  );
}

function ApplicationDrawer({ app, onClose, onStatusChange }: {
  app: Application; onClose: () => void; onStatusChange: (id: string, status: string) => void;
}) {
  const [notes, setNotes] = useState(app.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function saveNotes() {
    setSaving(true);
    await supabase.from("ambassador_applications").update({ admin_notes: notes }).eq("id", app.id);
    setSaving(false);
  }

  async function setStatus(status: string) {
    await supabase.from("ambassador_applications").update({ status }).eq("id", app.id);
    onStatusChange(app.id, status);
  }

  const totalFollowers = (app.platforms ?? []).reduce((s, p) => s + (p.followers ?? 0), 0);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50, display: "flex",
    }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.6)" }} onClick={onClose} />
      <div style={{
        width: "min(640px, 100vw)", height: "100vh", overflowY: "auto",
        background: "#07180E", borderLeft: "1px solid rgba(46,139,40,0.2)",
        padding: "32px 28px", display: "flex", flexDirection: "column", gap: 24,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{app.name}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{app.email} · {app.city} · Age {app.age}</p>
            {app.story && (
              <p style={{ fontSize: 13, color: "#4ade80", marginTop: 8, fontStyle: "italic" }}>
                &ldquo;{app.story}&rdquo;
              </p>
            )}
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)",
            border: "none", color: "#fff", cursor: "pointer", fontSize: 18, flexShrink: 0,
          }}>×</button>
        </div>

        {/* Status controls */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", marginBottom: 8 }}>STATUS</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.keys(STATUS_COLORS).map(s => (
              <button key={s} onClick={() => void setStatus(s)} style={{
                padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                cursor: "pointer", textTransform: "capitalize",
                background: app.status === s ? STATUS_COLORS[s].bg : "rgba(255,255,255,0.05)",
                color: app.status === s ? STATUS_COLORS[s].text : "rgba(255,255,255,0.4)",
                border: `1.5px solid ${app.status === s ? STATUS_COLORS[s].border : "rgba(255,255,255,0.1)"}`,
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", marginBottom: 8 }}>CATEGORIES</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ALL_TAGS.map(tag => {
              const active = (app.tags ?? []).includes(tag.value);
              return (
                <button key={tag.value} type="button" onClick={async () => {
                  const current = app.tags ?? [];
                  const next = active ? current.filter(t => t !== tag.value) : [...current, tag.value];
                  await supabase.from("ambassador_applications").update({ tags: next }).eq("id", app.id);
                  app.tags = next;
                }} style={{
                  padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: active ? `${tag.color}25` : "rgba(255,255,255,0.05)",
                  color: active ? tag.color : "rgba(255,255,255,0.4)",
                  border: `1.5px solid ${active ? tag.color + "60" : "rgba(255,255,255,0.1)"}`,
                }}>{tag.label}</button>
              );
            })}
          </div>
        </div>

        {/* Social reach summary */}
        {(app.platforms ?? []).length > 0 && (
          <div style={{ borderRadius: 14, padding: "16px 18px", background: "rgba(46,139,40,0.1)", border: "1px solid rgba(46,139,40,0.2)" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 12, letterSpacing: "0.08em" }}>SOCIAL REACH</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>Total followers: <strong style={{ color: "#4ade80" }}>{fmt(totalFollowers)}</strong></p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(app.platforms ?? []).map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#fff", fontWeight: 600, textTransform: "capitalize" }}>{p.platform}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>@{p.handle}</span>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 700 }}>{fmt(p.followers)} followers</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{fmt(p.avgViews)} avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>APPLICATION DETAILS</p>
          <DetailRow label="Phone" value={app.phone} />
          <DetailRow label="Content types" value={(app.content_types ?? []).join(", ")} />
          <DetailRow label="Posting frequency" value={app.posting_frequency} />
          <DetailRow label="Best post" value={app.best_post_link} />
          <DetailRow label="Audience ages" value={(app.audience_ages ?? []).join(", ")} />
          <DetailRow label="Gender split" value={app.audience_gender_male_pct != null ? `${app.audience_gender_male_pct}% male · ${100 - app.audience_gender_male_pct}% female` : null} />
          <DetailRow label="Audience locations" value={app.audience_locations} />
          <DetailRow label="Posts/month committed" value={app.posts_per_month} />
          <DetailRow label="Can attend events" value={app.can_attend_events} />
          <DetailRow label="Can do video" value={app.can_do_video} />
          <DetailRow label="Has camera setup" value={app.has_camera_setup} />
          <DetailRow label="Skills" value={(app.skills ?? []).join(", ")} />
          <DetailRow label="Worn N2F before" value={app.worn_before} />
          <DetailRow label="Current brand deals" value={app.current_brands} />
        </div>

        {/* Athlete */}
        {app.is_athlete && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", letterSpacing: "0.08em" }}>🏅 ATHLETE</p>
            <DetailRow label="Sport(s)" value={(app.sports ?? []).join(", ")} />
            <DetailRow label="Level" value={app.athlete_level} />
            <DetailRow label="Team / Club" value={app.current_team} />
            <DetailRow label="Highest achievement" value={app.highest_achievement} />
          </div>
        )}

        {/* Why N2F */}
        {app.why_n2f && (
          <div style={{ borderRadius: 12, padding: "14px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8, letterSpacing: "0.08em" }}>WHY NINE2FIVE</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>{app.why_n2f}</p>
          </div>
        )}

        {app.anything_else && (
          <div style={{ borderRadius: 12, padding: "14px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8, letterSpacing: "0.08em" }}>ANYTHING ELSE</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>{app.anything_else}</p>
          </div>
        )}

        {/* Admin notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>ADMIN NOTES</p>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)} rows={4}
            placeholder="Internal notes about this applicant..."
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 13,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", outline: "none", resize: "vertical", lineHeight: 1.5,
            }}
          />
          <button onClick={() => void saveNotes()} disabled={saving} style={{
            alignSelf: "flex-end", padding: "8px 20px", borderRadius: 8,
            background: "#2E8B28", color: "#fff", border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 700,
          }}>
            {saving ? "Saving…" : "Save Notes"}
          </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_FILTERS = ["all", "new", "reviewing", "approved", "rejected", "waitlist"];

export function AmbassadorsClient({ applications: initial }: { applications: Application[] }) {
  const [apps, setApps] = useState<Application[]>(initial);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Application | null>(null);

  const filtered = filter === "all" ? apps : apps.filter(a => a.status === filter);

  function handleStatusChange(id: string, status: string) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  }

  const counts = STATUS_FILTERS.reduce((acc, s) => {
    acc[s] = s === "all" ? apps.length : apps.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ color: "#fff" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Ambassador Applications</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>{apps.length} total application{apps.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer",
            textTransform: "capitalize",
            background: filter === s ? "#2E8B28" : "rgba(255,255,255,0.06)",
            color: filter === s ? "#fff" : "rgba(255,255,255,0.5)",
            border: `1.5px solid ${filter === s ? "#4ade80" : "rgba(255,255,255,0.1)"}`,
          }}>
            {s} <span style={{ opacity: 0.7, marginLeft: 4 }}>{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "rgba(255,255,255,0.3)" }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📋</p>
          <p style={{ fontSize: 16 }}>No applications yet</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Share the application link to start receiving submissions.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(app => {
            const totalFollowers = (app.platforms ?? []).reduce((s, p) => s + (p.followers ?? 0), 0);
            const platformNames = (app.platforms ?? []).map(p => p.platform).join(", ");
            return (
              <div
                key={app.id}
                onClick={() => setSelected(app)}
                style={{
                  borderRadius: 14, padding: "16px 20px", cursor: "pointer",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(46,139,40,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
              >
                {/* Name + story */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{app.name ?? "—"}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{app.city ?? ""}{app.age ? ` · Age ${app.age}` : ""}</p>
                  {app.story && <p style={{ fontSize: 12, color: "rgba(74,222,128,0.8)", marginTop: 2, fontStyle: "italic" }}>&ldquo;{app.story}&rdquo;</p>}
                </div>

                {/* Platforms + followers */}
                <div style={{ minWidth: 140 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#4ade80" }}>{totalFollowers > 0 ? fmt(totalFollowers) : "—"} followers</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, textTransform: "capitalize" }}>{platformNames || "No platforms"}</p>
                </div>

                {/* Tags */}
                {(app.tags ?? []).map(t => {
                  const tag = ALL_TAGS.find(x => x.value === t);
                  return tag ? (
                    <span key={t} style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99,
                      background: `${tag.color}20`, color: tag.color, border: `1px solid ${tag.color}40`,
                    }}>{tag.label}</span>
                  ) : null;
                })}

                {/* Athlete */}
                {app.is_athlete && <Badge text={`🏅 ${(app.sports ?? []).slice(0, 2).join(", ")}`} />}

                {/* Posts/month */}
                {app.posts_per_month && <Badge text={`${app.posts_per_month} posts/mo`} />}

                {/* Date + status */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, marginLeft: "auto" }}>
                  <StatusBadge status={app.status} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{formatDate(app.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <ApplicationDrawer
          app={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
