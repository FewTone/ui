import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Plans({ onValueChange }: { onValueChange?: (value: string) => void }) {
  return (
    <Select defaultValue="free" onValueChange={onValueChange}>
      <SelectTrigger aria-label="Plan">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="pro">Pro</SelectItem>
        <SelectItem value="team">Team</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe("Select", () => {
  it("is a combobox showing the selected value", () => {
    render(<Plans />);
    const trigger = screen.getByRole("combobox", { name: "Plan" });
    expect(trigger.textContent).toContain("Free");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens from the keyboard and selects with the arrow keys", async () => {
    const onValueChange = vi.fn();
    render(<Plans onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox", { name: "Plan" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(await screen.findByRole("listbox")).toBeTruthy();
    expect(screen.getAllByRole("option")).toHaveLength(3);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("pro");
    expect(trigger.textContent).toContain("Pro");
  });

  it("has no accessibility violations, closed or open", async () => {
    const { container } = render(<Plans />);
    expect(await axeViolations(container)).toEqual([]);
    screen.getByRole("combobox", { name: "Plan" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(await axeViolations(await screen.findByRole("listbox"))).toEqual([]);
  });
});
