import { Skeleton } from "@fewtone/ui/components/skeleton/skeleton";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

// Reduced motion, switched per test (motion reads the media query once, so it's stubbed at the hook)
const motionPreference = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => motionPreference.reduce,
}));

// jsdom has no Web Animations API: record what the sheen asks for
type FakeAnimation = { startTime: number | null; cancel: ReturnType<typeof vi.fn> };
let animations: FakeAnimation[] = [];
const animate = vi.fn(() => {
  const animation = { startTime: null, cancel: vi.fn() };
  animations.push(animation);
  return animation;
});

const original = Object.getOwnPropertyDescriptor(Element.prototype, "animate");

beforeEach(() => {
  Object.defineProperty(Element.prototype, "animate", { value: animate, configurable: true, writable: true });
});

afterEach(() => {
  // Put it back the way it was (jsdom has none)
  if (original) Object.defineProperty(Element.prototype, "animate", original);
  else Reflect.deleteProperty(Element.prototype, "animate");
  animate.mockClear();
  animations = [];
  motionPreference.reduce = false;
});

describe("Skeleton", () => {
  it("is a muted block hidden from screen readers, shaped by its classes", () => {
    const { container } = render(<Skeleton className="size-10 rounded-full" />);
    const skeleton = container.querySelector("[data-slot=skeleton]") as HTMLElement;
    expect(skeleton.getAttribute("aria-hidden")).toBe("true");
    expect(skeleton.className).toContain("bg-muted");
    expect(skeleton.className).toContain("rounded-full");
    expect(skeleton.className).not.toContain("rounded-md");
    expect(skeleton.querySelector("[data-slot=skeleton-sheen]")).not.toBeNull();
  });

  it("sweeps a sheen across, every skeleton counted from the page's start", () => {
    render(
      <>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-24" />
      </>,
    );
    expect(animate).toHaveBeenCalledTimes(2);
    const [keyframes, options] = animate.mock.calls[0] as unknown as [Keyframe[], KeyframeAnimationOptions];
    expect(keyframes[0]?.translate).toBe("-100%");
    expect(keyframes.at(-1)?.translate).toBe("100%");
    expect(options.iterations).toBe(Number.POSITIVE_INFINITY);
    // In step: both start at the document timeline's zero
    expect(animations.map((animation) => animation.startTime)).toEqual([0, 0]);
  });

  it("stops the sheen when it unmounts", () => {
    const { unmount } = render(<Skeleton className="h-4 w-40" />);
    unmount();
    expect(animations[0]?.cancel).toHaveBeenCalled();
  });

  it("stays still with reduced motion", () => {
    motionPreference.reduce = true;
    render(<Skeleton className="h-4 w-40" />);
    expect(animate).not.toHaveBeenCalled();
  });

  it("has no accessibility violations inside a loading region", async () => {
    const { container } = render(
      <div aria-busy="true">
        <span className="sr-only">Loading profile</span>
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
