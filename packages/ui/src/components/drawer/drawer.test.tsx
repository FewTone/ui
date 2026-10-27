import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@fewtone/ui/components/drawer/drawer";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

/** Pretend the screen is phone-sized (or not), and let a test change it while the drawer is open */
function screenIs(phone: boolean) {
  const listeners = new Set<() => void>();
  const state = { phone };
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        get matches() {
          return query.includes("max-width") ? state.phone : false;
        },
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: (_: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
  return (next: boolean) => {
    state.phone = next;
    for (const listener of listeners) listener();
  };
}

/** A visual viewport that a keyboard can shrink (jsdom has none) */
function fakeViewport() {
  const viewport = Object.assign(new EventTarget(), { height: window.innerHeight, offsetTop: 0 });
  Object.defineProperty(window, "visualViewport", { value: viewport, configurable: true });
  return (height: number) => {
    viewport.height = height;
    viewport.dispatchEvent(new Event("resize"));
  };
}

function Profile({ mode }: { mode?: "auto" | "sheet" | "dialog" }) {
  return (
    <Drawer mode={mode}>
      <DrawerTrigger>Edit profile</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>Change how others see you.</DrawerDescription>
        </DrawerHeader>
        <label htmlFor="name">Name</label>
        <input id="name" />
        <DrawerFooter>
          <DrawerClose>Cancel</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const open = async () => {
  await userEvent.click(screen.getByRole("button", { name: "Edit profile" }));
  return screen.findByRole("dialog", { name: "Edit profile" });
};

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, "visualViewport");
});

describe("Drawer", () => {
  it("opens as a sheet on a phone, named and described", async () => {
    screenIs(true);
    render(<Profile />);
    const sheet = await open();
    expect(sheet.hasAttribute("data-vaul-drawer")).toBe(true);
    expect(sheet.querySelector("[data-slot=drawer-handle]")).not.toBeNull();
    const describedBy = sheet.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(describedBy)?.textContent).toBe("Change how others see you.");
  });

  it("opens as a dialog on a larger screen", async () => {
    screenIs(false);
    render(<Profile />);
    const dialog = await open();
    expect(dialog.dataset.slot).toBe("dialog-content");
    expect(dialog.hasAttribute("data-vaul-drawer")).toBe(false);
  });

  it("can be forced either way", async () => {
    screenIs(false);
    const { unmount } = render(<Profile mode="sheet" />);
    expect((await open()).hasAttribute("data-vaul-drawer")).toBe(true);
    unmount();

    screenIs(true);
    render(<Profile mode="dialog" />);
    expect((await open()).dataset.slot).toBe("dialog-content");
  });

  it("keeps what it opened as while it's open", async () => {
    const resize = screenIs(true);
    render(<Profile />);
    await open();
    act(() => resize(false));
    expect(screen.getByRole("dialog").hasAttribute("data-vaul-drawer")).toBe(true);
  });

  it("focuses the sheet itself on open, not its first field", async () => {
    screenIs(true);
    render(<Profile />);
    const sheet = await open();
    await vi.waitFor(() => expect(document.activeElement).toBe(sheet));
  });

  it("sits on the keyboard and fits above it while a field has focus", async () => {
    screenIs(true);
    const keyboard = fakeViewport();
    render(<Profile />);
    const sheet = await open();
    const field = screen.getByRole("textbox", { name: "Name" });
    act(() => field.focus());
    act(() => keyboard(window.innerHeight - 300));
    expect(sheet.style.bottom).toBe("300px");
    expect(sheet.style.maxHeight).toBe(`calc(${window.innerHeight - 300}px - var(--size-sheet-top-gap))`);

    act(() => keyboard(window.innerHeight));
    expect(sheet.style.bottom).toBe("");
  });

  it("closes from its close button and its footer", async () => {
    screenIs(true);
    render(<Profile />);
    await open();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await open();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("pushes the sheet behind back when a sheet opens on it", async () => {
    screenIs(true);
    render(
      <Drawer>
        <DrawerTrigger>Share</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Share</DrawerTitle>
          <Drawer>
            <DrawerTrigger>Add people</DrawerTrigger>
            <DrawerContent>
              <DrawerTitle>Add people</DrawerTitle>
            </DrawerContent>
          </Drawer>
        </DrawerContent>
      </Drawer>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Share" }));
    const behind = await screen.findByRole("dialog", { name: "Share" });
    await userEvent.click(screen.getByRole("button", { name: "Add people" }));
    await screen.findByRole("dialog", { name: "Add people" });
    await vi.waitFor(() => expect(behind.style.transform).toContain("translate3d(0, -16px, 0)"));
  });

  it("has no axe violations as a sheet or a dialog", async () => {
    screenIs(true);
    const { unmount } = render(<Profile />);
    await open();
    expect(await axeViolations(document.body)).toEqual([]);
    unmount();

    screenIs(false);
    render(<Profile />);
    await open();
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
