import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { money, formatDate } from "@/lib/format";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

interface CustomerRow {
  name: string;
  phone: string;
  orders: number;
  spend: number;
  last: string;
}

function AdminCustomers() {
  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async (): Promise<CustomerRow[]> => {
      const { data, error } = await db
        .from("orders")
        .select("customer_name, phone, total, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const map = new Map<string, CustomerRow>();
      for (const order of (data ?? []) as Order[]) {
        const key = order.phone;
        const existing = map.get(key);
        const spend = order.status === "cancelled" ? 0 : Number(order.total);
        if (existing) {
          existing.orders += 1;
          existing.spend += spend;
        } else {
          map.set(key, {
            name: order.customer_name,
            phone: order.phone,
            orders: 1,
            spend,
            last: order.created_at,
          });
        }
      }
      return [...map.values()].sort((a, b) => b.spend - a.spend);
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Customers</h1>
      <div className="overflow-x-auto border border-border bg-background">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-surface text-left text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total spend</th>
              <th className="px-4 py-3">Last order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.phone}>
                <td className="px-4 py-3 font-semibold">{row.name}</td>
                <td className="px-4 py-3">{row.phone}</td>
                <td className="px-4 py-3">{row.orders}</td>
                <td className="px-4 py-3">{money(row.spend)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(row.last)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
