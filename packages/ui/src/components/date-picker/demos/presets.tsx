"use client";

import type { DateRange } from "@fewtone/ui/components/calendar/calendar";
import { DatePicker, type DatePreset, DateRangePicker } from "@fewtone/ui/components/date-picker/date-picker";
import { useId } from "react";

/** A day counted from today. Presets call it when they're picked, so nothing reads the clock while rendering. */
const fromToday = (days: number) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
};

const days: DatePreset<Date>[] = [
  { label: "Today", value: () => fromToday(0) },
  { label: "Tomorrow", value: () => fromToday(1) },
  { label: "In a week", value: () => fromToday(7) },
  { label: "In a month", value: () => fromToday(30) },
];

const ranges: DatePreset<DateRange>[] = [
  { label: "Next 7 days", value: () => ({ from: fromToday(0), to: fromToday(6) }) },
  { label: "Next 14 days", value: () => ({ from: fromToday(0), to: fromToday(13) }) },
  { label: "Next 30 days", value: () => ({ from: fromToday(0), to: fromToday(29) }) },
];

/*
 * Presets beside the calendar, for the dates people pick most. Each works its date out from today when it's
 * picked; the calendar turns to it, the circle travels or the band grows, and the first picker closes.
 */
export default function DatePickerPresets() {
  const id = useId();
  return (
    <div className="grid w-full max-w-xs gap-4">
      <div className="grid gap-2">
        <label htmlFor={`${id}-follow-up`} className="text-sm font-medium">
          Follow up
        </label>
        <DatePicker id={`${id}-follow-up`} presets={days} />
      </div>
      <div className="grid gap-2">
        <label htmlFor={`${id}-campaign`} className="text-sm font-medium">
          Campaign
        </label>
        <DateRangePicker id={`${id}-campaign`} presets={ranges} />
      </div>
    </div>
  );
}
