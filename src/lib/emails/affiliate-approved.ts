export function affiliateApprovedHtml(name: string, referralCode: string, dashboardUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>You're approved — Nine2Five</title>
</head>
<body style="margin:0;padding:0;background:#06150C;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#06150C;padding:40px 20px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

      <!-- Logo -->
      <tr><td style="padding-bottom:32px;text-align:center;">
        <span style="font-size:28px;font-weight:900;letter-spacing:-0.04em;color:#ffffff;">
          NINE<span style="color:#2f9b2f;">2</span>FIVE
        </span>
      </td></tr>

      <!-- Card -->
      <tr><td style="background:rgba(7,24,14,0.95);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:40px 36px;">

        <!-- Badge -->
        <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="background:rgba(47,155,47,0.12);border:1px solid rgba(47,155,47,0.25);border-radius:999px;padding:6px 16px;">
            <span style="font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#2f9b2f;">Application Approved</span>
          </td></tr>
        </table>

        <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
          You&rsquo;re in, ${name.split(" ")[0]}!
        </h1>
        <p style="margin:0 0 28px;font-size:15px;color:rgba(255,255,255,0.5);line-height:1.7;">
          Your Nine2Five ambassador account has been approved. You earn <strong style="color:#ffffff;">20% commission</strong> on every order you refer. Payouts go out monthly via bank transfer.
        </p>

        <!-- Referral code box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px 24px;">
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.3);">Your Referral Link</p>
            <p style="margin:0;font-size:14px;font-family:monospace;color:#2f9b2f;word-break:break-all;">
              https://nine2five.nz?ref=${referralCode}
            </p>
          </td></tr>
        </table>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="background:#2f9b2f;border-radius:999px;padding:14px 32px;">
            <a href="${dashboardUrl}" style="font-size:13px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
              Go to Dashboard &rarr;
            </a>
          </td></tr>
        </table>

        <!-- Steps -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;">
          <tr>
            <td style="font-size:13px;color:rgba(255,255,255,0.35);line-height:1.7;">
              <strong style="color:rgba(255,255,255,0.7);">Getting started:</strong><br/>
              1. Copy your referral link from the dashboard<br/>
              2. Share on TikTok, Instagram, YouTube — anywhere your audience is<br/>
              3. Remember to disclose paid partnerships as required by NZ law<br/>
              4. Add your bank account in dashboard settings to receive payouts
            </td>
          </tr>
        </table>

      </td></tr>

      <!-- Footer -->
      <tr><td style="padding-top:24px;text-align:center;">
        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);">
          Questions? <a href="mailto:info@nine2five.nz" style="color:rgba(255,255,255,0.35);">info@nine2five.nz</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export function affiliateApprovedText(name: string, referralCode: string, dashboardUrl: string): string {
  return `Hi ${name.split(" ")[0]},

Your Nine2Five ambassador application has been approved!

You earn 20% commission on every order you refer. Payouts go out monthly via bank transfer.

Your referral link: https://nine2five.nz?ref=${referralCode}

Dashboard: ${dashboardUrl}

Getting started:
- Copy your referral link from the dashboard
- Share it wherever your audience is
- Disclose paid partnerships as required by NZ law
- Add your bank account in dashboard settings to receive payouts

Questions? info@nine2five.nz

— Nine2Five`;
}
