import { CopyButton } from "@fewtone/ui/components/copy-button/copy-button";

const command = "npx shadcn@latest add https://ui.fewtone.com/r/copy-button.json";

export default function CopyButtonCommand() {
  return (
    <div className="flex w-full max-w-lg items-center gap-2 rounded-lg bg-muted py-1 ps-4 pe-1">
      <code className="min-w-0 flex-1 truncate font-mono text-sm">{command}</code>
      <CopyButton value={command} size="icon-sm" aria-label="Copy the command" />
    </div>
  );
}
