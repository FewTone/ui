import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "sheet",
  title: "Sheet",
  description:
    "An accessible React sheet for Next.js: a side panel that slides in from any edge of the screen, for forms, filters and navigation, built on Radix Dialog.",
  kind: "component",
  category: "Overlays",
  tags: ["sheet", "drawer", "side panel", "slide over", "modal", "overlay"],
  keywords: [
    "react sheet",
    "react drawer",
    "react side panel",
    "nextjs drawer",
    "shadcn sheet",
    "tailwind drawer",
    "slide over panel",
    "off canvas menu",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["sheet.tsx"],
  usage: {
    code: `import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Filters() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Filters</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow the results.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}`,
  },
  demos: [
    {
      name: "sides",
      title: "Sides",
      description:
        "A sheet slides in from any edge and slides back out quickly. The backdrop fades, and the page behind waits until it's closed.",
    },
  ],
  api: [
    {
      name: "Sheet",
      description: "The root. It keeps the open state, so the panel can slide out before it unmounts.",
      props: [
        { name: "open", type: "boolean", description: "Whether it's open, when you control it." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Whether it starts open." },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Called when it opens or closes: the trigger, a close button, Escape or the backdrop.",
        },
        {
          name: "modal",
          type: "boolean",
          default: "true",
          description:
            "Modal blocks the page behind, hides it from screen readers and keeps focus inside. Set false to let people use the page while it's open (there's no backdrop then).",
        },
      ],
    },
    {
      name: "SheetTrigger",
      description: "The button that opens it. Focus comes back here when it closes.",
      props: [
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Use your own element, such as a Button, as the trigger.",
        },
      ],
    },
    {
      name: "SheetContent",
      description:
        "The panel, with its backdrop, in a portal. It slides in from its edge on a spring and leaves quickly; with reduced motion it only fades. Long content scrolls inside it. Give it a SheetTitle, which names it. Also accepts every Radix Dialog Content prop.",
      props: [
        {
          name: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"right"',
          description:
            "The edge it slides in from. Right and left panels are three quarters of the screen wide, up to 24rem; top and bottom ones are as tall as their content.",
        },
        {
          name: "showCloseButton",
          type: "boolean",
          default: "true",
          description: "Shows a close button in the top corner, named Close.",
        },
        {
          name: "onOpenAutoFocus",
          type: "(event: Event) => void",
          description:
            "Runs as focus moves in (to the first focusable element). Call event.preventDefault() to focus something else yourself.",
        },
        {
          name: "onCloseAutoFocus",
          type: "(event: Event) => void",
          description:
            "Runs as focus goes back to the trigger. Call event.preventDefault() to send it elsewhere.",
        },
        {
          name: "onEscapeKeyDown",
          type: "(event: KeyboardEvent) => void",
          description: "Runs when Escape is pressed. Call event.preventDefault() to keep it open.",
        },
      ],
    },
    {
      name: "SheetHeader",
      description: "Holds the title and description. It leaves room for the close button.",
      props: [],
    },
    {
      name: "SheetFooter",
      description:
        "Holds the actions at the panel's foot: stacked on phones with the last one on top, in a row at the end from the sm breakpoint.",
      props: [],
    },
    {
      name: "SheetTitle",
      description: "The heading, and the sheet's accessible name.",
      props: [],
    },
    {
      name: "SheetDescription",
      description: "A line under the title, read out after the name.",
      props: [],
    },
    {
      name: "SheetClose",
      description: "Closes the sheet. Use asChild to make your own Button close it.",
      props: [
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Use your own element as the close button.",
        },
      ],
    },
  ],
  primitives: ["Radix Dialog"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
  related: ["dialog", "alert-dialog"],
  ai: {
    whenToUse:
      "Use Sheet for a panel beside the page: a form, filters, settings or navigation on small screens. Use Dialog for a short task in the middle of the screen, and Alert Dialog to confirm a destructive action.",
  },
} satisfies ItemMeta;
