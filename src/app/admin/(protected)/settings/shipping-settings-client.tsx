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
    <div style={{
      borderRadius: 14,
      background: "rgba(8,28,16,0.92)",
      border: "1px solid rgba(255,255,255,0.09)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: 16,
          background: "rgba(47,155,47,0.1)",
          border: "1px solid rgba(47,155,47,0.2)",
        }}>
          {flag}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: "#ffffff", lineHeight: 1 }}>{region}</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2, lineHeight: 1 }}>{sublabel}</p>
        </div>
        <div style={{
          flexShrink: 0, padding: "6px 12px", borderRadius: 999,
          fontSize: 11, fontWeight: 600,
          background: "rgba(47,155,47,0.12)",
          color: "#2f9b2f",
          border: "1px solid rgba(47,155,47,0.2)",
        }}>
          {delivery}
        </div>
      </div>

      {/* Tier table */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tiers.map((tier, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 12px", borderRadius: 10,
                background: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Package style={{ width: 13, height: 13, color: "rgba(255,255,255,0.35)" }} strokeWidth={1.8} />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{tier.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", fontFamily: "monospace" }}>
                ${(tier.cost / 100).toFixed(2)} NZD
              </span>
            </div>
          ))}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px", borderRadius: 10,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Package style={{ width: 13, height: 13, color: "rgba(239,68,68,0.7)" }} strokeWidth={1.8} />
              <span style={{ fontSize: 13, color: "rgba(239,68,68,0.85)" }}>13+ pairs</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(239,68,68,0.7)" }}>Contact for rates</span>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div style={{
        padding: "10px 24px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
        fontSize: 11,
        color: "rgba(255,255,255,0.35)",
        borderRadius: "0 0 14px 14px",
      }}>
        Based on 70g per pair · automatic weight calculation
      </div>
    </div>
  );
}

export function ShippingSettingsClient() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Shipping section */}
      <div style={{
        borderRadius: 14,
        background: "rgba(8,28,16,0.92)",
        border: "1px solid rgba(255,255,255,0.09)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            background: "rgba(47,155,47,0.1)",
            border: "1px solid rgba(47,155,47,0.2)",
          }}>
            <Globe style={{ width: 16, height: 16, color: "#2f9b2f" }} strokeWidth={1.8} />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: "#ffffff", lineHeight: 1 }}>Shipping rates</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3, lineHeight: 1 }}>
              Weight-based tiered rates · 70g per pair
            </p>
          </div>
        </div>

        <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
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
