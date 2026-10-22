import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "tooltip",
  title: "Tooltip",
  description:
    "An accessible React tooltip for Next.js and Tailwind CSS: a short hint on hover and keyboard focus, fast across a toolbar, built on Radix Tooltip.",
  kind: "component",
  category: "Overlays",
  tags: ["tooltip", "hint", "overlay", "toolbar", "icon button"],
  keywords: [
    "react tooltip",
    "nextjs tooltip",
    "shadcn tooltip",
    "tailwind tooltip",
    "radix tooltip",
    "animated tooltip",
    "icon button tooltip",
    "toolbar tooltip",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["tooltip.tsx"],
  usage: {
    code: `import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Undo2Icon } from "lucide-react"

export function UndoButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Undo">
            <Undo2Icon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}`,
  },
  demos: [
    {
      name: "toolbar",
      title: "A toolbar",
      description:
        "Hover a button, or reach it with Tab: after a moment its tooltip opens out of it. Then move along the row and the next tooltips appear at once, each taking the last one's place. Escape closes it.",
    },
  ],
  // The page opens on the toolbar with a side setting; the index card shows the toolbar alone
  preview: { card: "card" },
  api: [
    {
      name: "TooltipProvider",
      description:
        "Wrap a toolbar, or your whole app, so its tooltips share the delay: once one has opened, the next open at once. A Tooltip without a provider gets its own. Also accepts every Radix Tooltip Provider prop.",
      props: [
        {
          name: "delayDuration",
          type: "number",
          default: "300",
          description: "Milliseconds the pointer rests on a trigger before its tooltip opens.",
        },
        {
          name: "skipDelayDuration",
          type: "number",
          default: "300",
          description:
            "Milliseconds after a tooltip closes during which the next one opens at once, without the delay or the opening animation.",
        },
        {
          name: "disableHoverableContent",
          type: "boolean",
          default: "false",
          description:
            "Closes the tooltip as soon as the pointer leaves the trigger, even towards the tooltip.",
        },
      ],
    },
    {
      name: "Tooltip",
      description: "One trigger and its tooltip. Also accepts every Radix Tooltip Root prop.",
      props: [
        { name: "open", type: "boolean", description: "Whether it's open, when you control it." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Whether it starts open." },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Called when it opens or closes.",
        },
        {
          name: "delayDuration",
          type: "number",
          description: "Overrides the provider's delay for this tooltip.",
        },
      ],
    },
    {
      name: "TooltipTrigger",
      description:
        "What the tooltip describes. It opens on hover and on keyboard focus, and closes on click and Escape. Use asChild with a Button; an icon-only Button still needs its own aria-label, since the tooltip only describes it.",
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
      name: "TooltipContent",
      description:
        "The hint: short text, inverted from the page. It opens out of its trigger through a soft blur. Also accepts every Radix Tooltip Content prop.",
      props: [
        {
          name: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"top"',
          description: "The side of the trigger it shows on. It flips when there's no room.",
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
          description: "Gap between the trigger and the tooltip, in px.",
        },
      ],
    },
  ],
  primitives: ["Radix Tooltip"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/",
  related: ["popover", "hover-card", "button"],
  ai: {
    whenToUse:
      "Use Tooltip for a short text hint on a control, most often the name of an icon button, shown on hover and focus. Keep anything interactive or long out of it: use Popover for that, and Hover Card for a preview of a link.",
  },
} satisfies ItemMeta;
