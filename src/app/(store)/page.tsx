import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import { getStaticProducts } from "@/lib/products";
import { HeroVideo } from "@/components/storefront/hero-video";
import { HomepageCard } from "@/components/storefront/homepage-card";

export const revalidate = 60;

/* ─── Fallback products (6 items) ───────────────────────────── */
const FALLBACK_PRODUCTS = [
  { name: "Grey Kahotea",  price: 2000, badge: null,      compare: null },
  { name: "Toa Whenua",    price: 2000, badge: "New",     compare: null },
  { name: "Pasifika",      price: 1800, badge: "Limited", compare: 2200 },
  { name: "Black Kahotea", price: 2000, badge: null,      compare: null },
  { name: "Ahi Kaa",       price: 1800, badge: "Sale",    compare: 2400 },
  { name: "Ataahua White", price: 2000, badge: "New",     compare: null },
];

/* ─── Collections ───────────────────────────────────────────── */
const COLLECTIONS = [
  {
    name: "Kahotea Collection",
    tag: "Signature",
    desc: "Our original. Crafted from deep cultural roots and worn with pride.",
    href: "/shop?collection=kahotea",
    image: "/products/black-kahotea/2.avif",
  },
  {
    name: "Limited Drops",
    tag: "Drop",
    desc: "Rare releases. Once they're gone, they're gone.",
    href: "/shop?collection=limited",
    image: "/products/pasifika/1.avif",
  },
  {
    name: "Performance Range",
    tag: "Training",
    desc: "Built for the gym, track, and the field. Grip where it matters.",
    href: "/shop?collection=performance",
    image: "/gallery/3.webp",
  },
  {
    name: "Teamwear",
    tag: "Custom",
    desc: "Kit your whole crew. Custom orders available.",
    href: "/shop?collection=teamwear",
    image: "/gallery/7.webp",
  },
];

/* ─── Testimonials ──────────────────────────────────────────── */
const TESTIMONIALS = [
  { quote: "Ordered a pair for myself, ended up buying three more for the boys. Grip is unreal and the design actually means something. Proud to wear these.", name: "James T.", sport: "Rugby · Wellington", date: "14 Apr 2025", initials: "JT", color: "#1a3d22" },
  { quote: "Finally a brand that gets it. Wore them to my first senior club match and got asked about them three times. Quality is legit.", name: "Aroha W.", sport: "Touch Rugby · Auckland", date: "2 May 2025", initials: "AW", color: "#0f2d1a" },
  { quote: "I train six days a week and these are the only grip socks I've stuck with. No slipping, no bunching. Worth every cent.", name: "Marcus P.", sport: "CrossFit · Hamilton", date: "29 Mar 2025", initials: "MP", color: "#1d3a14" },
  { quote: "Got matching sets for the whole squad. Coach actually commented on them. Looks fire and the grip held up through a full tournament.", name: "Tama K.", sport: "Club Rugby · Palmerston North", date: "18 Apr 2025", initials: "TK", color: "#142d0e" },
  { quote: "Best pilates socks I've ever worn — no joke. The grip panel placement is spot on and they don't lose shape after washing.", name: "Sarah M.", sport: "Pilates · Christchurch", date: "7 May 2025", initials: "SM", color: "#0e2a18" },
  { quote: "My son plays for his school team and absolutely loves them. Fast delivery too — arrived next day. Will be back for more.", name: "Lisa H.", sport: "School Sport · Tauranga", date: "22 Apr 2025", initials: "LH", color: "#1a3010" },
  { quote: "Wore them at regionals. People kept asking where I got them. The design is sick and they actually perform — not just a fashion thing.", name: "Daniel R.", sport: "Football · Dunedin", date: "11 May 2025", initials: "DR", color: "#162d0d" },
  { quote: "Third pair now. Gifted one to a mate and he's already ordered his own. The Kahotea design is genuinely beautiful. Stoked to support a local brand.", name: "Wiremu B.", sport: "Rugby League · Masterton", date: "5 May 2025", initials: "WB", color: "#1e3a1a" },
];

/* ─── Data fetch ────────────────────────────────────────────── */
async function getFeaturedProducts(): Promise<Product[]> {
  let products: Product[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: true });
    if (data?.length) products = data as Product[];
  } catch { /* ignore */ }
  if (!products.length) products = getStaticProducts();

  // Merge basic-black + basic-white into a single card
  const hasBlack = products.some((p) => p.slug === "basic-black");
  const hasWhite = products.some((p) => p.slug === "basic-white");
  if (hasBlack || hasWhite) {
    const merged: Product = {
      id: "basic",
      name: "Basic Grip Sock",
      slug: "basic",
      description: "No frills. Pure performance. Available in Black and White.",
      price: 2000,
      compare_at_price: 2500,
      image_urls: ["/products/basic-black/2.webp"],
      active: true,
      created_at: new Date().toISOString(),
    };
    products = [
      merged,
      ...products.filter((p) => p.slug !== "basic-black" && p.slug !== "basic-white"),
    ];
  }

  return products.slice(0, 6);
}

/* ─── Page ──────────────────────────────────────────────────── */
export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const hasProducts = featured.length > 0;

  return (
    <>
      {/* ─── Page-level CSS ─────────────────────────────────── */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.85; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* Hero staggered reveals */
        .h-a1 { animation: heroFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.20s both; }
        .h-a2 { animation: heroFadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.38s both; }
        .h-a3 { animation: heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.55s both; }
        .h-a4 { animation: heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.70s both; }
        .h-a5 { animation: heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.98s both; }

        /* Scroll indicator */
        .scroll-line { animation: scrollPulse 2.4s ease-in-out infinite; }

        /* Marquee */
        .mq-track { animation: marquee 22s linear infinite; }

        /* Collections section */
        .collections-section { width: 100%; overflow-x: hidden; background: #06150c; }
        .collections-container { max-width: 1280px; margin: 0 auto; padding: 64px 48px 90px; }
        .collections-header { margin-bottom: 32px; }
        .collections-label { color: #2f9b2f; font-size: 12px; font-weight: 700; letter-spacing: 0.35em; text-transform: uppercase; margin-bottom: 12px; }
        .collections-title { font-size: clamp(48px, 6vw, 82px); line-height: 0.95; margin: 0; color: #ffffff; font-weight: 800; }
        .collections-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px; align-items: stretch; }
        .collection-card {
          position: relative;
          min-height: 460px;
          border-radius: 22px;
          overflow: hidden;
          background: #07180e;
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          display: block;
          text-decoration: none;
        }
        .collection-card img { width: 100%; height: 100%; min-height: 460px; object-fit: cover; object-position: center; display: block; transition: transform 0.35s ease; }
        .collection-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 42%, rgba(0,0,0,0.05) 100%); z-index: 1; pointer-events: none; }
        .collection-card-content { position: absolute; left: 28px; right: 28px; bottom: 28px; z-index: 2; max-width: 520px; }
        .collection-card-label { color: #2f9b2f; font-size: 11px; font-weight: 800; letter-spacing: 0.32em; text-transform: uppercase; margin-bottom: 10px; }
        .collection-card-title { color: #ffffff; font-size: clamp(26px, 3vw, 36px); line-height: 1; margin: 0 0 12px; font-weight: 800; }
        .collection-card-description { color: rgba(255,255,255,0.72); font-size: 15px; line-height: 1.5; margin: 0 0 18px; max-width: 420px; }
        .collection-card-link { color: #ffffff; font-size: 15px; font-weight: 800; display: inline-flex; align-items: center; gap: 8px; }
        .collection-card:hover img { transform: scale(1.04); }
        .collection-card:hover .collection-card-link { color: #2f9b2f; }
        .explore-arrow { transition: transform 0.3s ease; display: inline-block; }
        .collection-card:hover .explore-arrow { transform: translateX(4px); }
        @media (max-width: 1024px) {
          .collections-container { padding: 56px 32px 80px; }
          .collections-grid { gap: 24px; }
          .collection-card, .collection-card img { min-height: 400px; }
        }
        @media (max-width: 700px) {
          .collections-container { padding: 42px 20px 64px; }
          .collections-grid { grid-template-columns: 1fr; gap: 22px; }
          .collection-card, .collection-card img { min-height: 380px; }
          .collection-card-content { left: 20px; right: 20px; bottom: 22px; }
        }

        /* Product card lift + image zoom */
        .prod-card {
          display: block;
          text-decoration: none;
          overflow: hidden;
          border-radius: 18px;
          background-color: #0e2314;
          border: 1px solid rgba(255,255,255,0.06);
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .prod-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px rgba(0,0,0,0.4);
        }
        .prod-card img {
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1) !important;
        }
        .prod-card:hover img { transform: scale(1.05) !important; }

        /* CTA button hover */
        .btn-green {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background-color: #2E8B28; color: #ffffff; text-decoration: none;
          font-weight: 700; font-size: 0.8125rem; text-transform: uppercase;
          letter-spacing: 0.08em; border-radius: 9999px;
          height: 56px; padding: 0 2rem;
          transition: background-color 0.3s;
          white-space: nowrap;
        }
        .btn-green:hover { background-color: #36A832; }

        .btn-outline-hero {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border: 1px solid rgba(255,255,255,0.22); color: #ffffff; text-decoration: none;
          font-weight: 500; font-size: 0.8125rem; text-transform: uppercase;
          letter-spacing: 0.08em; border-radius: 9999px;
          height: 56px; padding: 0 2rem;
          transition: border-color 0.3s, background-color 0.3s;
          white-space: nowrap;
        }
        .btn-outline-hero:hover {
          border-color: rgba(255,255,255,0.5);
          background-color: rgba(255,255,255,0.05);
        }

        .btn-green-sm {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background-color: #2E8B28; color: #ffffff; text-decoration: none;
          font-weight: 700; font-size: 0.8125rem; text-transform: uppercase;
          letter-spacing: 0.08em; border-radius: 9999px;
          height: 52px; padding: 0 2rem; align-self: flex-start;
          transition: background-color 0.3s;
        }
        .btn-green-sm:hover { background-color: #36A832; }

        .btn-green-lg {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background-color: #2E8B28; color: #ffffff; text-decoration: none;
          font-weight: 700; font-size: 0.8125rem; text-transform: uppercase;
          letter-spacing: 0.08em; border-radius: 9999px;
          height: 56px; padding: 0 2.6rem;
          transition: background-color 0.3s;
        }
        .btn-green-lg:hover { background-color: #36A832; }

        /* Shared page container */
        .page-container { max-width: 1280px; margin: 0 auto; padding-left: 48px; padding-right: 48px; }
        @media (max-width: 1024px) { .page-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 640px)  { .page-container { padding-left: 20px; padding-right: 20px; } }

        /* Section header row */
        .section-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
        .section-title { font-size: clamp(42px, 5vw, 72px); line-height: 0.95; margin: 0; color: #ffffff; font-weight: 900; letter-spacing: -0.04em; }
        .section-label { font-size: 11px; letter-spacing: 0.35em; color: #2E8B28; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
        .view-all-link { color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; white-space: nowrap; padding-bottom: 4px; }
        .view-all-link:hover { color: #2E8B28; }

        /* Homepage product grid */
        .hp-product-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; }
        @media (max-width: 1024px) { .hp-product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; } }
        @media (max-width: 640px)  { .hp-product-grid { grid-template-columns: 1fr; gap: 22px; } }

        /* Homepage gallery grid */
        .hp-gallery-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; }
        @media (max-width: 1024px) { .hp-gallery-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 640px)  { .hp-gallery-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .hp-gallery-item { position: relative; aspect-ratio: 1 / 0.75; overflow: hidden; border-radius: 10px; background: #07180e; border: 1px solid rgba(255,255,255,0.06); }
        .hp-gallery-item::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.05)); opacity: 0; transition: opacity 0.35s ease; pointer-events: none; }
        .hp-gallery-item:hover::after { opacity: 1; }
        .hp-gallery-item img { transition: transform 0.35s ease; width: 100%; height: 100%; object-fit: cover; }
        .hp-gallery-item:hover img { transform: scale(1.05); }

        /* Testimonials grid */
        .testimonials-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
        @media (max-width: 1024px) { .testimonials-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; } }
        @media (max-width: 640px)  { .testimonials-grid { grid-template-columns: 1fr; gap: 14px; } }
        .t-card { background:#0d1f12; border-radius:16px; padding:1.5rem; border:1px solid rgba(255,255,255,0.07); display:flex; flex-direction:column; gap:0; }
        .t-verified { display:inline-flex; align-items:center; gap:5px; background:rgba(46,139,40,0.12); color:#2E8B28; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:3px 8px; border-radius:999px; margin-bottom:12px; width:fit-content; }
        .t-stars { display:flex; align-items:center; gap:2px; margin-bottom:14px; }
        .t-quote { color:rgba(255,255,255,0.72); font-size:13.5px; line-height:1.65; margin-bottom:18px; flex:1; }
        .t-footer { display:flex; align-items:center; gap:10px; margin-top:auto; padding-top:14px; border-top:1px solid rgba(255,255,255,0.06); }
        .t-avatar { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; color:rgba(255,255,255,0.8); flex-shrink:0; letter-spacing:0.03em; }
        .t-name { font-size:13px; font-weight:700; color:#F7F7F2; line-height:1.2; }
        .t-sport { font-size:10px; font-weight:600; color:rgba(255,255,255,0.35); letter-spacing:0.06em; margin-top:2px; }
        .t-date { font-size:10px; color:rgba(255,255,255,0.22); margin-left:auto; white-space:nowrap; }

        /* Responsive hero heading */
        .hero-title {
          font-size: clamp(3.5rem, 7vw, 7rem);
          line-height: 0.92;
          letter-spacing: -0.02em;
        }
        @media (max-width: 768px) {
          .hero-title { font-size: clamp(2.625rem, 13vw, 3.625rem); }
        }

        /* Inline link hover (View All etc.) */
        .link-ghost {
          display: inline-flex; align-items: center; gap: 0.375rem;
          color: rgba(255,255,255,0.38); text-decoration: none;
          font-weight: 600; font-size: 0.8125rem; text-transform: uppercase;
          letter-spacing: 0.06em;
          transition: color 0.25s;
        }
        .link-ghost:hover { color: #2E8B28; }

        .social-link {
          color: rgba(255,255,255,0.25); text-decoration: none;
          font-size: 0.875rem; font-weight: 500; letter-spacing: 0.06em;
          transition: color 0.25s;
        }
        .social-link:hover { color: #ffffff; }

        .hero-content {
          max-width: 1280px;
          margin: 0 auto;
          padding-left: 72px;
          padding-right: 48px;
        }
        @media (max-width: 1024px) {
          .hero-content { padding-left: 40px; padding-right: 32px; }
        }
        @media (max-width: 640px) {
          .hero-content { padding-left: 22px; padding-right: 22px; }
        }
      `}</style>

      <div style={{ backgroundColor: "#06150C", color: "#ffffff" }}>

        {/* ════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════ */}
        <section className="relative overflow-hidden" style={{ minHeight: "100dvh" }}>

          {/* Full-bleed background — video on mobile, image on desktop */}
          <div className="absolute inset-0">
            {/* Mobile: video */}
            <HeroVideo />
            {/* Desktop: image */}
            <div className="hidden md:block absolute inset-0">
              <Image
                src="/hero-landing.avif"
                alt="Nine2Five athlete wearing Māori grip socks"
                fill
                className="object-cover object-center"
                priority
                unoptimized
              />
            </div>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, #06150C 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.1) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.52) 45%, rgba(0,0,0,0.25) 100%)",
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
                "radial-gradient(ellipse, rgba(58,119,34,0.09) 0%, transparent 70%)",
              filter: "blur(48px)",
            }}
          />

          {/* Content — bottom-left */}
          <div
            className="absolute z-10 left-0 right-0 bottom-0"
            style={{ paddingBottom: "clamp(3rem, 7dvh, 6rem)" }}
          >
            <div className="hero-content">
              <div className="h-a1 flex items-center gap-2 mb-5">
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#2E8B28",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.4em",
                    color: "#2E8B28",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  Masterton, NZ · Est. 2024
                </span>
              </div>

              <h1
                className="font-display font-black text-white h-a2 hero-title"
              >
                GRIP UP.<br />STAND PROUD.
              </h1>

              <p
                className="h-a3"
                style={{
                  color: "rgba(255,255,255,0.58)",
                  fontSize: "clamp(0.9375rem, 1.4vw, 1.0625rem)",
                  lineHeight: 1.65,
                  maxWidth: 400,
                  marginTop: "1.25rem",
                }}
              >
                Māori grip socks built for sport, movement, and identity.
              </p>

              <div
                className="h-a4 flex flex-wrap items-center gap-3"
                style={{ marginTop: "2rem" }}
              >
                <Link href="/shop" className="btn-green">
                  Shop Collection <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/shop?collection=limited" className="btn-outline-hero">
                  View Limited Drop
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            className="h-a5 absolute z-10 right-6 md:right-14 lg:right-20 hidden md:flex flex-col items-center gap-2"
            style={{ bottom: "clamp(3rem, 7dvh, 6rem)" }}
          >
            <div
              className="scroll-line"
              style={{
                width: 1,
                height: 64,
                background: "linear-gradient(to bottom, rgba(46,139,40,0.7), transparent)",
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
            backgroundColor: "#2E8B28",
            overflow: "hidden",
            padding: "14px 0",
          }}
        >
          <div
            className="mq-track flex items-center"
            style={{ width: "max-content", paddingLeft: "2.5rem" }}
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
                      color: "#ffffff",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      padding: "0 2.5rem",
                    }}
                  >
                    {word}
                    <span style={{ marginLeft: "2.5rem", opacity: 0.35 }}>·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════
            COLLECTIONS
        ════════════════════════════════════════════ */}
        <section className="collections-section">
          <div className="collections-container">
            <div className="collections-header">
              <p className="collections-label">New Arrivals</p>
              <h2 className="font-display collections-title">COLLECTIONS</h2>
            </div>

            <div className="collections-grid">
              {COLLECTIONS.map((col) => (
                <Link key={col.name} href={col.href} className="collection-card">
                  <Image
                    src={col.image}
                    alt={col.name}
                    fill
                    className="object-cover object-center"
                    unoptimized
                  />
                  <div className="collection-card-content">
                    <p className="collection-card-label">{col.tag}</p>
                    <h3 className="font-display collection-card-title">{col.name.toUpperCase()}</h3>
                    <p className="collection-card-description">{col.desc}</p>
                    <span className="collection-card-link">
                      Explore <span className="explore-arrow"><ArrowUpRight className="h-4 w-4" /></span>
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
        <section id="vision" style={{ backgroundColor: "#06150C" }}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: image */}
            <div className="relative" style={{ minHeight: 300 }}>
              <Image
                src="/gallery/21.webp"
                alt="Nine2Five socks in action"
                fill
                className="object-cover object-center"
                unoptimized
              />
              <div
                className="absolute inset-0"
                style={{ background: "rgba(58,119,34,0.03)" }}
              />
              <div
                className="absolute inset-0 hidden md:block"
                style={{
                  background:
                    "linear-gradient(to right, transparent 55%, #06150C 100%)",
                }}
              />
            </div>

            {/* Right: content */}
            <div className="flex flex-col justify-center px-6 py-12 sm:px-10 md:p-16 lg:p-20">
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.35em",
                  color: "#2E8B28",
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
                  color: "#2E8B28",
                  marginBottom: 28,
                }}
              >
                MĀORI
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.48)",
                  lineHeight: 1.7,
                  maxWidth: 420,
                  marginBottom: 16,
                }}
              >
                We create products shaped by whakapapa, tikanga, and movement. Every design is a statement of pride — built for athletes who carry their identity into every space they enter.
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  lineHeight: 1.7,
                  maxWidth: 420,
                  fontStyle: "italic",
                  marginBottom: 36,
                }}
              >
                &ldquo;We&rsquo;re not adding Māori identity to sportswear. We are sportswear.&rdquo;
              </p>
              <Link href="/shop" className="btn-green-sm">
                Shop the Collection <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            PRODUCT GRID
        ════════════════════════════════════════════ */}
        <section style={{ backgroundColor: "#06150C", padding: "7rem 0" }}>
          <div className="page-container">
            <div className="section-header">
              <div>
                <p className="section-label">Our Products</p>
                <h2 className="font-display section-title">SHOP THE RANGE</h2>
              </div>
              <Link href="/shop" className="view-all-link">
                View All <ArrowUpRight className="inline h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="hp-product-grid">
              {featured.map((p) => <HomepageCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            STATS
        ════════════════════════════════════════════ */}
        <section
          style={{
            backgroundColor: "#06150C",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="max-w-[1320px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20">
            <div
              className="grid grid-cols-3"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.07)" }}
            >
              {[
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
                      color: "#2E8B28",
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
            ATHLETES
        ════════════════════════════════════════════ */}
        <section style={{ backgroundColor: "#06150C", padding: "6rem 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-[1320px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20">
            <div className="text-center" style={{ marginBottom: 64 }}>
              <p style={{ fontSize: 11, letterSpacing: "0.4em", color: "#2E8B28", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>
                Nine2Five Family
              </p>
              <h2 className="font-display font-black text-white" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 0.95, letterSpacing: "-0.01em" }}>
                WHO WEARS OUR SOCKS?
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 items-start justify-items-center">
              {[
                {
                  img: "/athletes/ruben-love.webp",
                  name: "Ruben Love",
                  role: "Fullback / First-Five",
                  team: "Hurricanes & All Blacks",
                  detail: "All Blacks squad 2024. Heir to a proud rugby lineage.",
                },
                {
                  img: "/athletes/asafo-aumua.webp",
                  name: "Asafo Aumua",
                  role: "Hooker",
                  team: "Hurricanes & All Blacks",
                  detail: "U20 World Cup winner 2017. All Blacks Test debut 2020.",
                },
                {
                  img: "/athletes/haze-dunster.webp",
                  name: "Haze Dunster",
                  role: "Wing",
                  team: "Parramatta Eels",
                  detail: "NRL flyer born in Rotorua. Taking his culture to Australia.",
                },
                {
                  img: "/athletes/dre-pakeho.webp",
                  name: "Dre Pakeho",
                  role: "Centre",
                  team: "Queensland Reds",
                  detail: "2024 U20s Player of the Year. Super Rugby rising star.",
                },
                {
                  img: "/athletes/ben-odonovan.webp",
                  name: "Ben O'Donovan",
                  role: "Scrum-half",
                  team: "Munster Rugby",
                  detail: "Former Crusaders Academy. NZ U20 rep now professional in Ireland.",
                },
                {
                  img: "/athletes/flora-devonshire.webp",
                  name: "Flora Devonshire",
                  role: "Allrounder",
                  team: "White Ferns & Central Hinds",
                  detail: "Left-arm seamer and batter. Called up to the White Ferns 2025.",
                },
                {
                  img: "/athletes/leon-tuiloma.webp",
                  name: "Leon Tuiloma",
                  role: "Flanker / Hooker",
                  team: "Hurricanes Development",
                  detail: "From Masterton, Rathkeale College. NZ Barbarians U21 rep.",
                },
                {
                  img: "/athletes/ocean-bartlett.webp",
                  name: "Ocean Bartlett",
                  role: "Leg-spinner / Batter",
                  team: "White Ferns & Central Hinds",
                  detail: "NZ Women's Development squad. Rising star in domestic T20 cricket.",
                },
                {
                  img: "/athletes/rossana-perales.webp",
                  name: "Rossana Perales",
                  role: "Fitness Coach",
                  team: "New Zealand",
                  detail: "Empowering movement and performance. Training the next generation.",
                },
                {
                  img: "/athletes/reuben-cherrington.webp",
                  name: "Reuben Cherrington",
                  role: "Rugby League",
                  team: "Māori Ferns / NRL",
                  detail: "NRL talent representing Māori culture at the highest level.",
                },
                {
                  img: "/athletes/tiaki-freeman.webp",
                  name: "Tiaki Freeman",
                  role: "Powerlifter",
                  team: "NZ National Team",
                  detail: "317.5kg deadlift. NZ Junior World Championship competitor.",
                },
                {
                  img: "/athletes/will-cole.webp",
                  name: "Will Cole",
                  role: "Fly-half",
                  team: "Hurricanes WTG",
                  detail: "NZ U20 World Championship finalist 2025. Hurricanes next gen.",
                },
              ].map((a) => (
                <div key={a.name} className="flex flex-col items-center text-center group relative">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 ring-2 ring-[#2E8B28]/20 group-hover:ring-[#2E8B28]/60 transition-all duration-300 group-hover:scale-105"
                    style={{ background: "#0e2314" }}>
                    <Image
                      src={a.img}
                      alt={a.name}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 50% 120%, rgba(58,119,34,0.08) 0%, transparent 70%)" }} />
                  </div>
                  <p className="font-display font-black text-white text-lg md:text-xl leading-tight mb-1 min-h-[3rem] flex items-center justify-center">{a.name}</p>
                  <p className="text-[#2E8B28] text-[11px] font-bold uppercase tracking-widest mb-1">{a.role}</p>
                  <p className="text-white/40 text-[11px] font-medium mb-2 min-h-[2rem]">{a.team}</p>
                  <p className="text-white/30 text-[12px] leading-relaxed max-w-[180px] min-h-[5rem]">{a.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            GALLERY PREVIEW
        ════════════════════════════════════════════ */}
        <section style={{ backgroundColor: "#06150C", padding: "5rem 0" }}>
          <div className="page-container">
            <div className="section-header" style={{ marginBottom: 20 }}>
              <div>
                <p className="section-label">In The Wild</p>
                <h2 className="font-display section-title">THE GALLERY</h2>
              </div>
              <Link href="/gallery" className="view-all-link">
                View All →
              </Link>
            </div>
            <div className="hp-gallery-grid">
              {[2,4,6,8,10,13,16,19,21,23,25,27].map((n) => (
                <Link key={n} href="/gallery" className="hp-gallery-item">
                  <Image src={`/gallery/${n}.png`} alt="Nine2Five lifestyle" fill className="object-cover" unoptimized />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            TESTIMONIALS
        ════════════════════════════════════════════ */}
        <section style={{ backgroundColor: "#06150C", padding: "5rem 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="page-container">
            {/* Header row */}
            <div className="section-header" style={{ marginBottom: 12 }}>
              <div>
                <p className="section-label">Customer Reviews</p>
                <h2 className="font-display section-title">WORN BY THE CULTURE</h2>
              </div>
            </div>
            {/* Rating summary */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="fill-current" style={{ color: "#2E8B28", width: 18, height: 18 }} />
                ))}
              </div>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>4.9</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>from 200+ verified customers</span>
            </div>
            {/* Cards */}
            <div className="testimonials-grid">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="t-card">
                  <span className="t-verified">
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M10 3L5 9 2 6" stroke="#2E8B28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Verified Purchase
                  </span>
                  <div className="t-stars">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="fill-current" style={{ color: "#2E8B28", width: 13, height: 13 }} />
                    ))}
                  </div>
                  <p className="t-quote">&ldquo;{t.quote}&rdquo;</p>
                  <div className="t-footer">
                    <div className="t-avatar" style={{ background: t.color }}>{t.initials}</div>
                    <div>
                      <p className="t-name">{t.name}</p>
                      <p className="t-sport">{t.sport}</p>
                    </div>
                    <span className="t-date">{t.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            CTA CLOSER
        ════════════════════════════════════════════ */}
        <section
          style={{
            backgroundColor: "#06150C",
            padding: "9rem 0",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="max-w-[1320px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20 text-center">
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.35em",
                color: "#2E8B28",
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
            <Link href="/shop" className="btn-green-lg">
              Shop Now <ArrowUpRight className="h-4 w-4" />
            </Link>

            <div
              className="flex flex-wrap items-center justify-center gap-8 mt-14 pt-10"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <a
                href="https://instagram.com/nine2five.nz"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                Instagram
              </a>
              <a
                href="https://tiktok.com/@nine2five.nz"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                TikTok
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61563357785307"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                Facebook
              </a>
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
      className="group"
      style={{
        display: "flex", flexDirection: "column",
        background: "#07180e", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18, overflow: "visible", textDecoration: "none",
        transition: "transform 0.3s ease",
      }}
    >
      <div
        className="relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500"
        style={{
          height: "clamp(220px, 25vw, 340px)",
          borderRadius: "17px 17px 0 0",
          flexShrink: 0,
          backgroundColor: "#0e2314",
        }}
      >
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-black text-center px-4 leading-none" style={{ color: "rgba(255,255,255,0.12)", fontSize: 13 }}>
              {product.name.toUpperCase()}
            </span>
          </div>
        )}
        {isOnSale && (
          <span className="absolute top-3 left-3 font-black uppercase z-10" style={{ background: "#2E8B28", color: "#fff", fontSize: 9, letterSpacing: "0.1em", padding: "0.25rem 0.65rem", borderRadius: 9999 }}>
            Sale
          </span>
        )}
      </div>
      <div style={{ padding: "14px 16px 18px", minHeight: 72, display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3, color: "#F7F7F2", margin: 0 }}>
          {product.name}
        </p>
        <div className="flex items-center gap-2">
          <p style={{ fontWeight: 700, fontSize: 15, color: "#2E8B28", margin: 0 }}>
            ${(product.price / 100).toFixed(2)}
          </p>
          {isOnSale && (
            <p className="line-through" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>
              ${(product.compare_at_price! / 100).toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Fallback product card ──────────────────────────────────── */
function FallbackCard({ name, price, badge, compare }: { name: string; price: number; badge: string | null; compare: number | null; }) {
  return (
    <Link href="/shop" style={{ display: "flex", flexDirection: "column", background: "#07180e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "visible", textDecoration: "none" }}>
      <div className="relative overflow-hidden flex items-center justify-center" style={{ height: "clamp(220px, 25vw, 340px)", borderRadius: "17px 17px 0 0", flexShrink: 0, background: "radial-gradient(ellipse at 50% 85%, rgba(46,139,40,0.12) 0%, #0e2314 65%)" }}>
        {badge && (
          <span className="absolute top-3 left-3 font-black uppercase" style={{ background: "#2E8B28", color: "#fff", fontSize: 9, letterSpacing: "0.1em", padding: "0.25rem 0.65rem", borderRadius: 9999 }}>
            {badge}
          </span>
        )}
        <span className="font-display font-black text-center px-4 leading-none" style={{ color: "rgba(255,255,255,0.12)", fontSize: 13 }}>{name.toUpperCase()}</span>
      </div>
      <div style={{ padding: "14px 16px 18px", minHeight: 72, display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3, color: "#F7F7F2", margin: 0 }}>{name}</p>
        <div className="flex items-center gap-2">
          <p style={{ fontWeight: 700, fontSize: 15, color: "#2E8B28", margin: 0 }}>${(price / 100).toFixed(2)}</p>
          {compare && (
            <p className="line-through" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>${(compare / 100).toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
