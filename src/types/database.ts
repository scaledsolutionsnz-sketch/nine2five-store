// ─── Enums ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type CampaignStatus = "draft" | "sent";

export type CampaignSegment = "all" | "subscribed" | "high_value";

export type AffiliateStatus = "pending" | "active" | "suspended";

export type AffiliateConversionStatus = "pending" | "approved" | "paid" | "reversed";

export type PayoutStatus = "pending" | "processing" | "completed" | "failed";

export type StockMovementType =
  | "sale"
  | "restock"
  | "damaged"
  | "returned"
  | "adjustment"
  | "reserved"
  | "reservation_released";

export type DiscountType = "percentage" | "fixed";

export type PurchaseOrderStatus = "draft" | "ordered" | "in_transit" | "received" | "cancelled";

// ─── Core Ecommerce ───────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;               // NZD cents
  compare_at_price: number | null;
  image_urls: string[];
  active: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: "6-9" | "10-13";
  stock_quantity: number;
  sku: string | null;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  user_id: string | null;
  accepts_marketing: boolean;
  default_shipping_address: ShippingAddress | null;
  lifetime_value_cents: number;
  created_at: string;
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postcode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  order_number: number;
  customer_id: string | null;
  guest_email: string | null;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  discount_code: string | null;
  discount_amount_cents: number;
  affiliate_code: string | null;
  affiliate_conversion_id: string | null;
  shipping_address: ShippingAddress;
  stripe_payment_intent_id: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { product?: Product })[];
  customer?: Customer | null;
}

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  size: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  quantity: number;
}

export interface EmailCampaign {
  id: string;
  subject: string;
  body_html: string;
  status: CampaignStatus;
  segment: CampaignSegment;
  sent_at: string | null;
  recipient_count: number | null;
  opens: number;
  clicks: number;
  created_at: string;
}

// ─── Discount Codes ───────────────────────────────────────────────────────────

export interface DiscountCode {
  id: string;
  code: string;
  type: DiscountType;
  value: number;               // % or cents
  min_order_cents: number;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

// ─── Affiliates ───────────────────────────────────────────────────────────────

export interface Affiliate {
  id: string;
  user_id: string | null;
  email: string;
  name: string;
  referral_code: string;
  commission_rate: number;     // %
  status: AffiliateStatus;
  stripe_account_id: string | null;
  total_clicks: number;
  total_conversions: number;
  total_commission_cents: number;
  total_paid_cents: number;
  notes: string | null;
  created_at: string;
  approved_at: string | null;
}

export interface AffiliateClick {
  id: string;
  affiliate_id: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  landing_page: string | null;
  created_at: string;
}

export interface AffiliateConversion {
  id: string;
  affiliate_id: string;
  order_id: string | null;
  order_total_cents: number;
  commission_cents: number;
  status: AffiliateConversionStatus;
  created_at: string;
}

export interface AffiliatePayout {
  id: string;
  affiliate_id: string;
  amount_cents: number;
  status: PayoutStatus;
  stripe_transfer_id: string | null;
  period_start: string | null;
  period_end: string | null;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface StockMovement {
  id: string;
  variant_id: string;
  type: StockMovementType;
  quantity: number;
  reference_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string | null;
  status: PurchaseOrderStatus;
  expected_at: string | null;
  received_at: string | null;
  notes: string | null;
  total_cost_cents: number | null;
  created_by: string | null;
  created_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  variant_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost_cents: number | null;
  created_at: string;
}

// ─── CRM ─────────────────────────────────────────────────────────────────────

export interface CustomerTag {
  id: string;
  customer_id: string;
  tag: string;
  created_at: string;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  note: string;
  created_by: string;
  created_at: string;
}

export interface Wishlist {
  id: string;
  customer_id: string;
  product_id: string;
  created_at: string;
}

export interface BackInStockNotification {
  id: string;
  email: string;
  product_id: string;
  variant_id: string | null;
  notified_at: string | null;
  created_at: string;
}

export interface CartSession {
  id: string;
  session_id: string;
  email: string | null;
  items: CartItem[];
  affiliate_code: string | null;
  discount_code: string | null;
  country: string;
  recovery_sent_at: string | null;
  converted_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  actor: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export interface DashboardMetrics {
  revenue_today_cents: number;
  revenue_this_month_cents: number;
  revenue_last_month_cents: number;
  orders_today: number;
  orders_this_month: number;
  total_customers: number;
  new_customers_this_month: number;
  pending_orders: number;
  low_stock_variants: number;
}
