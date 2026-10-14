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

const zones = ["Europe/London", "Europe/Paris", "Asia/Kolkata", "Asia/Tokyo", "America/New_York"];

function Zones({ onValueChange }: { onValueChange?: (value: string) => void }) {
  return (
    <Select defaultValue="Asia/Kolkata" onValueChange={onValueChange}>
      <SelectTrigger aria-label="Time zone">
        <SelectValue />
      </SelectTrigger>
      <SelectContent searchable searchPlaceholder="Search time zones">
        {zones.map((zone) => (
          <SelectItem key={zone} value={zone}>
            {zone}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

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

  describe("searchable", () => {
    const open = async () => {
      screen.getByRole("combobox", { name: "Time zone" }).focus();
      await userEvent.keyboard("{Enter}");
      return screen.findByRole("combobox", { name: "Search time zones" });
    };
    // Filtered-out options are hidden, so they drop out of the accessibility tree
    const visible = () => screen.queryAllByRole("option");

    it("focuses the search field and filters as you type, keeping the selected value in the trigger", async () => {
      render(<Zones />);
      const field = await open();
      await vi.waitFor(() => expect(document.activeElement).toBe(field));
      await userEvent.keyboard("europe");
      expect(visible().map((option) => option.textContent)).toEqual(["Europe/London", "Europe/Paris"]);
      // While open, Radix hides the page behind the list from assistive tech, so the trigger is found hidden
      expect(screen.getByRole("combobox", { name: "Time zone", hidden: true }).textContent).toContain(
        "Asia/Kolkata",
      );
    });

    it("moves through the matches with the arrow keys and picks with Enter", async () => {
      const onValueChange = vi.fn();
      render(<Zones onValueChange={onValueChange} />);
      const field = await open();
      await vi.waitFor(() => expect(document.activeElement).toBe(field));
      await userEvent.keyboard("europe{ArrowDown}{Enter}");
      expect(onValueChange).toHaveBeenCalledWith("Europe/Paris");
    });

    it("says when nothing matches", async () => {
      render(<Zones />);
      const field = await open();
      await vi.waitFor(() => expect(document.activeElement).toBe(field));
      await userEvent.keyboard("zzz");
      expect(visible()).toHaveLength(0);
      expect(screen.getByText("No results for “zzz”")).toBeTruthy();
    });

    it("has no accessibility violations while open", async () => {
      render(<Zones />);
      await open();
      expect(await axeViolations(await screen.findByRole("dialog"))).toEqual([]);
    });
  });
});
