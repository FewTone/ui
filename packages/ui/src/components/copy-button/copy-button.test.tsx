import { CopyButton } from "@fewtone/ui/components/copy-button/copy-button";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

/** jsdom has no Clipboard API; give it one, or take it away */
function stubClipboard(writeText?: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });
}

afterEach(() => {
  Reflect.deleteProperty(navigator, "clipboard");
  Reflect.deleteProperty(document, "execCommand");
  vi.restoreAllMocks();
});

describe("CopyButton", () => {
  it("copies its value, shows that it did, then returns", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    const onCopy = vi.fn();
    stubClipboard(writeText);
    render(<CopyButton value="npm i @fewtone/ui" onCopy={onCopy} resetAfter={50} />);
    const button = screen.getByRole("button", { name: "Copy" });
    fireEvent.click(button);
    await vi.waitFor(() => expect(button.dataset.state).toBe("copied"));
    expect(writeText).toHaveBeenCalledWith("npm i @fewtone/ui");
    expect(onCopy).toHaveBeenCalledWith("npm i @fewtone/ui");
    expect(screen.getByText("Copied")).toBeTruthy();
    await vi.waitFor(() => expect(button.dataset.state).toBe("idle"));
  });

  it("starts the check's time over when copied again", async () => {
    stubClipboard(() => Promise.resolve());
    render(<CopyButton value="hello" resetAfter={300} />);
    const button = screen.getByRole("button", { name: "Copy" });
    fireEvent.click(button);
    await vi.waitFor(() => expect(button.dataset.state).toBe("copied"));
    await new Promise((resolve) => setTimeout(resolve, 200));
    fireEvent.click(button);
    // 400ms after the first copy, but only 200ms after the second
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(button.dataset.state).toBe("copied");
    await vi.waitFor(() => expect(button.dataset.state).toBe("idle"));
  });

  it("falls back to a hidden textarea without the Clipboard API", async () => {
    stubClipboard();
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", { configurable: true, value: execCommand });
    render(<CopyButton value="hello">Copy link</CopyButton>);
    const button = screen.getByRole("button", { name: "Copy link" });
    fireEvent.click(button);
    await vi.waitFor(() => expect(button.dataset.state).toBe("copied"));
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("can be text only, swapping its label without an icon", async () => {
    stubClipboard(() => Promise.resolve());
    render(
      <CopyButton value="prompt" icon={false} copiedText="Copied">
        Copy prompt
      </CopyButton>,
    );
    const button = screen.getByRole("button", { name: "Copy prompt" });
    expect(button.querySelector("svg")).toBeNull();
    fireEvent.click(button);
    await vi.waitFor(() => expect(button.dataset.state).toBe("copied"));
    expect(button.querySelector("svg")).toBeNull();
  });

  it("has no accessibility violations, before or after copying", async () => {
    stubClipboard(() => Promise.resolve());
    const { container } = render(<CopyButton value="hello" />);
    expect(await axeViolations(container)).toEqual([]);
    const button = screen.getByRole("button", { name: "Copy" });
    fireEvent.click(button);
    await vi.waitFor(() => expect(button.dataset.state).toBe("copied"));
    expect(await axeViolations(container)).toEqual([]);
  });
});
