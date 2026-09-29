import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Search } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/SiteLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lookupOrder } from "@/lib/track.functions";
import { DELIVERY_FLOW, PICKUP_FLOW, STATUS_LABELS, statusClasses } from "@/lib/order-status";
import { money, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track your order — Explorers Smash Burger" },
      { name: "description", content: "Enter your order number and phone to follow your burger order live." },
      { property: "og:title", content: "Track your order — Explorers Smash Burger" },
      { property: "og:description", content: "Follow your Explorers Smash Burger order from grill to door." },
    ],
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      toast.error("Enter your order number and phone number");
      return;
    }
    setLoading(true);
    try {
      const result = await lookupOrder({ data: { orderNumber: orderNumber.trim(), phone: phone.trim() } });
      if (!result) {
        setOrder(null);
        toast.error("Order not found", { description: "Check the order number and phone number." });
      } else {
        setOrder(result as Order);
      }
    } catch (error) {
      toast.error("Could not load the order", { description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const flow = order?.order_type === "pickup" ? PICKUP_FLOW : DELIVERY_FLOW;
  const currentIndex = order ? flow.indexOf(order.status) : -1;

  return (
    <SiteLayout>
      <PageHeader title="Track your order" subtitle="Use the order number we generated at checkout." />

      <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10">
        <form onSubmit={search} className="grid gap-4 border border-border p-6 sm:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="order-number">Order number</Label>
            <Input
              id="order-number"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="ESB-2026-00125"
              className="rounded-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="track-phone">Phone number</Label>
            <Input
              id="track-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="76427025"
              className="rounded-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-auto inline-flex h-10 items-center justify-center gap-2 bg-primary px-5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Search size={14} aria-hidden="true" />
            {loading ? "Checking" : "Track"}
          </button>
        </form>

        {order && (
          <div className="space-y-6 border border-border p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl">{order.order_number}</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
              </div>
              <span
                className={cn(
                  "border px-3 py-1 text-[11px] font-bold uppercase tracking-widest",
                  statusClasses(order.status),
                )}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>

            {order.status === "cancelled" ? (
              <p className="border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                This order was cancelled. Please contact us if this looks wrong.
              </p>
            ) : (
              <ol className="space-y-0">
                {flow.map((step: OrderStatus, index) => {
                  const done = index <= currentIndex;
                  return (
                    <li key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "inline-flex h-7 w-7 items-center justify-center border text-[11px] font-bold",
                            done
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground",
                          )}
                        >
                          {done ? <Check size={13} aria-hidden="true" /> : index + 1}
                        </span>
                        {index < flow.length - 1 && (
                          <span className={cn("h-10 w-px", done ? "bg-primary" : "bg-border")} />
                        )}
                      </div>
                      <p className={cn("pt-1 text-sm", done ? "font-semibold" : "text-muted-foreground")}>
                        {STATUS_LABELS[step]}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Items</p>
              <ul className="mt-3 space-y-1 text-sm">
                {(order.order_items ?? []).map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity} × {item.product_name}
                    </span>
                    <span>{money(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-border pt-3 font-display">
                <span>Total</span>
                <span className="text-primary">{money(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
