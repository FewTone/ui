import { TextReveal, TextShimmer, Typewriter } from "@fewtone/ui/components/text-effects/text-effects";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

// Reduced motion, switched per test (motion reads the media query once, so it's stubbed at the hook)
const motionPreference = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => motionPreference.reduce,
}));

// jsdom has no Web Animations API: record what each effect asks for
type FakeAnimation = {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  target: Element;
  startTime: number | null;
  cancel: ReturnType<typeof vi.fn>;
};
let animations: FakeAnimation[] = [];
function animate(this: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  const animation: FakeAnimation = { keyframes, options, target: this, startTime: null, cancel: vi.fn() };
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
const watchView = () =>
  Object.defineProperty(globalThis, "IntersectionObserver", {
    value: FakeObserver,
    configurable: true,
    writable: true,
  });

const original = Object.getOwnPropertyDescriptor(Element.prototype, "animate");

beforeEach(() => {
  Object.defineProperty(Element.prototype, "animate", { value: animate, configurable: true, writable: true });
});

afterEach(() => {
  if (original) Object.defineProperty(Element.prototype, "animate", original);
  else Reflect.deleteProperty(Element.prototype, "animate");
  Reflect.deleteProperty(globalThis, "IntersectionObserver");
  vi.useRealTimers();
  animations = [];
  observed = null;
  motionPreference.reduce = false;
});

/** Steps fake time forward in small slices, so each timer the typing sets in an effect gets to fire */
function run(ms: number) {
  for (let elapsed = 0; elapsed < ms; elapsed += 10) {
    act(() => {
      vi.advanceTimersByTime(10);
    });
  }
}

describe("TextShimmer", () => {
  it("keeps one readable copy of the text; the light is a hidden copy", () => {
    const { container } = render(<TextShimmer>Generating a reply</TextShimmer>);
    const text = screen.getByText("Generating a reply", { ignore: "[aria-hidden=true] *" });
    expect(text.getAttribute("data-slot")).toBe("text-shimmer");
    expect(screen.getAllByText("Generating a reply")).toHaveLength(2);
    expect(container.querySelector("[aria-hidden=true]")).not.toBeNull();
  });

  it("sweeps the light across while its copy holds still, in step with every other sheen", () => {
    render(<TextShimmer>Generating a reply</TextShimmer>);
    expect(animations).toHaveLength(2);
    const [light, copy] = animations;
    expect(light?.keyframes.map((frame) => frame.translate)).toEqual(["-100%", "100%", "100%"]);
    // The copy goes back as far as the light goes on, so the letters never move
    expect(copy?.keyframes.map((frame) => frame.translate)).toEqual(["100%", "-100%", "-100%"]);
    expect(light?.options.iterations).toBe(Number.POSITIVE_INFINITY);
    expect(animations.map((animation) => animation.startTime)).toEqual([0, 0]);
  });

  it("stays still with reduced motion, and stops when it unmounts", () => {
    motionPreference.reduce = true;
    render(<TextShimmer>Still</TextShimmer>);
    expect(animations).toHaveLength(0);
    motionPreference.reduce = false;
    const { unmount } = render(<TextShimmer>Moving</TextShimmer>);
    const made = [...animations];
    unmount();
    expect(made.every((animation) => animation.cancel.mock.calls.length > 0)).toBe(true);
  });
});

describe("TextReveal", () => {
  it("is real text for screen readers, in the element you ask for", () => {
    const { container } = render(<TextReveal as="h2">Ship it this afternoon</TextReveal>);
    expect(screen.getByRole("heading", { level: 2, name: "Ship it this afternoon" })).toBeTruthy();
    const pieces = container.querySelector("[data-slot=text-reveal-text]");
    expect(pieces?.getAttribute("aria-hidden")).toBe("true");
  });

  it("raises each word through the blur, 0.05s apart", () => {
    const { container } = render(
      <TextReveal startOnView={false} delay={0.1}>
        Ship it this afternoon
      </TextReveal>,
    );
    expect(animations).toHaveLength(4);
    expect(animations[0]?.keyframes[0]).toMatchObject({
      opacity: 0,
      filter: "blur(6px)",
      transform: "translateY(12px)",
    });
    expect(animations.map((animation) => animation.options.delay)).toEqual([100, 150, 200, 250]);
    expect(animations.every((animation) => animation.options.fill === "backwards")).toBe(true);
    // The animations hold the pieces now; their inline opacity is gone
    const pieces = Array.from(container.querySelectorAll<HTMLElement>("[data-slot=text-reveal-piece]"));
    expect(pieces.map((piece) => piece.textContent)).toEqual(["Ship", "it", "this", "afternoon"]);
    expect(pieces.every((piece) => piece.style.opacity === "")).toBe(true);
  });

  it("goes character by character, keeping each word whole", () => {
    const { container } = render(
      <TextReveal by="character" startOnView={false}>
        Calm UI
      </TextReveal>,
    );
    expect(animations).toHaveLength(6);
    expect(container.querySelectorAll(".whitespace-nowrap")).toHaveLength(2);
  });

  it("waits, hidden, until it scrolls into view", () => {
    watchView();
    const { container } = render(<TextReveal>Ship it</TextReveal>);
    const pieces = Array.from(container.querySelectorAll<HTMLElement>("[data-slot=text-reveal-piece]"));
    expect(animations).toHaveLength(0);
    expect(pieces.every((piece) => piece.style.opacity === "0")).toBe(true);
    act(() => observed?.([{ isIntersecting: true }]));
    expect(animations).toHaveLength(2);
  });

  it("is simply there with reduced motion", () => {
    motionPreference.reduce = true;
    const { container } = render(<TextReveal>Ship it</TextReveal>);
    expect(animations).toHaveLength(0);
    const pieces = Array.from(container.querySelectorAll<HTMLElement>("[data-slot=text-reveal-piece]"));
    expect(pieces.every((piece) => piece.style.opacity === "")).toBe(true);
  });
});

describe("Typewriter", () => {
  it("types each phrase, deletes it and types the next", () => {
    vi.useFakeTimers();
    const { container } = render(<Typewriter phrases={["forms", "menus"]} />);
    const typed = () => container.querySelector("[data-slot=typewriter-text]")?.textContent;
    expect(typed()).toBe("");
    run(200);
    expect(typed()?.length).toBeGreaterThan(0);
    expect("forms".startsWith(typed() ?? "-")).toBe(true);
    run(300);
    expect(typed()).toBe("forms");
    // Held for 2s, deleted, then a pause before the next phrase
    run(2000 + 250 + 400 + 450);
    expect(typed()).toBe("menus");
  });

  it("says every phrase once to screen readers, and never announces the typing", () => {
    const { container } = render(<Typewriter phrases={["forms", "menus", "dialogs"]} />);
    expect(screen.getByText("forms, menus, dialogs").className).toContain("sr-only");
    expect(container.querySelector("[data-slot=typewriter-text]")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("[data-slot=typewriter-caret]")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("[aria-live]")).toBeNull();
  });

  it("breathes the caret while it waits and keeps it solid while it types", () => {
    vi.useFakeTimers();
    render(<Typewriter phrases="Hi" delay={0.5} />);
    // Waiting for the first character: the caret breathes
    expect(animations.at(-1)?.options.iterations).toBe(Number.POSITIVE_INFINITY);
    run(520);
    // Typing: the breath stops
    expect(animations.at(-1)?.cancel).toHaveBeenCalled();
  });

  it("fades the caret away after typing a single phrase once", () => {
    vi.useFakeTimers();
    render(<Typewriter phrases="Hi" />);
    run(2500);
    const fade = animations.at(-1);
    expect(fade?.keyframes.at(-1)?.opacity).toBe(0);
    expect(fade?.options.fill).toBe("forwards");
  });

  it("shows the first phrase, without a caret, with reduced motion", () => {
    motionPreference.reduce = true;
    const { container } = render(<Typewriter phrases={["forms", "menus"]} />);
    expect(container.querySelector("[data-slot=typewriter-text]")?.textContent).toBe("forms");
    expect(container.querySelector("[data-slot=typewriter-caret]")).toBeNull();
  });
});

describe("Text Effects", () => {
  it("have no accessibility violations", async () => {
    const { container } = render(
      <div>
        <TextShimmer>Generating a reply</TextShimmer>
        <TextReveal as="h2" startOnView={false}>
          Ship it this afternoon
        </TextReveal>
        <p>
          Build <Typewriter phrases={["forms", "menus"]} />
        </p>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
