import { NextRequest, NextResponse } from "next/server";
import { getResend, FROM_EMAIL } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: "nine2five.co.nz@gmail.com",
      replyTo: email,
      subject: subject ? `[Nine2Five Contact] ${subject}` : `[Nine2Five Contact] Message from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
          <div style="background:#06150C;padding:24px 28px;border-radius:8px 8px 0 0">
            <p style="margin:0;font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.02em">
              NINE<span style="color:#2E8B28">2</span>FIVE
            </p>
          </div>
          <div style="background:#fff;padding:28px 28px 20px;border:1px solid #e5e5e5;border-top:none">
            <h2 style="margin:0 0 20px;font-size:18px;font-weight:700">New contact message</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr>
                <td style="padding:8px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;width:80px">From</td>
                <td style="padding:8px 0;font-size:14px;color:#1a1a1a">${name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Email</td>
                <td style="padding:8px 0;font-size:14px"><a href="mailto:${email}" style="color:#2E8B28">${email}</a></td>
              </tr>
              ${subject ? `<tr>
                <td style="padding:8px 0;font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Subject</td>
                <td style="padding:8px 0;font-size:14px;color:#1a1a1a">${subject}</td>
              </tr>` : ""}
            </table>
            <div style="background:#f7f7f5;border-radius:6px;padding:16px 18px">
              <p style="margin:0;font-size:14px;line-height:1.6;color:#333;white-space:pre-wrap">${message}</p>
            </div>
            <p style="margin:20px 0 0;font-size:12px;color:#aaa">Hit reply to respond directly to ${name}.</p>
          </div>
          <div style="background:#f7f7f5;padding:14px 28px;border-radius:0 0 8px 8px;border:1px solid #e5e5e5;border-top:none">
            <p style="margin:0;font-size:11px;color:#bbb">Sent via nine2five.nz contact form</p>
          </div>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact email failed:", err);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
}
