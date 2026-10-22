import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@fewtone/ui/components/popover/popover";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Dimensions() {
  return (
    <Popover>
      <PopoverTrigger>Dimensions</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the size of the layer.</PopoverDescription>
        </PopoverHeader>
        <label htmlFor="width">Width</label>
        <input id="width" defaultValue="100%" />
        <PopoverClose>Done</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

const OriginalResizeObserver = globalThis.ResizeObserver;

afterEach(() => {
  globalThis.ResizeObserver = OriginalResizeObserver;
  vi.restoreAllMocks();
});

describe("Popover", () => {
  it("opens a dialog named and described by its title and description", async () => {
    render(<Dimensions />);
    const trigger = screen.getByRole("button", { name: "Dimensions" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Dimensions" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(dialog.getAttribute("aria-describedby")).toBe(screen.getByText("Set the size of the layer.").id);
  });

  it("moves focus in on open; Escape closes it and focus goes back to the trigger", async () => {
    render(<Dimensions />);
    const trigger = screen.getByRole("button", { name: "Dimensions" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const field = await screen.findByRole("textbox", { name: "Width" });
    await vi.waitFor(() => expect(document.activeElement).toBe(field));
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it("closes from PopoverClose", async () => {
    render(<Dimensions />);
    await userEvent.click(screen.getByRole("button", { name: "Dimensions" }));
    await userEvent.click(await screen.findByRole("button", { name: "Done" }));
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("glides to a new height when its content changes size, clipping only while it moves", async () => {
    // jsdom has no layout: report the popover's height ourselves, and tell every observer it resized
    const observers = new Set<() => void>();
    const resize = () => {
      for (const notify of observers) notify();
    };
    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        observers.add(() => callback([], this as unknown as ResizeObserver));
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
    let height = 120;
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
      return this.dataset.slot === "popover-content" ? height : 0;
    });

    render(<Dimensions />);
    await userEvent.click(screen.getByRole("button", { name: "Dimensions" }));
    const dialog = await screen.findByRole("dialog", { name: "Dimensions" });
    // Nothing moves when it opens
    expect(dialog.style.height).toBe("");

    height = 180;
    act(() => resize());
    expect(dialog.style.overflow).toBe("hidden");
    // Once there, it lets go: the height is the content's own again and nothing is clipped
    await vi.waitFor(() => expect(dialog.style.height).toBe(""), { timeout: 3000 });
    expect(dialog.style.overflow).toBe("");
  });

  it("has no accessibility violations, closed or open", async () => {
    const { container } = render(<Dimensions />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Dimensions" }));
    expect(await axeViolations(await screen.findByRole("dialog"))).toEqual([]);
  });
});
