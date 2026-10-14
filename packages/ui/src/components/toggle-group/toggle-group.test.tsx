import { ToggleGroup, ToggleGroupItem } from "@fewtone/ui/components/toggle-group/toggle-group";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Formatting({ onValueChange }: { onValueChange?: (value: string[]) => void }) {
  return (
    <ToggleGroup aria-label="Formatting" defaultValue={["bold"]} onValueChange={onValueChange}>
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      <ToggleGroupItem value="underline" disabled>
        Underline
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

describe("ToggleGroup", () => {
  it("is a toolbar of buttons that switch on and off independently", async () => {
    const onValueChange = vi.fn();
    render(<Formatting onValueChange={onValueChange} />);
    expect(screen.getByRole("toolbar", { name: "Formatting" })).toBeTruthy();
    const bold = screen.getByRole("button", { name: "Bold" });
    expect(bold.getAttribute("aria-pressed")).toBe("true");
    await userEvent.click(screen.getByRole("button", { name: "Italic" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["bold", "italic"]);
    await userEvent.click(bold);
    expect(bold.getAttribute("aria-pressed")).toBe("false");
    expect(onValueChange).toHaveBeenLastCalledWith(["italic"]);
  });

  it("moves with the arrow keys and skips disabled options", async () => {
    render(<Formatting />);
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe("Bold");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    // Underline is disabled, so the loop goes back to Bold
    expect(document.activeElement?.textContent).toBe("Bold");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Formatting />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
