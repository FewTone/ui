import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@fewtone/ui/components/alert-dialog/alert-dialog";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function DeleteProject({
  onDelete,
  onOpenChange,
}: {
  onDelete?: () => void;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <AlertDialog onOpenChange={onOpenChange}>
      <AlertDialogTrigger>Delete project</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project?</AlertDialogTitle>
          <AlertDialogDescription>You can't undo this.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Gone once its exit has played */
const closed = () => vi.waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());

describe("AlertDialog", () => {
  it("opens an alert dialog named by its title and described by its description", async () => {
    render(<DeleteProject />);
    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Delete project?" });
    const describedBy = dialog.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(describedBy)?.textContent).toBe("You can't undo this.");
  });

  it("starts with focus on Cancel, and Escape gives focus back to the trigger", async () => {
    const onOpenChange = vi.fn();
    render(<DeleteProject onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole("button", { name: "Delete project" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const cancel = await screen.findByRole("button", { name: "Cancel" });
    await vi.waitFor(() => expect(document.activeElement).toBe(cancel));

    await userEvent.keyboard("{Escape}");
    await closed();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("stays open when the backdrop is clicked", async () => {
    const onOpenChange = vi.fn();
    render(<DeleteProject onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));
    const dialog = await screen.findByRole("alertdialog");
    onOpenChange.mockClear();
    const overlay = document.querySelector<HTMLElement>("[data-slot=alert-dialog-overlay]");
    expect(overlay).not.toBeNull();
    if (overlay) await userEvent.click(overlay);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(dialog.dataset.state).toBe("open");
  });

  it("runs the action and closes, with the button's destructive style", async () => {
    const onDelete = vi.fn();
    render(<DeleteProject onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));
    const action = await screen.findByRole("button", { name: "Delete" });
    expect(action.className).toContain("bg-destructive");
    await userEvent.click(action);
    expect(onDelete).toHaveBeenCalledTimes(1);
    await closed();
  });

  it("closes without acting from Cancel", async () => {
    const onDelete = vi.fn();
    render(<DeleteProject onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));
    await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));
    await closed();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("has no accessibility violations, closed or open", async () => {
    const { container } = render(<DeleteProject />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));
    expect(await axeViolations(await screen.findByRole("alertdialog"))).toEqual([]);
  });
});
