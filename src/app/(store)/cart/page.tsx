"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { calculateShippingByPairs } from "@/lib/shipping";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, count, bundleDiscount } = useCart();
  const { cost: shipping, isBulk, delivery } = calculateShippingByPairs(count, "NZ");

  if (count === 0) {
    return (
      <div style={{ background: "#06150c", minHeight: "100vh", paddingTop: 72, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "72px 20px 80px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(47,155,47,0.10)", border: "1px solid rgba(47,155,47,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <ShoppingBag style={{ width: 30, height: 30, color: "rgba(47,155,47,0.6)" }} />
        </div>
        <h1 className="font-display font-black text-white" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", letterSpacing: "-0.02em", marginBottom: 10 }}>Your cart is empty</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, marginBottom: 36, maxWidth: 280 }}>Looks like you haven't added any grip socks yet.</p>
        <Link href="/shop" style={{ background: "#2f9b2f", color: "#fff", fontWeight: 900, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em", padding: "15px 36px", borderRadius: 999, textDecoration: "none", display: "inline-block" }}>
          Browse Shop
        </Link>
        <Link href="/" style={{ marginTop: 16, color: "rgba(255,255,255,0.3)", fontSize: 13, textDecoration: "none", display: "block" }} className="hover:text-white transition-colors">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "#06150c", minHeight: "100vh" }}>
      <style>{`
        .cart-container { max-width: 1280px; margin: 0 auto; padding: 100px 48px 80px; }
        .cart-layout { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 42px; align-items: start; }
        .cart-item { display: grid; grid-template-columns: 96px 1fr auto; grid-template-rows: auto auto; grid-template-areas: "img meta actions" "img footer footer"; gap: 4px 18px; align-items: start; padding: 18px; border-radius: 18px; background: rgba(7,24,14,0.92); border: 1px solid rgba(255,255,255,0.10); margin-bottom: 14px; }
        .ci-img { grid-area: img; }
        .ci-meta { grid-area: meta; padding-top: 2px; min-width: 0; }
        .ci-actions { grid-area: actions; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; padding-top: 2px; }
        .ci-footer { grid-area: footer; display: flex; align-items: center; gap: 8px; padding-bottom: 2px; }
        .ci-price-mobile { display: none; font-weight: 800; font-size: 15px; color: #fff; }
        .ci-delete-mobile { display: none; background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.25); padding: 0; }
        .ci-delete-mobile:hover { color: #f87171; }
        .order-summary-card { padding: 30px; border-radius: 20px; background: rgba(7,24,14,0.94); border: 1px solid rgba(255,255,255,0.10); position: sticky; top: 96px; }
        @media (max-width: 900px) { .cart-layout { grid-template-columns: 1fr; } .cart-container { padding: 90px 32px 64px; } }
        @media (max-width: 640px) { .cart-container { padding: 90px 20px 64px; } }
        @media (max-width: 560px) {
          .cart-item { grid-template-columns: 76px 1fr; grid-template-areas: "img meta" "img footer"; gap: 6px 14px; padding: 14px; }
          .ci-img { width: 76px !important; height: 76px !important; }
          .ci-actions { display: none; }
          .ci-price-mobile { display: block; margin-left: auto; }
          .ci-delete-mobile { display: flex; align-items: center; }
          .ci-footer { justify-content: flex-start; gap: 0; }
        }
      `}</style>
      <div className="cart-container">
        <h1 className="font-display font-black text-white mb-10" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>Your Cart</h1>

        <div className="cart-layout">
          {/* Items */}
          <div>
            {items.map((item) => (
              <div key={`${item.variantId}-${item.productName}`} className="cart-item">
                {/* Image */}
                <div className="ci-img" style={{ position: "relative", width: 96, height: 96, borderRadius: 12, overflow: "hidden", background: "#0d1f12" }}>
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, background: "#0d1f12", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>No image</span>
                    </div>
                  )}
                </div>

                {/* Name + size */}
                <div className="ci-meta">
                  <p style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.productName}</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Size {item.size}</p>
                </div>

                {/* Price + delete — desktop only */}
                <div className="ci-actions">
                  <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>${((item.price * item.quantity) / 100).toFixed(2)}</span>
                  <button onClick={() => removeItem(item.variantId, item.productName)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", padding: 0 }} className="hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Qty + mobile price/delete */}
                <div className="ci-footer">
                  <button onClick={() => updateQuantity(item.variantId, item.productName, item.quantity - 1)} style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                    <Minus className="h-3 w-3" />
                  </button>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#fff", width: 24, textAlign: "center" }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.variantId, item.productName, item.quantity + 1)} style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                    <Plus className="h-3 w-3" />
                  </button>
                  <span className="ci-price-mobile">${((item.price * item.quantity) / 100).toFixed(2)}</span>
                  <button className="ci-delete-mobile" onClick={() => removeItem(item.variantId, item.productName)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

          </div>

          {/* Summary */}
          <div className="order-summary-card">
            <h2 style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.45)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 24 }}>Order Summary</h2>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>Subtotal ({count} {count === 1 ? "item" : "items"})</span>
              <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>${(total / 100).toFixed(2)}</span>
            </div>
            {bundleDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 14, color: "#2f9b2f" }}>Bundle discount</span>
                <span style={{ fontSize: 14, color: "#2f9b2f", fontWeight: 700 }}>−${(bundleDiscount / 100).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>Shipping (NZ)</span>
              <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>
                {isBulk ? <span style={{ color: "#f87171", fontSize: 12 }}>Contact us</span> : `$${(shipping / 100).toFixed(2)}`}
              </span>
            </div>
            {!isBulk && delivery && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", marginBottom: 16 }}>{delivery}</p>}
            {isBulk && <p style={{ fontSize: 12, color: "#f87171", marginBottom: 16 }}>Please contact us directly for bulk shipping rates.</p>}
            {!isBulk && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.12)", fontSize: 24, fontWeight: 900, color: "#fff" }}>
                <span>Total</span>
                <span>${((total + shipping - bundleDiscount) / 100).toFixed(2)} <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>NZD</span></span>
              </div>
            )}
            {isBulk ? (
              <a href="mailto:nine2five.co.nz@gmail.com" style={{ display: "block", width: "100%", marginTop: 18, padding: "14px 0", borderRadius: 999, background: "#2f9b2f", color: "#fff", fontWeight: 900, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center", textDecoration: "none" }}>
                Contact Us for Bulk Rates
              </a>
            ) : (
              <Link href="/checkout" style={{ display: "block", width: "100%", marginTop: 24, padding: "16px 0", borderRadius: 999, background: "#2f9b2f", color: "#fff", fontWeight: 900, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "center", textDecoration: "none" }}>
                Checkout
              </Link>
            )}
            <Link href="/shop" style={{ display: "block", textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none", marginTop: 16 }} className="hover:text-white transition-colors">
              Continue shopping →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
