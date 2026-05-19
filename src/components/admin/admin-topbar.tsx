"use client";

import Link from "next/link";
import { Search, Bell, MessageSquare, ExternalLink } from "lucide-react";

export function AdminTopbar() {
  return (
    <header
      className="shrink-0 flex items-center justify-between gap-4 sticky top-0 z-20 h-[72px] px-6"
      style={{ backgroundColor: "#171C26", borderBottom: "1px solid #262D3A" }}
    >
      {/* Left: brand label */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-[#4ade80]">
          <span className="font-bold text-black text-[9px] tracking-tight leading-none">N2F</span>
        </div>
        <span className="text-[14px] font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
          Nine2Five
        </span>
      </div>

      {/* Right: search + icons */}
      <div className="flex items-center gap-2">
        {/* Search pill — flex wrapper, no icon overlap */}
        <div
          className="hidden md:flex items-center gap-2.5 h-[40px] w-[380px] px-4 rounded-full transition-all"
          style={{ backgroundColor: "#202633", border: "1px solid #374151" }}
          onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(17,109,255,0.5)"; }}
          onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = "#374151"; }}
        >
          <Search
            className="pointer-events-none shrink-0"
            style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }}
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 min-w-0 text-[13px] bg-transparent placeholder:text-white/25 text-white focus:outline-none"
          />
        </div>

        <div className="h-5 w-px hidden md:block mx-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />

        {/* View store */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 h-[40px] px-[14px] rounded-full text-[13px] font-medium transition-all"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLElement).style.color = "#fff";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
          }}
        >
          <ExternalLink style={{ width: 13, height: 13 }} strokeWidth={2} />
          Store
        </Link>

        {/* Messages */}
        <button
          className="h-[40px] w-[40px] rounded-full flex items-center justify-center transition-all"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.5)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
          }}
        >
          <MessageSquare style={{ width: 15, height: 15 }} strokeWidth={1.8} />
        </button>

        {/* Notifications */}
        <button
          className="h-[40px] w-[40px] rounded-full flex items-center justify-center transition-all"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.5)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
          }}
        >
          <Bell style={{ width: 15, height: 15 }} strokeWidth={1.8} />
        </button>

        {/* Avatar */}
        <div className="h-[42px] w-[42px] rounded-full flex items-center justify-center shrink-0 cursor-pointer bg-[#35E879]">
          <span className="text-[12px] text-[#0B1210] font-bold leading-none">W</span>
        </div>
      </div>
    </header>
  );
}
