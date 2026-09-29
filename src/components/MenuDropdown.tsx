import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu as MenuIcon } from "lucide-react";
import { useCategories, useProducts } from "@/hooks/useCatalog";
import { productImage } from "@/lib/product-images";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

const CLOSE_DELAY = 180;

function useMenuData() {
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  return { categories, products };
}

function useDismiss(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointer = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest("[data-menu-dropdown]")) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close]);
}

function productsFor(products: Product[], slug: string) {
  return slug === "all" ? products : products.filter((p) => p.categories?.slug === slug);
}

function MegaPanel({ onNavigate }: { onNavigate: () => void }) {
  const { categories, products } = useMenuData();
  const [active, setActive] = useState("all");

  const rows = useMemo(() => {
    const firstImage = (slug: string) => {
      const found = productsFor(products, slug)[0];
      return found ? productImage(found) : null;
    };
    return [
      { slug: "all", name: "All Burgers", image: firstImage("all") },
      ...categories.map((category) => ({
        slug: category.slug,
        name: category.name,
        image: firstImage(category.slug),
      })),
    ];
  }, [categories, products]);

  const shown = useMemo(() => productsFor(products, active).slice(0, 6), [products, active]);

  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <div className="w-64 shrink-0 border-r border-border py-2">
        {rows.map((row) => (
          <Link
            key={row.slug}
            to="/products"
            search={{ category: row.slug === "all" ? undefined : row.slug }}
            onMouseEnter={() => setActive(row.slug)}
            onFocus={() => setActive(row.slug)}
            onClick={onNavigate}
            className={cn(
              "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold transition-colors",
              active === row.slug ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface hover:text-primary",
            )}
          >
            {row.image ? (
              <img src={row.image} alt="" width={36} height={36} className="h-9 w-9 border border-border object-cover" />
            ) : (
              <span className="h-9 w-9 border border-border bg-surface" />
            )}
            {row.name}
          </Link>
        ))}
        <div className="border-t border-border px-4 pt-3 pb-1">
          <Link
            to="/products"
            onClick={onNavigate}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
          >
            View full menu
          </Link>
        </div>
      </div>

      <div className="hidden flex-1 grid-cols-3 gap-x-8 gap-y-6 p-6 md:grid">
        {shown.map((product) => (
          <Link
            key={product.id}
            to="/products"
            search={{ category: active === "all" ? undefined : active }}
            onClick={onNavigate}
            className="group"
          >
            <div className="aspect-square w-full overflow-hidden border border-border bg-surface">
              <img
                src={productImage(product)}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <p className="mt-2 text-sm font-bold text-foreground group-hover:text-primary">{product.name}</p>
            <p className="text-xs font-semibold text-muted-foreground">{money(product.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MobilePanel({ onNavigate }: { onNavigate: () => void }) {
  const { categories, products } = useMenuData();

  const rows = useMemo(() => {
    const firstImage = (slug: string) => {
      const found = productsFor(products, slug)[0];
      return found ? productImage(found) : null;
    };
    return [
      { slug: "all", name: "All Burgers", image: firstImage("all") },
      ...categories.map((category) => ({
        slug: category.slug,
        name: category.name,
        image: firstImage(category.slug),
      })),
    ];
  }, [categories, products]);

  return (
    <div className="py-2">
      {rows.map((row) => (
        <Link
          key={row.slug}
          to="/products"
          search={{ category: row.slug === "all" ? undefined : row.slug }}
          onClick={onNavigate}
          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          {row.image ? (
            <img src={row.image} alt="" width={40} height={40} className="h-10 w-10 border border-border object-cover" />
          ) : (
            <span className="h-10 w-10 border border-border bg-surface" />
          )}
          {row.name}
        </Link>
      ))}
      <div className="border-t border-border px-4 pt-3">
        <Link
          to="/products"
          onClick={onNavigate}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary"
        >
          View full menu
        </Link>
      </div>
    </div>
  );
}

type MenuDropdownProps = {
  trigger: string;
  mobile?: boolean;
  className?: string;
};

/** Desktop "Menu" mega dropdown + mobile hamburger dropdown under the sticky header. */
export function MenuDropdown({ trigger, mobile = false, className }: MenuDropdownProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);
  const close = () => setOpen(false);

  const cancelClose = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };
  const scheduleClose = () => {
    cancelClose();
    timer.current = window.setTimeout(close, CLOSE_DELAY);
  };

  useDismiss(open, close);

  return (
    <div
      data-menu-dropdown
      className={cn("static", className, mobile && "md:hidden")}
      onMouseEnter={mobile ? undefined : () => { cancelClose(); setOpen(true); }}
      onMouseLeave={mobile ? undefined : scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={mobile ? "Open menu" : undefined}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          mobile
            ? "inline-flex h-10 w-10 items-center justify-center border border-transparent text-foreground transition-colors hover:border-border hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            : "flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:text-primary",
          !mobile && open && "text-primary",
        )}
      >
        {mobile ? (
          <MenuIcon size={18} aria-hidden="true" />
        ) : (
          <>
            {trigger}
            <ChevronDown size={14} aria-hidden="true" className={cn("transition-transform", open && "rotate-180")} />
          </>
        )}
      </button>

      {open && (
        <div
          data-menu-dropdown
          className={cn(
            "absolute inset-x-0 top-full z-50 border-b border-border bg-background shadow-lg",
            mobile && "max-h-[70vh] overflow-y-auto",
          )}
          onMouseEnter={mobile ? undefined : cancelClose}
          onMouseLeave={mobile ? undefined : scheduleClose}
        >
          {mobile ? <MobilePanel onNavigate={close} /> : <MegaPanel onNavigate={close} />}
        </div>
      )}
    </div>
  );
}
