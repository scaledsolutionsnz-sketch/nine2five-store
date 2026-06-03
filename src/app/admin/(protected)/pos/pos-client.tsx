"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search, ShoppingCart, X, Plus, Minus, Tag, Check,
  Loader2, User, ChevronDown, ChevronUp,
  Banknote, CreditCard, Building2, Smartphone, ClipboardList,
  ArrowRight, RotateCcw, Package,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements, PaymentElement, useStripe, useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = { id: string; size: string; stock_quantity: number };

type Product = {
  id: string;
  name: string;
  price: number;
  image_urls: string[];
  product_variants: Variant[];
};

type CartItem = {
  productId: string;
  variantId: string;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
  maxQty: number;
};

type PaymentMethod = "cash" | "eftpos" | "bank_transfer" | "stripe" | "manual";

// ─── Theme tokens ─────────────────────────────────────────────────────────────

const T = {
  pageBg: "#06150C",
  panelBg: "rgba(8,28,16,0.92)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderSubtle: "1px solid rgba(255,255,255,0.06)",
  borderHover: "1px solid rgba(47,155,47,0.4)",
  green: "#2f9b2f",
  greenBright: "#4ade80",
  white: "#ffffff",
  textMuted: "rgba(255,255,255,0.5)",
  textDim: "rgba(255,255,255,0.3)",
  textFaint: "rgba(255,255,255,0.18)",
  inputBg: "rgba(255,255,255,0.06)",
  inputBorder: "1px solid rgba(255,255,255,0.1)",
  modalBg: "#0d1a12",
  modalBorder: "1px solid rgba(255,255,255,0.12)",
  amber: "#f59e0b",
  red: "#ef4444",
  redDim: "rgba(239,68,68,0.15)",
};

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({
  product,
  cartItems,
  onAdd,
}: {
  product: Product;
  cartItems: CartItem[];
  onAdd: (product: Product, variant: Variant) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const variants = (product.product_variants ?? []).sort((a, b) => a.size.localeCompare(b.size));

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.panelBg,
        border: hovered ? T.borderHover : T.border,
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "border-color 0.15s",
        cursor: "default",
      }}
    >
      {/* Image */}
      <div style={{
        position: "relative",
        aspectRatio: "1/1",
        background: "rgba(255,255,255,0.03)",
        overflow: "hidden",
      }}>
        {product.image_urls?.[0] ? (
          <Image
            src={product.image_urls[0]}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Package style={{ width: 28, height: 28, color: "rgba(255,255,255,0.15)" }} />
          </div>
        )}
      </div>

      {/* Info + size buttons */}
      <div style={{ padding: "10px 10px 12px" }}>
        <p style={{
          fontSize: 12,
          fontWeight: 600,
          color: T.white,
          lineHeight: 1.35,
          marginBottom: 4,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {product.name}
        </p>
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: T.greenBright,
          fontFamily: "monospace",
          marginBottom: 8,
        }}>
          ${(product.price / 100).toFixed(2)}
        </p>

        <div style={{ display: "flex", gap: 5 }}>
          {variants.map(variant => {
            const inCart = cartItems.find(i => i.variantId === variant.id);
            const outOfStock = variant.stock_quantity === 0;
            const lowStock = !outOfStock && variant.stock_quantity <= 3;
            return (
              <button
                key={variant.id}
                onClick={() => !outOfStock && onAdd(product, variant)}
                disabled={outOfStock}
                style={{
                  flex: 1,
                  height: 28,
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: outOfStock ? "not-allowed" : "pointer",
                  transition: "all 0.1s",
                  backgroundColor: outOfStock
                    ? "rgba(255,255,255,0.04)"
                    : inCart
                      ? "rgba(47,155,47,0.25)"
                      : "rgba(255,255,255,0.07)",
                  color: outOfStock
                    ? "rgba(255,255,255,0.2)"
                    : inCart
                      ? T.greenBright
                      : "rgba(255,255,255,0.75)",
                  border: outOfStock
                    ? "1px solid rgba(255,255,255,0.05)"
                    : inCart
                      ? "1px solid rgba(74,222,128,0.5)"
                      : "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {variant.size}{inCart ? ` ×${inCart.quantity}` : ""}
              </button>
            );
          })}
        </div>

        {/* Stock labels */}
        <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
          {variants.map(v => (
            <div key={v.id} style={{ flex: 1, textAlign: "center" }}>
              <span style={{
                fontSize: 9,
                fontWeight: 500,
                color: v.stock_quantity === 0
                  ? T.red
                  : v.stock_quantity <= 3
                    ? T.amber
                    : "rgba(255,255,255,0.25)",
              }}>
                {v.stock_quantity === 0 ? "Out" : `${v.stock_quantity}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CartItemRow ──────────────────────────────────────────────────────────────

function CartItemRow({
  item,
  onQty,
  onRemove,
  onPriceChange,
}: {
  item: CartItem;
  onQty: (variantId: string, delta: number) => void;
  onRemove: (variantId: string) => void;
  onPriceChange: (variantId: string, price: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [priceInput, setPriceInput] = useState((item.unitPrice / 100).toFixed(2));
  const overridden = item.unitPrice !== item.originalPrice;

  function commitPrice() {
    const cents = Math.max(0, Math.round(parseFloat(priceInput || "0") * 100));
    onPriceChange(item.variantId, cents);
    setEditing(false);
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 14px",
      borderBottom: T.borderSubtle,
    }}>
      {/* Name + size */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 12,
          fontWeight: 600,
          color: T.white,
          lineHeight: 1.3,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {item.productName}
        </p>
        <p style={{
          fontSize: 10,
          color: T.textMuted,
          marginTop: 2,
          lineHeight: 1,
        }}>
          Size {item.size}
        </p>
      </div>

      {/* Qty controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <button
          onClick={() => onQty(item.variantId, -1)}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Minus style={{ width: 9, height: 9, color: "rgba(255,255,255,0.5)" }} />
        </button>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: T.white,
          width: 18,
          textAlign: "center",
          fontFamily: "monospace",
        }}>
          {item.quantity}
        </span>
        <button
          onClick={() => onQty(item.variantId, 1)}
          disabled={item.quantity >= item.maxQty}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: item.quantity >= item.maxQty ? "not-allowed" : "pointer",
            opacity: item.quantity >= item.maxQty ? 0.3 : 1,
          }}
        >
          <Plus style={{ width: 9, height: 9, color: "rgba(255,255,255,0.5)" }} />
        </button>
      </div>

      {/* Price (editable) */}
      <div style={{ width: 58, textAlign: "right" }}>
        {editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 10, color: T.textMuted }}>$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceInput}
              onChange={e => setPriceInput(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={e => e.key === "Enter" && commitPrice()}
              autoFocus
              style={{
                width: 46,
                fontSize: 12,
                fontWeight: 700,
                textAlign: "right",
                background: "transparent",
                border: "none",
                borderBottom: `1px solid ${T.greenBright}`,
                outline: "none",
                color: T.white,
                fontFamily: "monospace",
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => { setEditing(true); setPriceInput((item.unitPrice / 100).toFixed(2)); }}
            title="Click to override price"
            style={{ textAlign: "right", cursor: "pointer", background: "none", border: "none", padding: 0 }}
          >
            <p style={{
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "monospace",
              color: overridden ? T.greenBright : T.white,
              lineHeight: 1.3,
            }}>
              ${((item.unitPrice * item.quantity) / 100).toFixed(2)}
            </p>
            {overridden && (
              <p style={{
                fontSize: 9,
                color: T.textMuted,
                textDecoration: "line-through",
                fontFamily: "monospace",
                lineHeight: 1,
              }}>
                ${((item.originalPrice * item.quantity) / 100).toFixed(2)}
              </p>
            )}
          </button>
        )}
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.variantId)}
        style={{
          width: 20,
          height: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.2)",
          cursor: "pointer",
          background: "none",
          border: "none",
          padding: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = T.red)}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
      >
        <X style={{ width: 11, height: 11 }} />
      </button>
    </div>
  );
}

// ─── StripeForm ───────────────────────────────────────────────────────────────

function StripeForm({
  total,
  onSuccess,
  onCancel,
}: {
  total: number;
  onSuccess: (piId: string) => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError("");

    const result = await stripe.confirmPayment({ elements, redirect: "if_required" });
    if (result.error) {
      setError(result.error.message ?? "Payment failed");
      setSubmitting(false);
    } else if (result.paymentIntent?.status === "succeeded") {
      onSuccess(result.paymentIntent.id);
    } else {
      setError("Payment not confirmed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handlePay} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PaymentElement />
      {error && (
        <p style={{ fontSize: 12, color: T.red }}>{error}</p>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 100,
            background: T.inputBg,
            border: T.border,
            fontSize: 13,
            fontWeight: 500,
            color: T.white,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !stripe}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 100,
            background: T.green,
            border: "none",
            fontSize: 13,
            fontWeight: 700,
            color: T.white,
            cursor: submitting || !stripe ? "not-allowed" : "pointer",
            opacity: submitting || !stripe ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {submitting
            ? <Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} />
            : `Charge $${(total / 100).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

// ─── SuccessScreen ────────────────────────────────────────────────────────────

function SuccessScreen({
  orderNumber,
  total,
  paymentMethod,
  onNewSale,
}: {
  orderNumber: number;
  total: number;
  paymentMethod: PaymentMethod;
  onNewSale: () => void;
}) {
  const labels: Record<PaymentMethod, string> = {
    cash: "Cash", eftpos: "EFTPOS", bank_transfer: "Bank Transfer",
    stripe: "Stripe Card", manual: "Manual",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(47,155,47,0.15)",
          border: "1px solid rgba(47,155,47,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <Check style={{ width: 36, height: 36, color: T.greenBright }} strokeWidth={2.5} />
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 700, color: T.white, marginBottom: 6 }}>
          Sale Complete
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
          Order #{orderNumber}
        </p>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>
          {labels[paymentMethod]} · Collected in-person
        </p>
        <p style={{
          fontSize: 32,
          fontWeight: 700,
          color: T.greenBright,
          fontFamily: "monospace",
          marginBottom: 32,
        }}>
          ${(total / 100).toFixed(2)}{" "}
          <span style={{ fontSize: 16, fontWeight: 400, color: T.textMuted }}>NZD</span>
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/admin/orders"
            style={{
              flex: 1,
              height: 44,
              borderRadius: 100,
              background: T.inputBg,
              border: T.border,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 500,
              color: T.white,
              textDecoration: "none",
            }}
          >
            View Order
          </Link>
          <button
            onClick={onNewSale}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 100,
              background: T.green,
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              color: T.white,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <RotateCcw style={{ width: 13, height: 13 }} />
            New Sale
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main POS Client ──────────────────────────────────────────────────────────

export function POSClient({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Discount state
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [manualDiscType, setManualDiscType] = useState<"none" | "pct" | "fixed">("none");
  const [manualDiscValue, setManualDiscValue] = useState("");

  // Customer state
  const [showCustomer, setShowCustomer] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [sendReceipt, setSendReceipt] = useState(false);
  const [posNotes, setPosNotes] = useState("");

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  // Sale flow state
  const [processing, setProcessing] = useState(false);
  const [saleError, setSaleError] = useState("");
  const [completed, setCompleted] = useState<{ orderId: string; orderNumber: number } | null>(null);

  // Stripe state
  const [stripeSecret, setStripeSecret] = useState("");
  const [stripeLoading, setStripeLoading] = useState(false);

  // ── Calculations ─────────────────────────────────────────────────
  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const manualDiscAmount = (() => {
    if (manualDiscType === "none" || !manualDiscValue) return 0;
    const v = parseFloat(manualDiscValue);
    if (isNaN(v) || v <= 0) return 0;
    if (manualDiscType === "pct") return Math.round(subtotal * Math.min(v, 100) / 100);
    return Math.round(v * 100);
  })();

  const totalDiscountAmount = Math.min(subtotal, (appliedDiscount?.amount ?? 0) + manualDiscAmount);
  const afterDiscount = subtotal - totalDiscountAmount;
  const gstIncluded = Math.round(afterDiscount * 15 / 115);
  const total = afterDiscount;

  // Category filter
  const categories = ["all", ...Array.from(new Set(
    products.flatMap(p => (p as Product & { category?: string }).category ? [(p as Product & { category?: string }).category!] : [])
  ))];

  const filteredProducts = products.filter(p => {
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  // ── Cart Operations ──────────────────────────────────────────────
  function addToCart(product: Product, variant: Variant) {
    setCart(prev => {
      const existing = prev.find(i => i.variantId === variant.id);
      if (existing) {
        if (existing.quantity >= existing.maxQty) return prev;
        return prev.map(i => i.variantId === variant.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        size: variant.size,
        quantity: 1,
        unitPrice: product.price,
        originalPrice: product.price,
        maxQty: variant.stock_quantity,
      }];
    });
  }

  function updateQty(variantId: string, delta: number) {
    setCart(prev => prev
      .map(i => i.variantId === variantId
        ? { ...i, quantity: Math.max(0, Math.min(i.quantity + delta, i.maxQty)) }
        : i)
      .filter(i => i.quantity > 0)
    );
  }

  function removeItem(variantId: string) {
    setCart(prev => prev.filter(i => i.variantId !== variantId));
  }

  function setPriceOverride(variantId: string, price: number) {
    setCart(prev => prev.map(i => i.variantId === variantId ? { ...i, unitPrice: Math.max(0, price) } : i));
  }

  // ── Discount ─────────────────────────────────────────────────────
  async function applyDiscountCode() {
    if (!discountCode.trim() || !cart.length) return;
    setDiscountLoading(true);
    setDiscountError("");
    const res = await fetch("/api/discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: discountCode.trim(), subtotal_cents: subtotal }),
    });
    const data = await res.json() as { discount_cents?: number; error?: string };
    setDiscountLoading(false);
    if (!res.ok || data.error) { setDiscountError(data.error ?? "Invalid code"); return; }
    setAppliedDiscount({ code: discountCode.toUpperCase().trim(), amount: data.discount_cents! });
    setDiscountCode("");
  }

  // ── Complete Sale ─────────────────────────────────────────────────
  async function completeSale(stripePaymentIntentId?: string) {
    if (!cart.length) return;
    setSaleError("");

    if (paymentMethod === "stripe" && !stripePaymentIntentId) {
      setStripeLoading(true);
      try {
        const res = await fetch("/api/admin/pos/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ total }),
        });
        const data = await res.json() as { clientSecret?: string; error?: string };
        if (!res.ok || !data.clientSecret) throw new Error(data.error ?? "Failed");
        setStripeSecret(data.clientSecret);
      } catch (e: unknown) {
        setSaleError(e instanceof Error ? e.message : "Failed to initiate card payment");
      } finally {
        setStripeLoading(false);
      }
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/admin/pos/complete-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(i => ({
            productId: i.productId,
            variantId: i.variantId,
            productName: i.productName,
            size: i.size,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          subtotal,
          discountCode: appliedDiscount?.code ?? null,
          discountAmount: totalDiscountAmount,
          total,
          paymentMethod,
          stripePaymentIntentId: stripePaymentIntentId ?? null,
          customer: showCustomer && (customer.name || customer.email || customer.phone) ? customer : null,
          sendReceipt: sendReceipt && !!customer.email,
          notes: posNotes,
        }),
      });
      const data = await res.json() as { orderId?: string; orderNumber?: number; error?: string };
      if (!res.ok) { setSaleError(data.error ?? "Sale failed. Please try again."); return; }
      setCompleted({ orderId: data.orderId!, orderNumber: data.orderNumber! });
    } finally {
      setProcessing(false);
    }
  }

  function resetSale() {
    setCart([]);
    setSearch("");
    setDiscountCode("");
    setAppliedDiscount(null);
    setDiscountError("");
    setManualDiscType("none");
    setManualDiscValue("");
    setShowCustomer(false);
    setCustomer({ name: "", email: "", phone: "" });
    setSendReceipt(false);
    setPosNotes("");
    setPaymentMethod("cash");
    setSaleError("");
    setCompleted(null);
    setStripeSecret("");
  }

  // ── Success screen ────────────────────────────────────────────────
  if (completed) {
    return (
      <div style={{ height: "calc(100vh - 136px)", minHeight: 600, background: T.pageBg }}>
        <SuccessScreen
          orderNumber={completed.orderNumber}
          total={total}
          paymentMethod={paymentMethod}
          onNewSale={resetSale}
        />
      </div>
    );
  }

  // ── Stripe card modal ─────────────────────────────────────────────
  if (stripeSecret) {
    return (
      <div style={{
        height: "calc(100vh - 136px)",
        minHeight: 600,
        background: T.pageBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          background: T.modalBg,
          border: T.modalBorder,
          borderRadius: 20,
          padding: 28,
          width: "100%",
          maxWidth: 460,
          boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.white }}>Card Payment</h3>
              <p style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
                {cart.reduce((s, i) => s + i.quantity, 0)} item{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
              </p>
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, color: T.greenBright, fontFamily: "monospace" }}>
              ${(total / 100).toFixed(2)}
              <span style={{ fontSize: 13, fontWeight: 400, color: T.textMuted }}> NZD</span>
            </p>
          </div>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: stripeSecret,
              appearance: {
                theme: "night",
                variables: {
                  colorPrimary: T.green,
                  colorBackground: T.modalBg,
                  colorText: T.white,
                  borderRadius: "10px",
                },
              },
            }}
          >
            <StripeForm
              total={total}
              onSuccess={piId => { setStripeSecret(""); completeSale(piId); }}
              onCancel={() => setStripeSecret("")}
            />
          </Elements>
        </div>
      </div>
    );
  }

  const paymentMethods: Array<{ id: PaymentMethod; label: string; icon: React.ReactNode }> = [
    { id: "cash",          label: "Cash",     icon: <Banknote style={{ width: 15, height: 15 }} /> },
    { id: "eftpos",        label: "EFTPOS",   icon: <CreditCard style={{ width: 15, height: 15 }} /> },
    { id: "stripe",        label: "Card",     icon: <Smartphone style={{ width: 15, height: 15 }} /> },
    { id: "bank_transfer", label: "Transfer", icon: <Building2 style={{ width: 15, height: 15 }} /> },
    { id: "manual",        label: "Manual",   icon: <ClipboardList style={{ width: 15, height: 15 }} /> },
  ];

  const totalPairs = cart.reduce((s, i) => s + i.quantity, 0);

  // ── Main layout ───────────────────────────────────────────────────
  return (
    <div style={{
      height: "calc(100vh - 136px)",
      minHeight: 620,
      display: "flex",
      gap: 16,
      overflow: "hidden",
      background: T.pageBg,
    }}>
      {/* ── LEFT: Product Grid ─────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>

        {/* Search */}
        <div style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 42,
          padding: "0 14px",
          background: T.inputBg,
          border: T.inputBorder,
          borderRadius: 100,
        }}>
          <Search style={{ width: 14, height: 14, color: T.textDim, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              fontSize: 13,
              background: "transparent",
              border: "none",
              outline: "none",
              color: T.white,
              minWidth: 0,
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: T.textMuted }}
            >
              <X style={{ width: 12, height: 12 }} />
            </button>
          )}
        </div>

        {/* Grid */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingBottom: 8,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 10,
            alignContent: "start",
          }}
        >
          {filteredProducts.length === 0 ? (
            <div style={{
              gridColumn: "1/-1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 64,
              color: "rgba(255,255,255,0.2)",
              gap: 8,
            }}>
              <Package style={{ width: 32, height: 32 }} />
              <p style={{ fontSize: 13 }}>No products found</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                cartItems={cart}
                onAdd={addToCart}
              />
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT: Cart ──────────────────────────────────── */}
      <div style={{
        width: 364,
        display: "flex",
        flexDirection: "column",
        background: T.panelBg,
        border: T.border,
        borderRadius: 16,
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {/* Cart header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: T.border,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ShoppingCart style={{ width: 15, height: 15, color: T.textMuted }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: T.white }}>Cart</span>
            {totalPairs > 0 && (
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 100,
                background: "rgba(47,155,47,0.2)",
                color: T.greenBright,
                border: "1px solid rgba(74,222,128,0.3)",
              }}>
                {totalPairs} pair{totalPairs !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              style={{
                fontSize: 11,
                color: T.textMuted,
                background: "none",
                border: "none",
                cursor: "pointer",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = T.red)}
              onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Cart items (scrollable) */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {cart.length === 0 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: 24,
              textAlign: "center",
            }}>
              <ShoppingCart style={{ width: 32, height: 32, color: "rgba(255,255,255,0.12)", marginBottom: 10 }} />
              <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6 }}>
                Tap a size on any product<br />to add it to the cart
              </p>
            </div>
          ) : (
            cart.map(item => (
              <CartItemRow
                key={item.variantId}
                item={item}
                onQty={updateQty}
                onRemove={removeItem}
                onPriceChange={setPriceOverride}
              />
            ))
          )}
        </div>

        {/* ── Fixed bottom ─────────────────────────────────── */}
        <div style={{ flexShrink: 0, borderTop: T.border }}>

          {/* Discount section */}
          <div style={{ padding: "10px 14px 10px", borderBottom: T.borderSubtle }}>
            {appliedDiscount ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Tag style={{ width: 11, height: 11, color: T.greenBright }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.greenBright, fontFamily: "monospace" }}>
                    {appliedDiscount.code}
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(74,222,128,0.6)", fontFamily: "monospace" }}>
                    −${(appliedDiscount.amount / 100).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => setAppliedDiscount(null)}
                  style={{ color: T.textMuted, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <X style={{ width: 11, height: 11 }} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {/* Code input */}
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: 30,
                    padding: "0 10px",
                    background: T.inputBg,
                    border: T.inputBorder,
                    borderRadius: 8,
                  }}>
                    <Tag style={{ width: 10, height: 10, color: T.textDim, flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(""); }}
                      onKeyDown={e => e.key === "Enter" && applyDiscountCode()}
                      style={{
                        flex: 1,
                        fontSize: 11,
                        fontFamily: "monospace",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: T.white,
                        minWidth: 0,
                      }}
                    />
                  </div>
                  <button
                    onClick={applyDiscountCode}
                    disabled={discountLoading || !discountCode.trim()}
                    style={{
                      height: 30,
                      padding: "0 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      background: "rgba(47,155,47,0.15)",
                      color: T.greenBright,
                      border: "1px solid rgba(47,155,47,0.3)",
                      cursor: discountLoading || !discountCode.trim() ? "not-allowed" : "pointer",
                      opacity: discountLoading || !discountCode.trim() ? 0.4 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {discountLoading
                      ? <Loader2 style={{ width: 10, height: 10, animation: "spin 1s linear infinite" }} />
                      : "Apply"}
                  </button>
                </div>
                {discountError && (
                  <p style={{ fontSize: 10, color: T.red }}>{discountError}</p>
                )}

                {/* Manual discount */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: T.textMuted, whiteSpace: "nowrap" }}>Manual:</span>
                  <select
                    value={manualDiscType}
                    onChange={e => setManualDiscType(e.target.value as "none" | "pct" | "fixed")}
                    style={{
                      height: 26,
                      padding: "0 4px",
                      fontSize: 10,
                      background: T.inputBg,
                      border: T.inputBorder,
                      borderRadius: 6,
                      color: T.white,
                      outline: "none",
                    }}
                  >
                    <option value="none">None</option>
                    <option value="pct">%</option>
                    <option value="fixed">$</option>
                  </select>
                  {manualDiscType !== "none" && (
                    <>
                      <input
                        type="number"
                        min="0"
                        step={manualDiscType === "pct" ? "1" : "0.01"}
                        value={manualDiscValue}
                        onChange={e => setManualDiscValue(e.target.value)}
                        placeholder={manualDiscType === "pct" ? "%" : "$"}
                        style={{
                          width: 52,
                          height: 26,
                          textAlign: "center",
                          fontSize: 11,
                          background: T.inputBg,
                          border: T.inputBorder,
                          borderRadius: 6,
                          color: T.white,
                          outline: "none",
                          fontFamily: "monospace",
                        }}
                      />
                      {manualDiscAmount > 0 && (
                        <span style={{ fontSize: 10, color: T.greenBright, fontWeight: 600, fontFamily: "monospace" }}>
                          −${(manualDiscAmount / 100).toFixed(2)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Totals */}
          <div style={{ padding: "10px 16px 10px", borderBottom: T.borderSubtle }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: T.textMuted }}>Subtotal</span>
                <span style={{ fontSize: 12, color: T.textMuted, fontFamily: "monospace" }}>${(subtotal / 100).toFixed(2)}</span>
              </div>
              {totalDiscountAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: T.greenBright }}>Discount</span>
                  <span style={{ fontSize: 12, color: T.greenBright, fontFamily: "monospace" }}>−${(totalDiscountAmount / 100).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Incl. GST (15%)</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>${(gstIncluded / 100).toFixed(2)}</span>
              </div>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginTop: 10,
              paddingTop: 10,
              borderTop: T.borderSubtle,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.white }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: T.white, fontFamily: "monospace" }}>
                ${(total / 100).toFixed(2)}
                <span style={{ fontSize: 12, fontWeight: 400, color: T.textMuted }}> NZD</span>
              </span>
            </div>
          </div>

          {/* Customer (collapsible) */}
          <div style={{ padding: "8px 16px", borderBottom: T.borderSubtle }}>
            <button
              onClick={() => setShowCustomer(v => !v)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <User style={{ width: 11, height: 11, color: T.textMuted }} />
                <span style={{ fontSize: 11, color: T.textMuted }}>
                  {showCustomer ? "Customer details" : "Add customer (optional)"}
                </span>
              </div>
              {showCustomer
                ? <ChevronUp style={{ width: 11, height: 11, color: T.textMuted }} />
                : <ChevronDown style={{ width: 11, height: 11, color: T.textMuted }} />}
            </button>

            {showCustomer && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {(["name", "email", "phone"] as const).map(field => (
                  <input
                    key={field}
                    type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                    placeholder={field === "name" ? "Full name" : field === "email" ? "Email (for receipt)" : "Phone"}
                    value={customer[field]}
                    onChange={e => setCustomer(c => ({ ...c, [field]: e.target.value }))}
                    style={{
                      width: "100%",
                      height: 30,
                      padding: "0 10px",
                      fontSize: 11,
                      background: T.inputBg,
                      border: T.inputBorder,
                      borderRadius: 8,
                      color: T.white,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                ))}
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={posNotes}
                  onChange={e => setPosNotes(e.target.value)}
                  style={{
                    width: "100%",
                    height: 30,
                    padding: "0 10px",
                    fontSize: 11,
                    background: T.inputBg,
                    border: T.inputBorder,
                    borderRadius: 8,
                    color: T.white,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {customer.email && (
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={sendReceipt}
                      onChange={e => setSendReceipt(e.target.checked)}
                      style={{ width: 12, height: 12, accentColor: T.green }}
                    />
                    <span style={{ fontSize: 10, color: T.textMuted }}>
                      Email receipt to {customer.email}
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Payment method */}
          <div style={{ padding: "12px 16px 10px", borderBottom: T.borderSubtle }}>
            <p style={{
              fontSize: 10,
              fontWeight: 600,
              color: T.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}>
              Payment
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              {paymentMethods.map(pm => {
                const active = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      height: 54,
                      borderRadius: 12,
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.1s",
                      backgroundColor: active ? "rgba(47,155,47,0.2)" : "rgba(255,255,255,0.04)",
                      color: active ? T.greenBright : T.textMuted,
                      border: active
                        ? "1px solid rgba(47,155,47,0.5)"
                        : "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <span style={{ opacity: active ? 1 : 0.5 }}>{pm.icon}</span>
                    {pm.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error + CTA */}
          <div style={{ padding: "12px 16px 16px" }}>
            {saleError && (
              <p style={{
                fontSize: 11,
                color: T.red,
                marginBottom: 12,
                padding: "8px 10px",
                background: T.redDim,
                borderRadius: 8,
                border: "1px solid rgba(239,68,68,0.25)",
              }}>
                {saleError}
              </p>
            )}
            <button
              onClick={() => completeSale()}
              disabled={cart.length === 0 || processing || stripeLoading}
              style={{
                width: "100%",
                height: 52,
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 700,
                color: T.white,
                cursor: cart.length === 0 || processing || stripeLoading ? "not-allowed" : "pointer",
                background: cart.length === 0
                  ? "rgba(255,255,255,0.06)"
                  : T.green,
                border: "none",
                opacity: cart.length === 0 ? 0.5 : 1,
                boxShadow: cart.length > 0 ? "0 4px 20px rgba(47,155,47,0.35)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.15s",
              }}
            >
              {processing || stripeLoading ? (
                <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
              ) : (
                <>
                  Complete Sale
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
