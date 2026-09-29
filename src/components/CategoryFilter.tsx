import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export function CategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string;
  onChange: (slug: string) => void;
}) {
  const options = [{ id: "all", name: "All", slug: "all" }, ...categories];

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
      {options.map((option) => {
        const active = value === option.slug;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.slug)}
            className={cn(
              "shrink-0 border px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-foreground",
            )}
          >
            {option.name}
          </button>
        );
      })}
    </div>
  );
}
