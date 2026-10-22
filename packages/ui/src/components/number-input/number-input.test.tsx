import { NumberInput } from "@fewtone/ui/components/number-input/number-input";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Quantity(props: Partial<Parameters<typeof NumberInput>[0]>) {
  return (
    <>
      <label htmlFor="quantity">Quantity</label>
      <NumberInput id="quantity" defaultValue={2} min={1} max={10} {...props} />
    </>
  );
}

const field = () => screen.getByRole("spinbutton", { name: "Quantity" }) as HTMLInputElement;

describe("NumberInput", () => {
  it("is a labelled spinbutton with its value and bounds", () => {
    render(<Quantity />);
    const input = field();
    expect(input.value).toBe("2");
    expect(input.getAttribute("aria-valuenow")).toBe("2");
    expect(input.getAttribute("aria-valuemin")).toBe("1");
    expect(input.getAttribute("aria-valuemax")).toBe("10");
    expect(screen.getByRole("button", { name: "Increase" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Decrease" })).toBeTruthy();
  });

  it("steps with the arrow keys, takes big steps with Page Up and Down, and goes to the ends with Home and End", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Quantity max={50} onValueChange={onValueChange} />);
    const input = field();
    await user.click(input);
    await user.keyboard("{ArrowUp}");
    expect(input.getAttribute("aria-valuenow")).toBe("3");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input.getAttribute("aria-valuenow")).toBe("1");
    // At the minimum, another step down does nothing
    await user.keyboard("{ArrowDown}");
    expect(input.getAttribute("aria-valuenow")).toBe("1");
    await user.keyboard("{PageUp}");
    expect(input.getAttribute("aria-valuenow")).toBe("11");
    await user.keyboard("{End}");
    expect(input.getAttribute("aria-valuenow")).toBe("50");
    await user.keyboard("{Home}");
    expect(input.getAttribute("aria-valuenow")).toBe("1");
    expect(onValueChange).toHaveBeenLastCalledWith(1);
  });

  it("steps from the buttons, which don't take focus and stop at the bounds", async () => {
    const user = userEvent.setup();
    render(<Quantity defaultValue={9} />);
    const input = field();
    const increase = screen.getByRole("button", { name: "Increase" });
    expect(increase.tabIndex).toBe(-1);
    await user.click(increase);
    expect(input.getAttribute("aria-valuenow")).toBe("10");
    expect((increase as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: "Decrease" }));
    expect(input.getAttribute("aria-valuenow")).toBe("9");
  });

  it("repeats while a button is held down", async () => {
    const user = userEvent.setup();
    render(<Quantity defaultValue={1} />);
    const increase = screen.getByRole("button", { name: "Increase" });
    await user.pointer({ keys: "[MouseLeft>]", target: increase });
    // One step at once, then repeats after a pause
    await new Promise((resolve) => setTimeout(resolve, 800));
    await user.pointer({ keys: "[/MouseLeft]", target: increase });
    const reached = Number(field().getAttribute("aria-valuenow"));
    expect(reached).toBeGreaterThanOrEqual(4);
    // Released, it stops
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(Number(field().getAttribute("aria-valuenow"))).toBe(reached);
  });

  it("reads typed text when you leave the field, clamping it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Quantity onValueChange={onValueChange} />);
    const input = field();
    await user.clear(input);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    await user.type(input, "42");
    await user.tab();
    expect(input.value).toBe("10");
    expect(onValueChange).toHaveBeenLastCalledWith(10);
  });

  it("goes back to the last number when the text isn't one", async () => {
    const user = userEvent.setup();
    render(<Quantity />);
    const input = field();
    // Type over the 2
    await user.tripleClick(input);
    await user.keyboard("abc");
    expect(input.value).toBe("abc");
    expect(input.getAttribute("aria-valuenow")).toBe("2");
    await user.keyboard("{Enter}");
    expect(input.value).toBe("2");
  });

  it("formats with Intl.NumberFormat, reads formatted text back and tells screen readers the formatted value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <>
        <label htmlFor="price">Price</label>
        <NumberInput
          id="price"
          defaultValue={1250}
          step={10}
          min={0}
          locale="en-US"
          format={{ style: "currency", currency: "USD" }}
          onValueChange={onValueChange}
          name="price"
        />
      </>,
    );
    const input = screen.getByRole("spinbutton", { name: "Price" }) as HTMLInputElement;
    expect(input.value).toBe("$1,250.00");
    expect(input.getAttribute("aria-valuetext")).toBe("$1,250.00");
    await user.click(input);
    await user.keyboard("{ArrowUp}");
    expect(input.value).toBe("$1,260.00");
    await user.clear(input);
    await user.type(input, "$2,000.50");
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(2000.5);
    expect(input.value).toBe("$2,000.50");
    // The form gets the plain number
    expect(document.querySelector<HTMLInputElement>("input[type=hidden][name=price]")?.value).toBe("2000.5");
  });

  it("rolls the number when it steps, and not when you type", async () => {
    const user = userEvent.setup();
    const { container } = render(<Quantity />);
    const input = field();
    const roll = () => container.querySelector("[data-slot=number-input-roll]") as HTMLElement;
    expect(roll().classList.contains("invisible")).toBe(true);
    await user.click(input);
    await user.keyboard("{ArrowUp}");
    // The rolling copy shows the new number over the input's transparent text
    expect(roll().classList.contains("invisible")).toBe(false);
    expect(input.classList.contains("text-transparent")).toBe(true);
    expect(roll().textContent).toContain("3");
    await user.keyboard("5");
    expect(roll().classList.contains("invisible")).toBe(true);
    expect(input.classList.contains("text-transparent")).toBe(false);
  });

  it("steps decimals without float errors", async () => {
    const user = userEvent.setup();
    render(<Quantity defaultValue={0.1} min={0} step={0.1} />);
    const input = field();
    await user.click(input);
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(input.value).toBe("0.3");
  });

  it("has no accessibility violations, with a value, empty or invalid", async () => {
    const { container, rerender } = render(<Quantity />);
    expect(await axeViolations(container)).toEqual([]);
    rerender(<Quantity value={null} aria-invalid />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
