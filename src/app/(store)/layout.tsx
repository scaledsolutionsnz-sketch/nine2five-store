import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { AffiliateTracker } from "@/components/storefront/affiliate-tracker";
import { VisitorTracker } from "@/components/storefront/visitor-tracker";
import { Pixels } from "@/components/analytics/pixels";
import { KoruIntro } from "@/components/storefront/koru-intro";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <KoruIntro />
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
        .ft-link { color: rgba(255,255,255,0.42); text-decoration: none; font-size: 14px; line-height: 1; display: block; padding: 7px 0; transition: color 0.2s; }
        .ft-link:hover { color: #ffffff; }
        .ft-link-green { color: rgba(255,255,255,0.42); text-decoration: none; font-size: 14px; display: block; padding: 7px 0; transition: color 0.2s; }
        .ft-link-green:hover { color: #2E8B28; }
        .ft-social-link { color: rgba(255,255,255,0.3); text-decoration: none; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; transition: color 0.2s; }
        .ft-social-link:hover { color: #2E8B28; }
        .ft-footer { background-color: #06150C; border-top: 1px solid rgba(255,255,255,0.07); }
        .ft-inner { max-width: 1280px; margin: 0 auto; padding: 56px 48px 40px; }
        .ft-grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        .ft-col-head { font-size: 9px; font-weight: 900; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.22); margin-bottom: 20px; }
        .ft-bottom { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 24px; gap: 16px; }
        .ft-bottom-social { color: rgba(255,255,255,0.2); text-decoration: none; font-size: 11px; letter-spacing: 0.05em; transition: color 0.2s; }
        .ft-bottom-social:hover { color: #ffffff; }
        @media (max-width: 1024px) { .ft-inner { padding: 48px 36px 36px; } .ft-grid { grid-template-columns: 1fr 1fr; gap: 40px 32px; } }
        @media (max-width: 640px) {
          .ft-inner { padding: 44px 24px 32px; }
          .ft-grid { grid-template-columns: 1fr 1fr; gap: 36px 20px; }
          .ft-brand-col { grid-column: span 2; text-align: center; }
          .ft-brand-col .ft-social-row { justify-content: center; }
          .ft-contact-col { grid-column: span 2; text-align: center; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 32px; }
          .ft-contact-col .ft-link, .ft-contact-col .ft-link-green { display: inline-block; }
          .ft-bottom { flex-direction: column; align-items: center; text-align: center; gap: 14px; padding-top: 20px; }
          .ft-link { font-size: 14px; padding: 8px 0; }
        }
      `}</style>

      <footer className="ft-footer">
        <div className="ft-inner">
          <div className="ft-grid">

            {/* Brand column */}
            <div className="ft-brand-col">
              <p
                className="font-display font-black"
                style={{ fontSize: "1.45rem", letterSpacing: "-0.02em", color: "#ffffff", marginBottom: 10 }}
              >
                NINE<span style={{ color: "#2E8B28" }}>2</span>FIVE
              </p>
              <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 13, lineHeight: 1.65, marginBottom: 6 }}>
                Māori grip socks.
              </p>
              <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 13, lineHeight: 1.65, marginBottom: 24 }}>
                Wear your identity.
              </p>
              <div className="ft-social-row" style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 6 }}>
                {[
                  { href: "https://instagram.com/nine2five.nz", label: "Instagram" },
                  { href: "https://tiktok.com/@nine2five.nz", label: "TikTok" },
                  { href: "https://www.facebook.com/profile.php?id=61563357785307", label: "Facebook" },
                ].map(({ href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="ft-social-link">
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <p className="ft-col-head">Shop</p>
              <a href="/shop" className="ft-link">All Products</a>
              <a href="/shop" className="ft-link">Kahotea</a>
              <a href="/shop" className="ft-link">Limited Drops</a>
              <a href="/shop" className="ft-link">Performance</a>
            </div>

            {/* Info */}
            <div>
              <p className="ft-col-head">Info</p>
              <a href="/shipping" className="ft-link">Shipping</a>
              <a href="/returns" className="ft-link">Returns</a>
              <a href="/privacy" className="ft-link">Privacy Policy</a>
              <a href="/contact" className="ft-link">Contact Us</a>
            </div>

            {/* Contact */}
            <div className="ft-contact-col">
              <p className="ft-col-head">Get In Touch</p>
              <a href="mailto:nine2five.co.nz@gmail.com" className="ft-link-green">nine2five.co.nz@gmail.com</a>
              <a href="https://instagram.com/nine2five.nz" target="_blank" rel="noopener noreferrer" className="ft-link">@nine2five.nz</a>
              <p style={{ marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.2)", lineHeight: 1.5 }}>Masterton, New Zealand</p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="ft-bottom">
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", letterSpacing: "0.01em" }}>
              © {new Date().getFullYear()} Nine2Five Limited. All rights reserved.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              {[
                { href: "https://instagram.com/nine2five.nz", label: "Instagram" },
                { href: "https://tiktok.com/@nine2five.nz", label: "TikTok" },
                { href: "https://www.facebook.com/profile.php?id=61563357785307", label: "Facebook" },
              ].map(({ href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="ft-bottom-social">
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
