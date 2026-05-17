import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

/* ─── Fallback products (6 items) ───────────────────────────── */
const FALLBACK_PRODUCTS = [
  { name: "Grey Kahotea",   price: 2000, badge: null,      compare: null },
  { name: "Toa Whenua",     price: 2000, badge: "New",     compare: null },
  { name: "Pasifika",       price: 1800, badge: "Limited", compare: 2200 },
  { name: "Black Kahotea",  price: 2000, badge: null,      compare: null },
  { name: "Ahi Kaa",        price: 1800, badge: "Sale",    compare: 2400 },
  { name: "Ataahua White",  price: 2000, badge: "New",     compare: null },
];

/* ─── Collections ───────────────────────────────────────────── */
const COLLECTIONS = [
  {
    name: "Kahotea Collection",
    tag: "Signature",
    desc: "Our original. Crafted from deep cultural roots and worn with pride.",
    href: "/shop?collection=kahotea",
    image: "https://images.unsplash.com/photo-1614632537190-23e4e1fef59a?w=800&q=80",
  },
  {
    name: "Limited Drops",
    tag: "Drop",
    desc: "Rare releases. Once they're gone, they're gone.",
    href: "/shop?collection=limited",
    image: "https://images.unsplash.com/photo-1556906781-9a412961a28c?w=800&q=80",
  },
  {
    name: "Performance Range",
    tag: "Training",
    desc: "Built for the gym, track, and the field. Grip where it matters.",
    href: "/shop?collection=performance",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
  },
  {
    name: "Teamwear",
    tag: "Custom",
    desc: "Kit your whole crew. Custom orders available.",
    href: "/shop?collection=teamwear",
    image: "https://images.unsplash.com/photo-1529518969858-8baa65152fc8?w=800&q=80",
  },
];

/* ─── Testimonials ──────────────────────────────────────────── */
const TESTIMONIALS = [
  { quote: "These socks have become part of my game day ritual. Nothing else comes close.", name: "James T.", sport: "Rugby" },
  { quote: "Finally a brand that celebrates who we are. Wore them to my first club match.", name: "Aroha W.", sport: "Touch Rugby" },
  { quote: "Quality is next level. I wear them to every session — gym, training, all of it.", name: "Marcus P.", sport: "Gym" },
  { quote: "My whole team ordered matching sets. Looks fire on the field.", name: "Tama K.", sport: "Club Rugby" },
  { quote: "Perfect fit and grip. Best pilates socks I have ever tried. 10/10.", name: "Sarah M.", sport: "Pilates" },
  { quote: "Proud to wear my identity on the field. Every. Single. Game.", name: "Daniel R.", sport: "School Sport" },
];

/* ─── Data fetch ────────────────────────────────────────────── */
async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select("*").eq("active", true).limit(6);
    return (data ?? []) as Product[];
  } catch {
    return [];
  }
}

/* ─── Page ──────────────────────────────────────────────────── */
export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const hasProducts = featured.length > 0;

  return (
    <>
      {/* Global styles for this page */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.35; transform: scaleY(1); }
          50%       { opacity: 0.85; transform: scaleY(1.08); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .hero-anim-1 { animation: heroFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .hero-anim-2 { animation: heroFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.38s both; }
        .hero-anim-3 { animation: heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.56s both; }
        .hero-anim-4 { animation: heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.72s both; }
        .hero-anim-5 { animation: heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 1.0s both; }
        .scroll-pulse { animation: scrollPulse 2.2s ease-in-out infinite; }
        .marquee-track { animation: marquee 22s linear infinite; }

        /* Collection card image zoom */
        .coll-card { overflow: hidden; position: relative; border-radius: 1rem; }
        .coll-card img { transition: transform 0.75s cubic-bezier(0.16,1,0.3,1) !important; }
        .coll-card:hover img { transform: scale(1.06) !important; }

        /* Product card lift */
        .prod-card {
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .prod-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 28px 56px rgba(74, 222, 128, 0.06);
        }
        .prod-card img { transition: transform 0.7s cubic-bezier(0.16,1,0.3,1) !important; }
        .prod-card:hover img { transform: scale(1.05) !important; }

        /* Footer link hover */
        .footer-link { color: rgba(255,255,255,0.38); transition: color 0.25s; }
        .footer-link:hover { color: #ffffff; }
        .footer-social { color: rgba(255,255,255,0.25); transition: color 0.25s; }
        .footer-social:hover { color: #4ade80; }
      `}</style>

      <div style={{ backgroundColor: "#000000", color: "#ffffff" }}>

        {/* ════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden"
          style={{ minHeight: "100dvh" }}
        >
          {/* Full-bleed image */}
          <div className="absolute inset-0">
            <Image
              src="https://static.wixstatic.com/media/0d9f9d_8ccff4ed0c7140d9855c18abbd3f7553~mv2.jpeg/v1/fill/w_1400,h_1800,al_c,q_85/0d9f9d_8ccff4ed0c7140d9855c18abbd3f7553~mv2.jpeg"
              alt="Nine2Five athlete wearing Māori grip socks"
              fill
              className="object-cover object-center"
              priority
              unoptimized
            />
            {/* Bottom-up dark fade */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, #000000 0%, rgba(0,0,0,0.65) 38%, rgba(0,0,0,0.18) 100%)",
              }}
            />
            {/* Left-side fade for text */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.28) 55%, transparent 100%)",
              }}
            />
          </div>

          {/* Green atmospheric glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 640,
              height: 420,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(74,222,128,0.09) 0%, transparent 70%)",
              filter: "blur(48px)",
            }}
          />

          {/* Content — bottom-left */}
          <div
            className="absolute z-10 px-8 md:px-16"
            style={{
              bottom: 0,
              left: 0,
              right: 0,
              paddingBottom: "clamp(3rem, 7dvh, 6rem)",
            }}
          >
            <div className="hero-anim-1 flex items-center gap-2 mb-6">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#4ade80",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: "0.4em",
                  color: "#4ade80",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Masterton, NZ · Est. 2024
              </span>
            </div>

            <h1
              className="font-display font-black text-white hero-anim-2"
              style={{
                fontSize: "clamp(3.8rem, 10vw, 10rem)",
                lineHeight: 0.85,
                letterSpacing: "-0.02em",
              }}
            >
              GRIP UP.<br />STAND PROUD.
            </h1>

            <p
              className="text-white/50 hero-anim-3"
              style={{
                fontSize: "clamp(1rem, 1.5vw, 1.125rem)",
                lineHeight: 1.65,
                maxWidth: 440,
                marginTop: "1.5rem",
              }}
            >
              Māori grip socks built for sport, movement, and identity.
            </p>

            <div
              className="hero-anim-4 flex flex-wrap items-center gap-4"
              style={{ marginTop: "2.5rem" }}
            >
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 font-bold text-sm uppercase"
                style={{
                  backgroundColor: "#4ade80",
                  color: "#000000",
                  borderRadius: 9999,
                  padding: "1rem 2rem",
                  letterSpacing: "0.08em",
                  transition: "background-color 0.3s",
                  textDecoration: "none",
                }}
              >
                Shop Collection <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/shop?collection=limited"
                className="inline-flex items-center gap-2 font-medium text-sm uppercase text-white"
                style={{
                  border: "1px solid rgba(255,255,255,0.22)",
                  borderRadius: 9999,
                  padding: "1rem 2rem",
                  letterSpacing: "0.08em",
                  transition: "border-color 0.3s, background-color 0.3s",
                  textDecoration: "none",
                }}
              >
                View Limited Drop
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            className="hero-anim-5 absolute z-10 right-8 md:right-16 hidden md:flex flex-col items-center gap-2"
            style={{ bottom: "clamp(3rem, 7dvh, 6rem)" }}
          >
            <div
              className="scroll-pulse"
              style={{
                width: 1,
                height: 64,
                background:
                  "linear-gradient(to bottom, rgba(74,222,128,0.7), transparent)",
              }}
            />
            <span
              style={{
                fontSize: 9,
                letterSpacing: "0.28em",
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                writingMode: "vertical-rl",
              }}
            >
              Scroll
            </span>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            MARQUEE BAND
        ════════════════════════════════════════════ */}
        <div
          style={{
            backgroundColor: "#4ade80",
            overflow: "hidden",
            padding: "13px 0",
          }}
        >
          <div
            className="marquee-track flex items-center"
            style={{ width: "max-content" }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center">
                {[
                  "GRIP UP",
                  "STAND PROUD",
                  "UNAPOLOGETICALLY MĀORI",
                  "WEAR YOUR IDENTITY",
                  "MASTERTON, NZ",
                  "EST. 2024",
                ].map((word) => (
                  <span
                    key={`${copy}-${word}`}
                    className="font-display font-black"
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.2em",
                      color: "#000000",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      padding: "0 2.5rem",
                    }}
                  >
                    {word}
                    <span
                      style={{
                        marginLeft: "2.5rem",
                        opacity: 0.35,
                      }}
                    >
                      ·
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════
            COLLECTIONS
        ════════════════════════════════════════════ */}
        <section style={{ backgroundColor: "#000000", padding: "7rem 0" }}>
          <div className="max-w-screen-xl mx-auto px-8 md:px-16">

            <div className="mb-14">
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.35em",
                  color: "#4ade80",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                New Arrivals
              </p>
              <h2
                className="font-display font-black text-white"
                style={{
                  fontSize: "clamp(2.4rem, 5vw, 3.5rem)",
                  lineHeight: 0.9,
                  letterSpacing: "-0.01em",
                }}
              >
                COLLECTIONS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {COLLECTIONS.map((col) => (
                <Link
                  key={col.name}
                  href={col.href}
                  className="coll-card block"
                  style={{ height: "clamp(300px, 40vw, 540px)" }}
                >
                  <Image
                    src={col.image}
                    alt={col.name}
                    fill
                    className="object-cover object-center"
                    unoptimized
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.38) 48%, transparent 100%)",
                    }}
                  />
                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-7 md:p-8">
                    <p
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.3em",
                        color: "#4ade80",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        marginBottom: 10,
                      }}
                    >
                      {col.tag}
                    </p>
                    <h3
                      className="font-display font-black text-white"
                      style={{
                        fontSize: "clamp(1.35rem, 2.5vw, 1.85rem)",
                        lineHeight: 1,
                        letterSpacing: "-0.01em",
                        marginBottom: 8,
                      }}
                    >
                      {col.name.toUpperCase()}
                    </h3>
                    <p
                      className="text-white/50 text-sm leading-relaxed"
                      style={{ maxWidth: 320, marginBottom: 16 }}
                    >
                      {col.desc}
                    </p>
                    <span
                      className="inline-flex items-center gap-1.5 font-semibold text-white text-sm"
                      style={{ letterSpacing: "0.04em" }}
                    >
                      Explore <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            BRAND STORY — split layout
        ════════════════════════════════════════════ */}
        <section style={{ backgroundColor: "#0a0a0a" }}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: image */}
            <div className="relative" style={{ minHeight: 520 }}>
              <Image
                src="https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800&q=80"
                alt="Athlete in motion representing the Nine2Five identity"
                fill
                className="object-cover object-center"
                unoptimized
              />
              {/* Subtle green overlay */}
              <div
                className="absolute inset-0"
                style={{ background: "rgba(74,222,128,0.03)" }}
              />
              {/* Right-side fade into section bg */}
              <div
                className="absolute inset-0 hidden md:block"
                style={{
                  background:
                    "linear-gradient(to right, transparent 55%, #0a0a0a 100%)",
                }}
              />
            </div>

            {/* Right: content */}
            <div
              className="flex flex-col justify-center p-10 md:p-16 lg:p-20"
            >
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.35em",
                  color: "#4ade80",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 18,
                }}
              >
                Our Vision
              </p>
              <h2
                className="font-display font-black text-white"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.25rem)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.01em",
                  marginBottom: 2,
                }}
              >
                UNAPOLOGETICALLY
              </h2>
              <h2
                className="font-display font-black"
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.25rem)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.01em",
                  color: "#4ade80",
                  marginBottom: 28,
                }}
              >
                MĀORI
              </h2>
              <p
                className="leading-relaxed"
                style={{
                  color: "rgba(255,255,255,0.48)",
                  maxWidth: 420,
                  marginBottom: 16,
                }}
              >
                We create products shaped by whakapapa, tikanga, and movement. Every design is a statement of pride — built for athletes who carry their identity into every space they enter.
              </p>
              <p
                className="leading-relaxed"
                style={{
                  color: "rgba(255,255,255,0.3)",
                  maxWidth: 420,
                  fontStyle: "italic",
                  marginBottom: 36,
                }}
              >
                &ldquo;We&rsquo;re not adding Māori identity to sportswear. We are sportswear.&rdquo;
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 font-bold text-sm uppercase self-start"
                style={{
                  backgroundColor: "#4ade80",
                  color: "#000000",
                  borderRadius: 9999,
                  padding: "1rem 2rem",
                  letterSpacing: "0.08em",
                  textDecoration: "none",
                  transition: "background-color 0.3s",
                }}
              >
                Shop the Collection <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            PRODUCT GRID
        ════════════════════════════════════════════ */}
        <section style={{ backgroundColor: "#000000", padding: "7rem 0" }}>
          <div className="max-w-screen-xl mx-auto px-8 md:px-16">

            <div
              className="flex items-end justify-between mb-12"
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.35em",
                    color: "#4ade80",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  Our Products
                </p>
                <h2
                  className="font-display font-black text-white"
                  style={{
                    fontSize: "clamp(2rem, 4vw, 3.25rem)",
                    lineHeight: 0.9,
                    letterSpacing: "-0.01em",
                  }}
                >
                  SHOP THE RANGE
                </h2>
              </div>
              <Link
                href="/shop"
                className="footer-link flex items-center gap-1.5 font-semibold text-sm uppercase shrink-0 ml-4"
                style={{ letterSpacing: "0.06em", textDecoration: "none" }}
              >
                View All <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {hasProducts
                ? featured.map((p) => <LiveCard key={p.id} product={p} />)
                : FALLBACK_PRODUCTS.map((p) => (
                    <FallbackCard key={p.name} {...p} />
                  ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            STATS
        ════════════════════════════════════════════ */}
        <section
          style={{
            backgroundColor: "#0a0a0a",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="max-w-screen-xl mx-auto px-8 md:px-16">
            <div
              className="grid grid-cols-2 md:grid-cols-4"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.07)" }}
            >
              {[
                { num: "100K+", label: "Pairs Sold" },
                { num: "9+",    label: "Designs" },
                { num: "NZ",    label: "Made & Owned" },
                { num: "5 / 5", label: "Customer Rating" },
              ].map(({ num, label }) => (
                <div
                  key={label}
                  className="px-8 py-12 text-center"
                  style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <p
                    className="font-display font-black"
                    style={{
                      fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
                      color: "#4ade80",
                      lineHeight: 1,
                      marginBottom: 8,
                    }}
                  >
                    {num}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      color: "rgba(255,255,255,0.28)",
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            TESTIMONIALS — horizontal scroll
        ════════════════════════════════════════════ */}
        <section
          style={{
            backgroundColor: "#0a0a0a",
            padding: "5rem 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="max-w-screen-xl mx-auto px-8 md:px-16 mb-10">
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.35em",
                color: "#4ade80",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Community
            </p>
            <h2
              className="font-display font-black text-white"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
              }}
            >
              WORN BY THE CULTURE
            </h2>
          </div>

          {/* Scrollable strip */}
          <div
            className="scrollbar-hide"
            style={{
              display: "flex",
              gap: 20,
              overflowX: "auto",
              padding: "0 2rem 1rem",
              scrollSnapType: "x mandatory",
            }}
          >
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                style={{
                  minWidth: 298,
                  maxWidth: 320,
                  flexShrink: 0,
                  backgroundColor: "#111111",
                  borderRadius: 16,
                  padding: "1.75rem",
                  scrollSnapAlign: "start",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Stars */}
                <div
                  className="flex items-center gap-0.5"
                  style={{ marginBottom: 16 }}
                >
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className="fill-current"
                      style={{ color: "#4ade80", width: 13, height: 13 }}
                    />
                  ))}
                </div>
                {/* Quote */}
                <p
                  style={{
                    color: "rgba(255,255,255,0.68)",
                    fontSize: 14,
                    lineHeight: 1.65,
                    marginBottom: 20,
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                {/* Attribution */}
                <div>
                  <p
                    className="font-semibold text-white"
                    style={{ fontSize: 14 }}
                  >
                    {t.name}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#4ade80",
                      marginTop: 3,
                    }}
                  >
                    {t.sport}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            CTA CLOSER
        ════════════════════════════════════════════ */}
        <section
          style={{
            backgroundColor: "#000000",
            padding: "9rem 0",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            className="max-w-screen-xl mx-auto px-8 md:px-16 text-center"
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.35em",
                color: "#4ade80",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              Nine2Five Limited
            </p>
            <h2
              className="font-display font-black text-white"
              style={{
                fontSize: "clamp(3.5rem, 9vw, 8rem)",
                lineHeight: 0.87,
                letterSpacing: "-0.025em",
                marginBottom: 24,
              }}
            >
              GRIP UP.<br />STAND PROUD.
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.32)",
                fontSize: 16,
                maxWidth: 360,
                margin: "0 auto 3rem",
                lineHeight: 1.65,
              }}
            >
              Māori grip socks. Masterton, New Zealand.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 font-bold text-sm uppercase"
              style={{
                backgroundColor: "#4ade80",
                color: "#000000",
                borderRadius: 9999,
                padding: "1.1rem 2.6rem",
                letterSpacing: "0.08em",
                textDecoration: "none",
                transition: "background-color 0.3s",
              }}
            >
              Shop Now <ArrowUpRight className="h-4 w-4" />
            </Link>

            <div
              className="flex flex-wrap items-center justify-center gap-8 mt-14 pt-10"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {[
                {
                  label: "Instagram",
                  href: "https://instagram.com/nine2five.nz",
                },
                {
                  label: "TikTok",
                  href: "https://tiktok.com/@nine2five.nz",
                },
                {
                  label: "Facebook",
                  href: "https://www.facebook.com/profile.php?id=61563357785307",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social text-sm font-medium"
                  style={{ letterSpacing: "0.06em", textDecoration: "none" }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

/* ─── Live product card ───────────────────────────────────────── */
function LiveCard({ product }: { product: Product }) {
  const img = product.image_urls?.[0];
  const isOnSale =
    product.compare_at_price && product.compare_at_price > product.price;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="prod-card group block overflow-hidden rounded-2xl"
      style={{
        backgroundColor: "#111111",
        textDecoration: "none",
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "4 / 5",
          background:
            "radial-gradient(ellipse at 50% 88%, rgba(74,222,128,0.13) 0%, #0d0d0d 62%)",
        }}
      >
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-end justify-center pb-8"
          >
            <span
              className="font-display font-black text-center px-4 leading-none"
              style={{ color: "rgba(255,255,255,0.13)", fontSize: 13 }}
            >
              {product.name.toUpperCase()}
            </span>
          </div>
        )}
        {isOnSale && (
          <span
            className="absolute top-3 left-3 font-black uppercase"
            style={{
              backgroundColor: "#ffffff",
              color: "#000000",
              fontSize: 10,
              letterSpacing: "0.1em",
              padding: "0.25rem 0.7rem",
              borderRadius: 9999,
            }}
          >
            Sale
          </span>
        )}
      </div>
      <div className="p-4 pb-5">
        <p
          className="font-bold text-white text-sm truncate"
          style={{ marginBottom: 4 }}
        >
          {product.name}
        </p>
        <div className="flex items-center gap-2">
          <p
            className="font-bold text-sm"
            style={{ color: "#4ade80" }}
          >
            ${(product.price / 100).toFixed(2)}
          </p>
          {isOnSale && (
            <p
              className="text-xs line-through"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              ${(product.compare_at_price! / 100).toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Fallback product card ──────────────────────────────────── */
function FallbackCard({
  name,
  price,
  badge,
  compare,
}: {
  name: string;
  price: number;
  badge: string | null;
  compare: number | null;
}) {
  return (
    <Link
      href="/shop"
      className="prod-card group block overflow-hidden rounded-2xl"
      style={{
        backgroundColor: "#111111",
        textDecoration: "none",
      }}
    >
      <div
        className="relative overflow-hidden flex items-end justify-center pb-8"
        style={{
          aspectRatio: "4 / 5",
          background:
            "radial-gradient(ellipse at 50% 85%, rgba(74,222,128,0.14) 0%, #0d0d0d 60%)",
        }}
      >
        {badge && (
          <span
            className="absolute top-3 left-3 font-black uppercase"
            style={{
              backgroundColor: "#ffffff",
              color: "#000000",
              fontSize: 10,
              letterSpacing: "0.1em",
              padding: "0.25rem 0.7rem",
              borderRadius: 9999,
            }}
          >
            {badge}
          </span>
        )}
        <span
          className="font-display font-black text-center px-4 leading-none"
          style={{ color: "rgba(255,255,255,0.13)", fontSize: 13 }}
        >
          {name.toUpperCase()}
        </span>
      </div>
      <div className="p-4 pb-5">
        <p
          className="font-bold text-white text-sm truncate"
          style={{ marginBottom: 4 }}
        >
          {name}
        </p>
        <div className="flex items-center gap-2">
          <p
            className="font-bold text-sm"
            style={{ color: "#4ade80" }}
          >
            ${(price / 100).toFixed(2)}
          </p>
          {compare && (
            <p
              className="text-xs line-through"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              ${(compare / 100).toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
