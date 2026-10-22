import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@fewtone/ui/components/tooltip/tooltip";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Toolbar({
  delayDuration = 50,
  skipDelayDuration,
  disableHoverableContent,
}: {
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}) {
  return (
    <TooltipProvider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      {["Undo", "Redo"].map((label) => (
        <Tooltip key={label}>
          <TooltipTrigger aria-label={label}>{label.slice(0, 1)}</TooltipTrigger>
          <TooltipContent>{`${label} the last change`}</TooltipContent>
        </Tooltip>
      ))}
    </TooltipProvider>
  );
}

const animatesIn = (tooltip: HTMLElement) => tooltip.className.includes("animate-popover-in");

describe("Tooltip", () => {
  it("opens on keyboard focus and describes its trigger", async () => {
    render(<Toolbar />);
    await userEvent.tab();
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip.textContent).toBe("Undo the last change");
    const trigger = screen.getByRole("button", { name: "Undo" });
    expect(trigger.getAttribute("aria-describedby")).toBe(tooltip.id);
    expect(screen.getByRole("button", { name: "Undo", description: "Undo the last change" })).toBe(trigger);
  });

  it("opens on hover after the delay", async () => {
    render(<Toolbar />);
    await userEvent.hover(screen.getByRole("button", { name: "Undo" }));
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect((await screen.findByRole("tooltip")).textContent).toBe("Undo the last change");
  });

  it("closes on Escape, keeping focus on the trigger", async () => {
    render(<Toolbar />);
    await userEvent.tab();
    await screen.findByRole("tooltip");
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Undo" }));
  });

  it("animates the first tooltip in; along the row, the next one takes its place at once", async () => {
    render(<Toolbar skipDelayDuration={50} />);
    await userEvent.tab();
    const first = await screen.findByRole("tooltip");
    expect(animatesIn(first)).toBe(true);
    expect(first.hasAttribute("data-following")).toBe(false);

    await userEvent.tab();
    const next = await screen.findByRole("tooltip");
    expect(next.textContent).toBe("Redo the last change");
    expect(animatesIn(next)).toBe(false);
    expect(next.hasAttribute("data-following")).toBe(true);

    // Once the row has been left for longer than the skip window, the next tooltip animates in again
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
    await new Promise((resolve) => setTimeout(resolve, 100));
    await userEvent.tab({ shift: true });
    const again = await screen.findByRole("tooltip");
    expect(again.textContent).toBe("Undo the last change");
    expect(animatesIn(again)).toBe(true);
  });

  it("hands over at once when the pointer moves to the next trigger", async () => {
    render(<Toolbar />);
    await userEvent.hover(screen.getByRole("button", { name: "Undo" }));
    expect(animatesIn(await screen.findByRole("tooltip"))).toBe(true);
    await userEvent.hover(screen.getByRole("button", { name: "Redo" }));
    await vi.waitFor(() => expect(screen.getByRole("tooltip").textContent).toBe("Redo the last change"));
    expect(animatesIn(screen.getByRole("tooltip"))).toBe(false);
  });

  it("stays fast after resting on a tooltip longer than the skip window", async () => {
    // Leaving a trigger closes its tooltip at once: jsdom has no layout for Radix's path towards the tooltip
    // A long delay with wide margins, so a busy machine (the full suite in parallel) can't make it flaky
    render(<Toolbar delayDuration={1500} skipDelayDuration={300} disableHoverableContent />);
    const undo = screen.getByRole("button", { name: "Undo" });
    const redo = screen.getByRole("button", { name: "Redo" });
    await userEvent.hover(undo);
    await screen.findByRole("tooltip", undefined, { timeout: 4000 });
    await userEvent.unhover(undo);
    await userEvent.hover(redo);
    await vi.waitFor(() => expect(screen.getByRole("tooltip").textContent).toBe("Redo the last change"));
    // Rest on it, twice the skip window: Radix's own window has run out, but a tooltip is still showing
    await new Promise((resolve) => setTimeout(resolve, 600));
    await userEvent.unhover(redo);
    await userEvent.hover(undo);
    // Well inside the 1500ms delay
    await vi.waitFor(() => expect(screen.getByRole("tooltip").textContent).toBe("Undo the last change"), {
      timeout: 700,
    });
    expect(animatesIn(screen.getByRole("tooltip"))).toBe(false);
  });

  it("works without a provider", async () => {
    render(
      <Tooltip>
        <TooltipTrigger>Help</TooltipTrigger>
        <TooltipContent>Opens the help centre</TooltipContent>
      </Tooltip>,
    );
    await userEvent.tab();
    expect((await screen.findByRole("tooltip")).textContent).toBe("Opens the help centre");
  });

  it("has no accessibility violations, closed or open", async () => {
    const { container } = render(<Toolbar />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.tab();
    const tooltip = await screen.findByRole("tooltip");
    expect(await axeViolations(container)).toEqual([]);
    expect(await axeViolations(tooltip)).toEqual([]);
  });
});
