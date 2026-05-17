import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import type { CartItem } from "@/types/database";
import { calculateShippingByPairs } from "@/lib/shipping";

export async function POST(req: NextRequest) {
  try {
    const { items, country } = await req.json() as { items: CartItem[]; country: string };
    if (!items?.length) return NextResponse.json({ error: "No items" }, { status: 400 });

    const totalPairs = items.reduce((sum, i) => sum + i.quantity, 0);
    const { cost: shipping, isBulk } = calculateShippingByPairs(totalPairs, country || "NZ");

    if (isBulk) {
      return NextResponse.json({ isBulk: true });
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
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
    const body = await req.json() as {
      clientSecret: string;
      amount_only?: boolean;
      subtotal?: number;
      email?: string;
      shippingAddress?: Record<string, string>;
      items?: Array<{ price: number; quantity: number }>;
      shipping?: number;
      discount_code?: string | null;
      discount_amount?: number;
      affiliate_code?: string | null;
      session_id?: string | null;
    };

    const piId = body.clientSecret.split("_secret_")[0];
    const discountAmt = body.discount_amount ?? 0;
    const shipping = body.shipping ?? 0;

    // Lightweight amount-only update (called when discount codes change)
    if (body.amount_only) {
      const subtotal = body.subtotal ?? 0;
      const newTotal = Math.max(subtotal + shipping - discountAmt, 50);
      await stripe.paymentIntents.update(piId, { amount: newTotal });
      return NextResponse.json({ ok: true, total: newTotal });
    }

    // Full update at submit time (includes metadata for webhook)
    const items = body.items ?? [];
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const newTotal = Math.max(subtotal + shipping - discountAmt, 50);

    await stripe.paymentIntents.update(piId, {
      amount: newTotal,
      metadata: {
        email: body.email || "",
        shippingAddress: JSON.stringify(body.shippingAddress ?? {}),
        items: JSON.stringify(items),
        shipping: String(shipping),
        subtotal: String(subtotal),
        discount_code: body.discount_code || "",
        discount_amount: String(discountAmt),
        affiliate_code: body.affiliate_code || "",
        session_id: body.session_id || "",
      },
    });

    return NextResponse.json({ ok: true, total: newTotal });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
