import type { ShippingAddress } from "@/types/database";
import { nzCarrierForPairs } from "@/lib/shipping";

const BASE = "https://api.starshipit.com/api";

// Per-item values declared to NZ Post eShip. Change these to adjust what every line
// item (and the package total) sends. NOTE: the eShip/StarShipIT API takes weight in
// KILOGRAMS (the package weight below is also kg), so 65 g is sent as 0.065 kg.
const DEFAULT_UNIT_WEIGHT_GRAMS = 65; // weight per unit
const DEFAULT_UNIT_PRICE_NZD = 20;    // declared value per unit, NZD
const PACKAGING_GRAMS = 50;           // added once to the package total

export type EShipResult = {
  starshipitOrderId: number;
  dashboardUrl: string;
  carrier: string;
  service: string;
  weightKg: number;
};

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "StarShipIT-Api-Key": process.env.NZPOST_ESHIP_API_KEY ?? "",
    "Ocp-Apim-Subscription-Key": process.env.NZPOST_ESHIP_SUBSCRIPTION_KEY ?? "",
  };
}

// Package dimensions matched to NZPost courier pack sizes
function dimsForPairs(pairs: number) {
  if (pairs <= 2) return { length: 22, width: 11, height: 2  }; // DLE
  if (pairs <= 3) return { length: 22, width: 16, height: 4  }; // A5
  if (pairs <= 6) return { length: 32, width: 22, height: 5  }; // A4
  return               { length: 40, width: 27, height: 8  }; // Foolscap
}

export type EShipItem = {
  sku: string;
  description: string;
  quantity: number;
  unit_price: number;
};

export async function createEShipShipment({
  orderNumber,
  shippingAddress: addr,
  totalPairs,
  items = [],
}: {
  orderNumber: number;
  shippingAddress: ShippingAddress;
  totalPairs: number;
  items?: EShipItem[];
}): Promise<EShipResult> {
  if (!process.env.NZPOST_ESHIP_API_KEY) {
    throw new Error("NZPOST_ESHIP_API_KEY is not set");
  }

  // Package total = (units × per-unit grams) + packaging, in kg. Uses the same per-unit
  // weight as the line items so the item weights and the package total add up.
  const weightKg = parseFloat(((totalPairs * DEFAULT_UNIT_WEIGHT_GRAMS + PACKAGING_GRAMS) / 1000).toFixed(3));
  const dims = dimsForPairs(totalPairs);

  const country = addr?.country ?? "";
  const isNZ = country === "NZ" || country.toLowerCase() === "new zealand" || country === "";
  const nzService = nzCarrierForPairs(totalPairs);
  const carrierName = isNZ ? "MyNZPost Business" : "NZ Post International";
  const carrierServiceCode = isNZ ? nzService.code : "IECON";

  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      order: {
        order_date: new Date().toISOString(),
        order_number: String(orderNumber),
        carrier_name: carrierName,
        carrier_service_code: carrierServiceCode,
        destination: {
          name: `${addr.first_name} ${addr.last_name}`,
          phone: addr.phone || "",
          street: addr.line1,
          suburb: addr.line2 || "",
          city: addr.city,
          state: addr.region || "",
          post_code: addr.postcode,
          country: addr.country,
          country_code: addr.country.length === 2 ? addr.country.toUpperCase() : "NZ",
        },
        packages: [{
          weight: weightKg,
          ...dims,
        }],
        items: items.map((item) => ({
          sku: item.sku,
          description: item.description,
          quantity: item.quantity,
          weight: DEFAULT_UNIT_WEIGHT_GRAMS / 1000, // kg → lands as 65 g per unit
          unit_price: DEFAULT_UNIT_PRICE_NZD,        // $20 NZD per unit
        })),
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eShip request failed (${res.status}): ${text}`);
  }

  const data = await res.json();

  // "Order Exists" is acceptable — order was previously created
  if (!data.success) {
    const err = data.errors?.[0];
    if (err?.message !== "Order Exists") {
      throw new Error(`eShip error: ${err?.message ?? JSON.stringify(data.errors)}`);
    }
  }

  const order = data.order ?? {};

  return {
    starshipitOrderId: order.order_id ?? 0,
    dashboardUrl: "https://eship.nzpost.co.nz/Members/Orders",
    carrier: order.carrier_name ?? carrierName,
    service: order.packages?.[0]?.carrier_service_name ?? (isNZ ? nzService.name : "Economy"),
    weightKg,
  };
}
