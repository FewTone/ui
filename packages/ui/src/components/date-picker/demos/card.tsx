"use client";

import { DatePicker } from "@fewtone/ui/components/date-picker/date-picker";

// Made in the browser's time zone (a client module), so the day doesn't shift
const due = new Date(2026, 9, 20);

/** The index card's preview: one picker with a date. The page itself opens on both pickers. */
export default function DatePickerCard() {
  return <DatePicker aria-label="Due date" defaultValue={due} className="w-56" />;
}
