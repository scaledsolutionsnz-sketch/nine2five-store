import { NextRequest, NextResponse } from "next/server";
import { getResend, FROM_EMAIL } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = (body?.email ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: "nine2five.co.nz@gmail.com",
      subject: `[Nine2Five] New email subscriber: ${email}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
          <div style="background:#06150C;padding:20px 24px;border-radius:8px 8px 0 0">
            <p style="margin:0;font-size:18px;font-weight:900;color:#fff;letter-spacing:-0.02em">
              NINE<span style="color:#2E8B28">2</span>FIVE
            </p>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px">
            <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#111">New subscriber</p>
            <p style="margin:0;font-size:16px;color:#2E8B28;font-weight:600">${email}</p>
            <p style="margin:16px 0 0;font-size:12px;color:#aaa">Signed up via the nine2five.nz pop-up.</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Email subscribe notify failed:", err);
  }

  return NextResponse.json({ ok: true });
}
