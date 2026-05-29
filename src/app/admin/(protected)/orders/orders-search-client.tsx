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
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", width: 280, background: "#fff", border: "1px solid #d8dee8", borderRadius: 10 }}>
      <Search style={{ width: 13, height: 13, color: "#9ca3af", flexShrink: 0 }} strokeWidth={2} />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search orders or email…"
        style={{ flex: 1, fontSize: 13, background: "transparent", color: "#334155", outline: "none", border: "none", minWidth: 0 }}
      />
      {value && (
        <button onClick={clear} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "#9ca3af" }}>
          <X style={{ width: 13, height: 13 }} />
        </button>
      )}
    </div>
  );
}
