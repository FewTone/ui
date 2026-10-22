import { GradientDrift } from "@fewtone/ui/components/gradient-drift/gradient-drift";
import { act, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

// Reduced motion, switched per test (motion reads the media query once, so it's stubbed at the hook)
const motionPreference = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => motionPreference.reduce,
}));

// jsdom has no Web Animations API: record what the drift asks for
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

// Nor IntersectionObserver: keep each observer, so a test can say the field left the screen
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

function renderHero(props: Parameters<typeof GradientDrift>[0] = {}) {
  const view = render(
    <section className="relative isolate">
      <GradientDrift {...props} />
      <h2>Ship your next idea</h2>
    </section>,
  );
  const layer = view.container.querySelector("[data-slot=gradient-drift]") as HTMLElement;
  const blobs = Array.from(view.container.querySelectorAll<HTMLElement>("[data-slot=gradient-drift-blob]"));
  return { ...view, layer, blobs };
}

const seen = (observer: FakeObserver | undefined, isIntersecting: boolean) =>
  act(() =>
    observer?.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      observer as unknown as IntersectionObserver,
    ),
  );

describe("GradientDrift", () => {
  it("is a layer behind the section: hidden from screen readers and ignoring the pointer", () => {
    const { layer } = renderHero();
    expect(layer.getAttribute("aria-hidden")).toBe("true");
    for (const name of ["pointer-events-none", "absolute", "inset-0", "-z-10", "overflow-hidden"]) {
      expect(layer.classList).toContain(name);
    }
  });

  it("is three soft neutral pools at 5% by default, with the blur baked into a gradient", () => {
    const { layer, blobs } = renderHero();
    expect(layer.style.opacity).toBe("0.05");
    expect(blobs).toHaveLength(3);
    expect(blobs.map((blob) => blob.classList.contains("text-foreground"))).toEqual([true, false, true]);
    expect(blobs[1]?.classList).toContain("text-muted-foreground");
    for (const blob of blobs) {
      expect(blob.style.backgroundImage).toMatch(/^radial-gradient\(closest-side/);
      expect(blob.style.filter).toBe("");
    }
  });

  it("takes the primary colour with tone, and an opacity", () => {
    const { layer, blobs } = renderHero({ tone: "primary", opacity: 0.08 });
    expect(layer.dataset.tone).toBe("primary");
    expect(layer.style.opacity).toBe("0.08");
    for (const blob of blobs) expect(blob.classList).toContain("text-primary");
  });

  it("drifts each pool there and back, slowly and at its own pace", () => {
    renderHero();
    expect(animate).toHaveBeenCalledTimes(3);
    const calls = animate.mock.calls as [Keyframe[], KeyframeAnimationOptions][];
    expect(calls.map(([, options]) => options.duration)).toEqual([20000, 26000, 34000]);
    for (const [keyframes, options] of calls) {
      expect(keyframes[0]?.transform).toBe("translate(0%, 0%) scale(1)");
      expect(options).toMatchObject({ direction: "alternate", iterations: Number.POSITIVE_INFINITY });
    }
  });

  it("drifts faster with a higher speed, and not at all at speed 0", () => {
    const fast = renderHero({ speed: 2 });
    expect((animate.mock.calls[0] as [Keyframe[], KeyframeAnimationOptions])[1].duration).toBe(10000);
    fast.unmount();
    animate.mockClear();
    renderHero({ speed: 0 });
    expect(animate).not.toHaveBeenCalled();
  });

  it("pauses off-screen and while the tab is hidden", () => {
    renderHero();
    seen(observers[0], false);
    for (const animation of animations) expect(animation.pause).toHaveBeenCalledTimes(1);
    seen(observers[0], true);
    for (const animation of animations) expect(animation.play).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    for (const animation of animations) expect(animation.pause).toHaveBeenCalledTimes(2);
  });

  it("stops the drift and the observer when it unmounts", () => {
    const { unmount } = renderHero();
    unmount();
    for (const animation of animations) expect(animation.cancel).toHaveBeenCalled();
    expect(observers[0]?.disconnect).toHaveBeenCalled();
  });

  it("stays still with reduced motion", () => {
    motionPreference.reduce = true;
    renderHero();
    expect(animate).not.toHaveBeenCalled();
  });

  it("passes its ref through", () => {
    const ref = createRef<HTMLDivElement>();
    render(<GradientDrift ref={ref} />);
    expect(ref.current?.dataset.slot).toBe("gradient-drift");
  });

  it("has no accessibility violations in a section", async () => {
    const { container } = renderHero();
    expect(await axeViolations(container)).toEqual([]);
  });
});
