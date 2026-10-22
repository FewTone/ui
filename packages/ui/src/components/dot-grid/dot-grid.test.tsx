import { DotGrid } from "@fewtone/ui/components/dot-grid/dot-grid";
import { fireEvent, render } from "@testing-library/react";
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

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function renderHero(props: Parameters<typeof DotGrid>[0] = {}) {
  const view = render(
    <section data-testid="hero" className="relative isolate">
      <DotGrid {...props} />
      <h2>Ship your next idea</h2>
    </section>,
  );
  const layer = view.container.querySelector("[data-slot=dot-grid]") as HTMLElement;
  const highlight = view.container.querySelector("[data-slot=dot-grid-highlight]") as HTMLElement | null;
  return { ...view, layer, highlight, hero: view.getByTestId("hero") };
}

describe("DotGrid", () => {
  it("is a layer behind the section: hidden from screen readers and ignoring the pointer", () => {
    const { layer } = renderHero();
    expect(layer.getAttribute("aria-hidden")).toBe("true");
    for (const name of ["pointer-events-none", "absolute", "inset-0", "-z-10", "overflow-hidden"]) {
      expect(layer.classList).toContain(name);
    }
  });

  it("draws dots at the given spacing, size and opacity, in the text colour", () => {
    const { layer } = renderHero({ size: 24, dotSize: 3, opacity: 0.6 });
    expect(layer.style.backgroundSize).toBe("24px 24px");
    expect(layer.style.backgroundImage).toMatch(/currentcolor 1px, transparent 2px/i);
    expect(layer.style.opacity).toBe("0.6");
    expect(layer.classList).toContain("text-muted-foreground");
  });

  it("fades out towards the edges, unless fade is off", () => {
    const faded = renderHero();
    expect(faded.layer.style.maskImage).toContain("radial-gradient");
    faded.unmount();
    const { layer } = renderHero({ fade: false });
    expect(layer.style.maskImage).toBe("");
  });

  it("takes a text colour class in place of the default", () => {
    const { layer } = renderHero({ className: "text-primary" });
    expect(layer.classList).toContain("text-primary");
    expect(layer.classList).not.toContain("text-muted-foreground");
  });

  it("only has a pointer highlight when asked", () => {
    expect(renderHero().highlight).toBeNull();
  });

  it("brightens the dots under the mouse, and lets them go when it leaves", async () => {
    const { hero, highlight } = renderHero({ highlight: true });
    expect(highlight).not.toBeNull();
    const node = highlight as HTMLElement;
    expect(Number(node.style.opacity)).toBe(0);

    fireEvent.pointerMove(hero, { pointerType: "mouse", clientX: 120, clientY: 80 });
    await vi.waitFor(() => expect(Number(node.style.opacity)).toBe(1));
    // Centred on the pointer: the window is 2 × 160px across at the default 16px spacing
    expect(node.style.transform).toContain("translateX(-40px)");
    expect(node.style.transform).toContain("translateY(-80px)");

    fireEvent.pointerLeave(hero, { pointerType: "mouse" });
    await vi.waitFor(() => expect(Number(node.style.opacity)).toBe(0));
  });

  it("ignores touch, which has no hover", async () => {
    const { hero, highlight } = renderHero({ highlight: true });
    fireEvent.pointerMove(hero, { pointerType: "touch", clientX: 120, clientY: 80 });
    await pause(100);
    expect(Number((highlight as HTMLElement).style.opacity)).toBe(0);
  });

  it("never shows the highlight with reduced motion", async () => {
    motionPreference.reduce = true;
    const { hero, highlight } = renderHero({ highlight: true });
    fireEvent.pointerMove(hero, { pointerType: "mouse", clientX: 120, clientY: 80 });
    await pause(100);
    expect(Number((highlight as HTMLElement).style.opacity)).toBe(0);
  });

  it("has no accessibility violations in a section", async () => {
    const { container } = renderHero({ highlight: true });
    expect(await axeViolations(container)).toEqual([]);
  });
});
