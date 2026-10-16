import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "loading-button",
  title: "Loading Button",
  description:
    "An accessible React loading button for Next.js that shows loading, success and error states for async actions, without changing width.",
  kind: "component",
  category: "Buttons",
  tags: ["button", "loading", "spinner", "async", "submit", "success", "error"],
  keywords: [
    "react loading button",
    "nextjs loading button",
    "button with spinner",
    "async button",
    "submit button loading state",
    "button success state",
    "shadcn loading button",
    "tailwind loading button",
  ],
  status: "stable",
  addedAt: "2026-10-14",
  updatedAt: "2026-10-14",
  files: ["loading-button.tsx"],
  usage: {
    code: `import { LoadingButton } from "@/components/ui/loading-button"

export function SaveButton() {
  return (
    <LoadingButton
      onClick={() => saveChanges()}
      loadingText="Saving…"
      successText="Saved"
      errorText="Try again"
    >
      Save changes
    </LoadingButton>
  )
}`,
  },
  demos: [
    {
      name: "async",
      title: "Async action",
      description:
        "Return a promise from onClick: the button shows loading until it settles, then success or error, then its label again.",
    },
    {
      name: "states",
      title: "Every state",
      description:
        "Set state yourself to control it. The width never changes, because the button is sized to its widest state.",
    },
  ],
  // The page opens on buttons to try; the index card shows a single one, mid-save
  preview: { card: "card" },
  api: [
    {
      name: "LoadingButton",
      description:
        "Also accepts every Button prop except asChild. While loading it stays focusable (aria-busy, aria-disabled) and ignores clicks, and a polite live region announces each change.",
      props: [
        {
          name: "onClick",
          type: "(event) => unknown",
          description:
            "Return a promise to show loading until it settles, then success when it resolves or error when it rejects.",
        },
        {
          name: "state",
          type: '"idle" | "loading" | "success" | "error"',
          description: "Controls the state yourself. Leave it out and onClick's promise drives it.",
        },
        {
          name: "loadingText",
          type: "ReactNode",
          description: "Shown next to the spinner. The label stays if left out.",
        },
        { name: "successText", type: "ReactNode", description: "Shown next to the check." },
        { name: "errorText", type: "ReactNode", description: "Shown next to the cross, on solid red." },
        {
          name: "resetAfter",
          type: "number | false",
          default: "2000",
          description:
            "Milliseconds after success or error until it's idle again, or false to stay. Ignored when controlled.",
        },
        { name: "variant", type: "Button variant", default: '"default"', description: "The button style." },
        { name: "size", type: "Button size", default: '"md"', description: "The button size." },
      ],
    },
  ],
  primitives: ["Button"],
  related: ["button", "theme-toggle"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/button/",
  ai: {
    whenToUse:
      "Use LoadingButton for actions that take time, like saving or submitting, so people see progress and the result. Return a promise from onClick, or set state yourself. Use Button for instant actions.",
  },
} satisfies ItemMeta;
