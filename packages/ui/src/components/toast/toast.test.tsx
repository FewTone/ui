import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  Toaster,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toast,
} from "@fewtone/ui/components/toast/toast";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

// The store is shared by every Toaster, like sonner's: close what a test left open
afterEach(() => {
  act(() => toast.dismiss());
});

/** The list Radix renders toasts into, portalled to the end of the body */
const viewport = () => screen.getByRole("region", { name: "Notifications (F8)" }).querySelector("ol");
/** The toasts on screen, each an li in the viewport */
const toasts = () => Array.from(viewport()?.querySelectorAll<HTMLElement>("[data-slot=toast]") ?? []);
// A toast leaves after its duration and its exit animation; under a busy full run that can pass 1s
const gone = (text: string) =>
  vi.waitFor(() => expect(screen.queryByText(text)).toBeNull(), { timeout: 3000 });

/**
 * Text inside a toast. Radix also copies a toast's text into a hidden announcer for a moment, so finding by
 * text alone can see it twice and fail under load.
 */
const inToast = { selector: "[data-slot=toast-title], [data-slot=toast-description]" };

describe("Toaster and toast()", () => {
  it("shows a toast in a labelled region and announces it", async () => {
    render(<Toaster />);
    act(() => {
      toast("Event created", { description: "Friday, 10:00" });
    });
    // Radix also writes the text into its hidden announcer for a moment, so the text can be on the page twice:
    // pick the toast's own parts (finding by text alone was flaky under load)
    const titles = await screen.findAllByText("Event created");
    expect(titles.some((element) => element.dataset.slot === "toast-title")).toBe(true);
    expect(
      screen.getAllByText("Friday, 10:00").some((element) => element.dataset.slot === "toast-description"),
    ).toBe(true);
    // Radix reads it out through a status region. It writes the text a frame after the region appears, so under
    // load the region can be found while it's still empty: wait for the text
    await vi.waitFor(() => expect(screen.getByRole("status").textContent).toContain("Event created"));
  });

  it("marks success, error and loading toasts", async () => {
    render(<Toaster />);
    act(() => {
      toast.success("Saved");
      toast.error("Couldn't save");
      toast.loading("Uploading");
    });
    await screen.findByText("Uploading", inToast);
    const [success, error, loading] = toasts();
    expect(success?.dataset.type).toBe("success");
    expect(error?.dataset.type).toBe("error");
    expect(error?.dataset.variant).toBe("destructive");
    expect(loading?.dataset.type).toBe("loading");
    // Each kind has its icon; the spinner is hidden from screen readers, the toast's text says it all
    expect(loading?.querySelector("[data-slot=spinner]")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("swaps a promise's loading toast for its result, in place, and reads the result out", async () => {
    let finish: (value: string) => void = () => {};
    const work = new Promise<string>((resolve) => {
      finish = resolve;
    });
    render(<Toaster />);
    act(() => {
      toast.promise(work, {
        loading: "Saving draft…",
        success: (name) => `Saved ${name}`,
        error: "Couldn't save",
      });
    });
    await screen.findByText("Saving draft…", inToast);
    await act(async () => finish("the draft"));
    await screen.findByText("Saved the draft", { selector: "[data-slot=toast-title]" });
    expect(toasts()).toHaveLength(1);
    expect(toasts()[0]?.dataset.type).toBe("success");
    await vi.waitFor(() =>
      expect(document.querySelector("[aria-live=polite]")?.textContent).toBe("Saved the draft"),
    );
  });

  it("shows a failed promise as an error", async () => {
    render(<Toaster />);
    act(() => {
      toast.promise(Promise.reject(new Error("offline")), {
        loading: "Publishing…",
        success: "Published",
        error: (error) => `Couldn't publish: ${(error as Error).message}`,
      });
    });
    await screen.findByText("Couldn't publish: offline", inToast);
    expect(toasts()[0]?.dataset.variant).toBe("destructive");
  });

  it("updates the toast with the same id instead of adding one", async () => {
    render(<Toaster />);
    act(() => {
      toast.loading("Uploading", { id: "upload" });
    });
    await screen.findByText("Uploading", inToast);
    act(() => {
      toast.success("Uploaded", { id: "upload" });
    });
    await screen.findByText("Uploaded", { selector: "[data-slot=toast-title]" });
    expect(toasts()).toHaveLength(1);
  });

  it("closes with the close button", async () => {
    render(<Toaster />);
    act(() => {
      toast("Close me");
    });
    await screen.findByText("Close me", inToast);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await gone("Close me");
  });

  it("closes the newest toast with Escape", async () => {
    render(<Toaster />);
    act(() => {
      toast("Older");
      toast("Newer");
    });
    await screen.findByText("Newer", inToast);
    await userEvent.keyboard("{Escape}");
    await gone("Newer");
    expect(screen.getByText("Older", inToast)).toBeTruthy();
  });

  it("closes from code with toast.dismiss", async () => {
    render(<Toaster />);
    let id = "";
    act(() => {
      id = toast("First");
      toast("Second");
    });
    await screen.findByText("Second", inToast);
    act(() => toast.dismiss(id));
    await gone("First");
    expect(screen.getByText("Second", inToast)).toBeTruthy();
    act(() => toast.dismiss());
    await gone("Second");
  });

  it("runs the action, then closes", async () => {
    const onClick = vi.fn();
    render(<Toaster />);
    act(() => {
      toast("Message archived", { action: { label: "Undo", onClick } });
    });
    await userEvent.click(await screen.findByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledOnce();
    await gone("Message archived");
  });

  it("closes on its own after its duration, but not while the pointer is on it", async () => {
    render(<Toaster />);
    act(() => {
      toast("Hold on", { duration: 150 });
    });
    await screen.findByText("Hold on", inToast);
    // Every timer waits while the pointer is on the toasts, and goes on when it leaves
    const list = viewport() as HTMLElement;
    fireEvent.pointerEnter(list);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByText("Hold on", inToast)).toBeTruthy();
    fireEvent.pointerLeave(list);
    await gone("Hold on");
  });

  it("waits while focus is in the toasts, and doesn't stay paused once the last one is closed", async () => {
    render(
      <>
        <button type="button">Elsewhere</button>
        <Toaster />
      </>,
    );
    act(() => {
      toast("First", { duration: 150 });
    });
    await screen.findByText("First", inToast);
    // Closing it from its own button leaves focus on the list (Radix), which pauses the timers
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await gone("First");
    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));
    act(() => {
      toast("Second", { duration: 150 });
    });
    await screen.findByText("Second", inToast);
    await gone("Second");
  });

  it("stacks older toasts behind the newest, and fans them out on hover", async () => {
    render(<Toaster />);
    act(() => {
      toast("One");
      toast("Two");
    });
    await screen.findByText("Two", inToast);
    const list = viewport() as HTMLElement;
    const [older, newer] = toasts();
    expect(newer?.dataset.front).toBe("true");
    expect(older?.dataset.tucked).toBe("true");
    expect(list.dataset.expanded).toBeUndefined();
    fireEvent.pointerEnter(list);
    await vi.waitFor(() => expect(list.dataset.expanded).toBe("true"));
    expect(older?.dataset.tucked).toBeUndefined();
    fireEvent.pointerLeave(list);
    await vi.waitFor(() => expect(older?.dataset.tucked).toBe("true"));
  });

  it("hides toasts past visibleToasts until newer ones go", async () => {
    render(<Toaster visibleToasts={2} />);
    act(() => {
      toast("A");
      toast("B");
      toast("C");
    });
    await screen.findByText("C", inToast);
    const [first] = toasts();
    expect(first?.dataset.hidden).toBe("true");
    expect(first?.hasAttribute("inert")).toBe(true);
  });

  it("shows each toast once, however many Toasters are mounted", async () => {
    render(
      <>
        <Toaster />
        <Toaster position="top-center" />
      </>,
    );
    act(() => {
      toast("Only once");
    });
    await screen.findByText("Only once", inToast);
    expect(screen.getAllByText("Only once")).toHaveLength(1);
    expect(screen.getAllByRole("region", { name: "Notifications (F8)" })).toHaveLength(1);
  });

  it("has no accessibility violations", async () => {
    render(<Toaster />);
    act(() => {
      toast.success("Changes saved", { description: "Everything is up to date." });
      toast("Message archived", { action: { label: "Undo" } });
    });
    await screen.findByText("Message archived", inToast);
    expect(await axeViolations(document.body)).toEqual([]);
  });
});

function Composed({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <ToastProvider>
      <button type="button" onClick={() => setOpen(true)}>
        Schedule
      </button>
      <Toast
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          onOpenChange?.(next);
        }}
      >
        <div className="grid flex-1 gap-0.5">
          <ToastTitle>Meeting scheduled</ToastTitle>
          <ToastDescription>Friday, 10:00</ToastDescription>
        </div>
        <ToastAction altText="Remove the meeting">Undo</ToastAction>
        <ToastClose />
      </Toast>
      <ToastViewport position="top-center" />
    </ToastProvider>
  );
}

describe("Toast parts", () => {
  it("opens from its own state and plays its exit before going", async () => {
    const onOpenChange = vi.fn();
    render(<Composed onOpenChange={onOpenChange} />);
    expect(screen.queryByText("Meeting scheduled")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Schedule" }));
    const item = (await screen.findByText("Meeting scheduled", inToast)).closest("li") as HTMLElement;
    expect(viewport()?.dataset.position).toBe("top-center");
    expect(item.dataset.edge).toBe("top");
    await userEvent.click(within(item).getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await gone("Meeting scheduled");
  });

  it("closes with Escape while focused", async () => {
    render(<Composed />);
    await userEvent.click(screen.getByRole("button", { name: "Schedule" }));
    const item = (await screen.findByText("Meeting scheduled", inToast)).closest("li") as HTMLElement;
    item.focus();
    await userEvent.keyboard("{Escape}");
    await gone("Meeting scheduled");
  });

  it("has no accessibility violations while open", async () => {
    render(<Composed />);
    await userEvent.click(screen.getByRole("button", { name: "Schedule" }));
    await screen.findByText("Meeting scheduled", inToast);
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
