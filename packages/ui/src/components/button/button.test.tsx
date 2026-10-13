import { Button } from "@fewtone/ui/components/button/button";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

describe("Button", () => {
  it("renders a native button that never submits forms by default", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("type")).toBe("button");
  });

  it("runs onClick from the keyboard", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does nothing when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("puts its styles on the child with asChild", () => {
    render(
      <Button asChild variant="outline">
        <a href="/docs">Docs</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("data-variant")).toBe("outline");
    expect(link.hasAttribute("type")).toBe(false);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        <Button>Save</Button>
        <Button size="icon" aria-label="Add item">
          +
        </Button>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
