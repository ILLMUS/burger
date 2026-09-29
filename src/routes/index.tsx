import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, MessageCircle } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { HeroSlider } from "@/components/HeroSlider";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductGrid } from "@/components/ProductGrid";
import { StoreStatus } from "@/components/StoreStatus";
import { useCategories, useProducts, useSettings } from "@/hooks/useCatalog";
import heroExperience from "@/assets/hero-experience.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Explorers Smash Burger — Freshly smashed in Zulwini" },
      {
        name: "description",
        content:
          "Order smash burgers, chicken, fish and veggie burgers in Zulwini, Eswatini. Delivery or pickup, confirmed on WhatsApp.",
      },
      { property: "og:title", content: "Explorers Smash Burger — Freshly smashed in Zulwini" },
      {
        property: "og:description",
        content: "Freshly smashed burgers in Zulwini, Eswatini. Delivery or pickup, ordered in seconds.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [category, setCategory] = useState("all");
  const { data: categories = [] } = useCategories();
  const { data: products = [], isLoading } = useProducts();
  const { data: settings } = useSettings();

  const filtered = useMemo(
    () => (category === "all" ? products : products.filter((p) => p.categories?.slug === category)),
    [products, category],
  );

  const featured = filtered.filter((p) => p.featured).slice(0, 4);
  const popular = [...filtered].sort((a, b) => b.rating_count - a.rating_count).slice(0, 4);
  const whatsapp = (settings?.whatsapp_number ?? "").replace(/\D/g, "");

  return (
    <SiteLayout>
      <HeroSlider />

      <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <CategoryFilter categories={categories} value={category} onChange={setCategory} />
      </section>

      <section className="mx-auto w-full max-w-7xl px-4">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl sm:text-3xl">Featured</h2>
          <Link to="/products" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
            View all
          </Link>
        </div>
        <ProductGrid
          products={featured.length > 0 ? featured : filtered.slice(0, 4)}
          loading={isLoading}
          emptyMessage="Nothing in this category yet."
        />
      </section>

      <section className="mt-16 border-y border-border bg-foreground">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-14 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Zulwini, Eswatini</p>
          <h2 className="font-display text-3xl text-background sm:text-5xl">
            Freshly smashed. <span className="text-primary">Always delicious.</span>
          </h2>
          <p className="mx-auto max-w-xl text-sm text-background/70">
            Every patty is pressed thin on a screaming hot griddle for crisp, lacy edges and a juicy centre.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl sm:text-3xl">Popular right now</h2>
          <Link to="/products" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
            Full menu
          </Link>
        </div>
        <ProductGrid products={popular} loading={isLoading} />
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
          <img
            src={heroExperience}
            alt="The Explorers Smash Burger team at the grill"
            loading="lazy"
            className="h-72 w-full object-cover lg:h-96"
          />
          <div>
            <h2 className="font-display text-2xl sm:text-3xl">Built on the griddle, not in a freezer</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Explorers Smash Burger started as a stand in Zulwini with one idea: a properly smashed patty, fresh
              bread and honest prices. Everything is cooked to order, and nothing leaves the pass unless we would
              eat it ourselves.
            </p>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 border border-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-foreground hover:text-background"
            >
              Our story <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col gap-2 border border-primary bg-primary p-6 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <MessageCircle size={20} aria-hidden="true" />
            <span className="font-display text-lg">Order on WhatsApp</span>
            <span className="text-sm text-primary-foreground/80">
              Build your cart, we send the order straight to the kitchen.
            </span>
          </a>
          <div className="border border-border p-6">
            <MapPin size={20} className="text-primary" aria-hidden="true" />
            <p className="mt-2 font-display text-lg">Find us</p>
            <p className="mt-1 text-sm text-muted-foreground">{settings?.location ?? "Zulwini, Eswatini"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{settings?.phone_number}</p>
          </div>
          <div className="border border-border p-6">
            <Clock size={20} className="text-primary" aria-hidden="true" />
            <p className="mt-2 font-display text-lg">Opening hours</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Daily {settings?.opening_time ?? "10:00"} – {settings?.closing_time ?? "21:00"}
            </p>
            <div className="mt-3">
              <StoreStatus />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
