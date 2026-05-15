import { openPixelUrl, trackedClickUrl, unsubscribeUrl } from "@/lib/email-tracking";

export function campaignHtml(opts: {
  campaignId: string;
  email: string;
  firstName: string | null;
  subject: string;
  body: string;
}): string {
  const { campaignId, email, firstName, body } = opts;
  const greeting = firstName ? `Kia ora ${firstName},` : "Kia ora,";
  const shopUrl = trackedClickUrl(campaignId, email, "https://nine2five.co.nz/shop");
  const pixel = openPixelUrl(campaignId, email);
  const unsub = unsubscribeUrl(email);

  // Linkify bare URLs in the body so they are tracked too — keep simple
  const safeBody = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${opts.subject}</title>
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
        <p style="margin:0 0 24px;font-size:16px;color:#d4d4d4;line-height:1.6;">${greeting}</p>
        <div style="font-size:15px;color:#d4d4d4;line-height:1.8;white-space:pre-wrap;">${safeBody}</div>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0" style="margin-top:36px;">
          <tr><td style="background:#16a34a;border-radius:10px;">
            <a href="${shopUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:-0.3px;">
              Shop Now →
            </a>
          </td></tr>
        </table>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:24px 40px;border-top:1px solid #1e1e1e;">
        <p style="margin:0;font-size:12px;color:#525252;line-height:1.7;">
          You're receiving this because you've ordered from Nine2Five or opted in to marketing emails.<br/>
          Nine2Five · Christchurch, New Zealand · <a href="https://nine2five.co.nz" style="color:#16a34a;text-decoration:none;">nine2five.co.nz</a><br/>
          <a href="${unsub}" style="color:#525252;text-decoration:underline;">Unsubscribe</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
<!-- open tracking pixel -->
<img src="${pixel}" width="1" height="1" alt="" style="display:none;"/>
</body>
</html>`;
}

export function campaignText(opts: {
  firstName: string | null;
  body: string;
}): string {
  const greeting = opts.firstName ? `Kia ora ${opts.firstName},` : "Kia ora,";
  return `${greeting}\n\n${opts.body}\n\nShop: https://nine2five.co.nz/shop\n\n— Nine2Five\nhttps://nine2five.co.nz`;
}
