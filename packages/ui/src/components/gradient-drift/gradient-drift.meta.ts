import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "gradient-drift",
  title: "Gradient Drift",
  description:
    "A React animated gradient background for Next.js and Tailwind CSS: soft, single-colour light that drifts very slowly behind a hero or a section.",
  kind: "background",
  category: "Backgrounds",
  tags: ["background", "gradient", "animated gradient", "hero", "mesh gradient"],
  keywords: [
    "react animated gradient",
    "animated gradient background",
    "tailwind gradient background",
    "nextjs hero background",
    "mesh gradient react",
    "soft gradient background",
    "shadcn background",
    "blurred gradient background",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["gradient-drift.tsx"],
  usage: {
    code: `import { GradientDrift } from "@/components/ui/gradient-drift"

export function Hero() {
  return (
    <section className="relative isolate py-24 text-center">
      <GradientDrift />
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
        "Three soft pools of one colour drift there and back at their own pace, so the light never settles into a pattern.",
    },
  ],
  preview: { height: "lg", card: "card" },
  api: [
    {
      name: "GradientDrift",
      description:
        "A layer that fills its parent from behind (absolute, -z-10, aria-hidden, ignoring the pointer). Put it first inside a relative isolate section. The blur is baked into radial gradients, so only transforms move. It renders on the server as a still field, pauses off-screen and while the tab is hidden, and holds still with reduced motion. Also accepts every div prop.",
      props: [
        {
          name: "tone",
          type: '"neutral" | "primary"',
          default: '"neutral"',
          description: "Neutral greys (foreground and muted-foreground), or the theme's primary colour.",
        },
        {
          name: "opacity",
          type: "number",
          default: "0.05",
          description:
            "The field's opacity, from 0 to 1. The default keeps the light within a small lightness step, so it stays calm.",
        },
        {
          name: "speed",
          type: "number",
          default: "1",
          description:
            "How fast it drifts: 1 is the calm default (20 seconds or more each way), 2 twice as fast. 0 holds it still.",
        },
      ],
    },
  ],
  related: ["dot-grid", "line-grid"],
  ai: {
    whenToUse:
      "Use GradientDrift for soft, slowly moving light behind a hero or a section, with no pattern. Use DotGrid or LineGrid for a texture instead.",
  },
} satisfies ItemMeta;
