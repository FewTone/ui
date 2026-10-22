# Date Picker: decisions

**Status:** built 2026-10-16 from the roadmap ("A calendar in a popover, for dates and ranges"), published as stable for the owner's review with the other roadmap components.

- **What it is:** two form fields, `DatePicker` (one day) and `DateRangePicker` (a start and an end). Each is a trigger that opens our Calendar inside our Popover (composition, components.md). shadcn has no Date Picker component, only a recipe (a Button, a Popover and a Calendar); this packages the recipe with the details done.
- **API:** `value` / `defaultValue` / `onChange` (a `Date`, or a `DateRange` `{ from, to }`), `placeholder` ("Pick a date" / "Pick a date range"), `presets`, `locale`, `formatOptions` (Intl, default `{ dateStyle: "medium" }`), `min`, `max`, `disabledDates` (Calendar's `disabled`: `disabled` is the trigger's own, as on every form control), `weekStartsOn`, `numberOfMonths` (1, and 2 for ranges), `open` / `defaultOpen` / `onOpenChange`, `align` ("start"), `size` (Select's `sm` / `md`), `today`, `labels`. DatePicker's `name` submits the day as `YYYY-MM-DD` through a hidden input. Every other prop goes to the trigger button (`id`, `aria-label`, `aria-invalid`, `disabled`, `className`).
- **The trigger** is drawn like Select's (the same border, radius, height, padding, `shadow-xs`, focus ring and invalid state), with a calendar icon at the start instead of a chevron at the end: one icon, the one that says what opens. The placeholder is muted.
  - **Semantics:** a `combobox` that pops up a `dialog` (the WAI-ARIA date picker combobox): Radix adds `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`. As a combobox, a `<label htmlFor>` names it and screen readers read the date as its value; as a plain button, the label would replace the date. The value is a hidden copy of the text, while the drawn text (which swaps) is `aria-hidden`, so a swap never reads two values. It needs a label or an `aria-label`, as Select does.
- **The popup:** Popover's surface (bordered, `bg-popover`, `shadow-md`, opening from the trigger through the blur), `p-0` and as wide as what's in it, named "Choose date" / "Choose dates". Where two months or the presets don't fit the screen, it's capped at Radix's available width and the calendar wraps underneath.
  - **Focus:** opening moves it to the picked day (or today, or the first day that can be picked), not to the first button, as in the WAI-ARIA date picker, so the arrow keys work at once. Escape, a click outside or the trigger closes it, and Radix gives the focus back to the trigger.
  - **Each opening starts on the picked month** (the range's start), or today's.
- **Picking:**
  - **DatePicker closes a beat after a pick** (`duration.base`, instant with reduced motion), once Calendar's circle has landed on the new day, and the trigger's text swaps to the new date. Picking the same day again keeps it and closes (`required` on the Calendar), rather than clearing a form field.
  - **DateRangePicker stays open:** you see the band grow, and can pick again (the third click starts a new range). `onChange` fires with the start alone, then with both ends; the trigger shows "Oct 26, 2026 – …" in between. shadcn's range recipe also stays open.
- **Formatting is Intl's:** `dateStyle: "medium"` ("Oct 16, 2026") by default, and `formatRange` for ranges, which writes them the short way ("Oct 12 – 18, 2026", "Oct 26 – Nov 4, 2026") in every locale. The default locale is `en-US` rather than the runtime's, so the server's text and the browser's agree.
- **Presets** (`{ label, value }`, `value` a date or range, or a function returning one) are a small list beside the calendar:
  - **Functions are worked out when picked,** so "Today" or "Next 7 days" never read the clock while rendering, and server HTML can't disagree with the browser.
  - A preset turns the calendar to its month when it isn't shown (the page slides in), and otherwise the circle travels or the band grows to it. DatePicker then closes, as after a click.
  - **Rows:** Select's row spacing (`rounded-md py-1.5 text-sm`, `px-2`: there's no check mark to leave room for) and one `accent` highlight gliding between rows (`layoutId` on `spring.snappy`, scoped with `LayoutGroup id={useId()}`, the list `isolate`). It follows the mouse (mouse only) and the keyboard focus; the focus also shows the outline ring, as on every button. A `<ul>` named "Presets".
  - **Not marked as chosen** when the value matches one: presets are actions ("set it to…"), and a mark would need a second visual state.
- **Motion:** nothing new of its own. The popover opens and closes through the blur (Popover, CSS keyframes); the trigger's text swaps through `swap` (`initial={false}`, opacity only with reduced motion), each text keeping its own colour as it leaves; the calendar slides, travels and grows (Calendar). The popover's height glides if its content changes size (Popover), and the calendar's own height glide steps aside inside it.
- **Demos:**
  - **Hero (Date and date range):** a DatePicker and a DateRangePicker with fixed dates, named underneath ("Date Picker", "Date Range Picker"). Preview height `lg`, so the open popup mostly fits.
  - **Card demo:** one DatePicker.
  - **Presets example:** labelled fields, a DatePicker (Today, Tomorrow, In a week, In a month) and a DateRangePicker (Next 7, 14 and 30 days). They start empty, so the calendar opens on the visitor's month; that's only rendered in the browser (the popup isn't server-rendered), so nothing mismatches.
  - All demos are client modules, so their dates are made in the visitor's time zone (Calendar's decisions explain why).
- **Tests:** the trigger's role, name, value, `aria-haspopup` and `aria-expanded`; opening on the picked day with the focus on it; a click picks, closes and returns the focus, with the new date in the trigger and the hidden input; the placeholder, opening from the keyboard on today and picking with the arrow keys and Enter; Escape closing without a change; a preset in another month turning the calendar and closing; a range over two months staying open, with the partial and the full range in the trigger; a range preset; axe closed and open (with presets).
- **Not built yet:**
  - typing a date into the field (the APG's editable combobox), and a clear button
  - a `name` for DateRangePicker's form submission (two fields, or one value)
  - marking the preset that matches the value
  - presets as a Select on narrow screens; a mobile sheet instead of a popover
  - time of day
