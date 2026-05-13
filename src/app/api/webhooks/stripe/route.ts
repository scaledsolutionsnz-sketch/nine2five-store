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
  } catch (err) {
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

      // Create order
      const subtotal = parseInt(meta.subtotal || "0");
      const shipping = parseInt(meta.shipping || "0");

      const { data: order } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          guest_email: customerId ? null : meta.email,
          status: "processing",
          subtotal,
          shipping_cost: shipping,
          total: subtotal + shipping,
          shipping_address: shippingAddress,
          stripe_payment_intent_id: pi.id,
        })
        .select("id")
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

        // Decrement stock
        for (const item of items) {
          await supabase.rpc("decrement_stock", {
            p_variant_id: item.variantId,
            p_quantity: item.quantity,
          });
        }
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
    }
  }

  return NextResponse.json({ received: true });
}
