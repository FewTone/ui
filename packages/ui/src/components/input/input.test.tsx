import { Input } from "@fewtone/ui/components/input/input";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../test/axe";

describe("Input", () => {
  it("is a labelled text field you can type into", async () => {
    render(
      <>
        <label htmlFor="name">Name</label>
        <Input id="name" />
      </>,
    );
    const input = screen.getByRole("textbox", { name: "Name" });
    await userEvent.type(input, "Ada");
    expect((input as HTMLInputElement).value).toBe("Ada");
  });

  it("uses the size variant instead of the native size attribute", () => {
    render(<Input aria-label="Search" size="lg" />);
    const input = screen.getByRole("textbox", { name: "Search" });
    expect(input.getAttribute("data-size")).toBe("lg");
    expect(input.hasAttribute("size")).toBe(false);
  });

  it("has no accessibility violations, including the invalid state", async () => {
    const { container } = render(
      <div>
        <label htmlFor="user">Username</label>
        <Input id="user" aria-invalid="true" aria-describedby="user-error" />
        <p id="user-error">Use at least 3 characters.</p>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
