import { Marquee } from "@fewtone/ui/components/marquee/marquee";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

// Reduced motion, switched per test (motion reads the media query once, so it's stubbed at the hook)
const motionPreference = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => motionPreference.reduce,
}));

// jsdom has no Web Animations API: record the loop
type FakeAnimation = {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  playState: string;
  playbackRate: number;
  currentTime: number | null;
  pause: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
  cancel: ReturnType<typeof vi.fn>;
};
let animations: FakeAnimation[] = [];
function animate(keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  const animation: FakeAnimation = {
    keyframes,
    options,
    playState: "running",
    playbackRate: 1,
    currentTime: 0,
    pause: vi.fn(() => {
      animation.playState = "paused";
    }),
    play: vi.fn(() => {
      animation.playState = "running";
    }),
    cancel: vi.fn(() => {
      animation.playState = "idle";
    }),
  };
  animations.push(animation);
  return animation;
}

// jsdom has no IntersectionObserver either: hand the test its callback
let observed: ((entries: Partial<IntersectionObserverEntry>[]) => void) | null = null;
class FakeObserver {
  constructor(callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
    observed = callback;
  }
  observe() {}
  disconnect() {}
}

// jsdom has no layout: each copy is 200px along (one copy and its gap), and the row is 500px wide
const descriptors = ["animate", "offsetLeft", "offsetTop", "clientWidth", "clientHeight"].map(
  (name) =>
    [
      name,
      Object.getOwnPropertyDescriptor(name === "animate" ? Element.prototype : HTMLElement.prototype, name),
    ] as const,
);
function along(this: HTMLElement) {
  if (this.dataset.slot !== "marquee-group") return 0;
  return Array.from(this.parentElement?.children ?? []).indexOf(this) * 200;
}
function room(this: HTMLElement) {
  return this.dataset.slot === "marquee" ? 500 : 0;
}

beforeEach(() => {
  Object.defineProperty(Element.prototype, "animate", { value: animate, configurable: true, writable: true });
  for (const name of ["offsetLeft", "offsetTop"]) {
    Object.defineProperty(HTMLElement.prototype, name, { get: along, configurable: true });
  }
  for (const name of ["clientWidth", "clientHeight"]) {
    Object.defineProperty(HTMLElement.prototype, name, { get: room, configurable: true });
  }
  Object.defineProperty(globalThis, "IntersectionObserver", {
    value: FakeObserver,
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  for (const [name, descriptor] of descriptors) {
    const owner = name === "animate" ? Element.prototype : HTMLElement.prototype;
    if (descriptor) Object.defineProperty(owner, name, descriptor);
    else Reflect.deleteProperty(owner, name);
  }
  Reflect.deleteProperty(globalThis, "IntersectionObserver");
  Reflect.deleteProperty(document, "visibilityState");
  animations = [];
  observed = null;
  motionPreference.reduce = false;
});

function Logos(props: Partial<Parameters<typeof Marquee>[0]>) {
  return (
    <Marquee {...props}>
      <a href="#northwind">Northwind</a>
      <a href="#atlas">Atlas</a>
      <a href="#vertex">Vertex</a>
    </Marquee>
  );
}

const groups = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("[data-slot=marquee-group]"));
const loop = () => animations.at(-1) as FakeAnimation;

describe("Marquee", () => {
  it("repeats the items to fill the row, hiding the copies from screen readers and the keyboard", () => {
    const { container } = render(<Logos />);
    // 500px of row and 200px a copy: three to cover it, and one to spare
    const copies = groups(container);
    expect(copies).toHaveLength(4);
    expect(copies[0]?.getAttribute("aria-hidden")).toBeNull();
    expect(copies[0]?.hasAttribute("inert")).toBe(false);
    for (const copy of copies.slice(1)) {
      expect(copy.getAttribute("aria-hidden")).toBe("true");
      expect(copy.hasAttribute("inert")).toBe(true);
    }
    // Each item is met once
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("loops one copy's length, linear and endless, at its speed", () => {
    render(<Logos speed={50} />);
    expect(loop().keyframes.map((frame) => frame.transform)).toEqual([
      "translateX(0px)",
      "translateX(-200px)",
    ]);
    expect(loop().options.duration).toBe(4000);
    expect(loop().options.iterations).toBe(Number.POSITIVE_INFINITY);
    expect(loop().options.easing).toBe("linear");
  });

  it("runs the other way to the right, and on the other axis up and down", () => {
    const { unmount } = render(<Logos direction="right" />);
    expect(loop().keyframes.map((frame) => frame.transform)).toEqual([
      "translateX(-200px)",
      "translateX(0px)",
    ]);
    unmount();
    render(<Logos direction="up" className="h-72" />);
    expect(loop().keyframes.map((frame) => frame.transform)).toEqual([
      "translateY(0px)",
      "translateY(-200px)",
    ]);
  });

  it("slows to a stop when paused, and picks up again from where it stopped", async () => {
    const { rerender } = render(<Logos />);
    expect(loop().playState).toBe("running");
    rerender(<Logos paused />);
    // While it slows it's paused and stepped by hand, so its time creeps on, then holds
    expect(loop().playState).toBe("paused");
    await waitFor(() => expect(loop().currentTime).toBeGreaterThan(0));
    await new Promise((resolve) => setTimeout(resolve, 500));
    const stopped = loop().currentTime ?? 0;
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(loop().currentTime).toBe(stopped);
    rerender(<Logos />);
    // Picking up never jumps: it moves on from the stopped place, then runs by itself
    await waitFor(() => expect(loop().playState).toBe("running"));
    expect(loop().currentTime ?? 0).toBeGreaterThanOrEqual(stopped);
    expect(loop().playbackRate).toBe(1);
  });

  it("starts stopped when it mounts paused, without gliding", () => {
    const { container } = render(<Logos paused />);
    expect(loop().playState).toBe("paused");
    expect(loop().currentTime).toBe(0);
    expect(container.querySelector("[data-slot=marquee]")?.hasAttribute("data-paused")).toBe(true);
  });

  it("slows to a stop on hover and while a link inside has focus", async () => {
    const user = userEvent.setup();
    const { container } = render(<Logos />);
    const marquee = container.querySelector("[data-slot=marquee]") as HTMLElement;
    await user.hover(marquee);
    expect(loop().playState).toBe("paused");
    await user.unhover(marquee);
    await waitFor(() => expect(loop().playState).toBe("running"));
    await user.tab();
    expect(document.activeElement?.textContent).toBe("Northwind");
    expect(loop().playState).toBe("paused");
  });

  it("doesn't slow on hover with pauseOnHover off", async () => {
    const user = userEvent.setup();
    const { container } = render(<Logos pauseOnHover={false} />);
    await user.hover(container.querySelector("[data-slot=marquee]") as HTMLElement);
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(loop().playState).toBe("running");
    expect(loop().pause).not.toHaveBeenCalled();
  });

  it("rests off-screen and while the tab is hidden", () => {
    render(<Logos />);
    act(() => observed?.([{ isIntersecting: false }]));
    expect(loop().pause).toHaveBeenCalledTimes(1);
    act(() => observed?.([{ isIntersecting: true }]));
    expect(loop().play).toHaveBeenCalledTimes(1);
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(loop().pause).toHaveBeenCalledTimes(2);
  });

  it("is a still row you can scroll with reduced motion", () => {
    motionPreference.reduce = true;
    const { container } = render(<Logos />);
    expect(groups(container)).toHaveLength(1);
    expect(animations).toHaveLength(0);
    const marquee = container.querySelector("[data-slot=marquee]") as HTMLElement;
    expect(marquee.className).toContain("overflow-x-auto");
    expect(marquee.tabIndex).toBe(0);
    expect(marquee.style.maskImage).toBe("");
  });

  it("cancels the loop when it unmounts", () => {
    const { unmount } = render(<Logos />);
    const animation = loop();
    unmount();
    expect(animation.cancel).toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Logos />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
