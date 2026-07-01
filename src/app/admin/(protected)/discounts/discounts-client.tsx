"use client";

import { useState, useRef, useEffect } from "react";
import type { DiscountCode } from "@/types/database";
import { Plus, X, Copy, Tag, Hash, BarChart2, MoreHorizontal, Check, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isActive(c: DiscountCode) {
  if (!c.active) return false;
  if (c.expires_at && new Date(c.expires_at) < new Date()) return false;
  if (c.max_uses !== null && c.uses >= c.max_uses) return false;
  return true;
}

function statusLabel(c: DiscountCode) {
  if (!c.active) return "Inactive";
  if (c.expires_at && new Date(c.expires_at) < new Date()) return "Expired";
  if (c.max_uses !== null && c.uses >= c.max_uses) return "Maxed";
  return "Active";
}

// ─── Action menu ─────────────────────────────────────────────────────────────

function ActionMenu({ code, onEdit, onToggle, onDelete }: {
  code: DiscountCode;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ height: 28, width: 28, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)" }}
      >
        <MoreHorizontal style={{ width: 15, height: 15 }} />
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, top: 34, width: 176, background: "rgba(6,21,12,0.98)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.5)", zIndex: 50, padding: "4px 0", overflow: "hidden" }}>
          <button
            onClick={() => { navigator.clipboard.writeText(code.code); toast.success("Copied"); setOpen(false); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: 13, color: "rgba(255,255,255,0.8)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <Copy style={{ width: 13, height: 13 }} />
            Copy code
          </button>
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: 13, color: "rgba(255,255,255,0.8)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <Pencil style={{ width: 13, height: 13 }} />
            Edit
          </button>
          <button
            onClick={() => { onToggle(); setOpen(false); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: 13, color: "rgba(255,255,255,0.8)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            {code.active
              ? <><X style={{ width: 13, height: 13 }} /> Deactivate</>
              : <><Check style={{ width: 13, height: 13, color: "#4ade80" }} /> Activate</>
            }
          </button>
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontSize: 13, color: "#f87171", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}
          >
            <Trash2 style={{ width: 13, height: 13 }} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DiscountsClient({ codes: initial }: { codes: DiscountCode[] }) {
  const [codes, setCodes] = useState(initial);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<DiscountCode | null>(null);

  const activeCodes = codes.filter(isActive).length;
  const totalUses   = codes.reduce((sum, c) => sum + c.uses, 0);
  const totalCodes  = codes.length;

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/admin/discounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !current }),
    });
    if (res.ok) {
      setCodes(cs => cs.map(c => c.id === id ? { ...c, active: !current } : c));
      toast.success(!current ? "Code activated" : "Code deactivated");
    } else {
      toast.error("Failed to update discount code");
    }
  }

  function applyUpdate(updated: DiscountCode) {
    setCodes(cs => cs.map(c => c.id === updated.id ? updated : c));
  }

  async function deleteCode(id: string) {
    const res = await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCodes(cs => cs.filter(c => c.id !== id));
      toast.success("Code deleted");
    } else {
      const d = await res.json() as { error?: string };
      toast.error(d.error ?? `Delete failed (${res.status})`);
    }
  }

  const statCards = [
    { label: "Active Codes", value: activeCodes.toString(), sub: `${totalCodes} total`,                   icon: Tag       },
    { label: "Total Uses",   value: totalUses.toString(),   sub: "across all codes",                       icon: BarChart2 },
    { label: "Total Codes",  value: totalCodes.toString(),  sub: `${codes.length - activeCodes} inactive`, icon: Hash      },
  ];

  return (
    <div>
      <style>{`
        @media (max-width: 768px) { .discount-stats { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.1 }}>Discount Codes</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 6, fontSize: 14 }}>Create and manage promotional codes for your store.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ height: 42, padding: "0 20px", borderRadius: 9999, background: "#2f9b2f", color: "#fff", fontWeight: 900, fontSize: 13, border: "none", cursor: "pointer", letterSpacing: "0.08em", display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}
        >
          <Plus style={{ width: 15, height: 15 }} strokeWidth={2.5} />
          New Code
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="discount-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 18, marginBottom: 24 }}>
        {statCards.map(({ label, value, sub, icon: Icon }) => (
          <div
            key={label}
            style={{ background: "rgba(8,28,16,0.92)", borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(255,255,255,0.09)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{label}</p>
              <div style={{ height: 32, width: 32, borderRadius: 10, background: "rgba(47,155,47,0.15)", border: "1px solid rgba(47,155,47,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: 15, height: 15, color: "#4ade80" }} strokeWidth={1.8} />
              </div>
            </div>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: "monospace", marginTop: 4 }}>{value}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ background: "rgba(8,28,16,0.92)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.09)", overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontWeight: 800, fontSize: 15, color: "#ffffff" }}>All Codes</p>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{totalCodes} discount codes</span>
        </div>

        {codes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Tag style={{ width: 22, height: 22, color: "rgba(255,255,255,0.35)" }} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>No discount codes yet</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Create your first code to get started</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  {["Code", "Type", "Value", "Min Order", "Uses", "Expires", "Status", ""].map((h, i) => (
                    <th key={i} style={{ textAlign: i === 7 ? "right" : "left", padding: "12px 16px", fontWeight: 700, fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => {
                  const active  = isActive(c);
                  const status  = statusLabel(c);

                  let statusStyle: React.CSSProperties;
                  if (active) {
                    statusStyle = { background: "rgba(47,155,47,0.2)", color: "#4ade80", border: "1px solid rgba(47,155,47,0.3)" };
                  } else if (status === "Expired") {
                    statusStyle = { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" };
                  } else if (status === "Maxed") {
                    statusStyle = { background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" };
                  } else {
                    statusStyle = { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" };
                  }

                  return (
                    <tr
                      key={c.id}
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Code */}
                      <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <code style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 13, color: "#4ade80", letterSpacing: "0.05em", background: "rgba(47,155,47,0.15)", border: "1px solid rgba(47,155,47,0.3)", padding: "2px 8px", borderRadius: 6 }}>
                            {c.code}
                          </code>
                          <button
                            onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copied"); }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: 0 }}
                          >
                            <Copy style={{ width: 12, height: 12 }} />
                          </button>
                        </div>
                      </td>

                      {/* Type */}
                      <td style={{ padding: "13px 16px", color: "rgba(255,255,255,0.5)", verticalAlign: "middle", textTransform: "capitalize" }}>
                        {c.type === "fixed" && c.value === 0 ? "Free shipping" : c.type}
                      </td>

                      {/* Value */}
                      <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: c.type === "fixed" && c.value === 0 ? "#4ade80" : "#ffffff" }}>
                          {c.type === "fixed" && c.value === 0
                            ? "Free shipping"
                            : c.type === "percentage"
                              ? `${c.value}%`
                              : `$${(c.value / 100).toFixed(2)}`}
                        </span>
                      </td>

                      {/* Min order */}
                      <td style={{ padding: "13px 16px", color: "rgba(255,255,255,0.5)", verticalAlign: "middle", fontFamily: "monospace" }}>
                        {c.min_order_cents ? `$${(c.min_order_cents / 100).toFixed(0)}` : "—"}
                      </td>

                      {/* Uses */}
                      <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                          {c.uses}
                          {c.max_uses ? <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 400 }}> / {c.max_uses}</span> : ""}
                        </span>
                      </td>

                      {/* Expires */}
                      <td style={{ padding: "13px 16px", color: "rgba(255,255,255,0.5)", verticalAlign: "middle" }}>
                        {c.expires_at
                          ? new Date(c.expires_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })
                          : <span style={{ color: "rgba(255,255,255,0.35)" }}>Never</span>}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "13px 16px", verticalAlign: "middle" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800,
                          ...statusStyle,
                        }}>
                          {active && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", marginRight: 6, display: "inline-block" }} />}
                          {status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "13px 16px", verticalAlign: "middle", textAlign: "right" }}>
                        <ActionMenu
                          code={c}
                          onEdit={() => setEditTarget(c)}
                          onToggle={() => toggleActive(c.id, c.active)}
                          onDelete={() => deleteCode(c.id)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={(code) => { setCodes(p => [code, ...p]); setShowCreate(false); }}
        />
      )}

      {editTarget && (
        <EditModal
          code={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(updated) => { applyUpdate(updated); setEditTarget(null); }}
        />
      )}
    </div>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditModal({ code, onClose, onSave }: { code: DiscountCode; onClose: () => void; onSave: (c: DiscountCode) => void }) {
  const initialType: "percentage" | "fixed" | "free_shipping" =
    code.type === "fixed" && code.value === 0 ? "free_shipping" : (code.type as "percentage" | "fixed");

  const [form, setForm] = useState({
    type: initialType,
    value: initialType === "free_shipping" ? "" : initialType === "percentage" ? String(code.value) : (code.value / 100).toFixed(2),
    min_order: code.min_order_cents ? (code.min_order_cents / 100).toFixed(2) : "",
    max_uses: code.max_uses != null ? String(code.max_uses) : "",
    expires_at: code.expires_at ? new Date(code.expires_at).toISOString().slice(0, 10) : "",
    active: code.active,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fieldStyle: React.CSSProperties = {
    width: "100%", height: 40, padding: "0 14px", borderRadius: 10,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    fontSize: 13, color: "#fff", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 6,
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/discounts/${code.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        value: form.type === "free_shipping" ? 0 : form.type === "percentage" ? parseInt(form.value) : Math.round(parseFloat(form.value) * 100),
        min_order_cents: form.min_order ? Math.round(parseFloat(form.min_order) * 100) : 0,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
        active: form.active,
      }),
    });
    if (!res.ok) {
      const d = await res.json() as { error: string };
      setError(d.error);
      setLoading(false);
      return;
    }
    const updated = await res.json() as DiscountCode;
    onSave(updated);
    toast.success("Discount code updated");
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: 16 }}>
      <div style={{ background: "#0d1a12", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, width: "100%", maxWidth: 440, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", margin: 0 }}>Edit Discount Code</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4, fontFamily: "monospace" }}>{code.code}</p>
          </div>
          <button onClick={onClose} style={{ height: 32, width: 32, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <form onSubmit={submit} style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as "percentage" | "fixed" | "free_shipping" }))}
                style={fieldStyle}
              >
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
                <option value="free_shipping">Free shipping</option>
              </select>
            </div>
            {form.type !== "free_shipping" && (
              <div>
                <label style={labelStyle}>{form.type === "percentage" ? "Discount %" : "Amount ($)"}</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  placeholder={form.type === "percentage" ? "20" : "10.00"}
                  style={fieldStyle}
                />
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Min Order ($)</label>
              <input type="number" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))} placeholder="0" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Max Uses</label>
              <input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="Unlimited" style={fieldStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Expiry date (leave blank for never)</label>
            <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} style={fieldStyle} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "#2f9b2f", cursor: "pointer" }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>Active</span>
          </label>

          {error && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "12px 16px" }}>
              <X style={{ width: 14, height: 14, color: "#f87171", marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: "#f87171" }}>{error}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, height: 40, padding: "0 16px", borderRadius: 9999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, height: 42, padding: "0 20px", borderRadius: 9999, background: "#2f9b2f", color: "#fff", fontWeight: 900, fontSize: 13, border: "none", cursor: "pointer", letterSpacing: "0.08em", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Create modal ─────────────────────────────────────────────────────────────

function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (c: DiscountCode) => void }) {
  const [form, setForm] = useState({
    code: "", type: "percentage" as "percentage" | "fixed" | "free_shipping",
    value: "", min_order: "", max_uses: "", expires_at: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fieldStyle: React.CSSProperties = {
    width: "100%", height: 40, padding: "0 14px", borderRadius: 10,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    fontSize: 13, color: "#fff", outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "rgba(255,255,255,0.7)", marginBottom: 6,
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code.toUpperCase(),
        type: form.type,
        value: form.type === "free_shipping" ? 0 : form.type === "percentage" ? parseInt(form.value) : Math.round(parseFloat(form.value) * 100),
        min_order_cents: form.min_order ? Math.round(parseFloat(form.min_order) * 100) : 0,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
      }),
    });
    if (!res.ok) {
      const d = await res.json() as { error: string };
      setError(d.error);
      setLoading(false);
      return;
    }
    const created = await res.json() as DiscountCode;
    onCreate(created);
    toast.success("Discount code created");
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: 16 }}>
      <div style={{ background: "#0d1a12", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, width: "100%", maxWidth: 440, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", margin: 0 }}>New Discount Code</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Create a promo code for your store</p>
          </div>
          <button onClick={onClose} style={{ height: 32, width: 32, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <form onSubmit={submit} style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Code</label>
            <input
              required
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, "") }))}
              placeholder="SUMMER20"
              style={{ ...fieldStyle, fontFamily: "monospace", letterSpacing: "0.1em", fontWeight: 800 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as "percentage" | "fixed" | "free_shipping" }))}
                style={{ ...fieldStyle }}
              >
                <option value="percentage">Percentage off</option>
                <option value="fixed">Fixed amount off</option>
                <option value="free_shipping">Free shipping</option>
              </select>
            </div>
            {form.type !== "free_shipping" && (
              <div>
                <label style={labelStyle}>
                  {form.type === "percentage" ? "Discount %" : "Amount ($)"}
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  placeholder={form.type === "percentage" ? "20" : "10.00"}
                  style={fieldStyle}
                />
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Min Order ($)</label>
              <input type="number" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))} placeholder="0" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Max Uses</label>
              <input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="Unlimited" style={fieldStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Expiry date (optional)</label>
            <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} style={fieldStyle} />
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "12px 16px" }}>
              <X style={{ width: 14, height: 14, color: "#f87171", marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: "#f87171" }}>{error}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, height: 40, padding: "0 16px", borderRadius: 9999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, height: 42, padding: "0 20px", borderRadius: 9999, background: "#2f9b2f", color: "#fff", fontWeight: 900, fontSize: 13, border: "none", cursor: "pointer", letterSpacing: "0.08em", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Creating…" : "Create code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
