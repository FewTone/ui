import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  type StepperProps,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@fewtone/ui/components/stepper/stepper";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

// Reduced motion, switched per test (motion reads the media query once, so it's stubbed at the hook)
const motionPreference = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => motionPreference.reduce,
}));

afterEach(() => {
  motionPreference.reduce = false;
});

const steps = ["Cart", "Shipping", "Payment", "Review"];

function Checkout({ reachable, ...props }: StepperProps & { reachable?: number }) {
  return (
    <Stepper aria-label="Checkout" {...props}>
      {steps.map((title, index) => (
        <StepperItem key={title} step={index + 1} disabled={reachable !== undefined && index + 1 > reachable}>
          <StepperTrigger>
            <StepperIndicator />
            <StepperTitle>{title}</StepperTitle>
            <StepperDescription>Step {index + 1}</StepperDescription>
          </StepperTrigger>
          <StepperSeparator />
        </StepperItem>
      ))}
    </Stepper>
  );
}

const current = () => screen.getAllByRole("button").find((button) => button.getAttribute("aria-current"));
const states = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("[data-slot=stepper-item]"), (item) =>
    item.getAttribute("data-state"),
  );

describe("Stepper", () => {
  it("is a named list of steps, each a button named by its title, the current one marked", () => {
    const { container } = render(<Checkout defaultValue={2} />);
    expect(screen.getByRole("list", { name: "Checkout" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByRole("button", { name: /^Cart/ })).toBeTruthy();
    expect(current()?.textContent).toContain("Shipping");
    expect(current()?.getAttribute("aria-current")).toBe("step");
    expect(states(container)).toEqual(["completed", "active", "inactive", "inactive"]);
    // The indicator is decoration: the title names the step
    expect(container.querySelector("[data-slot=stepper-indicator]")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  it("fills the lines after the completed steps, and hides the last one", () => {
    const { container } = render(<Checkout defaultValue={3} />);
    const lines = Array.from(container.querySelectorAll("[data-slot=stepper-separator]"));
    expect(lines.map((line) => line.getAttribute("data-state"))).toEqual([
      "filled",
      "filled",
      "empty",
      "empty",
    ]);
    expect(lines.every((line) => line.getAttribute("aria-hidden") === "true")).toBe(true);
    expect(lines[3]?.className).toContain("group-last/step:hidden");
    const fill = container.querySelector("[data-slot=stepper-separator-fill]");
    expect(fill?.className).toContain("origin-left");
  });

  it("goes to a step when it's pressed", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<Checkout defaultValue={1} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: /^Payment/ }));
    expect(onValueChange).toHaveBeenCalledWith(3);
    expect(current()?.textContent).toContain("Payment");
    expect(states(container)).toEqual(["completed", "completed", "active", "inactive"]);
  });

  it("moves along the progress in turn: each step waits for the line before it", async () => {
    const user = userEvent.setup();
    const { container } = render(<Checkout defaultValue={1} />);
    await user.click(screen.getByRole("button", { name: /^Review/ }));
    const lines = Array.from(
      container.querySelectorAll<HTMLElement>("[data-slot=stepper-separator-fill]"),
      (fill) => fill.style.transitionDelay,
    );
    expect(lines).toEqual(["0s", "0.35s", "0.7s", "0s"]);
    const titles = Array.from(
      container.querySelectorAll<HTMLElement>("[data-slot=stepper-title]"),
      (title) => title.style.transitionDelay,
    );
    expect(titles).toEqual(["0s", "0.35s", "0.7s", "1.05s"]);
  });

  it("changes everything at once with reduced motion", async () => {
    motionPreference.reduce = true;
    const user = userEvent.setup();
    const { container } = render(<Checkout defaultValue={1} />);
    await user.click(screen.getByRole("button", { name: /^Review/ }));
    const delays = Array.from(
      container.querySelectorAll<HTMLElement>(
        "[data-slot=stepper-separator-fill], [data-slot=stepper-title]",
      ),
      (element) => element.style.transitionDelay,
    );
    expect(delays.every((delay) => delay === "0s")).toBe(true);
  });

  it("works from the keyboard: Tab to a step, Enter or Space to go there", async () => {
    const user = userEvent.setup();
    render(<Checkout defaultValue={1} />);
    await user.tab();
    expect(document.activeElement?.textContent).toContain("Cart");
    await user.tab();
    await user.keyboard("{Enter}");
    expect(current()?.textContent).toContain("Shipping");
    await user.tab();
    await user.keyboard(" ");
    expect(current()?.textContent).toContain("Payment");
  });

  it("skips steps that aren't reachable", async () => {
    const user = userEvent.setup();
    render(<Checkout defaultValue={2} reachable={2} />);
    const review = screen.getByRole("button", { name: /^Review/ }) as HTMLButtonElement;
    expect(review.disabled).toBe(true);
    await user.click(review);
    expect(current()?.textContent).toContain("Shipping");
  });

  it("follows a controlled value, and marks every step done past the last", () => {
    const { container, rerender } = render(<Checkout value={2} />);
    rerender(<Checkout value={5} />);
    expect(states(container)).toEqual(["completed", "completed", "completed", "completed"]);
    expect(current()).toBeUndefined();
  });

  it("lays out down the side when vertical", () => {
    const { container } = render(<Checkout defaultValue={2} orientation="vertical" />);
    expect(container.querySelector("[data-slot=stepper]")?.getAttribute("data-orientation")).toBe("vertical");
    expect(container.querySelector("[data-slot=stepper-separator-fill]")?.className).toContain("origin-top");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Checkout defaultValue={2} reachable={2} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
