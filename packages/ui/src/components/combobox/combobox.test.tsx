import { Combobox, type ComboboxOption } from "@fewtone/ui/components/combobox/combobox";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

const frameworks: ComboboxOption[] = [
  { value: "next", label: "Next.js", keywords: ["react"] },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt", keywords: ["vue"] },
  { value: "remix", label: "Remix", disabled: true },
  { value: "sveltekit", label: "SvelteKit", keywords: ["svelte"] },
];

const labels: ComboboxOption[] = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "docs", label: "Docs" },
];

function Framework({
  defaultValue,
  onValueChange,
}: {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <>
      <label htmlFor="framework">Framework</label>
      <Combobox
        id="framework"
        options={frameworks}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        placeholder="Pick a framework"
        emptyText="No framework found."
      />
    </>
  );
}

function Labels({ onValueChange }: { onValueChange?: (value: string[]) => void }) {
  return (
    <Combobox
      multiple
      aria-label="Labels"
      options={labels}
      defaultValue={["bug"]}
      onValueChange={onValueChange}
      placeholder="Add labels"
    />
  );
}

const field = (name = "Framework") => screen.getByRole("combobox", { name }) as HTMLInputElement;
const shown = () => screen.queryAllByRole("option").map((option) => option.dataset.value);
const highlighted = (name?: string) => {
  const id = field(name).getAttribute("aria-activedescendant");
  return id ? document.getElementById(id)?.dataset.value : undefined;
};
const closed = () => vi.waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());

describe("Combobox", () => {
  it("is a text field named by its label, closed until you type or press ArrowDown", async () => {
    render(<Framework />);
    expect(field().getAttribute("aria-expanded")).toBe("false");
    expect(field().placeholder).toBe("Pick a framework");
    expect(screen.queryByRole("listbox")).toBeNull();

    field().focus();
    await userEvent.keyboard("{ArrowDown}");
    const listbox = await screen.findByRole("listbox");
    expect(field().getAttribute("aria-expanded")).toBe("true");
    expect(field().getAttribute("aria-controls")).toBe(listbox.id);
    expect(shown()).toEqual(["next", "astro", "nuxt", "remix", "sveltekit"]);
  });

  it("moves aria-activedescendant with the arrow keys, skipping disabled options", async () => {
    render(<Framework />);
    field().focus();
    await userEvent.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");
    expect(highlighted()).toBe("next");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(highlighted()).toBe("nuxt");
    await userEvent.keyboard("{ArrowDown}");
    expect(highlighted()).toBe("sveltekit");
    await userEvent.keyboard("{ArrowUp}");
    expect(highlighted()).toBe("nuxt");
  });

  it("filters as you type and picks with Enter, then shows the choice in the field", async () => {
    const onValueChange = vi.fn();
    render(<Framework onValueChange={onValueChange} />);
    await userEvent.type(field(), "vue");
    expect(shown()).toEqual(["nuxt"]);
    expect(highlighted()).toBe("nuxt");
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("nuxt");
    expect(field().value).toBe("Nuxt");
    await closed();
    expect(field().getAttribute("aria-expanded")).toBe("false");
  });

  it("picks with a click, and opens on the chosen option with its check", async () => {
    render(<Framework />);
    await userEvent.click(field());
    await userEvent.click(await screen.findByRole("option", { name: "Astro" }));
    expect(field().value).toBe("Astro");
    await closed();

    await userEvent.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");
    expect(highlighted()).toBe("astro");
    expect(screen.getByRole("option", { name: "Astro" }).dataset.checked).toBe("true");
  });

  it("selects the chosen label on the first press, so typing replaces it", async () => {
    render(<Framework defaultValue="astro" />);
    await userEvent.pointer({ keys: "[MouseLeft]", target: field() });
    expect(document.activeElement).toBe(field());
    expect([field().selectionStart, field().selectionEnd]).toEqual([0, 5]);
    await userEvent.keyboard("vue");
    expect(field().value).toBe("vue");
    expect(shown()).toEqual(["nuxt"]);
  });

  it("closes on Escape and puts the chosen label back", async () => {
    render(<Framework defaultValue="astro" />);
    expect(field().value).toBe("Astro");
    await userEvent.type(field(), "x");
    expect(field().value).toBe("x");
    await screen.findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await closed();
    expect(field().value).toBe("Astro");
  });

  it("clears a single choice when the text is cleared and focus leaves", async () => {
    const onValueChange = vi.fn();
    render(<Framework defaultValue="astro" onValueChange={onValueChange} />);
    await userEvent.clear(field());
    await userEvent.tab();
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(field().value).toBe("");
  });

  it("says when nothing matches", async () => {
    render(<Framework />);
    await userEvent.type(field(), "zzz");
    expect(shown()).toEqual([]);
    expect(screen.getByRole("status").textContent).toBe("No framework found.");
    expect(field().getAttribute("aria-activedescendant")).toBeNull();
  });

  describe("multiple", () => {
    it("shows the chosen as chips, toggles options from the list and keeps it open", async () => {
      const onValueChange = vi.fn();
      render(<Labels onValueChange={onValueChange} />);
      expect(screen.getByRole("button", { name: "Remove Bug" })).toBeTruthy();
      // The placeholder only shows while nothing is chosen
      expect(field("Labels").placeholder).toBe("");

      await userEvent.type(field("Labels"), "fea");
      const listbox = await screen.findByRole("listbox");
      expect(listbox.getAttribute("aria-multiselectable")).toBe("true");
      await userEvent.keyboard("{Enter}");
      expect(onValueChange).toHaveBeenLastCalledWith(["bug", "feature"]);
      expect(screen.getByRole("listbox")).toBeTruthy();
      expect(screen.getByRole("option", { name: "Feature" }).getAttribute("aria-selected")).toBe("true");
      expect(screen.getByRole("button", { name: "Remove Feature" })).toBeTruthy();

      // Picking it again takes it off
      await userEvent.keyboard("{Enter}");
      expect(onValueChange).toHaveBeenLastCalledWith(["bug"]);
      expect(screen.getByRole("option", { name: "Feature" }).getAttribute("aria-selected")).toBe("false");
    });

    it("removes the last chip with Backspace in an empty field, and any chip with its button", async () => {
      const onValueChange = vi.fn();
      render(<Labels onValueChange={onValueChange} />);
      await userEvent.type(field("Labels"), "docs{Enter}");
      expect(onValueChange).toHaveBeenLastCalledWith(["bug", "docs"]);

      // The first Backspaces delete the search; the next removes the last chip
      await userEvent.keyboard("{Backspace}{Backspace}{Backspace}{Backspace}");
      expect(onValueChange).toHaveBeenLastCalledWith(["bug", "docs"]);
      await userEvent.keyboard("{Backspace}");
      expect(onValueChange).toHaveBeenLastCalledWith(["bug"]);
      // The chip leaves through the blur
      await vi.waitFor(() => expect(screen.queryByRole("button", { name: "Remove Docs" })).toBeNull());

      await userEvent.click(screen.getByRole("button", { name: "Remove Bug" }));
      expect(onValueChange).toHaveBeenLastCalledWith([]);
      expect(document.activeElement).toBe(field("Labels"));
    });
  });

  it("submits the value with a form", () => {
    const { container } = render(
      <form>
        <Combobox aria-label="Framework" name="framework" options={frameworks} defaultValue="next" />
        <Combobox
          aria-label="Labels"
          name="labels"
          multiple
          options={labels}
          defaultValue={["bug", "docs"]}
        />
      </form>,
    );
    const data = new FormData(container.querySelector("form") ?? undefined);
    expect(data.get("framework")).toBe("next");
    expect(data.getAll("labels")).toEqual(["bug", "docs"]);
  });

  it("has no accessibility violations, closed or open", async () => {
    const { container } = render(
      <>
        <Framework defaultValue="next" />
        <Labels />
      </>,
    );
    expect(await axeViolations(container)).toEqual([]);
    field().focus();
    await userEvent.keyboard("{ArrowDown}");
    const list = await screen.findByRole("listbox");
    expect(await axeViolations(container)).toEqual([]);
    expect(await axeViolations(list.closest("[data-slot=combobox-content]") ?? list)).toEqual([]);
  });
});
