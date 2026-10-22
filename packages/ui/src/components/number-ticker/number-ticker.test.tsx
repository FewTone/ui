import { NumberTicker } from "@fewtone/ui/components/number-ticker/number-ticker";
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

/*
 * jsdom has no CSS mod(), linear() easing or registered custom properties, so the flow takes its still path here:
 * it builds the same columns and changes them without moving. The motion itself is checked by eye.
 */

/** The digit each column shows, left to right */
const digits = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(".ticker-digit")).map((digit) =>
    digit.style.getPropertyValue("--current"),
  );

describe("NumberTicker", () => {
  it("is an image named by its formatted value, so screen readers read the number once", () => {
    render(<NumberTicker value={12480} startOnView={false} />);
    const ticker = screen.getByRole("img", { name: "12,480" });
    expect(ticker.dataset.slot).toBe("number-ticker");
  });

  it("builds a column of 0–9 for each digit, showing its digit", () => {
    const { container } = render(<NumberTicker value={12480} startOnView={false} />);
    expect(digits(container)).toEqual(["1", "2", "4", "8", "0"]);
    const [first] = container.querySelectorAll(".ticker-digit");
    // Ten rows; only the one it shows is reachable, the rest are inert
    expect(first?.querySelectorAll(".ticker-digit-num")).toHaveLength(10);
    expect(first?.querySelectorAll(".ticker-digit-num:not([inert])")).toHaveLength(1);
    // The separator is a symbol between the columns
    expect(container.querySelector(".ticker-group")?.textContent).toBe(",");
  });

  it("formats with Intl, in en-US unless told otherwise, with a prefix and suffix", () => {
    render(
      <>
        <NumberTicker
          value={84320}
          format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
          startOnView={false}
        />
        <NumberTicker
          value={0.9998}
          format={{ style: "percent", minimumFractionDigits: 2 }}
          startOnView={false}
        />
        <NumberTicker value={1234.5} locale="de-DE" startOnView={false} />
        <NumberTicker value={3} prefix="~" suffix=" left" startOnView={false} />
      </>,
    );
    for (const name of ["$84,320", "99.98%", "1.234,5", "~3 left"]) {
      expect(screen.getByRole("img", { name })).toBeTruthy();
    }
  });

  it("changes to a new value, its name and its columns", () => {
    const { container, rerender } = render(<NumberTicker value={52} startOnView={false} />);
    rerender(<NumberTicker value={2481} startOnView={false} />);
    expect(screen.getByRole("img", { name: "2,481" })).toBeTruthy();
    expect(digits(container)).toEqual(["2", "4", "8", "1"]);
    rerender(<NumberTicker value={7} startOnView={false} />);
    expect(digits(container)).toEqual(["7"]);
  });

  it("shows the value at once with reduced motion", () => {
    motionPreference.reduce = true;
    const { container } = render(<NumberTicker value={990} from={0} />);
    expect(digits(container)).toEqual(["9", "9", "0"]);
  });

  it("sends the server the final value as plain text", async () => {
    const { renderToString } = await import("react-dom/server");
    const html = renderToString(<NumberTicker value={1248} />);
    expect(html).toContain('aria-label="1,248"');
    expect(html).toContain("<span>1</span><span>,</span><span>2</span>");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <p>
        <NumberTicker value={12480} startOnView={false} /> people use it
      </p>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
