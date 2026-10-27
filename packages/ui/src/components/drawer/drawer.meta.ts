import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "drawer",
  title: "Drawer",
  description:
    "An accessible React drawer for Next.js and Tailwind CSS: an iOS bottom sheet on phones that drags to close and works with the keyboard, a dialog on larger screens.",
  kind: "component",
  category: "Overlays",
  tags: ["drawer", "bottom sheet", "sheet", "modal", "mobile", "ios"],
  keywords: [
    "react drawer",
    "react bottom sheet",
    "shadcn drawer",
    "nextjs drawer",
    "ios bottom sheet",
    "vaul drawer",
    "mobile modal",
    "responsive dialog",
    "swipe to close",
  ],
  status: "new",
  addedAt: "2026-10-26",
  updatedAt: "2026-10-26",
  files: ["drawer.tsx"],
  usage: {
    code: `import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export function MoveToTrash() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Move to trash</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Move to trash?</DrawerTitle>
          <DrawerDescription>You can restore it for 30 days.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button variant="destructive">Move to trash</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// For the page to step back behind the sheet, wrap your app once (app/layout.tsx):
// <body>
//   <div data-vaul-drawer-wrapper="" className="min-h-svh bg-background">{children}</div>
// </body>
// and let content reach the screen's edges, so the sheet clears the home indicator:
// export const viewport = { viewportFit: "cover" }`,
  },
  demos: [
    {
      name: "profile",
      title: "Edit profile",
      description:
        "A form in a sheet. On a phone, the sheet sits on the keyboard and keeps the focused field in view above the pinned buttons. The setting picks what it opens as: an app usually leaves it on auto, a sheet on phones and a dialog elsewhere.",
    },
    {
      name: "scrolling",
      title: "Long content",
      description:
        "The sheet grows to just under the status bar; its content scrolls on its own and the buttons stay pinned.",
    },
    {
      name: "nested",
      title: "A sheet on a sheet",
      description: "A drawer opened from a sheet: the first steps back behind the second.",
    },
  ],
  // The page opens on a form and a setting; the index card shows a single trigger
  preview: { card: "card" },
  api: [
    {
      name: "Drawer",
      description:
        "Holds the open state. What it opens as is chosen as it opens and kept while it's open, so it never swaps mid-use.",
      props: [
        {
          name: "mode",
          type: '"auto" | "sheet" | "dialog"',
          default: '"auto"',
          description: "A sheet on phones (under 768px) and a dialog elsewhere, or always one of them.",
        },
        { name: "open", type: "boolean", description: "Whether it's open (controlled)." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Open on first render." },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description:
            "Called as it opens and closes, by any means (a drag, Escape, the backdrop, a button).",
        },
      ],
    },
    {
      name: "DrawerTrigger",
      description: "Opens it. Use asChild to make your Button the trigger.",
      props: [],
    },
    {
      name: "DrawerContent",
      description:
        "The sheet (with a grabber, and a body that scrolls) or the dialog window. Focus goes into it, not to its first field, so the keyboard doesn't jump up. Also accepts every Radix Dialog Content prop.",
      props: [
        {
          name: "showCloseButton",
          type: "boolean",
          default: "true",
          description: "Show a close button in the top corner.",
        },
      ],
    },
    {
      name: "DrawerHeader",
      description: "The title and description, stopping short of the close button.",
      props: [],
    },
    {
      name: "DrawerFooter",
      description:
        "Actions. In the sheet they're pinned to the bottom, full width with the last one on top, above the home indicator; in the dialog, a row at the end. Put the main action last.",
      props: [],
    },
    { name: "DrawerTitle", description: "Names the drawer for screen readers. Required.", props: [] },
    { name: "DrawerDescription", description: "Describes it, read after the title.", props: [] },
    { name: "DrawerClose", description: "Closes it. Use asChild with a Button.", props: [] },
  ],
  primitives: ["Vaul", "Radix Dialog"],
  related: ["dialog", "sheet", "alert-dialog"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
  ai: {
    whenToUse:
      "Use Drawer for anything that should open as an iOS bottom sheet on phones (forms, confirmations, pickers, details) and as a dialog on larger screens. Use Sheet for a panel from the side beside the page, and Dialog when it should always be a centred window. Wrap the app in data-vaul-drawer-wrapper so the page steps back.",
  },
} satisfies ItemMeta;
