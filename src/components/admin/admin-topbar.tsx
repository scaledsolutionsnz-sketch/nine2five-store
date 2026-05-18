"use client";

import Link from "next/link";
import { Search, Bell, MessageSquare, ExternalLink } from "lucide-react";

export function AdminTopbar() {
  return (
    <header
      className="shrink-0 flex items-center justify-between gap-4 sticky top-0 z-20 h-[64px] px-6"
      style={{ backgroundColor: "#171C26", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
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
        {/* Search pill */}
        <div className="relative hidden md:flex items-center">
          <Search
            className="absolute left-4 pointer-events-none"
            style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)" }}
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search..."
            className="h-10 w-[380px] pl-10 pr-4 text-[13px] rounded-full placeholder:text-white/25 text-white focus:outline-none transition-all"
            style={{
              backgroundColor: "#202633",
              border: "1px solid #363D4A",
            }}
            onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(74,222,128,0.4)"; }}
            onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = "#363D4A"; }}
          />
        </div>

        <div className="h-5 w-px hidden md:block mx-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />

        {/* View store */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-medium transition-all"
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
          className="h-9 w-9 rounded-full flex items-center justify-center transition-all"
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
          className="h-9 w-9 rounded-full flex items-center justify-center transition-all"
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
        <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer bg-[#4ade80]">
          <span className="text-[12px] text-black font-bold leading-none">W</span>
        </div>
      </div>
    </header>
  );
}
