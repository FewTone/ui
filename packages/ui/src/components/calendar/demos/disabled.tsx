"use client";

// A client module: Dates passed from a server component arrive as instants and can land on another day in
// the visitor's time zone, so the days are made here, in the browser's own
import { Calendar } from "@fewtone/ui/components/calendar/calendar";

const october = new Date(2026, 9, 1);

/**
 * Weekends can't be picked, and only 5 October to 20 November can. The arrow keys skip the disabled days,
 * and the month buttons stop at the limits.
 */
export default function CalendarDisabled() {
  return (
    <Calendar
      defaultMonth={october}
      disabled={{ dayOfWeek: [0, 6] }}
      min={new Date(2026, 9, 5)}
      max={new Date(2026, 10, 20)}
    />
  );
}
