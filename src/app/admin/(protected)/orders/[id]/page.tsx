export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { OrderActions } from "./order-actions";
import { NzPostLabel } from "./nz-post-label";
import { EShipButton } from "./eship-button";
import { PrintButton } from "./print-button";
import type { OrderWithItems, ShippingAddress } from "@/types/database";
import Link from "next/link";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const o = order as OrderWithItems;
  const addr = o.shipping_address as ShippingAddress;

  const STATUS_BADGE: Record<string, React.CSSProperties> = {
    pending:    { background: "#fef3c7", color: "#92400e" },
    processing: { background: "#dbeafe", color: "#1e40af" },
    shipped:    { background: "#dbeafe", color: "#1e40af" },
    delivered:  { background: "#dcfce7", color: "#166534" },
    cancelled:  { background: "#fee2e2", color: "#b91c1c" },
    refunded:   { background: "#f3f4f6", color: "#6b7280" },
  };

  const badgeStyle = STATUS_BADGE[o.status] ?? STATUS_BADGE.pending;

  const DARK_CARD: React.CSSProperties = {
    background: "rgba(8,28,16,0.92)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#06150C", color: "#f8f8f2", padding: "32px 28px" }}>

      {/* ── Print styles ── */}
      <style>{`
        @media print {
          /* Hide everything outside the printable area */
          body > * { display: none !important; }
          #print-order { display: block !important; }

          /* Flatten the Next.js app wrapper so #print-order is reachable */
          body, html { background: #fff !important; }
          body > div,
          body > div > div,
          body > div > div > div { display: contents !important; }

          #print-order {
            display: block !important;
            position: fixed !important;
            top: 0; left: 0; right: 0; bottom: 0;
            width: 100%;
            padding: 40px 48px;
            background: #fff !important;
            color: #111 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            font-size: 13px;
            z-index: 9999;
          }

          .print-hide { display: none !important; }

          .print-invoice-header {
            display: flex !important;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
            padding-bottom: 20px;
            border-bottom: 2px solid #111;
          }

          .print-brand { font-size: 22px; font-weight: 900; letter-spacing: -0.02em; color: #111; }
          .print-brand-sub { font-size: 11px; color: #666; margin-top: 3px; letter-spacing: 0.08em; text-transform: uppercase; }
          .print-order-meta { text-align: right; }
          .print-order-meta h2 { font-size: 20px; font-weight: 900; font-family: monospace; margin: 0 0 4px; }
          .print-order-meta p { font-size: 12px; color: #666; margin: 2px 0; }

          .print-columns { display: grid !important; grid-template-columns: 1fr 280px; gap: 32px; margin-top: 24px; }

          .print-section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em; color: #666; margin-bottom: 12px; }

          .print-items-table { width: 100%; border-collapse: collapse; }
          .print-items-table th { font-size: 11px; font-weight: 700; text-align: left; padding: 8px 0; border-bottom: 1px solid #ddd; color: #666; }
          .print-items-table th:last-child { text-align: right; }
          .print-items-table td { padding: 10px 0; border-bottom: 1px solid #eee; vertical-align: top; font-size: 13px; }
          .print-items-table td:last-child { text-align: right; font-weight: 700; font-family: monospace; }
          .print-item-name { font-weight: 700; color: #111; }
          .print-item-sub { font-size: 11px; color: #888; margin-top: 2px; }

          .print-totals { margin-top: 12px; border-top: 1px solid #ddd; padding-top: 12px; }
          .print-totals-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; color: #555; }
          .print-totals-row.total { font-size: 15px; font-weight: 900; color: #111; border-top: 1px solid #111; margin-top: 6px; padding-top: 10px; }
          .print-totals-row span:last-child { font-family: monospace; }

          .print-info-block { margin-bottom: 20px; }
          .print-info-block p { font-size: 13px; color: #333; line-height: 1.7; margin: 0; }

          .print-status-pill {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 800;
            border: 1px solid #ccc;
            color: #333;
          }

          .print-footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #aaa; }
        }
      `}</style>

      {/* ── Printable invoice (hidden on screen, shown when printing) ── */}
      <div id="print-order" style={{ display: "none" }}>
        <div className="print-invoice-header">
          <div>
            <div className="print-brand">NINE2FIVE</div>
            <div className="print-brand-sub">nine2five.nz · Masterton, New Zealand</div>
          </div>
          <div className="print-order-meta">
            <h2>Order #{o.order_number}</h2>
            <p>{new Date(o.created_at).toLocaleDateString("en-NZ", { dateStyle: "long" })}</p>
            <p style={{ marginTop: 6 }}>
              <span className="print-status-pill">{o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span>
            </p>
          </div>
        </div>

        <div className="print-columns">
          {/* Left: items + totals */}
          <div>
            <div className="print-section-title">Order Items</div>
            <table className="print-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: "center" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {o.order_items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="print-item-name">{item.product_name}</div>
                      <div className="print-item-sub">Size {item.size}</div>
                    </td>
                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                    <td>${((item.unit_price * item.quantity) / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="print-totals">
              <div className="print-totals-row">
                <span>Subtotal</span>
                <span>${(o.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="print-totals-row">
                <span>Shipping</span>
                <span>{o.shipping_cost === 0 ? "Free" : `$${(o.shipping_cost / 100).toFixed(2)}`}</span>
              </div>
              {(o as any).discount_amount > 0 && (
                <div className="print-totals-row">
                  <span>Discount</span>
                  <span>−${((o as any).discount_amount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="print-totals-row total">
                <span>Total</span>
                <span>${(o.total / 100).toFixed(2)} NZD</span>
              </div>
            </div>
          </div>

          {/* Right: customer + address */}
          <div>
            <div className="print-info-block">
              <div className="print-section-title">Customer</div>
              <p style={{ fontWeight: 700 }}>{addr.first_name} {addr.last_name}</p>
              <p>{o.guest_email}</p>
              {addr.phone && <p>{addr.phone}</p>}
            </div>

            <div className="print-info-block">
              <div className="print-section-title">Ship To</div>
              <p>{addr.first_name} {addr.last_name}</p>
              <p>{addr.line1}</p>
              {addr.line2 && <p>{addr.line2}</p>}
              <p>{addr.city} {addr.postcode}</p>
              {addr.region && <p>{addr.region}</p>}
              <p>{addr.country}</p>
            </div>

            {o.tracking_number && (
              <div className="print-info-block">
                <div className="print-section-title">Tracking Number</div>
                <p style={{ fontFamily: "monospace", fontWeight: 700 }}>{o.tracking_number}</p>
              </div>
            )}
          </div>
        </div>

        <div className="print-footer">
          Thank you for your order · nine2five.nz · support@nine2five.nz
        </div>
      </div>

      {/* ── Page header (screen only) ── */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Link href="/admin/orders" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontWeight: 600 }}>
              ← Orders
            </Link>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.1, fontFamily: "monospace" }}>
            Order #{o.order_number}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
            <span style={{
              display: "inline-flex", padding: "3px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800,
              ...badgeStyle,
            }}>
              {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
            </span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
              {new Date(o.created_at).toLocaleDateString("en-NZ", { dateStyle: "long" })}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PrintButton />
          <OrderActions
            orderId={o.id}
            currentStatus={o.status}
            trackingNumber={o.tracking_number}
            orderTotal={o.total}
            hasStripePayment={!!o.stripe_payment_intent_id}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Items card */}
          <div style={{ background: "#f7f8f4", borderRadius: 18, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
              <p style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>Items</p>
            </div>
            <div style={{ padding: 22 }}>
              {o.order_items.map((item) => (
                <div
                  key={item.id}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{item.product_name}</p>
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>Size {item.size} × {item.quantity}</p>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#111827", fontFamily: "monospace" }}>
                    ${((item.unit_price * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>
              ))}

              <div style={{ paddingTop: 18, borderTop: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280" }}>
                  <span>Subtotal</span>
                  <span style={{ fontFamily: "monospace" }}>${(o.subtotal / 100).toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280" }}>
                  <span>Shipping</span>
                  <span style={{ fontFamily: "monospace" }}>{o.shipping_cost === 0 ? "Free" : `$${(o.shipping_cost / 100).toFixed(2)}`}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 900, color: "#111827", paddingTop: 10, borderTop: "1px solid #e5e7eb" }}>
                  <span>Total</span>
                  <span style={{ fontFamily: "monospace" }}>${(o.total / 100).toFixed(2)} NZD</span>
                </div>
              </div>
            </div>
          </div>

          {/* NZ Post Label */}
          <NzPostLabel order={o} />
        </div>

        {/* Right column: Customer + Address + Tracking */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Customer */}
          <div style={DARK_CARD}>
            <p style={{ fontWeight: 800, fontSize: 13, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Customer</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>{addr.first_name} {addr.last_name}</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{o.guest_email}</p>
            {addr.phone && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{addr.phone}</p>}
          </div>

          {/* Shipping address */}
          <div style={DARK_CARD}>
            <p style={{ fontWeight: 800, fontSize: 13, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Shipping Address</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
              <p>{addr.first_name} {addr.last_name}</p>
              <p>{addr.line1}</p>
              {addr.line2 && <p>{addr.line2}</p>}
              <p>{addr.city} {addr.postcode}</p>
              <p>{addr.region}</p>
              <p>{addr.country}</p>
            </div>
          </div>

          {/* Tracking */}
          {o.tracking_number && (
            <div style={DARK_CARD}>
              <p style={{ fontWeight: 800, fontSize: 13, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Tracking</p>
              <p style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: "#4ade80" }}>{o.tracking_number}</p>
            </div>
          )}

          <EShipButton orderId={o.id} existingTracking={o.tracking_number ?? null} />
        </div>
      </div>
    </div>
  );
}
