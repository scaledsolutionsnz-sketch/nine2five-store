export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type CampaignStatus = "draft" | "sent";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number; // NZD cents
  compare_at_price: number | null; // NZD cents
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
  subtotal: number; // cents
  shipping_cost: number; // cents
  total: number; // cents
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
  unit_price: number; // cents
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { product?: Product })[];
  customer?: Customer | null;
}

export interface EmailCampaign {
  id: string;
  subject: string;
  body_html: string;
  status: CampaignStatus;
  sent_at: string | null;
  recipient_count: number | null;
  created_at: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  size: string;
  price: number; // cents
  compareAtPrice: number | null;
  imageUrl: string | null;
  quantity: number;
}
