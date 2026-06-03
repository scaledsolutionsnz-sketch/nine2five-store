interface LowStockItem {
  product_name: string;
  size: string;
  stock_quantity: number;
}

export function lowStockHtml(items: LowStockItem[]): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #1e1e1e;font-weight:600;color:#f0f0f0;">${item.product_name}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #1e1e1e;color:#a0a0a0;">Size ${item.size}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #1e1e1e;text-align:right;font-family:monospace;font-weight:800;color:${item.stock_quantity === 0 ? "#f87171" : "#fbbf24"};">${item.stock_quantity === 0 ? "OUT OF STOCK" : `${item.stock_quantity} left`}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#111111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">

        <!-- Header -->
        <tr>
          <td style="padding:28px 32px;background:#0d1f12;border-bottom:1px solid #2a2a2a;">
            <div style="font-size:13px;font-weight:900;letter-spacing:0.15em;color:#4ade80;text-transform:uppercase;">Nine2Five</div>
            <div style="font-size:20px;font-weight:900;color:#ffffff;margin-top:4px;">Low Stock Alert</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.45);margin-top:4px;">${items.length} variant${items.length !== 1 ? "s" : ""} need restocking</div>
          </td>
        </tr>

        <!-- Table -->
        <tr>
          <td style="padding:24px 32px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <thead>
                <tr style="border-bottom:1px solid #2a2a2a;">
                  <th style="padding:8px 16px;text-align:left;font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Product</th>
                  <th style="padding:8px 16px;text-align:left;font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Size</th>
                  <th style="padding:8px 16px;text-align:right;font-size:10px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Stock</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:24px 32px 32px;">
            <a href="https://nine2five.nz/admin/inventory"
               style="display:inline-block;height:40px;line-height:40px;padding:0 24px;background:#2f9b2f;color:#ffffff;font-size:13px;font-weight:800;text-decoration:none;border-radius:9999px;letter-spacing:0.05em;">
              View Inventory →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #2a2a2a;">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);text-align:center;">
              Nine2Five Admin · This alert is sent daily when stock drops to 5 or below.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function lowStockText(items: LowStockItem[]): string {
  const lines = items.map((i) => `- ${i.product_name} (Size ${i.size}): ${i.stock_quantity === 0 ? "OUT OF STOCK" : `${i.stock_quantity} left`}`).join("\n");
  return `LOW STOCK ALERT — Nine2Five\n\n${items.length} variant${items.length !== 1 ? "s" : ""} need restocking:\n\n${lines}\n\nManage inventory: https://nine2five.nz/admin/inventory`;
}
