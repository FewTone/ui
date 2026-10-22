import { Progress, ProgressRing, ProgressValue } from "@fewtone/ui/components/progress/progress";
import { render, screen } from "@testing-library/react";
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

const indicatorOf = (bar: HTMLElement) => bar.querySelector<HTMLElement>("[data-slot=progress-indicator]");

describe("Progress", () => {
  it("is a named progressbar with its value", () => {
    render(<Progress value={64} aria-label="Upload" />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar.getAttribute("aria-valuenow")).toBe("64");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(bar.getAttribute("aria-valuetext")).toBe("64%");
    expect(bar.dataset.state).toBe("loading");
    // The fill is moved, not resized: 64% shows, the rest is slid out of the track
    expect(indicatorOf(bar)?.style.transform).toBe("translateX(-36%)");
  });

  it("slides the fill to a new value", async () => {
    const { rerender } = render(<Progress value={20} aria-label="Upload" />);
    rerender(<Progress value={100} aria-label="Upload" />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
    expect(bar.dataset.state).toBe("complete");
    await vi.waitFor(() => expect(indicatorOf(bar)?.style.transform).toMatch(/translateX\(-?0%\)|^none$/), {
      timeout: 2000,
    });
  });

  it("rises continuously while updates keep coming: each change lasts until the next", async () => {
    const { rerender } = render(<Progress value={0} aria-label="Upload" />);
    rerender(<Progress value={10} aria-label="Upload" />);
    // A moment later, the next update: the fill is still on its way, not waiting at 10%
    await new Promise((resolve) => setTimeout(resolve, 150));
    rerender(<Progress value={20} aria-label="Upload" />);
    await new Promise((resolve) => setTimeout(resolve, 60));
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    const shift = Number(/translateX\((-?[\d.]+)%\)/.exec(indicatorOf(bar)?.style.transform ?? "")?.[1]);
    // Somewhere between the two values, moving
    expect(shift).toBeLessThan(-80);
    expect(shift).toBeGreaterThan(-100);
  });

  it("uses max, and keeps values inside it", () => {
    const { rerender } = render(<Progress value={3} max={4} aria-label="Steps" />);
    const bar = screen.getByRole("progressbar", { name: "Steps" });
    expect(bar.getAttribute("aria-valuemax")).toBe("4");
    expect(bar.getAttribute("aria-valuetext")).toBe("75%");
    rerender(<Progress value={9} max={4} aria-label="Steps" />);
    expect(bar.getAttribute("aria-valuenow")).toBe("4");
    rerender(<Progress value={-2} max={4} aria-label="Steps" />);
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
  });

  it("has no value while indeterminate, and sweeps a segment across", async () => {
    render(<Progress aria-label="Loading" />);
    const bar = screen.getByRole("progressbar", { name: "Loading" });
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
    expect(bar.dataset.state).toBe("indeterminate");
    const segment = indicatorOf(bar) as HTMLElement;
    await vi.waitFor(() => expect(segment.style.transform).toMatch(/translateX\(/));
  });

  it("pulses instead of sweeping with reduced motion", async () => {
    motionPreference.reduce = true;
    render(<Progress value={null} aria-label="Loading" />);
    const segment = indicatorOf(screen.getByRole("progressbar")) as HTMLElement;
    await vi.waitFor(() => expect(Number(segment.style.opacity)).toBeLessThan(1));
    expect(segment.style.transform).toBe("");
  });
});

describe("ProgressRing", () => {
  it("is a named progressbar with its value, and can show it", () => {
    render(<ProgressRing value={40} size="lg" showValue aria-label="Course completed" />);
    const ring = screen.getByRole("progressbar", { name: "Course completed" });
    expect(ring.getAttribute("aria-valuenow")).toBe("40");
    expect(ring.dataset.size).toBe("lg");
    const label = ring.querySelector<HTMLElement>("[data-slot=progress-value]");
    expect(label?.textContent).toBe("40%");
    expect(label?.getAttribute("aria-hidden")).toBe("true");
  });

  it("leaves the value out when small, where it wouldn't fit", () => {
    render(<ProgressRing value={40} size="sm" showValue aria-label="Syncing" />);
    expect(screen.getByRole("progressbar").querySelector("[data-slot=progress-value]")).toBeNull();
  });

  it("turns while indeterminate", async () => {
    render(<ProgressRing aria-label="Loading" />);
    const ring = screen.getByRole("progressbar", { name: "Loading" });
    expect(ring.hasAttribute("aria-valuenow")).toBe(false);
    const drawing = indicatorOf(ring) as HTMLElement;
    await vi.waitFor(() => expect(drawing.style.transform).toMatch(/rotate\(/));
  });
});

describe("ProgressValue", () => {
  it("counts to the new number", async () => {
    const { rerender } = render(<ProgressValue value={9} data-testid="value" />);
    const value = screen.getByTestId("value");
    expect(value.textContent).toBe("9%");
    rerender(<ProgressValue value={12} data-testid="value" />);
    // Both numbers are there while the digits swap, then only the new one
    await vi.waitFor(() => expect(value.textContent).toBe("12%"));
  });

  it("shows nothing without a value", () => {
    const { container } = render(<ProgressValue value={null} />);
    expect(container.textContent).toBe("");
  });
});

describe("accessibility", () => {
  it("has no violations", async () => {
    const { container } = render(
      <div>
        <Progress value={64} aria-label="Upload" />
        <Progress aria-label="Loading" />
        <ProgressRing value={64} showValue aria-label="Upload, ring" />
        <ProgressRing aria-label="Loading, ring" />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
