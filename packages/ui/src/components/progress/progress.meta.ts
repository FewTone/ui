import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "progress",
  title: "Progress",
  description:
    "An accessible React progress bar and ring for Next.js and Tailwind CSS that show how far along a task is, with an indeterminate state.",
  kind: "component",
  category: "Feedback",
  tags: ["progress", "progress bar", "progress ring", "circular progress", "loading", "indeterminate"],
  keywords: [
    "react progress bar",
    "shadcn progress",
    "nextjs progress bar",
    "tailwind progress bar",
    "circular progress react",
    "progress ring",
    "radix progress",
    "upload progress",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-21",
  files: ["progress.tsx"],
  usage: {
    code: `import { Progress } from "@/components/ui/progress"

export function Upload({ percent }: { percent: number }) {
  return <Progress value={percent} aria-label="Upload" />
}`,
  },
  demos: [
    {
      name: "overview",
      title: "Bar and ring",
      description:
        "Press Run to step the value: the bar's fill, the ring's arc and the number rise continuously, each change lasting until the next one comes, so steady updates read as one smooth rise. Without a value both are indeterminate; with reduced motion they pulse instead.",
    },
    {
      name: "with-label",
      title: "With a label",
      description:
        "Name the bar with a visible label (aria-labelledby) and describe it with a hint. ProgressValue shows the percentage beside the label.",
    },
    {
      name: "ring-sizes",
      title: "Ring sizes",
      description: "Small sits beside text like an icon; medium and large have room for the value.",
    },
  ],
  // The page opens on four progress indicators and a Run button; the index card shows a bar and a ring
  preview: { card: "card" },
  api: [
    {
      name: "Progress",
      description:
        'A bar, built on Radix Progress (role="progressbar"). Give it a name with aria-label or aria-labelledby. Also accepts every native div prop.',
      props: [
        {
          name: "value",
          type: "number | null",
          description:
            "How far along, from 0 to max. Leave it out, or pass null, while there's no telling: a segment sweeps across instead.",
        },
        { name: "max", type: "number", default: "100", description: "The value that means done." },
        {
          name: "getValueLabel",
          type: "(value: number, max: number) => string",
          default: '"64%"',
          description: "What screen readers say for the value.",
        },
      ],
    },
    {
      name: "ProgressRing",
      description:
        "The same as a ring: an arc that goes round from the top. It takes the text colour (text-primary unless you set another).",
      props: [
        {
          name: "value",
          type: "number | null",
          description: "How far along, from 0 to max. Without it, an arc turns round the ring.",
        },
        { name: "max", type: "number", default: "100", description: "The value that means done." },
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "20, 40 or 64px. Small fits beside text like an icon.",
        },
        {
          name: "showValue",
          type: "boolean",
          default: "false",
          description: "Shows the percentage in the middle, counting as it changes. Medium and large only.",
        },
      ],
    },
    {
      name: "ProgressValue",
      description:
        "The percentage as text, for beside a bar. It counts to a new value in step with the fill. Hidden from screen readers, since the progressbar already says its value.",
      props: [
        { name: "value", type: "number | null", description: "The same value as the Progress it labels." },
        { name: "max", type: "number", default: "100", description: "The same max." },
      ],
    },
  ],
  primitives: ["Radix Progress"],
  related: ["spinner", "loading-button", "toast"],
  ai: {
    whenToUse:
      "Use Progress (a bar) or ProgressRing to show how far along a task is, such as an upload or a multi-step setup; leave out value while the length is unknown. Use Spinner for a small busy indicator with no amount, and LoadingButton for a button that waits on its own action.",
  },
} satisfies ItemMeta;
