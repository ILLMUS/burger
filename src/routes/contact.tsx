import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/SiteLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StoreStatus } from "@/components/StoreStatus";
import { useSettings } from "@/hooks/useCatalog";
import { db } from "@/lib/db";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Explorers Smash Burger" },
      { name: "description", content: "Call, WhatsApp or message Explorers Smash Burger in Zulwini, Eswatini." },
      { property: "og:title", content: "Contact — Explorers Smash Burger" },
      { property: "og:description", content: "Opening hours, phone, WhatsApp and directions to our Zulwini stand." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").max(120).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Please write a short message").max(1000),
});

function ContactPage() {
  const { data: settings } = useSettings();
  const [values, setValues] = useState({ name: "", phone: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const whatsapp = (settings?.whatsapp_number ?? "").replace(/\D/g, "");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSaving(true);
    const { error } = await db.from("contact_messages").insert({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      message: parsed.data.message,
    });
    setSaving(false);
    if (error) {
      toast.error("Message not sent", { description: error.message });
      return;
    }
    toast.success("Message sent", { description: "We'll get back to you shortly." });
    setValues({ name: "", phone: "", email: "", message: "" });
  };

  return (
    <SiteLayout>
      <PageHeader title="Contact us" subtitle="Questions, bulk orders or feedback — we answer fast." />

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-3 border border-border p-6">
            <p className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-primary" aria-hidden="true" />
              {settings?.location ?? "Zulwini, Eswatini"}
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Phone size={16} className="text-primary" aria-hidden="true" />
              <a href={`tel:${settings?.phone_number ?? ""}`} className="hover:text-primary">
                {settings?.phone_number}
              </a>
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-primary" aria-hidden="true" />
              Daily {settings?.opening_time ?? "10:00"} – {settings?.closing_time ?? "21:00"}
            </p>
            <StoreStatus />
            <div className="flex gap-3 pt-2">
              {settings?.facebook && (
                <a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                  <Facebook size={18} className="text-muted-foreground hover:text-primary" />
                </a>
              )}
              {settings?.instagram && (
                <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                  <Instagram size={18} className="text-muted-foreground hover:text-primary" />
                </a>
              )}
            </div>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <MessageCircle size={14} aria-hidden="true" /> WhatsApp us
            </a>
          </div>

          <div className="h-72 border border-border">
            <iframe
              title="Map of Zulwini, Eswatini"
              src="https://www.openstreetmap.org/export/embed.html?bbox=31.05%2C-26.52%2C31.15%2C-26.44&layer=mapnik&marker=-26.48%2C31.10"
              className="h-full w-full"
              loading="lazy"
            />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 border border-border p-6" noValidate>
          <h2 className="font-display text-xl">Send a message</h2>
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              className="rounded-none"
              aria-invalid={Boolean(errors["name"])}
            />
            {errors["name"] && <p className="text-xs text-destructive">{errors["name"]}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={values.phone}
                onChange={(e) => setValues({ ...values, phone: e.target.value })}
                className="rounded-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => setValues({ ...values, email: e.target.value })}
                className="rounded-none"
                aria-invalid={Boolean(errors["email"])}
              />
              {errors["email"] && <p className="text-xs text-destructive">{errors["email"]}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={6}
              value={values.message}
              onChange={(e) => setValues({ ...values, message: e.target.value })}
              className="rounded-none"
              aria-invalid={Boolean(errors["message"])}
            />
            {errors["message"] && <p className="text-xs text-destructive">{errors["message"]}</p>}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            <Mail size={14} aria-hidden="true" />
            {saving ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}
