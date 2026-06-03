"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Printer, Loader2, ChevronDown, PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Order, OrderWithItems, ShippingAddress, OrderItem } from "@/types/database";

type OrderRow = Order & { order_items: { quantity: number; product_name: string; size: string }[] };

const PAYMENT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  paid:      { bg: "#dcfce7", color: "#166534", label: "Paid" },
  pending:   { bg: "#fef3c7", color: "#92400e", label: "Pending" },
  refunded:  { bg: "#f3f4f6", color: "#6b7280", label: "Refunded" },
  cancelled: { bg: "#fee2e2", color: "#b91c1c", label: "Cancelled" },
};

const FULFILLMENT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  unfulfilled: { bg: "#fef3c7", color: "#92400e", label: "Unfulfilled" },
  shipped:     { bg: "#dbeafe", color: "#1e40af", label: "Shipped" },
  fulfilled:   { bg: "#dcfce7", color: "#166534", label: "Fulfilled" },
  cancelled:   { bg: "#fee2e2", color: "#b91c1c", label: "Cancelled" },
  returned:    { bg: "#f3f4f6", color: "#6b7280", label: "Returned" },
};

function getPayment(status: string) {
  if (status === "cancelled") return "cancelled";
  if (status === "refunded") return "refunded";
  if (status === "pending") return "pending";
  return "paid";
}

function getFulfillment(status: string) {
  if (status === "pending" || status === "processing") return "unfulfilled";
  if (status === "shipped") return "shipped";
  if (status === "delivered") return "fulfilled";
  if (status === "cancelled") return "cancelled";
  if (status === "refunded") return "returned";
  return "unfulfilled";
}

function formatDate(d: string) {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

const BADGE_BASE: React.CSSProperties = {
  display: "inline-flex", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800,
};

/* ── Print invoice renderer ───────────────────────────────────── */
function renderInvoices(orders: OrderWithItems[]): string {
  return orders.map((o, idx) => {
    const addr = o.shipping_address as ShippingAddress;
    const items = o.order_items as OrderItem[];
    const isLast = idx === orders.length - 1;

    const itemRows = items.map((item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;vertical-align:top;">
          <div style="font-weight:700;color:#111;">${item.product_name}</div>
          <div style="font-size:11px;color:#888;margin-top:2px;">Size ${item.size}</div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center;vertical-align:top;">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;font-weight:700;font-family:monospace;vertical-align:top;">$${((item.unit_price * item.quantity) / 100).toFixed(2)}</td>
      </tr>
    `).join("");

    const discount = (o as any).discount_amount_cents > 0
      ? `<div style="display:flex;justify-content:space-between;padding:4px 0;color:#555;font-size:13px;"><span>Discount</span><span style="font-family:monospace;">−$${((o as any).discount_amount_cents / 100).toFixed(2)}</span></div>`
      : "";

    const tracking = o.tracking_number
      ? `<div style="margin-top:18px;"><div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.18em;color:#666;margin-bottom:6px;">Tracking</div><div style="font-family:monospace;font-weight:700;font-size:13px;">${o.tracking_number}</div></div>`
      : "";

    return `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;color:#111;padding:40px 48px;background:#fff;${isLast ? "" : "page-break-after:always;"}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:18px;border-bottom:2px solid #111;">
          <div>
            <div style="font-size:22px;font-weight:900;letter-spacing:-0.02em;">NINE2FIVE</div>
            <div style="font-size:11px;color:#666;margin-top:3px;letter-spacing:0.08em;text-transform:uppercase;">nine2five.nz · Masterton, New Zealand</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:20px;font-weight:900;font-family:monospace;">Order #${o.order_number}</div>
            <div style="font-size:12px;color:#666;margin-top:4px;">${new Date(o.created_at).toLocaleDateString("en-NZ", { dateStyle: "long" })}</div>
            <div style="margin-top:8px;display:inline-block;padding:2px 10px;border:1px solid #ccc;border-radius:999px;font-size:11px;font-weight:800;">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 260px;gap:32px;">
          <div>
            <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.18em;color:#666;margin-bottom:12px;">Order Items</div>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left;font-size:11px;font-weight:700;padding:8px 0;border-bottom:1px solid #ddd;color:#666;">Product</th>
                  <th style="text-align:center;font-size:11px;font-weight:700;padding:8px 0;border-bottom:1px solid #ddd;color:#666;">Qty</th>
                  <th style="text-align:right;font-size:11px;font-weight:700;padding:8px 0;border-bottom:1px solid #ddd;color:#666;">Price</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
            <div style="margin-top:12px;border-top:1px solid #ddd;padding-top:12px;">
              <div style="display:flex;justify-content:space-between;padding:4px 0;color:#555;font-size:13px;"><span>Subtotal</span><span style="font-family:monospace;">$${(o.subtotal / 100).toFixed(2)}</span></div>
              <div style="display:flex;justify-content:space-between;padding:4px 0;color:#555;font-size:13px;"><span>Shipping</span><span style="font-family:monospace;">${o.shipping_cost === 0 ? "Free" : `$${(o.shipping_cost / 100).toFixed(2)}`}</span></div>
              ${discount}
              <div style="display:flex;justify-content:space-between;padding:10px 0;color:#111;font-size:15px;font-weight:900;border-top:1px solid #111;margin-top:6px;"><span>Total</span><span style="font-family:monospace;">$${(o.total / 100).toFixed(2)} NZD</span></div>
            </div>
          </div>

          <div>
            <div style="margin-bottom:20px;">
              <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.18em;color:#666;margin-bottom:8px;">Customer</div>
              <div style="font-weight:700;font-size:13px;">${addr.first_name} ${addr.last_name}</div>
              <div style="color:#555;font-size:13px;line-height:1.7;">${o.guest_email ?? ""}</div>
              ${addr.phone ? `<div style="color:#555;font-size:13px;">${addr.phone}</div>` : ""}
            </div>
            <div>
              <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.18em;color:#666;margin-bottom:8px;">Ship To</div>
              <div style="color:#333;font-size:13px;line-height:1.7;">${addr.first_name} ${addr.last_name}<br>${addr.line1}${addr.line2 ? "<br>" + addr.line2 : ""}<br>${addr.city} ${addr.postcode}${addr.region ? "<br>" + addr.region : ""}<br>${addr.country}</div>
            </div>
            ${tracking}
          </div>
        </div>

        <div style="margin-top:40px;padding-top:14px;border-top:1px solid #ddd;text-align:center;font-size:11px;color:#aaa;">
          Thank you for your order · nine2five.nz · support@nine2five.nz
        </div>
      </div>
    `;
  }).join("");
}

/* ── Main component ───────────────────────────────────────────── */
export function OrdersTableClient({ orders, now }: { orders: OrderRow[]; now: number }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [printing, setPrinting] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);
  const [fulfillingRow, setFulfillingRow] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});
  const [peekId, setPeekId] = useState<string | null>(null);
  const router = useRouter();
  const [peekPos, setPeekPos] = useState<{ top: number; right: number } | null>(null);
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target as Element).closest("[data-peek]")) { setPeekId(null); setPeekPos(null); }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function openPeek(id: string, btn: HTMLElement) {
    if (peekId === id) { setPeekId(null); setPeekPos(null); return; }
    const rect = btn.getBoundingClientRect();
    setPeekPos({ top: rect.bottom + window.scrollY + 6, right: window.innerWidth - rect.right });
    setPeekId(id);
  }

  const peekOrder = peekId ? orders.find((o) => o.id === peekId) : null;

  const allChecked = orders.length > 0 && orders.every((o) => selected.has(o.id));

  function toggleAll() {
    if (allChecked) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map((o) => o.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const handleBulkPrint = useCallback(async () => {
    if (selected.size === 0) return;
    setPrinting(true);
    try {
      const res = await fetch("/api/admin/orders/bulk-print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const fullOrders: OrderWithItems[] = await res.json();

      // Sort by order_number ascending
      fullOrders.sort((a, b) => (a.order_number ?? 0) - (b.order_number ?? 0));

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Orders Print</title><style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#fff;}
        @media print{@page{margin:0;size:A4;}}
      </style></head><body>${renderInvoices(fullOrders)}</body></html>`;

      // Use iframe for printing to avoid navigating away
      let frame = printFrameRef.current;
      if (!frame) {
        frame = document.createElement("iframe");
        frame.style.position = "fixed";
        frame.style.top = "-9999px";
        frame.style.left = "-9999px";
        frame.style.width = "210mm";
        frame.style.height = "297mm";
        document.body.appendChild(frame);
        printFrameRef.current = frame;
      }

      const doc = frame.contentDocument || frame.contentWindow?.document;
      if (!doc) return;
      doc.open();
      doc.write(html);
      doc.close();

      frame.contentWindow?.focus();
      setTimeout(() => {
        frame!.contentWindow?.print();
        setPrinting(false);
      }, 400);
    } catch (err) {
      console.error(err);
      setPrinting(false);
    }
  }, [selected]);

  const handleBulkFulfill = useCallback(async () => {
    if (selected.size === 0) return;
    setFulfilling(true);
    try {
      const res = await fetch("/api/admin/orders/bulk-fulfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (res.ok) {
        const fulfilled = new Set(selected);
        setLocalStatuses((prev) => {
          const next = { ...prev };
          fulfilled.forEach((id) => { next[id] = "shipped"; });
          return next;
        });
        setSelected(new Set());
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
    setFulfilling(false);
  }, [selected, router]);

  const handleFulfillOne = useCallback(async (orderId: string) => {
    setFulfillingRow(orderId);
    try {
      const res = await fetch("/api/admin/orders/bulk-fulfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [orderId] }),
      });
      if (res.ok) {
        setLocalStatuses((prev) => ({ ...prev, [orderId]: "shipped" }));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
    setFulfillingRow(null);
  }, [router]);

  return (
    <>
      {/* Floating bulk action bar */}
      {selected.size > 0 && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 999, padding: "10px 20px", display: "flex", alignItems: "center", gap: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 100, backdropFilter: "blur(12px)",
          color: "#fff", whiteSpace: "nowrap",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
            {selected.size} order{selected.size !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={() => setSelected(new Set())}
            style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}
          >
            Clear
          </button>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
          <button
            onClick={handleBulkPrint}
            disabled={printing}
            style={{
              height: 36, padding: "0 18px", borderRadius: 999, background: "#334155",
              color: "#fff", fontWeight: 800, fontSize: 13, border: "none", cursor: printing ? "not-allowed" : "pointer",
              display: "inline-flex", alignItems: "center", gap: 7, opacity: printing ? 0.7 : 1,
              transition: "background 0.2s",
            }}
          >
            {printing ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Printer style={{ width: 14, height: 14 }} />}
            {printing ? "Preparing…" : `Print ${selected.size}`}
          </button>
          <button
            onClick={handleBulkFulfill}
            disabled={fulfilling}
            style={{
              height: 36, padding: "0 18px", borderRadius: 999, background: "#2f9b2f",
              color: "#fff", fontWeight: 800, fontSize: 13, border: "none", cursor: fulfilling ? "not-allowed" : "pointer",
              display: "inline-flex", alignItems: "center", gap: 7, opacity: fulfilling ? 0.7 : 1,
              transition: "background 0.2s",
            }}
          >
            {fulfilling ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <PackageCheck style={{ width: 14, height: 14 }} />}
            {fulfilling ? "Fulfilling…" : `Fulfill ${selected.size} Order${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 900 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <th style={{ padding: "12px 16px", width: 44 }}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#2f9b2f" }}
                />
              </th>
              {["Order", "Date Created", "Customer", "Payment", "Fulfillment", "Total", ""].map((h, i) => (
                <th key={i} style={{ textAlign: "left", padding: "12px 16px", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => {
              const addr = order.shipping_address as { first_name?: string; last_name?: string };
              const effectiveStatus = localStatuses[order.id] ?? order.status;
              const paymentKey = getPayment(effectiveStatus);
              const fulfillmentKey = getFulfillment(effectiveStatus);
              const payment = PAYMENT_BADGE[paymentKey];
              const fulfillment = FULFILLMENT_BADGE[fulfillmentKey];
              const isUnfulfilled = fulfillmentKey === "unfulfilled";
              const customerName = [addr?.first_name, addr?.last_name].filter(Boolean).join(" ");
              const isNew = now - new Date(order.created_at).getTime() < 24 * 60 * 60 * 1000;
              const isChecked = selected.has(order.id);
              const initials = [addr?.first_name?.[0], addr?.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";

              return (
                <tr
                  key={order.id}
                  style={{ borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.06)" : undefined, background: isChecked ? "rgba(47,155,47,0.07)" : undefined, transition: "background 0.1s" }}
                >
                  {/* Checkbox */}
                  <td style={{ padding: "14px 16px", verticalAlign: "middle" }} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleOne(order.id)}
                      style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#2f9b2f" }} />
                  </td>

                  {/* Order # */}
                  <td style={{ padding: "14px 16px", verticalAlign: "middle", position: "relative" }}>
                    <Link href={`/admin/orders/${order.id}`} style={{ position: "absolute", inset: 0, zIndex: 0 }} aria-label={`View order #${order.order_number}`} />
                    <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 13, color: "#fff" }}>
                        #{order.order_number}
                      </span>
                      {isNew && (
                        <span style={{ display: "inline-flex", padding: "1px 6px", background: "rgba(47,155,47,0.25)", color: "#4ade80", borderRadius: 4, fontSize: 9, fontWeight: 900, border: "1px solid rgba(47,155,47,0.3)" }}>
                          NEW
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td style={{ padding: "14px 16px", color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap", verticalAlign: "middle", fontSize: 12 }}>
                    {formatDate(order.created_at)}
                  </td>

                  {/* Customer */}
                  <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(47,155,47,0.15)", border: "1px solid rgba(47,155,47,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#2f9b2f", flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", margin: 0 }}>
                          {customerName || <span style={{ color: "rgba(255,255,255,0.3)" }}>Guest</span>}
                        </p>
                        {order.guest_email && (
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {order.guest_email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Payment */}
                  <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                    <span style={{ ...BADGE_BASE, background: payment.bg, color: payment.color }}>{payment.label}</span>
                  </td>

                  {/* Fulfillment */}
                  <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                    <span style={{ ...BADGE_BASE, background: fulfillment.bg, color: fulfillment.color }}>{fulfillment.label}</span>
                  </td>

                  {/* Total */}
                  <td style={{ padding: "14px 16px", verticalAlign: "middle", fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#fff" }}>
                    NZ${(order.total / 100).toFixed(2)}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "14px 16px", verticalAlign: "middle", position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                      <button
                        data-peek
                        onClick={(e) => { e.stopPropagation(); openPeek(order.id, e.currentTarget); }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "4px 10px", borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: peekId === order.id ? "rgba(47,155,47,0.15)" : "rgba(255,255,255,0.05)",
                          color: peekId === order.id ? "#4ade80" : "rgba(255,255,255,0.55)",
                          fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                        }}
                      >
                        Items
                        <ChevronDown style={{ width: 11, height: 11, transition: "transform 0.2s", transform: peekId === order.id ? "rotate(180deg)" : "rotate(0deg)" }} />
                      </button>
                      {isUnfulfilled && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFulfillOne(order.id); }}
                          disabled={fulfillingRow === order.id}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "4px 10px", borderRadius: 8,
                            border: "1px solid rgba(47,155,47,0.3)",
                            background: "rgba(47,155,47,0.12)", color: "#4ade80",
                            fontSize: 12, fontWeight: 700, cursor: fulfillingRow === order.id ? "not-allowed" : "pointer",
                            transition: "all 0.15s", opacity: fulfillingRow === order.id ? 0.6 : 1,
                          }}
                        >
                          {fulfillingRow === order.id
                            ? <Loader2 style={{ width: 11, height: 11 }} className="animate-spin" />
                            : <PackageCheck style={{ width: 11, height: 11 }} />}
                          Fulfill
                        </button>
                      )}
                      <Link href={`/admin/orders/${order.id}`}
                        style={{ fontSize: 12, fontWeight: 700, color: "#2f9b2f", textDecoration: "none", padding: "4px 8px", borderRadius: 8, border: "1px solid rgba(47,155,47,0.25)", background: "rgba(47,155,47,0.08)" }}>
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            No orders found.
          </div>
        )}
      </div>

      {/* Portal dropdown — renders outside scroll container */}
      {mounted && peekOrder && peekPos && createPortal(
        <div
          data-peek
          style={{
            position: "absolute", top: peekPos.top, right: peekPos.right, zIndex: 9999,
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)", padding: "10px 0",
            minWidth: 260, maxWidth: 320,
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8", padding: "0 14px 8px" }}>
            Order #{peekOrder.order_number}
          </p>
          {peekOrder.order_items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 14px", gap: 12, borderTop: "1px solid #f1f5f9" }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{item.product_name}</p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>Size {item.size}</p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#2f9b2f", background: "#f0fdf4", padding: "2px 8px", borderRadius: 6, flexShrink: 0 }}>
                ×{item.quantity}
              </span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
