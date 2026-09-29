import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function AdminCategories() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await db.from("categories").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await db.from("categories").insert({
        name: name.trim(),
        slug: slugify(name),
        sort_order: categories.length + 1,
        active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setName("");
      toast.success("Category added");
      refresh();
    },
    onError: (error: Error) => toast.error("Could not add", { description: error.message }),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await db.from("categories").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (error: Error) => toast.error("Update failed", { description: error.message }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category deleted");
      refresh();
    },
    onError: (error: Error) => toast.error("Delete failed", { description: error.message }),
  });

  const move = (index: number, direction: -1 | 1) => {
    const current = categories[index];
    const swap = categories[index + direction];
    if (!current || !swap) return;
    update.mutate({ id: current.id, patch: { sort_order: swap.sort_order } });
    update.mutate({ id: swap.id, patch: { sort_order: current.sort_order } });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Categories</h1>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim().length < 2) return;
          create.mutate();
        }}
        className="flex gap-2 border border-border bg-background p-4"
      >
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New category name"
          aria-label="New category name"
          className="rounded-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-primary px-4 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={14} aria-hidden="true" /> Add
        </button>
      </form>

      <ul className="divide-y divide-border border border-border bg-background">
        {categories.map((category, index) => (
          <li key={category.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <Input
              defaultValue={category.name}
              onBlur={(event) => {
                const value = event.target.value.trim();
                if (value && value !== category.name) {
                  update.mutate({ id: category.id, patch: { name: value, slug: slugify(value) } });
                }
              }}
              className="w-56 rounded-none"
              aria-label={`Name for ${category.name}`}
            />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{category.slug}</span>
            <div className="ml-auto flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs uppercase tracking-widest">
                Active
                <Switch
                  checked={category.active}
                  onCheckedChange={(checked) => update.mutate({ id: category.id, patch: { active: checked } })}
                  aria-label={`Toggle ${category.name}`}
                />
              </label>
              <button
                type="button"
                aria-label={`Move ${category.name} up`}
                onClick={() => move(index, -1)}
                className="p-2 hover:bg-surface"
              >
                <ArrowUp size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={`Move ${category.name} down`}
                onClick={() => move(index, 1)}
                className="p-2 hover:bg-surface"
              >
                <ArrowDown size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={`Delete ${category.name}`}
                onClick={() => remove.mutate(category.id)}
                className="p-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
