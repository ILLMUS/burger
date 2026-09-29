import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { money, formatDate } from "@/lib/format";
import { ALL_STATUSES, STATUS_LABELS, statusClasses } from "@/lib/order-status";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Order | null>(null);

  const { data: orders = [] } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await db
        .from("orders")
        .select("*, order_items(id, product_name, quantity, price, subtotal)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Order[];
    },
    refetchInterval: 20_000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await db.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error: Error) => toast.error("Update failed", { description: error.message }),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Orders</h1>

      <div className="overflow-x-auto border border-border bg-background">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-surface text-left text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id} className="cursor-pointer hover:bg-surface" onClick={() => setSelected(order)}>
                <td className="px-4 py-3 font-semibold">{order.order_number}</td>
                <td className="px-4 py-3">{order.customer_name}</td>
                <td className="px-4 py-3">{order.phone}</td>
                <td className="px-4 py-3 capitalize">{order.order_type}</td>
                <td className="px-4 py-3">{money(order.total)}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "border px-2 py-1 text-[10px] font-bold uppercase tracking-widest",
                      statusClasses(order.status),
                    )}
                  >
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateStatus.mutate({ id: order.id, status: value as OrderStatus })}
                  >
                    <SelectTrigger className="h-9 w-40 rounded-none" aria-label={`Status for ${order.order_number}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg rounded-none">
          <DialogHeader>
            <DialogTitle className="font-display">{selected?.order_number}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-muted-foreground">Customer</p>
                <p>{selected.customer_name}</p>
                <p className="text-muted-foreground">Phone</p>
                <p>{selected.phone}</p>
                <p className="text-muted-foreground">WhatsApp</p>
                <p>{selected.whatsapp ?? "—"}</p>
                <p className="text-muted-foreground">Type</p>
                <p className="capitalize">{selected.order_type}</p>
                <p className="text-muted-foreground">Address</p>
                <p>{selected.address ?? "—"}</p>
                <p className="text-muted-foreground">Instructions</p>
                <p>{selected.instructions ?? "—"}</p>
                <p className="text-muted-foreground">Placed</p>
                <p>{formatDate(selected.created_at)}</p>
              </div>
              <ul className="space-y-1 border-t border-border pt-3">
                {(selected.order_items ?? []).map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity} × {item.product_name}
                    </span>
                    <span>{money(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-1 border-t border-border pt-3">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span> <span>{money(selected.subtotal)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span> <span>{money(selected.delivery_fee)}</span>
                </p>
                <p className="flex justify-between font-display text-base">
                  <span>Total</span> <span className="text-primary">{money(selected.total)}</span>
                </p>
              </div>
              <Select
                value={selected.status}
                onValueChange={(value) => {
                  updateStatus.mutate({ id: selected.id, status: value as OrderStatus });
                  setSelected({ ...selected, status: value as OrderStatus });
                }}
              >
                <SelectTrigger className="rounded-none" aria-label="Update order status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
