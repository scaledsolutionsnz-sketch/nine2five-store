"use client";

import { useCart } from "@/lib/cart-context";

export function BundleNudge() {
  const { count } = useCart();

  let msg: { strong: string; rest: string } | null = null;

  if (count === 0) {
    msg = { strong: "$25 each.", rest: "2 pairs $48 · 3 pairs $69 · 5 pairs $105 with free NZ shipping." };
  } else if (count === 1) {
    msg = { strong: "Add one more:", rest: "2 pairs drops to $24 each — save $2." };
  } else if (count === 2) {
    msg = { strong: "2 pairs — $24 each.", rest: "Add one more to drop to $23 per pair." };
  } else if (count === 3 || count === 4) {
    msg = { strong: `${count} pairs — $23 each.`, rest: `Add ${5 - count} more to drop to $21 per pair and get free NZ shipping.` };
  } else {
    msg = { strong: "5 pairs — $21 each.", rest: "Free NZ shipping, priority dispatch, and a free design card. Sorted." };
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
