"use client";

import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";

export function AdminTopbar() {
  return (
    <header
      className="shrink-0 flex items-center justify-between gap-4 sticky top-0 z-20 h-[64px] px-7"
      style={{ backgroundColor: "#06150C", borderBottom: "1px solid rgba(46,139,40,0.15)" }}
    >
      {/* Search */}
      <div
        className="hidden md:flex items-center gap-2.5 h-[38px] w-[340px] px-4 rounded-xl transition-all"
        style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(47,155,47,0.5)"; }}
        onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
      >
        <Search style={{ width: 13, height: 13, color: "rgba(255,255,255,0.25)", flexShrink: 0 }} strokeWidth={2} />
        <input
          type="text"
          placeholder="Search orders, customers..."
          className="flex-1 min-w-0 bg-transparent text-white focus:outline-none"
          style={{ fontSize: 13, color: "#fff" }}
        />
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* View store */}
        <Link
          href="/"
          target="_blank"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            height: 36, padding: "0 14px", borderRadius: 999,
            fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            backgroundColor: "rgba(47,155,47,0.12)",
            border: "1px solid rgba(47,155,47,0.25)",
            color: "#2f9b2f",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(47,155,47,0.22)";
            (e.currentTarget as HTMLElement).style.color = "#4dc44d";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(47,155,47,0.12)";
            (e.currentTarget as HTMLElement).style.color = "#2f9b2f";
          }}
        >
          <ExternalLink style={{ width: 12, height: 12 }} strokeWidth={2.5} />
          View Store
        </Link>
      </div>
    </header>
  );
}
