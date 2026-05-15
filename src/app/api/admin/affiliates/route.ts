import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    email: string;
    name: string;
    referral_code: string;
    commission_rate?: number;
  };

  if (!body.email || !body.name || !body.referral_code) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const code = body.referral_code.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (code.length < 3 || code.length > 30) {
    return NextResponse.json({ error: "Code must be 3–30 alphanumeric characters" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data, error } = await service
    .from("affiliates")
    .insert({
      email: body.email.toLowerCase().trim(),
      name: body.name.trim(),
      referral_code: code,
      commission_rate: Math.max(1, Math.min(100, body.commission_rate ?? 10)),
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Referral code or email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeAuditLog({
    action: "affiliate.approved",
    entity: "affiliates",
    entityId: data.id,
    actor: user.email!,
    details: { email: body.email, code },
    request: req,
  });

  return NextResponse.json(data, { status: 201 });
}
