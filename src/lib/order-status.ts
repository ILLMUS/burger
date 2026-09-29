import type { OrderStatus } from "./types";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Order received",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  ready_for_pickup: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ALL_STATUSES: OrderStatus[] = [
  "received",
  "confirmed",
  "preparing",
  "ready",
  "ready_for_pickup",
  "out_for_delivery",
  "completed",
  "cancelled",
];

export const DELIVERY_FLOW: OrderStatus[] = [
  "received",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
];

export const PICKUP_FLOW: OrderStatus[] = [
  "received",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "completed",
];

export function statusClasses(status: OrderStatus): string {
  switch (status) {
    case "received":
      return "bg-surface text-muted-foreground border-border";
    case "confirmed":
      return "bg-foreground text-background border-foreground";
    case "preparing":
      return "bg-primary text-primary-foreground border-primary";
    case "ready":
    case "ready_for_pickup":
      return "bg-warning/15 text-warning border-warning/40";
    case "out_for_delivery":
      return "bg-info/12 text-info border-info/40";
    case "completed":
      return "bg-success/12 text-success border-success/40";
    case "cancelled":
      return "bg-destructive/12 text-destructive border-destructive/40";
    default:
      return "bg-surface text-muted-foreground border-border";
  }
}
