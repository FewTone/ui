import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "theme-toggle",
  title: "Theme Toggle",
  description:
    "An accessible React dark mode toggle for Next.js that reveals the new theme from the button with a View Transition: a circle, ink, a wave or a page turn.",
  kind: "component",
  category: "Buttons",
  tags: ["theme", "dark mode", "light mode", "toggle", "view transition"],
  keywords: [
    "react theme toggle",
    "nextjs dark mode toggle",
    "dark mode toggle",
    "theme switcher",
    "animated theme toggle",
    "view transitions theme",
    "tailwind dark mode",
    "shadcn mode toggle",
  ],
  status: "stable",
  addedAt: "2026-10-14",
  updatedAt: "2026-10-14",
  files: ["theme-toggle.tsx"],
  usage: {
    code: `import { ThemeToggle } from "@/components/ui/theme-toggle"

// Inside next-themes' ThemeProvider (shadcn's dark mode setup)
export function SiteHeader() {
  return (
    <header>
      <ThemeToggle reveal="ink" speed="medium" />
    </header>
  )
}`,
  },
  demos: [
    {
      name: "reveals",
      title: "All reveals",
      description:
        "Press any toggle to switch the theme with that reveal, starting from where you pressed. The speed applies to all of them.",
    },
    {
      name: "switch",
      title: "With a switch",
      description:
        "revealTheme works with any control. Here a Switch turns dark mode on and off, and the new theme grows out of it.",
    },
  ],
  // The page opens on every reveal; the index card shows a single toggle instead (owner, 2026-10-14)
  preview: { height: "lg", card: "card" },
  api: [
    {
      name: "ThemeToggle",
      description:
        "Switches between light and dark with next-themes, so wrap your app in its ThemeProvider. Its icon morphs between a sun and a moon: the rays spin away, a shadow carves a crescent and two stars twinkle in. Also accepts every Button prop. Without View Transitions support, or with reduced motion turned on, the switch is instant.",
      props: [
        {
          name: "reveal",
          type: 'ThemeReveal | ThemeReveal[] | "random" | "none"',
          default: '"circle"',
          description:
            'How the new theme appears: "circle", "shrink", "ink", "tide", "page-turn", "fade", "wipe-right", "wipe-down", "feather", "curtain" or "diagonal". "random" picks a different one each time; a list picks from that list.',
        },
        {
          name: "speed",
          type: '"quick" | "medium" | "slow" | number',
          default: '"medium"',
          description: "How long the reveal takes: 450ms, 700ms, 1000ms, or a number of milliseconds.",
        },
        { name: "variant", type: "Button variant", default: '"outline"', description: "The button style." },
        { name: "size", type: "Button size", default: '"icon"', description: "The button size." },
      ],
    },
    {
      name: "revealTheme",
      description:
        "The switch on its own, for a menu item or a keyboard shortcut. Returns the view transition, or undefined when the switch was instant.",
      props: [
        { name: "theme", type: "string", description: 'The theme to switch to, for example "dark".' },
        { name: "setTheme", type: "(theme: string) => void", description: "setTheme from next-themes." },
        {
          name: "origin",
          type: "{ x: number; y: number }",
          description: "Where the reveal starts, in viewport pixels. Defaults to the centre of the screen.",
        },
        {
          name: "reveal",
          type: 'ThemeReveal | ThemeReveal[] | "random" | "none"',
          default: '"circle"',
          description: "As on ThemeToggle.",
        },
        {
          name: "speed",
          type: '"quick" | "medium" | "slow" | number',
          default: '"medium"',
          description: "As on ThemeToggle.",
        },
      ],
    },
  ],
  primitives: ["next-themes", "View Transitions API"],
  related: ["button", "switch"],
  ai: {
    whenToUse:
      "Use ThemeToggle for a one-click light/dark switch in a header. It needs next-themes' ThemeProvider. Use revealTheme to switch from a menu or a shortcut with the same reveal.",
  },
} satisfies ItemMeta;
