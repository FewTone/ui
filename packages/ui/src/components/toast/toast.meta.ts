import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "toast",
  title: "Toast",
  description:
    "An accessible React toast for Next.js: notifications that slide in, stack like a deck and swipe away, with a toast() function and Radix Toast parts.",
  kind: "component",
  category: "Feedback",
  tags: ["toast", "notification", "snackbar", "toaster", "alert", "message", "promise"],
  keywords: [
    "react toast",
    "nextjs toast",
    "shadcn toast",
    "sonner alternative",
    "toast notification",
    "react notification",
    "tailwind toast",
    "radix toast",
    "toast promise",
    "snackbar react",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["toast.tsx"],
  usage: {
    code: `import { Toaster, toast } from "@/components/ui/toast"

// Once, in your root layout
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

// Anywhere in a client component
export function SaveButton() {
  return <button onClick={() => toast.success("Changes saved")}>Save</button>
}`,
  },
  demos: [
    {
      name: "types",
      title: "Types",
      description:
        "Default, success, error and with an action. Show a few in a row: they stack like a deck, and hovering or focusing them fans them out into a list. Swipe one sideways to dismiss it.",
    },
    {
      name: "promise",
      title: "Promise",
      description:
        "toast.promise shows a spinner until the work settles, then swaps the same toast to the result through the blur.",
    },
    {
      name: "composed",
      title: "Composing the parts",
      description:
        "For a toast you render yourself: ToastProvider, Toast with your own open state, and ToastViewport placed once. It still stacks and plays its exit.",
    },
  ],
  // The page opens on buttons that show real toasts; the index card shows a still deck
  preview: { card: "card" },
  api: [
    {
      name: "Toaster",
      description:
        "Shows the toasts from toast(). Place it once, for example in your root layout; if several mount, only the first shows toasts. Also accepts every ToastViewport prop.",
      props: [
        {
          name: "position",
          type: '"top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"',
          default: '"bottom-right"',
          description:
            "Where toasts appear. They swipe towards the nearer side: left for left positions, right otherwise.",
        },
        {
          name: "duration",
          type: "number",
          default: "5000",
          description: "Milliseconds each toast stays open, unless it sets its own.",
        },
        {
          name: "expand",
          type: "boolean",
          default: "false",
          description: "Always show the toasts as a list, instead of a deck that fans out on hover or focus.",
        },
        {
          name: "visibleToasts",
          type: "number",
          default: "3",
          description: "How many toasts show at once. Older ones wait out of sight until newer ones close.",
        },
      ],
    },
    {
      name: "toast",
      description:
        "A function, callable from any client code once a Toaster is mounted. Each call returns the toast's id.",
      props: [
        {
          name: "toast(title, options?)",
          type: "(title: ReactNode, options?: ToastOptions) => string",
          description: "Shows a toast.",
        },
        {
          name: "toast.success / toast.error",
          type: "(title: ReactNode, options?: ToastOptions) => string",
          description:
            "With a check, or a cross and the title in the destructive colour. Both draw themselves in.",
        },
        {
          name: "toast.loading",
          type: "(title: ReactNode, options?: ToastOptions) => string",
          description: "With a spinner. It stays until you update it (pass its id) or dismiss it.",
        },
        {
          name: "toast.promise",
          type: "(promise, { loading, success, error }, options?) => string",
          description:
            "Shows loading until the promise settles, then success or error in the same toast. success and error can be functions of the result.",
        },
        {
          name: "toast.dismiss",
          type: "(id?: string) => void",
          description: "Closes one toast, or every toast without an id.",
        },
        {
          name: "options.id",
          type: "string",
          description: "Updates the toast with this id, if it's showing, instead of adding another.",
        },
        { name: "options.description", type: "ReactNode", description: "A second line under the title." },
        {
          name: "options.action",
          type: "{ label: string; onClick?: (event) => void; altText?: string }",
          description:
            "A button such as Undo. It closes the toast after onClick, unless onClick calls preventDefault. altText (the label by default) says what it does for screen readers.",
        },
        {
          name: "options.duration",
          type: "number",
          description: "Milliseconds before this toast closes; Infinity keeps it until it's dismissed.",
        },
      ],
    },
    {
      name: "ToastProvider",
      description: "Wraps your toasts and their viewport, for the parts. Built on Radix Toast's provider.",
      props: [
        {
          name: "duration",
          type: "number",
          default: "5000",
          description: "Milliseconds a toast stays open, unless it sets its own.",
        },
        {
          name: "label",
          type: "string",
          default: '"Notification"',
          description: "Said by screen readers before each toast.",
        },
        {
          name: "swipeThreshold",
          type: "number",
          default: "50",
          description: "Pixels a swipe must travel to dismiss the toast; shorter swipes spring back.",
        },
      ],
    },
    {
      name: "Toast",
      description:
        "One notification, built on Radix Toast's root. Put a ToastTitle, ToastDescription, ToastAction and ToastClose inside. Escape, a swipe, ToastClose and ToastAction close it; its timer pauses while it's hovered or focused.",
      props: [
        { name: "open", type: "boolean", description: "Whether it shows, when you control it." },
        {
          name: "defaultOpen",
          type: "boolean",
          default: "true",
          description: "Whether it shows at first, when you don't.",
        },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Called when it opens or closes, including when its time is up.",
        },
        {
          name: "variant",
          type: '"default" | "destructive"',
          default: '"default"',
          description: "Destructive turns the title the destructive colour, on the same neutral surface.",
        },
        {
          name: "duration",
          type: "number",
          description: "Milliseconds before it closes, overriding the provider's.",
        },
        {
          name: "type",
          type: '"foreground" | "background"',
          default: '"foreground"',
          description:
            "Foreground (a result of what the person did) is read out at once; background waits its turn.",
        },
        {
          name: "onExitComplete",
          type: "() => void",
          description: "Called once it has finished leaving, for example to drop it from your own list.",
        },
      ],
    },
    {
      name: "ToastViewport",
      description:
        "Where the toasts appear: a list fixed to the screen, portalled to the end of the body. Place it once inside ToastProvider. F8 moves focus to it.",
      props: [
        {
          name: "position",
          type: "ToastPosition",
          default: '"bottom-right"',
          description: "The corner, or the middle of the top or bottom edge.",
        },
        {
          name: "expand",
          type: "boolean",
          default: "false",
          description: "Always show the toasts as a list.",
        },
        {
          name: "visibleToasts",
          type: "number",
          default: "3",
          description: "How many toasts show at once.",
        },
        {
          name: "hotkey",
          type: "string[]",
          default: '["F8"]',
          description: "The keys that move focus to the toasts.",
        },
        {
          name: "label",
          type: "string",
          default: '"Notifications ({hotkey})"',
          description: "The region's name for screen readers.",
        },
      ],
    },
    {
      name: "ToastTitle",
      description: "The toast's first line.",
      props: [],
    },
    {
      name: "ToastDescription",
      description: "A second, muted line.",
      props: [],
    },
    {
      name: "ToastAction",
      description: "A small outline button that acts on the toast, then closes it.",
      props: [
        {
          name: "altText",
          type: "string",
          required: true,
          description:
            "How to do the same without the toast, for screen readers, which may hear the toast after it's gone.",
        },
      ],
    },
    {
      name: "ToastClose",
      description: 'An X button that closes the toast, named "Close". Pass children to replace the X.',
      props: [],
    },
  ],
  primitives: ["Radix Toast", "Button", "Spinner"],
  related: ["loading-button", "progress"],
  ai: {
    whenToUse:
      "Use toast() with one <Toaster /> for brief messages about something that just happened (saved, sent, failed), with an optional Undo action; use toast.promise for async work. Use Dialog when the person must respond before going on.",
  },
} satisfies ItemMeta;
