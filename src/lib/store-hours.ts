function toMinutes(value: string | null | undefined, fallback: number): number {
  if (!value) return fallback;
  const parts = value.split(":");
  const h = Number(parts[0]);
  const m = Number(parts[1] ?? 0);
  if (Number.isNaN(h)) return fallback;
  return h * 60 + (Number.isNaN(m) ? 0 : m);
}

export interface StoreStatusInfo {
  open: boolean;
  label: string;
  detail: string;
}

export function getStoreStatus(
  opening: string | null | undefined,
  closing: string | null | undefined,
  now: Date = new Date(),
): StoreStatusInfo {
  const open = toMinutes(opening, 600);
  const close = toMinutes(closing, 1260);
  const current = now.getHours() * 60 + now.getMinutes();
  const isOpen = close > open ? current >= open && current < close : current >= open || current < close;

  if (isOpen) {
    return { open: true, label: "Open now", detail: `Closes at ${closing ?? "21:00"}` };
  }
  return {
    open: false,
    label: "Closed",
    detail: current < open ? `Opens today at ${opening ?? "10:00"}` : `Opens tomorrow at ${opening ?? "10:00"}`,
  };
}
