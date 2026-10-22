"use client";

import { Combobox, type ComboboxOption } from "@fewtone/ui/components/combobox/combobox";
import { useId } from "react";

/** City, region, country, and the abbreviations and other names people search for */
const zones: [string, string, string, string, string[]][] = [
  ["America/Los_Angeles", "Los Angeles", "Americas", "United States", ["PST", "Pacific", "San Francisco"]],
  ["America/Denver", "Denver", "Americas", "United States", ["MST", "Mountain"]],
  ["America/Chicago", "Chicago", "Americas", "United States", ["CST", "Central"]],
  ["America/New_York", "New York", "Americas", "United States", ["EST", "Eastern"]],
  ["America/Toronto", "Toronto", "Americas", "Canada", ["EST", "Eastern"]],
  ["America/Sao_Paulo", "São Paulo", "Americas", "Brazil", ["BRT", "Sao Paulo"]],
  ["Europe/London", "London", "Europe and Africa", "United Kingdom", ["GMT", "BST", "UK"]],
  ["Europe/Paris", "Paris", "Europe and Africa", "France", ["CET"]],
  ["Europe/Berlin", "Berlin", "Europe and Africa", "Germany", ["CET"]],
  ["Africa/Lagos", "Lagos", "Europe and Africa", "Nigeria", ["WAT"]],
  ["Africa/Nairobi", "Nairobi", "Europe and Africa", "Kenya", ["EAT"]],
  ["Asia/Dubai", "Dubai", "Asia and Pacific", "United Arab Emirates", ["GST", "UAE"]],
  ["Asia/Kolkata", "Kolkata", "Asia and Pacific", "India", ["IST", "Mumbai", "Delhi", "Bengaluru"]],
  ["Asia/Singapore", "Singapore", "Asia and Pacific", "Singapore", ["SGT"]],
  ["Asia/Tokyo", "Tokyo", "Asia and Pacific", "Japan", ["JST"]],
  ["Australia/Sydney", "Sydney", "Asia and Pacific", "Australia", ["AEST", "AEDT"]],
  ["Pacific/Auckland", "Auckland", "Asia and Pacific", "New Zealand", ["NZST", "NZDT"]],
];

const options: ComboboxOption[] = zones.map(([value, label, group, country, keywords]) => ({
  value,
  label,
  group,
  keywords: [country, ...keywords],
}));

const countries = new Map(zones.map(([value, , , country]) => [value, country]));

/*
 * Options grouped under headings, with keywords for the abbreviations people type (IST, Pacific). Each row
 * also shows the country; the field still shows the city. The list scrolls, with soft fades at the ends.
 * A client file, because renderOption is a function.
 */
export default function ComboboxGroups() {
  const id = useId();
  return (
    <div className="grid w-64 max-w-full gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Time zone
      </label>
      <Combobox
        id={id}
        options={options}
        defaultValue="Asia/Kolkata"
        placeholder="Pick a time zone"
        emptyText="No time zone found."
        renderOption={(option) => (
          <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
            <span className="truncate">{option.label}</span>
            <span className="truncate text-xs text-muted-foreground">{countries.get(option.value)}</span>
          </span>
        )}
      />
    </div>
  );
}
