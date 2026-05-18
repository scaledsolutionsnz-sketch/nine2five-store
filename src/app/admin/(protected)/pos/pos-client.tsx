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
    <div className="bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-white/[0.04]">
        {product.image_urls?.[0] ? (
          <Image
            src={product.image_urls[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package style={{ width: 28, height: 28, color: "rgba(244,244,245,0.15)" }} />
          </div>
        )}
      </div>

      {/* Info + size buttons */}
      <div className="p-2.5">
        <p className="text-[12px] font-semibold text-white leading-tight mb-1 line-clamp-2">
          {product.name}
        </p>
        <p className="text-[13px] font-bold text-white mb-2 font-mono">
          ${(product.price / 100).toFixed(2)}
        </p>

        <div className="flex gap-1.5">
          {variants.map(variant => {
            const inCart = cartItems.find(i => i.variantId === variant.id);
            const outOfStock = variant.stock_quantity === 0;
            return (
              <button
                key={variant.id}
                onClick={() => !outOfStock && onAdd(product, variant)}
                disabled={outOfStock}
                className="flex-1 h-[30px] rounded-lg text-[11px] font-bold transition-all duration-100 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: outOfStock
                    ? "rgba(255,255,255,0.04)"
                    : inCart
                      ? "rgba(74,222,128,0.15)"
                      : "rgba(74,222,128,0.08)",
                  color: outOfStock ? "rgba(244,244,245,0.2)" : inCart ? "#4ade80" : "rgba(74,222,128,0.8)",
                  border: outOfStock
                    ? "1px solid rgba(255,255,255,0.06)"
                    : inCart
                      ? "1.5px solid rgba(74,222,128,0.4)"
                      : "1px solid rgba(74,222,128,0.2)",
                }}
              >
                {variant.size}{inCart ? ` ×${inCart.quantity}` : ""}
              </button>
            );
          })}
        </div>

        {/* Stock labels */}
        <div className="flex gap-1.5 mt-1">
          {variants.map(v => (
            <div key={v.id} className="flex-1 text-center">
              <span style={{
                fontSize: 9, fontWeight: 500,
                color: v.stock_quantity === 0
                  ? "#f87171"
                  : v.stock_quantity <= 3
                    ? "#fb923c"
                    : "rgba(244,244,245,0.25)",
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
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-white/[0.04]">
      {/* Name + size */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-white leading-tight truncate">{item.productName}</p>
        <p className="text-[10px] text-white/30 leading-none mt-0.5">Size {item.size}</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onQty(item.variantId, -1)}
          className="w-[22px] h-[22px] rounded-md border border-white/[0.08] bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
        >
          <Minus style={{ width: 9, height: 9, color: "rgba(244,244,245,0.5)" }} />
        </button>
        <span className="text-[12px] font-bold text-white w-[18px] text-center font-mono">
          {item.quantity}
        </span>
        <button
          onClick={() => onQty(item.variantId, 1)}
          disabled={item.quantity >= item.maxQty}
          className="w-[22px] h-[22px] rounded-md border border-white/[0.08] bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors disabled:opacity-30"
        >
          <Plus style={{ width: 9, height: 9, color: "rgba(244,244,245,0.5)" }} />
        </button>
      </div>

      {/* Price (editable) */}
      <div className="w-[58px] text-right">
        {editing ? (
          <div className="flex items-center gap-0.5 justify-end">
            <span className="text-[10px] text-white/30">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceInput}
              onChange={e => setPriceInput(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={e => e.key === "Enter" && commitPrice()}
              autoFocus
              className="w-[46px] text-[12px] font-bold text-right bg-transparent border-b border-[#4ade80]/60 outline-none text-white font-mono"
            />
          </div>
        ) : (
          <button
            onClick={() => { setEditing(true); setPriceInput((item.unitPrice / 100).toFixed(2)); }}
            title="Click to override price"
            className="text-right cursor-pointer"
          >
            <p className="text-[12px] font-bold leading-tight font-mono" style={{ color: overridden ? "#4ade80" : "rgba(244,244,245,0.9)" }}>
              ${((item.unitPrice * item.quantity) / 100).toFixed(2)}
            </p>
            {overridden && (
              <p className="text-[9px] text-white/20 line-through leading-none font-mono">
                ${((item.originalPrice * item.quantity) / 100).toFixed(2)}
              </p>
            )}
          </button>
        )}
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.variantId)}
        className="w-5 h-5 flex items-center justify-center text-white/20 hover:text-red-400 transition-colors"
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
    <form onSubmit={handlePay} className="flex flex-col gap-4">
      <PaymentElement />
      {error && (
        <p className="text-[12px] text-red-400">{error}</p>
      )}
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[13px] font-medium text-white/70 hover:bg-white/[0.1] hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !stripe}
          className="flex-1 h-11 rounded-xl bg-[#4ade80] text-black text-[13px] font-bold hover:bg-[#86efac] disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
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
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-[360px]">
        <div className="w-20 h-20 rounded-full bg-[#4ade80]/[0.12] border border-[#4ade80]/20 flex items-center justify-center mx-auto mb-6">
          <Check style={{ width: 36, height: 36, color: "#4ade80" }} strokeWidth={2.5} />
        </div>

        <h2 className="text-[28px] font-bold text-white mb-1.5">
          Sale Complete
        </h2>
        <p className="text-[15px] text-white/50 mb-1">
          Order #{orderNumber}
        </p>
        <p className="text-[13px] text-white/30 mb-5">
          {labels[paymentMethod]} · Collected in-person
        </p>
        <p className="text-[32px] font-bold text-white mb-8 font-mono">
          ${(total / 100).toFixed(2)} <span className="text-[16px] font-normal text-white/30">NZD</span>
        </p>

        <div className="flex gap-2.5">
          <Link
            href="/admin/orders"
            className="flex-1 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[13px] font-medium text-white/70 hover:bg-white/[0.1] hover:text-white transition-colors"
          >
            View Order
          </Link>
          <button
            onClick={onNewSale}
            className="flex-1 h-11 rounded-xl bg-[#4ade80] text-black text-[13px] font-bold hover:bg-[#86efac] transition-colors flex items-center justify-center gap-1.5"
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
      <div style={{ height: "calc(100vh - 136px)", minHeight: 600 }} className="flex items-center justify-center">
        <div className="bg-[#111113] border border-white/[0.1] rounded-2xl p-7 w-full max-w-[460px]">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-[16px] font-bold text-white">Card Payment</h3>
              <p className="text-[12px] text-white/40 mt-1">
                {cart.reduce((s, i) => s + i.quantity, 0)} item{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
              </p>
            </div>
            <p className="text-[24px] font-bold text-white font-mono">
              ${(total / 100).toFixed(2)}
              <span className="text-[13px] font-normal text-white/30"> NZD</span>
            </p>
          </div>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: stripeSecret,
              appearance: {
                theme: "night",
                variables: { colorPrimary: "#4ade80", borderRadius: "10px", colorBackground: "#111113" },
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
    <div style={{ height: "calc(100vh - 136px)", minHeight: 620 }} className="flex gap-4 overflow-hidden">
      {/* ── LEFT: Product Grid ────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        {/* Search */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 14, height: 14, color: "rgba(244,244,245,0.3)" }} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 text-[13px] bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-[#4ade80]/40 transition-colors"
          />
        </div>

        {/* Grid */}
        <div
          className="flex-1 overflow-y-auto pb-2"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
            gap: 10,
            alignContent: "start",
          }}
        >
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: "1/-1" }} className="flex flex-col items-center justify-center pt-16 text-white/20 gap-2">
              <Package style={{ width: 32, height: 32 }} />
              <p className="text-[13px]">No products found</p>
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
      <div className="w-[364px] flex flex-col bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden shrink-0">
        {/* Cart header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-1.5">
            <ShoppingCart style={{ width: 15, height: 15, color: "rgba(244,244,245,0.4)" }} />
            <span className="text-[14px] font-bold text-white">Cart</span>
            {totalPairs > 0 && (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20">
                {totalPairs} pair{totalPairs !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-[11px] text-white/30 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Cart items (scrollable) */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ShoppingCart style={{ width: 32, height: 32, color: "rgba(244,244,245,0.1)" }} className="mb-2.5" />
              <p className="text-[12px] text-white/30 leading-relaxed">
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
        <div className="shrink-0 border-t border-white/[0.06]">

          {/* Discount section */}
          <div className="px-3.5 py-2.5 border-b border-white/[0.04]">
            {appliedDiscount ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Tag style={{ width: 11, height: 11, color: "#4ade80" }} />
                  <span className="text-[12px] font-bold text-[#4ade80] font-mono">
                    {appliedDiscount.code}
                  </span>
                  <span className="text-[11px] text-[#4ade80]/60 font-mono">
                    −${(appliedDiscount.amount / 100).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => setAppliedDiscount(null)}
                  className="text-white/20 hover:text-white/50 transition-colors"
                >
                  <X style={{ width: 11, height: 11 }} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {/* Code input */}
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Tag style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 10, height: 10, color: "rgba(244,244,245,0.25)" }} />
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(""); }}
                      onKeyDown={e => e.key === "Enter" && applyDiscountCode()}
                      className="w-full h-[30px] pl-6 pr-2 text-[11px] font-mono bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#4ade80]/40"
                    />
                  </div>
                  <button
                    onClick={applyDiscountCode}
                    disabled={discountLoading || !discountCode.trim()}
                    className="h-[30px] px-2.5 rounded-lg text-[11px] font-semibold bg-[#4ade80]/[0.08] text-[#4ade80] border border-[#4ade80]/20 hover:bg-[#4ade80]/[0.15] disabled:opacity-40 transition-colors flex items-center gap-1"
                  >
                    {discountLoading ? <Loader2 style={{ width: 10, height: 10 }} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
                {discountError && <p className="text-[10px] text-red-400">{discountError}</p>}

                {/* Manual discount */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-white/30 whitespace-nowrap">Manual:</span>
                  <select
                    value={manualDiscType}
                    onChange={e => setManualDiscType(e.target.value as "none" | "pct" | "fixed")}
                    className="h-[26px] px-1 text-[10px] bg-white/[0.04] border border-white/[0.08] rounded-md text-white focus:outline-none"
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
                        className="w-[52px] h-[26px] text-center text-[11px] bg-white/[0.04] border border-white/[0.08] rounded-md text-white focus:outline-none font-mono"
                      />
                      {manualDiscAmount > 0 && (
                        <span className="text-[10px] text-[#4ade80] font-semibold font-mono">
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
          <div className="px-4 py-2.5 border-b border-white/[0.04]">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-[12px] text-white/40">Subtotal</span>
                <span className="text-[12px] text-white/40 font-mono">${(subtotal / 100).toFixed(2)}</span>
              </div>
              {totalDiscountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[12px] text-[#4ade80]">Discount</span>
                  <span className="text-[12px] text-[#4ade80] font-mono">−${(totalDiscountAmount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[11px] text-white/25">Incl. GST (15%)</span>
                <span className="text-[11px] text-white/25 font-mono">${(gstIncluded / 100).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-baseline mt-2.5 pt-2.5 border-t border-white/[0.04]">
              <span className="text-[14px] font-bold text-white">Total</span>
              <span className="text-[22px] font-bold text-white font-mono">
                ${(total / 100).toFixed(2)}
                <span className="text-[12px] font-normal text-white/30"> NZD</span>
              </span>
            </div>
          </div>

          {/* Customer (collapsible) */}
          <div className="px-4 py-2 border-b border-white/[0.04]">
            <button
              onClick={() => setShowCustomer(v => !v)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <User style={{ width: 11, height: 11, color: "rgba(244,244,245,0.25)" }} />
                <span className="text-[11px] text-white/40">
                  {showCustomer ? "Customer details" : "Add customer (optional)"}
                </span>
              </div>
              {showCustomer
                ? <ChevronUp style={{ width: 11, height: 11, color: "rgba(244,244,245,0.25)" }} />
                : <ChevronDown style={{ width: 11, height: 11, color: "rgba(244,244,245,0.25)" }} />}
            </button>

            {showCustomer && (
              <div className="mt-2 flex flex-col gap-1.5">
                {(["name", "email", "phone"] as const).map(field => (
                  <input
                    key={field}
                    type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                    placeholder={field === "name" ? "Full name" : field === "email" ? "Email (for receipt)" : "Phone"}
                    value={customer[field]}
                    onChange={e => setCustomer(c => ({ ...c, [field]: e.target.value }))}
                    className="w-full h-[30px] px-2.5 text-[11px] bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#4ade80]/40"
                  />
                ))}
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={posNotes}
                  onChange={e => setPosNotes(e.target.value)}
                  className="w-full h-[30px] px-2.5 text-[11px] bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-[#4ade80]/40"
                />
                {customer.email && (
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendReceipt}
                      onChange={e => setSendReceipt(e.target.checked)}
                      className="w-3 h-3 accent-[#4ade80]"
                    />
                    <span className="text-[10px] text-white/40">
                      Email receipt to {customer.email}
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="px-4 py-2 border-b border-white/[0.04]">
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-1.5">
              Payment
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {paymentMethods.map(pm => {
                const active = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className="flex items-center gap-1 h-[28px] px-2.5 rounded-lg text-[11px] font-semibold transition-all duration-100"
                    style={{
                      backgroundColor: active ? "#0c0c0e" : "rgba(255,255,255,0.04)",
                      color: active ? "white" : "rgba(244,244,245,0.4)",
                      border: active ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,255,255,0.06)",
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
          <div className="px-3.5 py-3">
            {saleError && (
              <p className="text-[11px] text-red-400 mb-2 px-2.5 py-1.5 bg-red-400/[0.08] rounded-lg border border-red-400/20">
                {saleError}
              </p>
            )}
            <button
              onClick={() => completeSale()}
              disabled={cart.length === 0 || processing || stripeLoading}
              className="w-full h-12 rounded-xl text-[14px] font-bold text-black transition-all duration-150 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              style={{
                backgroundColor: cart.length === 0 ? "rgba(244,244,245,0.08)" : "#4ade80",
                color: cart.length === 0 ? "rgba(244,244,245,0.2)" : "black",
                boxShadow: cart.length > 0 ? "0 4px 16px rgba(74,222,128,0.2)" : "none",
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

// Suppress unused import warning for Pencil
void Pencil;
