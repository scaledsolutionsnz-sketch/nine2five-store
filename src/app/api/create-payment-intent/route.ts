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
      metadata: { subtotal: String(subtotal), shipping: String(shipping), country },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, total, shipping, subtotal });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { clientSecret, email, shippingAddress, items, shipping } = await req.json();
    const piId = clientSecret.split("_secret_")[0];

    await stripe.paymentIntents.update(piId, {
      metadata: {
        email: email || "",
        shippingAddress: JSON.stringify(shippingAddress),
        items: JSON.stringify(items),
        shipping: String(shipping),
        subtotal: String(items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0)),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
