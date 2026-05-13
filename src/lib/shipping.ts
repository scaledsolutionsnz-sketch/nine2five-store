export const SHIPPING_RATES = {
  NZ: { label: "NZ Standard", cost: 1600, freeThreshold: 7500 }, // cents
  AU: { label: "Australia Standard", cost: 2500, freeThreshold: null },
} as const;

export function calculateShipping(subtotalCents: number, country: string): number {
  if (country === "AU") return SHIPPING_RATES.AU.cost;
  const { cost, freeThreshold } = SHIPPING_RATES.NZ;
  return freeThreshold && subtotalCents >= freeThreshold ? 0 : cost;
}

export const NZ_REGIONS = [
  "Northland", "Auckland", "Waikato", "Bay of Plenty", "Gisborne",
  "Hawke's Bay", "Taranaki", "Manawatū-Whanganui", "Wellington",
  "Tasman", "Nelson", "Marlborough", "West Coast", "Canterbury",
  "Otago", "Southland",
];
