import { Badge } from "@fewtone/ui/components/badge/badge";
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

/** The square holding the lights, which turns */
const lightsOf = (badge: HTMLElement) =>
  badge.querySelector<HTMLElement>("[data-slot=badge-shine] > span") as HTMLElement;

describe("Badge", () => {
  it("renders a span with its label and variant", () => {
    render(<Badge variant="secondary">Draft</Badge>);
    const badge = screen.getByText("Draft");
    expect(badge.tagName).toBe("SPAN");
    expect(badge.dataset.slot).toBe("badge");
    expect(badge.dataset.variant).toBe("secondary");
  });

  it("puts its styles on the child with asChild, so a link stays a link", () => {
    render(
      <Badge asChild variant="outline">
        <a href="/changelog">v2.4.0</a>
      </Badge>,
    );
    const link = screen.getByRole("link", { name: "v2.4.0" });
    expect(link.dataset.slot).toBe("badge");
    expect(link.className).toContain("rounded-full");
  });

  it("draws the shine as a hidden layer that doesn't change the label", () => {
    render(<Badge variant="shine">Beta</Badge>);
    const badge = screen.getByText("Beta");
    const shine = badge.querySelector("[data-slot=badge-shine]");
    expect(shine?.getAttribute("aria-hidden")).toBe("true");
    expect(badge.textContent).toBe("Beta");
    // Plain variants have no shine layer
    render(<Badge variant="outline">Stable</Badge>);
    expect(screen.getByText("Stable").querySelector("[data-slot=badge-shine]")).toBeNull();
  });

  it("puts the shine inside the child with asChild", () => {
    render(
      <Badge asChild variant="shine">
        <a href="/roadmap">Beta</a>
      </Badge>,
    );
    const link = screen.getByRole("link", { name: "Beta" });
    expect(link.querySelector("[data-slot=badge-shine]")).not.toBeNull();
  });

  it("turns the lights round the edge", async () => {
    render(<Badge variant="shine">Beta</Badge>);
    const lights = lightsOf(screen.getByText("Beta"));
    await vi.waitFor(() => expect(lights.style.transform).toMatch(/rotate\(0?\.\d+turn\)/));
  });

  it("keeps the lights still with reduced motion", async () => {
    motionPreference.reduce = true;
    render(<Badge variant="shine">Beta</Badge>);
    const lights = lightsOf(screen.getByText("Beta"));
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(lights.style.transform).toBe("");
  });

  it("has no accessibility violations in any variant", async () => {
    const { container } = render(
      <div>
        <Badge>Verified</Badge>
        <Badge variant="secondary">Draft</Badge>
        <Badge variant="destructive">Failed</Badge>
        <Badge variant="outline">v2.4.0</Badge>
        <Badge variant="shine">Beta</Badge>
        <Badge asChild variant="shine">
          <a href="/roadmap">Roadmap</a>
        </Badge>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
