import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "calendar",
  title: "Calendar",
  description:
    "An accessible React calendar for Next.js and Tailwind CSS: pick a day or a range, with full keyboard support, disabled days and Intl names. No date library.",
  kind: "component",
  category: "Forms",
  tags: ["calendar", "date", "date range", "form", "month view"],
  keywords: [
    "react calendar",
    "nextjs calendar",
    "shadcn calendar",
    "tailwind calendar",
    "react day picker",
    "react date range calendar",
    "accessible calendar",
    "animated calendar",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["calendar.tsx"],
  usage: {
    code: `"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"

export function DueDate() {
  const [date, setDate] = useState<Date | undefined>()

  return <Calendar mode="single" selected={date} onSelect={setDate} />
}`,
  },
  demos: [
    {
      name: "modes",
      title: "Single and range",
      description:
        "Pick another day on the left and its circle travels there. On the right, pick a start and an end: the band grows from the first day to the second, row by row. Turning the page slides the new month in from the side you're going to.",
    },
    {
      name: "two-months",
      title: "Two months",
      description: "numberOfMonths={2} shows two months side by side, for ranges that cross a month's end.",
    },
    {
      name: "disabled",
      title: "Disabled days and limits",
      description:
        "Weekends are disabled with { dayOfWeek: [0, 6] }, and min and max keep the pick between 5 October and 20 November. The arrow keys skip what can't be picked, and the month buttons stop at the limits.",
    },
    {
      name: "locale",
      title: "Other languages",
      description:
        "locale names the months, weekdays and days through Intl, weekStartsOn sets the first column, and labels translates the few words the calendar says itself.",
    },
  ],
  // The page opens on both modes; the index card shows one month with a range, at half size
  preview: { height: "lg", card: "card" },
  api: [
    {
      name: "Calendar",
      description:
        "A month view. Also accepts every div prop. Arrow keys move by day, Up and Down by week, PageUp and PageDown by month (with Shift, by year), Home and End to the week's ends, and Enter or Space picks. Props follow react-day-picker's main ones.",
      props: [
        {
          name: "mode",
          type: '"single" | "range"',
          default: '"single"',
          description: "Pick one day, or a range from a start to an end.",
        },
        {
          name: "selected",
          type: "Date | DateRange",
          description: "The picked day (single) or range ({ from, to }), when you control it.",
        },
        { name: "defaultSelected", type: "Date | DateRange", description: "What's picked at first." },
        {
          name: "onSelect",
          type: "(value: Date | DateRange | undefined, day: Date) => void",
          description:
            "Called with the new day or range, and the day that was clicked. In range mode the first click starts a range, the second ends it (either way round) and a third starts again.",
        },
        { name: "month", type: "Date", description: "The month shown first, when you control it." },
        {
          name: "defaultMonth",
          type: "Date",
          description:
            "The month shown at first. Defaults to the picked day's month, else today's. Pass it to server-render the right month.",
        },
        {
          name: "onMonthChange",
          type: "(month: Date) => void",
          description: "Called with the first day of the month when the page turns.",
        },
        { name: "numberOfMonths", type: "number", default: "1", description: "Months shown side by side." },
        {
          name: "disabled",
          type: "Matcher | Matcher[]",
          description:
            "Days that can't be picked: a Date, an array of Dates, { from, to }, { before }, { after }, { dayOfWeek: [0, 6] } or a function that gets each day.",
        },
        {
          name: "min",
          type: "Date",
          description: "The earliest day that can be picked. The calendar doesn't page before its month.",
        },
        {
          name: "max",
          type: "Date",
          description: "The latest day that can be picked. The calendar doesn't page past its month.",
        },
        {
          name: "weekStartsOn",
          type: "0 | 1 | 2 | 3 | 4 | 5 | 6",
          default: "0",
          description: "The first day of the week: 0 is Sunday, 1 is Monday.",
        },
        {
          name: "locale",
          type: "string",
          default: '"en-US"',
          description: "A language tag, such as fr-FR. Intl writes the month, weekday and day names.",
        },
        {
          name: "showOutsideDays",
          type: "boolean",
          default: "true",
          description: "Shows the days of the months either side, muted. They can be picked.",
        },
        {
          name: "fixedWeeks",
          type: "boolean",
          default: "true",
          description:
            "Always six weeks, so the calendar keeps its height from month to month. Without it, the height glides to fit.",
        },
        {
          name: "today",
          type: "Date",
          description:
            "The day marked as today. Defaults to the browser's today, known once the page has loaded, so server HTML never disagrees with it.",
        },
        {
          name: "required",
          type: "boolean",
          default: "false",
          description: "Single mode: clicking the picked day again keeps it instead of clearing it.",
        },
        {
          name: "labels",
          type: "{ previousMonth?: string; nextMonth?: string; selected?: string }",
          description:
            'The words the calendar says: "Previous month", "Next month" and ", selected" after a picked day.',
        },
      ],
    },
  ],
  primitives: ["Intl.DateTimeFormat"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/",
  related: ["date-picker", "popover", "select"],
  ai: {
    whenToUse:
      "Use Calendar to show a month and pick a day or a range in place, for example a booking page or a filter panel. Use Date Picker for a form field that opens a calendar from a trigger, and Input with type=date when a typed date is enough.",
  },
} satisfies ItemMeta;
