import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@fewtone/ui/components/avatar/avatar";
import { act, render, screen } from "@testing-library/react";
import { animate } from "motion/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

// Reduced motion, switched per test, and a spy on the picture's entrance
const motionPreference = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return { ...actual, useReducedMotion: () => motionPreference.reduce, animate: vi.fn(actual.animate) };
});

/**
 * jsdom never loads images, so Radix would wait forever. This stand-in loads (or fails) on the next tick, or at
 * once when `cached`, like a picture the browser already has.
 */
class FakeImage {
  static mode: "load" | "fail" | "cached" = "load";
  complete = false;
  naturalWidth = 0;
  referrerPolicy = "";
  crossOrigin: string | null = null;
  private listeners = new Map<string, (event: { currentTarget: FakeImage }) => void>();
  addEventListener(type: string, listener: (event: { currentTarget: FakeImage }) => void) {
    this.listeners.set(type, listener);
  }
  removeEventListener(type: string) {
    this.listeners.delete(type);
  }
  set src(_value: string) {
    const settle = () => {
      this.complete = true;
      if (FakeImage.mode === "fail") return this.listeners.get("error")?.({ currentTarget: this });
      this.naturalWidth = 40;
      this.listeners.get("load")?.({ currentTarget: this });
    };
    if (FakeImage.mode === "cached") {
      this.complete = true;
      this.naturalWidth = 40;
    } else setTimeout(settle, 0);
  }
}

beforeEach(() => {
  vi.stubGlobal("Image", FakeImage);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(animate).mockClear();
  FakeImage.mode = "load";
  motionPreference.reduce = false;
});

function Olivia({ src = "/olivia.png", alt = "Olivia Martin" }: { src?: string; alt?: string }) {
  return (
    <Avatar>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>OM</AvatarFallback>
    </Avatar>
  );
}

const fallbackOf = (container: HTMLElement) => container.querySelector("[data-slot=avatar-fallback]");

describe("Avatar", () => {
  it("shows the initials, named by the picture's alt, until the picture comes in through the blur", async () => {
    const { container } = render(<Olivia />);
    const standIn = screen.getByRole("img", { name: "Olivia Martin" });
    expect(standIn.dataset.slot).toBe("avatar-fallback");
    expect(standIn.textContent).toBe("OM");

    // Loaded: the picture comes in over the initials, which are only seen now, not read
    await vi.waitFor(() => expect(screen.getByRole("img", { name: "Olivia Martin" }).tagName).toBe("IMG"));
    expect(vi.mocked(animate).mock.calls[0]?.[1]).toMatchObject({ filter: ["blur(6px)", "blur(0px)"] });

    // Once it's sharp, the initials go, and no filter is left on the picture
    await vi.waitFor(() => expect(fallbackOf(container)).toBeNull());
    const image = screen.getByRole("img", { name: "Olivia Martin" });
    expect(image.dataset.slot).toBe("avatar-image");
    expect(image.style.filter).toBe("");
  });

  it("shows a picture that's ready on its first paint at once, without the entrance", () => {
    FakeImage.mode = "cached";
    const { container } = render(<Olivia />);
    expect(screen.getByRole("img", { name: "Olivia Martin" }).tagName).toBe("IMG");
    expect(fallbackOf(container)).toBeNull();
    expect(animate).not.toHaveBeenCalled();
  });

  it("brings a picture in over server-rendered initials, even when it's ready at once", async () => {
    FakeImage.mode = "cached";
    const container = document.createElement("div");
    container.innerHTML = renderToString(<Olivia />);
    document.body.appendChild(container);
    // The server painted the initials
    expect(fallbackOf(container)?.textContent).toBe("OM");
    const root = await act(async () => hydrateRoot(container, <Olivia />));
    await vi.waitFor(() => expect(container.querySelector("img")).not.toBeNull());
    expect(animate).toHaveBeenCalled();
    act(() => root.unmount());
    container.remove();
  });

  it("only fades the picture in with reduced motion", async () => {
    motionPreference.reduce = true;
    const { container } = render(<Olivia />);
    await vi.waitFor(() => expect(container.querySelector("img")).not.toBeNull());
    expect(vi.mocked(animate).mock.calls[0]?.[1]).toEqual({ opacity: [0, 1] });
  });

  it("keeps the initials, still named, when the picture fails or is missing", async () => {
    FakeImage.mode = "fail";
    const { container } = render(
      <>
        <Olivia />
        <Avatar>
          <AvatarImage alt="Jackson Lee" />
          <AvatarFallback>JL</AvatarFallback>
        </Avatar>
      </>,
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Olivia Martin" }).textContent).toBe("OM");
    expect(screen.getByRole("img", { name: "Jackson Lee" }).textContent).toBe("JL");
  });

  it('hides the initials from screen readers with alt=""', () => {
    FakeImage.mode = "fail";
    const { container } = render(<Olivia alt="" />);
    expect(fallbackOf(container)?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("reads initials alone as text, and takes a size", () => {
    const { container } = render(
      <Avatar size="lg">
        <AvatarFallback>WK</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("WK").getAttribute("role")).toBeNull();
    expect((container.querySelector("[data-slot=avatar]") as HTMLElement).dataset.size).toBe("lg");
  });

  it("waits delayMs before showing the initials", async () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback delayMs={30}>OM</AvatarFallback>
      </Avatar>,
    );
    expect(fallbackOf(container)).toBeNull();
    await vi.waitFor(() => expect(fallbackOf(container)?.textContent).toBe("OM"));
  });

  it("groups avatars with a count", () => {
    render(
      <AvatarGroup aria-label="Team">
        <Avatar>
          <AvatarFallback>OM</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>JL</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>,
    );
    const group = screen.getByRole("group", { name: "Team" });
    expect(group.querySelectorAll("[data-slot=avatar]")).toHaveLength(2);
    expect(group.lastElementChild?.textContent).toBe("+3");
  });

  it("has no accessibility violations, loading, loaded or in a group", async () => {
    const { container } = render(
      <div>
        <Olivia />
        <Olivia src="/other.png" alt="" />
        <AvatarGroup aria-label="Team">
          <Avatar>
            <AvatarFallback>OM</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+3</AvatarGroupCount>
        </AvatarGroup>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
    await vi.waitFor(() => expect(container.querySelectorAll("img")).toHaveLength(2));
    expect(await axeViolations(container)).toEqual([]);
  });
});
