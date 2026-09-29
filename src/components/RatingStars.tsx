import { Star } from "lucide-react";

export function RatingStars({
  rating,
  count,
  size = 12,
}: {
  rating: number;
  count?: number;
  size?: number;
}) {
  const rounded = Math.round(Number(rating));
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      <span className="flex">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            size={size}
            className={value <= rounded ? "fill-primary text-primary" : "text-border"}
            aria-hidden="true"
          />
        ))}
      </span>
      <span className="text-xs font-medium text-muted-foreground">
        {Number(rating).toFixed(1)}
        {typeof count === "number" ? ` (${count})` : ""}
      </span>
    </span>
  );
}
