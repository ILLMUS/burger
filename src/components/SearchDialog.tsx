import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/useCatalog";
import { productImage } from "@/lib/product-images";
import { money } from "@/lib/format";

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [term, setTerm] = useState("");
  const { data: products = [] } = useProducts();

  const results = useMemo(() => {
    const query = term.trim().toLowerCase();
    if (!query) return products.slice(0, 6);
    return products.filter((product) =>
      [product.name, product.description ?? "", product.categories?.name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [term, products]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 rounded-none p-0">
        <DialogHeader className="border-b border-border p-4">
          <DialogTitle className="text-left text-sm">Search the menu</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search size={16} className="text-muted-foreground" aria-hidden="true" />
          <Input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search burgers, categories, ingredients..."
            aria-label="Search products"
            className="rounded-none border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">No matches found.</p>
          )}
          {results.map((product) => (
            <Link
              key={product.id}
              to="/products"
              search={{ q: product.name }}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-surface"
            >
              <img
                src={productImage(product)}
                alt={product.name}
                loading="lazy"
                className="h-12 w-12 object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{product.name}</span>
                <span className="block text-xs uppercase tracking-widest text-muted-foreground">
                  {product.categories?.name}
                </span>
              </span>
              <span className="font-display text-sm text-primary">{money(product.price)}</span>
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
