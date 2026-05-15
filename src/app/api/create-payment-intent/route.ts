import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import type { CartItem } from "@/types/database";
import { calculateShipping } from "@/lib/shipping";

export async function POST(req: NextRequest) {
  try {
    const { items, country } = await req.json() as { items: CartItem[]; country: string };
    if (!items?.length) return NextResponse.json({ error: "No items" }, { status: 400 });

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = calculateShipping(subtotal, country || "NZ");
    const total = subtotal + shipping;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "nzd",
      metadata: {
        subtotal: String(subtotal),
        shipping: String(shipping),
        country,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      total,
      shipping,
      subtotal,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const {
      clientSecret,
      email,
      shippingAddress,
      items,
      shipping,
      discount_code,
      discount_amount,
      affiliate_code,
      session_id,
    } = await req.json() as {
      clientSecret: string;
      email: string;
      shippingAddress: Record<string, string>;
      items: Array<{ price: number; quantity: number }>;
      shipping: number;
      discount_code?: string | null;
      discount_amount?: number;
      affiliate_code?: string | null;
      session_id?: string | null;
    };

    const piId = clientSecret.split("_secret_")[0];
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const discountAmt = discount_amount ?? 0;
    const newTotal = subtotal + shipping - discountAmt;

    // Update amount with discount applied
    await stripe.paymentIntents.update(piId, {
      amount: newTotal,
      metadata: {
        email: email || "",
        shippingAddress: JSON.stringify(shippingAddress),
        items: JSON.stringify(items),
        shipping: String(shipping),
        subtotal: String(subtotal),
        discount_code: discount_code || "",
        discount_amount: String(discountAmt),
        affiliate_code: affiliate_code || "",
        session_id: session_id || "",
      },
    });

    return NextResponse.json({ ok: true, total: newTotal });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
