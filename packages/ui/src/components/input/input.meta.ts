import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "input",
  title: "Input",
  description:
    "An accessible React text input with three sizes and clear invalid, disabled and file states, built on a native input.",
  kind: "component",
  category: "Forms",
  tags: ["input", "text field", "form"],
  keywords: ["react input", "nextjs input", "tailwind input", "shadcn input", "text field component"],
  status: "stable",
  addedAt: "2026-10-13",
  updatedAt: "2026-10-14",
  files: ["input.tsx"],
  usage: {
    code: `import { Input } from "@/components/ui/input"

export function EmailField() {
  return (
    <>
      <label htmlFor="email">Email</label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </>
  )
}`,
  },
  demos: [
    { name: "default", title: "Default" },
    {
      name: "invalid",
      title: "Invalid",
      description:
        "The error follows the value: it shows while the username is too short and goes away once it has 3 characters. Set aria-invalid and link the message with aria-describedby, so screen readers announce it.",
    },
    { name: "sizes", title: "Sizes", description: "Small, medium and large, matching Button's heights." },
    { name: "disabled", title: "Disabled" },
  ],
  api: [
    {
      name: "Input",
      description:
        "Also accepts every native input prop except the numeric size attribute. Exports inputVariants.",
      props: [
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "The height." },
        { name: "type", type: "string", default: '"text"', description: "The native input type." },
        {
          name: "aria-invalid",
          type: "boolean",
          description: "Marks the value as wrong: the border and focus ring turn destructive.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Prevents editing." },
      ],
    },
  ],
  related: ["select", "switch"],
  ai: {
    whenToUse:
      "Use Input for single-line text, email, number, password or file fields, always with a visible label. Use Select when the user picks from a fixed list.",
  },
} satisfies ItemMeta;
