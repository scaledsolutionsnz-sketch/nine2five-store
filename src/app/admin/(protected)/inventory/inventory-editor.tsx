"use client";

import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Minus, History, X, AlertTriangle } from "lucide-react";
import type { StockMovement } from "@/types/database";

interface Variant { id: string; size: string; stock_quantity: number; }
interface Product { id: string; name: string; product_variants: Variant[]; }
type PanelKind = "adjust" | "history";
type OpenPanel = { variantId: string; kind: PanelKind } | null;

/** Under this many pairs a size counts as low. Same threshold as low_stock_view (migration 008). */
const LOW_STOCK = 10;

const ADJUSTMENT_TYPES = [
  { value: "restock",    label: "Restock"    },
  { value: "damaged",    label: "Damaged"    },
  { value: "returned",   label: "Returned"   },
  { value: "adjustment", label: "Adjustment" },
] as const;
type AdjType = typeof ADJUSTMENT_TYPES[number]["value"];

/* Sizes run smallest first: "6-9" before "10-13" (plain text order put 10-13 first). */
const APPAREL_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
function sizeRank(size: string) {
  const n = parseInt(size, 10);
  if (!Number.isNaN(n)) return n;
  const i = APPAREL_SIZES.indexOf(size.trim().toUpperCase());
  return i >= 0 ? 1000 + i : 2000;
}
const bySize = (a: string, b: string) => sizeRank(a) - sizeRank(b) || a.localeCompare(b);

function tone(qty: number) {
  if (qty === 0)        return { color: "#F87171", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.38)" };
  if (qty < LOW_STOCK)  return { color: "#FBBF24", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.38)" };
  return                       { color: "#ffffff", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)" };
}

const CELL_W = 72;
const thStyle = { padding: "12px 18px", textAlign: "left" as const, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" as const };
const tdStyle = { padding: "14px 18px", verticalAlign: "middle" as const };
/* The Design column stays put when the table scrolls sideways on a phone. Opaque fills match the card over the page. */
const stickyCol = (bg = "#081b10") => ({ position: "sticky" as const, left: 0, zIndex: 1, background: bg });
const fieldStyle = { height: 36, borderRadius: 9, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 13, outline: "none", colorScheme: "dark" as const };

async function postAdjust(body: { variantId: string; delta: number; type: AdjType; note: string | null }) {
  const res = await fetch("/api/admin/inventory/adjust", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json().catch(() => ({ error: "Could not reach the server" }))) as { newQuantity?: number; error?: string };
}

function IconButton({ active, activeColor, label, onClick, children }: { active: boolean; activeColor: string; label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button" onClick={onClick} title={label} aria-label={label} aria-pressed={active}
      style={{
        height: 30, width: 30, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        border: `1px solid ${active ? activeColor : "rgba(255,255,255,0.08)"}`,
        background: active ? "rgba(255,255,255,0.08)" : "transparent",
        color: active ? activeColor : "rgba(255,255,255,0.45)",
      }}
    >
      {children}
    </button>
  );
}

/** One size of one design: the stock number (type and press Enter to save) plus adjust and history buttons. */
function StockCell({ variant, label, open, onToggle, onSaved }: {
  variant: Variant;
  label: string;
  open: PanelKind | null;
  onToggle: (kind: PanelKind) => void;
  onSaved: (newQty: number) => void;
}) {
  const [draft, setDraft] = useState(String(variant.stock_quantity));
  const [saving, setSaving] = useState(false);
  // Keep the box in step when the number changes elsewhere (an Add/Remove adjustment).
  const [synced, setSynced] = useState(variant.stock_quantity);
  if (synced !== variant.stock_quantity) {
    setSynced(variant.stock_quantity);
    setDraft(String(variant.stock_quantity));
  }

  const parsed = /^\d+$/.test(draft.trim()) ? parseInt(draft, 10) : null;
  const dirty = parsed !== null && parsed !== variant.stock_quantity;
  const t = tone(variant.stock_quantity);

  async function save() {
    if (parsed === null) { setDraft(String(variant.stock_quantity)); return; }
    if (!dirty || saving) return;
    setSaving(true);
    const data = await postAdjust({ variantId: variant.id, delta: parsed - variant.stock_quantity, type: "adjustment", note: "Manual edit" });
    setSaving(false);
    if (data.error || data.newQuantity === undefined) { toast.error(data.error ?? "Could not save"); return; }
    onSaved(data.newQuantity);
    toast.success(`${label}: ${data.newQuantity} in stock`);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="text" inputMode="numeric" aria-label={`${label} stock`}
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ""))}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") { setDraft(String(variant.stock_quantity)); e.currentTarget.blur(); }
        }}
        style={{
          width: CELL_W, height: 38, borderRadius: 10, textAlign: "center", fontSize: 15, fontWeight: 800,
          fontVariantNumeric: "tabular-nums", outline: "none", colorScheme: "dark",
          border: `1px solid ${dirty ? "#2f9b2f" : t.border}`,
          background: dirty ? "rgba(47,155,47,0.14)" : t.bg,
          color: dirty ? "#4ade80" : t.color,
        }}
      />
      <IconButton active={open === "adjust"} activeColor="#4ade80" label={`Add or remove stock: ${label}`} onClick={() => onToggle("adjust")}>
        <Plus style={{ width: 14, height: 14 }} />
      </IconButton>
      <IconButton active={open === "history"} activeColor="#60A5FA" label={`Stock history: ${label}`} onClick={() => onToggle("history")}>
        <History style={{ width: 14, height: 14 }} />
      </IconButton>
      {saving && <Loader2 style={{ width: 14, height: 14, color: "rgba(255,255,255,0.5)" }} className="animate-spin" />}
    </div>
  );
}

function AdjustPanel({ variant, onApplied }: { variant: Variant; onApplied: (newQty: number) => void }) {
  const [delta, setDelta] = useState(1);
  const [adjType, setAdjType] = useState<AdjType>("restock");
  const [note, setNote] = useState("");
  const [applying, setApplying] = useState(false);
  const qty = variant.stock_quantity;

  async function apply(sign: 1 | -1) {
    setApplying(true);
    const data = await postAdjust({ variantId: variant.id, delta: delta * sign, type: adjType, note: note || null });
    setApplying(false);
    if (data.error || data.newQuantity === undefined) { toast.error(data.error ?? "Could not save"); return; }
    onApplied(data.newQuantity);
    toast.success(`${sign > 0 ? "+" : "−"}${delta} applied, now ${data.newQuantity}`);
  }

  const stepBtn = { ...fieldStyle, width: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button type="button" aria-label="One less" onClick={() => setDelta((d) => Math.max(1, d - 1))} style={stepBtn}>
          <Minus style={{ width: 14, height: 14 }} />
        </button>
        <input
          type="text" inputMode="numeric" aria-label="How many pairs"
          value={delta}
          onChange={(e) => setDelta(Math.max(1, parseInt(e.target.value.replace(/[^\d]/g, ""), 10) || 1))}
          style={{ ...fieldStyle, width: 64, textAlign: "center", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}
        />
        <button type="button" aria-label="One more" onClick={() => setDelta((d) => d + 1)} style={stepBtn}>
          <Plus style={{ width: 14, height: 14 }} />
        </button>
      </div>

      <select aria-label="Reason" value={adjType} onChange={(e) => setAdjType(e.target.value as AdjType)} style={{ ...fieldStyle, padding: "0 12px" }}>
        {ADJUSTMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      <input placeholder="Note (optional)" aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} style={{ ...fieldStyle, padding: "0 14px", width: 200 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontVariantNumeric: "tabular-nums" }}>
          Remove → <span style={{ color: "#F87171" }}>{Math.max(0, qty - delta)}</span> &nbsp;·&nbsp; Add → <span style={{ color: "#4ade80" }}>{qty + delta}</span>
        </span>
        <button
          type="button" onClick={() => apply(-1)} disabled={applying}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 16px", borderRadius: 999, background: "rgba(239,68,68,0.12)", color: "#F87171", border: "1px solid rgba(239,68,68,0.35)", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: applying ? 0.5 : 1 }}
        >
          {applying ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : <Minus style={{ width: 12, height: 12 }} />}
          Remove {delta}
        </button>
        <button
          type="button" onClick={() => apply(1)} disabled={applying}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 16px", borderRadius: 999, background: "#2f9b2f", color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", opacity: applying ? 0.5 : 1 }}
        >
          {applying ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : <Plus style={{ width: 12, height: 12 }} />}
          Add {delta}
        </button>
      </div>
    </div>
  );
}

function HistoryPanel({ variantId }: { variantId: string }) {
  const [movements, setMovements] = useState<StockMovement[] | null>(null);

  useEffect(() => {
    let live = true;
    fetch(`/api/admin/inventory/movements/${variantId}`)
      .then((r) => r.json())
      .then((d) => { if (live) setMovements(d.movements ?? []); })
      .catch(() => { if (live) setMovements([]); });
    return () => { live = false; };
  }, [variantId]);

  if (movements === null) {
    return <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.45)" }}><Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> Loading history…</p>;
  }
  if (movements.length === 0) return <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>No stock movements yet.</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {movements.map((m) => (
        <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{
              minWidth: 40, textAlign: "center", padding: "2px 6px", borderRadius: 6, fontSize: 11, fontWeight: 800, fontVariantNumeric: "tabular-nums",
              background: m.quantity > 0 ? "rgba(47,155,47,0.16)" : "rgba(239,68,68,0.14)",
              color: m.quantity > 0 ? "#4ade80" : "#F87171",
            }}>
              {m.quantity > 0 ? "+" : ""}{m.quantity}
            </span>
            <span style={{ color: "rgba(255,255,255,0.8)", textTransform: "capitalize" }}>{m.type}</span>
            {m.note && <span style={{ color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>· {m.note}</span>}
          </div>
          <span style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace", fontSize: 12, flexShrink: 0 }}>
            {new Date(m.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      ))}
    </div>
  );
}

export function InventoryEditor({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [open, setOpen] = useState<OpenPanel>(null);

  function setQty(variantId: string, newQty: number) {
    setProducts((prev) => prev.map((p) => ({
      ...p,
      product_variants: p.product_variants.map((v) => (v.id === variantId ? { ...v, stock_quantity: newQty } : v)),
    })));
  }

  function toggle(variantId: string, kind: PanelKind) {
    setOpen((o) => (o?.variantId === variantId && o.kind === kind ? null : { variantId, kind }));
  }

  const sizes = useMemo(
    () => [...new Set(products.flatMap((p) => p.product_variants.map((v) => v.size)))].sort(bySize),
    [products],
  );
  const variants = products.flatMap((p) => p.product_variants.map((v) => ({ ...v, product: p.name })));
  const sizeTotals = sizes.map((s) => variants.filter((v) => v.size === s).reduce((n, v) => n + v.stock_quantity, 0));
  const grandTotal = sizeTotals.reduce((n, t) => n + t, 0);
  const restock = variants
    .filter((v) => v.stock_quantity < LOW_STOCK)
    .sort((a, b) => a.stock_quantity - b.stock_quantity || a.product.localeCompare(b.product) || bySize(a.size, b.size));
  const outCount = restock.filter((v) => v.stock_quantity === 0).length;
  const lowCount = restock.length - outCount;
  const colCount = sizes.length + 2;

  function openAdjust(variantId: string) {
    setOpen({ variantId, kind: "adjust" });
    requestAnimationFrame(() => document.getElementById(`stock-${variantId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  return (
    <div>
      {/* Sizes to restock, live: updates as numbers are saved. Click one to restock it. */}
      {restock.length > 0 && (
        <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.28)", borderRadius: 16, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 3, color: "#FBBF24" }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 800, fontSize: 14, color: "#FBBF24" }}>
              {restock.length} size{restock.length !== 1 ? "s" : ""} need restocking
              <span style={{ fontWeight: 500, color: "rgba(251,191,36,0.7)" }}>
                {outCount > 0 && ` · ${outCount} out of stock`}{lowCount > 0 && ` · ${lowCount} running low`}
              </span>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {restock.map((v) => {
                const t = tone(v.stock_quantity);
                return (
                  <button
                    key={v.id} type="button" onClick={() => openAdjust(v.id)} title={`Restock ${v.product} ${v.size}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", background: t.bg, border: `1px solid ${t.border}`, color: "rgba(255,255,255,0.85)" }}
                  >
                    {v.product} {v.size}
                    <span style={{ fontWeight: 800, color: t.color, fontVariantNumeric: "tabular-nums" }}>{v.stock_quantity}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stock by design and size, with totals along the bottom */}
      <div style={{ borderRadius: 18, overflow: "hidden", background: "rgba(8,28,16,0.92)", border: "1px solid rgba(255,255,255,0.09)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 200 + sizes.length * 190, borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <th style={{ ...thStyle, ...stickyCol() }}>Design</th>
                {sizes.map((s) => <th key={s} style={thStyle}>Size {s}</th>)}
                <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan={colCount} style={{ padding: "48px 18px", textAlign: "center", color: "rgba(255,255,255,0.3)" }}>No active products.</td></tr>
              )}
              {products.map((product, i) => {
                const total = product.product_variants.reduce((n, v) => n + v.stock_quantity, 0);
                const openVariant = product.product_variants.find((v) => v.id === open?.variantId);
                return (
                  <Fragment key={product.id}>
                    <tr className="hover:bg-white/[0.02]" style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.06)" : undefined }}>
                      <td style={{ ...tdStyle, ...stickyCol(), fontWeight: 700, fontSize: 14, color: "#fff", whiteSpace: "nowrap" }}>{product.name}</td>
                      {sizes.map((s) => {
                        const inSize = product.product_variants.filter((v) => v.size === s);
                        return (
                          <td key={s} style={tdStyle}>
                            {inSize.length === 0 ? (
                              <span style={{ display: "inline-block", width: CELL_W, textAlign: "center", color: "rgba(255,255,255,0.2)" }}>—</span>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {inSize.map((v) => (
                                  <div key={v.id} id={`stock-${v.id}`}>
                                    <StockCell
                                      variant={v}
                                      label={`${product.name} ${v.size}`}
                                      open={open?.variantId === v.id ? open.kind : null}
                                      onToggle={(kind) => toggle(v.id, kind)}
                                      onSaved={(q) => setQty(v.id, q)}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td style={{ ...tdStyle, textAlign: "right", fontWeight: 800, fontSize: 15, fontVariantNumeric: "tabular-nums", color: total === 0 ? "#F87171" : "#fff" }}>{total}</td>
                    </tr>
                    {openVariant && open && (
                      <tr>
                        <td colSpan={colCount} style={{ padding: "0 18px 16px" }}>
                          <div style={{ borderRadius: 14, padding: "14px 16px", background: open.kind === "adjust" ? "rgba(47,155,47,0.08)" : "rgba(96,165,250,0.07)", border: `1px solid ${open.kind === "adjust" ? "rgba(47,155,47,0.25)" : "rgba(96,165,250,0.22)"}` }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(255,255,255,0.45)" }}>
                                {open.kind === "adjust" ? "Add or remove stock" : "Stock history"} · <span style={{ color: "#fff" }}>{product.name} {openVariant.size}</span>
                              </p>
                              <button type="button" aria-label="Close" onClick={() => setOpen(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.45)", display: "flex" }}>
                                <X style={{ width: 15, height: 15 }} />
                              </button>
                            </div>
                            {open.kind === "adjust"
                              ? <AdjustPanel key={openVariant.id} variant={openVariant} onApplied={(q) => setQty(openVariant.id, q)} />
                              : <HistoryPanel key={openVariant.id} variantId={openVariant.id} />}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
            {products.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.035)" }}>
                  <td style={{ ...tdStyle, ...stickyCol("#11231a"), fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>Total pairs</td>
                  {sizeTotals.map((t, i) => (
                    <td key={sizes[i]} style={tdStyle}>
                      <span style={{ display: "inline-block", width: CELL_W, textAlign: "center", fontWeight: 800, fontSize: 15, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{t}</span>
                    </td>
                  ))}
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 900, fontSize: 18, color: "#4ade80", fontVariantNumeric: "tabular-nums" }}>{grandTotal}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          <p>{products.length} design{products.length !== 1 ? "s" : ""} · {variants.length} sizes · type a number and press Enter to save it</p>
          <p style={{ display: "flex", gap: 14 }}>
            <span><span style={{ color: "#F87171" }}>●</span> Out of stock</span>
            <span><span style={{ color: "#FBBF24" }}>●</span> Under {LOW_STOCK}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
