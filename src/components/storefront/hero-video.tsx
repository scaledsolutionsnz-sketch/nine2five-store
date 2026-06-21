"use client";

import { useEffect, useRef } from "react";

export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // React's `muted` prop only sets the attribute, not the DOM property — mobile
    // browsers (esp. iOS Safari) then refuse to autoplay. Force it imperatively.
    v.muted = true;
    v.defaultMuted = true;

    const tryPlay = () => { v.play().catch(() => {}); };
    tryPlay();
    v.addEventListener("canplay", tryPlay);

    // Fallback: if autoplay was blocked anyway (iOS Low Power Mode disables ALL
    // autoplay, even muted), start playback on the first user interaction — a
    // user gesture always unlocks it — then remove the listeners.
    const events = ["touchstart", "click", "scroll", "keydown"] as const;
    const unlock = () => {
      v.muted = true;
      v.play().catch(() => {});
      events.forEach((e) => window.removeEventListener(e, unlock));
    };
    events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));

    return () => {
      v.removeEventListener("canplay", tryPlay);
      events.forEach((e) => window.removeEventListener(e, unlock));
    };
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
