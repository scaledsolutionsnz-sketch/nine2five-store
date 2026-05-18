"use client";

import { Globe, Package } from "lucide-react";

type Tier = { label: string; cost: number };

const NZ_TIERS: Tier[] = [
  { label: "1–2 pairs",  cost: 500  },
  { label: "3 pairs",    cost: 600  },
  { label: "4–6 pairs",  cost: 800  },
  { label: "7–12 pairs", cost: 1500 },
];

const AU_TIERS: Tier[] = [
  { label: "1–2 pairs",  cost: 1500 },
  { label: "3–4 pairs",  cost: 1600 },
  { label: "5–6 pairs",  cost: 2000 },
  { label: "7–12 pairs", cost: 3000 },
];

function RegionCard({
  flag,
  region,
  sublabel,
  delivery,
  tiers,
}: {
  flag: string;
  region: string;
  sublabel: string;
  delivery: string;
  tiers: Tier[];
}) {
  return (
    <div className="rounded-[14px] bg-white border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
      {/* Header */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-[#E2E8F0]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-[#EAF2FF] border border-[#BBD3FF]">
          {flag}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[14px] text-[#1F2937] leading-none">{region}</p>
          <p className="text-[12px] text-[#6B7280] mt-0.5 leading-none">{sublabel}</p>
        </div>
        <div className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#D5F1E2] text-[#166B3B]">
          {delivery}
        </div>
      </div>

      {/* Tier table */}
      <div className="px-6 py-4">
        <div className="space-y-1">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl"
              style={{ backgroundColor: i % 2 === 0 ? "#F3F5F8" : "transparent" }}
            >
              <div className="flex items-center gap-2.5">
                <Package style={{ width: 13, height: 13, color: "#8A94A6" }} strokeWidth={1.8} />
                <span className="text-[13px] text-[#334155]">{tier.label}</span>
              </div>
              <span className="text-[13px] font-semibold text-[#1F2937] font-mono">
                ${(tier.cost / 100).toFixed(2)} NZD
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5]">
            <div className="flex items-center gap-2.5">
              <Package style={{ width: 13, height: 13, color: "#991B1B" }} strokeWidth={1.8} />
              <span className="text-[13px] text-[#991B1B]">13+ pairs</span>
            </div>
            <span className="text-[12px] font-medium text-[#991B1B]/80">Contact for rates</span>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="px-6 py-3 rounded-b-xl text-[11px] text-[#8A94A6] border-t border-[#E2E8F0] bg-[#F3F5F8]">
        Based on 70g per pair · automatic weight calculation
      </div>
    </div>
  );
}

export function ShippingSettingsClient() {
  return (
    <div className="space-y-6">
      {/* Shipping section */}
      <div className="rounded-[14px] bg-white border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <div className="px-7 py-5 flex items-center gap-3 border-b border-[#E2E8F0]">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#EAF2FF] border border-[#BBD3FF]">
            <Globe style={{ width: 16, height: 16, color: "#116DFF" }} strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-semibold text-[15px] text-[#1F2937] leading-none">Shipping rates</p>
            <p className="text-[12px] text-[#6B7280] mt-0.5 leading-none">
              Weight-based tiered rates · 70g per pair
            </p>
          </div>
        </div>

        <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-5">
          <RegionCard
            flag="🇳🇿"
            region="Domestic (NZ)"
            sublabel="New Zealand standard shipping"
            delivery="2–4 business days"
            tiers={NZ_TIERS}
          />
          <RegionCard
            flag="🇦🇺"
            region="Australia"
            sublabel="Australia standard shipping"
            delivery="5–10 business days"
            tiers={AU_TIERS}
          />
        </div>
      </div>
    </div>
  );
}
