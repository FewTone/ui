import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "checkbox",
  title: "Checkbox",
  description:
    "An accessible React checkbox for Next.js forms, with a check that draws itself in and an indeterminate state, built on Radix Checkbox.",
  kind: "component",
  category: "Forms",
  tags: ["checkbox", "check", "form", "select all"],
  keywords: [
    "react checkbox",
    "nextjs checkbox",
    "tailwind checkbox",
    "shadcn checkbox",
    "animated checkbox",
    "indeterminate checkbox",
    "select all checkbox",
  ],
  status: "stable",
  addedAt: "2026-10-15",
  updatedAt: "2026-10-15",
  files: ["checkbox.tsx"],
  usage: {
    code: `import { Checkbox } from "@/components/ui/checkbox"

export function Terms() {
  return (
    <>
      <Checkbox id="terms" />
      <label htmlFor="terms">Accept terms and conditions</label>
    </>
  )
}`,
  },
  demos: [
    {
      name: "default",
      title: "Default",
      description:
        "Check it and the box fills as the check draws itself in; uncheck it and the check erases.",
      zoom: 2,
    },
    {
      name: "hint",
      title: "Label and hint",
      description: "A visible label, and a hint linked with aria-describedby.",
    },
    {
      name: "select-all",
      title: "Select all",
      description:
        "The parent shows a dash while only some are picked; checking it picks them all. Checked and dash swap marks without the fill moving.",
    },
    { name: "sizes", title: "Sizes", zoom: 1.5 },
    { name: "disabled", title: "Disabled" },
  ],
  api: [
    {
      name: "Checkbox",
      description:
        "Also accepts every Radix Checkbox prop. Inside a form it submits through a hidden native checkbox, and a form reset restores its first state.",
      props: [
        {
          name: "checked",
          type: 'boolean | "indeterminate"',
          description: "The state, when you control it. Indeterminate shows a dash.",
        },
        {
          name: "defaultChecked",
          type: 'boolean | "indeterminate"',
          default: "false",
          description: "The initial state.",
        },
        {
          name: "onCheckedChange",
          type: '(checked: boolean | "indeterminate") => void',
          description: "Called when the user checks or unchecks it. An indeterminate box becomes checked.",
        },
        {
          name: "size",
          type: '"sm" | "md"',
          default: '"md"',
          description: "16 or 20px, the heights of Switch's sizes.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Prevents interaction." },
        {
          name: "required",
          type: "boolean",
          default: "false",
          description: "Must be checked to submit the form.",
        },
        { name: "name", type: "string", description: "Submits the value with a form." },
        { name: "value", type: "string", default: '"on"', description: "The value submitted when checked." },
      ],
    },
  ],
  primitives: ["Radix Checkbox"],
  related: ["switch", "toggle-group", "input"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/",
  ai: {
    whenToUse:
      'Use Checkbox for choices submitted with a form, agreeing to terms, and picking several items from a list. Set checked to "indeterminate" on a select-all box when only some are picked. Use Switch for settings that apply right away.',
  },
} satisfies ItemMeta;
