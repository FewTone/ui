import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  type InputOTPStatus,
} from "@fewtone/ui/components/input-otp/input-otp";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Code({
  onValueChange,
  invalid,
  status,
  defaultValue,
}: {
  onValueChange?: (value: string) => void;
  invalid?: boolean;
  status?: InputOTPStatus;
  defaultValue?: string;
}) {
  return (
    <InputOTP
      aria-label="Verification code"
      onValueChange={onValueChange}
      aria-invalid={invalid}
      status={status}
      defaultValue={defaultValue}
      name="code"
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}

const boxes = () => screen.getAllByRole<HTMLInputElement>("textbox");
/** The box (slot) the focus box is drawn in */
const indicatorSlot = (container: HTMLElement) =>
  container.querySelector("[data-slot=input-otp-indicator]")?.closest("[data-slot=input-otp-slot]");

describe("InputOTP", () => {
  it("is a named group of six named boxes", () => {
    render(<Code />);
    expect(screen.getByRole("group", { name: "Verification code" })).toBeTruthy();
    expect(boxes()).toHaveLength(6);
    expect(screen.getByRole("textbox", { name: "Character 1 of 6" })).toBeTruthy();
    expect(screen.getByRole("separator")).toBeTruthy();
  });

  it("moves on as you type, and the focus box follows", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<Code onValueChange={onValueChange} />);
    const inputs = boxes();
    await user.click(inputs[0] as HTMLInputElement);
    expect(indicatorSlot(container)).toBe(inputs[0]?.parentElement);
    await user.keyboard("1");
    expect(document.activeElement).toBe(inputs[1]);
    expect(indicatorSlot(container)).toBe(inputs[1]?.parentElement);
    await user.keyboard("2");
    expect(document.activeElement).toBe(inputs[2]);
    expect(onValueChange).toHaveBeenLastCalledWith("12");
    // The typed digits are drawn in their boxes
    expect(inputs[0]?.parentElement?.querySelector("[data-slot=input-otp-char]")?.textContent).toBe("1");
  });

  it("lets the focus box go once every box is filled, and brings it back when you move", async () => {
    const user = userEvent.setup();
    const { container } = render(<Code />);
    const indicator = () => container.querySelector("[data-slot=input-otp-indicator]");
    await user.click(boxes()[0] as HTMLInputElement);
    await user.keyboard("12345");
    expect(indicator()?.hasAttribute("data-hidden")).toBe(false);
    // The last digit: the code is done, and the focus box fades away (focus itself stays put)
    await user.keyboard("6");
    expect(indicator()?.hasAttribute("data-hidden")).toBe(true);
    expect(document.activeElement).toBe(boxes()[5]);
    // Moving with the keyboard brings it back
    await user.keyboard("{ArrowLeft}");
    expect(indicator()?.hasAttribute("data-hidden")).toBe(false);
    expect(indicatorSlot(container)).toBe(boxes()[4]?.closest("[data-slot=input-otp-slot]"));
  });

  it("ignores letters in a numeric code", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Code onValueChange={onValueChange} />);
    await user.click(boxes()[0] as HTMLInputElement);
    await user.keyboard("a");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(boxes()[0]?.value).toBe("");
  });

  it("spreads a pasted code across the boxes and submits it through a hidden input", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<Code onValueChange={onValueChange} />);
    await user.click(boxes()[0] as HTMLInputElement);
    await act(async () => await user.paste("123456"));
    expect(boxes().map((input) => input.value)).toEqual(["1", "2", "3", "4", "5", "6"]);
    expect(onValueChange).toHaveBeenLastCalledWith("123456");
    expect(document.activeElement).toBe(boxes()[5]);
    expect(container.querySelector<HTMLInputElement>("input[type=hidden]")?.value).toBe("123456");
  });

  it("goes back with Backspace, clearing the box it lands on", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Code onValueChange={onValueChange} />);
    const inputs = boxes();
    await user.click(inputs[0] as HTMLInputElement);
    await user.keyboard("12");
    expect(document.activeElement).toBe(inputs[2]);
    // An empty box moves back to the previous one (on the next frame)
    await user.keyboard("{Backspace}");
    await vi.waitFor(() => expect(document.activeElement).toBe(inputs[1]));
    await user.keyboard("{Backspace}");
    expect(onValueChange).toHaveBeenLastCalledWith("1");
    expect(inputs[1]?.value).toBe("");
  });

  it("marks every box invalid", () => {
    const { container } = render(<Code invalid defaultValue="123450" />);
    for (const input of boxes()) expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(container.querySelectorAll("[data-slot=input-otp-slot][data-invalid]")).toHaveLength(6);
    // aria-invalid goes to the inputs, not to the group
    expect(screen.getByRole("group").hasAttribute("aria-invalid")).toBe(false);
  });

  it("shakes once each time the status becomes error, and marks every box invalid", async () => {
    const { container, rerender } = render(<Code defaultValue="123450" />);
    const root = container.querySelector<HTMLElement>("[data-slot=input-otp]") as HTMLElement;
    rerender(<Code defaultValue="123450" status="error" />);
    expect(root.dataset.status).toBe("error");
    for (const input of boxes()) expect(input.getAttribute("aria-invalid")).toBe("true");
    // Mid-shake the field is moved sideways; once it's done, nothing is left behind
    await vi.waitFor(() => expect(root.style.transform).not.toBe(""));
    await vi.waitFor(() => expect(root.style.transform).toBe(""), { timeout: 2000 });
    rerender(<Code defaultValue="123456" status="success" />);
    expect(container.querySelectorAll("[data-slot=input-otp-slot][data-success]")).toHaveLength(6);
    expect(container.querySelectorAll("[data-slot=input-otp-slot][data-invalid]")).toHaveLength(0);
  });

  it("doesn't shake on first paint", async () => {
    const { container } = render(<Code defaultValue="123450" status="error" />);
    const root = container.querySelector<HTMLElement>("[data-slot=input-otp]") as HTMLElement;
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(root.style.transform).toBe("");
  });

  it("draws a dot instead of the digit for a PIN", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <InputOTP aria-label="PIN" type="password">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
      </InputOTP>,
    );
    const first = container.querySelector<HTMLInputElement>("input[type=password]");
    await user.click(first as HTMLInputElement);
    await user.keyboard("7");
    const drawn = container.querySelector("[data-slot=input-otp-char]");
    expect(drawn?.textContent).toBe("");
    expect(drawn?.querySelector("span")).toBeTruthy();
  });

  it("has no accessibility violations, empty, focused, invalid or verified", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(<Code />);
    expect(await axeViolations(container)).toEqual([]);
    await user.click(boxes()[0] as HTMLInputElement);
    await user.keyboard("12");
    expect(await axeViolations(container)).toEqual([]);
    rerender(<Code invalid />);
    expect(await axeViolations(container)).toEqual([]);
    rerender(<Code status="success" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
