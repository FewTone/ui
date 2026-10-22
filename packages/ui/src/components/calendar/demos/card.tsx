"use client";

// A client module: Dates passed from a server component arrive as instants and can land on another day in
// the visitor's time zone, so the days are made here, in the browser's own
import { Calendar } from "@fewtone/ui/components/calendar/calendar";

const october = new Date(2026, 9, 1);
const stay = { from: new Date(2026, 9, 12), to: new Date(2026, 9, 21) };

/**
 * The index card's preview: one month with a range picked, at half size so the whole month fits the tile.
 * The page itself opens on both modes.
 */
export default function CalendarCard() {
  return (
    <div className="scale-50">
      <Calendar mode="range" defaultMonth={october} defaultSelected={stay} />
    </div>
  );
}
