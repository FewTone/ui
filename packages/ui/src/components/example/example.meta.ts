import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "example",
  title: "Example",
  description:
    "A placeholder button that shows how a FewTone UI component page works, from preview to API reference.",
  kind: "component",
  category: "Buttons",
  keywords: ["react button", "tailwind button"],
  status: "draft",
  addedAt: "2026-10-12",
  updatedAt: "2026-10-12",
  files: ["example.tsx"],
  usage: {
    code: `import { Example } from "@/components/ui/example"

export function Demo() {
  return <Example variant="outline">Cancel</Example>
}`,
  },
  demos: [
    { name: "default", title: "Default" },
    { name: "variants", title: "Variants", description: "Solid for the main action, outline for the rest." },
  ],
  api: [
    {
      name: "Example",
      props: [
        {
          name: "variant",
          type: '"solid" | "outline"',
          default: '"solid"',
          description: "The visual style.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Prevents interaction." },
      ],
    },
  ],
} satisfies ItemMeta;
