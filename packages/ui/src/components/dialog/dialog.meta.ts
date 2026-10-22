import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "dialog",
  title: "Dialog",
  description:
    "An accessible React dialog for Next.js and Tailwind CSS: a modal window that grows out of its trigger, keeps focus inside and returns it, built on Radix Dialog.",
  kind: "component",
  category: "Overlays",
  tags: ["dialog", "modal", "overlay", "popup", "window"],
  keywords: [
    "react dialog",
    "react modal",
    "nextjs modal",
    "nextjs dialog",
    "shadcn dialog",
    "tailwind modal",
    "radix dialog",
    "animated modal",
    "accessible modal",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["dialog.tsx"],
  usage: {
    code: `import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function InviteDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Invite people</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
          <DialogDescription>They'll get an email with a link to join.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>Send invites</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}`,
  },
  demos: [
    {
      name: "edit-profile",
      title: "Edit profile",
      description:
        "A form in a dialog. The window grows out of the button that opened it and shrinks back into it. Saving closes it, so it's controlled with open and onOpenChange.",
    },
    {
      name: "scrolling",
      title: "Long content",
      description:
        "Long content scrolls between a header and a footer that stay in place. The window never grows past the screen; it keeps 16px clear on every side.",
    },
  ],
  api: [
    {
      name: "Dialog",
      description: "The root. It keeps the open state, so the window can play its exit before it unmounts.",
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
      name: "DialogTrigger",
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
      name: "DialogContent",
      description:
        "The window, with its backdrop, in a portal. It comes through the blur, scaling up from the trigger's centre, and leaves quickly; with reduced motion it only fades. Long content scrolls inside it. Give it a DialogTitle, which names it. Also accepts every Radix Dialog Content prop.",
      props: [
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
        {
          name: "onInteractOutside",
          type: "(event: Event) => void",
          description:
            "Runs on a click or focus outside the window. Call event.preventDefault() to keep it open.",
        },
      ],
    },
    {
      name: "DialogHeader",
      description: "Holds the title and description. It leaves room for the close button.",
      props: [],
    },
    {
      name: "DialogFooter",
      description:
        "Holds the actions: stacked on phones with the last one on top, in a row at the end from the sm breakpoint. Put the main action last.",
      props: [],
    },
    {
      name: "DialogTitle",
      description: "The heading, and the dialog's accessible name.",
      props: [],
    },
    {
      name: "DialogDescription",
      description: "A line under the title, read out after the name.",
      props: [],
    },
    {
      name: "DialogClose",
      description: "Closes the dialog. Use asChild to make your own Button close it, such as Cancel.",
      props: [
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Use your own element as the close button.",
        },
      ],
    },
    {
      name: "DialogPortal",
      description:
        "Renders its children into document.body while the dialog is open, and while it leaves. DialogContent already uses it.",
      props: [
        {
          name: "container",
          type: "HTMLElement",
          default: "document.body",
          description: "Where to render instead.",
        },
      ],
    },
    {
      name: "DialogOverlay",
      description: "The backdrop that dims the page. It only fades. DialogContent already includes it.",
      props: [],
    },
  ],
  primitives: ["Radix Dialog"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
  related: ["alert-dialog", "sheet"],
  ai: {
    whenToUse:
      "Use Dialog for a focused task that interrupts the page, such as a short form or details that need a response. Use Alert Dialog to confirm a destructive action, and Sheet for longer panels beside the page.",
  },
} satisfies ItemMeta;
