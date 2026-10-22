import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@fewtone/ui/components/accordion/accordion";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

const questions = [
  { value: "refunds", question: "Can I get a refund?", answer: "Yes, within 30 days." },
  { value: "shipping", question: "How long does shipping take?", answer: "Three to five working days." },
  { value: "warranty", question: "Is there a warranty?", answer: "Two years on every part." },
];

function Sections() {
  return questions.map(({ value, question, answer }) => (
    <AccordionItem key={value} value={value}>
      <AccordionTrigger>{question}</AccordionTrigger>
      <AccordionContent>{answer}</AccordionContent>
    </AccordionItem>
  ));
}

const question = (name: string) => screen.getByRole("button", { name });
const expanded = (name: string) => question(name).getAttribute("aria-expanded");
/**
 * A section's content, named by its question. Found by aria-labelledby: a hidden region has no accessible name
 * to find it by, and Radix only sets the question's aria-controls while it's open.
 */
const answer = (name: string) =>
  document.querySelector<HTMLElement>(`[aria-labelledby="${question(name).id}"]`) as HTMLElement;

describe("Accordion", () => {
  it("is a set of buttons in headings, with aria-expanded, that open their region", async () => {
    const onValueChange = vi.fn();
    render(
      <Accordion type="single" collapsible onValueChange={onValueChange}>
        <Sections />
      </Accordion>,
    );
    expect(screen.getAllByRole("heading")).toHaveLength(3);
    expect(expanded("Can I get a refund?")).toBe("false");
    expect(screen.queryByRole("region")).toBeNull();

    await userEvent.click(question("Can I get a refund?"));
    expect(expanded("Can I get a refund?")).toBe("true");
    expect(screen.getByRole("region", { name: "Can I get a refund?" }).textContent).toBe(
      "Yes, within 30 days.",
    );
    expect(onValueChange).toHaveBeenLastCalledWith("refunds");
  });

  it("opens one at a time, and closes again when collapsible", async () => {
    render(
      <Accordion type="single" collapsible defaultValue="refunds">
        <Sections />
      </Accordion>,
    );
    expect(expanded("Can I get a refund?")).toBe("true");
    await userEvent.click(question("How long does shipping take?"));
    expect(expanded("How long does shipping take?")).toBe("true");
    expect(expanded("Can I get a refund?")).toBe("false");
    await userEvent.click(question("How long does shipping take?"));
    expect(expanded("How long does shipping take?")).toBe("false");
  });

  it("opens with Enter, closes with Space, and moves between questions with the arrow keys", async () => {
    render(
      <Accordion type="single" collapsible>
        <Sections />
      </Accordion>,
    );
    await userEvent.tab();
    expect(document.activeElement).toBe(question("Can I get a refund?"));
    await userEvent.keyboard("{Enter}");
    expect(expanded("Can I get a refund?")).toBe("true");
    await userEvent.keyboard(" ");
    expect(expanded("Can I get a refund?")).toBe("false");
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(document.activeElement).toBe(question("How long does shipping take?")));
    await userEvent.keyboard("{End}");
    await vi.waitFor(() => expect(document.activeElement).toBe(question("Is there a warranty?")));
    await userEvent.keyboard(" ");
    expect(expanded("Is there a warranty?")).toBe("true");
  });

  it("keeps several open with type multiple", async () => {
    const onValueChange = vi.fn();
    render(
      <Accordion type="multiple" defaultValue={["refunds"]} onValueChange={onValueChange}>
        <Sections />
      </Accordion>,
    );
    await userEvent.click(question("Is there a warranty?"));
    expect(expanded("Can I get a refund?")).toBe("true");
    expect(expanded("Is there a warranty?")).toBe("true");
    expect(onValueChange).toHaveBeenLastCalledWith(["refunds", "warranty"]);
    expect(screen.getAllByRole("region")).toHaveLength(2);
  });

  it("starts with an open section's chevron turned, and turns it back as it closes", async () => {
    render(
      <Accordion type="single" collapsible defaultValue="refunds">
        <Sections />
      </Accordion>,
    );
    const chevron = (name: string) =>
      question(name).querySelector<HTMLElement>("[data-slot=accordion-chevron]") as HTMLElement;
    expect(chevron("Can I get a refund?").getAttribute("aria-hidden")).toBe("true");
    // Already turned on first paint, not turning
    expect(chevron("Can I get a refund?").style.transform).toBe("rotate(180deg)");
    expect(chevron("Is there a warranty?").style.transform).toBe("none");
    await userEvent.click(question("Can I get a refund?"));
    await vi.waitFor(() => expect(chevron("Can I get a refund?").style.transform).toBe("none"));
  });

  it("keeps closed answers in the page, hidden until found, and opens one when find in page matches it", () => {
    const onValueChange = vi.fn();
    render(
      <Accordion type="single" collapsible onValueChange={onValueChange}>
        <Sections />
      </Accordion>,
    );
    const region = answer("Is there a warranty?");
    expect(region.getAttribute("role")).toBe("region");
    expect(region.getAttribute("hidden")).toBe("until-found");
    expect(region.textContent).toBe("Two years on every part.");

    act(() => {
      region.dispatchEvent(new Event("beforematch"));
    });
    expect(expanded("Is there a warranty?")).toBe("true");
    expect(onValueChange).toHaveBeenLastCalledWith("warranty");
    expect(region.hasAttribute("hidden")).toBe(false);
  });

  it("hides a section again once it has finished closing", async () => {
    render(
      <Accordion type="single" collapsible defaultValue="refunds">
        <Sections />
      </Accordion>,
    );
    const region = screen.getByRole("region", { name: "Can I get a refund?" });
    expect(region.hasAttribute("hidden")).toBe(false);
    await userEvent.click(question("Can I get a refund?"));
    expect(expanded("Can I get a refund?")).toBe("false");
    await vi.waitFor(() => expect(region.getAttribute("hidden")).toBe("until-found"));
  });

  it("keeps a disabled section plainly hidden, out of find in page's reach", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="locked" disabled>
          <AccordionTrigger>Locked</AccordionTrigger>
          <AccordionContent>Not yet.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(answer("Locked").getAttribute("hidden")).toBe("");
  });

  it("is one card by default, takes the separated and plain looks, and keeps variant off the DOM", () => {
    for (const variant of [undefined, "separated", "plain"] as const) {
      const { container, unmount } = render(
        <Accordion type="single" variant={variant}>
          <Sections />
        </Accordion>,
      );
      const root = container.querySelector<HTMLElement>("[data-slot=accordion]");
      expect(root?.dataset.variant).toBe(variant ?? "card");
      expect(root?.hasAttribute("variant")).toBe(false);
      unmount();
    }
  });

  it.each(["card", "separated", "plain"] as const)(
    "has no accessibility violations, closed or open (%s)",
    async (variant) => {
      const { container } = render(
        <Accordion type="multiple" defaultValue={["shipping"]} variant={variant}>
          <Sections />
        </Accordion>,
      );
      expect(await axeViolations(container)).toEqual([]);
      await userEvent.click(question("Can I get a refund?"));
      expect(await axeViolations(container)).toEqual([]);
    },
  );
});
