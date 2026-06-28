import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import type { CartItem } from "@/types/database";
import { calculateShippingByPairs } from "@/lib/shipping";

// Read the affiliate referral cookie server-side, so attribution does not depend
// on the client PATCH running (express/Stripe Link can confirm without it).
function readRefCookie(req: NextRequest): string {
  const raw = req.cookies.get("n2f_ref")?.value ?? "";
  return raw.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 50);
}

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

    const metadata: Record<string, string> = {
      subtotal: String(subtotal),
      shipping: String(shipping),
      country,
      // Attach affiliate attribution + a compact item list at creation, so they
      // survive even if the client PATCH never runs (Stripe Link / express checkout).
      affiliate_code: readRefCookie(req),
    };
    // Compact items [{v:variantId,q,p}] — the webhook rebuilds line items from this
    // when the client metadata is missing. Stripe caps a metadata value at 500 chars,
    // so only attach when it fits (normal carts do; the full PATCH covers the rest).
    const itemsMin = JSON.stringify(items.map((i) => ({ v: i.variantId, q: i.quantity, p: i.price })));
    if (itemsMin.length <= 480) metadata.items_min = itemsMin;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "nzd",
      automatic_payment_methods: { enabled: true },
      metadata,
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
      accepts_marketing?: boolean;
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

    const addr = body.shippingAddress ?? {};
    await stripe.paymentIntents.update(piId, {
      amount: newTotal,
      ...(addr.line1 ? {
        shipping: {
          name: `${addr.first_name ?? ""} ${addr.last_name ?? ""}`.trim(),
          phone: addr.phone ?? undefined,
          address: {
            line1: addr.line1,
            line2: addr.line2 ?? undefined,
            city: addr.city ?? undefined,
            state: addr.region ?? undefined,
            postal_code: addr.postcode ?? undefined,
            country: addr.country ?? "NZ",
          },
        },
      } : {}),
      metadata: {
        email: body.email || "",
        shippingAddress: JSON.stringify(addr),
        items: JSON.stringify(items),
        shipping: String(shipping),
        subtotal: String(subtotal),
        discount_code: body.discount_code || "",
        discount_amount: String(discountAmt),
        // Prefer the server-read cookie (set at PI creation); fall back to the
        // client value. Avoids clobbering the creation-time code with an empty one.
        affiliate_code: readRefCookie(req) || (body.affiliate_code ?? ""),
        session_id: body.session_id || "",
        accepts_marketing: body.accepts_marketing ? "1" : "0",
      },
    });

    return NextResponse.json({ ok: true, total: newTotal });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
