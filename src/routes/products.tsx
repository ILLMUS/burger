import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/SiteLayout";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductGrid } from "@/components/ProductGrid";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories, useProducts } from "@/hooks/useCatalog";

type Search = { q?: string | undefined; category?: string | undefined };

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    category: typeof search["category"] === "string" ? search["category"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Menu — Explorers Smash Burger" },
      { name: "description", content: "Browse every burger on the Explorers Smash Burger menu in Zulwini." },
      { property: "og:title", content: "Menu — Explorers Smash Burger" },
      { property: "og:description", content: "Beef, smash, chicken, fish and veggie burgers. Order in seconds." },
    ],
  }),
  component: ProductsPage,
});

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Rating" },
  { value: "newest", label: "Newest" },
];

function ProductsPage() {
  const search = Route.useSearch();
  const [term, setTerm] = useState(search.q ?? "");
  const [category, setCategory] = useState(search.category ?? "all");
  const [sort, setSort] = useState("featured");
  const { data: categories = [] } = useCategories();
  const { data: products = [], isLoading } = useProducts();

  const visible = useMemo(() => {
    const query = term.trim().toLowerCase();
    let list = products.filter((product) => {
      const matchesCategory = category === "all" || product.categories?.slug === category;
      const matchesQuery =
        !query ||
        [product.name, product.description ?? "", product.categories?.name ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesQuery;
    });

    list = [...list];
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "rating":
        list.sort((a, b) => Number(b.rating) - Number(a.rating));
        break;
      case "newest":
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [products, term, category, sort]);

  return (
    <SiteLayout>
      <PageHeader title="The menu" subtitle="Smashed to order, served fast. Filter, search and sort your way." />

      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search the menu"
              aria-label="Search products"
              className="rounded-none pl-9"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full rounded-none sm:w-56" aria-label="Sort products">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CategoryFilter categories={categories} value={category} onChange={setCategory} />

        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {visible.length} item{visible.length === 1 ? "" : "s"}
        </p>

        <ProductGrid products={visible} loading={isLoading} emptyMessage="No burgers match that search." />
      </div>
    </SiteLayout>
  );
}
