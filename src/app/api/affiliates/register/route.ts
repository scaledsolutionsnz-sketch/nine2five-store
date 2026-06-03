import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name: string;
      email: string;
      password: string;
      referral_code?: string;
      how_promote?: string;
      terms_accepted?: boolean;
    };

    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }
    if (!body.terms_accepted) {
      return NextResponse.json({ error: "You must accept the terms and conditions" }, { status: 400 });
    }
    if (body.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const service = await createServiceClient();

    // Generate referral code from name if not provided
    const code = (body.referral_code ?? body.name)
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 20);

    if (code.length < 3) {
      return NextResponse.json({ error: "Could not generate a valid referral code — try providing one manually" }, { status: 400 });
    }

    // Check if referral code or email already taken
    const { data: existing } = await service
      .from("affiliates")
      .select("id, email, referral_code")
      .or(`email.eq.${body.email.toLowerCase()},referral_code.eq.${code}`)
      .limit(1)
      .single();

    if (existing) {
      if (existing.email === body.email.toLowerCase()) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: `Referral code "${code}" is already taken — choose a different one` }, { status: 409 });
    }

    // Create Supabase auth user
    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email: body.email.toLowerCase().trim(),
      password: body.password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      if (authError?.message?.includes("already registered")) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: authError?.message ?? "Failed to create account" }, { status: 500 });
    }

    // Create affiliate record
    const { data: affiliate, error: affError } = await service
      .from("affiliates")
      .insert({
        user_id: authData.user.id,
        email: body.email.toLowerCase().trim(),
        name: body.name.trim(),
        referral_code: code,
        commission_rate: 20,
        status: "pending",
        notes: body.how_promote ? `How they'll promote: ${body.how_promote}` : null,
        terms_accepted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (affError) {
      // Roll back auth user if affiliate insert fails
      await service.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: affError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, affiliate }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
