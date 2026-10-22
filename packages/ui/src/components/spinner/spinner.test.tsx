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

/** The drawing inside the status, which pulses with reduced motion */
const drawingOf = (spinner: HTMLElement) => spinner.firstElementChild as HTMLElement;
/** The line travelling round the infinity */
const lineOf = (spinner: HTMLElement) => spinner.querySelector("[data-slot=spinner-line]") as SVGPathElement;

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

  it("sends one line round the infinity", async () => {
    render(<Spinner />);
    const line = lineOf(screen.getByRole("status"));
    expect(line.getAttribute("stroke-dasharray")).toBe("24 76");
    await vi.waitFor(() => expect(Number(line.getAttribute("stroke-dashoffset"))).toBeLessThan(0));
  });

  it("fills the infinity once done, and is named Done", async () => {
    const { rerender } = render(<Spinner />);
    rerender(<Spinner done />);
    const spinner = screen.getByRole("status", { name: "Done" });
    expect(spinner.dataset.done).toBe("true");
    await vi.waitFor(() => expect(lineOf(spinner).getAttribute("stroke-dasharray")).toBe("100 0"), {
      timeout: 3000,
    });
  });

  it("pulses instead of travelling with reduced motion, and holds still once done", async () => {
    motionPreference.reduce = true;
    const { rerender } = render(<Spinner />);
    const spinner = screen.getByRole("status");
    await vi.waitFor(() => expect(Number(drawingOf(spinner).style.opacity)).toBeLessThan(1));
    expect(Number(lineOf(spinner).getAttribute("stroke-dashoffset") ?? 0)).toBe(0);
    rerender(<Spinner done doneLabel="Saved" />);
    expect(screen.getByRole("status", { name: "Saved" })).toBeTruthy();
    await vi.waitFor(() => expect(lineOf(spinner).getAttribute("stroke-dasharray")).toBe("100 0"));
    expect(drawingOf(screen.getByRole("status")).style.opacity).toBe("1");
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
