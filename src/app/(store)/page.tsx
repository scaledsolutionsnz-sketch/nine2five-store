import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import { getStaticProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

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
    image: "/gallery/3.png",
  },
  {
    name: "Teamwear",
    tag: "Custom",
    desc: "Kit your whole crew. Custom orders available.",
    href: "/shop?collection=teamwear",
    image: "/gallery/7.png",
  },
];

/* ─── Testimonials ──────────────────────────────────────────── */
const TESTIMONIALS = [
  { quote: "These socks have become part of my game day ritual. Nothing else comes close.", name: "James T.",   sport: "Rugby" },
  { quote: "Finally a brand that celebrates who we are. Wore them to my first club match.",  name: "Aroha W.",  sport: "Touch Rugby" },
  { quote: "Quality is next level. I wear them to every session — gym, training, all of it.", name: "Marcus P.", sport: "Gym" },
  { quote: "My whole team ordered matching sets. Looks fire on the field.",                  name: "Tama K.",   sport: "Club Rugby" },
  { quote: "Perfect fit and grip. Best pilates socks I have ever tried. 10/10.",            name: "Sarah M.",  sport: "Pilates" },
  { quote: "Proud to wear my identity on the field. Every. Single. Game.",                  name: "Daniel R.", sport: "School Sport" },
];

/* ─── Data fetch ────────────────────────────────────────────── */
async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .limit(6);
    if (data?.length) return data as Product[];
  } catch { /* ignore */ }
  return getStaticProducts().slice(0, 6);
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

        /* Collection card hover zoom */
        .coll-card { overflow: hidden; border-radius: 1rem; display: block; position: relative; }
        .coll-card img { transition: transform 0.75s cubic-bezier(0.16,1,0.3,1) !important; }
        .coll-card:hover img { transform: scale(1.06) !important; }

        /* Product card lift + image zoom */
        .prod-card {
          display: block;
          text-decoration: none;
          overflow: hidden;
          border-radius: 1rem;
          background-color: #192d1e;
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.5s cubic-bezier(0.16,1,0.3,1);
        }
        .prod-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 28px 56px rgba(58,119,34,0.06);
        }
        .prod-card img {
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1) !important;
        }
        .prod-card:hover img { transform: scale(1.05) !important; }

        /* CTA button hover */
        .btn-green {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background-color: #3a7722; color: #ffffff; text-decoration: none;
          font-weight: 700; font-size: 0.8125rem; text-transform: uppercase;
          letter-spacing: 0.08em; border-radius: 9999px;
          padding: 1rem 2rem;
          transition: background-color 0.3s;
        }
        .btn-green:hover { background-color: #4d9e2e; }

        .btn-outline-hero {
          display: inline-flex; align-items: center; gap: 0.5rem;
          border: 1px solid rgba(255,255,255,0.22); color: #ffffff; text-decoration: none;
          font-weight: 500; font-size: 0.8125rem; text-transform: uppercase;
          letter-spacing: 0.08em; border-radius: 9999px;
          padding: 1rem 2rem;
          transition: border-color 0.3s, background-color 0.3s;
        }
        .btn-outline-hero:hover {
          border-color: rgba(255,255,255,0.5);
          background-color: rgba(255,255,255,0.05);
        }

        .btn-green-sm {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background-color: #3a7722; color: #ffffff; text-decoration: none;
          font-weight: 700; font-size: 0.8125rem; text-transform: uppercase;
          letter-spacing: 0.08em; border-radius: 9999px;
          padding: 1rem 2rem; align-self: flex-start;
          transition: background-color 0.3s;
        }
        .btn-green-sm:hover { background-color: #4d9e2e; }

        .btn-green-lg {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background-color: #3a7722; color: #ffffff; text-decoration: none;
          font-weight: 700; font-size: 0.8125rem; text-transform: uppercase;
          letter-spacing: 0.08em; border-radius: 9999px;
          padding: 1.1rem 2.6rem;
          transition: background-color 0.3s;
        }
        .btn-green-lg:hover { background-color: #4d9e2e; }

        /* Inline link hover (View All etc.) */
        .link-ghost {
          display: inline-flex; align-items: center; gap: 0.375rem;
          color: rgba(255,255,255,0.38); text-decoration: none;
          font-weight: 600; font-size: 0.8125rem; text-transform: uppercase;
          letter-spacing: 0.06em;
          transition: color 0.25s;
        }
        .link-ghost:hover { color: #3a7722; }

        .social-link {
          color: rgba(255,255,255,0.25); text-decoration: none;
          font-size: 0.875rem; font-weight: 500; letter-spacing: 0.06em;
          transition: color 0.25s;
        }
        .social-link:hover { color: #ffffff; }
      `}</style>

      <div style={{ backgroundColor: "#112016", color: "#ffffff" }}>

        {/* ════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════ */}
        <section className="relative overflow-hidden" style={{ minHeight: "100dvh" }}>

          {/* Full-bleed image */}
          <div className="absolute inset-0">
            <Image
              src="/gallery/1.png"
              alt="Nine2Five athlete wearing Māori grip socks"
              fill
              className="object-cover object-center"
              priority
              unoptimized
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, #112016 0%, rgba(0,0,0,0.65) 38%, rgba(0,0,0,0.18) 100%)",
              }}
            />
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
                "radial-gradient(ellipse, rgba(58,119,34,0.09) 0%, transparent 70%)",
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
            <div className="h-a1 flex items-center gap-2 mb-6">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#3a7722",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: "0.4em",
                  color: "#3a7722",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Masterton, NZ · Est. 2024
              </span>
            </div>

            <h1
              className="font-display font-black text-white h-a2"
              style={{
                fontSize: "clamp(3.8rem, 10vw, 10rem)",
                lineHeight: 0.85,
                letterSpacing: "-0.02em",
              }}
            >
              GRIP UP.<br />STAND PROUD.
            </h1>

            <p
              className="h-a3"
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "clamp(1rem, 1.5vw, 1.125rem)",
                lineHeight: 1.65,
                maxWidth: 440,
                marginTop: "1.5rem",
              }}
            >
              Māori grip socks built for sport, movement, and identity.
            </p>

            <div
              className="h-a4 flex flex-wrap items-center gap-4"
              style={{ marginTop: "2.5rem" }}
            >
              <Link href="/shop" className="btn-green">
                Shop Collection <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/shop?collection=limited" className="btn-outline-hero">
                View Limited Drop
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            className="h-a5 absolute z-10 right-8 md:right-16 hidden md:flex flex-col items-center gap-2"
            style={{ bottom: "clamp(3rem, 7dvh, 6rem)" }}
          >
            <div
              className="scroll-line"
              style={{
                width: 1,
                height: 64,
                background: "linear-gradient(to bottom, rgba(58,119,34,0.7), transparent)",
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
            backgroundColor: "#3a7722",
            overflow: "hidden",
            padding: "13px 0",
          }}
        >
          <div
            className="mq-track flex items-center"
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
        <section style={{ backgroundColor: "#112016", padding: "7rem 0" }}>
          <div className="max-w-screen-xl mx-auto px-8 md:px-16">

            <div className="mb-14">
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.35em",
                  color: "#3a7722",
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
                  className="coll-card"
                  style={{ height: "clamp(300px, 40vw, 540px)" }}
                >
                  <Image
                    src={col.image}
                    alt={col.name}
                    fill
                    className="object-cover object-center"
                    unoptimized
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.38) 48%, transparent 100%)",
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-7 md:p-8">
                    <p
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.3em",
                        color: "#3a7722",
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
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 14,
                        lineHeight: 1.6,
                        maxWidth: 320,
                        marginBottom: 16,
                      }}
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
        <section id="vision" style={{ backgroundColor: "#112016" }}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: image */}
            <div className="relative" style={{ minHeight: 520 }}>
              <Image
                src="/gallery/12.png"
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
                    "linear-gradient(to right, transparent 55%, #112016 100%)",
                }}
              />
            </div>

            {/* Right: content */}
            <div className="flex flex-col justify-center p-10 md:p-16 lg:p-20">
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.35em",
                  color: "#3a7722",
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
                  color: "#3a7722",
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
        <section style={{ backgroundColor: "#112016", padding: "7rem 0" }}>
          <div className="max-w-screen-xl mx-auto px-8 md:px-16">

            <div className="flex items-end justify-between mb-12">
              <div>
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.35em",
                    color: "#3a7722",
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
              <Link href="/shop" className="link-ghost shrink-0 ml-4">
                View All <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featured.map((p) => <LiveCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            STATS
        ════════════════════════════════════════════ */}
        <section
          style={{
            backgroundColor: "#112016",
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
                      color: "#3a7722",
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
        <section style={{ backgroundColor: "#112016", padding: "6rem 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-screen-xl mx-auto px-8 md:px-16">
            <div className="mb-12 text-center">
              <p style={{ fontSize: 11, letterSpacing: "0.4em", color: "#3a7722", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>
                Worn By The Best
              </p>
              <h2 className="font-display font-black text-white" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 0.95, letterSpacing: "-0.01em" }}>
                OUR ATHLETES
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
              {[
                {
                  img: "/athletes/ruben-love.png",
                  name: "Ruben Love",
                  role: "Fullback / First-Five",
                  team: "Hurricanes & All Blacks",
                  detail: "All Blacks squad 2024. Heir to a proud rugby lineage.",
                },
                {
                  img: "/athletes/asafo-aumua.jpg",
                  name: "Asafo Aumua",
                  role: "Hooker",
                  team: "Hurricanes & All Blacks",
                  detail: "U20 World Cup winner 2017. All Blacks Test debut 2020.",
                },
                {
                  img: "/athletes/haze-dunster.png",
                  name: "Haze Dunster",
                  role: "Wing",
                  team: "Parramatta Eels",
                  detail: "NRL flyer born in Rotorua. Taking his culture to Australia.",
                },
                {
                  img: "/athletes/dre-pakeho.png",
                  name: "Dre Pakeho",
                  role: "Centre",
                  team: "Queensland Reds",
                  detail: "2024 U20s Player of the Year. Super Rugby rising star.",
                },
                {
                  img: "/athletes/ben-odonovan.jpg",
                  name: "Ben O'Donovan",
                  role: "Scrum-half",
                  team: "Munster Rugby",
                  detail: "Former Crusaders Academy. NZ U20 rep turned professional in Ireland.",
                },
                {
                  img: "/athletes/flora-devonshire.jpg",
                  name: "Flora Devonshire",
                  role: "Allrounder",
                  team: "White Ferns & Central Hinds",
                  detail: "Left-arm seamer and batter. Called up to the White Ferns 2025.",
                },
                {
                  img: "/athletes/leon-tuiloma.jpg",
                  name: "Leon Tuiloma",
                  role: "Flanker / Hooker",
                  team: "Hurricanes Development",
                  detail: "From Masterton, Rathkeale College. NZ Barbarians U21 rep.",
                },
                {
                  img: "/athletes/ocean-bartlett.jpg",
                  name: "Ocean Bartlett",
                  role: "Leg-spinner / Batter",
                  team: "White Ferns & Central Hinds",
                  detail: "NZ Women's Development squad. Rising star in domestic T20 cricket.",
                },
                {
                  img: "/athletes/rossana-perales.jpg",
                  name: "Rossana Perales",
                  role: "Fitness Coach",
                  team: "New Zealand",
                  detail: "Empowering movement and performance. Training the next generation.",
                },
                {
                  img: "/athletes/reuben-cherrington.png",
                  name: "Reuben Cherrington",
                  role: "Rugby League",
                  team: "Māori Ferns / NRL",
                  detail: "NRL talent representing Māori culture at the highest level.",
                },
                {
                  img: "/athletes/tiaki-freeman.jpeg",
                  name: "Tiaki Freeman",
                  role: "Powerlifter",
                  team: "NZ National Team",
                  detail: "317.5kg deadlift. NZ Junior World Championship competitor.",
                },
                {
                  img: "/athletes/will-cole.jpg",
                  name: "Will Cole",
                  role: "Fly-half",
                  team: "Hurricanes WTG",
                  detail: "NZ U20 World Championship finalist 2025. Hurricanes next gen.",
                },
              ].map((a) => (
                <div key={a.name} className="flex flex-col items-center text-center group">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 ring-2 ring-[#3a7722]/20 group-hover:ring-[#3a7722]/60 transition-all duration-300"
                    style={{ background: "#192d1e" }}>
                    <Image
                      src={a.img}
                      alt={a.name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 50% 120%, rgba(58,119,34,0.08) 0%, transparent 70%)" }} />
                  </div>
                  <p className="font-display font-black text-white text-lg md:text-xl leading-tight mb-1">{a.name}</p>
                  <p className="text-[#3a7722] text-[11px] font-bold uppercase tracking-widest mb-1">{a.role}</p>
                  <p className="text-white/40 text-[11px] font-medium mb-2">{a.team}</p>
                  <p className="text-white/30 text-[12px] leading-relaxed max-w-[180px]">{a.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            GALLERY PREVIEW
        ════════════════════════════════════════════ */}
        <section style={{ backgroundColor: "#112016", padding: "5rem 0 0" }}>
          <div className="max-w-screen-xl mx-auto px-8 md:px-16 mb-8 flex items-end justify-between">
            <div>
              <p style={{ fontSize: 11, letterSpacing: "0.35em", color: "#3a7722", fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>
                In The Wild
              </p>
              <h2 className="font-display font-black text-white" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", lineHeight: 0.95 }}>
                THE GALLERY
              </h2>
            </div>
            <Link href="/gallery" className="text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-[#3a7722] transition-colors pb-1">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1">
            {[2,4,6,8,10,13,16,19,21,23,25,27,5,9,11,15].map((n) => (
              <Link key={n} href="/gallery" className="relative aspect-square overflow-hidden bg-[#192d1e] group">
                <Image src={`/gallery/${n}.png`} alt="Nine2Five lifestyle" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
              </Link>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            TESTIMONIALS — horizontal scroll
        ════════════════════════════════════════════ */}
        <section
          style={{
            backgroundColor: "#112016",
            padding: "5rem 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="max-w-screen-xl mx-auto px-8 md:px-16 mb-10">
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.35em",
                color: "#3a7722",
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
                <div className="flex items-center gap-0.5" style={{ marginBottom: 16 }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className="fill-current"
                      style={{ color: "#3a7722", width: 13, height: 13 }}
                    />
                  ))}
                </div>
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
                <div>
                  <p className="font-semibold text-white" style={{ fontSize: 14 }}>
                    {t.name}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#3a7722",
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
            backgroundColor: "#112016",
            padding: "9rem 0",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="max-w-screen-xl mx-auto px-8 md:px-16 text-center">
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.35em",
                color: "#3a7722",
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
    <Link href={`/shop/${product.slug}`} className="prod-card">
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "4 / 5",
          background:
            "radial-gradient(ellipse at 50% 88%, rgba(58,119,34,0.13) 0%, #0d0d0d 62%)",
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
          <div className="absolute inset-0 flex items-end justify-center pb-8">
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
              color: "#ffffff",
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
          <p className="font-bold text-sm" style={{ color: "#3a7722" }}>
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
    <Link href="/shop" className="prod-card">
      <div
        className="relative overflow-hidden flex items-end justify-center pb-8"
        style={{
          aspectRatio: "4 / 5",
          background:
            "radial-gradient(ellipse at 50% 85%, rgba(58,119,34,0.14) 0%, #0d0d0d 60%)",
        }}
      >
        {badge && (
          <span
            className="absolute top-3 left-3 font-black uppercase"
            style={{
              backgroundColor: "#ffffff",
              color: "#ffffff",
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
          <p className="font-bold text-sm" style={{ color: "#3a7722" }}>
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
