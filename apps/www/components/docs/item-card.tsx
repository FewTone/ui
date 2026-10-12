import type { Item } from "@fewtone/ui/registry/schema";
import Link from "next/link";
import { isNew } from "@/lib/content";
import { StatusBadge } from "./status-badge";

/** Card used on index pages and in "Related components" */
export function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      href={item.href}
      className="group focus-ring grid content-start gap-2 rounded-xl border bg-card p-4 shadow-xs transition-colors duration-(--duration-fast) ease-out hover:border-foreground/20 hover:bg-accent/40"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-label text-foreground">{item.title}</span>
        {isNew(item) ? <StatusBadge>New</StatusBadge> : null}
        {item.status === "draft" ? <StatusBadge>Draft</StatusBadge> : null}
      </span>
      <span className="line-clamp-2 text-body-sm text-muted-foreground">{item.description}</span>
      <span className="text-caption text-muted-foreground">{item.category}</span>
    </Link>
  );
}

export function ItemGrid({ items }: { items: Item[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((item) => (
        <li key={item.name} className="grid">
          <ItemCard item={item} />
        </li>
      ))}
    </ul>
  );
}
