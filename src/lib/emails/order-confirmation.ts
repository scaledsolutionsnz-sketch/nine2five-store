import type { ShippingAddress } from "@/types/database";

interface OrderItem {
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
}

interface OrderConfirmationData {
  order_number: number;
  customer_name: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  discount_code?: string | null;
  discount_amount_cents?: number;
  total: number;
  shipping_address: ShippingAddress;
  estimated_delivery?: string;
}

export function orderConfirmationHtml(data: OrderConfirmationData): string {
  const {
    order_number,
    customer_name,
    items,
    subtotal,
    shipping_cost,
    discount_code,
    discount_amount_cents = 0,
    total,
    shipping_address: addr,
  } = data;

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;">
          <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff;">${item.product_name}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#737373;">Size ${item.size} × ${item.quantity}</p>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;text-align:right;font-size:14px;font-weight:600;color:#ffffff;">
          ${fmt(item.unit_price * item.quantity)}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Order #${order_number} confirmed</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="text-align:center;padding-bottom:32px;">
              <p style="margin:0;font-size:20px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;">NINE2FIVE</p>
              <p style="margin:4px 0 0;font-size:11px;color:#525252;text-transform:uppercase;letter-spacing:0.15em;">Māori Grip Socks</p>
            </td>
          </tr>

          <!-- Order confirmed banner -->
          <tr>
            <td style="background:#16a34a;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <p style="margin:0;font-size:13px;font-weight:600;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:0.1em;">Order Confirmed</p>
              <p style="margin:8px 0 0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">#${order_number}</p>
            </td>
          </tr>

          <tr><td style="height:24px;"></td></tr>

          <!-- Greeting -->
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0;font-size:16px;color:#ffffff;">Kia ora ${customer_name},</p>
              <p style="margin:12px 0 0;font-size:14px;color:#737373;line-height:1.6;">
                Your order is confirmed and we&apos;re getting it ready to send. We&apos;ll email you again with tracking once it ships.
              </p>
            </td>
          </tr>

          <!-- Order items -->
          <tr>
            <td style="background:#141414;border:1px solid #1e1e1e;border-radius:12px;padding:20px;">
              <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#737373;">Your Items</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid #262626;padding-top:16px;">
                <tr>
                  <td style="font-size:13px;color:#737373;padding:4px 0;">Subtotal</td>
                  <td style="font-size:13px;color:#737373;text-align:right;padding:4px 0;">${fmt(subtotal)}</td>
                </tr>
                ${discount_code && discount_amount_cents > 0 ? `
                <tr>
                  <td style="font-size:13px;color:#16a34a;padding:4px 0;">Discount (${discount_code})</td>
                  <td style="font-size:13px;color:#16a34a;text-align:right;padding:4px 0;">−${fmt(discount_amount_cents)}</td>
                </tr>` : ""}
                <tr>
                  <td style="font-size:13px;color:#737373;padding:4px 0;">Shipping</td>
                  <td style="font-size:13px;color:#737373;text-align:right;padding:4px 0;">${shipping_cost === 0 ? "Free" : fmt(shipping_cost)}</td>
                </tr>
                <tr>
                  <td style="font-size:15px;font-weight:700;color:#ffffff;padding:12px 0 0;border-top:1px solid #1e1e1e;">Total</td>
                  <td style="font-size:15px;font-weight:700;color:#ffffff;text-align:right;padding:12px 0 0;border-top:1px solid #1e1e1e;">${fmt(total)} NZD</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height:20px;"></td></tr>

          <!-- Shipping address -->
          <tr>
            <td style="background:#141414;border:1px solid #1e1e1e;border-radius:12px;padding:20px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#737373;">Shipping To</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#ffffff;">${addr.first_name} ${addr.last_name}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#737373;line-height:1.6;">
                ${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}<br/>
                ${addr.city}, ${addr.region} ${addr.postcode}<br/>
                ${addr.country === "NZ" ? "New Zealand" : "Australia"}
              </p>
            </td>
          </tr>

          <tr><td style="height:32px;"></td></tr>

          <!-- CTA -->
          <tr>
            <td style="text-align:center;">
              <a href="https://nine2five.co.nz/account/orders"
                 style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:10px;letter-spacing:0.02em;">
                View Your Order
              </a>
            </td>
          </tr>

          <tr><td style="height:40px;"></td></tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;border-top:1px solid #1e1e1e;padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#525252;">Nine2Five Limited · Christchurch, New Zealand</p>
              <p style="margin:6px 0 0;font-size:12px;color:#525252;">
                Questions? Reply to this email or visit
                <a href="https://nine2five.co.nz" style="color:#16a34a;text-decoration:none;">nine2five.co.nz</a>
              </p>
              <p style="margin:12px 0 0;font-size:11px;font-weight:900;letter-spacing:0.05em;color:#262626;">NINE2FIVE</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function orderConfirmationText(data: OrderConfirmationData): string {
  const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;
  const lines = [
    `Order #${data.order_number} confirmed — Nine2Five`,
    ``,
    `Kia ora ${data.customer_name},`,
    ``,
    `Your order is confirmed. We'll email you with tracking once it ships.`,
    ``,
    `ITEMS`,
    ...data.items.map((i) => `- ${i.product_name} (Size ${i.size} × ${i.quantity}) — ${fmt(i.unit_price * i.quantity)}`),
    ``,
    `Subtotal: ${fmt(data.subtotal)}`,
    data.discount_code ? `Discount (${data.discount_code}): -${fmt(data.discount_amount_cents ?? 0)}` : null,
    `Shipping: ${data.shipping_cost === 0 ? "Free" : fmt(data.shipping_cost)}`,
    `Total: ${fmt(data.total)} NZD`,
    ``,
    `SHIPPING TO`,
    `${data.shipping_address.first_name} ${data.shipping_address.last_name}`,
    `${data.shipping_address.line1}${data.shipping_address.line2 ? `, ${data.shipping_address.line2}` : ""}`,
    `${data.shipping_address.city}, ${data.shipping_address.region} ${data.shipping_address.postcode}`,
    ``,
    `View your order: https://nine2five.co.nz/account/orders`,
    ``,
    `Nine2Five Limited · Christchurch, New Zealand`,
  ].filter((l) => l !== null);
  return lines.join("\n");
}
