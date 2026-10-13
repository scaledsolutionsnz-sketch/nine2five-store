import { NextResponse } from "next/server";
import { pushMissingSafely, syncEShip } from "@/lib/eship-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * "Sync with NZ Post" on the orders page (admin only: the middleware checks
 * admin_users for every /api/admin route). GET only previews what would change
 * (a dry run), so opening the URL never sends or edits anything.
 */
export async function POST() {
  try {
    const sent = await pushMissingSafely();
    return NextResponse.json({ ok: true, sentToEShip: sent, ...(await syncEShip()) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "eShip sync failed" }, { status: 502 });
  }
}

export async function GET() {
  try {
    const sent = await pushMissingSafely({ dryRun: true });
    return NextResponse.json({ ok: true, dryRun: true, sentToEShip: sent, ...(await syncEShip({ dryRun: true, maxTrackingChecks: 3 })) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "eShip sync failed" }, { status: 502 });
  }
}
