export function money(amount: number | string | null | undefined): string {
  const value = Number(amount ?? 0);
  return `E${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
