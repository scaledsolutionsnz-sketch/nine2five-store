"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({
  images,
  name,
  isOnSale,
}: {
  images: string[];
  name: string;
  isOnSale: boolean;
}) {
  // Filter out null / empty / whitespace-only URLs upfront
  const validImages = images.filter((url) => url && url.trim() !== "");

  const [hiddenIndexes, setHiddenIndexes] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visibleImages = validImages.filter((_, i) => !hiddenIndexes.includes(i));

  // If active slide was hidden, reset to 0
  useEffect(() => {
    if (current >= visibleImages.length && visibleImages.length > 0) {
      setCurrent(0);
    }
  }, [visibleImages.length, current]);

  const handleImageError = (originalIndex: number) => {
    setHiddenIndexes((prev) => (prev.includes(originalIndex) ? prev : [...prev, originalIndex]));
  };

  const stopAuto = useCallback(() => {
    setAutoPlay(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!autoPlay || visibleImages.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((i) => (i + 1) % visibleImages.length);
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoPlay, visibleImages.length]);

  function goTo(index: number) { stopAuto(); setCurrent(index); }
  function prev() { stopAuto(); setCurrent((i) => (i - 1 + visibleImages.length) % visibleImages.length); }
  function next() { stopAuto(); setCurrent((i) => (i + 1) % visibleImages.length); }

  if (visibleImages.length === 0) {
    return (
      <div style={{ borderRadius: 22, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#07180e", aspectRatio: "1/1.1", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 14 }}>Image coming soon</span>
      </div>
    );
  }

  // Build a map from visible index → original index for error handling
  const visibleOriginalIndexes = validImages
    .map((_, i) => i)
    .filter((i) => !hiddenIndexes.includes(i));

  return (
    <div>
      {/* Main image */}
      <div style={{ borderRadius: 22, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", background: "#07180e", position: "relative", aspectRatio: "1/1.1" }}>
        {visibleImages[current] && (
          <Image
            key={visibleImages[current]}
            src={visibleImages[current]}
            alt={`${name} ${current + 1}`}
            fill
            className="object-cover object-center"
            priority={current === 0}
            style={{ transition: "opacity 0.4s ease" }}
            onError={() => handleImageError(visibleOriginalIndexes[current])}
            unoptimized
          />
        )}

        {isOnSale && (
          <span style={{ position: "absolute", top: 16, left: 16, background: "#2E8B28", color: "#fff", borderRadius: 999, padding: "4px 12px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", zIndex: 2 }}>
            Sale
          </span>
        )}

        {visibleImages.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous image" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 46, height: 46, borderRadius: "50%", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2, transition: "background 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2f9b2f")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.35)")}>
              <ChevronLeft style={{ width: 20, height: 20, color: "#fff" }} />
            </button>
            <button onClick={next} aria-label="Next image" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 46, height: 46, borderRadius: "50%", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2, transition: "background 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2f9b2f")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.35)")}>
              <ChevronRight style={{ width: 20, height: 20, color: "#fff" }} />
            </button>

            {/* Dot indicators */}
            <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 2 }}>
              {visibleImages.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} aria-label={`Go to image ${i + 1}`}
                  style={{ width: i === current ? 20 : 6, height: 6, borderRadius: 999, background: i === current ? "#2E8B28" : "rgba(255,255,255,0.35)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s ease" }} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {visibleImages.length > 1 && (
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          {visibleImages.slice(0, 6).map((url, i) => (
            <button key={i} onClick={() => goTo(i)}
              style={{ width: 74, height: 74, borderRadius: 12, overflow: "hidden", border: i === current ? "2px solid #2E8B28" : "1px solid rgba(255,255,255,0.08)", position: "relative", flexShrink: 0, background: "#07180e", padding: 0, cursor: "pointer", transition: "border-color 0.2s" }}>
              <Image src={url} alt={`${name} ${i + 1}`} fill className="object-cover object-center"
                onError={() => handleImageError(visibleOriginalIndexes[i])} unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
