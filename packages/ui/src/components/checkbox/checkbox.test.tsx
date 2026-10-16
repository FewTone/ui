import { Checkbox } from "@fewtone/ui/components/checkbox/checkbox";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

describe("Checkbox", () => {
  it("is a checkbox with aria-checked that checks when clicked", async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Accept terms" onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(control.getAttribute("aria-checked")).toBe("false");
    await userEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("toggles with Space and follows a visible label", async () => {
    render(
      <>
        <Checkbox id="news" defaultChecked />
        <label htmlFor="news">Newsletter</label>
      </>,
    );
    const control = screen.getByRole("checkbox", { name: "Newsletter" });
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(control.getAttribute("aria-checked")).toBe("false");
    await userEvent.click(screen.getByText("Newsletter"));
    expect(control.getAttribute("aria-checked")).toBe("true");
  });

  it("is mixed when indeterminate, and becomes checked when clicked", async () => {
    render(<Checkbox aria-label="All channels" defaultChecked="indeterminate" />);
    const control = screen.getByRole("checkbox", { name: "All channels" });
    expect(control.getAttribute("aria-checked")).toBe("mixed");
    await userEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
  });

  it("returns to its first state when the form resets", async () => {
    render(
      <form aria-label="Preferences">
        <Checkbox aria-label="Newsletter" name="newsletter" />
      </form>,
    );
    const control = screen.getByRole("checkbox", { name: "Newsletter" });
    await userEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
    (screen.getByRole("form", { name: "Preferences" }) as HTMLFormElement).reset();
    await vi.waitFor(() => expect(control.getAttribute("aria-checked")).toBe("false"));
  });

  it("ignores clicks when disabled", async () => {
    render(<Checkbox aria-label="Sync" disabled />);
    const control = screen.getByRole("checkbox", { name: "Sync" });
    await userEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("false");
  });

  it("has no accessibility violations, checked or indeterminate", async () => {
    const { container } = render(
      <>
        <Checkbox aria-label="Checked" defaultChecked />
        <Checkbox aria-label="Some" defaultChecked="indeterminate" />
      </>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
