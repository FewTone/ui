import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "tabs",
  title: "Tabs",
  description:
    "Accessible React tabs for Next.js, with an underline or pill that slides to the active tab and panels that glide in, built on Radix Tabs.",
  kind: "component",
  category: "Navigation",
  tags: ["tabs", "tab panel", "tab bar", "navigation", "underline tabs"],
  keywords: [
    "react tabs",
    "nextjs tabs",
    "tailwind tabs",
    "shadcn tabs",
    "animated tabs",
    "underline tabs",
    "sliding tabs",
    "react tab component",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["tabs.tsx"],
  usage: {
    code: `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Settings() {
  return (
    <Tabs defaultValue="account">
      <TabsList aria-label="Settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Change your name and email.</TabsContent>
      <TabsContent value="password">Change your password.</TabsContent>
    </Tabs>
  )
}`,
  },
  demos: [
    {
      name: "variants",
      title: "Underline and pill",
      description:
        "Pick a tab and the underline or pill slides to it. The new panel comes in from the side you moved towards while its height glides to fit.",
    },
    {
      name: "icons",
      title: "Icons",
      description: "Icons sit before the label at the icon size. Give icon-only tabs an aria-label.",
    },
    {
      name: "disabled",
      title: "Disabled",
      description: "A disabled tab can't be picked, and the arrow keys skip it.",
    },
  ],
  // The page opens on both looks; the index card shows a single set
  // Top: the panels change height as you switch, and a centred demo would move the tabs with them
  preview: { card: "card", align: "top" },
  api: [
    {
      name: "Tabs",
      description:
        "The root, built on Radix Tabs. Also accepts every Radix Tabs Root prop. Arrow keys move between tabs and show their panel; Home and End jump to the ends.",
      props: [
        { name: "value", type: "string", description: "The tab shown, when you control it." },
        { name: "defaultValue", type: "string", description: "The tab shown at first." },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description: "Called with the new tab when the user picks one.",
        },
        {
          name: "activationMode",
          type: '"automatic" | "manual"',
          default: '"automatic"',
          description:
            "Automatic shows a tab's panel as soon as the arrow keys reach it; manual waits for Enter or Space.",
        },
        {
          name: "dir",
          type: '"ltr" | "rtl"',
          description:
            "The reading direction. The arrow keys follow it, and a panel still slides in from the side of its tab.",
        },
      ],
    },
    {
      name: "TabsList",
      description:
        "The row of tabs, a tablist. Give it a name with aria-label when the page has more than one set.",
      props: [
        {
          name: "variant",
          type: '"underline" | "pill"',
          default: '"underline"',
          description:
            "Underline: a line slides along a hairline under the tabs. Pill: a filled pill slides on a muted track, like Switcher.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "true",
          description: "The arrow keys wrap from the last tab to the first.",
        },
      ],
    },
    {
      name: "TabsTrigger",
      description: "One tab.",
      props: [
        { name: "value", type: "string", required: true, description: "The panel this tab shows." },
        { name: "disabled", type: "boolean", default: "false", description: "Skips the tab." },
      ],
    },
    {
      name: "TabsContent",
      description:
        "One tab's panel, a tabpanel named by its tab. It comes in through a blur and slides 12px from the side you moved towards, while its height glides from the last panel's.",
      props: [
        { name: "value", type: "string", required: true, description: "The tab that shows this panel." },
        {
          name: "forceMount",
          type: "true",
          description:
            "Keeps the panel's content mounted while it's hidden, so it keeps its state (a half-filled form) and stays in the HTML.",
        },
      ],
    },
  ],
  primitives: ["Radix Tabs"],
  related: ["switcher", "accordion", "toggle-group"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/",
  ai: {
    whenToUse:
      "Use Tabs to switch between panels of related content in one place, like settings sections or Preview and Code. Use Switcher when the options change one view rather than each showing its own panel, Accordion when people should scan several sections in order, and links to move between pages.",
  },
} satisfies ItemMeta;
