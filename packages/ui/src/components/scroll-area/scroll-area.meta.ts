import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "scroll-area",
  title: "Scroll Area",
  description:
    "An accessible React scroll area for Next.js and Tailwind CSS: native scrolling with a slim scrollbar and soft fades at the edges, built on Radix.",
  kind: "component",
  category: "Display",
  tags: ["scroll area", "scroll", "scrollbar", "overflow", "fade"],
  keywords: [
    "react scroll area",
    "nextjs scroll area",
    "tailwind scroll area",
    "shadcn scroll area",
    "custom scrollbar",
    "scroll fade",
    "horizontal scroll",
    "scroll shadow",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["scroll-area.tsx"],
  usage: {
    code: `import { ScrollArea } from "@/components/ui/scroll-area"

export function Tags({ tags }: { tags: string[] }) {
  return (
    <ScrollArea aria-label="Tags" className="h-72 w-48 rounded-lg">
      <div className="p-4">
        {tags.map((tag) => (
          <div key={tag} className="text-sm">
            {tag}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}`,
  },
  demos: [
    {
      name: "directions",
      title: "Vertical and horizontal",
      description:
        "A fade shows at each edge with more to scroll to, and goes when you reach it. Point at the area and the scrollbar appears; point at the bar and it thickens. To scroll sideways, add a horizontal ScrollBar inside.",
    },
  ],
  // The page opens on both directions; the index card shows one short list
  preview: { card: "card" },
  api: [
    {
      name: "ScrollArea",
      description:
        "The scrolling box, with a vertical scrollbar. Give it a height (or a width to scroll sideways). Also accepts every Radix Scroll Area Root prop.",
      props: [
        {
          name: "aria-label",
          type: "string",
          description:
            "Names the area. A named area is a focusable region, so keyboard users can reach it and scroll with the arrow keys.",
        },
        {
          name: "aria-labelledby",
          type: "string",
          description: "Names the area after a visible heading's id, with the same effect as aria-label.",
        },
        {
          name: "type",
          type: '"hover" | "scroll" | "auto" | "always"',
          default: '"hover"',
          description:
            "When the scrollbar shows: while the pointer is over the area, while scrolling, whenever there's more to scroll, or always.",
        },
        {
          name: "scrollHideDelay",
          type: "number",
          default: "600",
          description: "Milliseconds before the scrollbar fades out, for the hover and scroll types.",
        },
        {
          name: "className",
          type: "string",
          description:
            "The fades take the area's background, bg-background by default. On a card or a popover, add bg-card or bg-popover so they match.",
        },
      ],
    },
    {
      name: "ScrollBar",
      description:
        "A scrollbar. ScrollArea already has the vertical one; put a horizontal one inside it to scroll sideways. Also accepts every Radix Scroll Area Scrollbar prop.",
      props: [
        {
          name: "orientation",
          type: '"vertical" | "horizontal"',
          default: '"vertical"',
          description: "Which way it scrolls.",
        },
      ],
    },
  ],
  primitives: ["Radix Scroll Area"],
  related: ["table", "select"],
  ai: {
    whenToUse:
      "Use ScrollArea for a fixed-size box whose content can be longer than it, such as a list of tags, a sidebar or a row of cards, when you want a slim scrollbar and fades at the edges. Let the page scroll normally for main content.",
  },
} satisfies ItemMeta;
