"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        height: 38,
        padding: "0 16px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.08)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.18)",
        fontWeight: 700,
        fontSize: 13,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        transition: "background 0.2s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
    >
      <Printer style={{ width: 14, height: 14 }} />
      Print / PDF
    </button>
  );
}
