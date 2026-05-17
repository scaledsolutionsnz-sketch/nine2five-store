import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { AffiliateTracker } from "@/components/storefront/affiliate-tracker";
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
      <main className="pt-16">{children}</main>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer
        style={{
          backgroundColor: "#000000",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="max-w-screen-xl mx-auto px-8 md:px-16"
          style={{ paddingTop: "4rem", paddingBottom: "4rem" }}
        >
          {/* Top grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

            {/* Col 1: Brand */}
            <div className="md:col-span-1">
              <p
                className="font-display font-black"
                style={{ fontSize: "1.5rem", letterSpacing: "-0.01em", color: "#ffffff", marginBottom: 12 }}
              >
                NINE2FIVE
              </p>
              <p
                className="leading-relaxed"
                style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 6 }}
              >
                Māori grip socks.<br />Wear your identity.
              </p>
              <p
                style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginBottom: 24 }}
              >
                Masterton, New Zealand
              </p>
              <div className="flex items-center gap-5">
                {[
                  { label: "IG", href: "https://instagram.com/nine2five.nz", full: "Instagram" },
                  { label: "TT", href: "https://tiktok.com/@nine2five.nz", full: "TikTok" },
                  { label: "FB", href: "https://www.facebook.com/profile.php?id=61563357785307", full: "Facebook" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.full}
                    className="font-bold"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      color: "rgba(255,255,255,0.3)",
                      textTransform: "uppercase",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#4ade80"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.3)"; }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Shop */}
            <div>
              <p
                className="font-bold uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  color: "rgba(255,255,255,0.25)",
                  marginBottom: 20,
                }}
              >
                Shop
              </p>
              <ul className="space-y-3">
                {[
                  { label: "All Products", href: "/shop" },
                  { label: "Kahotea", href: "/shop?collection=kahotea" },
                  { label: "Limited Drops", href: "/shop?collection=limited" },
                  { label: "Performance", href: "/shop?collection=performance" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm"
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.4)"; }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Info */}
            <div>
              <p
                className="font-bold uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  color: "rgba(255,255,255,0.25)",
                  marginBottom: 20,
                }}
              >
                Info
              </p>
              <ul className="space-y-3">
                {[
                  { label: "Our Vision", href: "/#vision" },
                  { label: "Shipping", href: "/shipping" },
                  { label: "Contact", href: "mailto:nine2five.co.nz@gmail.com" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm"
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.4)"; }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div>
              <p
                className="font-bold uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  color: "rgba(255,255,255,0.25)",
                  marginBottom: 20,
                }}
              >
                Contact
              </p>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:nine2five.co.nz@gmail.com"
                    className="text-sm"
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#4ade80"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.4)"; }}
                  >
                    nine2five.co.nz@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com/nine2five.nz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm"
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.4)"; }}
                  >
                    @nine2five.nz
                  </a>
                </li>
                <li>
                  <span
                    className="text-sm"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    Mon – Fri, 9am – 5pm NZST
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom row */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-14 pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.02em",
              }}
            >
              © {new Date().getFullYear()} Nine2Five Limited. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {[
                { label: "Instagram", href: "https://instagram.com/nine2five.nz" },
                { label: "TikTok", href: "https://tiktok.com/@nine2five.nz" },
                { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61563357785307" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs"
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    transition: "color 0.3s",
                    letterSpacing: "0.04em",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.2)"; }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
