import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StoreSettings } from "@/lib/types";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const FIELDS: { key: keyof StoreSettings; label: string; type?: string }[] = [
  { key: "restaurant_name", label: "Restaurant name" },
  { key: "location", label: "Location" },
  { key: "whatsapp_number", label: "WhatsApp number" },
  { key: "phone_number", label: "Phone number" },
  { key: "delivery_fee", label: "Delivery fee (E)", type: "number" },
  { key: "minimum_order", label: "Minimum order (E)", type: "number" },
  { key: "opening_time", label: "Opening time", type: "time" },
  { key: "closing_time", label: "Closing time", type: "time" },
  { key: "facebook", label: "Facebook URL" },
  { key: "instagram", label: "Instagram URL" },
  { key: "website", label: "Website" },
  { key: "logo_url", label: "Logo URL" },
];

function AdminSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: settings } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async (): Promise<StoreSettings | null> => {
      const { data, error } = await db.from("store_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return (data as StoreSettings) ?? null;
    },
  });

  useEffect(() => {
    if (!settings) return;
    const next: Record<string, string> = {};
    for (const field of FIELDS) {
      const value = settings[field.key];
      next[field.key as string] = value === null || value === undefined ? "" : String(value);
    }
    setForm(next);
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      if (!settings) throw new Error("Settings not loaded");
      const patch: Record<string, unknown> = {};
      for (const field of FIELDS) {
        const raw = form[field.key as string] ?? "";
        patch[field.key as string] = field.type === "number" ? Number(raw || 0) : raw || null;
      }
      const { error } = await db.from("store_settings").update(patch).eq("id", settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => toast.error("Save failed", { description: error.message }),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl">Store settings</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        className="grid gap-4 border border-border bg-background p-6 sm:grid-cols-2"
      >
        {FIELDS.map((field) => (
          <div key={String(field.key)} className="space-y-1.5">
            <Label htmlFor={String(field.key)}>{field.label}</Label>
            <Input
              id={String(field.key)}
              type={field.type ?? "text"}
              value={form[field.key as string] ?? ""}
              onChange={(event) => setForm({ ...form, [field.key as string]: event.target.value })}
              className="rounded-none"
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={save.isPending}
            className="bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {save.isPending ? "Saving..." : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
