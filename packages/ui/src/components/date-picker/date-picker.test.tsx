import { DatePicker, DateRangePicker } from "@fewtone/ui/components/date-picker/date-picker";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

// A fixed today, so nothing depends on the machine's clock
const today = new Date(2026, 9, 16);
/** What the trigger says (screen readers read it as the combobox's value) */
const shownText = (trigger: HTMLElement) =>
  trigger.querySelector("[data-slot=date-picker-value]")?.textContent?.replace(/\s+/g, " ");

function Due({ onChange, value }: { onChange?: (date: Date | undefined) => void; value?: Date }) {
  return (
    <form>
      <label htmlFor="due">Due date</label>
      <DatePicker id="due" name="due" defaultValue={value} today={today} onChange={onChange} />
    </form>
  );
}

describe("DatePicker", () => {
  it("opens a calendar from a combobox showing the date; a pick closes it with the new date", async () => {
    const onChange = vi.fn();
    const { container } = render(<Due value={new Date(2026, 9, 16)} onChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: "Due date" });
    expect(shownText(trigger)).toBe("Oct 16, 2026");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector<HTMLInputElement>("input[name=due]")?.value).toBe("2026-10-16");

    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Choose date" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    // Focus goes to the picked day
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(
        within(dialog).getByRole("button", { name: "Friday, October 16, 2026, selected" }),
      ),
    );

    await userEvent.click(within(dialog).getByRole("button", { name: "Tuesday, October 20, 2026" }));
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 9, 20));
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(shownText(trigger)).toBe("Oct 20, 2026");
    expect(container.querySelector<HTMLInputElement>("input[name=due]")?.value).toBe("2026-10-20");
    // Radix gives the focus back to the trigger just after the popover goes
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("shows a placeholder, opens on today from the keyboard, and picks with the arrow keys and Enter", async () => {
    render(<Due />);
    const trigger = screen.getByRole("combobox", { name: "Due date" });
    expect(shownText(trigger)).toBe("Pick a date");
    expect(trigger.hasAttribute("data-placeholder")).toBe(true);
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const dialog = await screen.findByRole("dialog", { name: "Choose date" });
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(
        within(dialog).getByRole("button", { name: "Friday, October 16, 2026" }),
      ),
    );
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(shownText(trigger)).toBe("Oct 17, 2026");
  });

  it("closes on Escape without changing the date, and focus goes back to the trigger", async () => {
    const onChange = vi.fn();
    render(<Due value={new Date(2026, 9, 16)} onChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: "Due date" });
    await userEvent.click(trigger);
    await screen.findByRole("dialog", { name: "Choose date" });
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("picks a preset, turning the calendar to its month", async () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        aria-label="Launch"
        today={today}
        presets={[{ label: "First of December", value: () => new Date(2026, 11, 1) }]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Launch" }));
    const dialog = await screen.findByRole("dialog", { name: "Choose date" });
    expect(within(dialog).getByRole("list", { name: "Presets" })).toBeTruthy();
    await userEvent.click(within(dialog).getByRole("button", { name: "First of December" }));
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 11, 1));
    expect(within(dialog).getByRole("grid", { name: "December 2026" })).toBeTruthy();
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(shownText(screen.getByRole("combobox", { name: "Launch" }))).toBe("Dec 1, 2026");
  });

  it("has no accessibility violations, closed or open", async () => {
    const { container } = render(<Due value={new Date(2026, 9, 16)} />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("combobox", { name: "Due date" }));
    expect(await axeViolations(await screen.findByRole("dialog"))).toEqual([]);
  });
});

describe("DateRangePicker", () => {
  it("picks a range over two months and stays open, showing it in the trigger", async () => {
    const onChange = vi.fn();
    render(
      <>
        <label htmlFor="stay">Stay</label>
        <DateRangePicker id="stay" today={today} onChange={onChange} />
      </>,
    );
    const trigger = screen.getByRole("combobox", { name: "Stay" });
    expect(shownText(trigger)).toBe("Pick a date range");
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Choose dates" });
    expect(
      within(dialog)
        .getAllByRole("grid")
        .map((grid) => grid.getAttribute("aria-labelledby")),
    ).toHaveLength(2);
    expect(within(dialog).getByRole("grid", { name: "November 2026" })).toBeTruthy();

    await userEvent.click(within(dialog).getByRole("button", { name: "Monday, October 26, 2026" }));
    expect(shownText(trigger)).toBe("Oct 26, 2026 – …");
    await userEvent.click(within(dialog).getByRole("button", { name: "Wednesday, November 4, 2026" }));
    expect(onChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 26), to: new Date(2026, 10, 4) });
    // Intl writes the range the short way
    expect(shownText(trigger)).toMatch(/^Oct 26 – Nov 4, 2026$/);
    expect(screen.getByRole("dialog", { name: "Choose dates" })).toBeTruthy();

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("picks a range from a preset", async () => {
    const onChange = vi.fn();
    render(
      <DateRangePicker
        aria-label="Report"
        today={today}
        presets={[{ label: "First week", value: { from: new Date(2026, 9, 1), to: new Date(2026, 9, 7) } }]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Report" }));
    const dialog = await screen.findByRole("dialog", { name: "Choose dates" });
    await userEvent.click(within(dialog).getByRole("button", { name: "First week" }));
    expect(onChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 1), to: new Date(2026, 9, 7) });
    expect(shownText(screen.getByRole("combobox", { name: "Report" }))).toMatch(/^Oct 1 – 7, 2026$/);
  });

  it("has no accessibility violations while open", async () => {
    render(
      <DateRangePicker
        aria-label="Stay"
        today={today}
        defaultValue={{ from: new Date(2026, 9, 12), to: new Date(2026, 9, 18) }}
        presets={[{ label: "First week", value: { from: new Date(2026, 9, 1), to: new Date(2026, 9, 7) } }]}
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Stay" }));
    expect(await axeViolations(await screen.findByRole("dialog"))).toEqual([]);
  });
});
