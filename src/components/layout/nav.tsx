"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Clubs", href: "/clubs" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

export function Nav() {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[#07180E]/95 backdrop-blur-md border-b border-[rgba(46,139,40,0.18)]"
            : "bg-[#07180E] border-b border-[rgba(255,255,255,0.08)]"
        )}
      >
        {/* ── Mobile nav ── */}
        <div
          className="md:hidden flex items-center justify-between max-w-[1280px] mx-auto"
          style={{ height: 64, paddingLeft: 20, paddingRight: 20 }}
        >
          <Link
            href="/"
            className="font-display font-black leading-none"
            style={{ fontSize: 22, letterSpacing: "-0.04em", color: "#ffffff", textDecoration: "none", zIndex: 51, position: "relative" }}
          >
            NINE<span style={{ color: "#2f9b2f" }}>2</span>FIVE
          </Link>

          <div className="flex items-center" style={{ gap: 8 }}>
            <Link
              href="/cart"
              style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, color: "#c8c8c0", textDecoration: "none", zIndex: 51, flexShrink: 0 }}
            >
              <ShoppingBag style={{ width: 19, height: 19 }} />
              {count > 0 && (
                <span style={{
                  position: "absolute", top: 4, right: 4,
                  width: 14, height: 14, borderRadius: "50%",
                  background: "#2E8B28", color: "#fff",
                  fontSize: 9, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1, pointerEvents: "none",
                }}>
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            <button
              onClick={() => setOpen(!open)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: open ? "rgba(46,139,40,0.15)" : "transparent",
                color: open ? "#2E8B28" : "#c8c8c0",
                border: open ? "1px solid rgba(46,139,40,0.3)" : "1px solid transparent",
                cursor: "pointer", zIndex: 51, position: "relative",
              }}
            >
              <div style={{ transition: "transform 0.3s ease", transform: open ? "rotate(90deg)" : "rotate(0deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {open ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
              </div>
            </button>
          </div>
        </div>

        {/* ── Desktop nav links — anchored to full-width header, not inner container ── */}
        <nav
          className="hidden md:flex items-center"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            top: 0,
            height: 72,
            gap: 40,
            zIndex: 52,
          }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={label} href={href} className="text-sm font-medium text-[#c8c8c0] hover:text-white transition-colors tracking-wide">
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop logo + cart row ── */}
        <div
          className="hidden md:flex items-center h-[72px] w-full max-w-[1280px] mx-auto"
          style={{
            paddingLeft: "clamp(20px, 4vw, 48px)",
            paddingRight: "clamp(20px, 4vw, 48px)",
          }}
        >
          <Link
            href="/"
            className="font-display font-black leading-none"
            style={{ fontSize: 24, letterSpacing: "-0.04em", color: "#ffffff", textDecoration: "none" }}
          >
            NINE<span style={{ color: "#2f9b2f" }}>2</span>FIVE
          </Link>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
            <Link
              href="/cart"
              className="relative flex items-center justify-center h-9 w-9 rounded-xl hover:bg-white/[0.06] transition-colors text-[#c8c8c0] hover:text-white"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#2E8B28] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Sun-burst overlay ── */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 45,
          background: "#060F08",
          clipPath: open
            ? "circle(200vmax at calc(100% - 28px) 32px)"
            : "circle(0px at calc(100% - 28px) 32px)",
          transition: "clip-path 0.65s cubic-bezier(0.77, 0, 0.175, 1)",
          pointerEvents: open ? "all" : "none",
        }}
      >
        {/* Sunburst rays — conic gradient from the button origin */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "conic-gradient(from 0deg at calc(100% - 28px) 32px, " +
              "transparent 0deg, rgba(46,139,40,0.045) 8deg, transparent 16deg, " +
              "rgba(46,139,40,0.045) 24deg, transparent 32deg, " +
              "rgba(46,139,40,0.045) 40deg, transparent 48deg, " +
              "rgba(46,139,40,0.045) 56deg, transparent 64deg, " +
              "rgba(46,139,40,0.045) 72deg, transparent 80deg, " +
              "rgba(46,139,40,0.045) 88deg, transparent 96deg, " +
              "rgba(46,139,40,0.045) 104deg, transparent 112deg, " +
              "rgba(46,139,40,0.045) 120deg, transparent 128deg, " +
              "rgba(46,139,40,0.045) 136deg, transparent 144deg, " +
              "rgba(46,139,40,0.045) 152deg, transparent 160deg, " +
              "rgba(46,139,40,0.045) 168deg, transparent 180deg)",
            pointerEvents: "none",
            opacity: open ? 1 : 0,
            transition: "opacity 0.4s ease 0.2s",
          }}
        />

        {/* Radial glow from corner */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at calc(100% + 40px) -40px, rgba(46,139,40,0.25) 0%, transparent 55%)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            height: "100%",
            padding: "0 clamp(32px, 9vw, 60px)",
          }}
        >
          {/* Label */}
          <p
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "#2E8B28",
              marginBottom: 44,
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.35s ease 0.3s, transform 0.35s ease 0.3s",
            }}
          >
            Navigation
          </p>

          {/* Nav links */}
          {NAV_LINKS.map(({ label, href }, i) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                fontSize: "clamp(3.2rem, 15vw, 5.5rem)",
                fontWeight: 900,
                fontFamily: "var(--font-outfit), sans-serif",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "#F7F7F2",
                textDecoration: "none",
                display: "block",
                marginBottom: "clamp(14px, 3.5vw, 24px)",
                opacity: open ? 1 : 0,
                transform: open ? "translateX(0)" : "translateX(-28px)",
                transition: `opacity 0.45s ease ${0.3 + i * 0.07}s, transform 0.45s cubic-bezier(0.22,1,0.36,1) ${0.3 + i * 0.07}s, color 0.2s`,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#2E8B28")}
              onMouseLeave={e => (e.currentTarget.style.color = "#F7F7F2")}
            >
              {label}
            </Link>
          ))}

          {/* Divider */}
          <div
            style={{
              width: 40,
              height: 2,
              background: "rgba(46,139,40,0.4)",
              marginTop: 44,
              marginBottom: 24,
              borderRadius: 2,
              opacity: open ? 1 : 0,
              transition: "opacity 0.4s ease 0.52s",
            }}
          />

          {/* Footer line */}
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.08em",
              opacity: open ? 1 : 0,
              transition: "opacity 0.4s ease 0.55s",
            }}
          >
            © Nine2Five NZ
          </p>
        </div>
      </div>
    </>
  );
}
