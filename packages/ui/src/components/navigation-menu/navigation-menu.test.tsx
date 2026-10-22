import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@fewtone/ui/components/navigation-menu/navigation-menu";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Site({
  label,
  viewport,
  onValueChange,
}: {
  label?: string;
  viewport?: boolean;
  onValueChange?: (value: string) => void;
}) {
  return (
    // Only with a label: an aria-label of undefined would replace Radix's own
    <NavigationMenu
      {...(label ? { "aria-label": label } : {})}
      viewport={viewport}
      onValueChange={onValueChange}
    >
      <NavigationMenuList>
        <NavigationMenuItem value="start">
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul>
              <li>
                <NavigationMenuLink href="/docs">Introduction</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/docs/installation">Installation</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="components">
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul>
              <li>
                <NavigationMenuLink href="/components/button">Button</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="docs">
          <NavigationMenuLink href="/docs">Docs</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const trigger = (name: string) => screen.getByRole("button", { name });
const expanded = (name: string) => trigger(name).getAttribute("aria-expanded");
const highlights = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("[data-slot=navigation-menu-highlight]"));

describe("NavigationMenu", () => {
  it("is a navigation landmark of triggers and links", () => {
    const { unmount } = render(<Site />);
    // Radix's name, unless you give another
    expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy();
    unmount();

    render(<Site label="Documentation" />);
    expect(screen.getByRole("navigation", { name: "Documentation" })).toBeTruthy();
    expect(expanded("Getting started")).toBe("false");
    expect(expanded("Components")).toBe("false");
    expect(screen.getByRole("link", { name: "Docs" }).getAttribute("href")).toBe("/docs");
    // Closed panels render nothing
    expect(screen.queryByRole("link", { name: "Introduction" })).toBeNull();
  });

  it("opens a panel on click, closes it on a second click, and reports the open item", async () => {
    const onValueChange = vi.fn();
    render(<Site onValueChange={onValueChange} />);
    await userEvent.click(trigger("Getting started"));
    expect(expanded("Getting started")).toBe("true");
    expect(onValueChange).toHaveBeenLastCalledWith("start");
    expect(screen.getByRole("link", { name: "Introduction" }).getAttribute("href")).toBe("/docs");
    // The panel is in the viewport, under the list, and named by its trigger
    const panel = screen
      .getByRole("link", { name: "Introduction" })
      .closest("[data-slot=navigation-menu-content]");
    expect(panel?.closest("[data-slot=navigation-menu-viewport]")).toBeTruthy();
    expect(panel?.getAttribute("aria-labelledby")).toBe(trigger("Getting started").id);

    await userEvent.click(trigger("Getting started"));
    expect(expanded("Getting started")).toBe("false");
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it("opens with Enter or Space, moves in with ArrowDown and closes with Escape", async () => {
    render(<Site />);
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger("Getting started"));

    await userEvent.keyboard("{Enter}");
    expect(expanded("Getting started")).toBe("true");
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("link", { name: "Introduction" })),
    );
    // Escape closes the panel and hands focus back to its trigger
    await userEvent.keyboard("{Escape}");
    expect(expanded("Getting started")).toBe("false");
    expect(document.activeElement).toBe(trigger("Getting started"));

    await userEvent.keyboard(" ");
    expect(expanded("Getting started")).toBe("true");
    await userEvent.keyboard(" ");
    expect(expanded("Getting started")).toBe("false");
  });

  it("opens a closed panel with ArrowDown and moves into it", async () => {
    render(<Site />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    expect(expanded("Getting started")).toBe("true");
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("link", { name: "Introduction" })),
    );
  });

  it("moves between items with the arrow keys and switches panels", async () => {
    render(<Site />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    // Radix moves focus just after the keydown
    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger("Components")));
    const before = screen
      .getByRole("link", { name: "Introduction" })
      .closest("[data-slot=navigation-menu-content]");
    await userEvent.keyboard("{Enter}");
    expect(expanded("Components")).toBe("true");
    expect(expanded("Getting started")).toBe("false");
    expect(screen.getByRole("link", { name: "Button" })).toBeTruthy();
    // The old panel slides away, out of reach, and then goes
    const old = document.querySelector(`[aria-labelledby="${trigger("Getting started").id}"]`);
    // The same element, never remounted on its way out
    expect(old).toBe(before);
    expect(old?.hasAttribute("inert")).toBe(true);
    expect(
      trigger("Components").closest("nav")?.querySelectorAll("[data-slot=navigation-menu-content]"),
    ).toHaveLength(2);
    await vi.waitFor(() => expect(screen.queryByRole("link", { name: "Introduction" })).toBeNull());
    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() => expect(document.activeElement).toBe(screen.getByRole("link", { name: "Docs" })));
  });

  it("lets Tab reach every link: into the open panel, then on through the list", async () => {
    render(<Site />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.tab();
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("link", { name: "Introduction" })),
    );
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Installation" }));
    await userEvent.tab();
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger("Components")));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Docs" }));
  });

  it("keeps one highlight, in the hovered item or else the open one", async () => {
    const { container } = render(<Site />);
    expect(highlights(container)).toHaveLength(0);
    await userEvent.hover(trigger("Components"));
    expect(highlights(container)).toHaveLength(1);
    expect(trigger("Components").parentElement?.contains(highlights(container)[0] ?? null)).toBe(true);

    // user-event doesn't send leave events to the item the pointer was over, so leave it first
    await userEvent.unhover(trigger("Components"));
    await userEvent.hover(screen.getByRole("link", { name: "Docs" }));
    expect(highlights(container)).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: "Docs" }).parentElement?.contains(highlights(container)[0] ?? null),
    ).toBe(true);
    // Leaving the list, it fades out and goes
    await userEvent.unhover(screen.getByRole("link", { name: "Docs" }));
    await vi.waitFor(() => expect(highlights(container)).toHaveLength(0));

    // Opened from the keyboard, it marks the open trigger
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(highlights(container)).toHaveLength(1);
    expect(trigger("Getting started").parentElement?.contains(highlights(container)[0] ?? null)).toBe(true);
  });

  it("shows the caret while a panel is open", async () => {
    const { container } = render(<Site />);
    const caret = () => container.querySelector("[data-slot=navigation-menu-indicator]");
    expect(caret()?.getAttribute("data-state")).toBe("hidden");
    expect(caret()?.getAttribute("aria-hidden")).toBe("true");
    await userEvent.click(trigger("Components"));
    expect(caret()?.getAttribute("data-state")).toBe("visible");
  });

  it("points the caret at the open trigger's centre", async () => {
    // jsdom has no layout: every trigger is 100px wide, so its centre is 50px in
    const width = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get(this: HTMLElement) {
        return this.dataset.slot === "navigation-menu-trigger" ? 100 : 0;
      },
    });
    try {
      const { container } = render(<Site />);
      await userEvent.click(trigger("Components"));
      const caret = container.querySelector<HTMLElement>("[data-slot=navigation-menu-indicator]");
      // It needs the menu's root to measure from; a ref re-attached every render left it at 0
      await vi.waitFor(() => expect(caret?.style.transform).toContain("translateX(50px)"));
    } finally {
      if (width) Object.defineProperty(HTMLElement.prototype, "offsetWidth", width);
    }
  });

  it("glides one highlight between a panel's links, and lets it go when the pointer leaves", async () => {
    const user = userEvent.setup();
    render(<Site />);
    await user.click(trigger("Getting started"));
    const panelHighlights = () => document.querySelectorAll("[data-slot=navigation-menu-panel-highlight]");
    const introduction = screen.getByRole("link", { name: "Introduction" });
    const installation = screen.getByRole("link", { name: "Installation" });
    // The keyboard brings it too
    installation.focus();
    await vi.waitFor(() => expect(installation.contains(panelHighlights()[0] ?? null)).toBe(true));
    // The mouse wins over focus
    await user.hover(introduction);
    expect(panelHighlights()).toHaveLength(1);
    expect(introduction.contains(panelHighlights()[0] ?? null)).toBe(true);
    await user.hover(installation);
    expect(panelHighlights()).toHaveLength(1);
    expect(installation.contains(panelHighlights()[0] ?? null)).toBe(true);
    // Leaving, it goes back to the focused link; with nothing focused it fades out and goes
    installation.blur();
    await user.unhover(installation);
    await vi.waitFor(() => expect(panelHighlights()).toHaveLength(0));
  });

  it("opens each panel under its own trigger without the viewport", async () => {
    const { container } = render(<Site viewport={false} />);
    expect(container.querySelector("[data-slot=navigation-menu-viewport]")).toBeNull();
    // The caret needs the viewport
    expect(container.querySelector("[data-slot=navigation-menu-indicator]")).toBeNull();
    await userEvent.click(trigger("Components"));
    const link = screen.getByRole("link", { name: "Button" });
    expect(trigger("Components").closest("li")?.contains(link)).toBe(true);
  });

  it("has no accessibility violations, closed or open", async () => {
    const { container } = render(<Site />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(trigger("Getting started"));
    expect(await axeViolations(container)).toEqual([]);
  });
});
