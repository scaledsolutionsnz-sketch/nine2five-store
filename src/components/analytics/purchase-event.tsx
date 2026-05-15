"use client";

import { useEffect } from "react";

interface OrderData {
  orderNumber: string;
  total: number;        // cents
  currency: string;
  items: { name: string; productId: string; quantity: number; price: number }[];
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, data?: unknown) => void };
  }
}

export function PurchaseEvent() {
  useEffect(() => {
    const raw = sessionStorage.getItem("n2f_purchase");
    if (!raw) return;

    let order: OrderData;
    try {
      order = JSON.parse(raw);
    } catch {
      return;
    }

    const value = order.total / 100;
    const currency = order.currency ?? "NZD";

    // ── Meta Pixel ────────────────────────────────────────────────────────────
    if (window.fbq) {
      window.fbq("track", "Purchase", {
        value,
        currency,
        content_type: "product",
        content_ids: order.items.map((i) => i.productId),
        contents: order.items.map((i) => ({
          id: i.productId,
          quantity: i.quantity,
          item_price: i.price / 100,
        })),
        num_items: order.items.reduce((s, i) => s + i.quantity, 0),
      });
    }

    // ── GA4 ───────────────────────────────────────────────────────────────────
    if (window.gtag) {
      window.gtag("event", "purchase", {
        transaction_id: order.orderNumber,
        value,
        currency,
        items: order.items.map((i) => ({
          item_id: i.productId,
          item_name: i.name,
          quantity: i.quantity,
          price: i.price / 100,
        })),
      });
    }

    // ── TikTok ────────────────────────────────────────────────────────────────
    if (window.ttq) {
      window.ttq.track("CompletePayment", { value, currency });
    }

    // Clear so refresh doesn't re-fire
    sessionStorage.removeItem("n2f_purchase");
  }, []);

  return null;
}
