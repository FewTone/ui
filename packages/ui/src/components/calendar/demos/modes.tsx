"use client";

import { Calendar, type Weekday } from "@fewtone/ui/components/calendar/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { useId, useState } from "react";

// Fixed days, so the server and the browser draw the same month
const october = new Date(2026, 9, 1);
const picked = new Date(2026, 9, 16);
const stay = { from: new Date(2026, 9, 12), to: new Date(2026, 9, 18) };

/*
 * Both modes side by side, named underneath, with the first day of the week in the top-right corner. Pick a
 * day on the left and the circle travels to it; pick two days on the right and the band grows between them.
 * An empty row at the bottom, as tall as the setting's row, keeps them centred.
 */
export default function CalendarModes() {
  const id = useId();
  const [weekStartsOn, setWeekStartsOn] = useState<Weekday>(0);

  return (
    <div className="flex w-full flex-col gap-6 self-stretch">
      <div className="-mt-6 -mr-6 flex items-center justify-end gap-2">
        <label htmlFor={`${id}-week`} className="text-sm text-muted-foreground">
          Week starts
        </label>
        <Select
          value={String(weekStartsOn)}
          onValueChange={(value) => setWeekStartsOn(Number(value) as Weekday)}
        >
          <SelectTrigger id={`${id}-week`} size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Sunday</SelectItem>
            <SelectItem value="1">Monday</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ul className="flex flex-1 flex-wrap items-center justify-center gap-x-10 gap-y-6">
        <li className="flex flex-col items-center gap-2">
          <Calendar defaultMonth={october} defaultSelected={picked} weekStartsOn={weekStartsOn} />
          <span className="text-xs text-muted-foreground">Single</span>
        </li>
        <li className="flex flex-col items-center gap-2">
          <Calendar mode="range" defaultMonth={october} defaultSelected={stay} weekStartsOn={weekStartsOn} />
          <span className="text-xs text-muted-foreground">Range</span>
        </li>
      </ul>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
    </div>
  );
}
