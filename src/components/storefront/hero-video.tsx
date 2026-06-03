"use client";

export function HeroVideo() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
      className="md:hidden absolute inset-0 w-full h-full object-cover object-center"
    >
      <source src="/hero-mobile.mp4" type="video/mp4" />
    </video>
  );
}
