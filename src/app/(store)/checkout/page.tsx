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
import { ChevronLeft, Loader2, Tag, X, Check, Package, MapPin } from "lucide-react";
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
  "w-full h-12 px-4 rounded-xl bg-[#111] border border-white/[0.1] text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#4ade80]/50 transition-colors";

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
      <div className="bg-black min-h-screen flex flex-col items-center justify-center px-8 text-center">
        <p className="text-white/50 mb-4">Your cart is empty.</p>
        <Link
          href="/shop"
          className="bg-[#4ade80] text-black font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#86efac] transition-all duration-300"
        >
          Shop Now
        </Link>
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
    <div className="bg-black min-h-screen max-w-screen-xl mx-auto" style={{ paddingTop: "5rem", paddingBottom: "6rem", paddingLeft: "5rem", paddingRight: "5rem" }}>
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <h1 className="font-display font-black text-4xl text-white mb-10">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEP_LABELS.map((label, i) => {
          const num = (i + 1) as 1 | 2 | 3;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={label} className="flex items-center">
              {i > 0 && (
                <div className={cn("h-px w-8 md:w-12 transition-colors", isDone ? "bg-[#4ade80]" : "bg-white/[0.08]")} />
              )}
              <button
                type="button"
                onClick={() => { if (isDone) setStep(num); }}
                className={cn("flex flex-col items-center gap-1.5", isDone && "cursor-pointer")}
              >
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  isActive && "bg-[#4ade80] text-black",
                  isDone && "bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30",
                  !isActive && !isDone && "bg-[#111] border border-white/[0.08] text-white/30",
                )}>
                  {isDone ? <Check className="h-3.5 w-3.5" /> : num}
                </div>
                <span className={cn(
                  "text-xs hidden sm:block transition-colors",
                  isActive && "text-white font-semibold",
                  isDone && "text-[#4ade80]",
                  !isActive && !isDone && "text-white/40",
                )}>
                  {label}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-[1fr_400px] gap-12">
        {/* ── Left column ── */}
        <div>
          {/* STEP 1 — Information */}
          {step === 1 && (
            <div className="space-y-6">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[#4ade80]" />
                </div>
              )}

              {isBulk && !loading && (
                <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8 text-center space-y-4">
                  <p className="text-sm text-white/50 leading-relaxed">
                    Your order contains more than 12 pairs.<br />
                    Please contact us directly for bulk shipping rates.
                  </p>
                  <a
                    href="mailto:nine2five.co.nz@gmail.com"
                    className="bg-[#4ade80] text-black font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#86efac] transition-all duration-300 inline-block"
                  >
                    Contact Us
                  </a>
                </div>
              )}

              {!isBulk && !loading && (
                <>
                  <div className="bg-[#0e0e0e] border border-white/[0.07] rounded-2xl overflow-hidden">

                    {/* Contact */}
                    <div className="px-8 pt-8 pb-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#4ade80] mb-5">Contact</p>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5 block">Country</label>
                          <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className={cn(inputClass, "appearance-none")}
                          >
                            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5 block">Email Address</label>
                          <input
                            type="email" placeholder="you@example.com" required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={syncCart}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/[0.06] mx-8" />

                    {/* Shipping Address */}
                    <div className="px-8 pt-6 pb-8">
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#4ade80] mb-5">Shipping Address</p>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5 block">First Name</label>
                            <input placeholder="First name" required value={address.first_name ?? ""} onChange={(e) => setAddress(a => ({ ...a, first_name: e.target.value }))} className={inputClass} />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5 block">Last Name</label>
                            <input placeholder="Last name" required value={address.last_name ?? ""} onChange={(e) => setAddress(a => ({ ...a, last_name: e.target.value }))} className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5 block">Address</label>
                          <div className="space-y-2">
                            <input placeholder="Address line 1" required value={address.line1 ?? ""} onChange={(e) => setAddress(a => ({ ...a, line1: e.target.value }))} className={inputClass} />
                            <input placeholder="Apartment, suite, etc. (optional)" value={address.line2 ?? ""} onChange={(e) => setAddress(a => ({ ...a, line2: e.target.value }))} className={inputClass} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5 block">City / Town</label>
                            <input placeholder="City" required value={address.city ?? ""} onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))} className={inputClass} />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5 block">Postcode</label>
                            <input placeholder="0000" required value={address.postcode ?? ""} onChange={(e) => setAddress(a => ({ ...a, postcode: e.target.value }))} className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5 block">Region</label>
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
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5 block">Phone <span className="text-white/20 normal-case tracking-normal font-normal">(optional)</span></label>
                          <input placeholder="+64 21 000 0000" value={address.phone ?? ""} onChange={(e) => setAddress(a => ({ ...a, phone: e.target.value }))} className={inputClass} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!step1Valid}
                    className="bg-[#4ade80] text-black font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#86efac] transition-all duration-300 w-full disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue to Shipping
                  </button>
                </>
              )}
            </div>
          )}

          {/* STEP 2 — Delivery method */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Summary of step 1 */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#111] border border-white/[0.08] text-sm">
                <MapPin className="h-4 w-4 text-white/40 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{address.first_name} {address.last_name}</p>
                  <p className="text-white/40 truncate">{address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city} {address.postcode}</p>
                  <p className="text-white/40">{email}</p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-[#4ade80] hover:underline shrink-0">
                  Change
                </button>
              </div>

              <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8">
                <h2 className="font-display font-bold text-base text-white mb-4">Delivery Method</h2>
                <div className="flex items-center gap-4 px-4 py-4 rounded-xl bg-[#111] border border-[#4ade80]/30 ring-1 ring-[#4ade80]/10">
                  <div className="h-4 w-4 rounded-full border-2 border-[#4ade80] flex items-center justify-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-[#4ade80]" />
                  </div>
                  <Package className="h-5 w-5 text-white/40 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{shippingInfo.label}</p>
                    <p className="text-xs text-white/40 mt-0.5">{shippingInfo.delivery}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {effectiveShipping === 0
                      ? <span className="text-[#4ade80]">Free</span>
                      : `$${(effectiveShipping / 100).toFixed(2)}`}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="border border-white/20 text-white font-medium text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:border-white/50 hover:bg-white/5 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-[#4ade80] text-black font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#86efac] transition-all duration-300 flex-1"
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
                  <Loader2 className="h-6 w-6 animate-spin text-[#4ade80]" />
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
                        colorPrimary: "#4ade80",
                        colorBackground: "#111111",
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
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="font-display font-bold text-base text-white mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#1a1a1a] shrink-0">
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
                    )}
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#4ade80] text-black text-[10px] font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.productName}</p>
                    <p className="text-xs text-white/40">Size {item.size}</p>
                  </div>
                  <p className="text-sm font-medium text-white">${((item.price * item.quantity) / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/[0.08] pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-white/40">
                <span>Subtotal</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
              {discounts.map((d) => (
                <div key={d.code} className="flex justify-between text-[#4ade80]">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3 w-3" /> {d.code}
                  </span>
                  <span>{d.amount > 0 ? `−$${(d.amount / 100).toFixed(2)}` : "Free ship"}</span>
                </div>
              ))}
              <div className="flex justify-between text-white/40">
                <span>Shipping</span>
                <span>
                  {isBulk
                    ? <span className="text-red-400 text-xs">Bulk order</span>
                    : effectiveShipping === 0
                      ? <span className="text-[#4ade80]">Free</span>
                      : `$${(effectiveShipping / 100).toFixed(2)}`}
                </span>
              </div>
              {!isBulk && (
                <div className="flex justify-between font-black text-lg text-white pt-2 border-t border-white/[0.08]">
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
        <div key={d.code} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#4ade80]" />
            <span className="text-sm font-semibold text-[#4ade80] font-mono">{d.code}</span>
            <span className="text-xs text-[#4ade80]">{d.free_shipping ? "free shipping" : `−$${(d.amount / 100).toFixed(2)}`}</span>
          </div>
          <button onClick={() => onRemove(d.code)} className="text-[#4ade80] hover:opacity-70 transition-opacity">
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
            className="flex-1 h-12 px-4 rounded-xl bg-[#111] border border-white/[0.1] text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#4ade80]/50 transition-colors font-mono"
          />
          <button
            onClick={apply}
            disabled={loading || !code.trim()}
            className="h-12 px-5 rounded-xl bg-[#4ade80] text-black font-bold text-sm hover:bg-[#86efac] disabled:opacity-40 transition-all"
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
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#111] border border-white/[0.08] text-sm">
        <MapPin className="h-4 w-4 text-white/40 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white truncate">{address.first_name} {address.last_name}</p>
          <p className="text-white/40 truncate">{address.line1}, {address.city} {address.postcode}</p>
          <p className="text-white/40">{email}</p>
        </div>
        <button type="button" onClick={onBack} className="text-xs text-[#4ade80] hover:underline shrink-0">
          Change
        </button>
      </div>

      <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-8">
        <h2 className="font-display font-bold text-base text-white mb-4">Payment</h2>
        <PaymentElement />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 px-4 py-3 rounded-xl">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="border border-white/20 text-white font-medium text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:border-white/50 hover:bg-white/5 transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={submitting || !stripe}
          className="bg-[#4ade80] text-black font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#86efac] transition-all duration-300 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
