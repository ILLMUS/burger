import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Leaf, MapPin, Timer } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/SiteLayout";
import { useSettings } from "@/hooks/useCatalog";
import heroExperience from "@/assets/hero-experience.jpg";
import heroSmash from "@/assets/hero-smash.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Explorers Smash Burger" },
      {
        name: "description",
        content: "Why Explorers Smash Burger: fresh ingredients, cooked to order, proudly from Zulwini, Eswatini.",
      },
      { property: "og:title", content: "About — Explorers Smash Burger" },
      { property: "og:description", content: "A Zulwini burger brand built on fresh ingredients and hot griddles." },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  { icon: Flame, title: "Smashed to order", text: "Thin patties pressed on a hot griddle for crisp, caramelised edges." },
  { icon: Leaf, title: "Quality ingredients", text: "Fresh produce, real cheese and bread baked for the job." },
  { icon: Timer, title: "Fast service", text: "Built for takeaway speed without cutting corners on flavour." },
  { icon: MapPin, title: "Proudly local", text: "Serving Zulwini and the surrounding communities every day." },
];

function AboutPage() {
  const { data: settings } = useSettings();

  return (
    <SiteLayout>
      <PageHeader title="Our story" subtitle="A small Eswatini burger brand with a serious griddle habit." />

      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2">
        <img src={heroSmash} alt="Smashed burger close up" loading="lazy" className="h-80 w-full object-cover" />
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Why Explorers Smash Burger</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We started with a griddle, a red canopy and a queue that kept growing. The idea was simple: take one
            honest beef patty, smash it thin so every millimetre caramelises, and serve it while it is still
            crackling.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Today we serve beef, smash, chicken, fish and veggie burgers from {settings?.location ?? "Zulwini, Eswatini"}
            . Orders are cooked when you place them, never held under a lamp.
          </p>
          <Link
            to="/products"
            className="inline-flex bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
          >
            See the menu
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div key={value.title} className="border border-border bg-background p-6">
              <value.icon size={20} className="text-primary" aria-hidden="true" />
              <p className="mt-3 font-display text-base">{value.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Fresh preparation, every order</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Buns are toasted on the flat top, sauces are mixed in house and patties hit the heat only once your
            order lands. It takes a few extra minutes and it is worth every one of them.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Open daily {settings?.opening_time ?? "10:00"} – {settings?.closing_time ?? "21:00"}.
          </p>
        </div>
        <img src={heroExperience} alt="Team grilling burgers" loading="lazy" className="h-80 w-full object-cover" />
      </section>
    </SiteLayout>
  );
}
