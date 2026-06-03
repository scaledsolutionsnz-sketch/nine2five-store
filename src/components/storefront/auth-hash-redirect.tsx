"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AuthHashRedirect() {
  const router = useRouter();
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes("type=recovery") || hash.includes("access_token="))) {
      router.replace("/admin/update-password" + hash);
    }
  }, [router]);
  return null;
}
