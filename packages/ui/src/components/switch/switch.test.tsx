import { Switch } from "@fewtone/ui/components/switch/switch";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

describe("Switch", () => {
  it("is a switch with aria-checked that turns on when clicked", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Airplane mode" onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole("switch", { name: "Airplane mode" });
    expect(control.getAttribute("aria-checked")).toBe("false");
    await userEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("toggles with Space and follows a visible label", async () => {
    render(
      <>
        <Switch id="wifi" defaultChecked />
        <label htmlFor="wifi">Wi-Fi</label>
      </>,
    );
    const control = screen.getByRole("switch", { name: "Wi-Fi" });
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(control.getAttribute("aria-checked")).toBe("false");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Switch aria-label="Dark mode" defaultChecked />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
