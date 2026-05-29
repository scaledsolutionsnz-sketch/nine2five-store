import Link from "next/link";
import type { Metadata } from "next";
import { GalleryGrid } from "./gallery-grid";

export const metadata: Metadata = {
  title: "Gallery — Nine2Five",
  description: "Māori grip socks in action. Rugby, gym, pilates, touch, and everyday movement.",
};

const GALLERY = [
  { src: "/gallery/1.webp",  alt: "Nine2Five socks lifestyle",    tag: "Lifestyle",   ratio: "3/4"  },
  { src: "/gallery/2.webp",  alt: "Nine2Five socks in action",    tag: "Sport",       ratio: "4/3"  },
  { src: "/gallery/3.webp",  alt: "Nine2Five grip socks",         tag: "Training",    ratio: "3/4"  },
  { src: "/gallery/4.webp",  alt: "Nine2Five product shot",       tag: "Product",     ratio: "1/1"  },
  { src: "/gallery/5.webp",  alt: "Nine2Five socks worn",         tag: "Lifestyle",   ratio: "4/3"  },
  { src: "/gallery/6.webp",  alt: "Nine2Five on the field",       tag: "Sport",       ratio: "3/4"  },
  { src: "/gallery/7.webp",  alt: "Nine2Five team socks",         tag: "Team",        ratio: "4/3"  },
  { src: "/gallery/8.webp",  alt: "Nine2Five close up",           tag: "Product",     ratio: "3/4"  },
  { src: "/gallery/9.webp",  alt: "Nine2Five lifestyle shot",     tag: "Lifestyle",   ratio: "1/1"  },
  { src: "/gallery/10.webp", alt: "Nine2Five performance",        tag: "Performance", ratio: "4/3"  },
  { src: "/gallery/11.webp", alt: "Nine2Five gym training",       tag: "Training",    ratio: "3/4"  },
  { src: "/gallery/12.webp", alt: "Nine2Five movement",           tag: "Sport",       ratio: "4/3"  },
  { src: "/gallery/13.webp", alt: "Nine2Five culture",            tag: "Culture",     ratio: "3/4"  },
  { src: "/gallery/14.webp", alt: "Nine2Five field session",      tag: "Sport",       ratio: "1/1"  },
  { src: "/gallery/15.webp", alt: "Nine2Five gym socks",          tag: "Gym",         ratio: "4/3"  },
  { src: "/gallery/16.webp", alt: "Nine2Five product display",    tag: "Product",     ratio: "3/4"  },
  { src: "/gallery/17.webp", alt: "Nine2Five outdoor action",     tag: "Lifestyle",   ratio: "4/3"  },
  { src: "/gallery/18.webp", alt: "Nine2Five Māori design",       tag: "Culture",     ratio: "3/4"  },
  { src: "/gallery/19.webp", alt: "Nine2Five athlete socks",      tag: "Performance", ratio: "1/1"  },
  { src: "/gallery/20.webp", alt: "Nine2Five on grass",           tag: "Sport",       ratio: "4/3"  },
  { src: "/gallery/21.webp", alt: "Nine2Five grip pattern",       tag: "Product",     ratio: "3/4"  },
  { src: "/gallery/22.webp", alt: "Nine2Five workout",            tag: "Training",    ratio: "4/3"  },
  { src: "/gallery/23.webp", alt: "Nine2Five lifestyle",          tag: "Lifestyle",   ratio: "3/4"  },
  { src: "/gallery/24.webp", alt: "Nine2Five team shot",          tag: "Team",        ratio: "1/1"  },
  { src: "/gallery/25.webp", alt: "Nine2Five active wear",        tag: "Performance", ratio: "4/3"  },
  { src: "/gallery/26.webp", alt: "Nine2Five street style",       tag: "Lifestyle",   ratio: "3/4"  },
  { src: "/gallery/27.webp", alt: "Nine2Five identity",           tag: "Culture",     ratio: "4/3"  },
];

export default function GalleryPage() {
  return (
    <div style={{ backgroundColor: "#06150C", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <div
        style={{
          position: "relative",
          backgroundColor: "#07180e",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Texture overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('/bg-overlay.webp')",
          backgroundSize: "540px auto",
          backgroundRepeat: "repeat",
          opacity: 0.05,
          pointerEvents: "none",
        }} />
        {/* Radial green glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 20% 100%, rgba(46,139,40,0.12) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "clamp(70px,10vw,120px) clamp(20px,4vw,48px) clamp(44px,6vw,70px)",
          position: "relative",
          zIndex: 1,
        }}>
          <p style={{
            fontSize: 10, letterSpacing: "0.4em", color: "#2E8B28",
            fontWeight: 700, textTransform: "uppercase", marginBottom: 16,
          }}>
            Nine2Five
          </p>
          <h1
            className="font-display font-black text-white"
            style={{ fontSize: "clamp(3rem, 8vw, 7rem)", lineHeight: 0.92, letterSpacing: "-0.02em", marginBottom: 20 }}
          >
            THE GALLERY
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 420, lineHeight: 1.6 }}>
            Worn on fields, in gyms, on tracks. Built for movement. Made with pride.
          </p>
        </div>
      </div>

      {/* ── Gallery grid (client) ── */}
      <div style={{ paddingTop: 48 }}>
        <GalleryGrid items={GALLERY} />
      </div>

      {/* ── Bottom CTA ── */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "6rem 1.5rem",
        textAlign: "center",
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4em", color: "#2E8B28", marginBottom: 20 }}>
          Ready to Represent
        </p>
        <h2
          className="font-display font-black text-white"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 0.92, letterSpacing: "-0.01em", marginBottom: 36 }}
        >
          WEAR YOUR IDENTITY
        </h2>
        <Link
          href="/shop"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#2E8B28", color: "#fff",
            fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em",
            padding: "14px 36px", borderRadius: 999, textDecoration: "none",
            transition: "background 0.2s",
          }}
          className="hover:bg-[#36A832]"
        >
          Shop Collection
        </Link>
      </div>
    </div>
  );
}
