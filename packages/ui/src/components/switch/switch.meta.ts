import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "switch",
  title: "Switch",
  description:
    "An accessible React switch for on/off settings, with a spring-animated thumb, built on Radix Switch.",
  kind: "component",
  category: "Forms",
  tags: ["switch", "toggle", "on off", "setting"],
  keywords: [
    "react switch",
    "react toggle switch",
    "nextjs switch",
    "tailwind switch",
    "shadcn switch",
    "animated switch",
  ],
  status: "new",
  addedAt: "2026-10-13",
  updatedAt: "2026-10-14",
  files: ["switch.tsx"],
  usage: {
    code: `import { Switch } from "@/components/ui/switch"

export function Notifications() {
  return (
    <>
      <Switch id="notifications" />
      <label htmlFor="notifications">Notifications</label>
    </>
  )
}`,
  },
  demos: [
    {
      name: "default",
      title: "Default",
      description:
        "Hover and the thumb leans towards the other side; switch it and it stretches on the way, then settles round.",
      zoom: 2,
    },
    {
      name: "settings",
      title: "Settings list",
      description: "Each switch has a label and a hint linked with aria-describedby, grouped in a fieldset.",
    },
    { name: "sizes", title: "Sizes", zoom: 1.5 },
    { name: "disabled", title: "Disabled" },
  ],
  api: [
    {
      name: "Switch",
      description:
        "Also accepts every Radix Switch prop. The thumb glides on a spring and stretches while pressed.",
      props: [
        { name: "checked", type: "boolean", description: "The on state, when you control it." },
        { name: "defaultChecked", type: "boolean", default: "false", description: "The initial state." },
        {
          name: "onCheckedChange",
          type: "(checked: boolean) => void",
          description: "Called when the user turns it on or off.",
        },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "Track and thumb size." },
        { name: "disabled", type: "boolean", default: "false", description: "Prevents interaction." },
        {
          name: "name",
          type: "string",
          description: "Submits the value with a form, through a hidden checkbox.",
        },
      ],
    },
  ],
  primitives: ["Radix Switch"],
  related: ["input", "select"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/switch/",
  ai: {
    whenToUse:
      "Use Switch for settings that take effect immediately (notifications on/off). Use a checkbox for choices submitted with a form.",
  },
} satisfies ItemMeta;
