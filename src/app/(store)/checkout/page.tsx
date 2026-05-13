"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@/lib/cart-context";
import { calculateShipping, NZ_REGIONS } from "@/lib/shipping";
import type { ShippingAddress } from "@/types/database";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const COUNTRIES = [
  { code: "NZ", label: "New Zealand" },
  { code: "AU", label: "Australia" },
];

export default function CheckoutPage() {
  const { items, total, count } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [shippingCost, setShippingCost] = useState(1600);
  const [country, setCountry] = useState("NZ");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (count === 0) return;
    setLoading(true);
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, country }),
    })
      .then((r) => r.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setShippingCost(data.shipping);
      })
      .finally(() => setLoading(false));
  }, [items, country, count]);

  if (count === 0) {
    return (
      <div className="pt-32 pb-24 px-6 text-center max-w-md mx-auto">
        <p className="text-[#737373] mb-4">Your cart is empty.</p>
        <Link href="/shop" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  const orderTotal = total + shippingCost;

  return (
    <div className="pt-24 pb-24 px-6 md:px-10 max-w-5xl mx-auto">
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-white transition-colors mb-8">
        <ChevronLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <div className="grid md:grid-cols-[1fr_360px] gap-12">
        <div>
          <h1 className="font-display font-black text-3xl mb-8">Checkout</h1>

          {/* Country selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-widest text-[#737373] mb-2">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:outline-none focus:border-[#16a34a]"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

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
              <CheckoutForm
                items={items}
                country={country}
                clientSecret={clientSecret}
                shippingCost={shippingCost}
              />
            </Elements>
          )}
        </div>

        {/* Order summary */}
        <div className="p-6 rounded-xl bg-[#141414] border border-[#1e1e1e] h-fit">
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
            <div className="flex justify-between text-[#737373]">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? <span className="text-[#16a34a]">Free</span> : `$${(shippingCost / 100).toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-display font-bold text-base pt-2 border-t border-[#262626]">
              <span>Total</span>
              <span>${(orderTotal / 100).toFixed(2)} NZD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutForm({
  items,
  country,
  clientSecret,
  shippingCost,
}: {
  items: ReturnType<typeof useCart>["items"];
  country: string;
  clientSecret: string;
  shippingCost: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [address, setAddress] = useState<Partial<ShippingAddress>>({
    country,
    first_name: "",
    last_name: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postcode: "",
    phone: "",
  });
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError("");

    // Update payment intent metadata before confirming
    await fetch("/api/create-payment-intent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientSecret,
        email,
        shippingAddress: { ...address, country },
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          productName: i.productName,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
        })),
        shipping: shippingCost,
      }),
    });

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
      setError(result.error.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
    } else {
      clearCart();
    }
  }

  const inputClass = "w-full h-11 px-3 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm placeholder-[#525252] focus:outline-none focus:border-[#16a34a] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact */}
      <div>
        <h2 className="font-display font-bold text-base mb-4">Contact</h2>
        <input
          type="email"
          placeholder="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Shipping address */}
      <div>
        <h2 className="font-display font-bold text-base mb-4">Shipping Address</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="First name" required value={address.first_name ?? ""} onChange={(e) => setAddress((a) => ({ ...a, first_name: e.target.value }))} className={inputClass} />
            <input placeholder="Last name" required value={address.last_name ?? ""} onChange={(e) => setAddress((a) => ({ ...a, last_name: e.target.value }))} className={inputClass} />
          </div>
          <input placeholder="Address line 1" required value={address.line1 ?? ""} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} className={inputClass} />
          <input placeholder="Address line 2 (optional)" value={address.line2 ?? ""} onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))} className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="City / Town" required value={address.city ?? ""} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} className={inputClass} />
            <input placeholder="Postcode" required value={address.postcode ?? ""} onChange={(e) => setAddress((a) => ({ ...a, postcode: e.target.value }))} className={inputClass} />
          </div>
          {country === "NZ" ? (
            <select
              required
              value={address.region ?? ""}
              onChange={(e) => setAddress((a) => ({ ...a, region: e.target.value }))}
              className={cn(inputClass, "appearance-none")}
            >
              <option value="" disabled>Select region</option>
              {NZ_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          ) : (
            <input placeholder="State / Region" required value={address.region ?? ""} onChange={(e) => setAddress((a) => ({ ...a, region: e.target.value }))} className={inputClass} />
          )}
          <input placeholder="Phone (optional)" value={address.phone ?? ""} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} className={inputClass} />
        </div>
      </div>

      {/* Payment */}
      <div>
        <h2 className="font-display font-bold text-base mb-4">Payment</h2>
        <div className="p-4 rounded-lg bg-[#141414] border border-[#262626]">
          <PaymentElement />
        </div>
      </div>

      {error && (
        <p className="text-sm text-[#ef4444] bg-[#ef4444]/10 px-4 py-3 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !stripe}
        className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Processing…
          </span>
        ) : (
          "Pay Now"
        )}
      </button>
    </form>
  );
}
