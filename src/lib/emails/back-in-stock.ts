export function backInStockHtml(productName: string, productUrl: string, size: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Back in stock — ${productName}</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
          <tr>
            <td style="text-align:center;padding-bottom:32px;">
              <p style="margin:0;font-size:20px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;">NINE2FIVE</p>
            </td>
          </tr>
          <tr>
            <td style="background:#141414;border:1px solid #1e1e1e;border-radius:12px;padding:32px;text-align:center;">
              <div style="width:48px;height:48px;background:#16a34a;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:24px;">✓</span>
              </div>
              <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#737373;">Back in Stock</p>
              <p style="margin:12px 0 0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">${productName}</p>
              <p style="margin:8px 0 0;font-size:14px;color:#737373;">Size ${size} is available again. Grab it before it sells out.</p>
              <a href="${productUrl}"
                 style="display:inline-block;margin-top:24px;background:#16a34a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:10px;">
                Shop Now →
              </a>
            </td>
          </tr>
          <tr>
            <td style="text-align:center;padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#525252;">Nine2Five · Christchurch, New Zealand</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
