import { revealTheme, ThemeToggle } from "@fewtone/ui/components/theme-toggle/theme-toggle";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "next-themes";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function renderToggle(props: Parameters<typeof ThemeToggle>[0] = {}) {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ThemeToggle {...props} />
    </ThemeProvider>,
  );
}

/** A stand-in for the View Transitions API: runs the update at once and records each reveal's keyframes */
function stubViewTransitions() {
  const animations: { keyframes: Keyframe[]; options: KeyframeAnimationOptions }[] = [];
  document.documentElement.animate = ((keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
    animations.push({ keyframes, options });
    return { cancel: () => {} };
  }) as unknown as typeof document.documentElement.animate;
  const start = vi.fn((update: () => void) => {
    update();
    return {
      ready: Promise.resolve(),
      finished: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition: () => {},
    };
  });
  document.startViewTransition = start as unknown as typeof document.startViewTransition;
  return { animations, start };
}

afterEach(() => {
  Reflect.deleteProperty(document, "startViewTransition");
  Reflect.deleteProperty(document.documentElement, "animate");
  document.documentElement.className = "";
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("ThemeToggle", () => {
  it("names the theme it switches to, and switches when clicked", async () => {
    renderToggle();
    await userEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeTruthy();
  });

  it("applies the theme inside the view transition and reveals it on the new snapshot", async () => {
    const { animations, start } = stubViewTransitions();
    renderToggle({ reveal: "circle", speed: 300 });
    await userEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(start).toHaveBeenCalledTimes(1);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    await Promise.resolve();
    expect(animations).toHaveLength(1);
    expect(animations[0]?.options).toMatchObject({
      duration: 300,
      pseudoElement: "::view-transition-new(root)",
    });
    expect(animations[0]?.keyframes[0]?.clipPath).toMatch(/^circle\(0\.0px at /);
  });

  it("switches instantly when reduced motion is on", () => {
    const { start } = stubViewTransitions();
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) => ({ matches: query.includes("reduce"), media: query }) as MediaQueryList,
    );
    const setTheme = vi.fn();
    expect(revealTheme({ theme: "dark", setTheme, reveal: "ink" })).toBeUndefined();
    expect(setTheme).toHaveBeenCalledWith("dark");
    expect(start).not.toHaveBeenCalled();
  });

  it("never picks the same random reveal twice in a row", async () => {
    const { animations } = stubViewTransitions();
    // Ink has 20 keyframes and Tide 28, so the count tells them apart
    for (let index = 0; index < 6; index++) {
      revealTheme({ theme: index % 2 ? "light" : "dark", setTheme: () => {}, reveal: ["ink", "tide"] });
      await Promise.resolve();
    }
    const picks = animations.map((animation) => animation.keyframes.length);
    expect(picks).toHaveLength(6);
    for (let index = 1; index < picks.length; index++) expect(picks[index]).not.toBe(picks[index - 1]);
  });

  it("has no accessibility violations", async () => {
    const { container } = renderToggle();
    expect(await axeViolations(container)).toEqual([]);
  });
});
