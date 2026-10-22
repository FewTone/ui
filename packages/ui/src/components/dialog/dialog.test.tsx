import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@fewtone/ui/components/dialog/dialog";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Profile({
  open,
  defaultOpen,
  onOpenChange,
  showCloseButton,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showCloseButton?: boolean;
}) {
  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogTrigger>Edit profile</DialogTrigger>
      <DialogContent showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Change how others see you.</DialogDescription>
        </DialogHeader>
        <label htmlFor="name">Name</label>
        <input id="name" />
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Gone once its exit has played */
const closed = () => vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Dialog", () => {
  it("opens a dialog named by its title and described by its description", async () => {
    render(<Profile />);
    const trigger = screen.getByRole("button", { name: "Edit profile" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("dialog")).toBeNull();

    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Edit profile" });
    const describedBy = dialog.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(describedBy)?.textContent).toBe("Change how others see you.");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("moves focus in, closes on Escape and gives focus back to the trigger", async () => {
    render(<Profile />);
    const trigger = screen.getByRole("button", { name: "Edit profile" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const field = await screen.findByRole("textbox", { name: "Name" });
    await vi.waitFor(() => expect(document.activeElement).toBe(field));

    await userEvent.keyboard("{Escape}");
    await closed();
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("leaves focus where the person put it while the window was leaving", async () => {
    render(
      <>
        <Profile />
        <input aria-label="Search" />
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    // The page is usable while the window leaves (it's still hidden from screen readers until it's gone)
    const search = screen.getByRole("textbox", { name: "Search", hidden: true });
    search.focus();
    await closed();
    // Radix hands focus back on the next task after the window unmounts
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(document.activeElement).toBe(search);
  });

  it("keeps Tab inside the window", async () => {
    render(<Profile />);
    await userEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    const field = await screen.findByRole("textbox", { name: "Name" });
    await vi.waitFor(() => expect(document.activeElement).toBe(field));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cancel" }));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close" }));
    await userEvent.tab();
    expect(document.activeElement).toBe(field);
  });

  it("closes from the close button, from DialogClose and from the backdrop", async () => {
    render(<Profile />);
    const trigger = screen.getByRole("button", { name: "Edit profile" });

    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("button", { name: "Close" }));
    await closed();

    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));
    await closed();

    await userEvent.click(trigger);
    await screen.findByRole("dialog");
    const overlay = document.querySelector<HTMLElement>("[data-slot=dialog-overlay]");
    expect(overlay).not.toBeNull();
    if (overlay) await userEvent.click(overlay);
    await closed();
  });

  it("follows open when controlled", async () => {
    const onOpenChange = vi.fn();
    render(<Profile open onOpenChange={onOpenChange} />);
    expect(await screen.findByRole("dialog", { name: "Edit profile" })).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // The parent kept it open
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("grows from the centre of its trigger", async () => {
    // jsdom has no layout: place the trigger, and the window inside its positioner, by hand
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      return this.getAttribute("data-slot") === "dialog-trigger"
        ? new DOMRect(100, 400, 80, 32)
        : new DOMRect(0, 0, 0, 0);
    });
    vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(function (this: HTMLElement) {
      return this.dataset.slot === "dialog-content" ? this.parentElement : null;
    });
    vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockReturnValue(300);
    vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockReturnValue(200);

    render(<Profile />);
    await userEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    // The trigger's centre (140, 416), in the window's own box (from 300, 200)
    expect((await screen.findByRole("dialog")).style.transformOrigin).toBe("-160px 216px");
  });

  it("starts open with defaultOpen, and can leave out the close button", () => {
    render(<Profile defaultOpen showCloseButton={false} />);
    expect(screen.getByRole("dialog", { name: "Edit profile" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("has no accessibility violations, closed or open", async () => {
    const { container } = render(<Profile />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    expect(await axeViolations(await screen.findByRole("dialog"))).toEqual([]);
  });
});
