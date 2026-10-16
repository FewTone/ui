import {
  RadioGroup,
  RadioGroupItem,
  type RadioGroupTravel,
} from "@fewtone/ui/components/radio-group/radio-group";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Density({
  travel,
  onValueChange,
}: {
  travel?: RadioGroupTravel;
  onValueChange?: (value: string) => void;
}) {
  return (
    <RadioGroup aria-label="Density" defaultValue="comfortable" travel={travel} onValueChange={onValueChange}>
      {["default", "comfortable", "compact"].map((option) => (
        <div key={option}>
          <RadioGroupItem id={option} value={option} />
          <label htmlFor={option}>{option}</label>
        </div>
      ))}
    </RadioGroup>
  );
}

describe("RadioGroup", () => {
  it("is a radio group with the default choice checked, and a click picks another", async () => {
    const onValueChange = vi.fn();
    render(<Density onValueChange={onValueChange} />);
    expect(screen.getByRole("radiogroup", { name: "Density" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "comfortable" }).getAttribute("aria-checked")).toBe("true");
    await userEvent.click(screen.getByRole("radio", { name: "compact" }));
    expect(screen.getByRole("radio", { name: "compact" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "comfortable" }).getAttribute("aria-checked")).toBe("false");
    expect(onValueChange).toHaveBeenLastCalledWith("compact");
  });

  it("moves the choice with the arrow keys, and follows visible labels", async () => {
    render(<Density />);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: "comfortable" }));
    // Radix moves focus just after the keydown, and picks the radio it lands on while the key is still down
    await userEvent.keyboard("{ArrowDown>}");
    await vi.waitFor(() =>
      expect(screen.getByRole("radio", { name: "compact" }).getAttribute("aria-checked")).toBe("true"),
    );
    await userEvent.keyboard("{/ArrowDown}");
    await userEvent.click(screen.getByText("default"));
    expect(screen.getByRole("radio", { name: "default" }).getAttribute("aria-checked")).toBe("true");
  });

  it("changes choice with both ways of travelling", async () => {
    for (const travel of ["slide", "stretch"] as const) {
      const { unmount } = render(<Density travel={travel} />);
      await userEvent.click(screen.getByRole("radio", { name: "default" }));
      expect(screen.getByRole("radio", { name: "default" }).getAttribute("aria-checked")).toBe("true");
      unmount();
    }
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Density />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
