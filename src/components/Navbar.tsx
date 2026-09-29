import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import { SearchDialog } from "@/components/SearchDialog";
import { StoreStatus } from "@/components/StoreStatus";
import { MenuDropdown } from "@/components/MenuDropdown";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useSettings } from "@/hooks/useCatalog";
import { cn } from "@/lib/utils";
import logoMark from "@/assets/logo-mark.png";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

function Counter({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[10px] font-bold text-primary-foreground">
      {value}
    </span>
  );
}

const iconClass =
  "relative inline-flex h-10 w-10 items-center justify-center border border-transparent text-foreground transition-colors hover:border-border hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const cart = useCart();
  const favorites = useFavorites();
  const { data: settings } = useSettings();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4">
          <Link to="/" className="flex items-center gap-2" aria-label="Explorers Smash Burger home">
            <img src={logoMark} alt="" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-sm tracking-tight sm:text-base">
                Explorers <span className="text-primary">Smash</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {settings?.location ?? "Zulwini, Eswatini"}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === "/" }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                {link.label}
              </Link>
            ))}
            <MenuDropdown trigger="Menu" />
          </nav>

          <div className="flex items-center gap-0.5">
            <MenuDropdown trigger="Menu" mobile />
            <StoreStatus className="mr-2 hidden lg:inline-flex" showDetail={false} />
            <button type="button" aria-label="Search products" className={iconClass} onClick={() => setSearchOpen(true)}>
              <Search size={18} aria-hidden="true" />
            </button>
            <Link to="/favorites" aria-label="Favourites" className={iconClass}>
              <Heart size={18} aria-hidden="true" />
              <Counter value={favorites.count} />
            </Link>
            <Link to="/cart" aria-label="Cart" className={iconClass}>
              <ShoppingCart size={18} aria-hidden="true" />
              <Counter value={cart.count} />
            </Link>
            <Link to="/login" aria-label="Account" className={cn(iconClass, "hidden md:inline-flex")}>
              <User size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
