import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "dot-grid",
  title: "Dot Grid",
  description:
    "A React dot grid background for Next.js and Tailwind CSS: a fine dot pattern that fades out at the edges, with dots that brighten near the pointer.",
  kind: "background",
  category: "Backgrounds",
  tags: ["background", "dot pattern", "grid", "hero", "pattern"],
  keywords: [
    "react dot pattern",
    "dot grid background",
    "tailwind dot background",
    "nextjs hero background",
    "css dot pattern",
    "dotted background",
    "shadcn background",
    "interactive background",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["dot-grid.tsx", "dot-grid-highlight.tsx"],
  usage: {
    code: `import { DotGrid } from "@/components/ui/dot-grid"

export function Hero() {
  return (
    <section className="relative isolate py-24 text-center">
      <DotGrid highlight />
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
        "Move the mouse over it: the dots near the pointer brighten a step, and the light follows on a soft spring.",
    },
  ],
  preview: { height: "lg", card: "card" },
  api: [
    {
      name: "DotGrid",
      description:
        "A layer that fills its parent from behind (absolute, -z-10, aria-hidden, ignoring the pointer). Put it first inside a relative isolate section. The dots take the text colour: text-muted-foreground by default, any text-* class to change it. Server-safe: the pattern renders without JavaScript, and only highlight adds a small client part. Also accepts every div prop.",
      props: [
        { name: "size", type: "number", default: "16", description: "The distance between dots, in px." },
        { name: "dotSize", type: "number", default: "2", description: "The diameter of each dot, in px." },
        {
          name: "fade",
          type: "boolean",
          default: "true",
          description: "Fade the pattern out towards the edges, so it never ends on a hard line.",
        },
        {
          name: "opacity",
          type: "number",
          default: "0.4",
          description: "The pattern's opacity, from 0 to 1.",
        },
        {
          name: "highlight",
          type: "boolean",
          default: "false",
          description:
            "Brighten the dots near the pointer. It listens on the parent element, with a mouse only, and is off with reduced motion.",
        },
      ],
    },
  ],
  related: ["line-grid", "gradient-drift"],
  ai: {
    whenToUse:
      "Use DotGrid as a quiet texture behind a hero or a section. Use LineGrid for a more structured, technical look, and GradientDrift for soft light with no pattern.",
  },
} satisfies ItemMeta;
