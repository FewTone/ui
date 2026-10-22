import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "badge",
  title: "Badge",
  description:
    "An accessible React badge for Next.js and Tailwind CSS: small status labels in five variants, including one with a light travelling round its edge.",
  kind: "component",
  category: "Feedback",
  tags: ["badge", "label", "status", "tag", "chip", "pill"],
  keywords: [
    "react badge",
    "nextjs badge",
    "tailwind badge",
    "shadcn badge",
    "status badge",
    "badge component",
    "animated badge",
    "shine border badge",
    "pill label",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["badge.tsx", "badge-shine.tsx"],
  usage: {
    code: `import { Badge } from "@/components/ui/badge"

export function Status() {
  return <Badge variant="secondary">Draft</Badge>
}`,
  },
  demos: [
    {
      name: "variants",
      title: "Variants",
      description:
        "Default for the main status, secondary and outline for quieter ones, destructive for problems. Shine is the outline badge with two lights travelling round its edge, in the label's colour.",
    },
    {
      name: "as-link",
      title: "As a link",
      description:
        "With asChild, the badge styles go onto its child, so a link stays a real link. Its background shifts on hover.",
    },
  ],
  // The page opens on every variant, named; the index card shows three badges in a row
  preview: { card: "card" },
  api: [
    {
      name: "Badge",
      description:
        "Also accepts every native span prop. Exports badgeVariants for styling other elements. Flat, with no shadow; icons inside size themselves.",
      props: [
        {
          name: "variant",
          type: '"default" | "secondary" | "destructive" | "outline" | "shine"',
          default: '"default"',
          description:
            "The visual style. Shine is the outline badge with two lights travelling round its edge, one lap every 3 seconds; with reduced motion they rest on the left and right.",
        },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description:
            "Render the single child (for example a link) with the badge styles instead of a span.",
        },
      ],
    },
  ],
  primitives: ["Radix Slot"],
  related: ["spinner", "button"],
  ai: {
    whenToUse:
      'Use Badge for short, non-interactive labels: a status, a version, a count or a category. Use variant="shine" sparingly, for the one label that should draw the eye (Beta, Pro). Use Button for actions, and asChild with a link when the badge should navigate.',
  },
} satisfies ItemMeta;
