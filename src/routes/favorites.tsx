import { createFileRoute, Link } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/SiteLayout";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useCatalog";
import { useFavorites } from "@/hooks/useFavorites";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favourites — Explorers Smash Burger" },
      { name: "description", content: "Your saved burgers at Explorers Smash Burger, ready to reorder." },
      { property: "og:title", content: "Favourites — Explorers Smash Burger" },
      { property: "og:description", content: "Your saved burgers, ready to reorder in one tap." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const favorites = useFavorites();
  const { data: products = [], isLoading } = useProducts();
  const saved = products.filter((product) => favorites.isFavorite(product.id));

  return (
    <SiteLayout>
      <PageHeader title="Favourites" subtitle="Everything you've hearted, in one place." />
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        {!isLoading && saved.length === 0 ? (
          <div className="border border-dashed border-border bg-surface px-6 py-20 text-center">
            <p className="font-display text-xl">No favourites yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Tap the heart on any burger to save it here.</p>
            <Link
              to="/products"
              aria-label="Browse products"
              className="mt-6 inline-flex items-center gap-2 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <UtensilsCrossed size={14} aria-hidden="true" /> Browse the menu
            </Link>
          </div>
        ) : (
          <ProductGrid products={saved} loading={isLoading} />
        )}
      </div>
    </SiteLayout>
  );
}
