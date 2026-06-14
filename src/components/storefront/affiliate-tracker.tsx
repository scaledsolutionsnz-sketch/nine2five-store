"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const COOKIE_NAME = "n2f_ref";
const COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  const host = window.location.hostname;
  // In prod, scope to the registrable domain so a link on www.nine2five.nz still
  // carries to apex nine2five.nz (and vice versa). On preview/localhost, stay
  // host-only — a Domain= the browser doesn't own would be rejected.
  const domainAttr = host === "nine2five.nz" || host.endsWith(".nine2five.nz") ? "; Domain=.nine2five.nz" : "";
  const secureAttr = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; expires=${expires}; path=/${domainAttr}; SameSite=Lax${secureAttr}`;
}

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function AffiliateTracker() {
  const params = useSearchParams();

  useEffect(() => {
    const ref = params.get("ref");
    if (!ref) return;

    const code = ref.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30);
    if (!code) return;

    // Set cookie (overwrites existing — last-click attribution)
    setCookie(COOKIE_NAME, code, COOKIE_DAYS);

    // Record click server-side (fire and forget)
    fetch("/api/affiliates/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, landing_page: window.location.pathname }),
    }).catch(() => {});
  }, [params]);

  return null;
}
