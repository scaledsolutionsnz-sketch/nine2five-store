"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search, ShoppingCart, X, Plus, Minus, Tag, Check,
  Loader2, User, ChevronDown, ChevronUp, Pencil,
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
  const variants = (product.product_variants ?? []).sort((a, b) => a.size.localeCompare(b.size));

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "1", backgroundColor: "#f9fafb" }}>
        {product.image_urls?.[0] ? (
          <Image
            src={product.image_urls[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Package style={{ width: 28, height: 28, color: "#d1d5db" }} />
          </div>
        )}
      </div>

      {/* Info + size buttons */}
      <div style={{ padding: "10px 10px 10px" }}>
        <p style={{
          fontSize: 12, fontWeight: 600, color: "#111827",
          lineHeight: 1.3, marginBottom: 2, overflow: "hidden",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {product.name}
        </p>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
          ${(product.price / 100).toFixed(2)}
        </p>

        <div style={{ display: "flex", gap: 6 }}>
          {variants.map(variant => {
            const inCart = cartItems.find(i => i.variantId === variant.id);
            const outOfStock = variant.stock_quantity === 0;
            return (
              <button
                key={variant.id}
                onClick={() => !outOfStock && onAdd(product, variant)}
                disabled={outOfStock}
                style={{
                  flex: 1,
                  height: 30,
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: outOfStock ? "not-allowed" : "pointer",
                  transition: "all 0.1s",
                  backgroundColor: outOfStock ? "#f3f4f6" : inCart ? "#dcfce7" : "#f0fdf4",
                  color: outOfStock ? "#9ca3af" : inCart ? "#15803d" : "#16a34a",
                  border: outOfStock
                    ? "1px solid #e5e7eb"
                    : inCart ? "1.5px solid #86efac" : "1px solid #bbf7d0",
                }}
              >
                {variant.size}{inCart ? ` ×${inCart.quantity}` : ""}
              </button>
            );
          })}
        </div>

        {/* Stock labels */}
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          {variants.map(v => (
            <div key={v.id} style={{ flex: 1, textAlign: "center" }}>
              <span style={{
                fontSize: 9, fontWeight: 500,
                color: v.stock_quantity === 0 ? "#ef4444" : v.stock_quantity <= 3 ? "#f59e0b" : "#9ca3af",
              }}>
                {v.stock_quantity === 0 ? "Out of stock" : `${v.stock_quantity} left`}
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
      padding: "10px 14px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      borderBottom: "1px solid #f9fafb",
    }}>
      {/* Name + size */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", lineHeight: 1.2, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.productName}
        </p>
        <p style={{ fontSize: 10, color: "#9ca3af", lineHeight: 1 }}>Size {item.size}</p>
      </div>

      {/* Qty controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          onClick={() => onQty(item.variantId, -1)}
          style={{
            width: 22, height: 22, borderRadius: 6, border: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", backgroundColor: "white",
          }}
        >
          <Minus style={{ width: 9, height: 9 }} />
        </button>
        <span style={{ fontSize: 12, fontWeight: 700, width: 18, textAlign: "center" }}>
          {item.quantity}
        </span>
        <button
          onClick={() => onQty(item.variantId, 1)}
          disabled={item.quantity >= item.maxQty}
          style={{
            width: 22, height: 22, borderRadius: 6, border: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: item.quantity >= item.maxQty ? "not-allowed" : "pointer",
            backgroundColor: "white", opacity: item.quantity >= item.maxQty ? 0.4 : 1,
          }}
        >
          <Plus style={{ width: 9, height: 9 }} />
        </button>
      </div>

      {/* Price (editable) */}
      <div style={{ width: 58, textAlign: "right" }}>
        {editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
            <span style={{ fontSize: 10, color: "#9ca3af" }}>$</span>
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
                width: 46, fontSize: 12, fontWeight: 700, textAlign: "right",
                border: "none", borderBottom: "1.5px solid #10b981",
                outline: "none", backgroundColor: "transparent",
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => { setEditing(true); setPriceInput((item.unitPrice / 100).toFixed(2)); }}
            title="Click to override price"
            style={{ textAlign: "right", cursor: "pointer", background: "none", border: "none", padding: 0 }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2, color: overridden ? "#059669" : "#111827" }}>
              ${((item.unitPrice * item.quantity) / 100).toFixed(2)}
            </p>
            {overridden && (
              <p style={{ fontSize: 9, color: "#9ca3af", textDecoration: "line-through", lineHeight: 1 }}>
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
          width: 20, height: 20, display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer", color: "#d1d5db",
          background: "none", border: "none",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
        onMouseLeave={e => (e.currentTarget.style.color = "#d1d5db")}
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
        <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{error}</p>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1, height: 44, borderRadius: 10, border: "1px solid #e5e7eb",
            fontSize: 13, fontWeight: 500, cursor: "pointer", backgroundColor: "white",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !stripe}
          style={{
            flex: 1, height: 44, borderRadius: 10, border: "none",
            fontSize: 13, fontWeight: 700, cursor: submitting ? "default" : "pointer",
            backgroundColor: "#16a34a", color: "white", opacity: submitting ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          {submitting
            ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
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
          width: 80, height: 80, borderRadius: "50%", backgroundColor: "#dcfce7",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
        }}>
          <Check style={{ width: 36, height: 36, color: "#16a34a" }} strokeWidth={2.5} />
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 6 }}>
          Sale Complete
        </h2>
        <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 4 }}>
          Order #{orderNumber}
        </p>
        <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>
          {labels[paymentMethod]} · Collected in-person
        </p>
        <p style={{ fontSize: 32, fontWeight: 800, color: "#111827", marginBottom: 32 }}>
          ${(total / 100).toFixed(2)} <span style={{ fontSize: 16, fontWeight: 500, color: "#9ca3af" }}>NZD</span>
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/admin/orders"
            style={{
              flex: 1, height: 44, borderRadius: 10, border: "1px solid #e5e7eb",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 500, color: "#374151", textDecoration: "none",
              backgroundColor: "white",
            }}
          >
            View Order
          </Link>
          <button
            onClick={onNewSale}
            style={{
              flex: 1, height: 44, borderRadius: 10, border: "none",
              fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer",
              backgroundColor: "#16a34a",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
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

  const filteredProducts = products.filter(p =>
    !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
  );

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

    // Stripe card: first create PI, then show modal
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
      <div style={{ height: "calc(100vh - 136px)", minHeight: 600 }}>
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
        height: "calc(100vh - 136px)", minHeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          backgroundColor: "white", borderRadius: 16,
          border: "1px solid #e5e7eb", padding: 28,
          width: "100%", maxWidth: 460,
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Card Payment</h3>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>
                {cart.reduce((s, i) => s + i.quantity, 0)} item{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
              </p>
            </div>
            <p style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
              ${(total / 100).toFixed(2)}
              <span style={{ fontSize: 13, fontWeight: 400, color: "#9ca3af" }}> NZD</span>
            </p>
          </div>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: stripeSecret,
              appearance: {
                theme: "stripe",
                variables: { colorPrimary: "#16a34a", borderRadius: "10px" },
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
    { id: "cash",          label: "Cash",     icon: <Banknote style={{ width: 13, height: 13 }} /> },
    { id: "eftpos",        label: "EFTPOS",   icon: <CreditCard style={{ width: 13, height: 13 }} /> },
    { id: "stripe",        label: "Card",     icon: <Smartphone style={{ width: 13, height: 13 }} /> },
    { id: "bank_transfer", label: "Transfer", icon: <Building2 style={{ width: 13, height: 13 }} /> },
    { id: "manual",        label: "Manual",   icon: <ClipboardList style={{ width: 13, height: 13 }} /> },
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
    }}>
      {/* ── LEFT: Product Grid ────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
        {/* Search */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Search
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#9ca3af" }}
          />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", height: 40, paddingLeft: 36, paddingRight: 14,
              fontSize: 13, backgroundColor: "white", border: "1px solid #e5e7eb",
              borderRadius: 10, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Grid */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
          gap: 10,
          alignContent: "start",
          paddingBottom: 8,
        }}>
          {filteredProducts.length === 0 ? (
            <div style={{
              gridColumn: "1/-1", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              paddingTop: 60, color: "#9ca3af", gap: 8,
            }}>
              <Package style={{ width: 32, height: 32, color: "#e5e7eb" }} />
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

      {/* ── RIGHT: Cart ──────────────────────────────────────── */}
      <div style={{
        width: 364,
        display: "flex",
        flexDirection: "column",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        backgroundColor: "white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {/* Cart header */}
        <div style={{
          padding: "13px 16px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <ShoppingCart style={{ width: 15, height: 15, color: "#6b7280" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Cart</span>
            {totalPairs > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "1px 7px",
                borderRadius: 20, backgroundColor: "#dcfce7", color: "#15803d",
              }}>
                {totalPairs} pair{totalPairs !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              style={{ fontSize: 11, color: "#9ca3af", cursor: "pointer", background: "none", border: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Cart items (scrollable) */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {cart.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", padding: 24, textAlign: "center",
            }}>
              <ShoppingCart style={{ width: 32, height: 32, color: "#e5e7eb", marginBottom: 10 }} />
              <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>
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

        {/* ── Fixed bottom ─────────────────────────────────────── */}
        <div style={{ flexShrink: 0, borderTop: "1px solid #f3f4f6" }}>

          {/* Discount section */}
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #f3f4f6" }}>
            {appliedDiscount ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Tag style={{ width: 11, height: 11, color: "#16a34a" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", fontFamily: "monospace" }}>
                    {appliedDiscount.code}
                  </span>
                  <span style={{ fontSize: 11, color: "#4ade80" }}>
                    −${(appliedDiscount.amount / 100).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => setAppliedDiscount(null)}
                  style={{ cursor: "pointer", color: "#9ca3af", background: "none", border: "none" }}
                >
                  <X style={{ width: 11, height: 11 }} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {/* Code input */}
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Tag style={{
                      position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                      width: 10, height: 10, color: "#9ca3af",
                    }} />
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(""); }}
                      onKeyDown={e => e.key === "Enter" && applyDiscountCode()}
                      style={{
                        width: "100%", height: 30, paddingLeft: 24, paddingRight: 8,
                        fontSize: 11, fontFamily: "monospace", backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb", borderRadius: 7, outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <button
                    onClick={applyDiscountCode}
                    disabled={discountLoading || !discountCode.trim()}
                    style={{
                      height: 30, paddingLeft: 10, paddingRight: 10, borderRadius: 7,
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                      backgroundColor: "#f0fdf4", color: "#16a34a",
                      border: "1px solid #bbf7d0", opacity: discountLoading || !discountCode.trim() ? 0.5 : 1,
                      display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    {discountLoading ? <Loader2 style={{ width: 10, height: 10 }} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
                {discountError && <p style={{ fontSize: 10, color: "#ef4444", margin: 0 }}>{discountError}</p>}

                {/* Manual discount */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap" }}>Manual:</span>
                  <select
                    value={manualDiscType}
                    onChange={e => setManualDiscType(e.target.value as "none" | "pct" | "fixed")}
                    style={{
                      height: 26, paddingLeft: 4, paddingRight: 4, fontSize: 10,
                      backgroundColor: "#f9fafb", border: "1px solid #e5e7eb",
                      borderRadius: 6, outline: "none", cursor: "pointer",
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
                          width: 52, height: 26, textAlign: "center", fontSize: 11,
                          backgroundColor: "#f9fafb", border: "1px solid #e5e7eb",
                          borderRadius: 6, outline: "none",
                        }}
                      />
                      {manualDiscAmount > 0 && (
                        <span style={{ fontSize: 10, color: "#16a34a", fontWeight: 600 }}>
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
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Subtotal</span>
                <span style={{ fontSize: 12, color: "#6b7280" }}>${(subtotal / 100).toFixed(2)}</span>
              </div>
              {totalDiscountAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#16a34a" }}>Discount</span>
                  <span style={{ fontSize: 12, color: "#16a34a" }}>−${(totalDiscountAmount / 100).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>Incl. GST (15%)</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>${(gstIncluded / 100).toFixed(2)}</span>
              </div>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "baseline",
              marginTop: 10, paddingTop: 10, borderTop: "1px solid #f3f4f6",
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>
                ${(total / 100).toFixed(2)}
                <span style={{ fontSize: 12, fontWeight: 400, color: "#9ca3af" }}> NZD</span>
              </span>
            </div>
          </div>

          {/* Customer (collapsible) */}
          <div style={{ padding: "8px 16px", borderBottom: "1px solid #f3f4f6" }}>
            <button
              onClick={() => setShowCustomer(v => !v)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", background: "none", border: "none", padding: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <User style={{ width: 11, height: 11, color: "#9ca3af" }} />
                <span style={{ fontSize: 11, color: "#6b7280" }}>
                  {showCustomer ? "Customer details" : "Add customer (optional)"}
                </span>
              </div>
              {showCustomer
                ? <ChevronUp style={{ width: 11, height: 11, color: "#9ca3af" }} />
                : <ChevronDown style={{ width: 11, height: 11, color: "#9ca3af" }} />}
            </button>

            {showCustomer && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                {(["name", "email", "phone"] as const).map(field => (
                  <input
                    key={field}
                    type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                    placeholder={field === "name" ? "Full name" : field === "email" ? "Email (for receipt)" : "Phone"}
                    value={customer[field]}
                    onChange={e => setCustomer(c => ({ ...c, [field]: e.target.value }))}
                    style={{
                      width: "100%", height: 30, padding: "0 10px", fontSize: 11,
                      backgroundColor: "#f9fafb", border: "1px solid #e5e7eb",
                      borderRadius: 7, outline: "none", boxSizing: "border-box",
                    }}
                  />
                ))}
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={posNotes}
                  onChange={e => setPosNotes(e.target.value)}
                  style={{
                    width: "100%", height: 30, padding: "0 10px", fontSize: 11,
                    backgroundColor: "#f9fafb", border: "1px solid #e5e7eb",
                    borderRadius: 7, outline: "none", boxSizing: "border-box",
                  }}
                />
                {customer.email && (
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={sendReceipt}
                      onChange={e => setSendReceipt(e.target.checked)}
                      style={{ width: 12, height: 12, accentColor: "#16a34a" }}
                    />
                    <span style={{ fontSize: 10, color: "#6b7280" }}>
                      Email receipt to {customer.email}
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Payment method */}
          <div style={{ padding: "8px 16px", borderBottom: "1px solid #f3f4f6" }}>
            <p style={{
              fontSize: 10, fontWeight: 600, color: "#9ca3af",
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6,
            }}>
              Payment
            </p>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {paymentMethods.map(pm => {
                const active = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      height: 28, paddingLeft: 10, paddingRight: 10,
                      borderRadius: 7, fontSize: 11, fontWeight: 600,
                      cursor: "pointer", transition: "all 0.1s",
                      backgroundColor: active ? "#0f1a12" : "#f3f4f6",
                      color: active ? "white" : "#6b7280",
                      border: active ? "1px solid transparent" : "1px solid #e5e7eb",
                    }}
                  >
                    {pm.icon}
                    {pm.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error + CTA */}
          <div style={{ padding: "12px 14px" }}>
            {saleError && (
              <p style={{ fontSize: 11, color: "#ef4444", marginBottom: 8, padding: "6px 10px", backgroundColor: "#fef2f2", borderRadius: 7 }}>
                {saleError}
              </p>
            )}
            <button
              onClick={() => completeSale()}
              disabled={cart.length === 0 || processing || stripeLoading}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 10,
                border: "none",
                fontSize: 14,
                fontWeight: 700,
                color: "white",
                cursor: cart.length === 0 || processing || stripeLoading ? "not-allowed" : "pointer",
                backgroundColor: cart.length === 0 ? "#9ca3af" : "#16a34a",
                boxShadow: cart.length > 0 ? "0 4px 14px rgba(22,163,74,0.3)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.15s",
              }}
            >
              {processing || stripeLoading ? (
                <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
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
