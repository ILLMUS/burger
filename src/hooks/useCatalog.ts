import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";
import type { Category, Product, StoreSettings } from "@/lib/types";

export function useSettings() {
  return useQuery({
    queryKey: ["store_settings"],
    queryFn: async (): Promise<StoreSettings | null> => {
      const { data, error } = await db.from("store_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return (data as StoreSettings) ?? null;
    },
    staleTime: 60_000,
  });
}

export function useCategories(activeOnly = true) {
  return useQuery({
    queryKey: ["categories", activeOnly],
    queryFn: async (): Promise<Category[]> => {
      let query = db.from("categories").select("*").order("sort_order", { ascending: true });
      if (activeOnly) query = query.eq("active", true);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Category[];
    },
    staleTime: 60_000,
  });
}

export function useProducts(options: { activeOnly?: boolean } = {}) {
  const activeOnly = options.activeOnly ?? true;
  return useQuery({
    queryKey: ["products", activeOnly],
    queryFn: async (): Promise<Product[]> => {
      let query = db
        .from("products")
        .select("*, categories(name, slug)")
        .order("created_at", { ascending: true });
      if (activeOnly) query = query.eq("active", true);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Product[];
    },
    staleTime: 30_000,
  });
}
