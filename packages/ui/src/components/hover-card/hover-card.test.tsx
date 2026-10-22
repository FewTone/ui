import { HoverCard, HoverCardContent, HoverCardTrigger } from "@fewtone/ui/components/hover-card/hover-card";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Mentions({ openDelay = 0, closeDelay = 0 }: { openDelay?: number; closeDelay?: number }) {
  return (
    <p>
      {["maya", "theo"].map((handle) => (
        <HoverCard key={handle} openDelay={openDelay} closeDelay={closeDelay} skipDelayDuration={50}>
          <HoverCardTrigger href={`https://example.com/${handle}`}>@{handle}</HoverCardTrigger>
          <HoverCardContent>{`${handle}'s profile`}</HoverCardContent>
        </HoverCard>
      ))}
    </p>
  );
}

const card = (handle: string) => screen.queryByText(`${handle}'s profile`);
/** The card's surface, round its content */
const surface = (handle: string) =>
  card(handle)?.closest<HTMLElement>("[data-slot=hover-card-content]") ?? null;
/** The page-wide hand-over window (50ms here) from the last test has passed */
const settle = () => new Promise((resolve) => setTimeout(resolve, 100));

describe("HoverCard", () => {
  afterEach(() => vi.restoreAllMocks());

  it("is a link that opens a card on hover, and closes when the pointer leaves", async () => {
    render(<Mentions />);
    const link = screen.getByRole("link", { name: "@maya" });
    expect(link.getAttribute("href")).toBe("https://example.com/maya");
    await userEvent.hover(link);
    await vi.waitFor(() => expect(card("maya")).toBeTruthy());
    await userEvent.unhover(link);
    await vi.waitFor(() => expect(card("maya")).toBeNull());
  });

  it("opens on keyboard focus and closes on Escape, keeping focus on the link", async () => {
    render(<Mentions />);
    await userEvent.tab();
    await vi.waitFor(() => expect(card("maya")).toBeTruthy());
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(card("maya")).toBeNull());
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "@maya" }));
  });

  it("animates the first card in; the next one opens at once in its place", async () => {
    await settle();
    // The first card is still waiting out its close delay when the pointer reaches the next link
    render(<Mentions openDelay={400} closeDelay={400} />);
    await userEvent.hover(screen.getByRole("link", { name: "@maya" }));
    await screen.findByText("maya's profile", undefined, { timeout: 2000 });
    expect(surface("maya")?.className).toContain("animate-popover-in");

    await userEvent.hover(screen.getByRole("link", { name: "@theo" }));
    // Well inside the 400ms delays: it skipped its own, and the first one went at once
    await screen.findByText("theo's profile", undefined, { timeout: 150 });
    const next = surface("theo");
    expect(next?.className).not.toContain("animate-popover-in");
    expect(next?.hasAttribute("data-following")).toBe(true);
    expect(card("maya")).toBeNull();
  });

  it("glides the next card from where the last one was, and leaves no styles behind", async () => {
    await settle();
    // jsdom has no layout: give every box a size so there's something to glide between
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 256, 120));
    // In Strict Mode, as in development, where React attaches every ref twice
    render(
      <StrictMode>
        <Mentions />
      </StrictMode>,
    );
    await userEvent.hover(screen.getByRole("link", { name: "@maya" }));
    await vi.waitFor(() => expect(card("maya")).toBeTruthy());
    await userEvent.hover(screen.getByRole("link", { name: "@theo" }));
    await vi.waitFor(() => expect(card("theo")).toBeTruthy());
    // Mid-glide the size is held inline and clipped; once it lands, it's all cleared
    await vi.waitFor(() => expect(surface("theo")?.style.overflow).toBe("hidden"));
    await vi.waitFor(() => expect(surface("theo")?.style.overflow).toBe(""), { timeout: 2000 });
    expect(surface("theo")?.style.height).toBe("");
    expect(card("theo")?.style.filter ?? "").toBe("");
  });

  it("has no accessibility violations, closed or open", async () => {
    const { container } = render(<Mentions />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.hover(screen.getByRole("link", { name: "@maya" }));
    await vi.waitFor(() => expect(card("maya")).toBeTruthy());
    expect(await axeViolations(container)).toEqual([]);
    expect(await axeViolations(card("maya") as HTMLElement)).toEqual([]);
  });
});
