import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "line-grid",
  title: "Line Grid",
  description:
    "A React grid background for Next.js and Tailwind CSS: thin grid lines that fade out at the edges, with an optional slow, seamless pan.",
  kind: "background",
  category: "Backgrounds",
  tags: ["background", "grid", "grid lines", "hero", "pattern"],
  keywords: [
    "react grid background",
    "grid pattern background",
    "tailwind grid background",
    "nextjs hero background",
    "css grid lines background",
    "animated grid background",
    "shadcn background",
    "graph paper background",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["line-grid.tsx", "line-grid-pan.tsx"],
  usage: {
    code: `import { LineGrid } from "@/components/ui/line-grid"

export function Hero() {
  return (
    <section className="relative isolate py-24 text-center">
      <LineGrid pan />
      <h1>Ship your next idea</h1>
    </section>
  )
}`,
  },
  demos: [
    {
      name: "hero",
      title: "Behind a hero",
      description:
        "With pan on, the lines slide one cell every 12 seconds and loop without a seam. The fade at the edges stays put.",
    },
  ],
  preview: { height: "lg", card: "card" },
  api: [
    {
      name: "LineGrid",
      description:
        "A layer that fills its parent from behind (absolute, -z-10, aria-hidden, ignoring the pointer). Put it first inside a relative isolate section. The lines take the text colour: text-border by default, any text-* class to change it. Server-safe: the lines render without JavaScript, and only pan adds a small client part. Also accepts every div prop.",
      props: [
        { name: "size", type: "number", default: "40", description: "The size of each cell, in px." },
        {
          name: "fade",
          type: "boolean",
          default: "true",
          description: "Fade the lines out towards the edges, so the grid never ends on a hard line.",
        },
        { name: "opacity", type: "number", default: "1", description: "The lines' opacity, from 0 to 1." },
        {
          name: "pan",
          type: "boolean",
          default: "false",
          description:
            "Slide the grid slowly and endlessly. It pauses off-screen and while the tab is hidden, and is off with reduced motion.",
        },
        {
          name: "speed",
          type: "number",
          default: "1",
          description: "How fast it pans: 1 is a cell every 12 seconds, 2 twice as fast. 0 holds it still.",
        },
      ],
    },
  ],
  related: ["dot-grid", "gradient-drift"],
  ai: {
    whenToUse:
      "Use LineGrid behind a hero or a section for a structured, technical look; add pan for a slow sense of motion. Use DotGrid for a lighter texture, and GradientDrift for soft light with no pattern.",
  },
} satisfies ItemMeta;
