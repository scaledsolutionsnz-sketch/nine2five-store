"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export function KoruIntro() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("koru_shown")) return;
    sessionStorage.setItem("koru_shown", "1");
    setVisible(true);
    const t1 = setTimeout(() => setFading(true), 2400);
    const t2 = setTimeout(() => setVisible(false), 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#030F07",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: fading ? "none" : "all",
      }}
    >
      <style>{`
        @keyframes koruFadeIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes koruGlow {
          0%,100% { filter: drop-shadow(0 0 12px rgba(46,139,40,0.3)); }
          50%     { filter: drop-shadow(0 0 40px rgba(46,139,40,0.85)) drop-shadow(0 0 80px rgba(46,139,40,0.35)); }
        }
        @keyframes fadeUpText {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBlink {
          0%,100% { opacity: 0.15; }
          50%     { opacity: 0.7; }
        }

        .koru-img-wrap {
          animation:
            koruFadeIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards,
            koruGlow 1.6s 0.6s ease-in-out infinite;
        }
        .koru-label {
          opacity: 0;
          animation: fadeUpText 0.55s cubic-bezier(0.16,1,0.3,1) 0.5s forwards;
        }
        .koru-dots span {
          display: inline-block;
          width: 4px; height: 4px; border-radius: 50%;
          background: #2E8B28;
          animation: dotBlink 1.1s ease infinite;
        }
        .koru-dots span:nth-child(2) { animation-delay: 0.18s; }
        .koru-dots span:nth-child(3) { animation-delay: 0.36s; }
      `}</style>

      <div className="koru-img-wrap">
        <Image
          src="/koru.png"
          alt="Koru"
          width={180}
          height={180}
          priority
          style={{ display: "block" }}
        />
      </div>

      <div className="koru-label" style={{ marginTop: 28, textAlign: "center" }}>
        <p style={{
          fontFamily: "var(--font-outfit, sans-serif)",
          fontSize: 12, fontWeight: 900, letterSpacing: "0.4em",
          color: "rgba(255,255,255,0.9)", textTransform: "uppercase",
          marginBottom: 10,
        }}>
          NINE<span style={{ color: "#2E8B28" }}>2</span>FIVE
        </p>
        <div className="koru-dots" style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
