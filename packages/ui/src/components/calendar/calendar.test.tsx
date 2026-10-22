import { Calendar } from "@fewtone/ui/components/calendar/calendar";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

// Fixed days, so nothing depends on the machine's clock. 1 October 2026 is a Thursday.
const october = new Date(2026, 9, 1);
const today = new Date(2026, 9, 16);
const day = (name: string) => screen.getByRole("button", { name });
const pickedCells = () =>
  screen.getAllByRole("gridcell").filter((cell) => cell.getAttribute("aria-selected") === "true");

/**
 * jsdom has no layout: give the days the offsets a browser would (32px cells, rows 36px apart), so the
 * travelling circle and the growing band have somewhere to go
 */
function stubLayout() {
  const isDay = (node: HTMLElement) => node.dataset.slot === "calendar-day";
  const isCell = (node: HTMLElement) => node.getAttribute("role") === "gridcell";
  const indexIn = (node: Element | null) =>
    Array.from(node?.parentElement?.children ?? []).indexOf(node as Element);
  vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(function (this: HTMLElement) {
    if (isDay(this)) return this.closest("[role=gridcell]");
    if (isCell(this)) return this.closest("[data-slot=calendar]");
    return null;
  });
  vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
    return isCell(this) ? indexIn(this) * 32 : 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
    return isCell(this) ? indexIn(this.parentElement) * 36 : 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
    return isDay(this) ? 32 : 0;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Calendar", () => {
  it("is a grid named by its month, with a button for each day named by its full date", () => {
    render(<Calendar defaultMonth={october} today={today} />);
    const grid = screen.getByRole("grid", { name: "October 2026" });
    // Six weeks, Sunday first: 27 September to 7 November
    expect(within(grid).getAllByRole("row")).toHaveLength(6);
    expect(within(grid).getAllByRole("gridcell")).toHaveLength(42);
    expect(within(grid).getAllByRole("button")[0]?.getAttribute("aria-label")).toBe(
      "Sunday, September 27, 2026",
    );
    const friday = day("Friday, October 16, 2026");
    expect(friday.textContent).toBe("16");
    expect(friday.getAttribute("aria-current")).toBe("date");
    // Nothing is picked, so today is the day in the tab order
    expect(friday.getAttribute("tabindex")).toBe("0");
    expect(
      within(grid)
        .getAllByRole("button")
        .filter((button) => button.tabIndex === 0),
    ).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Previous month" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next month" })).toBeTruthy();
  });

  it("picks a day with a click, and a second click lets it go", async () => {
    const onSelect = vi.fn();
    render(<Calendar defaultMonth={october} today={today} onSelect={onSelect} />);
    await userEvent.click(day("Tuesday, October 20, 2026"));
    expect(onSelect).toHaveBeenLastCalledWith(new Date(2026, 9, 20), new Date(2026, 9, 20));
    const picked = day("Tuesday, October 20, 2026, selected");
    expect(picked.closest("[role=gridcell]")?.getAttribute("aria-selected")).toBe("true");
    expect(pickedCells()).toHaveLength(1);
    await userEvent.click(picked);
    expect(onSelect).toHaveBeenLastCalledWith(undefined, new Date(2026, 9, 20));
    expect(
      screen.queryAllByRole("gridcell").filter((cell) => cell.hasAttribute("aria-selected")),
    ).toHaveLength(0);
  });

  it("keeps the picked day on a second click when required", async () => {
    const onSelect = vi.fn();
    render(
      <Calendar defaultMonth={october} today={today} defaultSelected={today} required onSelect={onSelect} />,
    );
    await userEvent.click(day("Friday, October 16, 2026, selected"));
    expect(onSelect).toHaveBeenLastCalledWith(today, today);
    expect(day("Friday, October 16, 2026, selected")).toBeTruthy();
  });

  it("moves by day, week, month and year from the keyboard, turning the page at the month's edge", async () => {
    const onMonthChange = vi.fn();
    render(
      <Calendar
        defaultMonth={october}
        today={today}
        defaultSelected={new Date(2026, 9, 31)}
        onMonthChange={onMonthChange}
      />,
    );
    // Tab: the month buttons, then the one day in the tab order, the picked one
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Previous month" }));
    await userEvent.tab();
    await userEvent.tab();
    expect(document.activeElement).toBe(day("Saturday, October 31, 2026, selected"));

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("grid", { name: "November 2026" })).toBeTruthy();
    expect(document.activeElement).toBe(day("Sunday, November 1, 2026"));
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 10, 1));

    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("grid", { name: "October 2026" })).toBeTruthy();
    expect(document.activeElement).toBe(day("Sunday, October 25, 2026"));

    await userEvent.keyboard("{ArrowDown}{ArrowLeft}");
    expect(document.activeElement).toBe(day("Saturday, October 31, 2026, selected"));

    await userEvent.keyboard("{PageDown}");
    expect(document.activeElement).toBe(day("Monday, November 30, 2026"));

    await userEvent.keyboard("{Shift>}{PageUp}{/Shift}");
    expect(screen.getByRole("grid", { name: "November 2025" })).toBeTruthy();
    expect(document.activeElement).toBe(day("Sunday, November 30, 2025"));

    await userEvent.keyboard("{ArrowUp}{Home}");
    expect(document.activeElement).toBe(day("Sunday, November 23, 2025"));
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(day("Saturday, November 29, 2025"));

    // Enter picks the focused day
    await userEvent.keyboard("{Enter}");
    expect(day("Saturday, November 29, 2025, selected")).toBeTruthy();
  });

  it("turns the page with the arrow buttons, and starts weeks on the day you choose", async () => {
    render(<Calendar defaultMonth={october} today={today} weekStartsOn={1} />);
    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    const grid = screen.getByRole("grid", { name: "November 2026" });
    // Monday first: 26 October to 6 December
    expect(within(grid).getAllByRole("button")[0]?.getAttribute("aria-label")).toBe(
      "Monday, October 26, 2026",
    );
    await userEvent.click(screen.getByRole("button", { name: "Previous month" }));
    await userEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByRole("grid", { name: "September 2026" })).toBeTruthy();
  });

  it("picks a range: the first click starts it, the second ends it, either way round", async () => {
    const onSelect = vi.fn();
    render(<Calendar mode="range" defaultMonth={october} today={today} onSelect={onSelect} />);
    await userEvent.click(day("Monday, October 12, 2026"));
    expect(onSelect).toHaveBeenLastCalledWith(
      { from: new Date(2026, 9, 12), to: undefined },
      expect.any(Date),
    );
    await userEvent.click(day("Sunday, October 18, 2026"));
    expect(onSelect).toHaveBeenLastCalledWith(
      { from: new Date(2026, 9, 12), to: new Date(2026, 9, 18) },
      new Date(2026, 9, 18),
    );
    expect(pickedCells()).toHaveLength(7);
    expect(screen.getByRole("grid", { name: "October 2026" }).getAttribute("aria-multiselectable")).toBe(
      "true",
    );

    // A third click starts again; an end before the start becomes the start
    await userEvent.click(day("Thursday, October 8, 2026"));
    expect(pickedCells()).toHaveLength(1);
    await userEvent.click(day("Monday, October 5, 2026"));
    expect(onSelect).toHaveBeenLastCalledWith(
      { from: new Date(2026, 9, 5), to: new Date(2026, 9, 8) },
      new Date(2026, 9, 5),
    );
    expect(pickedCells()).toHaveLength(4);
  });

  it("doesn't pick disabled days or days past the limits, and the keyboard skips them", async () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        defaultMonth={october}
        today={today}
        disabled={{ dayOfWeek: [0, 6] }}
        min={new Date(2026, 9, 5)}
        max={new Date(2026, 10, 20)}
        onSelect={onSelect}
      />,
    );
    const saturday = day("Saturday, October 10, 2026") as HTMLButtonElement;
    expect(saturday.disabled).toBe(true);
    await userEvent.click(saturday);
    expect(onSelect).not.toHaveBeenCalled();
    // Before the earliest day
    expect((day("Friday, October 2, 2026") as HTMLButtonElement).disabled).toBe(true);

    day("Friday, October 9, 2026").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(day("Monday, October 12, 2026"));
    // Up from the first pickable week lands on the earliest day
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(document.activeElement).toBe(day("Monday, October 5, 2026"));

    // The month of the earliest day is as far back as it goes; the button stays focusable but does nothing
    const previous = screen.getByRole("button", { name: "Previous month" });
    expect(previous.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("grid", { name: "November 2026" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Next month" }).getAttribute("aria-disabled")).toBe("true");
  });

  it("shows two months side by side without repeating their days", async () => {
    render(<Calendar mode="range" numberOfMonths={2} defaultMonth={october} today={today} />);
    expect(screen.getByRole("grid", { name: "October 2026" })).toBeTruthy();
    expect(screen.getByRole("grid", { name: "November 2026" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Sunday, November 1, 2026" })).toHaveLength(1);
    // One Previous on the first month and one Next on the last
    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("grid", { name: "December 2026" })).toBeTruthy();
    expect(screen.queryByRole("grid", { name: "October 2026" })).toBeNull();
  });

  it("names months and days in its locale", () => {
    render(
      <Calendar
        locale="fr-FR"
        weekStartsOn={1}
        defaultMonth={october}
        today={today}
        labels={{ previousMonth: "Mois précédent", nextMonth: "Mois suivant" }}
      />,
    );
    expect(screen.getByRole("grid", { name: "octobre 2026" })).toBeTruthy();
    expect(day("vendredi 16 octobre 2026")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mois suivant" })).toBeTruthy();
  });

  it("sends the circle from the old day to the new one, then hands it to the new day", async () => {
    stubLayout();
    render(<Calendar defaultMonth={october} today={today} defaultSelected={new Date(2026, 9, 20)} />);
    const circle = (name: string) => day(name).querySelector(".bg-primary");
    fireEvent.click(day("Friday, October 23, 2026"));
    // On its way: one shared circle, and the new day waits for it
    expect(document.querySelector("[data-slot=calendar-travelling-day]")).not.toBeNull();
    expect(circle("Friday, October 23, 2026, selected")).toBeNull();
    expect(circle("Tuesday, October 20, 2026")).toBeNull();
    await vi.waitFor(() => expect(document.querySelector("[data-slot=calendar-travelling-day]")).toBeNull(), {
      timeout: 3000,
    });
    expect(circle("Friday, October 23, 2026, selected")).not.toBeNull();
  });

  it("grows the band from the day picked first, then hands it to the days", async () => {
    stubLayout();
    render(<Calendar mode="range" defaultMonth={october} today={today} />);
    // The band's pieces at rest, one per day in the range
    const pieces = () => document.querySelectorAll("[data-slot=calendar-range]").length;
    fireEvent.click(day("Monday, October 12, 2026"));
    fireEvent.click(day("Wednesday, October 21, 2026"));
    expect(document.querySelector("[data-slot=calendar-band]")).not.toBeNull();
    expect(pieces()).toBe(0);
    await vi.waitFor(() => expect(document.querySelector("[data-slot=calendar-band]")).toBeNull(), {
      timeout: 3000,
    });
    expect(pieces()).toBe(10);
  });

  it("previews the range while its end is chosen, and clears it when the pointer leaves", () => {
    render(<Calendar mode="range" defaultMonth={october} today={today} />);
    const preview = () => document.querySelectorAll("[data-slot=calendar-preview]").length;
    // Nothing to preview until a range is started
    fireEvent.pointerEnter(day("Thursday, October 15, 2026"));
    expect(preview()).toBe(0);
    fireEvent.click(day("Monday, October 12, 2026"));
    fireEvent.pointerEnter(day("Thursday, October 15, 2026"));
    expect(preview()).toBe(4);
    // The day you're on already wears the end's solid circle
    expect(
      day("Thursday, October 15, 2026").querySelector("[data-slot=calendar-preview-end]"),
    ).not.toBeNull();
    // Backwards works too
    fireEvent.pointerEnter(day("Saturday, October 10, 2026"));
    expect(preview()).toBe(3);
    fireEvent.pointerLeave(document.querySelector("[data-slot=calendar-months]") as HTMLElement);
    expect(preview()).toBe(0);
    // Picking the end swaps the preview for the range
    fireEvent.pointerEnter(day("Thursday, October 15, 2026"));
    fireEvent.click(day("Thursday, October 15, 2026"));
    expect(preview()).toBe(0);
  });

  it("has no accessibility violations, with a day or a range picked", async () => {
    const { container, unmount } = render(
      <Calendar defaultMonth={october} today={today} defaultSelected={today} />,
    );
    expect(await axeViolations(container)).toEqual([]);
    unmount();
    const range = render(
      <Calendar
        mode="range"
        numberOfMonths={2}
        defaultMonth={october}
        today={today}
        defaultSelected={{ from: new Date(2026, 9, 26), to: new Date(2026, 10, 4) }}
      />,
    );
    expect(await axeViolations(range.container)).toEqual([]);
  });
});
