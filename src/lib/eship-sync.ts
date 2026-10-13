import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Brings shipping status back from NZ Post eShip (StarShipIT) into our orders.
 *
 * Orders are pushed to eShip when they're paid (Stripe webhook) or from the
 * order page, but nothing ever came back: labels were printed and parcels sent
 * in eShip while every order here stayed "processing" (Unfulfilled). This reads
 * eShip's shipped list and:
 *  - marks matching orders "shipped" and stores the tracking number;
 *  - checks tracking for orders still in transit and marks delivered ones
 *    "delivered" (shown as Fulfilled on the orders page).
 * Orders made by hand in eShip (low numbers like 92-95) don't match a store
 * order and are skipped.
 */

const BASE = "https://api.starshipit.com/api";

function headers() {
  return {
    "Content-Type": "application/json",
    "StarShipIT-Api-Key": process.env.NZPOST_ESHIP_API_KEY ?? "",
    "Ocp-Apim-Subscription-Key": process.env.NZPOST_ESHIP_SUBSCRIPTION_KEY ?? "",
  };
}

type EShipPackage = { tracking_number?: string | null; tracking_url?: string | null };
export type EShipShippedOrder = {
  order_number?: string | number | null;
  shipped_date?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  packages?: EShipPackage[] | null;
  [key: string]: unknown;
};

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: headers(), cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`eShip ${path.split("?")[0]} failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

/** Every order eShip has marked shipped since `sinceIso`. */
export async function listShipped(sinceIso: string): Promise<EShipShippedOrder[]> {
  const out: EShipShippedOrder[] = [];
  for (let page = 1; page <= 20; page++) {
    const params = new URLSearchParams({ since_last_updated: sinceIso, limit: "250", page: String(page) });
    const data = await api<{ orders?: EShipShippedOrder[]; total_pages?: number; success?: boolean }>(`/orders/shipped?${params}`);
    out.push(...(data.orders ?? []));
    if (!data.orders?.length || page >= (data.total_pages ?? 1)) break;
  }
  return out;
}

export function trackingNumberOf(o: EShipShippedOrder): string | null {
  const direct = typeof o.tracking_number === "string" && o.tracking_number.trim() ? o.tracking_number.trim() : null;
  return direct ?? o.packages?.find((p) => p?.tracking_number?.trim())?.tracking_number?.trim() ?? null;
}

/** NZ Post's latest status for one order ("Delivered", "InTransit", ...), or null if unknown. */
export async function trackingStatus(orderNumber: number, trackingNumber: string | null): Promise<string | null> {
  const attempts = [`/track?order_number=${encodeURIComponent(String(orderNumber))}`];
  if (trackingNumber) attempts.push(`/track?tracking_number=${encodeURIComponent(trackingNumber)}`);
  for (const path of attempts) {
    try {
      const data = await api<{ results?: { tracking_status?: string } | { tracking_status?: string }[]; tracking_status?: string }>(path);
      const results = Array.isArray(data.results) ? data.results[0] : data.results;
      const status = results?.tracking_status ?? data.tracking_status;
      if (typeof status === "string" && status) return status;
    } catch {
      // try the next way of asking
    }
  }
  return null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type EShipSyncResult = {
  eshipShipped: number;
  matched: number;
  markedShipped: number[];
  trackingAdded: number;
  markedDelivered: number[];
  trackingChecked: number;
  notInStore: string[];
  preview?: { orderKeys: string[]; packageKeys: string[]; firstTracking: string | null; trackSample: { order: number; status: string | null } | null };
};

export async function syncEShip({ sinceDays = 90, maxTrackingChecks = 40, dryRun = false } = {}): Promise<EShipSyncResult> {
  if (!process.env.NZPOST_ESHIP_API_KEY) throw new Error("NZPOST_ESHIP_API_KEY is not set");
  const db = createServiceRoleClient();
  const shipped = await listShipped(new Date(Date.now() - sinceDays * 86_400_000).toISOString());

  const byNumber = new Map<number, EShipShippedOrder>();
  const notInStore: string[] = [];
  for (const o of shipped) {
    const n = String(o.order_number ?? "").trim();
    if (/^\d+$/.test(n)) byNumber.set(Number(n), o);
    else if (n) notInStore.push(n);
  }

  const numbers = [...byNumber.keys()];
  const rows: { id: string; order_number: number; status: string; tracking_number: string | null; updated_at: string }[] = [];
  for (let i = 0; i < numbers.length; i += 200) {
    const { data, error } = await db.from("orders").select("id, order_number, status, tracking_number, updated_at").in("order_number", numbers.slice(i, i + 200));
    if (error) throw new Error(`Could not read orders: ${error.message}`);
    rows.push(...(data ?? []));
  }
  const inStore = new Set(rows.map((r) => r.order_number));
  for (const n of numbers) if (!inStore.has(n)) notInStore.push(String(n));

  const now = new Date().toISOString();
  const markedShipped: number[] = [];
  let trackingAdded = 0;
  const inTransit: typeof rows = [];
  for (const r of rows) {
    const o = byNumber.get(r.order_number)!;
    const tracking = trackingNumberOf(o);
    const patch: Record<string, unknown> = {};
    if (r.status === "pending" || r.status === "processing") patch.status = "shipped";
    if (!r.tracking_number && tracking) patch.tracking_number = tracking;
    if (Object.keys(patch).length) {
      if (!dryRun) {
        patch.updated_at = now;
        await db.from("orders").update(patch).eq("id", r.id).in("status", ["pending", "processing", "shipped"]);
      }
      if (patch.status) markedShipped.push(r.order_number);
      if (patch.tracking_number) trackingAdded++;
    }
    if (r.status === "shipped" || patch.status === "shipped") inTransit.push({ ...r, tracking_number: (patch.tracking_number as string) ?? r.tracking_number });
  }

  // Newest first, so a backlog of old international parcels can't crowd out this week's.
  inTransit.sort((a, b) => b.order_number - a.order_number);
  const markedDelivered: number[] = [];
  let trackingChecked = 0;
  let trackSample: { order: number; status: string | null } | null = null;
  for (const r of inTransit.slice(0, maxTrackingChecks)) {
    const status = await trackingStatus(r.order_number, r.tracking_number);
    trackingChecked++;
    trackSample ??= { order: r.order_number, status };
    if (status && /deliver/i.test(status) && !/out\s*for|attempt/i.test(status)) {
      if (!dryRun) await db.from("orders").update({ status: "delivered", updated_at: now }).eq("id", r.id).eq("status", "shipped");
      markedDelivered.push(r.order_number);
    }
    await sleep(600); // eShip allows a couple of calls a second
  }

  const first = shipped[0];
  return {
    eshipShipped: shipped.length,
    matched: rows.length,
    markedShipped,
    trackingAdded,
    markedDelivered,
    trackingChecked,
    notInStore,
    ...(dryRun ? {
      preview: {
        orderKeys: first ? Object.keys(first) : [],
        packageKeys: first?.packages?.[0] ? Object.keys(first.packages[0]) : [],
        firstTracking: first ? trackingNumberOf(first) : null,
        trackSample,
      },
    } : {}),
  };
}
