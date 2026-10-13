import { NextRequest, NextResponse } from "next/server";
import { syncEShip } from "@/lib/eship-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * "Sync with NZ Post" on the orders page (admin only: the middleware checks
 * admin_users for every /api/admin route). GET ?dry=1 shows what would change
 * without writing anything.
 */
export async function POST() {
  try {
    return NextResponse.json({ ok: true, ...(await syncEShip()) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "eShip sync failed" }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  const dryRun = req.nextUrl.searchParams.get("dry") === "1";
  try {
    return NextResponse.json({ ok: true, dryRun, ...(await syncEShip({ dryRun, maxTrackingChecks: dryRun ? 3 : 40 })) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "eShip sync failed" }, { status: 502 });
  }
}
