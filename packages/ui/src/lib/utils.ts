import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * tailwind-merge only knows Tailwind's default scale. Without this, it reads our type tokens
 * (`text-label`, `text-caption`...) as colours and drops them when a colour class such as
 * `text-muted-foreground` is also present. Keep these lists in sync with tokens.css and globals.css.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "h1",
            "h2",
            "h3",
            "h4",
            "body-lg",
            "body",
            "body-sm",
            "label",
            "caption",
            "overline",
            "code",
          ],
        },
      ],
      shadow: [{ shadow: ["card", "brand", "highlight"] }],
    },
  },
});

/** Merge class names, letting later Tailwind classes override earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
