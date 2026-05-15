import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import type { ShippingAddress } from "@/types/database";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const meta = pi.metadata as Record<string, string>;

    try {
      const shippingAddress: ShippingAddress = JSON.parse(meta.shippingAddress || "{}");
      const items: Array<{
        productId: string; variantId: string; productName: string;
        size: string; quantity: number; price: number;
      }> = JSON.parse(meta.items || "[]");

      const supabase = await createServiceClient();

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

      // Resolve affiliate if referral code present
      let affiliateId: string | null = null;
      if (affiliateCode) {
        const { data: affiliate } = await supabase
          .from("affiliates")
          .select("id")
          .eq("referral_code", affiliateCode)
          .eq("status", "active")
          .single();
        affiliateId = affiliate?.id ?? null;
      }

      // Create order
      const { data: order } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          guest_email: customerId ? null : meta.email,
          status: "processing",
          subtotal,
          shipping_cost: shipping,
          total: subtotal + shipping - discountAmount,
          discount_code: discountCode,
          discount_amount_cents: discountAmount,
          affiliate_code: affiliateCode,
          shipping_address: shippingAddress,
          stripe_payment_intent_id: pi.id,
        })
        .select("id, total")
        .single();

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
            note: `Order #${order.id}`,
          });
        }
      }

      // Increment discount code uses
      if (discountCode) {
        await supabase.rpc("increment_discount_uses", { p_code: discountCode });
      }

      // Record affiliate conversion
      if (affiliateId && order) {
        const { data: conversionId } = await supabase.rpc("record_affiliate_conversion", {
          p_affiliate_id: affiliateId,
          p_order_id: order.id,
          p_order_total_cents: order.total,
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

      // Mark cart session as converted
      if (meta.session_id) {
        await supabase
          .from("cart_sessions")
          .update({ converted_at: new Date().toISOString() })
          .eq("session_id", meta.session_id);
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
    }
  }

  return NextResponse.json({ received: true });
}
