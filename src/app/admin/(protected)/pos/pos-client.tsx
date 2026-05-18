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
    <div className="rounded-xl bg-white border border-[#E2E8F0] overflow-hidden flex flex-col" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
      {/* Image */}
      <div className="relative aspect-square bg-[#F3F5F8]">
        {product.image_urls?.[0] ? (
          <Image
            src={product.image_urls[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package style={{ width: 28, height: 28, color: "#C4CAD4" }} />
          </div>
        )}
      </div>

      {/* Info + size buttons */}
      <div className="p-2.5">
        <p className="text-[12px] font-semibold text-[#1F2937] leading-tight mb-1 line-clamp-2">
          {product.name}
        </p>
        <p className="text-[13px] font-bold text-[#1F2937] mb-2 font-mono">
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
                    ? "#F3F5F8"
                    : inCart
                      ? "#EAF2FF"
                      : "#EAF2FF",
                  color: outOfStock ? "#C4CAD4" : inCart ? "#116DFF" : "#116DFF",
                  border: outOfStock
                    ? "1px solid #E2E8F0"
                    : inCart
                      ? "1.5px solid #116DFF"
                      : "1px solid #BBD3FF",
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
                  ? "#991B1B"
                  : v.stock_quantity <= 3
                    ? "#92400E"
                    : "#8A94A6",
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
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-[#E5EAF1]">
      {/* Name + size */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-[#1F2937] leading-tight truncate">{item.productName}</p>
        <p className="text-[10px] text-[#6B7280] leading-none mt-0.5">Size {item.size}</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onQty(item.variantId, -1)}
          className="w-[22px] h-[22px] rounded-md border border-[#E2E8F0] bg-white flex items-center justify-center hover:bg-[#F6FAFF] transition-colors"
        >
          <Minus style={{ width: 9, height: 9, color: "#6B7280" }} />
        </button>
        <span className="text-[12px] font-bold text-[#1F2937] w-[18px] text-center font-mono">
          {item.quantity}
        </span>
        <button
          onClick={() => onQty(item.variantId, 1)}
          disabled={item.quantity >= item.maxQty}
          className="w-[22px] h-[22px] rounded-md border border-[#E2E8F0] bg-white flex items-center justify-center hover:bg-[#F6FAFF] transition-colors disabled:opacity-30"
        >
          <Plus style={{ width: 9, height: 9, color: "#6B7280" }} />
        </button>
      </div>

      {/* Price (editable) */}
      <div className="w-[58px] text-right">
        {editing ? (
          <div className="flex items-center gap-0.5 justify-end">
            <span className="text-[10px] text-[#6B7280]">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceInput}
              onChange={e => setPriceInput(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={e => e.key === "Enter" && commitPrice()}
              autoFocus
              className="w-[46px] text-[12px] font-bold text-right bg-transparent border-b border-[#116DFF]/60 outline-none text-[#1F2937] font-mono"
            />
          </div>
        ) : (
          <button
            onClick={() => { setEditing(true); setPriceInput((item.unitPrice / 100).toFixed(2)); }}
            title="Click to override price"
            className="text-right cursor-pointer"
          >
            <p className="text-[12px] font-bold leading-tight font-mono" style={{ color: overridden ? "#116DFF" : "#1F2937" }}>
              ${((item.unitPrice * item.quantity) / 100).toFixed(2)}
            </p>
            {overridden && (
              <p className="text-[9px] text-[#8A94A6] line-through leading-none font-mono">
                ${((item.originalPrice * item.quantity) / 100).toFixed(2)}
              </p>
            )}
          </button>
        )}
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.variantId)}
        className="w-5 h-5 flex items-center justify-center text-[#C4CAD4] hover:text-[#991B1B] transition-colors"
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
        <p className="text-[12px] text-[#991B1B]">{error}</p>
      )}
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-11 rounded-full bg-white border border-[#E2E8F0] text-[13px] font-medium text-[#334155] hover:bg-[#F6FAFF] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !stripe}
          className="flex-1 h-11 rounded-full bg-[#116DFF] text-white text-[13px] font-bold hover:bg-[#0D5FE0] disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
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
        <div className="w-20 h-20 rounded-full bg-[#D5F1E2] border border-[#A7D7B9] flex items-center justify-center mx-auto mb-6">
          <Check style={{ width: 36, height: 36, color: "#166B3B" }} strokeWidth={2.5} />
        </div>

        <h2 className="text-[28px] font-bold text-[#1F2937] mb-1.5">
          Sale Complete
        </h2>
        <p className="text-[15px] text-[#334155] mb-1">
          Order #{orderNumber}
        </p>
        <p className="text-[13px] text-[#6B7280] mb-5">
          {labels[paymentMethod]} · Collected in-person
        </p>
        <p className="text-[32px] font-bold text-[#1F2937] mb-8 font-mono">
          ${(total / 100).toFixed(2)} <span className="text-[16px] font-normal text-[#6B7280]">NZD</span>
        </p>

        <div className="flex gap-2.5">
          <Link
            href="/admin/orders"
            className="flex-1 h-11 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[13px] font-medium text-[#334155] hover:bg-[#F6FAFF] transition-colors"
          >
            View Order
          </Link>
          <button
            onClick={onNewSale}
            className="flex-1 h-11 rounded-full bg-[#116DFF] text-white text-[13px] font-bold hover:bg-[#0D5FE0] transition-colors flex items-center justify-center gap-1.5"
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
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-7 w-full max-w-[460px]" style={{ boxShadow: "0 24px 48px rgba(15,23,42,0.12)" }}>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-[16px] font-bold text-[#1F2937]">Card Payment</h3>
              <p className="text-[12px] text-[#6B7280] mt-1">
                {cart.reduce((s, i) => s + i.quantity, 0)} item{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
              </p>
            </div>
            <p className="text-[24px] font-bold text-[#1F2937] font-mono">
              ${(total / 100).toFixed(2)}
              <span className="text-[13px] font-normal text-[#6B7280]"> NZD</span>
            </p>
          </div>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: stripeSecret,
              appearance: {
                theme: "stripe",
                variables: { colorPrimary: "#116DFF", borderRadius: "10px" },
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 14, height: 14, color: "#8A94A6" }} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 text-[13px] bg-white border border-[#E2E8F0] rounded-xl text-[#334155] placeholder:text-[#C4CAD4] focus:outline-none focus:border-[#116DFF]/50 transition-colors"
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
            <div style={{ gridColumn: "1/-1" }} className="flex flex-col items-center justify-center pt-16 text-[#C4CAD4] gap-2">
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
      <div className="w-[364px] flex flex-col bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shrink-0" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        {/* Cart header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] shrink-0">
          <div className="flex items-center gap-1.5">
            <ShoppingCart style={{ width: 15, height: 15, color: "#6B7280" }} />
            <span className="text-[14px] font-bold text-[#1F2937]">Cart</span>
            {totalPairs > 0 && (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#116DFF] border border-[#BBD3FF]">
                {totalPairs} pair{totalPairs !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-[11px] text-[#6B7280] hover:text-[#991B1B] transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Cart items (scrollable) */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ShoppingCart style={{ width: 32, height: 32, color: "#C4CAD4" }} className="mb-2.5" />
              <p className="text-[12px] text-[#6B7280] leading-relaxed">
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
        <div className="shrink-0 border-t border-[#E2E8F0]">

          {/* Discount section */}
          <div className="px-3.5 py-2.5 border-b border-[#E5EAF1]">
            {appliedDiscount ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Tag style={{ width: 11, height: 11, color: "#116DFF" }} />
                  <span className="text-[12px] font-bold text-[#116DFF] font-mono">
                    {appliedDiscount.code}
                  </span>
                  <span className="text-[11px] text-[#116DFF]/60 font-mono">
                    −${(appliedDiscount.amount / 100).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => setAppliedDiscount(null)}
                  className="text-[#C4CAD4] hover:text-[#6B7280] transition-colors"
                >
                  <X style={{ width: 11, height: 11 }} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {/* Code input */}
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <Tag style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 10, height: 10, color: "#8A94A6" }} />
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(""); }}
                      onKeyDown={e => e.key === "Enter" && applyDiscountCode()}
                      className="w-full h-[30px] pl-6 pr-2 text-[11px] font-mono bg-white border border-[#E2E8F0] rounded-lg text-[#334155] placeholder:text-[#C4CAD4] focus:outline-none focus:border-[#116DFF]/50"
                    />
                  </div>
                  <button
                    onClick={applyDiscountCode}
                    disabled={discountLoading || !discountCode.trim()}
                    className="h-[30px] px-2.5 rounded-lg text-[11px] font-semibold bg-[#EAF2FF] text-[#116DFF] border border-[#BBD3FF] hover:bg-[#DBEAFE] disabled:opacity-40 transition-colors flex items-center gap-1"
                  >
                    {discountLoading ? <Loader2 style={{ width: 10, height: 10 }} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
                {discountError && <p className="text-[10px] text-[#991B1B]">{discountError}</p>}

                {/* Manual discount */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#6B7280] whitespace-nowrap">Manual:</span>
                  <select
                    value={manualDiscType}
                    onChange={e => setManualDiscType(e.target.value as "none" | "pct" | "fixed")}
                    className="h-[26px] px-1 text-[10px] bg-white border border-[#E2E8F0] rounded-md text-[#334155] focus:outline-none"
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
                        className="w-[52px] h-[26px] text-center text-[11px] bg-white border border-[#E2E8F0] rounded-md text-[#334155] focus:outline-none font-mono"
                      />
                      {manualDiscAmount > 0 && (
                        <span className="text-[10px] text-[#116DFF] font-semibold font-mono">
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
          <div className="px-4 py-2.5 border-b border-[#E5EAF1]">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-[12px] text-[#6B7280]">Subtotal</span>
                <span className="text-[12px] text-[#6B7280] font-mono">${(subtotal / 100).toFixed(2)}</span>
              </div>
              {totalDiscountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[12px] text-[#116DFF]">Discount</span>
                  <span className="text-[12px] text-[#116DFF] font-mono">−${(totalDiscountAmount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[11px] text-[#8A94A6]">Incl. GST (15%)</span>
                <span className="text-[11px] text-[#8A94A6] font-mono">${(gstIncluded / 100).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-baseline mt-2.5 pt-2.5 border-t border-[#E5EAF1]">
              <span className="text-[14px] font-bold text-[#1F2937]">Total</span>
              <span className="text-[22px] font-bold text-[#1F2937] font-mono">
                ${(total / 100).toFixed(2)}
                <span className="text-[12px] font-normal text-[#6B7280]"> NZD</span>
              </span>
            </div>
          </div>

          {/* Customer (collapsible) */}
          <div className="px-4 py-2 border-b border-[#E5EAF1]">
            <button
              onClick={() => setShowCustomer(v => !v)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                <User style={{ width: 11, height: 11, color: "#8A94A6" }} />
                <span className="text-[11px] text-[#6B7280]">
                  {showCustomer ? "Customer details" : "Add customer (optional)"}
                </span>
              </div>
              {showCustomer
                ? <ChevronUp style={{ width: 11, height: 11, color: "#8A94A6" }} />
                : <ChevronDown style={{ width: 11, height: 11, color: "#8A94A6" }} />}
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
                    className="w-full h-[30px] px-2.5 text-[11px] bg-white border border-[#E2E8F0] rounded-lg text-[#334155] placeholder:text-[#C4CAD4] focus:outline-none focus:border-[#116DFF]/50"
                  />
                ))}
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={posNotes}
                  onChange={e => setPosNotes(e.target.value)}
                  className="w-full h-[30px] px-2.5 text-[11px] bg-white border border-[#E2E8F0] rounded-lg text-[#334155] placeholder:text-[#C4CAD4] focus:outline-none focus:border-[#116DFF]/50"
                />
                {customer.email && (
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendReceipt}
                      onChange={e => setSendReceipt(e.target.checked)}
                      className="w-3 h-3 accent-[#116DFF]"
                    />
                    <span className="text-[10px] text-[#6B7280]">
                      Email receipt to {customer.email}
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="px-4 py-2 border-b border-[#E5EAF1]">
            <p className="text-[10px] font-semibold text-[#8A94A6] uppercase tracking-wider mb-1.5">
              Payment
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {paymentMethods.map(pm => {
                const active = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className="flex items-center gap-1 h-[28px] px-2.5 rounded-full text-[11px] font-semibold transition-all duration-100"
                    style={{
                      backgroundColor: active ? "#EAF2FF" : "#F3F5F8",
                      color: active ? "#116DFF" : "#6B7280",
                      border: active ? "1px solid #BBD3FF" : "1px solid #E2E8F0",
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
              <p className="text-[11px] text-[#991B1B] mb-2 px-2.5 py-1.5 bg-[#FEE2E2] rounded-lg border border-[#FCA5A5]">
                {saleError}
              </p>
            )}
            <button
              onClick={() => completeSale()}
              disabled={cart.length === 0 || processing || stripeLoading}
              className="w-full h-12 rounded-xl text-[14px] font-bold text-white transition-all duration-150 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              style={{
                backgroundColor: cart.length === 0 ? "#E2E8F0" : "#116DFF",
                color: cart.length === 0 ? "#8A94A6" : "white",
                boxShadow: cart.length > 0 ? "0 4px 16px rgba(17,109,255,0.25)" : "none",
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
