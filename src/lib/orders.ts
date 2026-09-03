import type { CartItem } from "@/lib/shop-store";
import { getSupabase } from "@/lib/supabase";

export type OrderStatus =
  "pendiente" | "pagado" | "preparado" | "enviado" | "retirado" | "cancelado";

export type OrderRow = {
  id: string;
  code: string;
  customer_id: string;
  status: OrderStatus;
  fulfillment: "retiro" | "envio";
  discount_code: string | null;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  notes: string;
  created_at: string;
  items?: OrderItemRow[];
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  image_url: string;
};

export type DiscountCode = {
  code: string;
  description: string;
  percent: number | null;
  amount: number | null;
  free_shipping: boolean;
  active: boolean;
};

export const SHIPPING_FEE = 4500;

export const orderStatusLabel: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  preparado: "Preparado",
  enviado: "Enviado",
  retirado: "Retirado",
  cancelado: "Cancelado",
};

export function quoteOrder(
  cart: CartItem[],
  fulfillment: "retiro" | "envio",
  coupon: DiscountCode | null,
  freeShippingFrom: number,
) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  let shipping = fulfillment === "envio" ? SHIPPING_FEE : 0;
  if (subtotal >= freeShippingFrom || coupon?.free_shipping) shipping = 0;
  let discount = 0;
  if (coupon?.percent) discount += Math.round((subtotal * coupon.percent) / 100);
  if (coupon?.amount) discount += coupon.amount;
  discount = Math.min(discount, subtotal);
  const total = Math.max(0, subtotal - discount + shipping);
  return { subtotal, shipping, discount, total };
}

export async function lookupDiscount(code: string): Promise<DiscountCode | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  const { data, error } = await getSupabase()
    .from("discount_codes")
    .select("code, description, percent, amount, free_shipping, active")
    .eq("code", normalized)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return (data as DiscountCode | null) ?? null;
}

export async function listDiscounts(): Promise<DiscountCode[]> {
  const { data, error } = await getSupabase()
    .from("discount_codes")
    .select("code, description, percent, amount, free_shipping, active")
    .eq("active", true)
    .order("code");
  if (error) throw error;
  return (data ?? []) as DiscountCode[];
}

export async function fetchOrders(customerId?: string): Promise<OrderRow[]> {
  let query = getSupabase().from("orders").select("*").order("created_at", { ascending: false });
  if (customerId) query = query.eq("customer_id", customerId);
  const { data, error } = await query;
  if (error) throw error;
  const orders = (data ?? []) as OrderRow[];
  if (!orders.length) return [];
  const { data: items, error: itemsError } = await getSupabase()
    .from("order_items")
    .select("*")
    .in(
      "order_id",
      orders.map((order) => order.id),
    );
  if (itemsError) throw itemsError;
  const byOrder = new Map<string, OrderItemRow[]>();
  for (const item of (items ?? []) as OrderItemRow[]) {
    const list = byOrder.get(item.order_id) ?? [];
    list.push(item);
    byOrder.set(item.order_id, list);
  }
  return orders.map((order) => ({ ...order, items: byOrder.get(order.id) ?? [] }));
}

export async function placeOrder(input: {
  customerId: string;
  cart: CartItem[];
  products: { id: string; image?: string }[];
  fulfillment: "retiro" | "envio";
  coupon: DiscountCode | null;
  notes: string;
  totals: { subtotal: number; shipping: number; discount: number; total: number };
}): Promise<OrderRow> {
  if (!input.cart.length) throw new Error("El carrito está vacío.");
  const { data, error } = await getSupabase()
    .from("orders")
    .insert({
      customer_id: input.customerId,
      status: "pagado",
      fulfillment: input.fulfillment,
      discount_code: input.coupon?.code ?? null,
      subtotal: input.totals.subtotal,
      shipping: input.totals.shipping,
      discount: input.totals.discount,
      total: input.totals.total,
      notes: input.notes.trim(),
    })
    .select("*")
    .single();
  if (error) throw error;
  const order = data as OrderRow;
  const rows = input.cart.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    name: item.name,
    quantity: item.qty,
    unit_price: item.price,
    image_url: input.products.find((product) => product.id === item.id)?.image ?? "",
  }));
  const { error: itemsError } = await getSupabase().from("order_items").insert(rows);
  if (itemsError) throw itemsError;
  return order;
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await getSupabase().from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}
