import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@fewtone/ui/components/command/command";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Menu({ onSelect }: { onSelect?: (value: string) => void }) {
  return (
    <Command label="Command menu">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={onSelect}>Calendar</CommandItem>
          <CommandItem onSelect={onSelect} keywords={["smiley", "emoticon"]}>
            Search emoji
          </CommandItem>
          <CommandItem onSelect={onSelect} disabled>
            Calculator
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={onSelect}>
            Profile
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={onSelect}>Billing</CommandItem>
          <CommandItem onSelect={onSelect}>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

const field = () => screen.getByRole("combobox", { name: "Command menu" });
/** The option aria-activedescendant points at */
const highlighted = () => {
  const id = field().getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.dataset.value : undefined;
};
/** Filtered-out options are hidden, so they drop out of the accessibility tree */
const shown = () => screen.queryAllByRole("option").map((option) => option.dataset.value);

describe("Command", () => {
  it("is a search field controlling a listbox of options in named groups", () => {
    render(<Menu />);
    const listbox = screen.getByRole("listbox", { name: "Results" });
    expect(field().getAttribute("aria-expanded")).toBe("true");
    expect(field().getAttribute("aria-controls")).toBe(listbox.id);
    expect(shown()).toEqual(["Calendar", "Search emoji", "Calculator", "Profile", "Billing", "Settings"]);
    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(within(listbox).getByRole("group", { name: "Settings" })).toBeTruthy();
    // The shortcut isn't part of the item's value
    expect(screen.getByRole("option", { name: /Profile/ }).dataset.value).toBe("Profile");
  });

  it("highlights the first item, and moves with the arrow keys, Home and End, skipping disabled items", async () => {
    render(<Menu />);
    expect(highlighted()).toBe("Calendar");
    await userEvent.click(field());
    await userEvent.keyboard("{ArrowDown}");
    expect(highlighted()).toBe("Search emoji");
    await userEvent.keyboard("{ArrowDown}");
    expect(highlighted()).toBe("Profile");
    await userEvent.keyboard("{End}");
    expect(highlighted()).toBe("Settings");
    // No loop by default
    await userEvent.keyboard("{ArrowDown}");
    expect(highlighted()).toBe("Settings");
    await userEvent.keyboard("{Home}");
    expect(highlighted()).toBe("Calendar");
    await userEvent.keyboard("{ArrowUp}");
    expect(highlighted()).toBe("Calendar");
    expect(screen.getByRole("option", { name: "Calendar" }).getAttribute("aria-selected")).toBe("true");
  });

  it("runs the highlighted item's onSelect on Enter, and on a click", async () => {
    const onSelect = vi.fn();
    render(<Menu onSelect={onSelect} />);
    await userEvent.click(field());
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenLastCalledWith("Search emoji");
    await userEvent.click(screen.getByRole("option", { name: "Billing" }));
    expect(onSelect).toHaveBeenLastCalledWith("Billing");
    // The pointer moved the highlight, and the field kept focus
    expect(highlighted()).toBe("Billing");
    expect(document.activeElement).toBe(field());
  });

  it("filters as you type, hiding groups and separators with no matches", async () => {
    render(<Menu />);
    await userEvent.type(field(), "set");
    expect(shown()).toEqual(["Settings"]);
    expect(screen.getByRole("group", { name: "Settings" })).toBeTruthy();
    expect(screen.queryByRole("group", { name: "Suggestions" })).toBeNull();
    expect(document.querySelector<HTMLElement>("[data-slot=command-separator]")?.hidden).toBe(true);
    expect(highlighted()).toBe("Settings");
  });

  it("matches keywords and letters in order", async () => {
    render(<Menu />);
    await userEvent.type(field(), "smiley");
    expect(shown()).toEqual(["Search emoji"]);
    await userEvent.clear(field());
    await userEvent.type(field(), "clnd");
    expect(shown()).toEqual(["Calendar"]);
  });

  it("puts the best match first and highlights it", async () => {
    render(
      <Command label="Actions">
        <CommandInput />
        <CommandList>
          <CommandItem>Open settings</CommandItem>
          <CommandItem>Settings</CommandItem>
          <CommandItem>Reset all settings</CommandItem>
        </CommandList>
      </Command>,
    );
    await userEvent.type(screen.getByRole("combobox", { name: "Actions" }), "settings");
    const [open, exact, reset] = screen.getAllByRole("option");
    // The exact match sorts first (CSS order); the word matches keep their place after it
    expect(Number(exact?.style.order)).toBeLessThan(Number(open?.style.order));
    expect(open?.style.order).toBe(reset?.style.order);
    const field = screen.getByRole("combobox", { name: "Actions" });
    expect(field.getAttribute("aria-activedescendant")).toBe(exact?.id);
    await userEvent.keyboard("{ArrowDown}");
    expect(field.getAttribute("aria-activedescendant")).toBe(open?.id);
  });

  it("says when nothing matches, in the list's status line", async () => {
    render(<Menu />);
    await userEvent.type(field(), "zzz");
    expect(shown()).toEqual([]);
    expect(screen.queryAllByRole("group")).toHaveLength(0);
    // Shown to the eye, and read out from the status line
    expect(document.querySelector("[data-slot=command-empty]")?.textContent).toBe("No results found.");
    expect(screen.getByRole("status").textContent).toBe("No results found.");
    expect(field().getAttribute("aria-activedescendant")).toBeNull();
    await userEvent.clear(field());
    expect(screen.getByRole("status").textContent).toBe("");
    expect(highlighted()).toBe("Calendar");
  });

  it("leaves filtering to you with shouldFilter={false}", async () => {
    render(
      <Command label="Search" shouldFilter={false}>
        <CommandInput />
        <CommandList>
          <CommandItem>Alpha</CommandItem>
          <CommandItem>Beta</CommandItem>
        </CommandList>
      </Command>,
    );
    await userEvent.type(screen.getByRole("combobox", { name: "Search" }), "zzz");
    expect(shown()).toEqual(["Alpha", "Beta"]);
  });

  it("has no accessibility violations, at rest and with nothing matching", async () => {
    const { container } = render(<Menu />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.type(field(), "zzz");
    expect(await axeViolations(container)).toEqual([]);
  });
});

function Palette({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <CommandDialog shortcut="k" onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem>Dashboard</CommandItem>
          <CommandItem>Projects</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

describe("CommandDialog", () => {
  it("opens with ⌘K or Ctrl+K, focuses the search, and closes on Escape", async () => {
    const onOpenChange = vi.fn();
    render(<Palette onOpenChange={onOpenChange} />);
    expect(screen.queryByRole("dialog")).toBeNull();

    await userEvent.keyboard("{Meta>}k{/Meta}");
    expect(await screen.findByRole("dialog", { name: "Command palette" })).toBeTruthy();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    const search = screen.getByRole("combobox", { name: "Type a command or search…" });
    await vi.waitFor(() => expect(document.activeElement).toBe(search));

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await userEvent.keyboard("{Control>}k{/Control}");
    expect(await screen.findByRole("dialog", { name: "Command palette" })).toBeTruthy();
    // The shortcut closes it too
    await userEvent.keyboard("{Control>}k{/Control}");
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("ignores the key on its own or with another modifier", async () => {
    render(<Palette />);
    await userEvent.keyboard("k{Meta>}{Shift>}k{/Shift}{/Meta}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("has no accessibility violations while open", async () => {
    render(<Palette />);
    await userEvent.keyboard("{Meta>}k{/Meta}");
    expect(await axeViolations(await screen.findByRole("dialog"))).toEqual([]);
  });
});
