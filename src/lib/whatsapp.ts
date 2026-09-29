import { money } from "./format";
import type { CartLine, StoreSettings } from "./types";

export interface OrderDraft {
  orderNumber: string;
  customerName: string;
  phone: string;
  orderType: "delivery" | "pickup";
  address?: string;
  instructions?: string;
  lines: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export function buildWhatsappMessage(draft: OrderDraft, settings: StoreSettings | null): string {
  const name = settings?.restaurant_name ?? "Explorers Smash Burger";
  const rows = draft.lines
    .map((line) => `${line.quantity} x ${line.name} — ${money(line.price * line.quantity)}`)
    .join("\n");

  const parts = [
    `*${name}*`,
    `Order: ${draft.orderNumber}`,
    "",
    `Customer: ${draft.customerName}`,
    `Phone: ${draft.phone}`,
    `Order type: ${draft.orderType === "delivery" ? "Delivery" : "Pickup"}`,
  ];

  if (draft.orderType === "delivery" && draft.address) parts.push(`Address: ${draft.address}`);

  parts.push("", "*Items*", rows, "", `Subtotal: ${money(draft.subtotal)}`);
  if (draft.orderType === "delivery") parts.push(`Delivery: ${money(draft.deliveryFee)}`);
  parts.push(`*TOTAL: ${money(draft.total)}*`);
  if (draft.instructions) parts.push("", `Instructions: ${draft.instructions}`);

  return parts.join("\n");
}

export function whatsappLink(number: string | undefined | null, message: string): string {
  const digits = (number ?? "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
