import type { ItemMeta } from "../../registry/schema.ts";

const shared = [
  {
    name: "placeholder",
    type: "string",
    description: "Shown in the trigger while nothing is picked.",
  },
  {
    name: "presets",
    type: "{ label: string; value: T | (() => T) }[]",
    description:
      "A short list beside the calendar. A function value is worked out when it's picked, so presets like Today never read the clock while rendering.",
  },
  {
    name: "locale",
    type: "string",
    default: '"en-US"',
    description: "A language tag for the trigger's date and the calendar's names.",
  },
  {
    name: "formatOptions",
    type: "Intl.DateTimeFormatOptions",
    default: '{ dateStyle: "medium" }',
    description: "How the trigger writes the date, as Intl.DateTimeFormat options.",
  },
  { name: "min", type: "Date", description: "The earliest day that can be picked." },
  { name: "max", type: "Date", description: "The latest day that can be picked." },
  {
    name: "disabledDates",
    type: "Matcher | Matcher[]",
    description: "Days that can't be picked: Calendar's disabled prop.",
  },
  { name: "weekStartsOn", type: "0 | 1 | 2 | 3 | 4 | 5 | 6", default: "0", description: "0 is Sunday." },
  {
    name: "open",
    type: "boolean",
    description: "Whether the calendar is open, when you control it.",
  },
  {
    name: "onOpenChange",
    type: "(open: boolean) => void",
    description: "Called when it opens or closes.",
  },
  {
    name: "align",
    type: '"start" | "center" | "end"',
    default: '"start"',
    description: "How the popover lines up with the trigger.",
  },
  { name: "size", type: '"sm" | "md"', default: '"md"', description: "The trigger's height, as Select's." },
  {
    name: "today",
    type: "Date",
    description: "The day marked as today. Defaults to the browser's today.",
  },
  {
    name: "labels",
    type: "{ dialog?, presets?, previousMonth?, nextMonth?, selected? }",
    description:
      "The words it says, for other languages: the popup's name, the presets' name and Calendar's labels.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Prevents opening.",
  },
];

export default {
  name: "date-picker",
  title: "Date Picker",
  description:
    "An accessible React date picker for Next.js and Tailwind CSS: a calendar in a popover for a date or a date range, with presets and Intl formatting.",
  kind: "component",
  category: "Forms",
  tags: ["date picker", "date range picker", "calendar", "popover", "form"],
  keywords: [
    "react date picker",
    "nextjs date picker",
    "shadcn date picker",
    "react date range picker",
    "tailwind datepicker",
    "date picker with presets",
    "accessible date picker",
    "animated date picker",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["date-picker.tsx"],
  usage: {
    code: `"use client"

import { useState } from "react"
import { DatePicker } from "@/components/ui/date-picker"

export function DueDate() {
  const [date, setDate] = useState<Date | undefined>()

  return (
    <div className="grid gap-2">
      <label htmlFor="due" className="text-sm font-medium">
        Due date
      </label>
      <DatePicker id="due" value={date} onChange={setDate} />
    </div>
  )
}`,
  },
  demos: [
    {
      name: "pickers",
      title: "Date and date range",
      description:
        "Open either and the focus lands on the picked day, ready for the arrow keys. Picking a day closes the date picker once the circle has landed, and the trigger's text swaps to the new date. The range picker shows two months and stays open while you pick.",
    },
    {
      name: "presets",
      title: "Presets",
      description:
        "A small list beside the calendar for the dates people pick most. Each works its date out from today when it's picked, and the calendar turns to it.",
    },
  ],
  // The page opens on both pickers; the index card shows one
  preview: { height: "lg", card: "card" },
  api: [
    {
      name: "DatePicker",
      description:
        "A field for one day: a trigger drawn like Select's that opens a Calendar in a Popover, and closes once a day is picked. The trigger is a combobox with a dialog, so give it a visible label (<label htmlFor>) or an aria-label. Also accepts every button prop, for the trigger.",
      props: [
        { name: "value", type: "Date", description: "The picked day, when you control it." },
        { name: "defaultValue", type: "Date", description: "The day picked at first." },
        {
          name: "onChange",
          type: "(date: Date | undefined) => void",
          description: "Called with the new day.",
        },
        {
          name: "name",
          type: "string",
          description: "Submits the day with a form, as YYYY-MM-DD.",
        },
        { name: "numberOfMonths", type: "number", default: "1", description: "Months shown side by side." },
        ...shared.map((prop) => (prop.name === "placeholder" ? { ...prop, default: '"Pick a date"' } : prop)),
      ],
    },
    {
      name: "DateRangePicker",
      description:
        "A field for a range: the same trigger, opening a Calendar in range mode that stays open while you pick. The trigger writes the range the short way (Oct 12 – 18, 2026). Also accepts every button prop, for the trigger.",
      props: [
        {
          name: "value",
          type: "DateRange",
          description: "The picked range ({ from, to }), when you control it.",
        },
        { name: "defaultValue", type: "DateRange", description: "The range picked at first." },
        {
          name: "onChange",
          type: "(range: DateRange | undefined) => void",
          description: "Called with the new range: first with only its start, then with both ends.",
        },
        { name: "numberOfMonths", type: "number", default: "2", description: "Months shown side by side." },
        ...shared.map((prop) =>
          prop.name === "placeholder" ? { ...prop, default: '"Pick a date range"' } : prop,
        ),
      ],
    },
  ],
  primitives: ["Radix Popover", "Intl.DateTimeFormat"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-datepicker/",
  related: ["calendar", "popover", "select"],
  ai: {
    whenToUse:
      "Use DatePicker for a date field in a form, and DateRangePicker for a start and an end (stays, reports, campaigns). Use Calendar to show a month on the page itself, and Input with type=date when a typed date is enough.",
  },
} satisfies ItemMeta;
