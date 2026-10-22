import { Button } from "@fewtone/ui/components/button/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@fewtone/ui/components/card/card";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../test/axe";

function CreateProject() {
  return (
    <Card>
      <CardHeader>
        <CardTitle asChild>
          <h3>Create project</h3>
        </CardTitle>
        <CardDescription>Deploy a new project.</CardDescription>
        <CardAction>
          <Button size="sm" variant="ghost">
            Help
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <label htmlFor="name">Name</label>
        <input id="name" />
      </CardContent>
      <CardFooter>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  );
}

describe("Card", () => {
  it("renders every part, with a heading for the title when asked", () => {
    const { container } = render(<CreateProject />);
    const card = container.querySelector("[data-slot=card]") as HTMLElement;
    expect(card.dataset.size).toBe("md");
    expect(screen.getByRole("heading", { name: "Create project", level: 3 }).dataset.slot).toBe("card-title");
    for (const slot of ["card-header", "card-description", "card-action", "card-content", "card-footer"]) {
      expect(card.querySelector(`[data-slot=${slot}]`)).not.toBeNull();
    }
    // The action sits in the header, beside the title
    expect(screen.getByRole("button", { name: "Help" }).closest("[data-slot=card-header]")).not.toBeNull();
  });

  it("is a div with a div title by default, and takes a size", () => {
    const { container } = render(
      <Card size="sm">
        <CardHeader>
          <CardTitle>Team plan</CardTitle>
        </CardHeader>
      </Card>,
    );
    const card = container.querySelector("[data-slot=card]") as HTMLElement;
    expect(card.tagName).toBe("DIV");
    expect(card.dataset.size).toBe("sm");
    expect(screen.getByText("Team plan").tagName).toBe("DIV");
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("becomes one link with asChild, reached with Tab", async () => {
    render(
      <Card asChild>
        <a href="/docs">
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>Guides and references.</CardDescription>
          </CardHeader>
        </a>
      </Card>,
    );
    const link = screen.getByRole("link", { name: /Documentation/ });
    expect(link.dataset.slot).toBe("card");
    expect(link.getAttribute("href")).toBe("/docs");
    await userEvent.tab();
    expect(document.activeElement).toBe(link);
  });

  it("passes native props through", () => {
    render(<Card aria-label="Usage" role="region" className="w-64" />);
    const card = screen.getByRole("region", { name: "Usage" });
    expect(card.className).toContain("w-64");
  });

  it("has no accessibility violations, as a card or a link", async () => {
    const { container } = render(
      <>
        <CreateProject />
        <Card asChild size="sm">
          <a href="/docs">
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
            </CardHeader>
          </a>
        </Card>
      </>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
