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
    <div
      className="bg-white rounded-2xl border border-gray-200/80"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      {/* Header */}
      <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: "1px solid #f0f2f5" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
          style={{ backgroundColor: "#f0fdf4", border: "1px solid #dcfce7" }}
        >
          {flag}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[14px] text-gray-900 leading-none">{region}</p>
          <p className="text-[12px] text-gray-400 mt-0.5 leading-none">{sublabel}</p>
        </div>
        <div
          className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium"
          style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7" }}
        >
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
              style={{ backgroundColor: i % 2 === 0 ? "#fafafa" : "transparent" }}
            >
              <div className="flex items-center gap-2.5">
                <Package style={{ width: 13, height: 13, color: "#9ca3af" }} strokeWidth={1.8} />
                <span className="text-[13px] text-gray-600">{tier.label}</span>
              </div>
              <span className="text-[13px] font-semibold text-gray-900">
                ${(tier.cost / 100).toFixed(2)} NZD
              </span>
            </div>
          ))}
          <div
            className="flex items-center justify-between py-2.5 px-3 rounded-xl"
            style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}
          >
            <div className="flex items-center gap-2.5">
              <Package style={{ width: 13, height: 13, color: "#ef4444" }} strokeWidth={1.8} />
              <span className="text-[13px] text-red-600">13+ pairs</span>
            </div>
            <span className="text-[12px] font-medium text-red-500">Contact for rates</span>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div
        className="px-6 py-3 rounded-b-2xl text-[11px] text-gray-400"
        style={{ borderTop: "1px solid #f0f2f5", backgroundColor: "#fafbfc" }}
      >
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
        <h2 className="text-[22px] font-bold text-gray-900 leading-none tracking-tight">Settings</h2>
        <p className="text-[13px] text-gray-400 mt-1.5 leading-none">Manage your store configuration</p>
      </div>

      {/* Shipping section */}
      <div
        className="bg-white rounded-2xl border border-gray-200/80"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
      >
        <div className="px-7 py-5 flex items-center gap-3" style={{ borderBottom: "1px solid #f0f2f5" }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#f0fdf4", border: "1px solid #dcfce7" }}
          >
            <Globe style={{ width: 16, height: 16, color: "#16a34a" }} strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-semibold text-[15px] text-gray-900 leading-none">Shipping rates</p>
            <p className="text-[12px] text-gray-400 mt-0.5 leading-none">
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
