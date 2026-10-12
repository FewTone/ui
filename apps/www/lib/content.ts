import { items as allItems } from "@fewtone/ui/registry/index.generated";
import { type KindConfig, type KindName, kinds } from "@fewtone/ui/registry/kinds";
import type { Item } from "@fewtone/ui/registry/schema";

/**
 * Everything the site knows about items comes from the generated index (ADR 0008).
 * Drafts show in development only.
 */
const showDrafts = process.env.NODE_ENV !== "production";

export const items: Item[] = allItems.filter((item) => showDrafts || item.status !== "draft");

export type Kind = KindConfig & { name: KindName; items: Item[] };

/** Kinds that have items, plus those marked `alwaysShow`, in sidebar order */
export function getKinds(): Kind[] {
  return (Object.keys(kinds) as KindName[])
    .map((name) => ({ ...kinds[name], name, items: items.filter((item) => item.kind === name) }))
    .filter((kind) => kind.items.length > 0 || kind.alwaysShow)
    .sort((a, b) => a.order - b.order);
}

export function getKindBySegment(segment: string): Kind | undefined {
  return getKinds().find((kind) => kind.segment === segment);
}

export function getItem(segment: string, name: string): Item | undefined {
  const kind = getKindBySegment(segment);
  return kind?.items.find((item) => item.name === name);
}

export function isNew(item: Item) {
  return item.status === "new";
}

/** Items listed in `related`, topped up from the same category, then the same kind */
export function getRelated(item: Item, limit = 3): Item[] {
  const others = items.filter((other) => other.name !== item.name);
  const picked = item.related
    .map((name) => others.find((other) => other.name === name))
    .filter((other): other is Item => Boolean(other));
  const fill = [
    ...others.filter((other) => other.kind === item.kind && other.category === item.category),
    ...others.filter((other) => other.kind === item.kind),
  ];
  for (const other of fill) {
    if (picked.length >= limit) break;
    if (!picked.includes(other)) picked.push(other);
  }
  return picked.slice(0, limit);
}

/** Items grouped by category, categories in alphabetical order */
export function groupByCategory(list: Item[]) {
  const groups = new Map<string, Item[]>();
  for (const item of list) groups.set(item.category, [...(groups.get(item.category) ?? []), item]);
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

/** Page title that matches what people search for: "React Button Component" */
export function itemTitle(item: Item) {
  return item.seo.title ?? `React ${item.title} ${kinds[item.kind].label}`;
}

export function itemDescription(item: Item) {
  return item.seo.description ?? item.description;
}
