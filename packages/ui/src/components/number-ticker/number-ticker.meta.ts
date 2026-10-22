import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "number-ticker",
  title: "Number Ticker",
  description:
    "An accessible React number ticker for Next.js and Tailwind CSS: digits roll like an odometer and glide as the number changes length, with Intl formatting.",
  kind: "component",
  category: "Effects",
  tags: ["number ticker", "counter", "odometer", "count up", "stats", "animated number"],
  keywords: [
    "react number ticker",
    "animated counter react",
    "count up animation react",
    "nextjs number animation",
    "tailwind number ticker",
    "shadcn number ticker",
    "odometer react",
    "animated stats",
    "rolling number",
    "animated price react",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-21",
  files: ["number-ticker.tsx"],
  usage: {
    code: `import { NumberTicker } from "@/components/ui/number-ticker"

export function Users() {
  return <NumberTicker value={12480} className="text-4xl font-semibold" />
}`,
  },
  demos: [
    {
      name: "flow",
      title: "A changing value",
      description:
        "Step it or shuffle to a number of another length. Every change flows on one soft spring: the digits roll, the characters that stay glide to their new places as the width follows, new ones come in through the blur and the ones that go leave through it. Switch the format and it flows to that too.",
    },
    {
      name: "stats",
      title: "Stats on view",
      description:
        "Each stat rolls up from 0 once it's half in view. Places 0 doesn't have, and the separators and signs beside them, come in as they roll, so the number grows leftwards. Press Replay to roll again.",
    },
  ],
  // The page opens on one big changing value; the index card shows one stat
  preview: { card: "card" },
  // Replay remounts the demos, so the stats roll again
  motion: { animated: true },
  api: [
    {
      name: "NumberTicker",
      description:
        "A span that inherits the text's size and colour, with a line height of 1. It's an image named by its formatted value, so screen readers hear the number, never the roll. Also accepts every native span prop.",
      props: [
        { name: "value", type: "number", required: true, description: "The number to show." },
        { name: "from", type: "number", default: "0", description: "Where the first roll starts." },
        {
          name: "format",
          type: "Intl.NumberFormatOptions",
          description:
            'How to write it, for example { style: "currency", currency: "USD" } or { style: "percent" }.',
        },
        {
          name: "locale",
          type: "string",
          default: '"en-US"',
          description:
            "The locale to format in. Fixed by default so the server and the browser write the same text.",
        },
        { name: "prefix", type: "string", description: "Text before the number, part of what flows." },
        { name: "suffix", type: "string", description: "Text after the number, part of what flows." },
        {
          name: "continuous",
          type: "boolean",
          default: "true",
          description:
            "When a higher place changes, the places below spin a whole turn, so a jump reads as counting. Off, each digit takes the short way.",
        },
        {
          name: "direction",
          type: '"up" | "down"',
          description:
            "Which way the digits turn. Left out, up when the number grows and down when it shrinks; set it to always turn one way, like an odometer.",
        },
        {
          name: "delay",
          type: "number",
          default: "0",
          description: "Seconds to wait before the first roll.",
        },
        {
          name: "startOnView",
          type: "boolean",
          default: "true",
          description: "Roll once it's half in view, once. With false, it rolls as soon as it mounts.",
        },
      ],
    },
  ],
  primitives: ["Web Animations API", "CSS registered properties", "Intl.NumberFormat"],
  related: ["progress", "number-input", "text-effects"],
  ai: {
    whenToUse:
      "Use NumberTicker for numbers that should draw the eye as they arrive: stats on a landing page, a dashboard total, a live count. It renders the final value on the server and rolls when scrolled into view. For a number the user edits, use NumberInput; for how far a task is, use Progress.",
  },
} satisfies ItemMeta;
