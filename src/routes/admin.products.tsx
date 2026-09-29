import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useCatalog";
import { productImage } from "@/lib/product-images";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

interface Draft {
  id?: string;
  name: string;
  description: string;
  price: string;
  category_id: string;
  image_url: string;
  featured: boolean;
  available: boolean;
  active: boolean;
}

const EMPTY: Draft = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  image_url: "",
  featured: false,
  available: true,
  active: true,
};

function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await db
        .from("products")
        .select("*, categories(name, slug)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

  const refresh = () => queryClient.invalidateQueries();

  const save = useMutation({
    mutationFn: async (value: Draft) => {
      const payload = {
        name: value.name.trim(),
        description: value.description.trim() || null,
        price: Number(value.price || 0),
        category_id: value.category_id || null,
        image_url: value.image_url.trim() || null,
        featured: value.featured,
        available: value.available,
        active: value.active,
      };
      const query = value.id
        ? db.from("products").update(payload).eq("id", value.id)
        : db.from("products").insert(payload);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product saved");
      setDraft(null);
      refresh();
    },
    onError: (error: Error) => toast.error("Save failed", { description: error.message }),
  });

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await db.from("products").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (error: Error) => toast.error("Update failed", { description: error.message }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted");
      refresh();
    },
    onError: (error: Error) => toast.error("Delete failed", { description: error.message }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Products</h1>
        <button
          type="button"
          onClick={() => setDraft({ ...EMPTY })}
          className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={14} aria-hidden="true" /> New product
        </button>
      </div>

      <div className="overflow-x-auto border border-border bg-background">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-surface text-left text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">In stock</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={productImage(product)} alt="" className="h-10 w-10 object-cover" />
                    <span className="font-semibold">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{product.categories?.name ?? "—"}</td>
                <td className="px-4 py-3">{money(product.price)}</td>
                <td className="px-4 py-3">
                  <Switch
                    checked={product.available}
                    onCheckedChange={(checked) => patch.mutate({ id: product.id, values: { available: checked } })}
                    aria-label={`Availability for ${product.name}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={product.active}
                    onCheckedChange={(checked) => patch.mutate({ id: product.id, values: { active: checked } })}
                    aria-label={`Active state for ${product.name}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label={`Edit ${product.name}`}
                      onClick={() =>
                        setDraft({
                          id: product.id,
                          name: product.name,
                          description: product.description ?? "",
                          price: String(product.price),
                          category_id: product.category_id ?? "",
                          image_url: product.image_url ?? "",
                          featured: product.featured,
                          available: product.available,
                          active: product.active,
                        })
                      }
                      className="p-2 hover:bg-surface"
                    >
                      <Pencil size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${product.name}`}
                      onClick={() => remove.mutate(product.id)}
                      className="p-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-w-lg rounded-none">
          <DialogHeader>
            <DialogTitle className="font-display">{draft?.id ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                save.mutate(draft);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="p-name">Name</Label>
                <Input
                  id="p-name"
                  required
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  className="rounded-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="p-price">Price (E)</Label>
                  <Input
                    id="p-price"
                    type="number"
                    step="0.01"
                    required
                    value={draft.price}
                    onChange={(event) => setDraft({ ...draft, price: event.target.value })}
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-category">Category</Label>
                  <Select
                    value={draft.category_id}
                    onValueChange={(value) => setDraft({ ...draft, category_id: value })}
                  >
                    <SelectTrigger id="p-category" className="rounded-none">
                      <SelectValue placeholder="Choose" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-description">Description</Label>
                <Textarea
                  id="p-description"
                  rows={3}
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  className="rounded-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-image">Image URL</Label>
                <Input
                  id="p-image"
                  value={draft.image_url}
                  onChange={(event) => setDraft({ ...draft, image_url: event.target.value })}
                  placeholder="Leave blank to use the built-in photo"
                  className="rounded-none"
                />
              </div>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-xs uppercase tracking-widest">
                  Featured
                  <Switch
                    checked={draft.featured}
                    onCheckedChange={(checked) => setDraft({ ...draft, featured: checked })}
                  />
                </label>
                <label className="flex items-center gap-2 text-xs uppercase tracking-widest">
                  In stock
                  <Switch
                    checked={draft.available}
                    onCheckedChange={(checked) => setDraft({ ...draft, available: checked })}
                  />
                </label>
                <label className="flex items-center gap-2 text-xs uppercase tracking-widest">
                  Active
                  <Switch
                    checked={draft.active}
                    onCheckedChange={(checked) => setDraft({ ...draft, active: checked })}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={save.isPending}
                className="w-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {save.isPending ? "Saving..." : "Save product"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
