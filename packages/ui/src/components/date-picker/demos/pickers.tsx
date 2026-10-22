"use client";

import { DatePicker, DateRangePicker } from "@fewtone/ui/components/date-picker/date-picker";

// Fixed days, made in the browser's time zone (a client module), so the server and the browser agree
const due = new Date(2026, 9, 20);
const stay = { from: new Date(2026, 9, 12), to: new Date(2026, 9, 18) };

/*
 * A date and a date range side by side, named underneath. Picking a day closes the first once the circle
 * lands; the second stays open while the band grows between the two days.
 */
export default function DatePickers() {
  return (
    <ul className="flex flex-wrap items-start justify-center gap-x-10 gap-y-6">
      <li className="flex flex-col items-center gap-2">
        <DatePicker aria-label="Due date" defaultValue={due} className="w-56" />
        <span className="text-xs text-muted-foreground">Date Picker</span>
      </li>
      <li className="flex flex-col items-center gap-2">
        <DateRangePicker aria-label="Stay" defaultValue={stay} className="w-64" />
        <span className="text-xs text-muted-foreground">Date Range Picker</span>
      </li>
    </ul>
  );
}
