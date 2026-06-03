import { NextRequest, NextResponse } from "next/server";
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

    try {
      const supabase = getServiceClient();

      // Skip if order already created (e.g. by POS)
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("stripe_payment_intent_id", pi.id)
        .maybeSingle();
      if (existingOrder) {
        return NextResponse.json({ received: true });
      }

      const shippingAddress: ShippingAddress = JSON.parse(meta.shippingAddress || "{}");
      const items: Array<{
        productId: string; variantId: string; productName: string;
        size: string; quantity: number; price: number;
      }> = JSON.parse(meta.items || "[]");

      // Upsert customer
      let customerId: string | null = null;
      if (meta.email) {
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("email", meta.email)
          .single();

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const { data: newCustomer } = await supabase
            .from("customers")
            .insert({
              email: meta.email,
              first_name: shippingAddress.first_name || "",
              last_name: shippingAddress.last_name || "",
              phone: shippingAddress.phone || null,
              accepts_marketing: meta.accepts_marketing === "1",
            })
            .select("id")
            .single();
          customerId = newCustomer?.id ?? null;
        }
      }

      const subtotal = parseInt(meta.subtotal || "0");
      const shipping = parseInt(meta.shipping || "0");
      const discountAmount = parseInt(meta.discount_amount || "0");
      const affiliateCode = meta.affiliate_code || null;
      const discountCode = meta.discount_code || null;

      // Resolve affiliate — block self-referrals
      let affiliateId: string | null = null;
      if (affiliateCode) {
        const { data: affiliate } = await supabase
          .from("affiliates")
          .select("id, email")
          .eq("referral_code", affiliateCode)
          .eq("status", "active")
          .single();
        const buyerEmail = (meta.email ?? "").toLowerCase();
        const isSelfReferral = affiliate && affiliate.email.toLowerCase() === buyerEmail;
        affiliateId = (affiliate && !isSelfReferral) ? affiliate.id : null;
      }

      const orderTotal = subtotal + shipping - discountAmount;
      // Commission is calculated on product value only (subtotal minus discount), not shipping
      const commissionBase = subtotal - discountAmount;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          guest_email: customerId ? null : meta.email,
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

      if (orderError) {
        console.error("Order insert failed:", JSON.stringify(orderError));
        throw new Error(`Order insert failed: ${orderError.message}`);
      }

      if (order && items.length > 0) {
        await supabase.from("order_items").insert(
          items.map((item) => ({
            order_id: order.id,
            product_id: item.productId,
            variant_id: item.variantId,
            product_name: item.productName,
            size: item.size,
            quantity: item.quantity,
            unit_price: item.price,
          }))
        );

        // Decrement stock + log movement
        for (const item of items) {
          await supabase.rpc("decrement_stock", {
            p_variant_id: item.variantId,
            p_quantity: item.quantity,
          });
          await supabase.from("stock_movements").insert({
            variant_id: item.variantId,
            type: "sale",
            quantity: -item.quantity,
            reference_id: order.id,
            note: `Order #${order.order_number}`,
          });
        }
      }

      // Increment discount code uses (supports comma-separated multiple codes)
      if (discountCode) {
        for (const code of discountCode.split(",").map((c: string) => c.trim()).filter(Boolean)) {
          await supabase.rpc("increment_discount_uses", { p_code: code });
        }
      }

      // Record affiliate conversion (on product value only, not shipping)
      if (affiliateId && order) {
        const { data: conversionId } = await supabase.rpc("record_affiliate_conversion", {
          p_affiliate_id: affiliateId,
          p_order_id: order.id,
          p_order_total_cents: commissionBase,
        });
        if (conversionId) {
          await supabase
            .from("orders")
            .update({ affiliate_conversion_id: conversionId })
            .eq("id", order.id);
        }
      }

      // Update customer LTV
      if (customerId) {
        await supabase.rpc("update_customer_ltv", { p_customer_id: customerId });
      }

      // Mark cart session converted
      if (meta.session_id) {
        await supabase
          .from("cart_sessions")
          .update({ converted_at: new Date().toISOString() })
          .eq("session_id", meta.session_id);
      }

      // Auto-create eShip shipment for delivery orders
      if (order && items.length > 0) {
        const totalPairs = items.reduce((s, i) => s + i.quantity, 0);
        try {
          const eship = await createEShipShipment({
            orderNumber: order.order_number,
            shippingAddress,
            totalPairs,
            items: items.map((i) => ({
              sku: i.variantId,
              description: `${i.productName} – ${i.size}`,
              quantity: i.quantity,
              unit_price: i.price,
            })),
          });
          // Order created in eShip — tracking number assigned when label is printed in eShip dashboard
          void eship;
        } catch (err) {
          console.error("eShip auto-create failed for order", order.order_number, err);
        }
      }

      // Send order confirmation email
      if (meta.email && order) {
        const customerName = shippingAddress.first_name || meta.email.split("@")[0];
        await getResend().emails.send({
          from: FROM_EMAIL,
          replyTo: REPLY_TO,
          to: meta.email,
          bcc: "nine2five.co.nz@gmail.com",
          subject: `Order #${order.order_number} confirmed — Nine2Five`,
          html: orderConfirmationHtml({
            order_number: order.order_number,
            order_date: order.created_at,
            customer_name: customerName,
            items: items.map((i) => ({
              product_name: i.productName,
              size: i.size,
              quantity: i.quantity,
              unit_price: i.price,
            })),
            subtotal,
            shipping_cost: shipping,
            discount_code: discountCode,
            discount_amount_cents: discountAmount,
            total: orderTotal,
            shipping_address: shippingAddress,
          }),
          text: orderConfirmationText({
            order_number: order.order_number,
            customer_name: customerName,
            items: items.map((i) => ({
              product_name: i.productName,
              size: i.size,
              quantity: i.quantity,
              unit_price: i.price,
            })),
            subtotal,
            shipping_cost: shipping,
            discount_code: discountCode,
            discount_amount_cents: discountAmount,
            total: orderTotal,
            shipping_address: shippingAddress,
          }),
        });
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
    }
  }

  return NextResponse.json({ received: true });
}
