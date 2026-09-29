import { Link } from "@tanstack/react-router";
import { Heart, Home, ShoppingCart, User, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";

export function MobileNav() {
  const cart = useCart();
  const favorites = useFavorites();

  const items = [
    { to: "/", label: "Home", icon: Home, badge: 0 },
    { to: "/products", label: "Products", icon: UtensilsCrossed, badge: 0 },
    { to: "/favorites", label: "Favourites", icon: Heart, badge: favorites.count },
    { to: "/cart", label: "Cart", icon: ShoppingCart, badge: cart.count },
    { to: "/login", label: "Account", icon: User, badge: 0 },
  ] as const;

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background md:hidden"
    >
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.to === "/" }}
          aria-label={item.label}
          className="relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors"
          activeProps={{ className: "text-primary" }}
        >
          <span className="relative">
            <item.icon size={18} aria-hidden="true" />
            {item.badge > 0 && (
              <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {item.badge}
              </span>
            )}
          </span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
