import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "textarea",
  title: "Textarea",
  description:
    "An accessible React textarea for Next.js that grows smoothly with its content, with min and max rows, styled like Input with Tailwind CSS.",
  kind: "component",
  category: "Forms",
  tags: ["textarea", "text area", "multiline", "auto resize", "form"],
  keywords: [
    "react textarea",
    "nextjs textarea",
    "tailwind textarea",
    "shadcn textarea",
    "auto resize textarea",
    "autosize textarea react",
    "auto growing textarea",
    "textarea character counter",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["textarea.tsx"],
  usage: {
    code: `import { Textarea } from "@/components/ui/textarea"

export function MessageField() {
  return (
    <>
      <label htmlFor="message">Message</label>
      <Textarea id="message" minRows={2} maxRows={6} />
    </>
  )
}`,
  },
  demos: [
    {
      name: "default",
      title: "Default",
      description:
        "Type a few lines: the field glides taller a line at a time, up to 6 lines, then scrolls. Delete them and it glides back to 2.",
    },
    {
      name: "counter",
      title: "Character counter",
      description:
        "maxLength stops the text at 160 characters. Each digit of the count swaps through the blur on its own, rising as you type and falling as you delete.",
    },
    { name: "disabled", title: "Disabled" },
  ],
  api: [
    {
      name: "Textarea",
      description:
        "Also accepts every native textarea prop except rows (use minRows). Grows with its text; with reduced motion it resizes at once.",
      props: [
        {
          name: "minRows",
          type: "number",
          default: "3",
          description: "The lines it shows when empty. It never gets shorter.",
        },
        {
          name: "maxRows",
          type: "number",
          description: "The lines it grows to before it scrolls. Unlimited when left out.",
        },
        {
          name: "aria-invalid",
          type: "boolean",
          description: "Marks the value as wrong: the border and focus ring turn destructive.",
        },
        { name: "maxLength", type: "number", description: "The most characters it accepts." },
        { name: "disabled", type: "boolean", default: "false", description: "Prevents editing." },
      ],
    },
  ],
  related: ["input"],
  ai: {
    whenToUse:
      "Use Textarea for multi-line text such as messages, comments, descriptions and bios, always with a visible label. Set minRows and maxRows to bound how far it grows. Use Input for a single line.",
  },
} satisfies ItemMeta;
