import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function cell(v: string | number | null | undefined): string {
  const s = String(v ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function row(...cells: (string | number | null | undefined)[]): string {
  return cells.map(cell).join(",");
}

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

// NZ GST 15% — tax-inclusive portion: total × 3/23
function gst(cents: number): number { return Math.round(cents * 3 / 23); }
function exGst(cents: number): number { return cents - gst(cents); }

// ─── Format builders ──────────────────────────────────────────────────────────

function buildOrdersCsv(orders: Order[]): string {
  const header = row(
    "Order #", "Date", "Status",
    "Customer Email", "First Name", "Last Name",
    "City", "Region", "Country",
    "Product", "Size", "Qty", "Unit Price ($)",
    "Subtotal ($)", "Discount Code", "Discount ($)", "Shipping ($)",
    "Total incl. GST ($)", "GST ($)", "Total excl. GST ($)",
    "Payment Intent", "Tracking #"
  );

  const lines = orders.flatMap((o) => {
    const addr = o.shipping_address as Record<string, string> | null;
    const discountDollars = dollars(o.discount_amount_cents ?? 0);
    const shippingDollars = dollars(o.shipping_cost ?? 0);
    const subtotalDollars = dollars(o.subtotal ?? 0);
    const totalDollars    = dollars(o.total);
    const gstDollars      = dollars(gst(o.total));
    const exGstDollars    = dollars(exGst(o.total));

    return (o.order_items ?? []).map((item: OrderItem) =>
      row(
        o.order_number, new Date(o.created_at).toLocaleDateString("en-NZ"), o.status,
        o.guest_email ?? "", addr?.first_name ?? "", addr?.last_name ?? "",
        addr?.city ?? "", addr?.region ?? "", addr?.country ?? "NZ",
        item.product_name, item.size, item.quantity, dollars(item.unit_price),
        subtotalDollars, o.discount_code ?? "", discountDollars, shippingDollars,
        totalDollars, gstDollars, exGstDollars,
        o.stripe_payment_intent_id ?? "", o.tracking_number ?? ""
      )
    );
  });

  return [header, ...lines].join("\n");
}

function buildGstCsv(orders: Order[], from: string, to: string): string {
  const sales   = orders.filter((o) => !["cancelled", "refunded"].includes(o.status));
  const refunds = orders.filter((o) => o.status === "refunded");

  const totalSales   = sales.reduce((s, o) => s + o.total, 0);
  const totalRefunds = refunds.reduce((s, o) => s + o.total, 0);
  const gstSales     = gst(totalSales);
  const gstRefunds   = gst(totalRefunds);
  const netGst       = gst(totalSales - totalRefunds);

  const lines = [
    row("GST Report — Nine2Five"),
    row("Period", `${from} to ${to}`),
    row("Generated", new Date().toLocaleDateString("en-NZ")),
    "",
    row("Description", "Amount ($)"),
    row("Total sales incl. GST",     dollars(totalSales)),
    row("GST collected (15%)",        dollars(gstSales)),
    row("Sales excl. GST",           dollars(exGst(totalSales))),
    "",
    row("Total refunds incl. GST",   dollars(totalRefunds)),
    row("GST on refunds",            dollars(gstRefunds)),
    "",
    row("Net GST payable",           dollars(netGst)),
    "",
    row("Order count (sales)",       sales.length),
    row("Order count (refunds)",     refunds.length),
    "",
    "Note: NZ GST rate is 15% (tax-inclusive). GST = Total × 3/23",
  ];

  return lines.join("\n");
}

function buildMyobCsv(orders: Order[]): string {
  // MYOB-compatible Sales Journal CSV
  const header = row(
    "Date", "Reference", "Customer", "Memo",
    "Account", "Amount excl. GST ($)", "GST ($)", "Total incl. GST ($)", "Tax Code"
  );

  const lines = orders
    .filter((o) => !["cancelled"].includes(o.status))
    .map((o) => {
      const addr  = o.shipping_address as Record<string, string> | null;
      const name  = addr ? `${addr.first_name ?? ""} ${addr.last_name ?? ""}`.trim() : (o.guest_email ?? "");
      const refNo = `N2F-${o.order_number}`;
      const memo  = `Nine2Five order ${o.order_number}`;
      const account = o.status === "refunded" ? "Refunds" : "Sales";
      const total = o.status === "refunded" ? -o.total : o.total;

      return row(
        new Date(o.created_at).toLocaleDateString("en-NZ"),
        refNo, name, memo,
        account,
        dollars(exGst(total)), dollars(gst(total)), dollars(total),
        "GST"
      );
    });

  return [header, ...lines].join("\n");
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  order_number: number;
  created_at: string;
  status: string;
  guest_email: string | null;
  shipping_address: unknown;
  subtotal: number;
  shipping_cost: number;
  total: number;
  discount_code: string | null;
  discount_amount_cents: number;
  stripe_payment_intent_id: string | null;
  tracking_number: string | null;
  order_items: OrderItem[];
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = req.nextUrl;
  const from   = url.searchParams.get("from") ?? new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
  const to     = url.searchParams.get("to")   ?? new Date().toISOString().slice(0, 10);
  const format = url.searchParams.get("format") ?? "orders";

  const serviceClient = await createServiceClient();
  const { data: orders, error } = await serviceClient
    .from("orders")
    .select("*, order_items(*)")
    .gte("created_at", from)
    .lte("created_at", `${to}T23:59:59Z`)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const typedOrders = (orders ?? []) as Order[];

  let csv: string;
  let filename: string;

  if (format === "gst") {
    csv = buildGstCsv(typedOrders, from, to);
    filename = `nine2five-gst-${from}-${to}.csv`;
  } else if (format === "myob") {
    csv = buildMyobCsv(typedOrders);
    filename = `nine2five-myob-${from}-${to}.csv`;
  } else {
    csv = buildOrdersCsv(typedOrders);
    filename = `nine2five-orders-${from}-${to}.csv`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
