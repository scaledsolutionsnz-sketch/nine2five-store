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
    <div className="bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base bg-[#4ade80]/[0.08] border border-[#4ade80]/20">
          {flag}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[14px] text-white leading-none">{region}</p>
          <p className="text-[12px] text-white/40 mt-0.5 leading-none">{sublabel}</p>
        </div>
        <div className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#4ade80]/[0.08] text-[#4ade80] border border-[#4ade80]/20">
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
              style={{ backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}
            >
              <div className="flex items-center gap-2.5">
                <Package style={{ width: 13, height: 13, color: "rgba(244,244,245,0.25)" }} strokeWidth={1.8} />
                <span className="text-[13px] text-white/60">{tier.label}</span>
              </div>
              <span className="text-[13px] font-semibold text-white font-mono">
                ${(tier.cost / 100).toFixed(2)} NZD
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-red-400/[0.06] border border-red-400/15">
            <div className="flex items-center gap-2.5">
              <Package style={{ width: 13, height: 13, color: "#f87171" }} strokeWidth={1.8} />
              <span className="text-[13px] text-red-400">13+ pairs</span>
            </div>
            <span className="text-[12px] font-medium text-red-400/70">Contact for rates</span>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="px-6 py-3 rounded-b-xl text-[11px] text-white/25 border-t border-white/[0.04] bg-white/[0.01]">
        Based on 70g per pair · automatic weight calculation
      </div>
    </div>
  );
}

export function ShippingSettingsClient() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-[22px] font-bold text-white leading-none tracking-tight">Settings</h2>
        <p className="text-[13px] text-white/40 mt-1.5 leading-none">Manage your store configuration</p>
      </div>

      {/* Shipping section */}
      <div className="bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-7 py-5 flex items-center gap-3 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#4ade80]/[0.08] border border-[#4ade80]/20">
            <Globe style={{ width: 16, height: 16, color: "#4ade80" }} strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-semibold text-[15px] text-white leading-none">Shipping rates</p>
            <p className="text-[12px] text-white/40 mt-0.5 leading-none">
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
