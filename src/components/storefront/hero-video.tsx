"use client";

import Image from "next/image";

export function HeroVideo() {
  return (
    <img
      src="/hero-mobile.gif"
      alt=""
      aria-hidden="true"
      className="md:hidden absolute inset-0 w-full h-full object-cover object-center"
    />
  );
}
