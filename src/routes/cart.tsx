import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/SiteLayout";
import { useCart } from "@/hooks/useCart";
import { useSettings } from "@/hooks/useCatalog";
import { productImage } from "@/lib/product-images";
import { money } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — Explorers Smash Burger" },
      { name: "description", content: "Review your Explorers Smash Burger order before checkout." },
      { property: "og:title", content: "Cart — Explorers Smash Burger" },
      { property: "og:description", content: "Review your burger order before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { data: settings } = useSettings();
  const deliveryFee = Number(settings?.delivery_fee ?? 20);
  const total = cart.subtotal + (cart.lines.length > 0 ? deliveryFee : 0);

  return (
    <SiteLayout>
      <PageHeader title="Your cart" subtitle={`${cart.count} item${cart.count === 1 ? "" : "s"} ready to go.`} />

      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        {cart.lines.length === 0 ? (
          <div className="border border-dashed border-border bg-surface px-6 py-20 text-center">
            <p className="font-display text-xl">Your cart is empty.</p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <UtensilsCrossed size={14} aria-hidden="true" /> Start your order
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <ul className="divide-y divide-border border border-border">
              {cart.lines.map((line) => (
                <li key={line.id} className="flex gap-4 p-4">
                  <img
                    src={productImage(line)}
                    alt={line.name}
                    loading="lazy"
                    className="h-20 w-20 shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate font-semibold">{line.name}</p>
                      <button
                        type="button"
                        aria-label={`Remove ${line.name}`}
                        onClick={() => cart.remove(line.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">{money(line.price)} each</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-border">
                        <button
                          type="button"
                          aria-label={`Decrease ${line.name}`}
                          onClick={() => cart.decrease(line.id)}
                          className="inline-flex h-9 w-9 items-center justify-center hover:bg-surface"
                        >
                          <Minus size={14} aria-hidden="true" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${line.name}`}
                          onClick={() => cart.increase(line.id)}
                          className="inline-flex h-9 w-9 items-center justify-center hover:bg-surface"
                        >
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>
                      <p className="font-display text-base text-primary">{money(line.price * line.quantity)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit border border-border p-6">
              <h2 className="font-display text-lg">Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{money(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd>{money(deliveryFee)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 font-display text-lg">
                  <dt>Total</dt>
                  <dd className="text-primary">{money(total)}</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-muted-foreground">
                Delivery is removed automatically if you choose pickup at checkout.
              </p>
              <Link
                to="/checkout"
                className="mt-5 inline-flex w-full items-center justify-center bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Checkout
              </Link>
              <button
                type="button"
                onClick={cart.clear}
                className="mt-2 w-full border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors hover:border-destructive hover:text-destructive"
              >
                Clear cart
              </button>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
