import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoded = req.nextUrl.searchParams.get("e");
  if (!encoded) {
    return new NextResponse("Invalid link.", { status: 400 });
  }

  let email: string;
  try {
    email = Buffer.from(encoded, "base64url").toString("utf-8");
  } catch {
    return new NextResponse("Invalid link.", { status: 400 });
  }

  const supabase = await createServiceClient();
  await supabase
    .from("customers")
    .update({ accepts_marketing: false })
    .eq("email", email);

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Unsubscribed — Nine2Five</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0a0a0a;color:#fafafa;font-family:Inter,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.card{max-width:440px;width:100%;text-align:center}.logo{font-size:20px;font-weight:900;letter-spacing:-0.5px;margin-bottom:32px}.title{font-size:24px;font-weight:700;margin-bottom:12px}.sub{font-size:15px;color:#737373;line-height:1.6;margin-bottom:28px}.btn{display:inline-block;padding:12px 28px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600}
</style></head>
<body>
<div class="card">
  <div class="logo">NINE2FIVE</div>
  <p class="title">You've been unsubscribed</p>
  <p class="sub">You won't receive marketing emails from Nine2Five anymore. You'll still get order and shipping notifications.</p>
  <a class="btn" href="https://nine2five.co.nz/shop">Back to Shop</a>
</div>
</body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
