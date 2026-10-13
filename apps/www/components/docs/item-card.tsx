import type { Item } from "@fewtone/ui/registry/schema";
import Link from "next/link";
import { isNew } from "@/lib/content";
import { StatusBadge } from "./status-badge";

/**
 * Card used on index pages and in "Related components". Built like beUI's: a filled card with no border,
 * a title row, then an inset panel holding the description. Spacing comes from the --space-card-* tokens.
 */
export function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      href={item.href}
      className="group focus-ring flex h-(--size-card) flex-col overflow-hidden rounded-xl bg-muted transition-colors duration-(--duration-fast) ease-out hover:bg-accent"
    >
      <span className="flex shrink-0 items-center justify-between gap-3 px-(--space-card-x) py-(--space-card-y)">
        <span className="truncate text-body font-medium text-foreground">{item.title}</span>
        {isNew(item) ? <StatusBadge>New</StatusBadge> : null}
        {item.status === "draft" ? <StatusBadge>Draft</StatusBadge> : null}
      </span>
      <span className="mx-(--space-card-inset) mb-(--space-card-inset) flex min-h-0 flex-1 items-start overflow-hidden rounded-lg bg-card p-(--space-panel)">
        <span className="line-clamp-3 text-body-sm text-muted-foreground">{item.description}</span>
      </span>
    </Link>
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
