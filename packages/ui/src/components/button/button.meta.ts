import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "button",
  title: "Button",
  description:
    "An accessible React button with six variants, three sizes, icon support and a spring press, built on a native button.",
  kind: "component",
  category: "Buttons",
  tags: ["button", "action", "link"],
  keywords: ["react button", "nextjs button", "tailwind button", "shadcn button", "button component"],
  status: "stable",
  addedAt: "2026-10-13",
  updatedAt: "2026-10-14",
  files: ["button.tsx"],
  usage: {
    code: `import { Button } from "@/components/ui/button"

export function Actions() {
  return <Button>Continue</Button>
}`,
  },
  demos: [
    { name: "default", title: "Default" },
    {
      name: "variants",
      title: "Variants",
      description:
        "Default for the main action, secondary and outline for the rest, destructive for actions that remove things.",
    },
    {
      name: "sizes",
      title: "Sizes",
      description: "Three heights, plus square icon buttons. Icon-only buttons need an aria-label.",
    },
    {
      name: "with-icon",
      title: "With an icon",
      description: "Icons sit before or after the label and size themselves.",
    },
    {
      name: "as-link",
      title: "As a link",
      description: "With asChild, the button styles go onto its child, so a link stays a real link.",
    },
  ],
  api: [
    {
      name: "Button",
      description:
        "Also accepts every native button prop. Exports buttonVariants for styling other elements.",
      props: [
        {
          name: "variant",
          type: '"default" | "secondary" | "outline" | "ghost" | "destructive" | "link"',
          default: '"default"',
          description: "The visual style.",
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg"',
          default: '"md"',
          description: "Height and padding. Icon sizes are square.",
        },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description:
            "Render the single child (for example a link) with the button styles instead of a button.",
        },
        {
          name: "type",
          type: '"button" | "submit" | "reset"',
          default: '"button"',
          description: "The native button type. Defaults to button so it never submits a form by accident.",
        },
      ],
    },
  ],
  primitives: ["Radix Slot"],
  related: ["input", "select"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/button/",
  ai: {
    whenToUse:
      "Use Button for actions (submit, save, open). Use asChild with a link for navigation. Use Switch for settings that turn on or off.",
  },
} satisfies ItemMeta;
