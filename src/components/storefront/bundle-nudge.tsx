"use client";

import { useCart } from "@/lib/cart-context";

export function BundleNudge() {
  const { count } = useCart();

  let msg: { strong: string; rest: string } | null = null;

  if (count === 0) {
    msg = { strong: "Bundle & save:", rest: "2 pairs $55 · 3 pairs $75 · 5 pairs $105 ($21/pair)" };
  } else if (count === 1) {
    msg = { strong: "Add 1 more pair → save $9.", rest: "Bundle discount applied automatically at checkout." };
  } else if (count === 2) {
    msg = { strong: "$9 bundle discount active.", rest: "Add 1 more pair → save $21 total." };
  } else if (count >= 3 && count < 5) {
    msg = { strong: "$21 bundle discount active.", rest: `Add ${5 - count} more pair${5 - count > 1 ? "s" : ""} → save $55 total ($21/pair).` };
  } else {
    msg = { strong: "$55 bundle discount active.", rest: "$21/pair — best value unlocked." };
  }

  return (
    <div style={{
      background: "rgba(46,139,40,0.08)",
      border: "1px solid rgba(46,139,40,0.2)",
      borderRadius: 10,
      padding: "10px 14px",
      marginBottom: 20,
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}>
      <span style={{ color: "#2E8B28", fontSize: 13, flexShrink: 0 }}>✦</span>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5 }}>
        <strong style={{ color: "#2E8B28" }}>{msg.strong}</strong>{" "}{msg.rest}
      </p>
    </div>
  );
}
