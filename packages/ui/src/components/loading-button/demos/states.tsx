import { LoadingButton, type LoadingButtonState } from "@fewtone/ui/components/loading-button/loading-button";
import { useId } from "react";

const states: { state: LoadingButtonState; label: string }[] = [
  { state: "idle", label: "Idle" },
  { state: "loading", label: "Loading" },
  { state: "success", label: "Success" },
  { state: "error", label: "Error" },
];

export default function LoadingButtonStates() {
  const id = useId();
  return (
    <ul className="grid w-fit grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
      {states.map(({ state, label }) => (
        <li key={state} className="flex flex-col items-center gap-1.5">
          <LoadingButton
            state={state}
            loadingText="Saving…"
            successText="Saved"
            errorText="Try again"
            aria-describedby={`${id}-${state}`}
          >
            Save changes
          </LoadingButton>
          <span id={`${id}-${state}`} className="text-xs text-muted-foreground">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
