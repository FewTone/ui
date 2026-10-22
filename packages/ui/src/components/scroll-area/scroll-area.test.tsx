import { ScrollArea, ScrollBar } from "@fewtone/ui/components/scroll-area/scroll-area";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

/**
 * jsdom has no layout: give the scroller a size, a content size and a scroll position. Other elements keep
 * jsdom's zeros.
 */
function stubScroller(sizes: { width: number; height: number; contentWidth: number; contentHeight: number }) {
  const position = { top: 0, left: 0 };
  const scroller = (node: Element) => node.matches("[data-slot=scroll-area-viewport]");
  const read = (key: keyof typeof sizes) =>
    function (this: Element) {
      return scroller(this) ? sizes[key] : 0;
    };
  vi.spyOn(Element.prototype, "clientWidth", "get").mockImplementation(read("width"));
  vi.spyOn(Element.prototype, "clientHeight", "get").mockImplementation(read("height"));
  vi.spyOn(Element.prototype, "scrollWidth", "get").mockImplementation(read("contentWidth"));
  vi.spyOn(Element.prototype, "scrollHeight", "get").mockImplementation(read("contentHeight"));
  vi.spyOn(Element.prototype, "scrollTop", "get").mockImplementation(function (this: Element) {
    return scroller(this) ? position.top : 0;
  });
  vi.spyOn(Element.prototype, "scrollLeft", "get").mockImplementation(function (this: Element) {
    return scroller(this) ? position.left : 0;
  });
  return position;
}

/** Which fades show, by side */
const shownFades = () =>
  Array.from(document.querySelectorAll<HTMLElement>("[data-slot=scroll-area-fade][data-state=visible]")).map(
    (fade) => fade.dataset.side,
  );

const tags = Array.from({ length: 30 }, (_, index) => `Tag ${index + 1}`);

function Tags({ sideways = false }: { sideways?: boolean }) {
  return (
    <ScrollArea aria-label="Tags" className="h-40 w-48">
      <ul>
        {tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      {sideways ? <ScrollBar orientation="horizontal" /> : null}
    </ScrollArea>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ScrollArea", () => {
  it("is a named, focusable region when it has a name", async () => {
    render(<Tags />);
    const region = screen.getByRole("region", { name: "Tags" });
    await userEvent.tab();
    expect(document.activeElement).toBe(region);
  });

  it("is a plain box without a name", () => {
    render(
      <ScrollArea className="h-40">
        <p>Notes</p>
      </ScrollArea>,
    );
    expect(screen.queryByRole("region")).toBeNull();
    expect(document.querySelector("[data-slot=scroll-area-viewport]")?.hasAttribute("tabindex")).toBe(false);
  });

  it("shows a fade only at the edges with more to scroll to", () => {
    const position = stubScroller({ width: 192, height: 160, contentWidth: 192, contentHeight: 600 });
    render(<Tags />);
    expect(shownFades()).toEqual(["bottom"]);

    const viewport = screen.getByRole("region", { name: "Tags" });
    position.top = 200;
    fireEvent.scroll(viewport);
    expect(shownFades()).toEqual(["top", "bottom"]);

    position.top = 440;
    fireEvent.scroll(viewport);
    expect(shownFades()).toEqual(["top"]);
  });

  it("fades sideways too", () => {
    const position = stubScroller({ width: 192, height: 160, contentWidth: 500, contentHeight: 160 });
    render(<Tags sideways />);
    expect(shownFades()).toEqual(["right"]);
    position.left = 100;
    fireEvent.scroll(screen.getByRole("region", { name: "Tags" }));
    expect(shownFades()).toEqual(["left", "right"]);
  });

  it("shows no fades when the content fits", () => {
    stubScroller({ width: 192, height: 160, contentWidth: 192, contentHeight: 160 });
    render(<Tags />);
    expect(shownFades()).toEqual([]);
  });

  it("has no accessibility violations", async () => {
    stubScroller({ width: 192, height: 160, contentWidth: 192, contentHeight: 600 });
    const { container } = render(<Tags />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
