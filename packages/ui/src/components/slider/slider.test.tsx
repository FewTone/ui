import { Slider } from "@fewtone/ui/components/slider/slider";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Slider", () => {
  it("is a named slider with its value and bounds", () => {
    render(<Slider aria-label="Volume" defaultValue={[40]} />);
    const thumb = screen.getByRole("slider", { name: "Volume" });
    expect(thumb.getAttribute("aria-valuenow")).toBe("40");
    expect(thumb.getAttribute("aria-valuemin")).toBe("0");
    expect(thumb.getAttribute("aria-valuemax")).toBe("100");
  });

  it("moves with the arrow keys, Page Up and Down, Home and End", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Slider aria-label="Volume" defaultValue={[40]} onValueChange={onValueChange} />);
    const thumb = screen.getByRole("slider", { name: "Volume" });
    await user.tab();
    expect(document.activeElement).toBe(thumb);
    await user.keyboard("{ArrowRight}");
    expect(thumb.getAttribute("aria-valuenow")).toBe("41");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(thumb.getAttribute("aria-valuenow")).toBe("39");
    await user.keyboard("{PageUp}");
    expect(thumb.getAttribute("aria-valuenow")).toBe("49");
    await user.keyboard("{End}");
    expect(thumb.getAttribute("aria-valuenow")).toBe("100");
    await user.keyboard("{Home}");
    expect(thumb.getAttribute("aria-valuenow")).toBe("0");
    expect(onValueChange).toHaveBeenLastCalledWith([0]);
  });

  it("goes to the point clicked on the track", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Slider aria-label="Volume" defaultValue={[20]} onValueChange={onValueChange} />,
    );
    const root = container.querySelector("[data-slot=slider]") as HTMLElement;
    // jsdom has no layout: give the slider a 200px box
    vi.spyOn(root, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 20 }),
    );
    const track = container.querySelector("[data-slot=slider-track]") as HTMLElement;
    fireEvent.pointerDown(track, { clientX: 150, pointerId: 1, button: 0 });
    fireEvent.pointerUp(track, { clientX: 150, pointerId: 1, button: 0 });
    const thumb = screen.getByRole("slider", { name: "Volume" });
    expect(thumb.getAttribute("aria-valuenow")).toBe("75");
    expect(onValueChange).toHaveBeenLastCalledWith([75]);
    // Radix focuses the thumb that moved
    expect(document.activeElement).toBe(thumb);
  });

  it("picks a range with two thumbs named from the slider's label", async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="Price" defaultValue={[20, 80]} />);
    const low = screen.getByRole("slider", { name: "Price, minimum" });
    const high = screen.getByRole("slider", { name: "Price, maximum" });
    expect(low.getAttribute("aria-valuenow")).toBe("20");
    expect(high.getAttribute("aria-valuenow")).toBe("80");
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(high);
    await user.keyboard("{ArrowLeft}");
    expect(high.getAttribute("aria-valuenow")).toBe("79");
  });

  it("names a range's thumbs from a visible label", () => {
    render(
      <>
        <span id="price-label">Price</span>
        <Slider aria-labelledby="price-label" defaultValue={[20, 80]} />
      </>,
    );
    expect(screen.getByRole("slider", { name: "Price minimum" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "Price maximum" })).toBeTruthy();
  });

  it("opens a thumb into a pill with its value while it's reached for, formatted for screen readers too", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Slider
        aria-label="Budget"
        defaultValue={[120]}
        max={500}
        step={10}
        format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      />,
    );
    const thumb = screen.getByRole("slider", { name: "Budget" });
    expect(thumb.getAttribute("aria-valuetext")).toBe("$120");
    // A dot at rest
    expect(thumb.hasAttribute("data-open")).toBe(false);
    // The keys open it, with the value inside
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(thumb.getAttribute("aria-valuetext")).toBe("$130");
    expect(thumb.hasAttribute("data-open")).toBe(true);
    // The thumb is the pill: the value flows inside it
    expect(thumb.querySelector("[data-slot=number-ticker]")?.getAttribute("aria-label")).toBe("$130");
    // Leaving, it shrinks back to a dot
    await user.tab();
    expect(thumb.hasAttribute("data-open")).toBe(false);
    // The pointer over the slider opens it too
    await user.hover(container.querySelector("[data-slot=slider]") as HTMLElement);
    expect(thumb.hasAttribute("data-open")).toBe(true);
  });

  it("can't be moved when disabled", async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="Volume" defaultValue={[40]} disabled />);
    await user.tab();
    expect(document.activeElement).toBe(document.body);
  });

  it("has no accessibility violations, single or range", async () => {
    const { container } = render(
      <div>
        <Slider aria-label="Volume" defaultValue={[40]} />
        <Slider aria-label="Price" defaultValue={[20, 80]} />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
