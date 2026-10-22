import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "spinner",
  title: "Spinner",
  description:
    "An accessible React spinner for Next.js and Tailwind CSS: a small loading indicator in three sizes that takes the text's colour and pulses with reduced motion.",
  kind: "component",
  category: "Feedback",
  tags: ["spinner", "loading", "loader", "progress", "busy"],
  keywords: [
    "react spinner",
    "shadcn spinner",
    "loading spinner",
    "nextjs loading spinner",
    "tailwind spinner",
    "loading indicator",
    "react loader",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
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
        "The three icon sizes, and one inside a button. The arc turns once a second; with reduced motion it pulses instead.",
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
      ],
    },
  ],
  primitives: [],
  related: ["loading-button", "button", "badge"],
  ai: {
    whenToUse:
      "Use Spinner while something loads and there's no way to tell how far along it is: a panel fetching data, a button submitting. Use LoadingButton for a button that shows loading, success and error by itself.",
  },
} satisfies ItemMeta;
