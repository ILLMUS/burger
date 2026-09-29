export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  image_url: string | null;
  image_key: string | null;
  rating: number;
  rating_count: number;
  available: boolean;
  active: boolean;
  featured: boolean;
  created_at: string;
  categories?: { name: string; slug: string } | null;
}

export interface StoreSettings {
  id: string;
  restaurant_name: string;
  location: string;
  whatsapp_number: string;
  phone_number: string;
  delivery_fee: number;
  minimum_order: number;
  opening_time: string;
  closing_time: string;
  facebook: string | null;
  instagram: string | null;
  website: string | null;
  logo_url: string | null;
}

export type OrderStatus =
  | "received"
  | "confirmed"
  | "preparing"
  | "ready"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  phone: string;
  whatsapp: string | null;
  order_type: "delivery" | "pickup";
  address: string | null;
  instructions: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_status: string;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
}

export interface CartLine {
  id: string;
  name: string;
  price: number;
  image_key: string | null;
  image_url: string | null;
  quantity: number;
}
