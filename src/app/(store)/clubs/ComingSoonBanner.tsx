"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function ComingSoonBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div style={{
      background: "#2E8B28",
      padding: "11px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      position: "relative",
    }}>
      <span style={{
        fontSize: 11, fontWeight: 800, letterSpacing: "0.22em",
        color: "#ffffff", textTransform: "uppercase", textAlign: "center",
      }}>
        Coming Soon — Club orders launching shortly. Register your interest below.
      </span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{
          position: "absolute", right: 16,
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(255,255,255,0.7)", padding: 4, display: "flex",
          alignItems: "center", justifyContent: "center",
          borderRadius: 4, transition: "color 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
      >
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}
