import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { money, formatDate } from "@/lib/format";
import { STATUS_LABELS, statusClasses } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [ordersRes, productsRes] = await Promise.all([
        db.from("orders").select("*").order("created_at", { ascending: false }).limit(200),
        db.from("products").select("id", { count: "exact", head: true }),
      ]);
      if (ordersRes.error) throw ordersRes.error;
      return {
        orders: (ordersRes.data ?? []) as Order[],
        productCount: productsRes.count ?? 0,
      };
    },
    refetchInterval: 30_000,
  });

  const orders = data?.orders ?? [];
  const today = new Date().toDateString();
  const todays = orders.filter((order) => new Date(order.created_at).toDateString() === today);
  const revenue = todays
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total), 0);
  const pending = orders.filter((order) => order.status === "received" || order.status === "confirmed").length;
  const preparing = orders.filter((order) => order.status === "preparing").length;
  const completed = orders.filter((order) => order.status === "completed").length;

  const stats = [
    { label: "Orders today", value: String(todays.length) },
    { label: "Revenue today", value: money(revenue) },
    { label: "Pending", value: String(pending) },
    { label: "Preparing", value: String(preparing) },
    { label: "Completed", value: String(completed) },
    { label: "Products", value: String(data?.productCount ?? 0) },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl">Dashboard</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-border bg-background p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            <p className="mt-2 font-display text-2xl">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="border border-border bg-background">
        <p className="border-b border-border px-4 py-3 font-display text-base">Latest orders</p>
        <ul className="divide-y divide-border">
          {orders.slice(0, 8).map((order) => (
            <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold">{order.order_number}</p>
                <p className="text-xs text-muted-foreground">
                  {order.customer_name} · {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display">{money(order.total)}</span>
                <span
                  className={cn(
                    "border px-2 py-1 text-[10px] font-bold uppercase tracking-widest",
                    statusClasses(order.status),
                  )}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
            </li>
          ))}
          {orders.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted-foreground">No orders yet.</li>}
        </ul>
      </div>
    </div>
  );
}
