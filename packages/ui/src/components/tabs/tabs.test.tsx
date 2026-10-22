import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fewtone/ui/components/tabs/tabs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Settings({
  variant,
  value,
  onValueChange,
  forceMount,
}: {
  variant?: "underline" | "pill";
  value?: string;
  onValueChange?: (value: string) => void;
  forceMount?: true;
}) {
  return (
    <Tabs defaultValue={value ? undefined : "account"} value={value} onValueChange={onValueChange}>
      <TabsList variant={variant} aria-label="Settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account" forceMount={forceMount}>
        <label htmlFor="name">Name</label>
        <input id="name" />
      </TabsContent>
      <TabsContent value="password">Change your password.</TabsContent>
      <TabsContent value="billing">Your plan.</TabsContent>
      <TabsContent value="notifications">Choose what we send you.</TabsContent>
    </Tabs>
  );
}

const indicators = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("[data-slot=tabs-indicator]"));

describe("Tabs", () => {
  it("is a tablist of tabs, each showing its own panel", async () => {
    render(<Settings />);
    expect(screen.getByRole("tablist", { name: "Settings" })).toBeTruthy();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    expect(screen.getByRole("tab", { name: "Account" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel", { name: "Account" })).toBeTruthy();

    await userEvent.click(screen.getByRole("tab", { name: "Password" }));
    expect(screen.getByRole("tab", { name: "Password" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel", { name: "Password" }).textContent).toBe("Change your password.");
    // Hidden panels leave the accessibility tree
    expect(screen.queryByRole("tabpanel", { name: "Account" })).toBeNull();
  });

  it("moves between tabs with the arrow keys, skipping a disabled one, and shows their panel", async () => {
    render(<Settings />);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Account" }));
    // Radix moves focus just after the keydown
    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Password" })),
    );
    expect(screen.getByRole("tabpanel", { name: "Password" })).toBeTruthy();
    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Notifications" })),
    );
    await userEvent.keyboard("{Home}");
    await vi.waitFor(() => expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Account" })));
    expect(screen.getByRole("tab", { name: "Account" }).getAttribute("aria-selected")).toBe("true");
    // Tab moves from the tabs into the shown panel
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("tabpanel", { name: "Account" }));
  });

  it("keeps one indicator, in the active tab, for both looks", async () => {
    for (const variant of ["underline", "pill"] as const) {
      const { container, unmount } = render(<Settings variant={variant} />);
      expect(screen.getByRole("tablist").getAttribute("data-variant")).toBe(variant);
      expect(indicators(container)).toHaveLength(1);
      await userEvent.click(screen.getByRole("tab", { name: "Notifications" }));
      expect(indicators(container)).toHaveLength(1);
      expect(
        screen.getByRole("tab", { name: "Notifications" }).contains(indicators(container)[0] ?? null),
      ).toBe(true);
      unmount();
    }
  });

  it("follows a controlled value and reports the user's picks", async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Settings value="account" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Password" }));
    expect(onValueChange).toHaveBeenLastCalledWith("password");
    // Still controlled: nothing changes until the value does
    expect(screen.getByRole("tab", { name: "Account" }).getAttribute("aria-selected")).toBe("true");
    rerender(<Settings value="notifications" onValueChange={onValueChange} />);
    expect(screen.getByRole("tabpanel", { name: "Notifications" })).toBeTruthy();
  });

  it("keeps a hidden panel's content, and its state, with forceMount", async () => {
    render(<Settings forceMount />);
    await userEvent.type(screen.getByLabelText("Name"), "Ada");
    await userEvent.click(screen.getByRole("tab", { name: "Password" }));
    expect(screen.queryByRole("tabpanel", { name: "Account" })).toBeNull();
    expect((screen.getByLabelText("Name", { selector: "input" }) as HTMLInputElement).value).toBe("Ada");
    await userEvent.click(screen.getByRole("tab", { name: "Account" }));
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("Ada");
  });

  it("has no accessibility violations", async () => {
    for (const variant of ["underline", "pill"] as const) {
      const { container, unmount } = render(<Settings variant={variant} />);
      expect(await axeViolations(container)).toEqual([]);
      unmount();
    }
  });
});
