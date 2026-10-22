import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "popover",
  title: "Popover",
  description:
    "An accessible React popover for Next.js and Tailwind CSS: forms, settings and other rich content anchored to a button, built on Radix Popover.",
  kind: "component",
  category: "Overlays",
  tags: ["popover", "overlay", "floating", "dialog", "form"],
  keywords: [
    "react popover",
    "nextjs popover",
    "shadcn popover",
    "tailwind popover",
    "radix popover",
    "animated popover",
    "popover form",
    "floating panel",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["popover.tsx"],
  usage: {
    code: `import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

export function Dimensions() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Dimensions</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the size of the layer.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}`,
  },
  demos: [
    {
      name: "uses",
      title: "Dimensions and Share",
      description:
        "Two everyday popovers. In Dimensions, turn on Limit size: two fields come in and the popover glides to its new height instead of jumping. Focus moves into the popover when it opens, and Escape closes it.",
    },
    {
      name: "sides",
      title: "Side and alignment",
      description:
        "A popover opens on any side of its trigger and lines up with its start, centre or end. It grows out of the edge it's attached to, and flips when there's no room.",
    },
    {
      name: "anchor",
      title: "Anchored to a field",
      description:
        "With PopoverAnchor, the filter button opens the popover but it lines up with the whole search field and takes its width. PopoverClose closes it and focus goes back to the button.",
    },
  ],
  preview: { height: "lg" },
  api: [
    {
      name: "Popover",
      description: "The root. Also accepts every Radix Popover Root prop.",
      props: [
        { name: "open", type: "boolean", description: "Whether it's open, when you control it." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Whether it starts open." },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Called when it opens or closes.",
        },
        {
          name: "modal",
          type: "boolean",
          default: "false",
          description:
            "Keeps focus inside and makes the rest of the page inert while it's open, like a dialog.",
        },
      ],
    },
    {
      name: "PopoverTrigger",
      description:
        "The button that opens and closes it. With asChild, your own Button becomes the trigger. Screen readers hear that it opens a dialog, and whether it's open.",
      props: [
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render the single child (for example a Button) as the trigger.",
        },
      ],
    },
    {
      name: "PopoverAnchor",
      description:
        "Optional. Positions the popover against this element instead of the trigger, for example a whole field with the trigger inside it.",
      props: [
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render the single child as the anchor.",
        },
      ],
    },
    {
      name: "PopoverContent",
      description:
        "The popover: a non-modal dialog. It opens from its trigger through a soft blur, and when its content changes size it glides to the new height (instant with reduced motion). Focus moves into it on open and back to the trigger on close; Escape and a click outside close it. Also accepts every Radix Popover Content prop.",
      props: [
        {
          name: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"bottom"',
          description: "The side of the trigger it opens on. It flips when there's no room.",
        },
        {
          name: "align",
          type: '"start" | "center" | "end"',
          default: '"center"',
          description: "How it lines up with the trigger along that side.",
        },
        {
          name: "sideOffset",
          type: "number",
          default: "4",
          description: "Gap between the trigger and the popover, in px.",
        },
        {
          name: "onOpenAutoFocus",
          type: "(event: Event) => void",
          description:
            "Called when focus moves in on open. Call event.preventDefault() to keep it on the trigger.",
        },
      ],
    },
    {
      name: "PopoverHeader",
      description: "Optional. Stacks the title and description.",
      props: [],
    },
    {
      name: "PopoverTitle",
      description:
        "Names the popover for screen readers. Give every popover a title, or an aria-label on PopoverContent.",
      props: [],
    },
    {
      name: "PopoverDescription",
      description: "Optional. Read out after the title when the popover opens.",
      props: [],
    },
    {
      name: "PopoverClose",
      description: "A button that closes the popover. Use asChild to make your own Button close it.",
      props: [
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render the single child (for example a Button) as the close button.",
        },
      ],
    },
  ],
  primitives: ["Radix Popover"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
  related: ["tooltip", "hover-card", "select"],
  ai: {
    whenToUse:
      "Use Popover for interactive content anchored to a button: a small form, settings, filters or a share link. Use Tooltip for a short text hint, Hover Card for a preview on hover, and Select to pick one value from a list.",
  },
} satisfies ItemMeta;
