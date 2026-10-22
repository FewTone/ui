import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "alert-dialog",
  title: "Alert Dialog",
  description:
    "An accessible React alert dialog for Next.js that asks people to confirm destructive actions, with focus starting on Cancel, built on Radix Alert Dialog.",
  kind: "component",
  category: "Overlays",
  tags: ["alert dialog", "confirm", "confirmation", "modal", "destructive", "delete"],
  keywords: [
    "react alert dialog",
    "react confirm dialog",
    "confirmation modal",
    "delete confirmation dialog",
    "nextjs alert dialog",
    "shadcn alert dialog",
    "tailwind confirm dialog",
    "radix alert dialog",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["alert-dialog.tsx"],
  usage: {
    code: `import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function DeleteAccount() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            Your projects and settings go with it. You can't undo this.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={deleteAccount}>
            Delete account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}`,
  },
  demos: [
    {
      name: "delete-project",
      title: "Delete project",
      description:
        "Focus starts on Cancel, so pressing Enter by reflex does no harm. Escape cancels; clicking the backdrop does nothing. Like Dialog, the window grows out of its trigger.",
    },
  ],
  api: [
    {
      name: "AlertDialog",
      description: "The root. It keeps the open state, so the window can play its exit before it unmounts.",
      props: [
        { name: "open", type: "boolean", description: "Whether it's open, when you control it." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Whether it starts open." },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Called when it opens or closes: the trigger, Cancel, the action or Escape.",
        },
      ],
    },
    {
      name: "AlertDialogTrigger",
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
      name: "AlertDialogContent",
      description:
        "The window, with its backdrop, in a portal: the same look and motion as Dialog, a little narrower, without a close button. Announced as an alertdialog, named by its title and described by its description. Also accepts every Radix Alert Dialog Content prop.",
      props: [
        {
          name: "onOpenAutoFocus",
          type: "(event: Event) => void",
          description:
            "Runs as focus moves to Cancel. Call event.preventDefault() to focus something else yourself.",
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
      name: "AlertDialogHeader",
      description: "Holds the title and description.",
      props: [],
    },
    {
      name: "AlertDialogFooter",
      description:
        "Holds Cancel and the action: stacked on phones with the action on top, in a row at the end from the sm breakpoint.",
      props: [],
    },
    {
      name: "AlertDialogTitle",
      description: "The question, and the dialog's accessible name. Say what will happen: “Delete project?”.",
      props: [],
    },
    {
      name: "AlertDialogDescription",
      description: "What the action does and whether it can be undone, read out after the name.",
      props: [],
    },
    {
      name: "AlertDialogAction",
      description:
        "Confirms and closes. It's a Button, so it takes Button's variant and size. Your onClick runs first; call event.preventDefault() there to keep the dialog open.",
      props: [
        {
          name: "variant",
          type: '"default" | "secondary" | "outline" | "ghost" | "destructive" | "link"',
          default: '"default"',
          description: "The button style. Use destructive for actions that remove things.",
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "The button height.",
        },
      ],
    },
    {
      name: "AlertDialogCancel",
      description: "Closes without doing anything. It has focus when the dialog opens.",
      props: [
        {
          name: "variant",
          type: '"default" | "secondary" | "outline" | "ghost" | "destructive" | "link"',
          default: '"outline"',
          description: "The button style.",
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "The button height.",
        },
      ],
    },
    {
      name: "AlertDialogPortal",
      description:
        "Renders its children into document.body while the dialog is open, and while it leaves. AlertDialogContent already uses it.",
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
      name: "AlertDialogOverlay",
      description:
        "The backdrop that dims the page. It only fades, and clicking it does nothing. AlertDialogContent already includes it.",
      props: [],
    },
  ],
  primitives: ["Radix Alert Dialog"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/",
  related: ["dialog", "button"],
  ai: {
    whenToUse:
      "Use AlertDialog to confirm an action that is destructive or can't be undone, such as deleting. It needs an explicit answer: the backdrop doesn't close it. For anything else in a modal, use Dialog.",
  },
} satisfies ItemMeta;
