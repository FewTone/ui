import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "card",
  title: "Card",
  description:
    "A React card for Next.js and Tailwind CSS: a surface for grouped content with header, action, content and footer parts, a small size and a link style.",
  kind: "component",
  category: "Display",
  tags: ["card", "surface", "panel", "container", "link card"],
  keywords: [
    "react card",
    "shadcn card",
    "nextjs card",
    "tailwind card",
    "card component",
    "link card",
    "dashboard card",
    "settings card",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["card.tsx"],
  usage: {
    code: `import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function CreateProject() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy a new project in a few clicks.</CardDescription>
      </CardHeader>
      <CardContent>{/* fields */}</CardContent>
      <CardFooter>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  )
}`,
  },
  demos: [
    {
      name: "overview",
      title: "Overview",
      description:
        "A card with every part, a small card with an action beside its title, and a whole card as a link. Hover the link: its surface lifts a step, and nothing moves.",
    },
  ],
  // The page opens on three cards; the index card shows a single small one
  preview: { height: "lg", card: "card" },
  api: [
    {
      name: "Card",
      description:
        "The surface: a soft shadow and a hairline, no border. Also accepts every native div prop. Exports cardVariants for styling other elements.",
      props: [
        {
          name: "size",
          type: '"sm" | "md"',
          default: '"md"',
          description: "Padding and gaps: 24px, or 16px for dense grids.",
        },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description:
            "Render the single child (for example a link) with the card styles. As a link, the surface lifts a step on hover; everything inside is read as the link's name, so keep it short.",
        },
      ],
    },
    {
      name: "CardHeader",
      description:
        'Holds the title, description and action. Add className="border-b" for a rule under it; the padding below follows.',
      props: [],
    },
    {
      name: "CardTitle",
      props: [
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render a heading at the level your page needs instead of a div, for example <h3>.",
        },
      ],
    },
    { name: "CardDescription", description: "Muted text under the title.", props: [] },
    {
      name: "CardAction",
      description:
        "Sits at the end of the header, beside the title and description: a button, a badge, a menu.",
      props: [],
    },
    { name: "CardContent", description: "The body, with the card's side padding.", props: [] },
    {
      name: "CardFooter",
      description:
        'A row for actions, 8px apart. Add className="border-t" for a rule above it; the padding above follows.',
      props: [],
    },
  ],
  primitives: ["Radix Slot"],
  related: ["button", "badge"],
  ai: {
    whenToUse:
      "Use Card to group related content and actions on a surface: forms, settings, stats, previews. Render it asChild with a link when the whole card goes somewhere. Use Separator for a line between sections without a surface.",
  },
} satisfies ItemMeta;
