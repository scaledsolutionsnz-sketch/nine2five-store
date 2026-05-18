"use client";

import { Printer } from "lucide-react";
import type { OrderWithItems, ShippingAddress } from "@/types/database";

export function NzPostLabel({ order }: { order: OrderWithItems }) {
  const addr = order.shipping_address as ShippingAddress;

  function printLabel() {
    const win = window.open("", "_blank", "width=600,height=400");
    if (!win) return;
    win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <style>
    @page { size: 148mm 210mm; margin: 0; }
    body { font-family: Arial, sans-serif; padding: 20px; background: white; color: black; }
    .label { border: 2px solid black; padding: 16px; max-width: 380px; }
    .from { font-size: 11px; color: #555; margin-bottom: 16px; border-bottom: 1px solid #ccc; padding-bottom: 12px; }
    .to-label { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 6px; }
    .to-name { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
    .to-addr { font-size: 14px; line-height: 1.5; }
    .order-num { margin-top: 16px; padding-top: 12px; border-top: 1px solid #ccc; font-size: 12px; color: #555; }
    .barcode { font-family: monospace; font-size: 24px; letter-spacing: 4px; margin-top: 8px; }
    .logo { font-weight: 900; font-size: 20px; letter-spacing: -0.5px; }
    .weight { font-size: 11px; color: #777; margin-top: 4px; }
  </style>
</head>
<body>
<div class="label">
  <div class="from">
    <div class="logo">NINE2FIVE</div>
    <div>Nine2Five Limited</div>
    <div>Christchurch, Canterbury, New Zealand</div>
  </div>
  <div class="to-label">Deliver To</div>
  <div class="to-name">${addr.first_name} ${addr.last_name}</div>
  <div class="to-addr">
    ${addr.line1}${addr.line2 ? `<br>${addr.line2}` : ""}<br>
    ${addr.city} ${addr.postcode}<br>
    ${addr.region}<br>
    ${addr.country === "NZ" ? "New Zealand" : addr.country}
  </div>
  ${addr.phone ? `<div style="font-size:12px;color:#555;margin-top:6px;">Ph: ${addr.phone}</div>` : ""}
  <div class="order-num">
    Order #${order.order_number}
    ${order.tracking_number ? `<div class="barcode">|||${order.tracking_number}|||</div>` : ""}
  </div>
  <div class="weight">NZ Post Standard</div>
</div>
<script>window.print(); window.close();</script>
</body>
</html>`);
    win.document.close();
  }

  return (
    <div className="p-6 rounded-[14px] bg-white border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm text-[#1F2937]">NZ Post Label</h2>
        <button
          onClick={printLabel}
          className="flex items-center gap-2 px-4 h-9 rounded-full bg-[#116DFF] text-white text-sm font-semibold hover:bg-[#0D5FE0] transition-colors"
        >
          <Printer className="h-4 w-4" />
          Print Label
        </button>
      </div>
      <div className="p-4 rounded-lg bg-[#F3F5F8] text-[#1F2937] text-sm font-mono space-y-1 border border-[#E2E8F0]">
        <p className="font-black text-base">NINE2FIVE</p>
        <p className="text-xs text-[#6B7280]">Nine2Five Limited, Christchurch NZ</p>
        <p className="mt-3 font-bold text-lg">{addr.first_name} {addr.last_name}</p>
        <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
        <p>{addr.city} {addr.postcode}</p>
        <p>{addr.region}, {addr.country === "NZ" ? "New Zealand" : addr.country}</p>
        {order.tracking_number && <p className="mt-2 text-xs font-bold tracking-widest text-[#116DFF]">{order.tracking_number}</p>}
      </div>
    </div>
  );
}
