"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@/lib/cart-context";
import { NZ_REGIONS, calculateShippingByPairs } from "@/lib/shipping";
import { getCookie } from "@/components/storefront/affiliate-tracker";
import type { ShippingAddress } from "@/types/database";
import { ChevronLeft, ChevronRight, Loader2, Tag, X, Check, Package, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const COUNTRIES = [
  { code: "NZ", label: "New Zealand" },
  { code: "AU", label: "Australia" },
];

const STEP_LABELS = ["Information", "Shipping", "Payment"];

const inputClass =
  "w-full h-11 px-3 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm placeholder-[#525252] focus:outline-none focus:border-[#16a34a] transition-colors";

export default function CheckoutPage() {
  const { items, total, count } = useCart();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [clientSecret, setClientSecret] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [isBulk, setIsBulk] = useState(false);
  const [country, setCountry] = useState("NZ");
  const [loading, setLoading] = useState(false);
  const [discounts, setDiscounts] = useState<Array<{ code: string; amount: number; free_shipping: boolean }>>([]);

  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<Partial<ShippingAddress>>({
    first_name: "", last_name: "", line1: "", line2: "",
    city: "", region: "", postcode: "", phone: "",
  });

  const sessionIdRef = useRef<string>("");
  useEffect(() => {
    const stored = sessionStorage.getItem("n2f_session");
    if (stored) {
      sessionIdRef.current = stored;
    } else {
      const id = crypto.randomUUID();
      sessionStorage.setItem("n2f_session", id);
      sessionIdRef.current = id;
    }
  }, []);

  useEffect(() => {
    if (count === 0) return;
    setLoading(true);
    setIsBulk(false);
    setClientSecret("");
    setDiscounts([]);
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, country }),
    })
      .then((r) => r.json())
      .then((data: { clientSecret?: string; shipping?: number; isBulk?: boolean }) => {
        if (data.isBulk) {
          setIsBulk(true);
        } else {
          setClientSecret(data.clientSecret!);
          setShippingCost(data.shipping!);
        }
      })
      .finally(() => setLoading(false));
  }, [items, country, count]);

  // Keep Stripe PI amount in sync whenever discounts or shipping change
  useEffect(() => {
    if (!clientSecret || isBulk) return;
    const discountAmt = discounts.reduce((s, d) => s + d.amount, 0);
    const effectiveShip = discounts.some(d => d.free_shipping) ? 0 : shippingCost;
    fetch("/api/create-payment-intent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientSecret,
        amount_only: true,
        subtotal: total,
        shipping: effectiveShip,
        discount_amount: discountAmt,
      }),
    }).catch(() => {});
  }, [discounts, shippingCost, clientSecret, isBulk, total]);

  const syncCart = useCallback(() => {
    const sessionId = sessionIdRef.current;
    if (!sessionId || !email || !items.length) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, email, items, country }),
    }).catch(() => {});
  }, [email, items, country]);

  if (count === 0) {
    return (
      <div className="pt-24 pb-24 px-5 sm:px-8 text-center max-w-md mx-auto">
        <p className="text-[#737373] mb-4">Your cart is empty.</p>
        <Link href="/shop" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  const totalDiscountAmount = discounts.reduce((sum, d) => sum + d.amount, 0);
  const effectiveShipping = discounts.some(d => d.free_shipping) ? 0 : shippingCost;
  const orderTotal = total + effectiveShipping - totalDiscountAmount;
  const totalPairs = items.reduce((s, i) => s + i.quantity, 0);
  const shippingInfo = calculateShippingByPairs(totalPairs, country);

  const step1Valid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    !!(address.first_name && address.last_name && address.line1 && address.city && address.postcode && address.region);

  return (
    <div className="pt-24 pb-24 px-5 sm:px-8 md:px-10 max-w-5xl mx-auto">
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-white transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <h1 className="font-display font-black text-3xl mb-8">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEP_LABELS.map((label, i) => {
          const num = (i + 1) as 1 | 2 | 3;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={label} className="flex items-center">
              {i > 0 && (
                <div className={cn("h-px w-8 md:w-12 transition-colors", isDone ? "bg-[#16a34a]" : "bg-[#262626]")} />
              )}
              <button
                type="button"
                onClick={() => { if (isDone) setStep(num); }}
                className={cn("flex flex-col items-center gap-1.5", isDone && "cursor-pointer")}
              >
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  isActive && "bg-[#16a34a] text-white",
                  isDone && "bg-[#16a34a]/20 text-[#16a34a] hover:bg-[#16a34a]/30",
                  !isActive && !isDone && "bg-[#1a1a1a] border border-[#262626] text-[#525252]",
                )}>
                  {isDone ? <Check className="h-3.5 w-3.5" /> : num}
                </div>
                <span className={cn(
                  "text-xs hidden sm:block transition-colors",
                  isActive && "text-white font-semibold",
                  isDone && "text-[#16a34a]",
                  !isActive && !isDone && "text-[#525252]",
                )}>
                  {label}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-[1fr_360px] gap-12">
        {/* ── Left column ── */}
        <div>
          {/* STEP 1 — Information */}
          {step === 1 && (
            <div className="space-y-6">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[#16a34a]" />
                </div>
              )}

              {isBulk && !loading && (
                <div className="rounded-xl bg-[#141414] border border-[#262626] p-6 text-center space-y-4">
                  <p className="text-sm text-[#737373] leading-relaxed">
                    Your order contains more than 12 pairs.<br />
                    Please contact us directly for bulk shipping rates.
                  </p>
                  <a href="mailto:nine2five.co.nz@gmail.com" className="btn-primary inline-block px-8">Contact Us</a>
                </div>
              )}

              {!isBulk && !loading && (
                <>
                  <div>
                    <h2 className="font-display font-bold text-base mb-4">Contact</h2>
                    <div className="space-y-3">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={cn(inputClass, "appearance-none")}
                      >
                        {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                      <input
                        type="email" placeholder="Email address" required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={syncCart}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-base mb-4">Shipping Address</h2>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input placeholder="First name" required value={address.first_name ?? ""} onChange={(e) => setAddress(a => ({ ...a, first_name: e.target.value }))} className={inputClass} />
                        <input placeholder="Last name" required value={address.last_name ?? ""} onChange={(e) => setAddress(a => ({ ...a, last_name: e.target.value }))} className={inputClass} />
                      </div>
                      <input placeholder="Address line 1" required value={address.line1 ?? ""} onChange={(e) => setAddress(a => ({ ...a, line1: e.target.value }))} className={inputClass} />
                      <input placeholder="Address line 2 (optional)" value={address.line2 ?? ""} onChange={(e) => setAddress(a => ({ ...a, line2: e.target.value }))} className={inputClass} />
                      <div className="grid grid-cols-2 gap-3">
                        <input placeholder="City / Town" required value={address.city ?? ""} onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))} className={inputClass} />
                        <input placeholder="Postcode" required value={address.postcode ?? ""} onChange={(e) => setAddress(a => ({ ...a, postcode: e.target.value }))} className={inputClass} />
                      </div>
                      {country === "NZ" ? (
                        <select
                          required value={address.region ?? ""}
                          onChange={(e) => setAddress(a => ({ ...a, region: e.target.value }))}
                          className={cn(inputClass, "appearance-none")}
                        >
                          <option value="" disabled>Select region</option>
                          {NZ_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <input placeholder="State / Region" required value={address.region ?? ""} onChange={(e) => setAddress(a => ({ ...a, region: e.target.value }))} className={inputClass} />
                      )}
                      <input placeholder="Phone (optional)" value={address.phone ?? ""} onChange={(e) => setAddress(a => ({ ...a, phone: e.target.value }))} className={inputClass} />
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!step1Valid}
                    className="btn-primary w-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue to shipping
                  </button>
                </>
              )}
            </div>
          )}

          {/* STEP 2 — Delivery method */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Summary of step 1 */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#141414] border border-[#262626] text-sm">
                <MapPin className="h-4 w-4 text-[#737373] mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{address.first_name} {address.last_name}</p>
                  <p className="text-[#737373] truncate">{address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city} {address.postcode}</p>
                  <p className="text-[#737373]">{email}</p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-[#16a34a] hover:underline shrink-0">
                  Change
                </button>
              </div>

              <div>
                <h2 className="font-display font-bold text-base mb-4">Delivery Method</h2>
                <div className="flex items-center gap-4 px-4 py-4 rounded-xl bg-[#141414] border border-[#16a34a] ring-1 ring-[#16a34a]/20">
                  <div className="h-4 w-4 rounded-full border-2 border-[#16a34a] flex items-center justify-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-[#16a34a]" />
                  </div>
                  <Package className="h-5 w-5 text-[#737373] shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{shippingInfo.label}</p>
                    <p className="text-xs text-[#737373] mt-0.5">{shippingInfo.delivery}</p>
                  </div>
                  <p className="text-sm font-semibold">
                    {effectiveShipping === 0
                      ? <span className="text-[#16a34a]">Free</span>
                      : `$${(effectiveShipping / 100).toFixed(2)}`}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 px-5 rounded-lg bg-[#1a1a1a] border border-[#262626] text-sm text-[#737373] hover:text-white hover:border-[#404040] transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary flex-1 py-3.5"
                >
                  Continue to payment
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Payment */}
          {step === 3 && (
            <>
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[#16a34a]" />
                </div>
              )}
              {clientSecret && !loading && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "night",
                      variables: {
                        colorPrimary: "#16a34a",
                        colorBackground: "#141414",
                        colorText: "#fafafa",
                        colorDanger: "#ef4444",
                        fontFamily: "Inter, sans-serif",
                        borderRadius: "8px",
                      },
                    },
                  }}
                >
                  <PaymentStep
                    items={items}
                    clientSecret={clientSecret}
                    shippingCost={effectiveShipping}
                    discounts={discounts}
                    email={email}
                    address={{ ...address, country } as ShippingAddress}
                    sessionId={sessionIdRef.current}
                    onBack={() => setStep(2)}
                  />
                </Elements>
              )}
            </>
          )}
        </div>

        {/* ── Right column — Order summary ── */}
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-[#141414] border border-[#1e1e1e]">
            <h2 className="font-display font-bold text-base mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#1c1c1c] shrink-0">
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                    )}
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#16a34a] text-white text-[10px] font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.productName}</p>
                    <p className="text-xs text-[#737373]">Size {item.size}</p>
                  </div>
                  <p className="text-sm font-medium">${((item.price * item.quantity) / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#262626] pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#737373]">
                <span>Subtotal</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
              {discounts.map((d) => (
                <div key={d.code} className="flex justify-between text-[#16a34a]">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3 w-3" /> {d.code}
                  </span>
                  <span>{d.amount > 0 ? `−$${(d.amount / 100).toFixed(2)}` : "Free ship"}</span>
                </div>
              ))}
              <div className="flex justify-between text-[#737373]">
                <span>Shipping</span>
                <span>
                  {isBulk
                    ? <span className="text-[#ef4444] text-xs">Bulk order</span>
                    : effectiveShipping === 0
                      ? <span className="text-[#16a34a]">Free</span>
                      : `$${(effectiveShipping / 100).toFixed(2)}`}
                </span>
              </div>
              {!isBulk && (
                <div className="flex justify-between font-display font-bold text-base pt-2 border-t border-[#262626]">
                  <span>Total</span>
                  <span>${(orderTotal / 100).toFixed(2)} NZD</span>
                </div>
              )}
            </div>
          </div>

          {/* Discount code input — always visible */}
          <DiscountInput
            subtotal={total}
            discounts={discounts}
            onApply={(d) => setDiscounts(prev => [...prev, d])}
            onRemove={(code) => setDiscounts(prev => prev.filter(d => d.code !== code))}
          />
        </div>
      </div>
    </div>
  );
}

// ── Discount code input ────────────────────────────────────────────────────

function DiscountInput({
  subtotal,
  discounts,
  onApply,
  onRemove,
}: {
  subtotal: number;
  discounts: Array<{ code: string; amount: number; free_shipping: boolean }>;
  onApply: (d: { code: string; amount: number; free_shipping: boolean }) => void;
  onRemove: (code: string) => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function apply() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    if (discounts.some(d => d.code === trimmed)) { setError("Code already applied"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: trimmed, subtotal_cents: subtotal }),
    });
    const data = await res.json() as { discount_cents?: number; free_shipping?: boolean; error?: string };
    setLoading(false);
    if (!res.ok || data.error) { setError(data.error ?? "Invalid code"); return; }
    onApply({ code: trimmed, amount: data.discount_cents!, free_shipping: data.free_shipping ?? false });
    setCode("");
  }

  return (
    <div className="space-y-2">
      {discounts.map((d) => (
        <div key={d.code} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#16a34a]/10 border border-[#16a34a]/20">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#16a34a]" />
            <span className="text-sm font-semibold text-[#16a34a] font-mono">{d.code}</span>
            <span className="text-xs text-[#16a34a]">{d.free_shipping ? "free shipping" : `−$${(d.amount / 100).toFixed(2)}`}</span>
          </div>
          <button onClick={() => onRemove(d.code)} className="text-[#16a34a] hover:opacity-70 transition-opacity">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="Discount code"
            className="flex-1 h-11 px-3 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm placeholder-[#525252] focus:outline-none focus:border-[#16a34a] transition-colors font-mono"
          />
          <button
            onClick={apply}
            disabled={loading || !code.trim()}
            className="h-11 px-4 rounded-lg bg-[#1a1a1a] border border-[#262626] text-sm text-white hover:border-[#404040] disabled:opacity-40 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
      </div>
    </div>
  );
}

// ── Payment step (inside Stripe Elements) ─────────────────────────────────

function PaymentStep({
  items,
  clientSecret,
  shippingCost,
  discounts,
  email,
  address,
  sessionId,
  onBack,
}: {
  items: ReturnType<typeof useCart>["items"];
  clientSecret: string;
  shippingCost: number;
  discounts: Array<{ code: string; amount: number; free_shipping: boolean }>;
  email: string;
  address: ShippingAddress;
  sessionId: string;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError("");

    const affiliateCode = typeof document !== "undefined" ? getCookie("n2f_ref") : null;

    await fetch("/api/create-payment-intent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientSecret,
        email,
        shippingAddress: address,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          productName: i.productName,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
        })),
        shipping: shippingCost,
        discount_code: discounts.length ? discounts.map(d => d.code).join(",") : null,
        discount_amount: discounts.reduce((s, d) => s + d.amount, 0),
        affiliate_code: affiliateCode,
        session_id: sessionId,
      }),
    });

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const discountAmt = discounts.reduce((s, d) => s + d.amount, 0);
    sessionStorage.setItem("n2f_purchase", JSON.stringify({
      orderNumber: clientSecret.split("_secret_")[0],
      total: subtotal + shippingCost - discountAmt,
      currency: "NZD",
      items: items.map((i) => ({
        name: i.productName,
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
      })),
    }));

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmed`,
        payment_method_data: {
          billing_details: {
            name: `${address.first_name} ${address.last_name}`,
            email,
          },
        },
      },
    });

    if (result.error) {
      sessionStorage.removeItem("n2f_purchase");
      setError(result.error.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
    } else {
      clearCart();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Delivery summary pill */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#141414] border border-[#262626] text-sm">
        <MapPin className="h-4 w-4 text-[#737373] mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white truncate">{address.first_name} {address.last_name}</p>
          <p className="text-[#737373] truncate">{address.line1}, {address.city} {address.postcode}</p>
          <p className="text-[#737373]">{email}</p>
        </div>
        <button type="button" onClick={onBack} className="text-xs text-[#16a34a] hover:underline shrink-0">
          Change
        </button>
      </div>

      <div>
        <h2 className="font-display font-bold text-base mb-4">Payment</h2>
        <div className="p-4 rounded-lg bg-[#141414] border border-[#262626]">
          <PaymentElement />
        </div>
      </div>

      {error && (
        <p className="text-sm text-[#ef4444] bg-[#ef4444]/10 px-4 py-3 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-5 rounded-lg bg-[#1a1a1a] border border-[#262626] text-sm text-[#737373] hover:text-white hover:border-[#404040] transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={submitting || !stripe}
          className="btn-primary flex-1 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Processing…
            </span>
          ) : (
            "Pay Now"
          )}
        </button>
      </div>
    </form>
  );
}
