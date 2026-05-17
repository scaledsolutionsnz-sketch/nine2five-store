import { NextResponse } from "next/server";

const BASE = "https://api.starshipit.com/api";
const TEST_ORDER_ID = 704738387;
const TEST_PACKAGE_ID = 882149874;

export async function GET() {
  const apiKey = process.env.NZPOST_ESHIP_API_KEY ?? "";
  const subKey = process.env.NZPOST_ESHIP_SUBSCRIPTION_KEY ?? "";
  const authHeaders = {
    "Content-Type": "application/json",
    "StarShipIT-Api-Key": apiKey,
    "Ocp-Apim-Subscription-Key": subKey,
  };

  async function req(method: string, url: string, body?: unknown) {
    const res = await fetch(url, {
      method, headers: authHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    const ct = res.headers.get("content-type") ?? "";
    const text = await res.text();
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { parsed = text.slice(0, 300); }
    return { status: res.status, ok: res.ok, ct, body: parsed };
  }

  // Retrieve the test order to check its full state including any label fields
  const getOrder = await req("GET", `${BASE}/orders?order_id=${TEST_ORDER_ID}`);

  // Try label at root (no /api prefix)
  const [
    labelNoApi,
    labelNoApiPost,
    shipOrder,
    trackingByPkg,
    labelByPkg,
  ] = await Promise.all([
    req("GET",  `https://api.starshipit.com/labels?order_ids=${TEST_ORDER_ID}`),
    req("POST", `https://api.starshipit.com/labels`, { order_ids: [TEST_ORDER_ID], label_format: "PDF_4x6" }),
    req("POST", `${BASE}/orders/${TEST_ORDER_ID}/ship`, {}),
    req("GET",  `${BASE}/tracking?order_id=${TEST_ORDER_ID}`),
    req("GET",  `${BASE}/labels?package_id=${TEST_PACKAGE_ID}&label_format=PDF_4x6`),
  ]);

  return NextResponse.json({ getOrder, labelNoApi, labelNoApiPost, shipOrder, trackingByPkg, labelByPkg });
}
