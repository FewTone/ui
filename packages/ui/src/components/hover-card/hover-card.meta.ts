import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "hover-card",
  title: "Hover Card",
  description:
    "An accessible React hover card for Next.js and Tailwind CSS: a preview card for a link, like a profile on an @mention, built on Radix Hover Card.",
  kind: "component",
  category: "Overlays",
  tags: ["hover card", "preview", "profile", "mention", "overlay"],
  keywords: [
    "react hover card",
    "nextjs hover card",
    "shadcn hover card",
    "tailwind hover card",
    "radix hover card",
    "link preview",
    "profile card on hover",
    "user mention preview",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-21",
  files: ["hover-card.tsx"],
  usage: {
    code: `import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export function Mention() {
  return (
    <HoverCard>
      <HoverCardTrigger href="/people/maya">@maya</HoverCardTrigger>
      <HoverCardContent>
        <p className="text-sm font-medium">Maya Chen</p>
        <p className="text-sm text-muted-foreground">Design engineer.</p>
      </HoverCardContent>
    </HoverCard>
  )
}`,
  },
  demos: [
    {
      name: "profile",
      title: "Profiles on mentions",
      description:
        "Rest the pointer on a name, or reach it with Tab, and a card shows who it is. Move to the next name and the card glides over to it, changing size to fit. Escape closes it.",
    },
  ],
  api: [
    {
      name: "HoverCard",
      description: "The root. Also accepts every Radix Hover Card Root prop.",
      props: [
        { name: "open", type: "boolean", description: "Whether it's open, when you control it." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Whether it starts open." },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Called when it opens or closes.",
        },
        {
          name: "openDelay",
          type: "number",
          default: "300",
          description:
            "Milliseconds the pointer rests on the link, or focus stays on it, before the card opens.",
        },
        {
          name: "closeDelay",
          type: "number",
          default: "300",
          description: "Milliseconds before it closes once the pointer leaves, so it can move onto the card.",
        },
        {
          name: "skipDelayDuration",
          type: "number",
          default: "300",
          description:
            "Milliseconds after a card closes during which the next one, anywhere on the page, opens at once without the delay, gliding over from the last one instead of opening from its link.",
        },
      ],
    },
    {
      name: "HoverCardTrigger",
      description:
        "The link the card previews; it renders an <a>, so give it an href. It has to make sense on its own, because screen readers don't get the card. Use asChild to make your own link the trigger.",
      props: [
        { name: "href", type: "string", description: "Where the link goes." },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render the single child (for example a Next.js Link) as the trigger.",
        },
      ],
    },
    {
      name: "HoverCardContent",
      description:
        "The card. It opens out of the link through a soft blur and stays open while the pointer is on it. Links inside it are skipped by Tab. Also accepts every Radix Hover Card Content prop.",
      props: [
        {
          name: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"bottom"',
          description: "The side of the link it opens on. It flips when there's no room.",
        },
        {
          name: "align",
          type: '"start" | "center" | "end"',
          default: '"center"',
          description: "How it lines up with the link along that side.",
        },
        {
          name: "sideOffset",
          type: "number",
          default: "4",
          description: "Gap between the link and the card, in px.",
        },
      ],
    },
  ],
  primitives: ["Radix Hover Card"],
  related: ["popover", "tooltip"],
  ai: {
    whenToUse:
      "Use HoverCard to preview what a link points to, such as a person behind an @mention or a page behind a link, for sighted pointer and keyboard users. Never put anything essential only in the card: use Popover for content people interact with, and Tooltip for a short hint.",
  },
} satisfies ItemMeta;
