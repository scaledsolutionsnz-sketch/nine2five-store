import { createServiceRoleClient } from "@/lib/supabase/server";
import { createEShipShipment } from "@/lib/eship";
import type { ShippingAddress } from "@/types/database";

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
 *
 * It also sends orders to eShip that never got there: only paid website orders
 * are pushed automatically (Stripe webhook), so orders added in the admin, POS
 * orders for delivery and replacements sat outside eShip until someone noticed.
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
  tracking_short_status?: string | null;
  tracking_full_status?: string | null;
  packages?: EShipPackage[] | null;
  [key: string]: unknown;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// eShip allows about two calls a second: space calls out and wait out a 429.
let lastCall = 0;
async function call(path: string): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    const wait = lastCall + 600 - Date.now();
    if (wait > 0) await sleep(wait);
    lastCall = Date.now();
    const res = await fetch(`${BASE}${path}`, { headers: headers(), cache: "no-store" });
    if (res.status !== 429 || attempt >= 4) return res;
    await sleep(1500 * attempt);
  }
}

async function api<T>(path: string): Promise<T> {
  const res = await call(path);
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


/** NZ Post's status text on an eShip shipped order, e.g. "Delivered", "In Transit", "Printed". */
const statusOf = (o: EShipShippedOrder) => String(o.tracking_short_status || o.tracking_full_status || "").trim();
const isDelivered = (s: string) => /deliver/i.test(s) && !/out\s*for|attempt|fail/i.test(s);
/** A label printed but never handed to NZ Post (eShip's "Printed" tab) isn't shipped yet. */
const isNotYetSent = (s: string) => /printed|awaiting|label created|not yet/i.test(s);

export type EShipSyncResult = {
  eshipShipped: number;
  matched: number;
  markedShipped: number[];
  trackingAdded: number;
  markedDelivered: number[];
  trackingChecked: number;
  notInStore: string[];
  preview?: { orderKeys: string[]; packageKeys: string[]; firstTracking: string | null; trackSample: { order: number; status: string | null } | null; statusCounts: Record<string, number>; statusOf1133?: string };
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
  const markedDeliveredFromList: number[] = [];
  const statusCounts: Record<string, number> = {};
  for (const r of rows) {
    const o = byNumber.get(r.order_number)!;
    const tracking = trackingNumberOf(o);
    const nzStatus = statusOf(o);
    statusCounts[nzStatus || "(none)"] = (statusCounts[nzStatus || "(none)"] ?? 0) + 1;
    const patch: Record<string, unknown> = {};
    if (isDelivered(nzStatus)) {
      if (r.status === "pending" || r.status === "processing" || r.status === "shipped") patch.status = "delivered";
    } else if (!isNotYetSent(nzStatus) && (r.status === "pending" || r.status === "processing")) {
      patch.status = "shipped";
    }
    if (!r.tracking_number && tracking) patch.tracking_number = tracking;
    if (Object.keys(patch).length) {
      if (!dryRun) {
        patch.updated_at = now;
        // A tracking-only patch may also land on a delivered order; a status change never moves one backwards.
        const from = patch.status ? ["pending", "processing", "shipped"] : ["pending", "processing", "shipped", "delivered"];
        await db.from("orders").update(patch).eq("id", r.id).in("status", from);
      }
      if (patch.status === "shipped") markedShipped.push(r.order_number);
      if (patch.status === "delivered") markedDeliveredFromList.push(r.order_number);
      if (patch.tracking_number) trackingAdded++;
    }
    // Only orders eShip gave no status for need a separate tracking lookup.
    const stillShipped = patch.status === "shipped" || (r.status === "shipped" && !patch.status);
    if (stillShipped && !nzStatus) inTransit.push({ ...r, tracking_number: (patch.tracking_number as string) ?? r.tracking_number });
  }

  // Newest first, so a backlog of old international parcels can't crowd out this week's.
  inTransit.sort((a, b) => b.order_number - a.order_number);
  const markedDelivered: number[] = [...markedDeliveredFromList];
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
        statusCounts,
        statusOf1133: byNumber.get(1133) ? statusOf(byNumber.get(1133)!) : undefined,
      },
    } : {}),
  };
}

/** Whether eShip already has this order, in any tab (New, Printed, Shipped...). */
async function findInEShip(orderNumber: number): Promise<{ found: boolean; status?: string }> {
  const res = await call(`/orders?order_number=${orderNumber}`);
  const body = (await res.json().catch(() => null)) as { success?: boolean; order?: { status?: string } | null } | null;
  if (body?.order) return { found: true, status: body.order.status };
  if (res.status === 404 || (res.ok && body?.success === false) || (res.ok && body && !body.order)) return { found: false };
  throw new Error(`eShip order lookup failed (${res.status})`);
}

const IN_PERSON = /in-person sale/i;

/**
 * Send recent unfulfilled orders to eShip if they aren't there yet. Only orders
 * from the last `sinceDays` days, so the June-July backlog (sent before eShip
 * was used) is never re-imported, and never in-person POS sales.
 */
export type PushResult = { pushed: number[]; skipped: { order: number; reason: string }[]; failed: { order: number; error: string }[]; error?: string };

/** Same as pushMissingToEShip, but a failure is reported instead of thrown so the status pull still runs. */
export async function pushMissingSafely(opts: { sinceDays?: number; dryRun?: boolean } = {}): Promise<PushResult> {
  try {
    return await pushMissingToEShip(opts);
  } catch (e) {
    return { pushed: [], skipped: [], failed: [], error: e instanceof Error ? e.message.slice(0, 300) : "eShip error" };
  }
}

export async function pushMissingToEShip({ sinceDays = 21, dryRun = false } = {}): Promise<PushResult> {
  if (!process.env.NZPOST_ESHIP_API_KEY) throw new Error("NZPOST_ESHIP_API_KEY is not set");
  const db = createServiceRoleClient();
  const since = new Date(Date.now() - sinceDays * 86_400_000).toISOString();
  const { data, error } = await db.from("orders")
    .select("id, order_number, status, shipping_address, created_at, order_items(quantity, variant_id, product_name, size, unit_price)")
    .in("status", ["pending", "processing"]).gte("created_at", since).order("order_number");
  if (error) throw new Error(`Could not read orders: ${error.message}`);
  const orders = (data ?? []) as { id: string; order_number: number; shipping_address: ShippingAddress | null; order_items: { quantity: number; variant_id: string; product_name: string; size: string; unit_price: number }[] }[];
  if (!orders.length) return { pushed: [], skipped: [], failed: [] };

  const pushed: number[] = []; const skipped: { order: number; reason: string }[] = []; const failed: { order: number; error: string }[] = [];
  for (const o of orders) {
    const addr = o.shipping_address;
    if (!addr?.line1 || !addr.city || !addr.postcode || IN_PERSON.test(addr.line1)) { skipped.push({ order: o.order_number, reason: "no delivery address (collected in person or missing)" }); continue; }
    const items = o.order_items ?? [];
    const totalPairs = items.reduce((n, i) => n + i.quantity, 0);
    if (!totalPairs) { skipped.push({ order: o.order_number, reason: "no items" }); continue; }
    try {
      if ((await findInEShip(o.order_number)).found) continue;
    } catch (e) {
      failed.push({ order: o.order_number, error: e instanceof Error ? e.message : "eShip lookup failed" });
      continue;
    }
    if (dryRun) { pushed.push(o.order_number); continue; }
    await sleep(Math.max(0, lastCall + 1000 - Date.now()));
    lastCall = Date.now();
    try {
      await createEShipShipment({
        orderNumber: o.order_number,
        shippingAddress: addr,
        totalPairs,
        items: items.map((i) => ({ sku: i.variant_id, description: `${i.product_name} – ${i.size}`, quantity: i.quantity, unit_price: i.unit_price })),
      });
      pushed.push(o.order_number);
    } catch (e) {
      failed.push({ order: o.order_number, error: e instanceof Error ? e.message.slice(0, 300) : "eShip error" });
    }
  }
  return { pushed, skipped, failed };
}
