import type { CartItem } from "@/types/database";

export function abandonedCartHtml(opts: {
  firstName: string | null;
  items: CartItem[];
  recoveryUrl: string;
}): string {
  const { firstName, items, recoveryUrl } = opts;
  const greeting = firstName ? `Kia ora ${firstName},` : "Kia ora,";

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="56">
                ${item.imageUrl
                  ? `<img src="${item.imageUrl}" width="48" height="48" alt="${item.productName}" style="border-radius:8px;object-fit:cover;display:block;"/>`
                  : `<div style="width:48px;height:48px;background:#1c1c1c;border-radius:8px;"></div>`
                }
              </td>
              <td style="padding-left:12px;">
                <p style="margin:0;font-size:14px;font-weight:600;color:#fafafa;">${item.productName}</p>
                <p style="margin:4px 0 0;font-size:12px;color:#737373;">Size ${item.size} · Qty ${item.quantity}</p>
              </td>
              <td align="right" style="font-size:14px;font-weight:600;color:#fafafa;">
                $${((item.price * item.quantity) / 100).toFixed(2)}
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>You left something behind</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border-radius:16px;overflow:hidden;border:1px solid #1e1e1e;">

      <!-- Header -->
      <tr><td style="background:#0a0a0a;padding:28px 40px;border-bottom:1px solid #1e1e1e;">
        <span style="font-size:22px;font-weight:900;letter-spacing:-0.5px;color:#fafafa;">NINE2FIVE</span>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:40px;">
        <p style="margin:0 0 8px;font-size:16px;color:#d4d4d4;">${greeting}</p>
        <p style="margin:0 0 28px;font-size:15px;color:#a3a3a3;line-height:1.6;">
          You left something in your cart. Your gear is still available — grab it before it sells out.
        </p>

        <!-- Items -->
        <table width="100%" cellpadding="0" cellspacing="0">
          ${itemRows}
        </table>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0" style="margin-top:32px;">
          <tr><td style="background:#16a34a;border-radius:10px;">
            <a href="${recoveryUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:-0.3px;">
              Complete Your Order →
            </a>
          </td></tr>
        </table>

        <p style="margin:20px 0 0;font-size:12px;color:#525252;">
          Free NZ shipping on orders over $75. Easy 7-day returns.
        </p>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:24px 40px;border-top:1px solid #1e1e1e;">
        <p style="margin:0;font-size:12px;color:#525252;line-height:1.7;">
          Nine2Five · Christchurch, New Zealand · <a href="https://nine2five.co.nz" style="color:#16a34a;text-decoration:none;">nine2five.co.nz</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export function abandonedCartText(opts: {
  firstName: string | null;
  items: CartItem[];
  recoveryUrl: string;
}): string {
  const greeting = opts.firstName ? `Kia ora ${opts.firstName},` : "Kia ora,";
  const lines = opts.items.map((i) => `- ${i.productName} (Size ${i.size}, Qty ${i.quantity}) — $${((i.price * i.quantity) / 100).toFixed(2)}`);
  return `${greeting}\n\nYou left something in your cart:\n\n${lines.join("\n")}\n\nComplete your order: ${opts.recoveryUrl}\n\n— Nine2Five\nhttps://nine2five.co.nz`;
}
