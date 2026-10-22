import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@fewtone/ui/components/sheet/sheet";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Filters({ side }: { side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <Sheet>
      <SheetTrigger>Filters</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow the results.</SheetDescription>
        </SheetHeader>
        <label htmlFor="search">Search</label>
        <input id="search" />
        <SheetFooter>
          <SheetClose>Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/** Gone once its exit has played */
const closed = () => vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

describe("Sheet", () => {
  it("opens a dialog named by its title, from the right by default", async () => {
    render(<Filters />);
    await userEvent.click(screen.getByRole("button", { name: "Filters" }));
    const sheet = await screen.findByRole("dialog", { name: "Filters" });
    expect(sheet.dataset.side).toBe("right");
    const describedBy = sheet.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(describedBy)?.textContent).toBe("Narrow the results.");
  });

  it("opens from the side it's given", async () => {
    render(<Filters side="left" />);
    await userEvent.click(screen.getByRole("button", { name: "Filters" }));
    expect((await screen.findByRole("dialog")).dataset.side).toBe("left");
  });

  it("moves focus in, closes on Escape and gives focus back to the trigger", async () => {
    render(<Filters />);
    const trigger = screen.getByRole("button", { name: "Filters" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const field = await screen.findByRole("textbox", { name: "Search" });
    await vi.waitFor(() => expect(document.activeElement).toBe(field));

    await userEvent.keyboard("{Escape}");
    await closed();
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("closes from the close button, from SheetClose and from the backdrop", async () => {
    render(<Filters side="bottom" />);
    const trigger = screen.getByRole("button", { name: "Filters" });

    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("button", { name: "Close" }));
    await closed();

    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("button", { name: "Done" }));
    await closed();

    await userEvent.click(trigger);
    await screen.findByRole("dialog");
    const overlay = document.querySelector<HTMLElement>("[data-slot=sheet-overlay]");
    expect(overlay).not.toBeNull();
    if (overlay) await userEvent.click(overlay);
    await closed();
  });

  it("has no accessibility violations, closed or open", async () => {
    const { container } = render(<Filters />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Filters" }));
    expect(await axeViolations(await screen.findByRole("dialog"))).toEqual([]);
  });
});
