import { Switcher, SwitcherItem } from "@fewtone/ui/components/switcher/switcher";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Range({ onValueChange }: { onValueChange?: (value: string) => void }) {
  return (
    <Switcher defaultValue="week" aria-label="Range" onValueChange={onValueChange}>
      <SwitcherItem value="day">Day</SwitcherItem>
      <SwitcherItem value="week">Week</SwitcherItem>
      <SwitcherItem value="month">Month</SwitcherItem>
    </Switcher>
  );
}

describe("Switcher", () => {
  it("is a radiogroup that always keeps a choice", async () => {
    const onValueChange = vi.fn();
    render(<Range onValueChange={onValueChange} />);
    expect(screen.getByRole("radiogroup", { name: "Range" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Week" }).getAttribute("aria-checked")).toBe("true");
    await userEvent.click(screen.getByRole("radio", { name: "Month" }));
    expect(onValueChange).toHaveBeenLastCalledWith("month");
    const month = screen.getByRole("radio", { name: "Month" });
    await userEvent.click(month);
    expect(month.getAttribute("aria-checked")).toBe("true");
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("moves between options with the arrow keys", async () => {
    render(<Range />);
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe("Week");
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement?.textContent).toBe("Month");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Range />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
