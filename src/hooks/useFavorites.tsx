import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "esb.favorites.v1";

interface FavoritesValue {
  ids: string[];
  count: number;
  isFavorite: (id: string) => boolean;
  toggle: (id: string, name?: string) => void;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids, hydrated]);

  // Merge local favourites into the account once signed in.
  useEffect(() => {
    if (!user || !hydrated) return;
    let active = true;
    void (async () => {
      const { data } = await db.from("favorites").select("product_id").eq("user_id", user.id);
      if (!active) return;
      const remote = (data ?? []).map((row: { product_id: string }) => row.product_id);
      const merged = Array.from(new Set([...remote, ...ids]));
      const missing = merged.filter((id) => !remote.includes(id));
      if (missing.length > 0) {
        await db.from("favorites").insert(missing.map((id) => ({ user_id: user.id, product_id: id })));
      }
      if (active) setIds(merged);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hydrated]);

  const toggle = useCallback(
    (id: string, name?: string) => {
      setIds((current) => {
        const exists = current.includes(id);
        const next = exists ? current.filter((value) => value !== id) : [...current, id];
        if (user) {
          if (exists) {
            void db.from("favorites").delete().eq("user_id", user.id).eq("product_id", id);
          } else {
            void db.from("favorites").insert({ user_id: user.id, product_id: id });
          }
        }
        toast.success(exists ? "Removed from favourites" : "Added to favourites", { description: name });
        return next;
      });
    },
    [user],
  );

  const value = useMemo<FavoritesValue>(
    () => ({ ids, count: ids.length, isFavorite: (id: string) => ids.includes(id), toggle }),
    [ids, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
