import { useEffect, useState } from "react";
import { useSettings } from "@/hooks/useCatalog";
import { getStoreStatus } from "@/lib/store-hours";
import { cn } from "@/lib/utils";

export function StoreStatus({ className, showDetail = true }: { className?: string; showDetail?: boolean }) {
  const { data: settings } = useSettings();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!now) return null;
  const status = getStoreStatus(settings?.opening_time, settings?.closing_time, now);

  return (
    <span className={cn("inline-flex items-center gap-2 text-xs", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 border px-2 py-1 font-bold uppercase tracking-widest",
          status.open
            ? "border-success/40 bg-success/10 text-success"
            : "border-border bg-surface text-muted-foreground",
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", status.open ? "bg-success" : "bg-muted-foreground")} />
        {status.label}
      </span>
      {showDetail && <span className="text-muted-foreground">{status.detail}</span>}
    </span>
  );
}
