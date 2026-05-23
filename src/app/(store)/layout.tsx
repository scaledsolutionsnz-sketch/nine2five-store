import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { AffiliateTracker } from "@/components/storefront/affiliate-tracker";
import { VisitorTracker } from "@/components/storefront/visitor-tracker";
import { Pixels } from "@/components/analytics/pixels";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Pixels
        metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID ?? null}
        ga4Id={process.env.NEXT_PUBLIC_GA4_ID ?? null}
        tiktokPixelId={process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ?? null}
      />
      <Nav />
      <Suspense>
        <AffiliateTracker />
      </Suspense>
      <VisitorTracker />
      <main style={{ paddingTop: "68px", overflowX: "hidden" }}>{children}</main>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <style>{`
        .ft-link {
          color: rgba(255,255,255,0.38);
          text-decoration: none;
          transition: color 0.25s;
        }
        .ft-link:hover { color: #ffffff; }
        .ft-link-green {
          color: rgba(255,255,255,0.38);
          text-decoration: none;
          transition: color 0.25s;
        }
        .ft-link-green:hover { color: #2E8B28; }
        .ft-social {
          color: rgba(255,255,255,0.25);
          text-decoration: none;
          transition: color 0.25s;
        }
        .ft-social:hover { color: #2E8B28; }
        .ft-bottom-social {
          color: rgba(255,255,255,0.2);
          text-decoration: none;
          transition: color 0.25s;
        }
        .ft-bottom-social:hover { color: #ffffff; }
      `}</style>

      <footer
        style={{
          backgroundColor: "#06150C",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="max-w-[1320px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20"
          style={{ paddingTop: "3rem", paddingBottom: "2.5rem" }}
        >
          {/* Brand row — full width on mobile */}
          <div style={{ marginBottom: "clamp(28px, 6vw, 48px)" }}>
            <p
              className="font-display font-black"
              style={{ fontSize: "1.4rem", letterSpacing: "-0.01em", color: "#ffffff", marginBottom: 8 }}
            >
              NINE<span style={{ color: "#2E8B28" }}>2</span>FIVE
            </p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
              Māori grip socks. Wear your identity.<br style={{ display: "none" }} />
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}> Masterton, New Zealand</span>
            </p>
            <div className="flex items-center gap-5">
              {[
                { href: "https://instagram.com/nine2five.nz", label: "IG" },
                { href: "https://tiktok.com/@nine2five.nz", label: "TT" },
                { href: "https://www.facebook.com/profile.php?id=61563357785307", label: "FB" },
              ].map(({ href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="ft-social font-bold"
                  style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns — 2-up on mobile, 3-up on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8" style={{ marginBottom: "clamp(28px, 6vw, 48px)" }}>
            {/* Shop */}
            <div>
              <p className="font-bold uppercase" style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>Shop</p>
              <ul className="space-y-3">
                <li><a href="/shop" className="ft-link" style={{ fontSize: 13 }}>All Products</a></li>
                <li><a href="/shop" className="ft-link" style={{ fontSize: 13 }}>Kahotea</a></li>
                <li><a href="/shop" className="ft-link" style={{ fontSize: 13 }}>Limited Drops</a></li>
                <li><a href="/shop" className="ft-link" style={{ fontSize: 13 }}>Performance</a></li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <p className="font-bold uppercase" style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>Info</p>
              <ul className="space-y-3">
                <li><a href="/shipping" className="ft-link" style={{ fontSize: 13 }}>Shipping</a></li>
                <li><a href="/returns" className="ft-link" style={{ fontSize: 13 }}>Returns</a></li>
                <li><a href="/privacy" className="ft-link" style={{ fontSize: 13 }}>Privacy Policy</a></li>
                <li><a href="/contact" className="ft-link" style={{ fontSize: 13 }}>Contact Us</a></li>
              </ul>
            </div>

            {/* Contact — spans both cols on mobile */}
            <div className="col-span-2 md:col-span-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "clamp(20px,4vw,0px)" }}>
              <p className="font-bold uppercase" style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>Get In Touch</p>
              <a href="mailto:nine2five.co.nz@gmail.com" className="ft-link-green" style={{ fontSize: 13, display: "block", marginBottom: 10 }}>
                nine2five.co.nz@gmail.com
              </a>
              <a href="https://instagram.com/nine2five.nz" target="_blank" rel="noopener noreferrer" className="ft-link" style={{ fontSize: 13, display: "block" }}>
                @nine2five.nz
              </a>
            </div>
          </div>

          {/* Bottom row */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}
          >
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", letterSpacing: "0.02em" }}>
              © {new Date().getFullYear()} Nine2Five Limited. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              {[
                { href: "https://instagram.com/nine2five.nz", label: "Instagram" },
                { href: "https://tiktok.com/@nine2five.nz", label: "TikTok" },
                { href: "https://www.facebook.com/profile.php?id=61563357785307", label: "Facebook" },
              ].map(({ href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="ft-bottom-social" style={{ fontSize: 11, letterSpacing: "0.04em" }}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
