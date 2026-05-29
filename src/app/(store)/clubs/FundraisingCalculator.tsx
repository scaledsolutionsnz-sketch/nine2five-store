"use client";

import { useState } from "react";

export default function FundraisingCalculator() {
  const [pairs, setPairs] = useState(50);
  const [retailPrice, setRetailPrice] = useState(32);

  const costPerPair = pairs >= 100 ? 10 : 12;
  const totalCost = pairs * costPerPair;
  const totalRevenue = pairs * retailPrice;
  const clubKeeps = totalRevenue - totalCost;

  return (
    <div style={{ position: "relative" }}>

      {/* Coming soon overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        background: "rgba(6,21,12,0.65)",
        backdropFilter: "blur(2px)",
        borderRadius: 20,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 10,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: "0.25em",
          textTransform: "uppercase", color: "#2E8B28",
          background: "rgba(46,139,40,0.12)", border: "1px solid rgba(46,139,40,0.25)",
          padding: "5px 14px", borderRadius: 999,
        }}>
          Coming Soon
        </span>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>
          Calculator launching with club orders
        </p>
      </div>

      {/* Calculator UI (visible but locked) */}
      <div style={{
        background: "#0d1f12", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20, padding: "2.5rem",
        opacity: 0.5, pointerEvents: "none", userSelect: "none",
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2E8B28", marginBottom: 24 }}>
          Fundraising Calculator
        </p>

        {/* Pairs slider */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Pairs ordered
            </label>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#ffffff" }}>{pairs}</span>
          </div>
          <input
            type="range" min={50} max={300} step={10} value={pairs}
            onChange={e => setPairs(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#2E8B28", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>50 pairs</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>300 pairs</span>
          </div>
        </div>

        {/* Retail price */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Your retail price
            </label>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#ffffff" }}>${retailPrice}</span>
          </div>
          <input
            type="range" min={25} max={45} step={1} value={retailPrice}
            onChange={e => setRetailPrice(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#2E8B28", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>$25</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>$45</span>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              Your cost <span style={{ fontSize: 11 }}>({pairs} × ${costPerPair}/pair)</span>
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>${totalCost.toLocaleString()}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              Club revenue <span style={{ fontSize: 11 }}>({pairs} × ${retailPrice})</span>
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>${totalRevenue.toLocaleString()}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#ffffff" }}>Your club keeps</p>
            <p style={{ fontSize: 26, fontWeight: 900, color: "#2E8B28" }}>${clubKeeps.toLocaleString()}</p>
          </div>
        </div>

        {pairs >= 100 && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 16, lineHeight: 1.6 }}>
            100+ pairs unlocks $10/pair wholesale pricing.
          </p>
        )}
      </div>
    </div>
  );
}
