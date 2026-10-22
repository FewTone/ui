import { Progress, ProgressValue } from "@fewtone/ui/components/progress/progress";
import { useId } from "react";

/*
 * A visible label names the bar (aria-labelledby), and a hint under it says what the number means. The
 * percentage beside the label is for sighted readers; the bar already tells screen readers its value.
 */
export default function ProgressWithLabel() {
  const id = useId();
  const value = 45;

  return (
    <div className="grid w-full max-w-xs gap-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span id={`${id}-label`} className="font-medium">
          Uploading report.pdf
        </span>
        <ProgressValue value={value} className="text-muted-foreground" />
      </div>
      <Progress value={value} aria-labelledby={`${id}-label`} aria-describedby={`${id}-hint`} />
      <p id={`${id}-hint`} className="text-xs text-muted-foreground">
        1.7 MB of 3.8 MB
      </p>
    </div>
  );
}
