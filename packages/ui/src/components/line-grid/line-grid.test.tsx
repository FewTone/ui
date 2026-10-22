import { LineGrid } from "@fewtone/ui/components/line-grid/line-grid";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

// Reduced motion, switched per test (motion reads the media query once, so it's stubbed at the hook)
const motionPreference = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => motionPreference.reduce,
}));

// jsdom has no Web Animations API: record what the pan asks for
type FakeAnimation = {
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  cancel: ReturnType<typeof vi.fn>;
};
let animations: FakeAnimation[] = [];
const animate = vi.fn((_keyframes: Keyframe[], _options: KeyframeAnimationOptions) => {
  const animation = { play: vi.fn(), pause: vi.fn(), cancel: vi.fn() };
  animations.push(animation);
  return animation;
});
const originalAnimate = Object.getOwnPropertyDescriptor(Element.prototype, "animate");

// Nor IntersectionObserver: keep each observer, so a test can say the grid left the screen
type FakeObserver = { callback: IntersectionObserverCallback; disconnect: ReturnType<typeof vi.fn> };
let observers: FakeObserver[] = [];
const originalObserver = globalThis.IntersectionObserver;
class StubObserver {
  callback: IntersectionObserverCallback;
  disconnect = vi.fn();
  observe = vi.fn();
  unobserve = vi.fn();
  takeRecords = () => [];
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    observers.push(this);
  }
}

beforeEach(() => {
  Object.defineProperty(Element.prototype, "animate", { value: animate, configurable: true, writable: true });
  globalThis.IntersectionObserver = StubObserver as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  // Put them back the way they were (jsdom has neither)
  if (originalAnimate) Object.defineProperty(Element.prototype, "animate", originalAnimate);
  else Reflect.deleteProperty(Element.prototype, "animate");
  if (originalObserver) globalThis.IntersectionObserver = originalObserver;
  else Reflect.deleteProperty(globalThis, "IntersectionObserver");
  Reflect.deleteProperty(document, "hidden");
  animate.mockClear();
  animations = [];
  observers = [];
  motionPreference.reduce = false;
});

function renderHero(props: Parameters<typeof LineGrid>[0] = {}) {
  const view = render(
    <section className="relative isolate">
      <LineGrid {...props} />
      <h2>Ship your next idea</h2>
    </section>,
  );
  const layer = view.container.querySelector("[data-slot=line-grid]") as HTMLElement;
  const lines = view.container.querySelector("[data-slot=line-grid-lines]") as HTMLElement;
  return { ...view, layer, lines };
}

const seen = (observer: FakeObserver | undefined, isIntersecting: boolean) =>
  act(() =>
    observer?.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      observer as unknown as IntersectionObserver,
    ),
  );

describe("LineGrid", () => {
  it("is a layer behind the section: hidden from screen readers and ignoring the pointer", () => {
    const { layer } = renderHero();
    expect(layer.getAttribute("aria-hidden")).toBe("true");
    for (const name of ["pointer-events-none", "absolute", "inset-0", "-z-10", "overflow-hidden"]) {
      expect(layer.classList).toContain(name);
    }
    expect(layer.classList).toContain("text-border");
  });

  it("draws lines every cell, on a layer one cell larger up and to the left", () => {
    const { layer, lines } = renderHero({ size: 32, opacity: 0.5 });
    expect(lines.style.backgroundSize).toBe("32px 32px");
    expect(lines.style.backgroundImage).toMatch(/linear-gradient\(to right, currentcolor 1px/i);
    expect(lines.style.top).toBe("-32px");
    expect(lines.style.left).toBe("-32px");
    expect(layer.style.opacity).toBe("0.5");
  });

  it("fades out towards the edges, unless fade is off", () => {
    const faded = renderHero();
    expect(faded.layer.style.maskImage).toContain("radial-gradient");
    faded.unmount();
    expect(renderHero({ fade: false }).layer.style.maskImage).toBe("");
  });

  it("stays still unless asked to pan", () => {
    renderHero();
    expect(animate).not.toHaveBeenCalled();
  });

  it("pans one cell and loops, a cell every 12 seconds at speed 1", () => {
    renderHero({ size: 32, pan: true });
    expect(animate).toHaveBeenCalledTimes(1);
    const [keyframes, options] = animate.mock.calls[0] as [Keyframe[], KeyframeAnimationOptions];
    expect(keyframes[0]?.transform).toBe("translate(0px, 0px)");
    expect(keyframes.at(-1)?.transform).toBe("translate(32px, 32px)");
    expect(options).toMatchObject({
      duration: 12000,
      iterations: Number.POSITIVE_INFINITY,
      easing: "linear",
    });
  });

  it("pans faster with a higher speed, and not at all at speed 0", () => {
    const fast = renderHero({ pan: true, speed: 2 });
    expect((animate.mock.calls[0] as [Keyframe[], KeyframeAnimationOptions])[1].duration).toBe(6000);
    fast.unmount();
    animate.mockClear();
    renderHero({ pan: true, speed: 0 });
    expect(animate).not.toHaveBeenCalled();
  });

  it("pauses off-screen and while the tab is hidden", () => {
    renderHero({ pan: true });
    const animation = animations[0];
    seen(observers[0], false);
    expect(animation?.pause).toHaveBeenCalledTimes(1);
    seen(observers[0], true);
    expect(animation?.play).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(animation?.pause).toHaveBeenCalledTimes(2);
  });

  it("stops the pan and the observer when it unmounts", () => {
    const { unmount } = renderHero({ pan: true });
    unmount();
    expect(animations[0]?.cancel).toHaveBeenCalled();
    expect(observers[0]?.disconnect).toHaveBeenCalled();
  });

  it("stays still with reduced motion", () => {
    motionPreference.reduce = true;
    renderHero({ pan: true });
    expect(animate).not.toHaveBeenCalled();
  });

  it("has no accessibility violations in a section", async () => {
    const { container } = renderHero({ pan: true });
    expect(await axeViolations(container)).toEqual([]);
  });
});
