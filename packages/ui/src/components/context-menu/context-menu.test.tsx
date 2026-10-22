import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@fewtone/ui/components/context-menu/context-menu";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Page({ onSelect }: { onSelect?: (item: string) => void }) {
  const [bookmarks, setBookmarks] = useState(true);
  const [size, setSize] = useState("default");
  return (
    <ContextMenu>
      <ContextMenuTrigger tabIndex={0}>Right-click here</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => onSelect?.("back")}>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled>Forward</ContextMenuItem>
        <ContextMenuItem onSelect={() => onSelect?.("reload")}>Reload</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>More tools</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Save page as…</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
          Show bookmarks bar
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuLabel>Text size</ContextMenuLabel>
        <ContextMenuRadioGroup value={size} onValueChange={setSize}>
          <ContextMenuRadioItem value="small">Small</ContextMenuRadioItem>
          <ContextMenuRadioItem value="default">Default</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}

const item = (name: string | RegExp) => screen.getByRole("menuitem", { name });
const area = () => screen.getByText("Right-click here");

async function rightClick() {
  await userEvent.pointer({ keys: "[MouseRight]", target: area() });
  return screen.findByRole("menu");
}

describe("ContextMenu", () => {
  it("opens a menu of items on right-click, with checkbox and radio items", async () => {
    render(<Page />);
    expect(screen.queryByRole("menu")).toBeNull();
    await rightClick();
    expect(item(/Back/)).toBeTruthy();
    expect(item("Forward").getAttribute("aria-disabled")).toBe("true");
    expect(
      screen.getByRole("menuitemcheckbox", { name: "Show bookmarks bar" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(screen.getByRole("menuitemradio", { name: "Default" }).getAttribute("aria-checked")).toBe("true");
    expect(area().getAttribute("data-state")).toBe("open");
  });

  it("moves between items with the arrow keys, skipping disabled ones, and picks with Enter", async () => {
    const onSelect = vi.fn();
    render(<Page onSelect={onSelect} />);
    const menu = await rightClick();
    await vi.waitFor(() => expect(document.activeElement).toBe(menu));
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(item(/Back/));
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(item("Reload"));
    // One highlight, in the focused item
    expect(menu.querySelectorAll("[data-slot=menu-highlight]")).toHaveLength(1);
    expect(item("Reload").querySelector("[data-slot=menu-highlight]")).toBeTruthy();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("reload");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens from the keyboard's context-menu key on a focused trigger and focuses the first item", async () => {
    render(<Page />);
    area().focus();
    // Shift+F10 or the context-menu key: the browser sends a contextmenu event to the focused element
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    fireEvent.contextMenu(area());
    await screen.findByRole("menu");
    await vi.waitFor(() => expect(document.activeElement).toBe(item(/Back/)));
  });

  it("opens a sub-menu with ArrowRight and closes everything on Escape", async () => {
    render(<Page />);
    await rightClick();
    item("More tools").focus();
    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() => expect(document.activeElement).toBe(item("Save page as…")));
    expect(screen.getAllByRole("menu")).toHaveLength(2);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("toggles a checkbox item and picks a radio item", async () => {
    render(<Page />);
    await rightClick();
    await userEvent.click(screen.getByRole("menuitemcheckbox", { name: "Show bookmarks bar" }));
    // Picking closes the menu; it reopens with the new state
    expect(screen.queryByRole("menu")).toBeNull();
    await rightClick();
    expect(
      screen.getByRole("menuitemcheckbox", { name: "Show bookmarks bar" }).getAttribute("aria-checked"),
    ).toBe("false");
    screen.getByRole("menuitemradio", { name: "Small" }).focus();
    await userEvent.keyboard(" ");
    await rightClick();
    expect(screen.getByRole("menuitemradio", { name: "Small" }).getAttribute("aria-checked")).toBe("true");
  });

  it("has no accessibility violations, closed or open", async () => {
    const { container } = render(<Page />);
    expect(await axeViolations(container)).toEqual([]);
    expect(await axeViolations(await rightClick())).toEqual([]);
  });
});
