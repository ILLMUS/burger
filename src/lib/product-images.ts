import beefBurger from "@/assets/p-beef-burger.jpg";
import cheeseburger from "@/assets/p-cheeseburger.jpg";
import doubleCheese from "@/assets/p-double-cheese.jpg";
import classicSmash from "@/assets/p-classic-smash.jpg";
import doubleSmash from "@/assets/p-double-smash.jpg";
import chickenBurger from "@/assets/p-chicken-burger.jpg";
import crispyChicken from "@/assets/p-crispy-chicken.jpg";
import fishBurger from "@/assets/p-fish-burger.jpg";
import veggieBurger from "@/assets/p-veggie-burger.jpg";

const LOCAL_IMAGES: Record<string, string> = {
  "p-beef-burger": beefBurger,
  "p-cheeseburger": cheeseburger,
  "p-double-cheese": doubleCheese,
  "p-classic-smash": classicSmash,
  "p-double-smash": doubleSmash,
  "p-chicken-burger": chickenBurger,
  "p-crispy-chicken": crispyChicken,
  "p-fish-burger": fishBurger,
  "p-veggie-burger": veggieBurger,
};

export const LOCAL_IMAGE_KEYS = Object.keys(LOCAL_IMAGES);

export function productImage(
  source: { image_url?: string | null; image_key?: string | null } | null | undefined,
): string {
  if (source?.image_url) return source.image_url;
  const local = source?.image_key ? LOCAL_IMAGES[source.image_key] : undefined;
  if (local) return local;
  return classicSmash;
}
