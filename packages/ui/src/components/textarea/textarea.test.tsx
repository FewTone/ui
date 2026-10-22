import { Textarea } from "@fewtone/ui/components/textarea/textarea";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

/*
 * jsdom has no layout, so the measurements Textarea reads are stubbed: each line is 20px and the padding
 * 16px (borders are 0 in jsdom), and the field is never shorter than its `rows` (minRows). offsetHeight
 * follows the height Textarea sets.
 */
const LINE = 20;
const PADDING = 16;
const tall = (lines: number) => `${lines * LINE + PADDING}px`;

const stubbed = ["scrollHeight", "clientWidth", "offsetHeight"] as const;

beforeEach(() => {
  Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
    configurable: true,
    get(this: HTMLTextAreaElement) {
      return Math.max(this.value.split("\n").length, this.rows) * LINE + PADDING;
    },
  });
  Object.defineProperty(HTMLTextAreaElement.prototype, "clientWidth", { configurable: true, get: () => 320 });
  Object.defineProperty(HTMLTextAreaElement.prototype, "offsetHeight", {
    configurable: true,
    get(this: HTMLTextAreaElement) {
      return Number.parseFloat(this.style.height) || 0;
    },
  });
});

afterEach(() => {
  // The stubs live on HTMLTextAreaElement.prototype; removing them uncovers jsdom's own
  for (const name of stubbed) Reflect.deleteProperty(HTMLTextAreaElement.prototype, name);
});

describe("Textarea", () => {
  it("is a labelled multi-line text field you can type into", async () => {
    render(
      <>
        <label htmlFor="message">Message</label>
        <Textarea id="message" />
      </>,
    );
    const field = screen.getByRole("textbox", { name: "Message" });
    expect(field.tagName).toBe("TEXTAREA");
    await userEvent.type(field, "Hello{Enter}there");
    expect((field as HTMLTextAreaElement).value).toBe("Hello\nthere");
  });

  it("fits a long first value at once, without gliding", () => {
    render(<Textarea aria-label="Notes" minRows={2} defaultValue={"one\ntwo\nthree\nfour\nfive"} />);
    expect(screen.getByRole("textbox", { name: "Notes" }).style.height).toBe(tall(5));
  });

  it("glides taller as lines are added and back down as they go", async () => {
    render(<Textarea aria-label="Message" minRows={2} />);
    const field = screen.getByRole("textbox", { name: "Message" });
    expect(field.style.height).toBe(tall(2));

    await userEvent.type(field, "one{Enter}two{Enter}three{Enter}four");
    await vi.waitFor(() => expect(field.style.height).toBe(tall(4)));
    expect(field.style.overflowY).toBe("hidden");

    await userEvent.clear(field);
    await vi.waitFor(() => expect(field.style.height).toBe(tall(2)));
  });

  it("resizes by dragging its corner, and keeps that height as the floor", async () => {
    render(<Textarea aria-label="Message" minRows={2} />);
    const field = screen.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement;
    // A drawn box for the corner to sit in: 320px wide, as tall as the field
    field.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        right: 320,
        width: 320,
        bottom: field.offsetHeight,
        height: field.offsetHeight,
      }) as DOMRect;
    const pointer = (type: string, clientX: number, clientY: number) =>
      field.dispatchEvent(
        new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX, clientY }),
      );

    const start = field.offsetHeight;
    pointer("pointermove", 316, start - 4);
    expect(field.hasAttribute("data-grip")).toBe(true);
    pointer("pointerdown", 316, start - 4);
    expect(field.hasAttribute("data-resizing")).toBe(true);
    pointer("pointermove", 316, start + 56);
    expect(field.style.height).toBe(`${start + 60}px`);
    pointer("pointerup", 316, start + 56);
    expect(field.hasAttribute("data-resizing")).toBe(false);

    // A short line doesn't shrink it back below the dragged height
    await userEvent.type(field, "Hi");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(field.style.height).toBe(`${start + 60}px`);
  });

  it("ignores a press away from the corner", () => {
    render(<Textarea aria-label="Message" minRows={2} />);
    const field = screen.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement;
    field.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        right: 320,
        width: 320,
        bottom: field.offsetHeight,
        height: field.offsetHeight,
      }) as DOMRect;
    const press = new MouseEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      button: 0,
      clientX: 40,
      clientY: 10,
    });
    field.dispatchEvent(press);
    expect(press.defaultPrevented).toBe(false);
    expect(field.hasAttribute("data-resizing")).toBe(false);
  });

  it("stops at maxRows and scrolls the rest", async () => {
    // jsdom can't resolve the lh-based max height, so the test gives the max in pixels (4 lines)
    render(<Textarea aria-label="Message" minRows={2} maxRows={4} style={{ maxHeight: tall(4) }} />);
    const field = screen.getByRole("textbox", { name: "Message" });
    await userEvent.type(field, "1{Enter}2{Enter}3{Enter}4{Enter}5{Enter}6");
    await vi.waitFor(() => expect(field.style.height).toBe(tall(4)));
    expect(field.style.overflowY).toBe("auto");
  });

  it("refits when a controlled value is set from outside", async () => {
    function Controlled() {
      const [value, setValue] = useState("a\nb\nc\nd");
      return (
        <>
          <Textarea aria-label="Draft" minRows={2} value={value} onChange={(e) => setValue(e.target.value)} />
          <button type="button" onClick={() => setValue("")}>
            Clear
          </button>
        </>
      );
    }
    render(<Controlled />);
    const field = screen.getByRole("textbox", { name: "Draft" });
    expect(field.style.height).toBe(tall(4));
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    await vi.waitFor(() => expect(field.style.height).toBe(tall(2)));
  });

  it("sets its min and max heights in lines, and passes refs and native props through", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea ref={ref} aria-label="Bio" minRows={2} maxRows={5} maxLength={160} name="bio" />);
    const field = screen.getByRole("textbox", { name: "Bio" }) as HTMLTextAreaElement;
    expect(ref.current).toBe(field);
    expect(field.rows).toBe(2);
    expect(field.maxLength).toBe(160);
    expect(field.name).toBe("bio");
    expect(field.getAttribute("data-slot")).toBe("textarea");
  });

  it("has no accessibility violations, including the invalid and disabled states", async () => {
    const { container } = render(
      <div>
        <label htmlFor="bio">Bio</label>
        <Textarea id="bio" aria-invalid="true" aria-describedby="bio-error" />
        <p id="bio-error">Write at least 10 characters.</p>
        <label htmlFor="notes">Notes</label>
        <Textarea id="notes" disabled defaultValue="Locked" />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
