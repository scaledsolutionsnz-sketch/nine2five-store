"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("_n2f_sid");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("_n2f_sid", id);
  }
  return id;
}

export function VisitorTracker() {
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function ping(page: string) {
    const session_id = getSessionId();
    if (!session_id) return;
    navigator.sendBeacon("/api/analytics/ping", JSON.stringify({ session_id, page }));
  }

  useEffect(() => {
    ping(pathname);

    timerRef.current = setInterval(() => {
      if (document.visibilityState !== "hidden") ping(pathname);
    }, 60_000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pathname]);

  return null;
}
