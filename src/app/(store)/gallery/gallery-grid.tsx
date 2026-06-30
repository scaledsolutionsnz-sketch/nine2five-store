"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type GalleryItem = { src: string; alt: string; tag: string; ratio: string };

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox(i => i !== null ? (i - 1 + items.length) % items.length : null), [items.length]);
  const next = useCallback(() => setLightbox(i => i !== null ? (i + 1) % items.length : null), [items.length]);

  useEffect(() => {
    if (lightbox === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, prev, next]);

  return (
    <>
      {/* Masonry columns */}
      <div className="gallery-masonry" style={{
        columns: 3,
        columnGap: 20,
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 48px 80px",
      }}>
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className="gallery-card group"
            style={{
              display: "block",
              width: "100%",
              marginBottom: 20,
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#07180e",
              cursor: "pointer",
              padding: 0,
              breakInside: "avoid",
              position: "relative",
            }}
          >
            {/* Aspect-ratio wrapper preserves natural shape */}
            <div style={{ position: "relative", width: "100%", aspectRatio: item.ratio }}>
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />

              {/* Permanent brand tint */}
              <div style={{
                position: "absolute", inset: 0, zIndex: 1,
                background: "rgba(6,21,12,0.28)",
                mixBlendMode: "multiply",
              }} />

              {/* Hover gradient overlay */}
              <div style={{
                position: "absolute", inset: 0, zIndex: 2,
                background: "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.1), transparent)",
                opacity: 0, transition: "opacity 0.3s ease",
              }} className="gallery-overlay" />

              {/* Hover caption */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3,
                padding: "0 18px 18px",
                opacity: 0, transform: "translateY(8px)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
              }} className="gallery-caption">
                <span style={{
                  fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                  letterSpacing: "0.14em", color: "#2E8B28",
                }}>
                  View Image →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <button onClick={close} style={{
            position: "absolute", top: 20, right: 20,
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 2,
          }}>
            <X style={{ width: 20, height: 20, color: "#fff" }} />
          </button>

          <button onClick={(e) => { e.stopPropagation(); prev(); }} style={{
            position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 2,
          }}>
            <ChevronLeft style={{ width: 22, height: 22, color: "#fff" }} />
          </button>

          <div onClick={(e) => e.stopPropagation()} style={{
            position: "relative", maxWidth: "min(90vw, 960px)", maxHeight: "85vh",
            width: "100%", height: "100%",
            borderRadius: 16, overflow: "hidden",
          }}>
            <Image
              src={items[lightbox].src}
              alt={items[lightbox].alt}
              fill
              sizes="(max-width: 960px) 90vw, 960px"
              className="object-contain"
              priority
            />
          </div>

          <button onClick={(e) => { e.stopPropagation(); next(); }} style={{
            position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 2,
          }}>
            <ChevronRight style={{ width: 22, height: 22, color: "#fff" }} />
          </button>

          <div style={{
            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
            textAlign: "center", zIndex: 2,
          }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, letterSpacing: "0.04em" }}>
              {lightbox + 1} / {items.length}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .gallery-masonry { columns: 2 !important; padding: 0 24px 60px !important; column-gap: 14px !important; }
          .gallery-card { margin-bottom: 14px !important; }
        }
        @media (max-width: 600px) {
          .gallery-masonry { columns: 1 !important; padding: 0 16px 48px !important; }
          .gallery-card { margin-bottom: 12px !important; }
        }
        .gallery-card:hover .gallery-overlay { opacity: 1 !important; }
        .gallery-card:hover .gallery-caption { opacity: 1 !important; transform: translateY(0) !important; }
      `}</style>
    </>
  );
}
