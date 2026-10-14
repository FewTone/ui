import { LoadingButton } from "@fewtone/ui/components/loading-button/loading-button";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

/** A promise the test settles by hand */
function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

describe("LoadingButton", () => {
  it("shows loading until the click's promise resolves, then success, then idle again", async () => {
    const task = deferred();
    render(
      <LoadingButton onClick={() => task.promise} successText="Saved" resetAfter={50}>
        Save
      </LoadingButton>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    await userEvent.click(button);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.dataset.state).toBe("loading");
    task.resolve();
    await vi.waitFor(() => expect(button.dataset.state).toBe("success"));
    expect(button.getAttribute("aria-busy")).toBeNull();
    await vi.waitFor(() => expect(button.dataset.state).toBe("idle"));
  });

  it("shows the error state when the promise rejects", async () => {
    const task = deferred();
    render(
      <LoadingButton onClick={() => task.promise} errorText="Try again" resetAfter={false}>
        Publish
      </LoadingButton>,
    );
    const button = screen.getByRole("button", { name: "Publish" });
    await userEvent.click(button);
    task.reject(new Error("offline"));
    await vi.waitFor(() => expect(button.dataset.state).toBe("error"));
    expect(button.className).toContain("bg-destructive");
  });

  it("follows a controlled state and ignores clicks while loading", async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <LoadingButton state="loading" onClick={onClick}>
        Save
      </LoadingButton>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    rerender(
      <LoadingButton state="success" successText="Saved" onClick={onClick}>
        Save
      </LoadingButton>,
    );
    expect(button.dataset.state).toBe("success");
  });

  it("has no accessibility violations in any state", async () => {
    for (const state of ["idle", "loading", "success", "error"] as const) {
      const { container, unmount } = render(<LoadingButton state={state}>Save</LoadingButton>);
      expect(await axeViolations(container)).toEqual([]);
      unmount();
    }
  });
});
