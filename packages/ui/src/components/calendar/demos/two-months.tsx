"use client";

// A client module: Dates passed from a server component arrive as instants and can land on another day in
// the visitor's time zone, so the days are made here, in the browser's own
import { Calendar } from "@fewtone/ui/components/calendar/calendar";

const october = new Date(2026, 9, 1);
const trip = { from: new Date(2026, 9, 26), to: new Date(2026, 10, 6) };

/** Two months side by side, for a range that crosses the end of a month. The arrows turn both pages. */
export default function CalendarTwoMonths() {
  return <Calendar mode="range" numberOfMonths={2} defaultMonth={october} defaultSelected={trip} />;
}
