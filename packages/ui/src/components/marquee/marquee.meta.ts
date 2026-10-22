import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "marquee",
  title: "Marquee",
  description:
    "An accessible React marquee for Next.js and Tailwind CSS: an endless, seamless row of logos or cards that pauses on hover and stops with reduced motion.",
  kind: "component",
  category: "Effects",
  tags: ["marquee", "infinite scroll", "logo cloud", "ticker", "carousel", "testimonials"],
  keywords: [
    "react marquee",
    "nextjs marquee",
    "tailwind marquee",
    "shadcn marquee",
    "infinite scroll logos",
    "logo cloud react",
    "scrolling testimonials",
    "infinite slider react",
    "auto scrolling row",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["marquee.tsx"],
  usage: {
    code: `import { Marquee } from "@/components/ui/marquee"

export function Logos() {
  return (
    <Marquee>
      <span>Northwind</span>
      <span>Atlas</span>
      <span>Vertex</span>
    </Marquee>
  )
}`,
  },
  demos: [
    {
      name: "rows",
      title: "Logos and cards",
      description:
        "The items repeat until they fill the row, so the loop never shows a seam. Hover a row and it slows to a stop rather than freezing; Pause stops both the same way.",
    },
    {
      name: "vertical",
      title: "Vertical",
      description:
        "Up and down need a height on the marquee. Two columns going opposite ways make a wall of quotes.",
    },
  ],
  // The page opens on two rows and a Pause switch; the index card shows one row of wordmarks
  preview: { card: "card" },
  api: [
    {
      name: "Marquee",
      description:
        "Put the items straight inside. The first copy is the content; the copies that fill the row are aria-hidden and inert, so screen readers and Tab meet each item once. It rests off-screen and in a hidden tab, and slows to a stop while it has keyboard focus. With reduced motion it doesn't move: one copy, in a row you can scroll. Also accepts every native div prop.",
      props: [
        {
          name: "direction",
          type: '"left" | "right" | "up" | "down"',
          default: '"left"',
          description: 'Which way the items travel. Up and down need a height (className="h-72").',
        },
        { name: "speed", type: "number", default: "40", description: "Pixels a second." },
        {
          name: "pauseOnHover",
          type: "boolean",
          default: "true",
          description: "Slow to a stop while the pointer is over it, and pick up again on leaving.",
        },
        {
          name: "paused",
          type: "boolean",
          default: "false",
          description:
            "Stops it, slowing down the same way. Wire it to a pause control when the marquee runs beside other content.",
        },
        {
          name: "gap",
          type: "number | string",
          default: "16px (gap-4)",
          description: "Space between items and between the copies: a CSS length, or a number of pixels.",
        },
        { name: "fade", type: "boolean", default: "true", description: "Fades the items out at both ends." },
      ],
    },
  ],
  primitives: ["Web Animations API"],
  related: ["card", "text-effects", "number-ticker"],
  ai: {
    whenToUse:
      'Use Marquee for a band that moves on its own: customer logos, a wall of testimonials, a ticker of short updates. Keep the items short and give users a way to stop it (paused) when it runs beside other content. Use direction="up" or "down" with a height for a vertical column.',
  },
} satisfies ItemMeta;
