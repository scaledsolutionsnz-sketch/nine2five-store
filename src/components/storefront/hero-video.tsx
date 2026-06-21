"use client";

import { useEffect, useRef } from "react";

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // React's `muted` prop only sets the attribute, not the DOM property — mobile
    // browsers (esp. iOS Safari) then refuse to autoplay. Force it imperatively
    // and kick off playback, swallowing the autoplay-promise rejection.
    v.muted = true;
    v.defaultMuted = true;
    const tryPlay = () => { v.play().catch(() => {}); };
    tryPlay();
    v.addEventListener("canplay", tryPlay);
    return () => v.removeEventListener("canplay", tryPlay);
  }, []);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      className="md:hidden absolute inset-0 w-full h-full object-cover object-center"
    >
      <source src="/hero-mobile.mp4" type="video/mp4" />
    </video>
  );
}
