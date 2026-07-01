import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { getResend, FROM_EMAIL, REPLY_TO } from "@/lib/email";
import { orderConfirmationHtml, orderConfirmationText } from "@/lib/emails/order-confirmation";
import { createEShipShipment } from "@/lib/eship";
import type { ShippingAddress } from "@/types/database";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type OrderItem = { productId: string; variantId: string; productName: string; size: string; quantity: number; price: number };

function safeJson<T>(s: string | undefined, fallback: T): T {
  try { return s ? (JSON.parse(s) as T) : fallback; } catch { return fallback; }
}

// Rebuild line items from the compact list stored on the PaymentIntent at creation
// (items_min = [{v:variantId,q,p}]). Used when the client metadata never arrived
// (Stripe Link / express checkout, or a too-large/failed metadata write).
async function resolveCompactItems(min: string, supabase: ReturnType<typeof getServiceClient>): Promise<OrderItem[]> {
  const arr = safeJson<{ v: string; q: number; p: number }[]>(min, []);
  if (!arr.length) return [];
  const { data: vars } = await supabase
    .from("product_variants")
    .select("id, product_id, size, products(name)")
    .in("id", arr.map((x) => x.v));
  const byId = new Map((vars ?? []).map((v) => [v.id as string, v]));
  return arr.flatMap((x) => {
    const v = byId.get(x.v);
    if (!v) return [];
    const prod = v.products as { name?: string } | { name?: string }[] | null;
    const name = Array.isArray(prod) ? prod[0]?.name : prod?.name;
    return [{ productId: v.product_id as string, variantId: v.id as string, productName: name ?? "", size: (v.size as string) ?? "", quantity: x.q, price: x.p }];
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Reverse affiliate commission on full refund
  if (event.type === "charge.refunded") {
    const charge = event.data.object;
    if (charge.refunded) {
      try {
        const supabase = getServiceClient();
        const { data: order } = await supabase
          .from("orders")
          .select("id, affiliate_conversion_id")
          .eq("stripe_payment_intent_id", charge.payment_intent as string)
          .maybeSingle();

        if (order?.affiliate_conversion_id) {
          const { data: conversion } = await supabase
            .from("affiliate_conversions")
            .select("id, status, affiliate_id, commission_cents")
            .eq("id", order.affiliate_conversion_id)
            .maybeSingle();

          // Only reverse if not already paid out
          if (conversion && conversion.status !== "paid") {
            await supabase
              .from("affiliate_conversions")
              .update({ status: "reversed" })
              .eq("id", conversion.id);

            // Decrement affiliate totals atomically via RPC
            await supabase.rpc("reverse_affiliate_conversion", {
              p_affiliate_id: conversion.affiliate_id,
              p_commission_cents: conversion.commission_cents,
            });
          }
        }

        await supabase
          .from("orders")
          .update({ status: "refunded" })
          .eq("stripe_payment_intent_id", charge.payment_intent as string);
      } catch (err) {
        console.error("Refund webhook error:", err);
      }
    }
  }

  // Reverse affiliate commission when a chargeback is opened
  if (event.type === "charge.dispute.created") {
    const dispute = event.data.object;
    try {
      const supabase = getServiceClient();
      const { data: order } = await supabase
        .from("orders")
        .select("id, affiliate_conversion_id")
        .eq("stripe_payment_intent_id", dispute.payment_intent as string)
        .maybeSingle();

      if (order?.affiliate_conversion_id) {
        const { data: conversion } = await supabase
          .from("affiliate_conversions")
          .select("id, status, affiliate_id, commission_cents")
          .eq("id", order.affiliate_conversion_id)
          .maybeSingle();

        if (conversion && conversion.status !== "paid") {
          await supabase
            .from("affiliate_conversions")
            .update({ status: "reversed" })
            .eq("id", conversion.id);

          await supabase.rpc("reverse_affiliate_conversion", {
            p_affiliate_id: conversion.affiliate_id,
            p_commission_cents: conversion.commission_cents,
          });
        }
      }

      await supabase
        .from("orders")
        .update({ status: "disputed" })
        .eq("stripe_payment_intent_id", dispute.payment_intent as string);
    } catch (err) {
      console.error("Dispute webhook error:", err);
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const meta = pi.metadata as Record<string, string>;
    const supabase = getServiceClient();

    // Idempotency — order already exists (e.g. POS, or a webhook retry).
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_payment_intent_id", pi.id)
      .maybeSingle();
    if (existingOrder) {
      return NextResponse.json({ received: true });
    }

    // Resolve order data. The client writes most of it to PI metadata at submit,
    // but Stripe Link / express checkout (and failed metadata writes) skip that —
    // so fall back to Stripe's OWN data (its collected shipping + the charge email)
    // and to the compact item list stored at PI creation. Without this, those
    // orders land with no customer / address / items.
    let shippingAddress = safeJson<ShippingAddress>(meta.shippingAddress, {} as ShippingAddress);
    let items = safeJson<OrderItem[]>(meta.items, []);
    let email = (meta.email || "").trim();
    const addrEmpty = !shippingAddress?.line1;

    if (!email || addrEmpty || items.length === 0) {
      try {
        const full = await stripe.paymentIntents.retrieve(pi.id, { expand: ["latest_charge"] });
        const charge = full.latest_charge as Stripe.Charge | null;
        if (!email) email = (charge?.billing_details?.email || full.receipt_email || "").trim();
        if (addrEmpty && full.shipping?.address) {
          const s = full.shipping;
          const a = s.address!;
          const [fn, ...ln] = (s.name || "").split(" ");
          shippingAddress = {
            first_name: fn || "", last_name: ln.join(" ") || "",
            line1: a.line1 || "", line2: a.line2 || "",
            city: a.city || "", region: a.state || "",
            postcode: a.postal_code || "", phone: s.phone || "",
            country: a.country || "NZ",
          } as ShippingAddress;
        } else if (addrEmpty && charge?.billing_details?.address?.line1) {
          // Last-resort fallback: some express methods only put the address in the
          // charge's billing details. Only use it when there's a real street line.
          const b = charge.billing_details;
          const a = b.address!;
          const [fn, ...ln] = (b.name || "").split(" ");
          shippingAddress = {
            first_name: fn || "", last_name: ln.join(" ") || "",
            line1: a.line1 || "", line2: a.line2 || "",
            city: a.city || "", region: a.state || "",
            postcode: a.postal_code || "", phone: b.phone || "",
            country: a.country || "NZ",
          } as ShippingAddress;
        }
      } catch (e) {
        console.error("[webhook] Stripe fallback fetch failed for", pi.id, e);
      }
    }
    if (items.length === 0 && meta.items_min) {
      items = await resolveCompactItems(meta.items_min, supabase);
    }

    const subtotal = parseInt(meta.subtotal || "0") || items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = parseInt(meta.shipping || "0");
    const discountAmount = parseInt(meta.discount_amount || "0");
    const affiliateCode = meta.affiliate_code || null;
    const discountCode = meta.discount_code || null;
    const orderTotal = subtotal + shipping - discountAmount;
    const commissionBase = subtotal - discountAmount; // commission on product value only

    // ── CRITICAL: create the order. On failure, return 500 so Stripe RETRIES.
    //    (The old handler returned 200 even on error → orders were silently lost.)
    let order: { id: string; order_number: number; created_at: string } | null = null;
    let customerId: string | null = null;
    try {
      if (email) {
        const { data: existingCustomer } = await supabase
          .from("customers").select("id").eq("email", email).maybeSingle();
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const { data: newCustomer } = await supabase
            .from("customers")
            .insert({
              email,
              first_name: shippingAddress.first_name || "",
              last_name: shippingAddress.last_name || "",
              phone: shippingAddress.phone || null,
              accepts_marketing: meta.accepts_marketing === "1",
            })
            .select("id").single();
          customerId = newCustomer?.id ?? null;
        }
      }

      const { data: o, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          guest_email: customerId ? null : (email || null),
          status: "processing",
          subtotal,
          shipping_cost: shipping,
          total: orderTotal,
          discount_code: discountCode,
          discount_amount_cents: discountAmount,
          affiliate_code: affiliateCode,
          shipping_address: shippingAddress,
          stripe_payment_intent_id: pi.id,
        })
        .select("id, order_number, created_at")
        .single();
      if (orderError || !o) throw new Error(`Order insert failed: ${orderError?.message ?? "no row"}`);
      order = o;

      if (items.length > 0) {
        const { error: oiErr } = await supabase.from("order_items").insert(
          items.map((item) => ({
            order_id: order!.id,
            product_id: item.productId,
            variant_id: item.variantId,
            product_name: item.productName,
            size: item.size,
            quantity: item.quantity,
            unit_price: item.price,
          }))
        );
        if (oiErr) throw new Error(`order_items insert failed: ${oiErr.message}`);

        for (const item of items) {
          await supabase.rpc("decrement_stock", { p_variant_id: item.variantId, p_quantity: item.quantity });
          await supabase.from("stock_movements").insert({
            variant_id: item.variantId, type: "sale", quantity: -item.quantity,
            reference_id: order.id, note: `Order #${order.order_number}`,
          });
        }
      }
    } catch (err) {
      console.error("[webhook] ORDER CREATION FAILED for", pi.id, "— returning 500 so Stripe retries:", err);
      return NextResponse.json({ error: "order creation failed" }, { status: 500 });
    }

    if (!order) return NextResponse.json({ received: true }); // unreachable; satisfies types

    // ── Best-effort side effects: log on failure, never fail the webhook (the order
    //    is already safely created, so we must not trigger a Stripe retry for these).
    try {
      if (discountCode) {
        for (const code of discountCode.split(",").map((c) => c.trim()).filter(Boolean)) {
          await supabase.rpc("increment_discount_uses", { p_code: code });
        }
      }
    } catch (e) { console.error("[webhook] discount uses:", e); }

    try {
      // Attribution: an explicitly-TYPED code that matches an active ambassador's
      // referral_code WINS over the referral-link cookie — a code the customer typed
      // is a stronger, fresher signal than a possibly-stale 30-day cookie. Fall back
      // to the cookie when no typed code matches an active ambassador.
      let attributionCode = "";
      if (discountCode) {
        for (const c of discountCode.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)) {
          const { data: aff } = await supabase
            .from("affiliates").select("referral_code")
            .eq("referral_code", c).eq("status", "active").maybeSingle();
          if (aff) { attributionCode = aff.referral_code; break; }
        }
      }
      if (!attributionCode) attributionCode = (affiliateCode || "").toLowerCase();
      if (attributionCode) {
        const { data: affiliate } = await supabase
          .from("affiliates").select("id, email")
          .eq("referral_code", attributionCode).eq("status", "active").single();
        const isSelf = affiliate && affiliate.email.toLowerCase() === email.toLowerCase();
        if (affiliate && !isSelf) {
          const { data: conversionId } = await supabase.rpc("record_affiliate_conversion", {
            p_affiliate_id: affiliate.id, p_order_id: order.id, p_order_total_cents: commissionBase,
          });
          if (conversionId) {
            await supabase.from("orders")
              .update({ affiliate_conversion_id: conversionId, affiliate_code: attributionCode })
              .eq("id", order.id);
          }
        }
      }
    } catch (e) { console.error("[webhook] affiliate conversion:", e); }

    try {
      if (customerId) await supabase.rpc("update_customer_ltv", { p_customer_id: customerId });
    } catch (e) { console.error("[webhook] customer LTV:", e); }

    try {
      if (meta.session_id) {
        await supabase.from("cart_sessions").update({ converted_at: new Date().toISOString() }).eq("session_id", meta.session_id);
      }
    } catch (e) { console.error("[webhook] cart session:", e); }

    try {
      if (items.length > 0) {
        const totalPairs = items.reduce((s, i) => s + i.quantity, 0);
        await createEShipShipment({
          orderNumber: order.order_number,
          shippingAddress,
          totalPairs,
          items: items.map((i) => ({ sku: i.variantId, description: `${i.productName} – ${i.size}`, quantity: i.quantity, unit_price: i.price })),
        });
      }
    } catch (e) { console.error("[webhook] eShip auto-create failed for order", order.order_number, e); }

    try {
      if (email) {
        const customerName = shippingAddress.first_name || email.split("@")[0];
        const common = {
          order_number: order.order_number,
          customer_name: customerName,
          items: items.map((i) => ({ product_name: i.productName, size: i.size, quantity: i.quantity, unit_price: i.price })),
          subtotal,
          shipping_cost: shipping,
          discount_code: discountCode,
          discount_amount_cents: discountAmount,
          total: orderTotal,
          shipping_address: shippingAddress,
        };
        await getResend().emails.send({
          from: FROM_EMAIL,
          replyTo: REPLY_TO,
          to: email,
          bcc: "nine2five.co.nz@gmail.com",
          subject: `Order #${order.order_number} confirmed — Nine2Five`,
          html: orderConfirmationHtml({ ...common, order_date: order.created_at }),
          text: orderConfirmationText(common),
        });
      }
    } catch (e) { console.error("[webhook] confirmation email:", e); }
  }

  return NextResponse.json({ received: true });
}
