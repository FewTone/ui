import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@fewtone/ui/components/dropdown-menu/dropdown-menu";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Account({ onSelect }: { onSelect?: (item: string) => void }) {
  const [notifications, setNotifications] = useState(true);
  const [position, setPosition] = useState("bottom");
  // Keep the menu open while toggling, as the demos do
  const keepOpen = (event: Event) => event.preventDefault();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => onSelect?.("profile")}>
          Profile
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Billing</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect?.("settings")}>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={notifications}
          onCheckedChange={setNotifications}
          onSelect={keepOpen}
        >
          Email notifications
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem value="top" onSelect={keepOpen}>
            Top
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom" onSelect={keepOpen}>
            Bottom
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Invite people</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>Message</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const item = (name: string | RegExp) => screen.getByRole("menuitem", { name });
/** The highlights in a menu (each menu level has at most one) */
const highlights = (menu: HTMLElement) =>
  Array.from(menu.querySelectorAll(":scope [data-slot=menu-highlight]")).filter(
    (node) => node.closest("[role=menu]") === menu,
  );

const allHighlights = () => Array.from(document.querySelectorAll("[data-slot=menu-highlight]"));

async function openWithKeyboard(key = "{Enter}") {
  const trigger = screen.getByRole("button", { name: "Open menu" });
  trigger.focus();
  await userEvent.keyboard(key);
  const menu = await screen.findByRole("menu");
  // Radix focuses the first item just after the menu opens
  await vi.waitFor(() => expect(document.activeElement).toBe(item(/Profile/)));
  return { trigger, menu };
}

describe("DropdownMenu", () => {
  it("is a menu button that opens from the keyboard with Enter, Space or ArrowDown", async () => {
    for (const key of ["{Enter}", " ", "{ArrowDown}"]) {
      const { unmount } = render(<Account />);
      const trigger = screen.getByRole("button", { name: "Open menu" });
      expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      const { menu } = await openWithKeyboard(key);
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(menu.getAttribute("aria-labelledby")).toBe(trigger.id);
      unmount();
    }
  });

  it("moves one highlight between items with the arrow keys, skipping disabled ones", async () => {
    render(<Account />);
    const { menu } = await openWithKeyboard();
    expect(highlights(menu)).toHaveLength(1);
    expect(item(/Profile/).contains(highlights(menu)[0] ?? null)).toBe(true);

    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(item("Settings"));
    expect(highlights(menu)).toHaveLength(1);
    expect(item("Settings").contains(highlights(menu)[0] ?? null)).toBe(true);

    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(item(/Profile/));
    expect(item("Billing").getAttribute("aria-disabled")).toBe("true");
  });

  it("picks an item with Enter, closes, and gives focus back to the trigger", async () => {
    const onSelect = vi.fn();
    render(<Account onSelect={onSelect} />);
    const { trigger } = await openWithKeyboard();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("settings");
    expect(screen.queryByRole("menu")).toBeNull();
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("closes on Escape", async () => {
    render(<Account />);
    const { trigger } = await openWithKeyboard();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("toggles checkbox items and picks radio items", async () => {
    render(<Account />);
    await openWithKeyboard();
    const checkbox = screen.getByRole("menuitemcheckbox", { name: "Email notifications" });
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    await userEvent.click(checkbox);
    expect(checkbox.getAttribute("aria-checked")).toBe("false");

    const top = screen.getByRole("menuitemradio", { name: "Top" });
    const bottom = screen.getByRole("menuitemradio", { name: "Bottom" });
    expect(bottom.getAttribute("aria-checked")).toBe("true");
    top.focus();
    await userEvent.keyboard(" ");
    expect(top.getAttribute("aria-checked")).toBe("true");
    expect(bottom.getAttribute("aria-checked")).toBe("false");
  });

  it("opens a sub-menu with ArrowRight, moving the one highlight into it, and closes it with ArrowLeft", async () => {
    render(<Account />);
    const { menu } = await openWithKeyboard();
    const subTrigger = item("Invite people");
    expect(subTrigger.getAttribute("aria-haspopup")).toBe("menu");
    subTrigger.focus();
    await vi.waitFor(() => expect(subTrigger.contains(highlights(menu)[0] ?? null)).toBe(true));
    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() => expect(document.activeElement).toBe(item("Email")));
    expect(subTrigger.getAttribute("aria-expanded")).toBe("true");
    // A menu and its sub-menus share one highlight: it left the trigger for the sub-menu's row
    await vi.waitFor(() => expect(allHighlights()).toHaveLength(1));
    expect(item("Email").contains(allHighlights()[0] ?? null)).toBe(true);

    await userEvent.keyboard("{ArrowLeft}");
    await vi.waitFor(() => expect(document.activeElement).toBe(subTrigger));
    expect(screen.getAllByRole("menu")).toHaveLength(1);
    await vi.waitFor(() => expect(allHighlights()).toHaveLength(1));
    expect(subTrigger.contains(allHighlights()[0] ?? null)).toBe(true);
  });

  it("lets the highlight go when the pointer leaves the items", async () => {
    // One session, so the pointer remembers where it was and leaving an item is noticed
    const user = userEvent.setup();
    render(<Account />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = await screen.findByRole("menu");
    // Opened with the pointer, nothing is highlighted until an item is hovered
    expect(highlights(menu)).toHaveLength(0);
    await user.hover(item("Settings"));
    expect(document.activeElement).toBe(item("Settings"));
    expect(highlights(menu)).toHaveLength(1);
    // Onto the label: Radix gives focus back to the menu, and the highlight fades out where it was
    await user.hover(screen.getByText("My account"));
    expect(document.activeElement).toBe(menu);
    await vi.waitFor(() => expect(highlights(menu)).toHaveLength(0));
    // Back on an item, it appears again
    await user.hover(item(/Profile/));
    expect(highlights(menu)).toHaveLength(1);
  });

  it("marks destructive items", async () => {
    render(<Account />);
    await openWithKeyboard();
    expect(item("Log out").getAttribute("data-variant")).toBe("destructive");
  });

  it("renders an item as a link with asChild, keeping the item's role and highlight", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <a href="/settings">Settings</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const link = await screen.findByRole("menuitem", { name: "Settings" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/settings");
    expect(link.dataset.slot).toBe("dropdown-menu-item");
  });

  it("has no accessibility violations, closed or open", async () => {
    const { container } = render(<Account />);
    expect(await axeViolations(container)).toEqual([]);
    const { menu } = await openWithKeyboard();
    expect(await axeViolations(menu)).toEqual([]);
  });
});
