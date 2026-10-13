import { NextRequest, NextResponse } from "next/server";
import { syncEShip } from "@/lib/eship-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Hourly: pull shipped orders and delivery status back from NZ Post eShip. */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncEShip();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron] eShip sync failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "eShip sync failed" }, { status: 500 });
  }
}
