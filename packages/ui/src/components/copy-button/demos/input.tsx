import { CopyButton } from "@fewtone/ui/components/copy-button/copy-button";
import { Input } from "@fewtone/ui/components/input/input";
import { useId } from "react";

const link = "https://ui.fewtone.com/invite/k3x9";

export default function CopyButtonInput() {
  const id = useId();
  return (
    <div className="grid w-full max-w-sm gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Invite link
      </label>
      <div className="flex gap-2">
        <Input id={id} value={link} readOnly />
        <CopyButton value={link} variant="outline" copiedText="Copied">
          Copy
        </CopyButton>
      </div>
    </div>
  );
}
