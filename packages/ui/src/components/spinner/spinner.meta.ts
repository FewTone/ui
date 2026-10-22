import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "spinner",
  title: "Spinner",
  description:
    "An accessible React spinner for Next.js and Tailwind CSS: one line going round an infinity that fills it once the task is done.",
  kind: "component",
  category: "Feedback",
  tags: ["spinner", "loading", "loader", "progress", "busy", "infinity"],
  keywords: [
    "react spinner",
    "shadcn spinner",
    "loading spinner",
    "nextjs loading spinner",
    "tailwind spinner",
    "loading indicator",
    "react loader",
    "infinity loader",
    "animated loading icon",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-22",
  files: ["spinner.tsx"],
  usage: {
    code: `import { Spinner } from "@/components/ui/spinner"

export function Loading() {
  return <Spinner />
}`,
  },
  demos: [
    {
      name: "sizes",
      title: "Sizes",
      description:
        "The three icon sizes, and one inside a button. One line goes round the infinity at an even pace; with reduced motion it pulses instead.",
    },
    {
      name: "finish",
      title: "Finish",
      description:
        "Set done when the task is finished: the line stops where it is and grows until it fills the whole infinity. Back to loading, it shrinks and travels on.",
    },
    {
      name: "with-text",
      title: "With text",
      description:
        'Beside text, put role="status" on the row and hide the spinner, so it\'s read once as the text.',
    },
  ],
  // The page names the sizes and adds a button; the index card shows the three sizes alone
  preview: { card: "card" },
  api: [
    {
      name: "Spinner",
      description:
        'A status (role="status") drawn in currentColor, so it takes the text\'s colour. Also accepts every native span prop.',
      props: [
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "14, 16 or 20px, the icon sizes, so it can stand in for an icon.",
        },
        {
          name: "aria-label",
          type: "string",
          default: '"Loading"',
          description:
            "What's loading, for screen readers. Inside a button or beside text that already says it, pass aria-hidden instead.",
        },
        {
          name: "done",
          type: "boolean",
          default: "false",
          description: "The task is finished: the line fills the whole infinity and stops.",
        },
        {
          name: "doneLabel",
          type: "string",
          default: '"Done"',
          description: "Its name for screen readers once done.",
        },
      ],
    },
  ],
  primitives: [],
  related: ["loading-button", "button", "badge"],
  ai: {
    whenToUse:
      "Use Spinner while something loads and there's no way to tell how far along it is: a panel fetching data, a button submitting. Set done when it finishes to fill the infinity. Use LoadingButton for a button that shows loading, success and error by itself.",
  },
} satisfies ItemMeta;
