import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/SiteLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useCatalog";
import { placeOrder } from "@/lib/orders.functions";
import { buildWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { money } from "@/lib/format";
import { getStoreStatus } from "@/lib/store-hours";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Explorers Smash Burger" },
      { name: "description", content: "Confirm your details and send your burger order straight to our WhatsApp." },
      { property: "og:title", content: "Checkout — Explorers Smash Burger" },
      { property: "og:description", content: "Delivery or pickup, confirmed on WhatsApp in seconds." },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.string().trim().min(6, "Enter a valid phone number").max(30),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  instructions: z.string().trim().max(500).optional().or(z.literal("")),
});

function CheckoutPage() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [values, setValues] = useState({ name: "", phone: "", whatsapp: "", address: "", instructions: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = orderType === "delivery" ? Number(settings?.delivery_fee ?? 20) : 0;
  const total = cart.subtotal + deliveryFee;
  const status = getStoreStatus(settings?.opening_time, settings?.closing_time);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (cart.lines.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    const parsed = schema.safeParse(values);
    const nextErrors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
    }
    if (orderType === "delivery" && values.address.trim().length < 5) {
      nextErrors["address"] = "Enter a delivery address";
    }
    if (Object.keys(nextErrors).length > 0 || !parsed.success) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const order = await placeOrder({
        data: {
          customerId: user?.id ?? null,
          customerName: parsed.data.name,
          phone: parsed.data.phone,
          whatsapp: parsed.data.whatsapp || parsed.data.phone,
          orderType,
          address: orderType === "delivery" ? values.address.trim() : null,
          instructions: values.instructions.trim() || null,
          items: cart.lines.map((line) => ({ productId: line.id, quantity: line.quantity })),
        },
      });

      const message = buildWhatsappMessage(
        {
          orderNumber: order.order_number,
          customerName: parsed.data.name,
          phone: parsed.data.phone,
          orderType,
          ...(orderType === "delivery" ? { address: values.address.trim() } : {}),
          ...(values.instructions.trim() ? { instructions: values.instructions.trim() } : {}),
          lines: cart.lines,
          subtotal: cart.subtotal,
          deliveryFee,
          total,
        },
        settings ?? null,
      );

      cart.clear();
      window.open(whatsappLink(settings?.whatsapp_number ?? "", message), "_blank", "noopener");
      toast.success(`Order ${order.order_number} created`, { description: "Confirm it on WhatsApp to start cooking." });
      navigate({ to: "/track-order" });
    } catch (error) {
      toast.error("Could not place the order", { description: (error as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <PageHeader title="Checkout" subtitle="We create your order, then open WhatsApp to confirm it." />

      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        {cart.lines.length === 0 ? (
          <div className="border border-dashed border-border bg-surface px-6 py-20 text-center">
            <p className="font-display text-xl">Nothing to check out yet.</p>
            <Link
              to="/products"
              className="mt-6 inline-flex bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
            >
              Browse the menu
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_360px]" noValidate>
            <div className="space-y-6 border border-border p-6">
              {!status.open && (
                <p className="border border-warning/50 bg-warning/10 p-3 text-sm">
                  We're currently closed ({status.detail}). You can still place this order — it will be processed when
                  we open.
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={values.name}
                    onChange={(e) => setValues({ ...values, name: e.target.value })}
                    className="rounded-none"
                  />
                  {errors["name"] && <p className="text-xs text-destructive">{errors["name"]}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    value={values.phone}
                    onChange={(e) => setValues({ ...values, phone: e.target.value })}
                    className="rounded-none"
                  />
                  {errors["phone"] && <p className="text-xs text-destructive">{errors["phone"]}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp number</Label>
                <Input
                  id="whatsapp"
                  value={values.whatsapp}
                  onChange={(e) => setValues({ ...values, whatsapp: e.target.value })}
                  placeholder="Same as phone if left blank"
                  className="rounded-none"
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Order type</p>
                <div className="grid grid-cols-2 border border-border">
                  {(["delivery", "pickup"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderType(type)}
                      aria-pressed={orderType === type}
                      className={cn(
                        "px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors",
                        orderType === type ? "bg-primary text-primary-foreground" : "bg-background hover:bg-surface",
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {orderType === "delivery" && (
                <div className="space-y-1.5">
                  <Label htmlFor="address">Delivery address</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    value={values.address}
                    onChange={(e) => setValues({ ...values, address: e.target.value })}
                    className="rounded-none"
                  />
                  {errors["address"] && <p className="text-xs text-destructive">{errors["address"]}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="instructions">Additional instructions</Label>
                <Textarea
                  id="instructions"
                  rows={3}
                  value={values.instructions}
                  onChange={(e) => setValues({ ...values, instructions: e.target.value })}
                  placeholder="No onions, extra sauce, call on arrival..."
                  className="rounded-none"
                />
              </div>
            </div>

            <aside className="h-fit border border-border p-6">
              <h2 className="font-display text-lg">Order summary</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {cart.lines.map((line) => (
                  <li key={line.id} className="flex justify-between gap-3">
                    <span className="truncate">
                      {line.quantity} × {line.name}
                    </span>
                    <span>{money(line.price * line.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{money(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd>{orderType === "pickup" ? "—" : money(deliveryFee)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 font-display text-lg">
                  <dt>Total</dt>
                  <dd className="text-primary">{money(total)}</dd>
                </div>
              </dl>
              <button
                type="submit"
                disabled={submitting}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-primary px-5 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <MessageCircle size={16} aria-hidden="true" />
                {submitting ? "Placing order..." : "Order via WhatsApp"}
              </button>
            </aside>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
