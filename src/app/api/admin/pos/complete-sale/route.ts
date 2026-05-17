import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL, REPLY_TO } from "@/lib/email";
import { orderConfirmationHtml, orderConfirmationText } from "@/lib/emails/order-confirmation";
import type { ShippingAddress } from "@/types/database";

type POSItem = {
  productId: string;
  variantId: string;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

export async function POST(req: NextRequest) {
  const supabase = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    items: POSItem[];
    subtotal: number;
    discountCode: string | null;
    discountAmount: number;
    total: number;
    paymentMethod: "cash" | "bank_transfer" | "eftpos" | "stripe" | "manual";
    stripePaymentIntentId?: string | null;
    customer?: { name: string; email: string; phone: string } | null;
    sendReceipt: boolean;
    notes?: string;
  };

  const {
    items, subtotal, discountCode, discountAmount, total,
    paymentMethod, stripePaymentIntentId,
    customer, sendReceipt, notes: extraNotes,
  } = body;

  if (!items?.length) {
    return NextResponse.json({ error: "No items in cart" }, { status: 400 });
  }

  // Validate stock for all items before committing anything
  for (const item of items) {
    const { data: variant } = await supabase
      .from("product_variants")
      .select("stock_quantity")
      .eq("id", item.variantId)
      .single();
    if (!variant || variant.stock_quantity < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${item.productName} (Size ${item.size})` },
        { status: 400 }
      );
    }
  }

  // Upsert customer
  let customerId: string | null = null;
  if (customer?.email?.trim()) {
    const email = customer.email.toLowerCase().trim();
    const nameParts = (customer.name || "").trim().split(" ");
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "";

    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: created } = await supabase
        .from("customers")
        .insert({ email, first_name: firstName, last_name: lastName, phone: customer.phone || null })
        .select("id")
        .single();
      if (created) customerId = created.id;
    }
  }

  // Build minimal shipping address for in-person sale
  const displayName = customer?.name?.trim() || "Walk-in Customer";
  const parts = displayName.split(" ");
  const shippingAddress: ShippingAddress = {
    first_name: parts[0],
    last_name: parts.slice(1).join(" ") || "",
    line1: "In-person sale",
    line2: "",
    city: "Auckland",
    region: "Auckland",
    postcode: "0000",
    country: "NZ",
    phone: customer?.phone || "",
  };

  const methodLabel: Record<string, string> = {
    cash: "Cash", bank_transfer: "Bank Transfer",
    eftpos: "EFTPOS", stripe: "Stripe Card", manual: "Manual",
  };
  const orderNotes = [
    `POS · ${methodLabel[paymentMethod] ?? paymentMethod} · Collected in-person`,
    extraNotes,
  ].filter(Boolean).join(" · ");

  // Bank transfer = awaiting confirmation; everything else = immediately fulfilled
  const orderStatus = paymentMethod === "bank_transfer" ? "processing" : "delivered";

  // Create order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      guest_email: customerId ? null : (customer?.email?.trim() || null),
      status: orderStatus,
      subtotal,
      shipping_cost: 0,
      total,
      discount_code: discountCode || null,
      discount_amount_cents: discountAmount,
      shipping_address: shippingAddress,
      stripe_payment_intent_id: stripePaymentIntentId || null,
      notes: orderNotes,
    })
    .select("id, order_number")
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: orderErr?.message ?? "Order creation failed" }, { status: 500 });
  }

  // Create order items
  await supabase.from("order_items").insert(
    items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      product_name: item.productName,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }))
  );

  // Decrement stock + log movements
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
      note: `POS Order #${order.order_number}`,
      created_by: user.email,
    });
  }

  // Increment discount uses
  if (discountCode) {
    await supabase.rpc("increment_discount_uses", { p_code: discountCode });
  }

  // Update customer LTV
  if (customerId) {
    await supabase.rpc("update_customer_ltv", { p_customer_id: customerId });
  }

  // Send receipt email
  if (sendReceipt && customer?.email) {
    const customerName = customer.name?.split(" ")[0] || customer.email.split("@")[0];
    try {
      await getResend().emails.send({
        from: FROM_EMAIL,
        replyTo: REPLY_TO,
        to: customer.email,
        subject: `Your Nine2Five receipt — Order #${order.order_number}`,
        html: orderConfirmationHtml({
          order_number: order.order_number,
          customer_name: customerName,
          items: items.map(i => ({
            product_name: i.productName,
            size: i.size,
            quantity: i.quantity,
            unit_price: i.unitPrice,
          })),
          subtotal,
          shipping_cost: 0,
          discount_code: discountCode,
          discount_amount_cents: discountAmount,
          total,
          shipping_address: shippingAddress,
        }),
        text: orderConfirmationText({
          order_number: order.order_number,
          customer_name: customerName,
          items: items.map(i => ({
            product_name: i.productName,
            size: i.size,
            quantity: i.quantity,
            unit_price: i.unitPrice,
          })),
          subtotal,
          shipping_cost: 0,
          discount_code: discountCode,
          discount_amount_cents: discountAmount,
          total,
          shipping_address: shippingAddress,
        }),
      });
    } catch (err) {
      console.error("POS receipt email failed:", err);
    }
  }

  return NextResponse.json({ orderId: order.id, orderNumber: order.order_number });
}
