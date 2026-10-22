import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@fewtone/ui/components/breadcrumb/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@fewtone/ui/components/dropdown-menu/dropdown-menu";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Fragment, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Trail({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {collapsed ? (
          <>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger aria-label="Show hidden levels">
                  <BreadcrumbEllipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Docs</DropdownMenuItem>
                  <DropdownMenuItem>Installation</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : null}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <a href="/components">Components</a>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

describe("Breadcrumb", () => {
  it("is a navigation landmark holding an ordered list of levels", () => {
    render(<Trail />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    const list = within(nav).getByRole("list");
    expect(list.tagName).toBe("OL");
    // Separators are hidden, so only the three levels are list items
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(nav).getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
    // asChild puts the styles on your own link
    const components = within(nav).getByRole("link", { name: "Components" });
    expect(components.dataset.slot).toBe("breadcrumb-link");
  });

  it("marks the current page", () => {
    render(<Trail />);
    const page = screen.getByText("Breadcrumb", { selector: "[data-slot=breadcrumb-page]" });
    expect(page.getAttribute("aria-current")).toBe("page");
    // Text, not a link to the page you're already on
    expect(screen.queryByRole("link", { name: "Breadcrumb" })).toBeNull();
  });

  it("opens the collapsed levels from the keyboard", async () => {
    render(<Trail collapsed />);
    const trigger = screen.getByRole("button", { name: "Show hidden levels" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const menu = await screen.findByRole("menu");
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Docs", "Installation"]);
  });

  it("keeps a static trail still on first paint, and animates levels that come and go", async () => {
    function Path() {
      const [path, setPath] = useState(["Home", "Projects"]);
      return (
        <>
          <button type="button" onClick={() => setPath(["Home", "Projects", "Website"])}>
            Deeper
          </button>
          <button type="button" onClick={() => setPath(["Home"])}>
            Up
          </button>
          <Breadcrumb>
            <BreadcrumbList>
              {path.map((name, index) => (
                <Fragment key={path.slice(0, index + 1).join("/")}>
                  {index > 0 ? <BreadcrumbSeparator /> : null}
                  <BreadcrumbItem>
                    {index === path.length - 1 ? (
                      <BreadcrumbPage>{name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href="#">{name}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </>
      );
    }
    render(<Path />);
    const level = (name: string) => screen.getByText(name).closest("li") as HTMLElement;
    // Nothing animates on first paint: the levels start in place
    expect(level("Projects").style.opacity).not.toBe("0");

    await userEvent.click(screen.getByRole("button", { name: "Deeper" }));
    // The new level starts hidden and comes in
    expect(screen.getByText("Website", { selector: "[data-slot=breadcrumb-page]" })).toBeTruthy();
    await vi.waitFor(() => expect(level("Website").style.opacity).toBe("1"));

    await userEvent.click(screen.getByRole("button", { name: "Up" }));
    // Levels you leave go out, then are removed
    await vi.waitFor(() => expect(screen.queryByText("Website")).toBeNull());
    expect(screen.queryByText("Projects")).toBeNull();
    expect(screen.getByText("Home").getAttribute("aria-current")).toBe("page");
  });

  it("has no accessibility violations, collapsed or not", async () => {
    const { container, unmount } = render(<Trail />);
    expect(await axeViolations(container)).toEqual([]);
    unmount();
    const collapsed = render(<Trail collapsed />);
    expect(await axeViolations(collapsed.container)).toEqual([]);
  });
});
