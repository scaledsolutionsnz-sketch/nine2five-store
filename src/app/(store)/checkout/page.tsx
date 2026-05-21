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
  "w-full h-14 px-4 rounded-xl bg-white/[0.05] border border-white/[0.10] text-white text-base placeholder-white/30 focus:outline-none focus:border-[#2f9b2f]/50 focus:bg-white/[0.07] transition-all";

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
  const [acceptsMarketing, setAcceptsMarketing] = useState(false);
  const [suburb, setSuburb] = useState("");
  const [address, setAddress] = useState<Partial<ShippingAddress>>({
    first_name: "", last_name: "", line1: "", line2: "",
    city: "", region: "", postcode: "", phone: "",
  });

  const sessionIdRef = useRef<string>("");
  const addressLine1Ref = useRef<HTMLInputElement>(null);
  const acInitialized = useRef(false);

  // Google Places autocomplete — re-runs when form becomes visible
  useEffect(() => {
    if (step !== 1 || loading || isBulk || acInitialized.current) return;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    function attach() {
      const input = addressLine1Ref.current;
      if (!input || acInitialized.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(window as any).google?.maps?.places) return;
      acInitialized.current = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ac = new (window as any).google.maps.places.Autocomplete(input, {
        types: ["address"],
        componentRestrictions: { country: ["nz", "au"] },
        fields: ["address_components"],
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place?.address_components) return;
        const get = (t: string) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          place.address_components.find((c: any) => c.types.includes(t))?.long_name ?? "";
        const line1 = [get("subpremise"), get("street_number"), get("route")].filter(Boolean).join(" ");
        const city = get("locality") || get("administrative_area_level_2");
        const autoSuburb = get("sublocality_level_1") || get("neighborhood") || "";
        if (autoSuburb) setSuburb(autoSuburb);
        setAddress(a => ({ ...a, line1, city, postcode: get("postal_code"), region: get("administrative_area_level_1") }));
      });
    }

    // Small delay so React finishes rendering the input before we attach
    const timer = setTimeout(() => {
      if ((window as any).google?.maps?.places) {
        attach();
      } else {
        const existing = document.getElementById("gplaces-script");
        if (!existing) {
          const s = document.createElement("script");
          s.id = "gplaces-script";
          s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          s.async = true;
          s.onload = attach;
          document.head.appendChild(s);
        } else {
          existing.addEventListener("load", attach);
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [step, loading, isBulk]);
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
      <div style={{ background: "#06150c", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Your cart is empty.</p>
        <Link href="/shop" style={{ background: "#2f9b2f", color: "#fff", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em", padding: "14px 32px", borderRadius: 999, textDecoration: "none" }}>
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
    !!(address.first_name && address.last_name && address.line1 && address.city && address.postcode && address.region) &&
    suburb.trim() !== "";

  const CS = {
    label: { display: "block", marginBottom: 8, color: "rgba(255,255,255,0.58)", fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" } as React.CSSProperties,
    input: { width: "100%", height: 58, padding: "0 18px", borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#ffffff", fontSize: 16, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", fontFamily: "inherit" } as React.CSSProperties,
    select: { width: "100%", height: 58, padding: "0 18px", borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "#ffffff", fontSize: 16, outline: "none", appearance: "none" as const, fontFamily: "inherit" } as React.CSSProperties,
    sectionTitle: { margin: "28px 0 16px", color: "#2f9b2f", fontSize: 12, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase" } as React.CSSProperties,
    formCard: { padding: 28, borderRadius: 22, background: "rgba(7,24,14,0.82)", border: "1px solid rgba(255,255,255,0.08)" } as React.CSSProperties,
    row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 } as React.CSSProperties,
    row1: { marginBottom: 16 } as React.CSSProperties,
  };

  return (
    <div style={{ background: "#06150c", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        .co-container { max-width: 1280px; margin: 0 auto; padding: 100px 48px 90px; }
        .co-layout { display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 56px; align-items: start; }
        .co-input:focus { border-color: #2f9b2f !important; box-shadow: 0 0 0 3px rgba(47,155,47,0.18) !important; }
        .co-input::placeholder { color: rgba(255,255,255,0.3); }
        .co-input option { background: #0d1f12; color: #fff; }
        .co-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        @media (max-width: 960px) { .co-layout { grid-template-columns: 1fr; gap: 36px; } .co-container { padding: 90px 32px 64px; } }
        @media (max-width: 640px) { .co-container { padding: 90px 20px 56px; } .co-form-row { grid-template-columns: 1fr; } }
      `}</style>
      <div className="co-container">

        {/* Back link + heading */}
        <Link href="/cart" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", marginBottom: 20 }} className="hover:text-white transition-colors">
          <ChevronLeft style={{ width: 16, height: 16 }} /> Back to Cart
        </Link>
        <h1 className="font-display font-black text-white" style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)", letterSpacing: "-0.03em", marginBottom: 28 }}>Checkout</h1>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
          {STEP_LABELS.map((label, i) => {
            const num = (i + 1) as 1 | 2 | 3;
            const isActive = step === num;
            const isDone = step > num;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <div style={{ height: 1, width: 40, background: isDone ? "#2f9b2f" : "rgba(255,255,255,0.10)", transition: "background 0.3s" }} />
                )}
                <button type="button" onClick={() => { if (isDone) setStep(num); }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: isDone ? "pointer" : "default", background: "none", border: "none", padding: 0 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 14,
                    background: isActive ? "#2f9b2f" : isDone ? "rgba(47,155,47,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isActive ? "#2f9b2f" : isDone ? "rgba(47,155,47,0.4)" : "rgba(255,255,255,0.12)"}`,
                    color: isActive ? "#fff" : isDone ? "#2f9b2f" : "rgba(255,255,255,0.5)",
                    transition: "all 0.3s",
                  }}>
                    {isDone ? <Check style={{ width: 16, height: 16 }} /> : num}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? "#fff" : isDone ? "#2f9b2f" : "rgba(255,255,255,0.4)", display: "none" }} className="sm:block">{label}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="co-layout">
          {/* ── Left column: form ── */}
          <div>
            {/* STEP 1 */}
            {step === 1 && (
              <div>
                {loading && <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}><Loader2 style={{ width: 24, height: 24, color: "#2f9b2f" }} className="animate-spin" /></div>}

                {isBulk && !loading && (
                  <div style={{ ...CS.formCard, textAlign: "center" }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                      Your order contains more than 12 pairs.<br />Please contact us directly for bulk shipping rates.
                    </p>
                    <a href="mailto:nine2five.co.nz@gmail.com" style={{ display: "inline-block", background: "#2f9b2f", color: "#fff", fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em", padding: "14px 32px", borderRadius: 999, textDecoration: "none" }}>
                      Contact Us
                    </a>
                  </div>
                )}

                {!isBulk && !loading && (
                  <div style={CS.formCard}>
                    {/* Contact section */}
                    <p style={CS.sectionTitle}>Contact</p>
                    <div style={CS.row1}>
                      <label style={CS.label}>Country</label>
                      <select value={country} onChange={(e) => setCountry(e.target.value)} style={CS.select} className="co-input">
                        {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                    </div>
                    <div style={CS.row1}>
                      <label style={CS.label}>Email Address</label>
                      <input type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} onBlur={syncCart} style={CS.input} className="co-input" />
                    </div>

                    {/* Shipping address section */}
                    <p style={{ ...CS.sectionTitle, marginTop: 32 }}>Shipping Address</p>
                    <div className="co-form-row">
                      <div>
                        <label style={CS.label}>First Name</label>
                        <input placeholder="First name" required value={address.first_name ?? ""} onChange={(e) => setAddress(a => ({ ...a, first_name: e.target.value }))} style={CS.input} className="co-input" />
                      </div>
                      <div>
                        <label style={CS.label}>Last Name</label>
                        <input placeholder="Last name" required value={address.last_name ?? ""} onChange={(e) => setAddress(a => ({ ...a, last_name: e.target.value }))} style={CS.input} className="co-input" />
                      </div>
                    </div>
                    <div style={CS.row1}>
                      <label style={CS.label}>Street Address</label>
                      <input ref={addressLine1Ref} placeholder="Start typing your address…" required value={address.line1 ?? ""} onChange={(e) => setAddress(a => ({ ...a, line1: e.target.value }))} style={CS.input} className="co-input" />
                    </div>
                    <div style={CS.row1}>
                      <label style={CS.label}>Apartment / Suite <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: "none", opacity: 0.5 }}>(optional)</span></label>
                      <input placeholder="Apt, suite, unit, etc." value={address.line2 ?? ""} onChange={(e) => setAddress(a => ({ ...a, line2: e.target.value }))} style={CS.input} className="co-input" />
                    </div>
                    <div style={CS.row1}>
                      <label style={CS.label}>Suburb <span style={{ color: "#f87171", marginLeft: 4 }}>*</span></label>
                      <input placeholder="Suburb" required value={suburb} onChange={(e) => setSuburb(e.target.value)} style={CS.input} className="co-input" />
                      {!suburb.trim() && address.line1 && <p style={{ marginTop: 6, color: "#f87171", fontSize: 12 }}>Please enter a suburb</p>}
                    </div>
                    <div className="co-form-row">
                      <div>
                        <label style={CS.label}>City / Town</label>
                        <input placeholder="City" required value={address.city ?? ""} onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))} style={CS.input} className="co-input" />
                      </div>
                      <div>
                        <label style={CS.label}>Postcode</label>
                        <input placeholder="0000" required value={address.postcode ?? ""} onChange={(e) => setAddress(a => ({ ...a, postcode: e.target.value }))} style={CS.input} className="co-input" />
                      </div>
                    </div>
                    <div style={CS.row1}>
                      <label style={CS.label}>Region</label>
                      {country === "NZ" ? (
                        <select required value={address.region ?? ""} onChange={(e) => setAddress(a => ({ ...a, region: e.target.value }))} style={CS.select} className="co-input">
                          <option value="" disabled>Select region</option>
                          {NZ_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <input placeholder="State / Region" required value={address.region ?? ""} onChange={(e) => setAddress(a => ({ ...a, region: e.target.value }))} style={CS.input} className="co-input" />
                      )}
                    </div>
                    <div style={CS.row1}>
                      <label style={CS.label}>Phone <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: "none", opacity: 0.5 }}>(optional)</span></label>
                      <input placeholder="+64 21 000 0000" value={address.phone ?? ""} onChange={(e) => setAddress(a => ({ ...a, phone: e.target.value }))} style={CS.input} className="co-input" />
                    </div>

                    {/* Marketing checkbox */}
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 24, cursor: "pointer" }}>
                      <input type="checkbox" checked={acceptsMarketing} onChange={(e) => setAcceptsMarketing(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: "#2f9b2f", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                        Send me updates about new drops and restocks. Unsubscribe any time.
                      </span>
                    </label>

                    {/* Continue button */}
                    <button onClick={() => setStep(2)} disabled={!step1Valid}
                      style={{ width: "100%", height: 56, border: "none", borderRadius: 999, background: step1Valid ? "#2f9b2f" : "rgba(47,155,47,0.3)", color: "#fff", fontSize: 15, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 24, cursor: step1Valid ? "pointer" : "not-allowed", transition: "background 0.2s" }}>
                      Continue to Shipping
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 — Delivery */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 18px", borderRadius: 16, background: "rgba(7,24,14,0.82)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 14 }}>
                  <MapPin style={{ width: 16, height: 16, color: "rgba(255,255,255,0.4)", marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#fff", fontWeight: 600, marginBottom: 2 }}>{address.first_name} {address.last_name}</p>
                    <p style={{ color: "rgba(255,255,255,0.4)" }}>{address.line1}{suburb ? `, ${suburb}` : ""}{address.city ? `, ${address.city}` : ""} {address.postcode}</p>
                    <p style={{ color: "rgba(255,255,255,0.4)" }}>{email}</p>
                  </div>
                  <button type="button" onClick={() => setStep(1)} style={{ fontSize: 12, color: "#2f9b2f", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>Change</button>
                </div>

                <div style={CS.formCard}>
                  <p style={{ ...CS.sectionTitle, marginTop: 0 }}>Delivery Method</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderRadius: 14, background: "rgba(47,155,47,0.06)", border: "1px solid rgba(47,155,47,0.25)" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #2f9b2f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2f9b2f" }} />
                    </div>
                    <Package style={{ width: 18, height: 18, color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{shippingInfo.label}</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{shippingInfo.delivery}</p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: effectiveShipping === 0 ? "#2f9b2f" : "#fff" }}>
                      {effectiveShipping === 0 ? "Free" : `$${(effectiveShipping / 100).toFixed(2)}`}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                  <button type="button" onClick={() => setStep(1)} style={{ padding: "14px 28px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", background: "none", cursor: "pointer" }}>Back</button>
                  <button type="button" onClick={() => setStep(3)} style={{ flex: 1, height: 52, borderRadius: 999, background: "#2f9b2f", color: "#fff", fontWeight: 900, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.12em", border: "none", cursor: "pointer" }}>Continue to Payment</button>
                </div>
              </div>
            )}

            {/* STEP 3 — Payment */}
            {step === 3 && (
              <>
                {loading && <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}><Loader2 style={{ width: 24, height: 24, color: "#2f9b2f" }} className="animate-spin" /></div>}
                {clientSecret && !loading && (
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: {
                    theme: "night",
                    variables: {
                      colorPrimary: "#3a7722",
                      colorBackground: "#0d1f12",
                      colorText: "#fafafa",
                      colorTextSecondary: "rgba(255,255,255,0.45)",
                      colorTextPlaceholder: "rgba(255,255,255,0.25)",
                      colorDanger: "#ef4444",
                      colorIconTab: "rgba(255,255,255,0.5)",
                      colorIconTabSelected: "#3a7722",
                      colorLogo: "light",
                      fontFamily: "inherit",
                      borderRadius: "12px",
                      spacingUnit: "4px",
                    },
                    rules: {
                      ".Tab": {
                        backgroundColor: "#0d1f12",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        boxShadow: "none",
                      },
                      ".Tab:hover": {
                        backgroundColor: "#0d1f12",
                        border: "1px solid rgba(255,255,255,0.18)",
                        boxShadow: "none",
                      },
                      ".Tab--selected": {
                        backgroundColor: "#0d1f12",
                        border: "1px solid rgba(58,119,34,0.6)",
                        boxShadow: "none",
                      },
                      ".Input": {
                        backgroundColor: "#0d1f12",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        boxShadow: "none",
                        color: "#fafafa",
                      },
                      ".Input:focus": {
                        border: "1px solid rgba(58,119,34,0.7)",
                        boxShadow: "none",
                      },
                      ".Label": {
                        color: "rgba(255,255,255,0.45)",
                        fontSize: "11px",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      },
                      ".Block": {
                        backgroundColor: "#0d1f12",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        boxShadow: "none",
                      },
                      ".AccordionItem": {
                        backgroundColor: "#0d1f12",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        boxShadow: "none",
                      },
                      ".AccordionItem:hover": {
                        backgroundColor: "#0d1f12",
                        border: "1px solid rgba(255,255,255,0.18)",
                      },
                      ".AccordionItem--selected": {
                        backgroundColor: "#0d1f12",
                        border: "1px solid rgba(58,119,34,0.6)",
                        boxShadow: "none",
                      },
                      ".PickerItem": {
                        backgroundColor: "#0d1f12",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        boxShadow: "none",
                      },
                      ".PickerItem--selected": {
                        backgroundColor: "#0d1f12",
                        border: "1px solid rgba(58,119,34,0.6)",
                        boxShadow: "none",
                      },
                    },
                  } }}>
                    <PaymentStep items={items} clientSecret={clientSecret} shippingCost={effectiveShipping} discounts={discounts} email={email} address={{ ...address, country } as ShippingAddress} sessionId={sessionIdRef.current} acceptsMarketing={acceptsMarketing} onBack={() => setStep(2)} />
                  </Elements>
                )}
              </>
            )}
          </div>

          {/* ── Right column: order summary ── */}
          <div style={{ padding: 26, borderRadius: 22, background: "rgba(7,24,14,0.88)", border: "1px solid rgba(255,255,255,0.10)", position: "sticky", top: 96 }}>
            <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 20 }}>Order Summary</p>

            {/* Products */}
            <div style={{ marginBottom: 20 }}>
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} style={{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 14, alignItems: "center", paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", background: "#0d1f12" }}>
                      {item.imageUrl && <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />}
                    </div>
                    {item.quantity > 1 && (
                      <span style={{ position: "absolute", top: -5, right: -5, width: 20, height: 20, borderRadius: "50%", background: "#2f9b2f", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #07180E" }}>{item.quantity}</span>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.productName}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>Size {item.size} · Qty {item.quantity}</p>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>${((item.price * item.quantity) / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Subtotal</span>
              <span style={{ fontSize: 14, color: "#fff" }}>${(total / 100).toFixed(2)}</span>
            </div>
            {discounts.map((d) => (
              <div key={d.code} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 14, color: "#2f9b2f", display: "flex", alignItems: "center", gap: 6 }}><Tag style={{ width: 12, height: 12 }} />{d.code}</span>
                <span style={{ fontSize: 14, color: "#2f9b2f" }}>{d.amount > 0 ? `−$${(d.amount / 100).toFixed(2)}` : "Free ship"}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Shipping</span>
              <span style={{ fontSize: 14, color: isBulk ? "#f87171" : effectiveShipping === 0 ? "#2f9b2f" : "#fff" }}>
                {isBulk ? "Contact us" : effectiveShipping === 0 ? "Free" : `$${(effectiveShipping / 100).toFixed(2)}`}
              </span>
            </div>
            {!isBulk && (
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.10)", fontSize: 20, fontWeight: 900, color: "#fff" }}>
                <span>Total</span>
                <span>${(orderTotal / 100).toFixed(2)} NZD</span>
              </div>
            )}

            {/* Discount code */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <DiscountInput subtotal={total} discounts={discounts} onApply={(d) => setDiscounts(prev => [...prev, d])} onRemove={(code) => setDiscounts(prev => prev.filter(d => d.code !== code))} />
            </div>
          </div>
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
        <div key={d.code} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#2f9b2f]/10 border border-[#2f9b2f]/20">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#2f9b2f]" />
            <span className="text-sm font-semibold text-[#2f9b2f] font-mono">{d.code}</span>
            <span className="text-xs text-[#2f9b2f]">{d.free_shipping ? "free shipping" : `−$${(d.amount / 100).toFixed(2)}`}</span>
          </div>
          <button onClick={() => onRemove(d.code)} className="text-[#2f9b2f] hover:opacity-70 transition-opacity">
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
            className="flex-1 h-12 px-4 rounded-xl bg-[#0d1f12] border border-white/[0.1] text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#2f9b2f]/50 transition-colors font-mono"
          />
          <button
            onClick={apply}
            disabled={loading || !code.trim()}
            className="h-12 px-5 rounded-xl bg-[#2f9b2f] text-white font-bold text-sm hover:bg-[#3aad3a] disabled:opacity-40 transition-all"
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
  acceptsMarketing,
  onBack,
}: {
  items: ReturnType<typeof useCart>["items"];
  clientSecret: string;
  shippingCost: number;
  discounts: Array<{ code: string; amount: number; free_shipping: boolean }>;
  email: string;
  address: ShippingAddress;
  sessionId: string;
  acceptsMarketing: boolean;
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
        accepts_marketing: acceptsMarketing,
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
        shipping: {
          name: `${address.first_name} ${address.last_name}`,
          phone: address.phone ?? undefined,
          address: {
            line1: address.line1,
            line2: address.line2 ?? undefined,
            city: address.city,
            state: address.region,
            postal_code: address.postcode,
            country: address.country,
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
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#0d1f12] border border-white/[0.08] text-sm">
        <MapPin className="h-4 w-4 text-white/40 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white truncate">{address.first_name} {address.last_name}</p>
          <p className="text-white/40 truncate">{address.line1}, {address.city} {address.postcode}</p>
          <p className="text-white/40">{email}</p>
        </div>
        <button type="button" onClick={onBack} className="text-xs text-[#3a7722] hover:underline shrink-0">
          Change
        </button>
      </div>

      <div className="bg-[#0d1f12] border border-white/[0.08] rounded-xl px-4 py-4">
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
          className="bg-[#3a7722] text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#4d9e2e] transition-all duration-300 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
