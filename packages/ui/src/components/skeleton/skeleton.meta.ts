import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "skeleton",
  title: "Skeleton",
  description:
    "A React skeleton loader for Next.js and Tailwind CSS: placeholder blocks while content loads, with a calm sheen that sweeps every skeleton in step.",
  kind: "component",
  category: "Feedback",
  tags: ["skeleton", "loading", "placeholder", "shimmer", "loader"],
  keywords: [
    "react skeleton",
    "shadcn skeleton",
    "nextjs skeleton loading",
    "tailwind skeleton",
    "skeleton loader",
    "loading placeholder",
    "shimmer loading",
    "skeleton screen",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["skeleton.tsx", "skeleton-sheen.tsx"],
  usage: {
    code: `import { Skeleton } from "@/components/ui/skeleton"

export function ProfileLoading() {
  return (
    <div aria-busy="true" className="flex items-center gap-3">
      <span className="sr-only">Loading profile</span>
      <Skeleton className="size-10 rounded-full" />
      <div className="grid gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}`,
  },
  demos: [
    {
      name: "placeholders",
      title: "Placeholders",
      description:
        "A profile row and a card. A sheen one step lighter sweeps across, every skeleton in step; with reduced motion they're still.",
    },
    {
      name: "loading",
      title: "Loading, then content",
      description:
        "Reload: the skeleton fades in while the region is aria-busy, then the content comes back through the blur in the same place.",
    },
  ],
  // The page opens on a row and a card, named underneath; the index card shows the row alone
  preview: { card: "card" },
  api: [
    {
      name: "Skeleton",
      description:
        'A muted block you shape with classes, for example "h-4 w-40" or "size-10 rounded-full". Hidden from screen readers: put aria-busy="true" and a visually hidden "Loading…" on the region that\'s loading. Also accepts every native div prop.',
      props: [
        {
          name: "className",
          type: "string",
          description: "Its size and shape. Rounded md by default; rounded-full for a circle.",
        },
      ],
    },
  ],
  primitives: [],
  related: ["spinner", "card", "avatar"],
  ai: {
    whenToUse:
      "Use Skeleton for placeholders shaped like the content that's loading (a profile row, a card, a table), so the page doesn't jump when it arrives. Mark the loading region aria-busy=\"true\" with a visually hidden label. Use Spinner for a small busy state with no layout to hold, such as a button.",
  },
} satisfies ItemMeta;
