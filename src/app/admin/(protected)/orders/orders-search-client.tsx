"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

export function OrdersSearchClient({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      router.push(v.trim() ? `/admin/orders?search=${encodeURIComponent(v.trim())}` : "/admin/orders");
    }, 300);
  }

  function clear() {
    setValue("");
    if (timer.current) clearTimeout(timer.current);
    router.push("/admin/orders");
  }

  return (
    <div style={{ position: "relative" }}>
      <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search orders or email…"
        style={{
          height: 34, paddingLeft: 34, paddingRight: value ? 32 : 14,
          borderRadius: 9999, fontSize: 13, width: 240,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff", outline: "none",
        }}
      />
      {value && (
        <button onClick={clear} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex", padding: 0 }}>
          <X style={{ width: 13, height: 13 }} />
        </button>
      )}
    </div>
  );
}
