import { demos } from "@fewtone/ui/registry/demos";
import type { Item } from "@fewtone/ui/registry/schema";
import Link from "next/link";
import { isNew } from "@/lib/content";
import { StatusBadge } from "./status-badge";

/**
 * Card used on index pages and in "Related components" (owner, 2026-10-13): one outer card holds a live
 * preview tile of the item's first demo, with the title and description underneath. FewTone's own style.
 *
 * Spacing is all --space-card-* tokens: a 12px frame round the tile (the corners stay concentric), the text
 * 32px in from the card's sides, and 24px under the description, measured to the letters.
 *
 * The preview is the real component, made inert (no focus, no clicks, hidden from screen readers).
 * The title link stretches over the whole card, so the card is one link without nesting the demo's
 * buttons and inputs inside an anchor. The badges ignore the pointer, so clicks on them reach the link.
 */
export function ItemCard({ item }: { item: Item }) {
  const hero = item.demos[0];
  const Demo = hero ? demos[`${item.name}/${hero.name}`] : undefined;

  return (
    <article className="group relative grid content-start gap-(--space-card-text) rounded-(--radius-card) bg-card p-(--space-card-frame) shadow-card outline-offset-4 outline-ring has-focus-visible:outline-(length:--focus-ring-width)">
      <div className="grid h-(--size-card-preview) place-items-center overflow-hidden rounded-xl bg-preview p-(--space-card-tile) transition-colors duration-(--duration-fast) ease-out group-hover:bg-preview-hover">
        {Demo ? (
          <div inert className="pointer-events-none grid w-full place-items-center select-none">
            <Demo />
          </div>
        ) : null}
      </div>
      <div className="grid gap-1 px-(--space-card-x) pb-(--space-card-bottom)">
        <div className="flex items-center gap-2 text-h4">
          <Link
            href={item.href}
            className="truncate font-medium text-foreground outline-none after:absolute after:inset-0 after:rounded-(--radius-card)"
          >
            {item.title}
          </Link>
          {isNew(item) ? <StatusBadge status="New" className="pointer-events-none" /> : null}
          {item.status === "draft" ? <StatusBadge status="Draft" className="pointer-events-none" /> : null}
        </div>
        <p className="trim-leading-end line-clamp-2 text-body-sm text-muted-foreground">{item.description}</p>
      </div>
    </article>
  );
}

export function ItemGrid({ items }: { items: Item[] }) {
  return (
    <ul className="grid gap-(--space-grid) sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((item) => (
        <li key={item.name} className="grid">
          <ItemCard item={item} />
        </li>
      ))}
    </ul>
  );
}
