import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "stepper",
  title: "Stepper",
  description:
    "An accessible React stepper for Next.js and Tailwind CSS: the steps of a checkout or setup, with a line that fills as you advance and checks that draw in.",
  kind: "component",
  category: "Effects",
  tags: ["stepper", "steps", "wizard", "progress steps", "multi-step form", "checkout"],
  keywords: [
    "react stepper",
    "nextjs stepper",
    "tailwind stepper",
    "shadcn stepper",
    "multi step form react",
    "wizard component react",
    "progress steps",
    "checkout steps",
    "vertical stepper",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["stepper.tsx"],
  usage: {
    code: `import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"

const steps = ["Cart", "Shipping", "Payment"]

export function Checkout() {
  return (
    <Stepper defaultValue={2} aria-label="Checkout">
      {steps.map((title, index) => (
        <StepperItem key={title} step={index + 1}>
          <StepperTrigger>
            <StepperIndicator />
            <StepperTitle>{title}</StepperTitle>
          </StepperTrigger>
          <StepperSeparator />
        </StepperItem>
      ))}
    </Stepper>
  )
}`,
  },
  demos: [
    {
      name: "checkout",
      title: "Checkout",
      description:
        "Next fills the line to the next step, which takes the ring as the fill arrives, while the step you leave swaps its number for a check. Back plays it backwards. Press a step you've reached to jump back: each line empties in turn.",
    },
    {
      name: "vertical",
      title: "Vertical",
      description:
        'orientation="vertical", with a description under each title. Every step can be pressed here.',
    },
  ],
  // The page opens on the checkout and its buttons; the index card shows the steps alone
  preview: { card: "card" },
  api: [
    {
      name: "Stepper",
      description:
        'An ordered list of the steps. Give it a name with aria-label ("Checkout"). Also accepts every native ol prop.',
      props: [
        {
          name: "value",
          type: "number",
          description:
            "The current step, from 1, when you control it. Past the last step, every step is done.",
        },
        { name: "defaultValue", type: "number", default: "1", description: "The current step at first." },
        {
          name: "onValueChange",
          type: "(value: number) => void",
          description: "Called with the step a trigger was pressed for.",
        },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "A row with the lines between the steps, or a column with the lines down the side.",
        },
      ],
    },
    {
      name: "StepperItem",
      description:
        "One step (an li), holding its trigger and its separator. Also accepts every native li prop.",
      props: [
        { name: "step", type: "number", required: true, description: "Its place in the task, from 1." },
        {
          name: "completed",
          type: "boolean",
          description:
            "Done or not, whatever the current step. Left out, the steps before the current one are done.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Its trigger can't be pressed, for example a step that isn't reachable yet.",
        },
      ],
    },
    {
      name: "StepperTrigger",
      description:
        'A button that goes to its step, named by its title; the current one has aria-current="step". It lays the indicator beside the title and the description. Also accepts every native button prop.',
      props: [
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render the single child instead, for example a link to the step's page.",
        },
      ],
    },
    {
      name: "StepperIndicator",
      description:
        "The circle: the step's number, a check that draws in once it's done, and a ring round the current step. Hidden from screen readers. Pass children (an icon) to show them instead of the number and the check.",
      props: [],
    },
    {
      name: "StepperTitle",
      description:
        "The step's name, muted until the progress reaches it. Also accepts every native span prop.",
      props: [],
    },
    {
      name: "StepperDescription",
      description: "A line under the title. Also accepts every native span prop.",
      props: [],
    },
    {
      name: "StepperSeparator",
      description:
        "The line to the next step: it fills once this step is done, and empties the way it came. Hidden in the last step, so it can be written in every item.",
      props: [],
    },
  ],
  primitives: ["Radix Slot"],
  related: ["progress", "tabs", "button"],
  ai: {
    whenToUse:
      "Use Stepper to show where someone is in a task with a fixed order of steps: a checkout, an onboarding flow, a multi-step form. Drive value from your own Back and Next buttons, and disable the steps that aren't reachable yet. For switching between views in any order, use Tabs; for how much of one task is done, use Progress.",
  },
} satisfies ItemMeta;
