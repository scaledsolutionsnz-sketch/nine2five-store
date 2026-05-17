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
        .ft-link-green:hover { color: #4ade80; }
        .ft-social {
          color: rgba(255,255,255,0.25);
          text-decoration: none;
          transition: color 0.25s;
        }
        .ft-social:hover { color: #4ade80; }
        .ft-bottom-social {
          color: rgba(255,255,255,0.2);
          text-decoration: none;
          transition: color 0.25s;
        }
        .ft-bottom-social:hover { color: #ffffff; }
      `}</style>

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
                style={{
                  fontSize: "1.5rem",
                  letterSpacing: "-0.01em",
                  color: "#ffffff",
                  marginBottom: 12,
                }}
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
                <a
                  href="https://instagram.com/nine2five.nz"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="ft-social font-bold"
                  style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}
                >
                  IG
                </a>
                <a
                  href="https://tiktok.com/@nine2five.nz"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="ft-social font-bold"
                  style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}
                >
                  TT
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61563357785307"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="ft-social font-bold"
                  style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}
                >
                  FB
                </a>
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
                <li><a href="/shop" className="ft-link text-sm">All Products</a></li>
                <li><a href="/shop?collection=kahotea" className="ft-link text-sm">Kahotea</a></li>
                <li><a href="/shop?collection=limited" className="ft-link text-sm">Limited Drops</a></li>
                <li><a href="/shop?collection=performance" className="ft-link text-sm">Performance</a></li>
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
                <li><a href="/#vision" className="ft-link text-sm">Our Vision</a></li>
                <li><a href="/shipping" className="ft-link text-sm">Shipping</a></li>
                <li><a href="mailto:nine2five.co.nz@gmail.com" className="ft-link text-sm">Contact</a></li>
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
                    className="ft-link-green text-sm"
                  >
                    nine2five.co.nz@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com/nine2five.nz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ft-link text-sm"
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
              <a
                href="https://instagram.com/nine2five.nz"
                target="_blank"
                rel="noopener noreferrer"
                className="ft-bottom-social text-xs"
                style={{ letterSpacing: "0.04em" }}
              >
                Instagram
              </a>
              <a
                href="https://tiktok.com/@nine2five.nz"
                target="_blank"
                rel="noopener noreferrer"
                className="ft-bottom-social text-xs"
                style={{ letterSpacing: "0.04em" }}
              >
                TikTok
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61563357785307"
                target="_blank"
                rel="noopener noreferrer"
                className="ft-bottom-social text-xs"
                style={{ letterSpacing: "0.04em" }}
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
