export const GRAMS_PER_PAIR = 70;

export type ShippingResult = {
  cost: number;
  isBulk: boolean;
  label: string;
  delivery: string;
};

// NZ prices from NZPost eShip + 15% markup, rounded to nearest cent
// DLE $5.81 × 1.15 = $6.68  (1–2 pairs)
// A5  $6.70 × 1.15 = $7.71  (3 pairs)
// A4  $8.48 × 1.15 = $9.75  (4–6 pairs)
// Foolscap $8.96 × 1.15 = $10.30  (7–12 pairs)
const NZ_TIERS = [
  { max: 2,  cost: 668,  service: "Courier Pack DLE" },
  { max: 3,  cost: 771,  service: "Courier Pack A5" },
  { max: 6,  cost: 975,  service: "Courier Pack A4" },
  { max: 12, cost: 1030, service: "Courier Pack Foolscap" },
];

const AU_TIERS = [
  { max: 2,  cost: 1500 },
  { max: 4,  cost: 1600 },
  { max: 6,  cost: 2000 },
  { max: 12, cost: 3000 },
];

export function calculateShippingByPairs(pairs: number, country: string): ShippingResult {
  if (pairs > 12) {
    return { cost: 0, isBulk: true, label: "", delivery: "" };
  }
  // Free NZ shipping on 5+ pairs (bundle perk)
  if (country === "NZ" && pairs >= 5) {
    return { cost: 0, isBulk: false, label: "NZ Standard — Free", delivery: "2–4 business days" };
  }
  const tiers = country === "AU" ? AU_TIERS : NZ_TIERS;
  const tier = tiers.find((t) => pairs <= t.max) ?? tiers[tiers.length - 1];
  return {
    cost: tier.cost,
    isBulk: false,
    label: country === "AU" ? "Australia Standard" : "NZ Standard",
    delivery: country === "AU" ? "5–10 business days" : "2–4 business days",
  };
}

export function nzCarrierForPairs(pairs: number): { name: string; code: string } {
  if (pairs <= 2) return { name: "Courier Pack DLE",      code: "CPOLDLE"  };
  if (pairs <= 3) return { name: "Courier Pack A5",       code: "CPOLTPA5" };
  if (pairs <= 6) return { name: "Courier Pack A4",       code: "CPOLTPA4" };
  return               { name: "Courier Pack Foolscap", code: "CPOLTFC"  };
}

// Legacy shim
export function calculateShipping(_subtotalCents: number, country: string): number {
  return calculateShippingByPairs(1, country).cost;
}

export const NZ_REGIONS = [
  "Northland", "Auckland", "Waikato", "Bay of Plenty", "Gisborne",
  "Hawke's Bay", "Taranaki", "Manawatū-Whanganui", "Wellington",
  "Tasman", "Nelson", "Marlborough", "West Coast", "Canterbury",
  "Otago", "Southland",
];
