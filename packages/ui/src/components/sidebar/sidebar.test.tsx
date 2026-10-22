import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuCollapsible,
  SidebarMenuCollapsibleContent,
  SidebarMenuCollapsibleTrigger,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  type SidebarProviderProps,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@fewtone/ui/components/sidebar/sidebar";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeIcon, InboxIcon, Settings2Icon } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Shell({
  collapsible = "icon",
  page = "Dashboard",
  label,
  ...provider
}: Omit<SidebarProviderProps, "children"> & {
  collapsible?: "icon" | "offcanvas" | "none";
  page?: string;
  label?: string;
}) {
  return (
    <SidebarProvider {...provider}>
      <Sidebar collapsible={collapsible} aria-label={label}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={page === "Dashboard"} tooltip="Dashboard">
                  <a href="#dashboard">
                    <HomeIcon />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={page === "Inbox"} tooltip="Inbox">
                  <a href="#inbox">
                    <InboxIcon />
                    <span>Inbox</span>
                  </a>
                </SidebarMenuButton>
                <SidebarMenuBadge>24</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuCollapsible defaultOpen>
                <SidebarMenuCollapsibleTrigger tooltip="Settings">
                  <Settings2Icon />
                  <span>Settings</span>
                </SidebarMenuCollapsibleTrigger>
                <SidebarMenuCollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#general" isActive={page === "General"}>
                        <span>General</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuCollapsibleContent>
              </SidebarMenuCollapsible>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        <label>
          Notes
          <textarea />
        </label>
      </SidebarInset>
    </SidebarProvider>
  );
}

const trigger = () => screen.getByRole("button", { name: "Toggle sidebar" });
const sidebar = () => screen.getByRole("navigation", { name: "Sidebar" });

/**
 * The keyframes end. jsdom has no AnimationEvent, so React listens for the prefixed name there instead; fire
 * both, as a browser's would be one of them.
 */
function endKeyframes(element: Element) {
  fireEvent.animationEnd(element);
  fireEvent(element, new Event("webkitAnimationEnd", { bubbles: true }));
}

/** Phone-sized: the sidebar's media query matches */
function asPhone() {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Sidebar", () => {
  it("is a navigation landmark, named Sidebar unless it's given a name", () => {
    const { unmount } = render(<Shell />);
    expect(sidebar().dataset.state).toBe("expanded");
    expect(screen.getByRole("main")).toBeTruthy();
    unmount();
    render(<Shell label="Main" />);
    expect(screen.getByRole("navigation", { name: "Main" })).toBeTruthy();
  });

  it("collapses to icons and expands from the trigger, which says so and points at it", async () => {
    render(<Shell />);
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(trigger().getAttribute("aria-controls")).toBe(sidebar().id);
    expect(trigger().getAttribute("aria-keyshortcuts")).toBe("Meta+B Control+B");

    await userEvent.click(trigger());
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(sidebar().dataset.state).toBe("collapsed");
    expect(sidebar().dataset.collapsible).toBe("icon");
    // Down to icons, the rows keep their names
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeTruthy();

    await userEvent.click(trigger());
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(sidebar().dataset.collapsible).toBe("");
  });

  it("gives a badge a dot for the icon column, and the trigger an icon that shows the sidebar's state", async () => {
    const { container } = render(<Shell />);
    // The dot is decoration: the badge's count is what's read
    const dot = container.querySelector("[data-slot=sidebar-menu-badge-dot]");
    expect(dot?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("[data-slot=sidebar-menu-badge]")?.textContent).toBe("24");
    // The trigger draws its own panel icon, whose divider slides in once the sidebar narrows
    const divider = trigger().querySelector("path");
    expect(divider?.getAttribute("d")).toBe("M9 3v18");
    await userEvent.click(trigger());
    await vi.waitFor(() => expect(divider?.style.transform).toContain("translateX(-2.5px)"));
  });

  it("toggles with ⌘B and Ctrl+B, but not while typing, nor with the shortcut off", async () => {
    const { unmount } = render(<Shell />);
    await userEvent.keyboard("{Meta>}b{/Meta}");
    expect(sidebar().dataset.state).toBe("collapsed");
    await userEvent.keyboard("{Control>}b{/Control}");
    expect(sidebar().dataset.state).toBe("expanded");

    await userEvent.click(screen.getByRole("textbox", { name: "Notes" }));
    await userEvent.keyboard("{Control>}b{/Control}");
    expect(sidebar().dataset.state).toBe("expanded");
    unmount();

    render(<Shell shortcut={false} />);
    await userEvent.keyboard("{Meta>}b{/Meta}");
    expect(sidebar().dataset.state).toBe("expanded");
    expect(trigger().hasAttribute("aria-keyshortcuts")).toBe(false);
  });

  it("slides away off canvas, out of reach", async () => {
    render(<Shell collapsible="offcanvas" />);
    await userEvent.click(trigger());
    const nav = document.querySelector<HTMLElement>("[data-slot=sidebar]");
    expect(nav?.dataset.collapsible).toBe("offcanvas");
    expect(nav?.hasAttribute("inert")).toBe(true);
    await userEvent.click(trigger());
    expect(nav?.hasAttribute("inert")).toBe(false);
  });

  it("reports changes, and follows an open state it's given", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Shell open onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    // Controlled: it stays open until the open prop changes
    expect(sidebar().dataset.state).toBe("expanded");
    rerender(<Shell open={false} onOpenChange={onOpenChange} />);
    expect(sidebar().dataset.state).toBe("collapsed");
  });

  it("marks the current page with aria-current, and moves the mark with it", () => {
    const { rerender } = render(<Shell page="Dashboard" />);
    expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Inbox" }).hasAttribute("aria-current")).toBe(false);
    rerender(<Shell page="General" />);
    expect(screen.getByRole("link", { name: "General" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Dashboard" }).hasAttribute("aria-current")).toBe(false);
  });

  it("draws the current row's highlight once placed, instead of the row's own background", () => {
    render(<Shell />);
    const highlights = document.querySelectorAll<HTMLElement>("[data-slot=sidebar-highlight]");
    expect(highlights).toHaveLength(2);
    // The hover highlight waits; the current one is in place from the first paint
    expect(highlights[0]?.style.opacity).toBe("0");
    expect(highlights[1]?.style.opacity).toBe("1");
    expect(screen.getByRole("link", { name: "Dashboard" }).className).not.toContain(
      "data-[active=true]:bg-accent",
    );
  });

  it("names each row in a tooltip on focus once it's down to icons, and not before", async () => {
    render(<Shell />);
    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    act(() => dashboard.focus());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => dashboard.blur());

    await userEvent.click(trigger());
    act(() => dashboard.focus());
    expect((await screen.findByRole("tooltip")).textContent).toBe("Dashboard");
  });

  it("opens and closes a section, hiding it once its keyframes end", async () => {
    render(<Shell />);
    const settings = screen.getByRole("button", { name: "Settings" });
    expect(settings.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("link", { name: "General" })).toBeTruthy();

    await userEvent.click(settings);
    expect(settings.getAttribute("aria-expanded")).toBe("false");
    const content = document.querySelector<HTMLElement>("[data-slot=sidebar-menu-collapsible-content]");
    expect(content?.dataset.state).toBe("closed");
    if (content) act(() => endKeyframes(content));
    expect(content?.hidden).toBe(true);
    expect(screen.queryByRole("link", { name: "General" })).toBeNull();

    await userEvent.click(settings);
    expect(settings.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("link", { name: "General" })).toBeTruthy();
  });

  it("down to icons, folds its sections; a section's row opens the sidebar with it showing", async () => {
    render(<Shell />);
    const settings = screen.getByRole("button", { name: "Settings" });
    await userEvent.click(trigger());
    expect(settings.getAttribute("aria-expanded")).toBe("false");

    await userEvent.click(settings);
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(settings.getAttribute("aria-expanded")).toBe("true");
  });

  it("toggles from the rail, which is for the mouse and hidden from screen readers", async () => {
    render(<Shell />);
    const rail = document.querySelector<HTMLElement>("[data-slot=sidebar-rail]");
    expect(rail?.getAttribute("aria-hidden")).toBe("true");
    expect(rail?.tabIndex).toBe(-1);
    if (rail) await userEvent.click(rail);
    expect(sidebar().dataset.state).toBe("collapsed");
  });

  it("on phones, opens as a sheet from the trigger and closes when a link is followed", async () => {
    asPhone();
    render(<Shell />);
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(trigger().hasAttribute("aria-controls")).toBe(false);

    await userEvent.click(trigger());
    const sheet = await screen.findByRole("dialog", { name: "Sidebar" });
    const nav = screen.getByRole("navigation", { name: "Sidebar" });
    expect(sheet.contains(nav)).toBe(true);
    // The trigger is behind the modal sheet now, hidden from screen readers
    const behind = screen.getByRole("button", { name: "Toggle sidebar", hidden: true });
    expect(behind.getAttribute("aria-expanded")).toBe("true");
    expect(behind.getAttribute("aria-controls")).toBe(nav.id);

    await userEvent.click(screen.getByRole("link", { name: "Inbox" }));
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("on phones, closes the sheet on Escape", async () => {
    asPhone();
    render(<Shell />);
    await userEvent.click(trigger());
    await screen.findByRole("dialog", { name: "Sidebar" });
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("needs a SidebarProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    function Lonely() {
      useSidebar();
      return null;
    }
    expect(() => render(<Lonely />)).toThrow(/SidebarProvider/);
  });

  it("has no accessibility violations, open, down to icons, or as a sheet", async () => {
    const { container, unmount } = render(<Shell />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(trigger());
    expect(await axeViolations(container)).toEqual([]);
    unmount();

    asPhone();
    render(<Shell />);
    await userEvent.click(trigger());
    expect(await axeViolations(await screen.findByRole("dialog"))).toEqual([]);
  });
});
