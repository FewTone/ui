import { CopyButton } from "@fewtone/ui/components/copy-button/copy-button";
import { useId } from "react";

export default function CopyButtonVariants() {
  const id = useId();
  return (
    <ul className="flex flex-wrap items-end justify-center gap-x-10 gap-y-6">
      <li className="flex flex-col items-center gap-2">
        <CopyButton value="https://ui.fewtone.com" aria-describedby={`${id}-ghost`} />
        <span id={`${id}-ghost`} className="text-xs text-muted-foreground">
          Ghost
        </span>
      </li>
      <li className="flex flex-col items-center gap-2">
        <CopyButton value="https://ui.fewtone.com" variant="outline" aria-describedby={`${id}-outline`} />
        <span id={`${id}-outline`} className="text-xs text-muted-foreground">
          Outline
        </span>
      </li>
      <li className="flex flex-col items-center gap-2">
        <CopyButton value="https://ui.fewtone.com" variant="outline" copiedText="Copied">
          Copy link
        </CopyButton>
        <span className="text-xs text-muted-foreground">With text</span>
      </li>
    </ul>
  );
}
