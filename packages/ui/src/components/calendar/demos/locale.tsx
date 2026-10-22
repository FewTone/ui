"use client";

// A client module: Dates passed from a server component arrive as instants and can land on another day in
// the visitor's time zone, so the days are made here, in the browser's own
import { Calendar } from "@fewtone/ui/components/calendar/calendar";

const october = new Date(2026, 9, 1);

/**
 * In French, with weeks starting on Monday. Intl names the months, weekdays and days, so any locale works;
 * the few words the calendar says itself come from `labels`.
 */
export default function CalendarLocale() {
  return (
    <Calendar
      locale="fr-FR"
      weekStartsOn={1}
      defaultMonth={october}
      defaultSelected={new Date(2026, 9, 16)}
      labels={{ previousMonth: "Mois précédent", nextMonth: "Mois suivant", selected: "sélectionné" }}
    />
  );
}
