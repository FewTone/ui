import { Button } from "@fewtone/ui/components/button/button";
import { Spinner } from "@fewtone/ui/components/spinner/spinner";
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

/** The drawing inside the status, which turns or pulses */
const drawingOf = (spinner: HTMLElement) => spinner.firstElementChild as HTMLElement;

describe("Spinner", () => {
  it("is a status named Loading", () => {
    render(<Spinner />);
    const spinner = screen.getByRole("status", { name: "Loading" });
    expect(spinner.dataset.slot).toBe("spinner");
    expect(spinner.dataset.size).toBe("md");
    expect(spinner.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("takes another name and a size", () => {
    render(<Spinner aria-label="Loading comments" size="lg" />);
    const spinner = screen.getByRole("status", { name: "Loading comments" });
    expect(spinner.dataset.size).toBe("lg");
    expect(spinner.className).toContain("size-(--size-icon-lg)");
  });

  it("turns", async () => {
    render(<Spinner />);
    const drawing = drawingOf(screen.getByRole("status"));
    await vi.waitFor(() => expect(drawing.style.transform).toMatch(/rotate\(0?\.\d+turn\)/));
  });

  it("pulses instead of turning with reduced motion", async () => {
    motionPreference.reduce = true;
    render(<Spinner />);
    const drawing = drawingOf(screen.getByRole("status"));
    await vi.waitFor(() => expect(Number(drawing.style.opacity)).toBeLessThan(1));
    expect(drawing.style.transform).toBe("");
  });

  it("leaves a button's name alone when hidden inside it", () => {
    render(
      <Button disabled>
        <Spinner aria-hidden />
        Saving…
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Saving…" })).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        <Spinner size="sm" />
        <Spinner aria-label="Loading comments" />
        <Button disabled>
          <Spinner aria-hidden />
          Saving…
        </Button>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
