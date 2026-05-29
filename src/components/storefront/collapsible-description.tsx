"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

function parseText(text: string): string[] {
  const hasHtml = /<[a-z][\s\S]*?>/i.test(text);
  if (hasHtml) {
    const plain = text
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<p[^>]*>/gi, "")
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "$1")
      .replace(/<em[^>]*>(.*?)<\/em>/gi, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"');
    return plain.split(/\n+/).map(s => s.trim()).filter(Boolean);
  }
  return text.split(/\n+/).map(s => s.trim()).filter(Boolean);
}

export function CollapsibleDescription({ text }: { text: string | null }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  const paras = parseText(text);
  return (
    <div style={{ marginBottom: 32, maxWidth: 600 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", background: "none", border: "none", padding: "0 0 12px",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          cursor: "pointer",
        }}
      >
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)",
        }}>
          Description
        </span>
        <ChevronDown
          style={{
            width: 16, height: 16, color: "rgba(255,255,255,0.4)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>
      {open && (
        <div style={{ paddingTop: 16 }}>
          {paras.map((para, i) => (
            <p key={i} style={{ marginBottom: 14, color: "rgba(255,255,255,0.72)", fontSize: 17, lineHeight: 1.7 }}>
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
