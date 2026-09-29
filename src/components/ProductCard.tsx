import { useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingCart, ShoppingBag } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RatingStars } from "@/components/RatingStars";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { productImage } from "@/lib/product-images";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

function IconAction({
  label,
  onClick,
  disabled,
  active,
  children,
  variant = "ghost",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  variant?: "ghost" | "solid";
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center border transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-40",
            variant === "solid"
              ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80"
              : "border-border bg-background text-foreground hover:border-primary hover:text-primary active:bg-accent",
            active && "border-primary text-primary",
          )}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent className="hidden md:block">{label}</TooltipContent>
    </Tooltip>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const favorites = useFavorites();
  const navigate = useNavigate();
  const { user } = useAuth();

  const favorite = favorites.isFavorite(product.id);
  const soldOut = !product.available;
  const isSignedIn = !!user;

  const goToLogin = () => {
    void navigate({ to: "/login" });
  };

  return (
    <article className="group flex h-full flex-col border border-border bg-card transition-colors hover:border-foreground/30">
      <div className="relative aspect-square w-full overflow-hidden bg-surface">
        <img
          src={productImage(product)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        <button
          type="button"
          aria-label={
            favorite
              ? `Remove ${product.name} from favourites`
              : `Add ${product.name} to favourites`
          }
          aria-pressed={favorite}
          onClick={() => favorites.toggle(product.id, product.name)}
          className={cn(
            "absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center border bg-background/95 transition-colors",
            "hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            favorite
              ? "border-primary text-primary"
              : "border-border text-foreground",
          )}
        >
          <Heart
            size={16}
            className={favorite ? "fill-primary" : ""}
            aria-hidden="true"
          />
        </button>

        {soldOut && (
          <span className="absolute left-2 top-2 bg-foreground px-2 py-1 text-[10px] font-bold tracking-widest text-background">
            SOLD OUT
          </span>
        )}

        {product.featured && !soldOut && (
          <span className="absolute left-2 top-2 bg-primary px-2 py-1 text-[10px] font-bold tracking-widest text-primary-foreground">
            FEATURED
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base leading-tight">
              {product.name}
            </h3>

            <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
              {product.categories?.name ?? "Menu"}
            </p>
          </div>

          {/* PRICE IS ONLY VISIBLE TO SIGNED-IN USERS */}
          <p className="shrink-0 font-display text-lg text-primary">
            {isSignedIn ? money(product.price) : "SIGN IN TO VIEW"}
          </p>
        </div>

        <RatingStars
          rating={product.rating}
          count={product.rating_count}
        />

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-3">
          {/* FAVOURITE */}
          <IconAction
            label={
              favorite
                ? `Remove ${product.name} from favourites`
                : `Save ${product.name} to favourites`
            }
            active={favorite}
            onClick={() => favorites.toggle(product.id, product.name)}
          >
            <Heart
              size={16}
              className={favorite ? "fill-primary" : ""}
              aria-hidden="true"
            />
          </IconAction>

          {/* ADD TO CART */}
          <IconAction
            label={
              soldOut
                ? `${product.name} is sold out`
                : !isSignedIn
                  ? "Sign in to order"
                  : `Add ${product.name} to cart`
            }
            disabled={soldOut}
            onClick={() => {
              if (!isSignedIn) {
                goToLogin();
                return;
              }

              cart.add(product);
            }}
          >
            <ShoppingCart size={16} aria-hidden="true" />
          </IconAction>

          {/* ORDER NOW */}
          <IconAction
            label={
              soldOut
                ? `${product.name} is sold out`
                : !isSignedIn
                  ? "Sign in to order"
                  : `Order ${product.name} now`
            }
            variant="solid"
            disabled={soldOut}
            onClick={() => {
              if (!isSignedIn) {
                goToLogin();
                return;
              }

              cart.add(product);
              void navigate({ to: "/checkout" });
            }}
          >
            <ShoppingBag size={16} aria-hidden="true" />
          </IconAction>
        </div>
      </div>
    </article>
  );
}