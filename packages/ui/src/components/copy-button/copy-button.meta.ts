import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "copy-button",
  title: "Copy Button",
  description:
    'An accessible React copy to clipboard button for Next.js: the copy icon turns into a check, and screen readers hear "Copied".',
  kind: "component",
  category: "Buttons",
  tags: ["copy", "clipboard", "button", "share", "code"],
  keywords: [
    "react copy button",
    "react copy to clipboard",
    "nextjs copy to clipboard",
    "copy to clipboard button",
    "copy code button",
    "shadcn copy button",
    "tailwind copy button",
  ],
  status: "stable",
  addedAt: "2026-10-14",
  updatedAt: "2026-10-16",
  files: ["copy-button.tsx"],
  usage: {
    code: `import { CopyButton } from "@/components/ui/copy-button"

export function CopyCommand() {
  return <CopyButton value="npm install @fewtone/ui" />
}`,
  },
  demos: [
    {
      name: "variants",
      title: "Variants",
      description:
        'Icon only (named "Copy" for screen readers), or with a label that changes once it\'s copied, without the button changing width.',
    },
    { name: "command", title: "A command", description: "Next to a command or a snippet, in a small size." },
    {
      name: "input",
      title: "Next to a field",
      description: "For links and keys people need to paste somewhere else.",
    },
  ],
  api: [
    {
      name: "CopyButton",
      description:
        'Also accepts every Button prop except asChild. Uses the Clipboard API, falling back to a hidden textarea where it\'s unavailable. A polite live region says "Copied".',
      props: [
        { name: "value", type: "string", required: true, description: "The text to copy." },
        { name: "copiedText", type: "ReactNode", description: "Shown instead of the label once copied." },
        { name: "onCopy", type: "(value: string) => void", description: "Called after the text is copied." },
        {
          name: "resetAfter",
          type: "number",
          default: "2000",
          description: "Milliseconds the check shows before the copy icon returns.",
        },
        {
          name: "icon",
          type: "boolean",
          default: "true",
          description: "Shows the copy icon and the check. Set false for a text-only button with a label.",
        },
        { name: "variant", type: "Button variant", default: '"ghost"', description: "The button style." },
        {
          name: "size",
          type: "Button size",
          default: '"icon", or "md" with a label',
          description: "The button size.",
        },
      ],
    },
  ],
  primitives: ["Button", "Clipboard API"],
  related: ["button", "loading-button", "input"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/button/",
  ai: {
    whenToUse:
      "Use CopyButton next to anything people copy: commands, code, links, API keys. Pass the text as value; add a label and copiedText when an icon alone isn't clear.",
  },
} satisfies ItemMeta;
